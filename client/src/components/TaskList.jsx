import React, { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import TaskItem from './TaskItem';

const TaskList = () => {
    const { tasks, loading, error } = useTasks();
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        priority: '',
        category: '',
        sortBy: 'dueDate'
    });

    // לוג של המשימות שהגיעו מהשרת
    useEffect(() => {
        console.log('Current tasks:', tasks);
    }, [tasks]);

    // לוג של שינויים בפילטרים
    useEffect(() => {
        console.log('Current filters:', filters);
    }, [filters]);

    const filteredAndSortedTasks = useMemo(() => {
        console.log('Starting filtering process');
        let result = [...tasks];

        // בדיקת פילטרים לפני הפילטור
        result = result.filter(task => {
            console.log('Checking task:', {
                taskId: task._id,
                taskPriority: task.priority,
                filterPriority: filters.priority,
                taskCategory: task.category,
                filterCategory: filters.category
            });

            // חיפוש טקסט
            const matchesSearch = !filters.search ||
                task.title.toLowerCase().includes(filters.search.toLowerCase());

            // סטטוס
            const matchesStatus = !filters.status ||
                task.status === filters.status;

            // עדיפות
            const matchesPriority = !filters.priority ||
                String(task.priority).toUpperCase() === String(filters.priority).toUpperCase();

            // קטגוריה
            const matchesCategory = !filters.category ||
                String(task.category).toUpperCase() === String(filters.category).toUpperCase();

            console.log('Match results:', {
                matchesSearch,
                matchesStatus,
                matchesPriority,
                matchesCategory
            });

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
        });

        console.log('Filtered tasks:', result);

        // מיון
        result.sort((a, b) => {
            switch (filters.sortBy) {
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);

                case 'priority': {
                    const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }

                case 'status': {
                    const statusOrder = { 'NOT_STARTED': 0, 'IN_PROGRESS': 1, 'COMPLETED': 2 };
                    return statusOrder[a.status] - statusOrder[b.status];
                }

                default:
                    return 0;
            }
        });

        return result;
    }, [tasks, filters]);

    const resetFilters = () => {
        console.log('Resetting filters');
        setFilters({
            search: '',
            status: '',
            priority: '',
            category: '',
            sortBy: 'dueDate'
        });
    };

    // לוג של המשימות המסוננות
    useEffect(() => {
        console.log('Filtered tasks result:', filteredAndSortedTasks);
    }, [filteredAndSortedTasks]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                שגיאה בטעינת המשימות: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* חיפוש */}
                    <input
                        type="text"
                        placeholder="חיפוש משימות..."
                        value={filters.search}
                        onChange={(e) => {
                            console.log('Search changed:', e.target.value);
                            setFilters(prev => ({ ...prev, search: e.target.value }));
                        }}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {/* עדיפות */}
                    <select
                        value={filters.priority}
                        onChange={(e) => {
                            console.log('Priority changed:', e.target.value);
                            setFilters(prev => ({ ...prev, priority: e.target.value }));
                        }}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">כל העדיפויות</option>
                        <option value="HIGH">גבוהה</option>
                        <option value="MEDIUM">בינונית</option>
                        <option value="LOW">נמוכה</option>
                    </select>

                    {/* קטגוריה */}
                    <select
                        value={filters.category}
                        onChange={(e) => {
                            console.log('Category changed:', e.target.value);
                            setFilters(prev => ({ ...prev, category: e.target.value }));
                        }}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">כל הקטגוריות</option>
                        <option value="PERSONAL">אישי</option>
                        <option value="WORK">עבודה</option>
                        <option value="SHOPPING">קניות</option>
                        <option value="HEALTH">בריאות</option>
                        <option value="OTHER">אחר</option>
                    </select>

                    {/* סטטוס */}
                    <select
                        value={filters.status}
                        onChange={(e) => {
                            console.log('Status changed:', e.target.value);
                            setFilters(prev => ({ ...prev, status: e.target.value }));
                        }}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">כל הסטטוסים</option>
                        <option value="NOT_STARTED">טרם התחיל</option>
                        <option value="IN_PROGRESS">בביצוע</option>
                        <option value="COMPLETED">הושלם</option>
                    </select>
                </div>

                <div className="flex justify-between items-center">
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="dueDate">מיון לפי תאריך</option>
                        <option value="priority">מיון לפי עדיפות</option>
                        <option value="status">מיון לפי סטטוס</option>
                    </select>

                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        איפוס מסננים
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map(task => (
                        <TaskItem key={task._id} task={task} />
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
                        <p>לא נמצאו משימות התואמות לחיפוש</p>
                        <button
                            onClick={resetFilters}
                            className="mt-2 text-blue-500 hover:text-blue-700"
                        >
                            נקה מסננים
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskList;