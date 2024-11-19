// components/ShareTask.jsx
import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { auth as authApi } from '../services/api';
import { X, Search, UserPlus, Shield } from 'lucide-react';

const ShareTask = ({ task, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [permission, setPermission] = useState('VIEW');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateTask } = useTasks();

    // חיפוש משתמשים
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                const response = await authApi.searchUsers(searchQuery);
                setSearchResults(response.data.filter(user =>
                    !task.sharedWith?.some(share => share.userId === user.id)
                ));
            } catch (err) {
                console.error('Error searching users:', err);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, task.sharedWith]);

    const handleUserSelect = (user) => {
        setSelectedUsers(prev => {
            if (!prev.find(u => u.id === user.id)) {
                return [...prev, user];
            }
            return prev;
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveSelected = (userId) => {
        setSelectedUsers(prev => prev.filter(user => user.id !== userId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await updateTask(task._id, {
                users: selectedUsers.map(user => user.email),
                permission
            }, 'share');
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveShare = async (userId) => {
        try {
            setIsLoading(true);
            await updateTask(task._id, { userId }, 'removeShare');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePermission = async (userId, newPermission) => {
        try {
            setIsLoading(true);
            await updateTask(task._id, { userId, permission: newPermission }, 'updateShare');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">שתף משימה</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* חיפוש משתמשים */}
                    <div className="relative">
                        <div className="flex items-center border rounded-lg p-2">
                            <Search className="text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="חפש משתמשים לפי אימייל או שם"
                                className="w-full p-1 outline-none mr-2"
                            />
                        </div>

                        {/* תוצאות חיפוש */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserSelect(user)}
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                    >
                                        <UserPlus className="w-4 h-4 text-gray-400 mr-2" />
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* משתמשים שנבחרו */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                    <span>{user.email}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSelected(user.id)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* הרשאות */}
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

                    {/* משתמשים משותפים */}
                    {task.sharedWith?.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">משותף עם:</h3>
                            <div className="space-y-2">
                                {task.sharedWith.map((share) => (
                                    <div key={share.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Shield className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                                <div className="font-medium">{share.email}</div>
                                                <div className="text-sm text-gray-500">
                                                    {share.permission === 'VIEW' ? 'צפייה' :
                                                        share.permission === 'EDIT' ? 'עריכה' : 'מנהל'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={share.permission}
                                                onChange={(e) => handleUpdatePermission(share.userId, e.target.value)}
                                                className="text-sm border rounded p-1"
                                            >
                                                <option value="VIEW">צפייה</option>
                                                <option value="EDIT">עריכה</option>
                                                <option value="ADMIN">מנהל</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveShare(share.userId)}
                                                className="text-red-500 hover:text-red-700"
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

                    {/* כפתורי פעולה */}
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || selectedUsers.length === 0}
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