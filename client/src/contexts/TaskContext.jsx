// TaskContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { tasks as tasksApi } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [sharedTasks, setSharedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const fetchTasks = async () => {
        if (!currentUser) {
            setTasks([]);
            setSharedTasks([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [ownTasksResponse, sharedTasksResponse] = await Promise.all([
                tasksApi.getAll(),
                tasksApi.getSharedWithMe()
            ]);

            console.log('Tasks fetched:', {
                own: ownTasksResponse.data,
                shared: sharedTasksResponse.data
            });

            setTasks(ownTasksResponse.data);
            setSharedTasks(sharedTasksResponse.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.response?.data?.message || 'שגיאה בטעינת המשימות');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [currentUser]);

    const addTask = async (taskData) => {
        try {
            setError(null);
            const response = await tasksApi.create(taskData);
            setTasks(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            console.error('Error adding task:', err);
            throw new Error(err.response?.data?.message || 'שגיאה בהוספת משימה');
        }
    };

    const updateTask = async (taskId, taskData, action = 'update') => {
        try {
            setError(null);
            console.log('Updating task:', { taskId, taskData, action });

            let response;
            switch (action) {
                case 'share':
                    response = await tasksApi.shareTask(taskId, taskData);
                    break;
                case 'updateShare':
                    response = await tasksApi.updateTaskShare(taskId, taskData.userId, taskData.permission);
                    break;
                case 'removeShare':
                    response = await tasksApi.removeTaskShare(taskId, taskData.userId);
                    break;
                default:
                    response = await tasksApi.update(taskId, taskData);
            }

            console.log('Update response:', response.data);

            // עדכון הרשימה המתאימה
            const updateTaskInList = (tasksList, updatedTask) => {
                return tasksList.map(task =>
                    task._id === taskId ? updatedTask : task
                );
            };

            if (response.data.userId === currentUser?.id) {
                setTasks(prev => updateTaskInList(prev, response.data));
            } else {
                setSharedTasks(prev => updateTaskInList(prev, response.data));
            }

            await fetchTasks(); // רענון הרשימות
            return response.data;
        } catch (err) {
            console.error('Error updating task:', err);
            const errorMessage = err.response?.data?.message || 'שגיאה בעדכון המשימה';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const deleteTask = async (taskId, isShared = false) => {
        try {
            setError(null);
            await tasksApi.delete(taskId);

            if (isShared) {
                setSharedTasks(prev => prev.filter(task => task._id !== taskId));
            } else {
                setTasks(prev => prev.filter(task => task._id !== taskId));
            }
        } catch (err) {
            console.error('Error deleting task:', err);
            throw new Error(err.response?.data?.message || 'שגיאה במחיקת המשימה');
        }
    };

    // פונקציות העזר לבדיקת הרשאות
    const canEditTask = (task) => {
        if (!currentUser || !task) return false;
        if (task.userId === currentUser.id) return true;

        const share = task.sharedWith?.find(s => s.userId === currentUser.id);
        return ['EDIT', 'ADMIN'].includes(share?.permission);
    };

    const canShareTask = (task) => {
        if (!currentUser || !task) return false;
        if (task.userId === currentUser.id) return true;

        const share = task.sharedWith?.find(s => s.userId === currentUser.id);
        return share?.permission === 'ADMIN';
    };

    const value = {
        tasks,
        sharedTasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        canEditTask,
        canShareTask,
        fetchTasks
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks חייב להיות בתוך TaskProvider');
    }
    return context;
};

export default TaskContext;