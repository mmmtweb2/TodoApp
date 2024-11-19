import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, resetPassword } = useAuth();  // הוספנו resetPassword כאן
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            // ניווט לדף הקודם או לדף הבית
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleResetPassword = async () => {
        if (!formData.email) {
            setError('אנא הכנס כתובת אימייל לאיפוס הסיסמה');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(formData.email);
            alert('הוראות לאיפוס הסיסמה נשלחו לאימייל שלך');
        } catch (err) {
            setError('שגיאה בשליחת בקשת איפוס הסיסמה');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        ברוכים השבים!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        טוב לראות אותך שוב
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                אימייל
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border
                                         border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none
                                         focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="כתובת אימייל"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">
                                סיסמה
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border
                                         border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none
                                         focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="סיסמה"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-0 pl-3 flex items-center"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                                זכור אותי
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={handleResetPassword}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            שכחת סיסמה?
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent
                                     text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                     disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'התחבר'
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-2 text-center text-sm text-gray-600">
                    עדיין אין לך חשבון?{' '}
                    <button
                        onClick={handleRegisterClick}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        הירשם עכשיו
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;