import { lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ServiceProvider } from './context/ServiceContext';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import {
  FileText,
  Settings,
  BarChart3,
  Bell,
} from 'lucide-react';

// ─── Static imports (small, always-needed components) ────────────────────────
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PlaceholderPage from './components/PlaceholderPage';

// ─── Lazy-loaded page components (code-split per route) ──────────────────────
const Login            = lazy(() => import('./pages/Login'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Customers        = lazy(() => import('./pages/Customers'));
const CreateCustomer   = lazy(() => import('./pages/CreateCustomer'));
const Services         = lazy(() => import('./pages/Services'));
const AddService       = lazy(() => import('./pages/AddService'));
const Bookings         = lazy(() => import('./pages/Bookings'));
const CreateBooking    = lazy(() => import('./pages/CreateBooking'));
const Technicians      = lazy(() => import('./pages/technician/TechnicianList'));
const Tracking         = lazy(() => import('./pages/Tracking'));
const Assignments      = lazy(() => import('./pages/Assignments'));
const CreateAssignment = lazy(() => import('./pages/CreateAssignment'));
const AssignmentWorkflow = lazy(() => import('./pages/AssignmentWorkflow'));
const EditTechnician   = lazy(() => import('./pages/technician/EditTechnician'));
const AddTechnician    = lazy(() => import('./pages/technician/AddTechnician'));
const Attendance       = lazy(() => import('./pages/technician/Attendance'));

// ─── QueryClient (created once outside the component) ────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// ─── Suspense fallback ────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg-primary, #0f172a)',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '4px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function App() {
  /**
   * useCallback — memoises the PlaceholderPage factory so a new element is
   * NOT created on every render; the dependencies are icon + strings which
   * are stable references from the module scope.
   */
  const makePlaceholder = useCallback(
    (title, description, Icon) => (
      <PlaceholderPage title={title} description={description} icon={Icon} />
    ),
    [] // stable — icon components & strings from module scope never change
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Toaster position="top-right" />
            <ServiceProvider>
              <SearchProvider>
                {/* Suspense wraps all lazy routes with a single spinner fallback */}
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="/"                              element={<Dashboard />} />
                      <Route path="/customers"                     element={<Customers />} />
                      <Route path="/customers/create"              element={<CreateCustomer />} />
                      <Route path="/customers/edit/:id"            element={<CreateCustomer />} />
                      <Route path="/services"                      element={<Services />} />
                      <Route path="/services/create"               element={<AddService />} />
                      <Route path="/bookings"                      element={<Bookings />} />
                      <Route path="/bookings/create"               element={<CreateBooking />} />
                      <Route path="/bookings/edit/:id"             element={<CreateBooking />} />
                      <Route path="/tracking"                      element={<Tracking />} />
                      <Route path="/assignments"                   element={<Assignments />} />
                      <Route path="/assignments/create"            element={<CreateAssignment />} />
                      <Route path="/assignments/:id/workflow"      element={<AssignmentWorkflow />} />
                      <Route path="/technicians"                   element={<Technicians />} />
                      <Route path="/technician/:id"                element={<EditTechnician />} />
                      <Route path="/technicians/addtechnician"     element={<AddTechnician />} />
                      <Route path="/attendance/:id"                element={<Attendance />} />

                      {/* Placeholder pages (memoised via useCallback) */}
                      <Route path="/reports"       element={makePlaceholder('Reports',       'Generate and view detailed business reports and analytics.', FileText)} />
                      <Route path="/analytics"     element={makePlaceholder('Analytics',     'Deep dive into your business metrics and insights.',          BarChart3)} />
                      <Route path="/notifications" element={makePlaceholder('Notifications', 'Manage system notifications and alerts.',                     Bell)} />
                      <Route path="/settings"      element={makePlaceholder('Settings',      'Configure your application settings and preferences.',        Settings)} />
                    </Route>
                  </Routes>
                </Suspense>
              </SearchProvider>
            </ServiceProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
        
  );
}

export default App;
