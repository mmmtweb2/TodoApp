import React, { useState } from 'react';

const SubTaskList = ({ subTasks = [], onAddSubTask, onUpdateSubTask, onDeleteSubTask, taskId }) => {
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const [isAddingSubTask, setIsAddingSubTask] = useState(false);

    console.log('SubTaskList rendered with:', { subTasks, taskId }); // בדיקה

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newSubTaskTitle.trim()) {
            onAddSubTask(taskId, {
                title: newSubTaskTitle.trim(),
                status: 'NOT_STARTED'
            });
            setNewSubTaskTitle('');
            setIsAddingSubTask(false);
        }
    };

    return (
        <div className="mt-4 pr-8 border-r-2 border-gray-200">
            {/* רשימת תתי המשימות */}
            <div className="space-y-2">
                {Array.isArray(subTasks) && subTasks.map((subTask, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                        <button
                            onClick={() => onUpdateSubTask(taskId, index, {
                                ...subTask,
                                status: subTask.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED'
                            })}
                            className={`w-4 h-4 rounded-full flex items-center justify-center
                                      ${subTask.status === 'COMPLETED'
                                    ? 'bg-green-500'
                                    : 'border-2 border-gray-300'}`}
                        >
                            {subTask.status === 'COMPLETED' && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <span className={`text-sm ${subTask.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                            {subTask.title}
                        </span>
                        <button
                            onClick={() => onDeleteSubTask(taskId, index)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* טופס הוספת תת משימה */}
            {isAddingSubTask ? (
                <form onSubmit={handleSubmit} className="mt-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSubTaskTitle}
                            onChange={(e) => setNewSubTaskTitle(e.target.value)}
                            placeholder="הכנס תת משימה..."
                            className="flex-1 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            הוסף
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAddingSubTask(false)}
                            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        >
                            ביטול
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAddingSubTask(true)}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                >
                    + הוסף תת משימה
                </button>
            )}
        </div>
    );
};

export default SubTaskList;