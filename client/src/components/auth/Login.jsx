// components/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
            if (location.state.email) {
                setFormData(prev => ({ ...prev, email: location.state.email }));
            }
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const validateForm = () => {
        const newErrors = [];

        // בדיקת אימייל
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.push('כתובת האימייל אינה תקינה');
        }

        // בדיקת סיסמה
        if (!formData.password) {
            newErrors.push('נא להזין סיסמה');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            console.log('Attempting login...');

            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.data?.message) {
                setErrors([err.response.data.message]);
            } else if (err.message.includes('401')) {
                setErrors(['פרטי ההתחברות שגויים']);
            } else {
                setErrors(['אירעה שגיאה בהתחברות, אנא נסה שוב']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // ניקוי שגיאות בעת הקלדה
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        התחברות למערכת
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        אין לך חשבון?{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            הירשם כאן
                        </Link>
                    </p>
                </div>

                {/* הצגת שגיאות */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="mr-3">
                                <div className="text-sm text-red-700">
                                    <ul className="list-disc list-inside">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* הודעת הצלחה */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
                        {success}
                    </div>
                )}

                {/* טופס התחברות */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                כתובת אימייל
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-1"
                                placeholder="your@email.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                סיסמה
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-1"
                                placeholder="הכנס סיסמה"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'מתחבר...' : 'התחברות'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/forgot-password"
                            className="font-medium text-blue-600 hover:text-blue-500 text-sm"
                        >
                            שכחת סיסמה?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;