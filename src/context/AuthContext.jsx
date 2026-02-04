import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                // Optional: Verify token with backend
                // await api.get('/auth/me'); 
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Auth verification failed:', error);
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);

            // If OTP is required, return success but don't set user yet
            if (response.data.requireOtp) {
                return { requireOtp: true, email: credentials.email, message: response.data.message };
            }

            // Fallback for direct login (if disabled in future)
            setUserSession(response.data);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const verifyOtp = async (data) => {
        try {
            const response = await api.post('/auth/verify-otp', data);
            setUserSession(response.data);
            return true;
        } catch (error) {
            console.error('OTP Verification error:', error);
            throw error;
        }
    };

    const setUserSession = (data) => {
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success(`Welcome back, ${user.name || 'Admin'}!`);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
