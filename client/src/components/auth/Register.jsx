import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: null
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/app');
        } catch (err) {
            setError(err.message);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.name) {
            setError('אנא הכנס את שמך');
            return;
        }
        if (step === 2 && !formData.email) {
            setError('אנא הכנס כתובת אימייל');
            return;
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                {/* התקדמות */}
                <div className="flex justify-between mb-8">
                    {[1, 2, 3].map((stepNumber) => (
                        <div
                            key={stepNumber}
                            className={`w-8 h-8 rounded-full flex items-center justify-center
                                ${step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {stepNumber}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-center">ברוך הבא!</h2>
                            <p className="text-gray-600 text-center">איך נוכל לקרוא לך?</p>
                            <input
                                type="text"
                                placeholder="השם שלך"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-center">כמעט סיימנו!</h2>
                            <p className="text-gray-600 text-center">אנחנו צריכים את האימייל שלך</p>
                            <input
                                type="email"
                                placeholder="האימייל שלך"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-center">רק עוד צעד אחד!</h2>
                            <p className="text-gray-600 text-center">בחר סיסמה חזקה</p>
                            <input
                                type="password"
                                placeholder="הסיסמה שלך"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <div className="text-sm text-gray-500">
                                הסיסמה חייבת להכיל לפחות 6 תווים
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-center text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                חזור
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600 transition-colors mr-auto"
                            >
                                המשך
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600 transition-colors mr-auto"
                            >
                                סיום הרשמה
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    כבר יש לך חשבון?{' '}
                    <button className="text-blue-500 hover:underline">
                        התחבר כאן
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;