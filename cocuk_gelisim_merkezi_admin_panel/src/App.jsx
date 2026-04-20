import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplicationsTab from './components/ApplicationsTab';
import ArchivedApplicationsTab from './components/ArchivedApplicationsTab';
import KreslerTab from './components/KreslerTab';
import AdminManagement from './pages/AdminManagement';

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated() ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="applications" replace />} />
                    <Route path="applications" element={<ApplicationsTab />} />
                    <Route path="archived" element={<ArchivedApplicationsTab />} />
                    <Route path="kresler" element={<KreslerTab isSuperAdmin={true} />} />
                    <Route path="admins" element={<AdminManagement />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
