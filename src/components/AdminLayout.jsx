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
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <Header toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="pt-[70px] md:ml-72 p-6 min-h-screen transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
