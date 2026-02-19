import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-light-bg dark:bg-dark-bg transition-colors duration-300 relative selection:bg-primary-500 selection:text-white">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <Header toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="flex-1 w-full pt-[70px] md:ml-72 p-4 sm:p-6 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
