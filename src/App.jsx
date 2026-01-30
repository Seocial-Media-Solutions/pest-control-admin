import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CreateCustomer from './pages/CreateCustomer';

import Services from './pages/Services';
import AddService from './pages/AddService';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import Technicians from './pages/technician/technicianList';
import Tracking from './pages/Tracking';
import Assignments from './pages/Assignments';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentWorkflow from './pages/AssignmentWorkflow';

import PlaceholderPage from './components/PlaceholderPage';
import {
  Bug,
  Calendar,
  MapPin,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Shield,
} from 'lucide-react';
import EditTechnician from './pages/technician/EditTechnician';
import AddTechnician from './pages/technician/AddTechnician';
import { Toaster } from 'react-hot-toast';
import Attendance from './pages/technician/attendance';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Toaster position="top-right" />
          <div className="min-h-screen bg-dark-bg dark:bg-dark-bg light:bg-light-bg">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <Header toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main className="pt-[70px] md:ml-72 p-6 min-h-screen">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/create" element={<CreateCustomer />} />
                <Route path="/customers/edit/:id" element={<CreateCustomer />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/create" element={<AddService />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/create" element={<CreateBooking />} />
                <Route path="/bookings/edit/:id" element={<CreateBooking />} />
                <Route
                  path="/tracking"
                  element={<Tracking />}
                />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/assignments/create" element={<CreateAssignment />} />
                <Route path="/assignments/:id/workflow" element={<AssignmentWorkflow />} />
                <Route path="/technicians" element={<Technicians />} />
                <Route path="/technician/:id" element={<EditTechnician />} />
                <Route path="/technicians/addtechnician" element={<AddTechnician />} />
                <Route path="/attendance/:id" element={<Attendance />} />
                <Route
                  path="/reports"
                  element={
                    <PlaceholderPage
                      title="Reports"
                      description="Generate and view detailed business reports and analytics."
                      icon={FileText}
                    />
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <PlaceholderPage
                      title="Analytics"
                      description="Deep dive into your business metrics and insights."
                      icon={BarChart3}
                    />
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PlaceholderPage
                      title="Notifications"
                      description="Manage system notifications and alerts."
                      icon={Bell}
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PlaceholderPage
                      title="Settings"
                      description="Configure your application settings and preferences."
                      icon={Settings}
                    />
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
