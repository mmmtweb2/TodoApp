// components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    // פונקציה לבדיקת תקינות הקלט
    const validateForm = () => {
        const newErrors = [];

        // בדיקת שם
        if (formData.name.length < 2) {
            newErrors.push('שם חייב להכיל לפחות 2 תווים');
        }

        // בדיקת אימייל
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.push('כתובת האימייל אינה תקינה');
        }

        // בדיקת סיסמה
        if (formData.password.length < 6) {
            newErrors.push('הסיסמה חייבת להכיל לפחות 6 תווים');
        }

        if (!/\d/.test(formData.password)) {
            newErrors.push('הסיסמה חייבת להכיל לפחות ספרה אחת');
        }

        if (!/[A-Za-z]/.test(formData.password)) {
            newErrors.push('הסיסמה חייבת להכיל לפחות אות אחת באנגלית');
        }

        // בדיקת אימות סיסמה
        if (formData.password !== formData.confirmPassword) {
            newErrors.push('הסיסמאות אינן תואמות');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSuccess('');

        // בדיקת תקינות
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            console.log('Attempting registration...');

            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setSuccess('ההרשמה בוצעה בהצלחה! מעביר אותך להתחברות...');

            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'ההרשמה הושלמה בהצלחה, אנא התחבר עם פרטי החשבון שלך',
                        email: formData.email
                    }
                });
            }, 2000);

        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data?.message) {
                setErrors([err.response.data.message]);
            } else if (err.message.includes('duplicate key error')) {
                setErrors(['כתובת האימייל כבר קיימת במערכת']);
            } else {
                setErrors(['אירעה שגיאה בתהליך ההרשמה, אנא נסה שוב']);
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
                        הרשמה למערכת
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        כבר יש לך חשבון?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            התחבר כאן
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
                                <h3 className="text-sm font-medium text-red-800">
                                    נמצאו {errors.length} שגיאות בטופס
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
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

                {/* טופס הרשמה */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                שם מלא
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-1"
                                placeholder="הכנס שם מלא"
                            />
                        </div>

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
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                הסיסמה חייבת להכיל לפחות 6 תווים, ספרה אחת ואות אחת באנגלית
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                אימות סיסמה
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-1"
                                placeholder="הכנס את הסיסמה שנית"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'מבצע רישום...' : 'הרשמה'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;