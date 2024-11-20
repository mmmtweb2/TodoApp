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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // בדיקות ולידציה
        if (formData.password !== formData.confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }

        if (formData.password.length < 6) {
            setError('הסיסמה חייבת להכיל לפחות 6 תווים');
            return;
        }

        try {
            setIsLoading(true);
            console.log('Attempting registration with:', {
                name: formData.name,
                email: formData.email
            });

            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            // הצגת הודעת הצלחה
            setSuccess('ההרשמה בוצעה בהצלחה! מעביר אותך להתחברות...');

            // המתנה קצרה לפני הניווט
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
            setError(err.message || 'שגיאה בתהליך ההרשמה');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        הרשמה למערכת
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-500 p-3 rounded-lg text-center">
                        {success}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">שם מלא</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="שם מלא"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">אימייל</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="כתובת אימייל"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">סיסמה</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="סיסמה"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">אימות סיסמה</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="אימות סיסמה"
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

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            כבר יש לך חשבון? התחבר כאן
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;