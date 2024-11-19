// components/ShareTask.jsx
import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { X, Search, UserPlus } from 'lucide-react';

const ShareTask = ({ task, onClose }) => {
    const [emails, setEmails] = useState('');
    const [permission, setPermission] = useState('VIEW');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateTask } = useTasks();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);

            if (emailList.length === 0) {
                setError('נא להזין לפחות כתובת אימייל אחת');
                return;
            }

            console.log('Sharing task with:', { emailList, permission });

            await updateTask(task._id, {
                users: emailList,
                permission
            }, 'share');

            onClose();
        } catch (err) {
            console.error('Share error:', err);
            setError(err.message || 'שגיאה בשיתוף המשימה');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveShare = async (userId) => {
        try {
            setIsLoading(true);
            await updateTask(task._id, { userId }, 'removeShare');
            setError('');
        } catch (err) {
            setError(err.message || 'שגיאה בהסרת השיתוף');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">שתף משימה</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            כתובות אימייל (מופרדות בפסיקים)
                        </label>
                        <div className="flex items-center border rounded-lg p-2">
                            <UserPlus className="text-gray-400 w-5 h-5 mr-2" />
                            <input
                                type="text"
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                                placeholder="user@example.com, user2@example.com"
                                className="w-full outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            הרשאות
                        </label>
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="VIEW">צפייה בלבד</option>
                            <option value="EDIT">עריכה</option>
                            <option value="ADMIN">מנהל</option>
                        </select>
                    </div>

                    {/* משתמשים משותפים נוכחיים */}
                    {task.sharedWith?.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">משותף כרגע עם:</h3>
                            <div className="space-y-2">
                                {task.sharedWith.map((share) => (
                                    <div key={share.userId} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                        <span className="text-sm">{share.email}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {share.permission === 'VIEW' ? 'צפייה' :
                                                    share.permission === 'EDIT' ? 'עריכה' : 'מנהל'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveShare(share.userId)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                                disabled={isLoading}
                                            >
                                                הסר
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            disabled={isLoading}
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !emails.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                                     disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'שולח...' : 'שתף'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareTask;