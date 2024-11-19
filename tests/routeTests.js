const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let testTaskId = null;
let testTaskListId = null;

// צבעים ללוגים
const colors = {
    success: '\x1b[32m%s\x1b[0m', // ירוק
    error: '\x1b[31m%s\x1b[0m',   // אדום
    info: '\x1b[36m%s\x1b[0m'     // כחול
};

// פונקציית בדיקה כללית
const runTest = async (name, testFunction) => {
    try {
        console.log(colors.info, `\nבודק ${name}...`);
        await testFunction();
        console.log(colors.success, `✓ ${name} עבר בהצלחה`);
        return true;
    } catch (error) {
        console.log(colors.error, `✗ ${name} נכשל:`);
        console.error(error.response?.data || error.message);
        return false;
    }
};

// בדיקות משימות
const taskTests = {
    // בדיקת יצירת משימה
    createTask: async () => {
        const response = await axios.post(`${API_URL}/tasks`, {
            title: "משימת בדיקה",
            status: "NOT_STARTED",
            dueDate: new Date().toISOString(),
            dueTime: "10:00"
        });
        testTaskId = response.data._id;
        console.log('משימה נוצרה עם ID:', testTaskId);
    },

    // בדיקת קבלת כל המשימות
    getAllTasks: async () => {
        const response = await axios.get(`${API_URL}/tasks`);
        console.log('מספר המשימות שהתקבלו:', response.data.length);
    },

    // בדיקת עדכון משימה
    updateTask: async () => {
        if (!testTaskId) throw new Error('לא נמצא ID של משימה לעדכון');
        const response = await axios.patch(`${API_URL}/tasks/${testTaskId}`, {
            status: "IN_PROGRESS"
        });
        console.log('סטטוס המשימה עודכן ל:', response.data.status);
    },

    // בדיקת מחיקת משימה
    deleteTask: async () => {
        if (!testTaskId) throw new Error('לא נמצא ID של משימה למחיקה');
        await axios.delete(`${API_URL}/tasks/${testTaskId}`);
        console.log('המשימה נמחקה בהצלחה');
    }
};

// בדיקות רשימות משימות
const taskListTests = {
    // בדיקת יצירת רשימת משימות
    createTaskList: async () => {
        const response = await axios.post(`${API_URL}/tasklists`, {
            title: "רשימת בדיקה"
        });
        testTaskListId = response.data._id;
        console.log('רשימת משימות נוצרה עם ID:', testTaskListId);
    },

    // בדיקת קבלת כל רשימות המשימות
    getAllTaskLists: async () => {
        const response = await axios.get(`${API_URL}/tasklists`);
        console.log('מספר רשימות המשימות שהתקבלו:', response.data.length);
    },

    // בדיקת הוספת משימה לרשימה
    addTaskToList: async () => {
        if (!testTaskListId) throw new Error('לא נמצא ID של רשימת משימות');
        const response = await axios.post(`${API_URL}/tasklists/${testTaskListId}/tasks`, {
            title: "משימה בתוך רשימה"
        });
        console.log('משימה נוספה לרשימה בהצלחה');
    }
};

// בדיקת חיבור לדאטהבייס
const testDatabaseConnection = async () => {
    try {
        const response = await axios.get(`${API_URL}/test`);
        return response.data.message === 'Server is working';
    } catch (error) {
        throw new Error('חיבור לדאטהבייס נכשל');
    }
};

// הרצת כל הבדיקות
const runAllTests = async () => {
    console.log(colors.info, '\n=== מתחיל בדיקות מקיפות ===\n');

    // בדיקת חיבור לדאטהבייס
    await runTest('בדיקת חיבור לדאטהבייס', testDatabaseConnection);

    // בדיקות משימות
    await runTest('יצירת משימה', taskTests.createTask);
    await runTest('קבלת כל המשימות', taskTests.getAllTasks);
    await runTest('עדכון משימה', taskTests.updateTask);

    // בדיקות רשימות משימות
    await runTest('יצירת רשימת משימות', taskListTests.createTaskList);
    await runTest('קבלת כל רשימות המשימות', taskListTests.getAllTaskLists);
    await runTest('הוספת משימה לרשימה', taskListTests.addTaskToList);

    // ניקוי - מחיקת משימת הבדיקה
    await runTest('מחיקת משימה', taskTests.deleteTask);

    console.log(colors.info, '\n=== בדיקות הסתיימו ===\n');
};

// הרצת הבדיקות
runAllTests().catch(console.error);