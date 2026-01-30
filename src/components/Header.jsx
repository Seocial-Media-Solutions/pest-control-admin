import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ toggleSidebar }) => {
    const { isDark, toggleTheme } = useTheme();
    const [notifications] = useState(3);

    return (
        <header className={`fixed top-0 left-0 md:left-72 right-0 h-[70px] border-b flex items-center justify-between px-6 z-30 transition-all duration-300 ${isDark
                ? 'bg-dark-surface border-dark-border'
                : 'bg-light-surface border-light-border'
            }`}>
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${isDark
                            ? 'hover:bg-dark-surface-hover text-dark-text'
                            : 'hover:bg-light-surface-hover text-light-text'
                        }`}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Search Bar */}
                <div className="relative max-w-md flex-1 hidden sm:block">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDark ? 'text-dark-text-tertiary' : 'text-light-text-tertiary'
                        }`} />
                    <input
                        type="text"
                        placeholder="Search customers, bookings, services..."
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-all duration-200 ${isDark
                                ? 'bg-dark-bg border-dark-border text-dark-text placeholder:text-dark-text-tertiary focus:border-primary-500'
                                : 'bg-white border-light-border text-light-text placeholder:text-light-text-tertiary focus:border-primary-500'
                            } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${isDark
                            ? 'hover:bg-dark-surface-hover hover:text-primary-400 text-dark-text'
                            : 'hover:bg-light-surface-hover hover:text-primary-600 text-light-text'
                        }`}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${isDark
                        ? 'hover:bg-dark-surface-hover hover:text-primary-400 text-dark-text'
                        : 'hover:bg-light-surface-hover hover:text-primary-600 text-light-text'
                    }`}>
                    <Bell className="w-5 h-5" />
                    {notifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                            {notifications}
                        </span>
                    )}
                </button>

                {/* Divider */}
                <div className={`w-px h-8 hidden sm:block ${isDark ? 'bg-dark-border' : 'bg-light-border'
                    }`} />

                {/* User Profile */}
                <div className={`hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${isDark ? 'hover:bg-dark-surface-hover' : 'hover:bg-light-surface-hover'
                    }`}>
                    <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                        AD
                    </div>
                    <div className="hidden lg:block">
                        <div className={`text-sm font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'
                            }`}>
                            Admin User
                        </div>
                        <div className={`text-xs ${isDark ? 'text-dark-text-tertiary' : 'text-light-text-tertiary'
                            }`}>
                            Administrator
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
