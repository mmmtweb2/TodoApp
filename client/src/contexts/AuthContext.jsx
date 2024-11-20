// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { auth as authApi } from '../services/api';
import config from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuthStatus = async (token) => {
        try {
            const response = await authApi.getMe();
            setCurrentUser(response.data);
            setAuthToken(token);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem(config.TOKEN_KEY);
            setError('פג תוקף החיבור, אנא התחבר מחדש');
            setCurrentUser(null);
        }
    };

    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem(config.TOKEN_KEY, token);
        } else {
            localStorage.removeItem(config.TOKEN_KEY);
        }
    };

    // בדיקת טוקן בטעינה ראשונית
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem(config.TOKEN_KEY);
            if (token) {
                await checkAuthStatus(token);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authApi.register(userData);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'שגיאה בתהליך ההרשמה';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authApi.login(email, password);
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

    const logout = () => {
        setCurrentUser(null);
        setAuthToken(null);
        setError(null);
    };

    const value = {
        currentUser,
        loading,
        error,
        register,
        login,
        logout
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