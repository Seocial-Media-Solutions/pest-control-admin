import { Menu, Search, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
    const { isDark, toggleTheme } = useTheme();
    const { searchQuery, setSearchQuery } = useSearch();
    const { user, logout } = useAuth();
    const [notifications] = useState(3);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 md:left-72 right-0 h-[70px] border-b flex items-center justify-between px-4 sm:px-6 z-30 transition-all duration-300 ${isDark
                ? 'bg-dark-surface border-dark-border'
                : 'bg-white border-light-border'
                }`}>
                {/* Left Section */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1">
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
                    <div className="relative max-w-md flex-1">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDark ? 'text-dark-text-tertiary' : 'text-light-text-tertiary'
                            }`} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-all duration-200 ${isDark
                                ? 'bg-dark-bg border-dark-border text-dark-text placeholder:text-dark-text-tertiary focus:border-primary-500'
                                : 'bg-white border-light-border text-light-text placeholder:text-light-text-tertiary focus:border-primary-500'
                                } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle Removed */}

                    {/* Notifications */}
                    <button className={`hidden lg:block relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${isDark
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
                        <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                            {user?.name ? user.name.substring(0, 2) : 'AD'}
                        </div>
                        <div className="hidden lg:block">
                            <div className={`text-sm font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'
                                }`}>
                                {user?.name || 'Admin User'}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-dark-text-tertiary' : 'text-light-text-tertiary'
                                }`}>
                                {user?.role || 'Administrator'}
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogoutClick}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${isDark
                            ? 'hover:bg-red-500/10 text-dark-text hover:text-red-500'
                            : 'hover:bg-red-500/10 text-light-text hover:text-red-600'
                            }`}
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 transform transition-all scale-100 ${isDark ? 'bg-dark-surface border border-dark-border' : 'bg-white'
                        }`}>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>Confirm Logout</h3>
                                <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                                    Are you sure you want to end your session?
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark
                                        ? 'bg-dark-bg text-dark-text hover:bg-dark-surface-hover'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default Header;
