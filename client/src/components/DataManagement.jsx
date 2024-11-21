// client/src/components/DataManagement.jsx
import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const DataManagement = () => {
    const { tasks, addTask } = useTasks();
    const { currentUser } = useAuth();
    const [importError, setImportError] = useState('');

    // ייצוא ל-PDF
    const exportToPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setR2L(true); // תמיכה בכתיבה מימין לשמאל

        // כותרת
        doc.setFontSize(20);
        doc.text('רשימת משימות', 200, 20, { align: 'right' });

        // טבלת משימות
        const tableData = tasks.map(task => [
            task.title,
            translateStatus(task.status),
            translatePriority(task.priority),
            task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            task.subTasks ? task.subTasks.length : 0
        ]);

        doc.autoTable({
            head: [['כותרת', 'סטטוס', 'עדיפות', 'תאריך יעד', 'תתי משימות']],
            body: tableData,
            startY: 30,
            theme: 'grid',
            styles: {
                font: 'hebrew',
                halign: 'right'
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        doc.save('משימות.pdf');
    };

    // ייצוא ל-Excel
    const exportToExcel = () => {
        const formattedData = tasks.map(task => ({
            'כותרת': task.title,
            'תיאור': task.description || '',
            'סטטוס': translateStatus(task.status),
            'עדיפות': translatePriority(task.priority),
            'קטגוריה': translateCategory(task.category),
            'תאריך יעד': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
            'שעת יעד': task.dueTime || '',
            'תתי משימות': task.subTasks ? task.subTasks.length : 0,
            'הושלם': task.status === 'COMPLETED' ? 'כן' : 'לא'
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData, {
            header: ['כותרת', 'תיאור', 'סטטוס', 'עדיפות', 'קטגוריה', 'תאריך יעד', 'שעת יעד', 'תתי משימות', 'הושלם']
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "משימות");
        XLSX.writeFile(wb, "משימות.xlsx");
    };

    // ייצוא לגיבוי JSON
    const exportToJSON = () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tasks_backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ייבוא מקובץ
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                let importedData;
                if (file.name.endsWith('.json')) {
                    importedData = JSON.parse(e.target.result);
                    await importTasks(importedData);
                } else if (file.name.endsWith('.xlsx')) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    importedData = XLSX.utils.sheet_to_json(worksheet);
                    await importExcelTasks(importedData);
                }
                setImportError('');
            } catch (error) {
                setImportError('שגיאה בייבוא הקובץ. וודא שהפורמט נכון.');
                console.error('Import error:', error);
            }
        };

        if (file.name.endsWith('.json')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            reader.readAsArrayBuffer(file);
        } else {
            setImportError('פורמט קובץ לא נתמך. יש להשתמש ב-JSON או Excel.');
        }
    };

    // פונקציות עזר לתרגום
    const translateStatus = (status) => {
        const statusMap = {
            'NOT_STARTED': 'טרם התחיל',
            'IN_PROGRESS': 'בביצוע',
            'COMPLETED': 'הושלם'
        };
        return statusMap[status] || status;
    };

    const translatePriority = (priority) => {
        const priorityMap = {
            'HIGH': 'גבוהה',
            'MEDIUM': 'בינונית',
            'LOW': 'נמוכה'
        };
        return priorityMap[priority] || priority;
    };

    const translateCategory = (category) => {
        const categoryMap = {
            'PERSONAL': 'אישי',
            'WORK': 'עבודה',
            'SHOPPING': 'קניות',
            'HEALTH': 'בריאות',
            'OTHER': 'אחר'
        };
        return categoryMap[category] || category;
    };

    // פונקציות עזר לייבוא
    const importTasks = async (tasksData) => {
        for (const task of tasksData) {
            await addTask(task);
        }
    };

    const importExcelTasks = async (tasksData) => {
        for (const row of tasksData) {
            const task = {
                title: row['כותרת'],
                description: row['תיאור'],
                status: getStatusKey(row['סטטוס']),
                priority: getPriorityKey(row['עדיפות']),
                category: getCategoryKey(row['קטגוריה']),
                dueDate: row['תאריך יעד'] ? new Date(row['תאריך יעד']) : null,
                dueTime: row['שעת יעד'] || null
            };
            await addTask(task);
        }
    };

    const getStatusKey = (hebrewStatus) => {
        const reverseStatusMap = {
            'טרם התחיל': 'NOT_STARTED',
            'בביצוע': 'IN_PROGRESS',
            'הושלם': 'COMPLETED'
        };
        return reverseStatusMap[hebrewStatus] || 'NOT_STARTED';
    };

    const getPriorityKey = (hebrewPriority) => {
        const reversePriorityMap = {
            'גבוהה': 'HIGH',
            'בינונית': 'MEDIUM',
            'נמוכה': 'LOW'
        };
        return reversePriorityMap[hebrewPriority] || 'MEDIUM';
    };

    const getCategoryKey = (hebrewCategory) => {
        const reverseCategoryMap = {
            'אישי': 'PERSONAL',
            'עבודה': 'WORK',
            'קניות': 'SHOPPING',
            'בריאות': 'HEALTH',
            'אחר': 'OTHER'
        };
        return reverseCategoryMap[hebrewCategory] || 'OTHER';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">ניהול נתונים</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ייצוא */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ייצוא נתונים</h3>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg 
                                     hover:bg-green-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            ייצוא ל-Excel
                        </button>

                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg 
                                     hover:bg-red-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            ייצוא ל-PDF
                        </button>

                        <button
                            onClick={exportToJSON}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                                     hover:bg-blue-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            גיבוי (JSON)
                        </button>
                    </div>
                </div>

                {/* ייבוא */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ייבוא נתונים</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="file-upload"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg 
                                         hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                בחר קובץ לייבוא
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".json,.xlsx"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </div>
                        {importError && (
                            <div className="text-red-500 text-sm">
                                {importError}
                            </div>
                        )}
                        <div className="text-sm text-gray-500">
                            * ניתן לייבא קבצי JSON או Excel
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataManagement;