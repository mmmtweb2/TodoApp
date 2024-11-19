import React from 'react';

const TaskFilters = ({ filters, onFilterChange }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* חיפוש */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">חיפוש</label>
                    <input
                        type="text"
                        placeholder="חפש משימות..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* סינון לפי קטגוריה */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                    <select
                        value={filters.category}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">הכל</option>
                        <option value="PERSONAL">אישי</option>
                        <option value="WORK">עבודה</option>
                        <option value="SHOPPING">קניות</option>
                        <option value="HEALTH">בריאות</option>
                        <option value="OTHER">אחר</option>
                    </select>
                </div>

                {/* סינון לפי עדיפות */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => onFilterChange('priority', e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">הכל</option>
                        <option value="HIGH">גבוהה</option>
                        <option value="MEDIUM">בינונית</option>
                        <option value="LOW">נמוכה</option>
                    </select>
                </div>

                {/* מיון */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">מיון לפי</label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="dueDate">תאריך יעד</option>
                        <option value="priority">עדיפות</option>
                        <option value="status">סטטוס</option>
                        <option value="completionPercentage">התקדמות</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TaskFilters;