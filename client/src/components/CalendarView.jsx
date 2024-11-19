import React, { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';

const CalendarView = () => {
    const { tasks, addTask } = useTasks();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewType, setViewType] = useState('month'); // 'month' or 'week'
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showDayDetails, setShowDayDetails] = useState(false);

    // חישוב נתוני הלוח
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (viewType === 'month') {
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);
            const daysInMonth = lastDayOfMonth.getDate();
            const startDay = firstDayOfMonth.getDay();

            const days = [];
            for (let i = 0; i < startDay; i++) {
                days.push(null);
            }
            for (let i = 1; i <= daysInMonth; i++) {
                days.push(new Date(year, month, i));
            }
            return days;
        } else {
            // תצוגה שבועית
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

            const days = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                days.push(day);
            }
            return days;
        }
    }, [currentDate, viewType]);

    // מיפוי משימות לימים
    const tasksByDate = useMemo(() => {
        const taskMap = new Map();

        tasks.forEach(task => {
            if (task.dueDate) {
                const dateKey = new Date(task.dueDate).toDateString();
                if (!taskMap.has(dateKey)) {
                    taskMap.set(dateKey, []);
                }
                taskMap.get(dateKey).push(task);
            }
        });

        return taskMap;
    }, [tasks]);

    // טופס הוספת משימה מהירה
    const QuickAddTaskForm = ({ date, onClose }) => {
        const [taskData, setTaskData] = useState({
            title: '',
            priority: 'MEDIUM',
            category: 'OTHER'
        });

        const handleSubmit = async (e) => {
            e.preventDefault();
            await addTask({
                ...taskData,
                dueDate: date.toISOString().split('T')[0]
            });
            onClose();
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">
                        הוספת משימה ל-{date.toLocaleDateString()}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="כותרת המשימה"
                                value={taskData.title}
                                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={taskData.priority}
                                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                                className="p-2 border rounded-lg"
                            >
                                <option value="HIGH">עדיפות גבוהה</option>
                                <option value="MEDIUM">עדיפות בינונית</option>
                                <option value="LOW">עדיפות נמוכה</option>
                            </select>
                            <select
                                value={taskData.category}
                                onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
                                className="p-2 border rounded-lg"
                            >
                                <option value="PERSONAL">אישי</option>
                                <option value="WORK">עבודה</option>
                                <option value="SHOPPING">קניות</option>
                                <option value="HEALTH">בריאות</option>
                                <option value="OTHER">אחר</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 rounded-lg"
                            >
                                ביטול
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                            >
                                הוסף משימה
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // תצוגה מפורטת של יום
    const DayDetailsModal = ({ date, tasks, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {date.toLocaleDateString()}
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>
                    {tasks?.length > 0 ? (
                        <div className="space-y-2">
                            {tasks.map((task, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${task.priority === 'HIGH' ? 'bg-red-50 border-r-4 border-red-500' :
                                            task.priority === 'MEDIUM' ? 'bg-yellow-50 border-r-4 border-yellow-500' :
                                                'bg-green-50 border-r-4 border-green-500'
                                        }`}
                                >
                                    <div className="font-medium">{task.title}</div>
                                    {task.description && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {task.description}
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500 mt-1">
                                        {task.status === 'COMPLETED' ? '✓ הושלם' :
                                            task.status === 'IN_PROGRESS' ? '⌛ בביצוע' : '⏳ טרם התחיל'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">
                            אין משימות ליום זה
                        </div>
                    )}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {
                                onClose();
                                setSelectedDate(date);
                                setShowAddTaskModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            + הוסף משימה
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* כותרת וניווט */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => viewType === 'month'
                            ? setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                            : setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))
                        }
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <h2 className="text-xl font-bold">
                        {viewType === 'month'
                            ? `${new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(currentDate)} ${currentDate.getFullYear()}`
                            : `שבוע ${Math.ceil(currentDate.getDate() / 7)}`
                        }
                    </h2>

                    <button
                        onClick={() => viewType === 'month'
                            ? setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                            : setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))
                        }
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setViewType('month')}
                        className={`px-3 py-1 rounded ${viewType === 'month' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                    >
                        חודשי
                    </button>
                    <button
                        onClick={() => setViewType('week')}
                        className={`px-3 py-1 rounded ${viewType === 'week' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                    >
                        שבועי
                    </button>
                </div>
            </div>

            {/* לוח השנה */}
            <div className="grid grid-cols-7 gap-1">
                {/* כותרות ימים */}
                {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map(day => (
                    <div key={day} className="text-center font-semibold py-2">
                        {day}
                    </div>
                ))}

                {/* תאים */}
                {calendarData.map((date, index) => (
                    <div
                        key={index}
                        className={`min-h-[100px] border rounded-lg p-2 ${date ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                            } ${date?.toDateString() === new Date().toDateString()
                                ? 'border-blue-500 border-2'
                                : 'border-gray-200'
                            }`}
                        onClick={() => date && setShowDayDetails(date)}
                    >
                        {date && (
                            <>
                                <div className="text-right mb-1">
                                    {date.getDate()}
                                </div>
                                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                                    {tasksByDate.get(date.toDateString())?.map((task, taskIndex) => (
                                        <div
                                            key={taskIndex}
                                            className={`text-xs p-1 rounded border-r-2 ${task.priority === 'HIGH' ? 'bg-red-100 border-red-500 text-red-700' :
                                                    task.priority === 'MEDIUM' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                                                        'bg-green-100 border-green-500 text-green-700'
                                                }`}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* מודלים */}
            {selectedDate && showAddTaskModal && (
                <QuickAddTaskForm
                    date={selectedDate}
                    onClose={() => {
                        setSelectedDate(null);
                        setShowAddTaskModal(false);
                    }}
                />
            )}

            {showDayDetails && (
                <DayDetailsModal
                    date={showDayDetails}
                    tasks={tasksByDate.get(showDayDetails.toDateString())}
                    onClose={() => setShowDayDetails(null)}
                />
            )}
        </div>
    );
};

export default CalendarView;