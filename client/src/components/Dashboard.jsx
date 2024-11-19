import React, { useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

const Dashboard = () => {
    const { tasks } = useTasks();

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // נתונים בסיסיים
        const basicStats = {
            total: tasks.length,
            completed: tasks.filter(task => task.status === 'COMPLETED').length,
            inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
            overdue: tasks.filter(task => {
                if (!task.dueDate || task.status === 'COMPLETED') return false;
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today;
            }).length
        };

        // נתונים לפי עדיפות
        const priorityStats = {
            HIGH: tasks.filter(task => task.priority === 'HIGH').length,
            MEDIUM: tasks.filter(task => task.priority === 'MEDIUM').length,
            LOW: tasks.filter(task => task.priority === 'LOW').length
        };

        // נתונים לפי קטגוריה
        const categoryStats = tasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});

        // נתונים לאורך זמן
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            return date;
        }).reverse();

        const completionTrend = last7Days.map(date => ({
            date: date.toLocaleDateString('he-IL', { weekday: 'short' }),
            completed: tasks.filter(task =>
                task.status === 'COMPLETED' &&
                new Date(task.updatedAt).setHours(0, 0, 0, 0) === date.getTime()
            ).length,
            added: tasks.filter(task =>
                new Date(task.createdAt).setHours(0, 0, 0, 0) === date.getTime()
            ).length
        }));

        return {
            basic: basicStats,
            priority: priorityStats,
            category: categoryStats,
            trend: completionTrend
        };
    }, [tasks]);

    // נתוני עוגה לעדיפויות
    const priorityData = [
        { name: 'גבוהה', value: stats.priority.HIGH, color: '#EF4444' },
        { name: 'בינונית', value: stats.priority.MEDIUM, color: '#F59E0B' },
        { name: 'נמוכה', value: stats.priority.LOW, color: '#10B981' }
    ];

    // נתוני עוגה לסטטוס
    const statusData = [
        { name: 'הושלם', value: stats.basic.completed, color: '#10B981' },
        { name: 'בביצוע', value: stats.basic.inProgress, color: '#F59E0B' },
        { name: 'טרם התחיל', value: stats.basic.total - stats.basic.completed - stats.basic.inProgress, color: '#6B7280' }
    ];

    return (
        <div className="space-y-6">
            {/* כרטיסי סטטיסטיקה */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="סה״כ משימות"
                    value={stats.basic.total}
                    icon="📊"
                />
                <StatCard
                    title="הושלמו"
                    value={stats.basic.completed}
                    percentage={stats.basic.total > 0 ?
                        Math.round((stats.basic.completed / stats.basic.total) * 100) : 0}
                    icon="✅"
                />
                <StatCard
                    title="בביצוע"
                    value={stats.basic.inProgress}
                    icon="⌛"
                />
                <StatCard
                    title="באיחור"
                    value={stats.basic.overdue}
                    icon="⚠️"
                />
            </div>

            {/* גרפים */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* מגמת השלמת משימות */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">מגמת משימות</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                name="הושלמו"
                                stroke="#10B981"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="added"
                                name="נוספו"
                                stroke="#6366F1"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* התפלגות לפי עדיפות */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">התפלגות לפי עדיפות</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={priorityData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label
                            >
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* התפלגות לפי סטטוס */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">התפלגות לפי סטטוס</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value">
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* התקדמות יומית */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">התקדמות יומית</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="completed"
                                name="הושלמו"
                                fill="#10B981"
                            />
                            <Bar
                                dataKey="added"
                                name="נוספו"
                                fill="#6366F1"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// קומפוננטת כרטיס סטטיסטיקה
const StatCard = ({ title, value, percentage, icon }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-sm text-gray-600 mb-1">{title}</div>
                    <div className="text-2xl font-bold">
                        {value}
                        {percentage !== undefined && (
                            <span className="text-sm text-gray-500 ml-1">
                                ({percentage}%)
                            </span>
                        )}
                    </div>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
};

export default Dashboard;