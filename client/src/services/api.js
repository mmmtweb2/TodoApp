// src/services/api.js
import axios from 'axios';
import config from '../config';

// יצירת מופע axios עם הגדרות בסיסיות
const api = axios.create({
    baseURL: config.API_URL,
    timeout: 5000
});

// הוספת טוקן לכל בקשה
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Sending request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
    });
    return config;
}, error => {
    return Promise.reject(error);
});

// טיפול בתשובות ושגיאות
api.interceptors.response.use(
    response => {
        console.log('Response received:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location = '/login';
        }
        return Promise.reject(error);
    }
);

// אובייקט המכיל את כל הפעולות מול השרת
export const tasks = {
    // קבלת כל המשימות
    async getAll() {
        try {
            console.log('Fetching all tasks...');
            const response = await api.get(config.ENDPOINTS.TASKS.BASE);
            console.log('Tasks fetched:', response.data);
            return response;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    // קבלת משימות משותפות
    async getSharedWithMe() {
        try {
            const response = await api.get(config.ENDPOINTS.TASKS.SHARED);
            return response;
        } catch (error) {
            console.error('Error fetching shared tasks:', error);
            throw error;
        }
    },

    // יצירת משימה חדשה
    async create(taskData) {
        try {
            const response = await api.post(config.ENDPOINTS.TASKS.BASE, taskData);
            return response;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // עדכון משימה
    async update(id, taskData) {
        try {
            const response = await api.patch(config.ENDPOINTS.TASKS.UPDATE(id), taskData);
            return response;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // מחיקת משימה
    async delete(id) {
        try {
            const response = await api.delete(config.ENDPOINTS.TASKS.DELETE(id));
            return response;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // שיתוף משימה
    async shareTask(taskId, shareData) {
        try {
            const response = await api.post(config.ENDPOINTS.TASKS.SHARE(taskId), shareData);
            return response;
        } catch (error) {
            console.error('Error sharing task:', error);
            throw error;
        }
    },

    // עדכון הרשאות שיתוף
    async updateTaskShare(taskId, userId, permission) {
        try {
            const response = await api.patch(
                `${config.ENDPOINTS.TASKS.SHARE(taskId)}/${userId}`,
                { permission }
            );
            return response;
        } catch (error) {
            console.error('Error updating share permissions:', error);
            throw error;
        }
    },

    // הסרת שיתוף
    async removeTaskShare(taskId, userId) {
        try {
            const response = await api.delete(
                `${config.ENDPOINTS.TASKS.SHARE(taskId)}/${userId}`
            );
            return response;
        } catch (error) {
            console.error('Error removing share:', error);
            throw error;
        }
    }
};

// פעולות אימות
export const auth = {
    // התחברות
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            console.log('API registration response:', response.data);
            return response;
        } catch (error) {
            console.error('API registration error:', error.response?.data || error);
            throw error;
        }
    },

    // הרשמה
    async register(userData) {
        try {
            const response = await api.post(config.ENDPOINTS.AUTH.REGISTER, userData);
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // קבלת פרטי המשתמש הנוכחי
    async getMe() {
        try {
            const response = await api.get(config.ENDPOINTS.AUTH.ME);
            return response;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    },

    // עדכון פרטי משתמש
    async updateProfile(userData) {
        try {
            const response = await api.patch('/auth/profile', userData);
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // חיפוש משתמשים (לצורך שיתוף)
    async searchUsers(query) {
        try {
            const response = await api.get(`/auth/users/search?query=${query}`);
            return response;
        } catch (error) {
            console.error('Search users error:', error);
            throw error;
        }
    }
};

export default api;