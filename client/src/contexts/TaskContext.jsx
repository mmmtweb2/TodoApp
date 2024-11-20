// src/contexts/TaskContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { tasks as tasksApi } from '../services/api';
import { useAuth } from './AuthContext';
import config from '../config';

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
            throw new Error(err.response?.data?.message || 'שגיאה בהוספת משימה');
        }
    };

    const updateTask = async (taskId, taskData, action = 'update') => {
        try {
            setError(null);
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

            if (response.data.userId === currentUser?.id) {
                setTasks(prev => prev.map(task =>
                    task._id === taskId ? response.data : task
                ));
            } else {
                setSharedTasks(prev => prev.map(task =>
                    task._id === taskId ? response.data : task
                ));
            }

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה בעדכון המשימה';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        tasks,
        sharedTasks,
        loading,
        error,
        addTask,
        updateTask,
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