import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Bug,
    Calendar,
    MapPin,
    FileText,
    Settings,
    BarChart3,
    Bell,
    Shield,
    ClipboardList,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { isDark } = useTheme();
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Bug, label: 'Services', path: '/services' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
        { icon: MapPin, label: 'Tracking', path: '/tracking' },
        { icon: Shield, label: 'Technicians', path: '/technicians' },
        // { icon: FileText, label: 'Reports', path: '/reports' },
        // { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        // { icon: Bell, label: 'Notifications', path: '/notifications' },
        // { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-[100dvh] w-72 border-r flex flex-col z-50 transition-all duration-300 ${isDark
                    ? 'bg-dark-surface border-dark-border'
                    : 'bg-white border-light-border'
                    } ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 shadow-xl md:shadow-none`}
            >
                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <Bug className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-extrabold text-gradient">
                            PestControl
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative overflow-hidden group ${isActive
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-primary-500 before:to-accent-500'
                                    : `text-light-text-secondary dark:text-dark-text-secondary ${isDark ? 'hover:bg-dark-surface-hover hover:text-dark-text' : 'hover:bg-light-surface-hover hover:text-light-text'}`
                                }`
                            }
                            onClick={() => window.innerWidth < 768 && toggleSidebar()}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer - User Profile */}
                <div className={`p-4 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isDark
                        ? 'bg-dark-bg hover:bg-dark-surface-hover'
                        : 'bg-light-bg hover:bg-light-surface-hover'
                        }`}>
                        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            AD
                        </div>
                        <div className="flex-1">
                            <div className={`text-sm font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                Admin User
                            </div>
                            <div className={`text-xs ${isDark ? 'text-dark-text-tertiary' : 'text-light-text-tertiary'}`}>
                                Administrator
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
