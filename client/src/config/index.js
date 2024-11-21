// src/config/index.js

const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
    // URL בסיסי ל-API
    API_URL: isDevelopment
        ? 'http://localhost:5000/api'
        : 'https://todo-app-lake-mu.vercel.app/',  // החלף בכתובת האמיתית של ה-API שלך

    // הגדרות נוספות שתרצה להוסיף
    APP_NAME: 'Task Management App',
    VERSION: '1.0.0',

    // הגדרות אבטחה
    TOKEN_KEY: 'token',  // המפתח בו נשמור את הטוקן ב-localStorage

    // קונסטנטות של המערכת
    ITEMS_PER_PAGE: 10,
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB

    // נתיבי API
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            VERIFY: '/auth/verify',
            REFRESH: '/auth/refresh',
            ME: '/auth/me'
        },
        TASKS: {
            BASE: '/tasks',
            SHARED: '/tasks/shared-with-me',
            SHARE: (taskId) => `/tasks/${taskId}/share`,
            UPDATE: (taskId) => `/tasks/${taskId}`,
            DELETE: (taskId) => `/tasks/${taskId}`
        }
    }
};

// ולידציה בסיסית של הקונפיגורציה
if (!config.API_URL) {
    throw new Error('API URL is not configured');
}

export default config;