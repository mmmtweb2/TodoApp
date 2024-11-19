// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 5000
});

// לוג מפורט של הבקשות
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
    console.error('Request error:', error);
    return Promise.reject(error);
});

// טיפול בשגיאות
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
            status: error.response?.status,
            config: error.config
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location = '/login';
        }
        return Promise.reject(error);
    }
);

export const tasks = {
    async getAll() {
        try {
            console.log('Fetching all tasks...');
            const response = await api.get('/tasks');
            console.log('GetAll tasks response:', response.data);
            return response;
        } catch (error) {
            console.error('GetAll tasks error:', error);
            throw error;
        }
    },

    async getSharedWithMe() {
        try {
            console.log('Fetching shared tasks...');
            const response = await api.get('/tasks/shared-with-me');
            console.log('GetSharedWithMe response:', response.data);
            return response;
        } catch (error) {
            console.error('GetSharedWithMe error:', error);
            throw error;
        }
    },

    async create(taskData) {
        try {
            console.log('Creating task with data:', taskData);
            const response = await api.post('/tasks', taskData);
            console.log('Create task response:', response.data);
            return response;
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        }
    },

    async update(id, taskData) {
        try {
            console.log(`Updating task ${id} with data:`, taskData);
            const response = await api.patch(`/tasks/${id}`, taskData);
            console.log('Update task response:', response.data);
            return response;
        } catch (error) {
            console.error('Update task error:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            console.log(`Deleting task ${id}`);
            const response = await api.delete(`/tasks/${id}`);
            console.log('Delete task response:', response.data);
            return response;
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        }
    },

    async shareTask(taskId, shareData) {
        try {
            console.log(`Sharing task ${taskId} with:`, shareData);
            const response = await api.post(`/tasks/${taskId}/share`, shareData);
            console.log('Share task response:', response.data);
            return response;
        } catch (error) {
            console.error('Share task error:', error);
            throw error;
        }
    },

    async updateTaskShare(taskId, userId, permission) {
        try {
            console.log(`Updating share permissions for task ${taskId}, user ${userId}:`, permission);
            const response = await api.patch(`/tasks/${taskId}/share/${userId}`, { permission });
            console.log('Update task share response:', response.data);
            return response;
        } catch (error) {
            console.error('Update task share error:', error);
            throw error;
        }
    },

    async removeTaskShare(taskId, userId) {
        try {
            console.log(`Removing share for task ${taskId}, user ${userId}`);
            const response = await api.delete(`/tasks/${taskId}/share/${userId}`);
            console.log('Remove task share response:', response.data);
            return response;
        } catch (error) {
            console.error('Remove task share error:', error);
            throw error;
        }
    },

    async checkPermissions(taskId) {
        try {
            console.log(`Checking permissions for task ${taskId}`);
            const response = await api.get(`/auth/check-permission/${taskId}`);
            console.log('Check permissions response:', response.data);
            return response;
        } catch (error) {
            console.error('Check permissions error:', error);
            throw error;
        }
    }
};

export const auth = {
    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            const response = await api.post('/auth/login', { email, password });
            console.log('Login response received');
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            console.log('Attempting registration for:', userData.email);
            const response = await api.post('/auth/register', userData);
            console.log('Registration response received');
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async getMe() {
        try {
            console.log('Fetching current user data');
            const response = await api.get('/auth/me');
            console.log('GetMe response received');
            return response;
        } catch (error) {
            console.error('GetMe error:', error);
            throw error;
        }
    },

    async updateProfile(userData) {
        try {
            console.log('Updating user profile');
            const response = await api.patch('/auth/profile', userData);
            console.log('Update profile response received');
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    async searchUsers(query) {
        try {
            console.log('Searching users with query:', query);
            const response = await api.get(`/auth/users/search?query=${query}`);
            console.log('Search users response:', response.data);
            return response;
        } catch (error) {
            console.error('Search users error:', error);
            throw error;
        }
    }
};

export default api;