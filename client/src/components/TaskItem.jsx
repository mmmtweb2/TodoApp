// components/TaskItem.jsx
import React, { useState } from 'react';
import { Share2, Edit, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import ShareTask from './ShareTask';

const TaskItem = ({ task }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { updateTask, deleteTask } = useTasks();
    const [error, setError] = useState('');

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'text-red-500';
            case 'MEDIUM': return 'text-yellow-500';
            case 'LOW': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'IN_PROGRESS':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <Circle className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleStatusChange = async () => {
        try {
            let newStatus;
            switch (task.status) {
                case 'NOT_STARTED':
                    newStatus = 'IN_PROGRESS';
                    break;
                case 'IN_PROGRESS':
                    newStatus = 'COMPLETED';
                    break;
                case 'COMPLETED':
                    newStatus = 'NOT_STARTED';
                    break;
                default:
                    newStatus = 'NOT_STARTED';
            }

            await updateTask(task._id, { status: newStatus });
            setError('');
        } catch (err) {
            setError('שגיאה בעדכון סטטוס המשימה');
            console.error('Error updating task status:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
            try {
                await deleteTask(task._id);
                setError('');
            } catch (err) {
                setError('שגיאה במחיקת המשימה');
                console.error('Error deleting task:', err);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-200 hover:shadow-lg">
            {error && (
                <div className="mb-4 text-red-500 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                    {/* כפתור סטטוס */}
                    <button
                        onClick={handleStatusChange}
                        className="mt-1 hover:scale-110 transition-transform"
                        title="שנה סטטוס"
                    >
                        {getStatusIcon(task.status)}
                    </button>

                    <div>
                        <h3 className="text-lg font-medium">{task.title}</h3>
                        {task.description && (
                            <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
                        )}

                        {/* תגיות ומידע נוסף */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)} bg-opacity-10`}>
                                {task.priority === 'HIGH' ? 'גבוהה' :
                                    task.priority === 'MEDIUM' ? 'בינונית' : 'נמוכה'}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                {task.category === 'PERSONAL' ? 'אישי' :
                                    task.category === 'WORK' ? 'עבודה' :
                                        task.category === 'SHOPPING' ? 'קניות' :
                                            task.category === 'HEALTH' ? 'בריאות' : 'אחר'}
                            </span>
                            {task.dueDate && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* כפתורי פעולה */}
                <div className="flex items-center gap-2">
                    {/* כפתור שיתוף */}
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                        title="שתף משימה"
                    >
                        <Share2 className="w-5 h-5 text-gray-600" />
                        {task.sharedWith?.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {task.sharedWith.length}
                            </span>
                        )}
                    </button>

                    {/* כפתור עריכה */}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="ערוך משימה"
                    >
                        <Edit className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* כפתור מחיקה */}
                    <button
                        onClick={handleDelete}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                        title="מחק משימה"
                    >
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                </div>
            </div>

            {/* תצוגת משתמשים משותפים */}
            {task.sharedWith?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {task.sharedWith.map(share => (
                        <span
                            key={share.userId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                            {share.email}
                            {share.permission !== 'VIEW' && (
                                <span className="ml-1 text-blue-600">
                                    ({share.permission === 'ADMIN' ? 'מנהל' : 'עורך'})
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* מודל שיתוף */}
            {showShareModal && (
                <ShareTask
                    task={task}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
};

export default TaskItem;