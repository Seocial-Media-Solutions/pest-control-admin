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
        <div className="min-h-screen bg-light-bg dark:bg-light-bg transition-colors duration-300 relative selection:bg-primary-500 selection:text-white flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
                <Header toggleSidebar={toggleSidebar} />

                {/* Main Content */}
                <main className="flex-1 pt-[90px] px-4 pb-8 sm:pr-4 sm:pl-4 md:pr-4 md:pl-[18rem] lg:pr-6 lg:pl-[19rem] w-full max-w-[100vw] mx-auto transition-all duration-300 overflow-x-hidden">
                    <div className="w-full max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
