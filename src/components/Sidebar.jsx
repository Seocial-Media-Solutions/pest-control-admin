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

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Customers', path: '/customers' },
        { icon: Bug, label: 'Services', path: '/services' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: ClipboardList, label: 'Assignments', path: '/assignments' },
        { icon: MapPin, label: 'Tracking', path: '/tracking' },
        { icon: Shield, label: 'Technicians', path: '/technicians' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-transparent backdrop-blur-sm  lg:bg-black/50 z-40 md:hidden animate-fade-in"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-72 bg-dark-surface lg:bg-dark-surface/90 lg:backdrop-blur-xl border-r border-dark-border flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
            >
                {/* Header */}
                <div className="p-6 border-b border-dark-border">
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
                                    ? 'bg-primary-500/10 text-primary-400 before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-primary-500 before:to-accent-500'
                                    : 'text-dark-text-secondary hover:bg-dark-surface-hover hover:text-dark-text'
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
                <div className="p-4 border-t border-dark-border">
                    <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-surface-hover transition-colors duration-200">
                        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            AD
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-dark-text">
                                Admin User
                            </div>
                            <div className="text-xs text-dark-text-tertiary">
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
