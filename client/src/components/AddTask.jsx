import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';

const AddTask = () => {
    const { addTask } = useTasks();
    const [showForm, setShowForm] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        category: 'OTHER',
        dueDate: '',
        dueTime: '',
        tags: []
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!taskData.title.trim()) {
                setError('חובה להזין כותרת למשימה');
                return;
            }

            // לוג לבדיקה
            console.log('Submitting task data:', taskData);

            const newTask = await addTask({
                ...taskData,
                priority: taskData.priority || 'MEDIUM',    // וידוא שיש ערך
                category: taskData.category || 'OTHER'      // וידוא שיש ערך
            });

            console.log('Task created:', newTask);  // לוג לבדיקה

            setTaskData({
                title: '',
                description: '',
                status: 'NOT_STARTED',
                priority: 'MEDIUM',
                category: 'OTHER',
                dueDate: '',
                dueTime: '',
                tags: []
            });
            setShowForm(false);
        } catch (err) {
            setError(err.message);
            console.error('Error creating task:', err);
        }
    };

    return (
        <div className="mb-6">
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg 
                             shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    משימה חדשה
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-red-500 bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* כותרת */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                כותרת
                            </label>
                            <input
                                type="text"
                                value={taskData.title}
                                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="הכנס כותרת למשימה"
                            />
                        </div>

                        {/* תיאור */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                תיאור
                            </label>
                            <textarea
                                value={taskData.description}
                                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="תיאור המשימה (אופציונלי)"
                            />
                        </div>

                        {/* קטגוריה ועדיפות */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    קטגוריה
                                </label>
                                <select
                                    value={taskData.category}
                                    onChange={(e) => {
                                        console.log('Selected category:', e.target.value); // לוג לבדיקה
                                        setTaskData({ ...taskData, category: e.target.value });
                                    }}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="PERSONAL">אישי</option>
                                    <option value="WORK">עבודה</option>
                                    <option value="SHOPPING">קניות</option>
                                    <option value="HEALTH">בריאות</option>
                                    <option value="OTHER">אחר</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    עדיפות
                                </label>
                                <select
                                    value={taskData.priority}
                                    onChange={(e) => {
                                        console.log('Selected priority:', e.target.value); // לוג לבדיקה
                                        setTaskData({ ...taskData, priority: e.target.value });
                                    }}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="HIGH">גבוהה</option>
                                    <option value="MEDIUM">בינונית</option>
                                    <option value="LOW">נמוכה</option>
                                </select>
                            </div>
                        </div>

                        {/* תאריך ושעה */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    תאריך יעד
                                </label>
                                <input
                                    type="date"
                                    value={taskData.dueDate}
                                    onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    שעה
                                </label>
                                <input
                                    type="time"
                                    value={taskData.dueTime}
                                    onChange={(e) => setTaskData({ ...taskData, dueTime: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* כפתורי פעולה */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                                         transition-colors duration-300"
                            >
                                הוסף משימה
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300
                                         transition-colors duration-300"
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AddTask;