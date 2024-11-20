import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // שינוי כאן
import axios from 'axios';

const AuthContext = createContext();
const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000; // 5 דקות במילישניות

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token); // שינוי כאן
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime + TOKEN_EXPIRY_THRESHOLD / 1000;
        } catch (error) {
            return true;
        }
    };

    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    };

    const checkAuthStatus = async (token) => {
        try {
            const response = await axios.get(process.env.REACT_APP_API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data);
            setAuthToken(token);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setError('פג תוקף החיבור, אנא התחבר מחדש');
            setCurrentUser(null);
        }
    };

    // בדיקת טוקן בטעינה ראשונית
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                if (isTokenExpired(token)) {
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                } else {
                    await checkAuthStatus(token);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // הרשמה
    const register = async (userData) => {
        try {
            setError(null);
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);
            const { token, user } = response.data;
            setCurrentUser(user);
            setAuthToken(token);
            return user;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה בתהליך ההרשמה';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // התחברות
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = response.data;
            setCurrentUser(user);
            setAuthToken(token);
            return user;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה בהתחברות';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // התנתקות
    const logout = () => {
        setCurrentUser(null);
        setAuthToken(null);
        setError(null);
    };

    // עדכון פרטי משתמש
    const updateProfile = async (userData) => {
        try {
            setError(null);
            const response = await axios.patch('http://localhost:5000/api/auth/profile', userData);
            setCurrentUser(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה בעדכון הפרופיל';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // שינוי סיסמה
    const changePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            await axios.post('http://localhost:5000/api/auth/change-password', {
                currentPassword,
                newPassword
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה בשינוי הסיסמה';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // איפוס סיסמה
    const resetPassword = async (email) => {
        try {
            setError(null);
            await axios.post('http://localhost:5000/api/auth/reset-password', { email });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה באיפוס הסיסמה';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth חייב להיות בתוך AuthProvider');
    }
    return context;
}