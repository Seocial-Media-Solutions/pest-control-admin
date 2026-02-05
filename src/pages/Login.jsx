import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, verifyOtp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // Steps: 'credentials' | 'otp'
    const [step, setStep] = useState('credentials');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login({ email, password });

            if (result.requireOtp) {
                setStep('otp');
                toast.success(result.message);
            } else {
                // Direct login success (fallback)
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error('Login Error Details:', err);
            if (!err.response) {
                setError('Network error: Unable to connect to server. Please check if the backend is running.');
            } else {
                setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verifyOtp({ email, otp });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-xl animate-fade-in relative overflow-hidden transition-colors duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-4 text-primary-600 dark:text-primary-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text transition-colors duration-300">Admin Portal</h1>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2 transition-colors duration-300">
                            {step === 'credentials' ? 'Sign in to access your dashboard' : 'Enter the OTP sent to your email'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    {step === 'credentials' ? (
                        <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary transition-colors duration-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary"
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary transition-colors duration-300" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpVerify} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
                                    One-Time Password
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary transition-colors duration-300" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full pl-10 pr-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-center tracking-widest font-mono text-lg placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary"
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-2 text-center transition-colors duration-300">
                                    Please enter the 6-digit code sent to {email}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying OTP...
                                    </>
                                ) : (
                                    'Verify & Login'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('credentials');
                                    setOtp('');
                                    setError('');
                                }}
                                className="w-full text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                ← Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="absolute bottom-6 text-light-text-tertiary dark:text-dark-text-tertiary text-xs transition-colors duration-300">
                © {new Date().getFullYear()} Pest Control Admin. All rights reserved.
            </div>
        </div>
    );
};

export default Login;
