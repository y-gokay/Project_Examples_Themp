import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { KeyProvider } from './context/KeyContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './context/ThemeContext';
import PsychologistLayout from './components/psychologist/PsychologistLayout';

// Public
import LandingPage from './pages/LandingPage';
import PsychologistListPage from './pages/PsychologistListPage';
import PsychologistDetailPage from './pages/PsychologistDetailPage';
import BlogListPage from './pages/blog/BlogListPage';
import BlogDetailPage from './pages/blog/BlogDetailPage';
import FAQPage from './pages/FAQPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import KVKKPage from './pages/KVKKPage';

// Vatandaş
import UserDashboard from './pages/user/UserDashboard';
import AccountPage from './pages/user/AccountPage';

// Psikolog
import PsychologistDashboard from './pages/psychologist/PsychologistDashboard';
import AvailabilityPage from './pages/psychologist/AvailabilityPage';
import PatientsPage from './pages/psychologist/PatientsPage';
import PatientNotesPage from './pages/psychologist/PatientNotesPage';
import HistoryPage from './pages/psychologist/HistoryPage';
import ProfileEditPage from './pages/psychologist/ProfileEditPage';
import MyBlogPage from './pages/psychologist/MyBlogPage';
import BlogEditPage from './pages/psychologist/BlogEditPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

const PsyRoute = ({ children }) => (
  <ProtectedRoute roles={['psychologist']}>{children}</ProtectedRoute>
);

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <KeyProvider>
            <div className="min-h-screen flex flex-col transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/psikologlar" element={<PsychologistListPage />} />
                  <Route path="/psikologlar/:id" element={<PsychologistDetailPage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/sss" element={<FAQPage />} />
                  <Route path="/giris" element={<LoginPage />} />
                  <Route path="/kayit" element={<RegisterPage />} />
                  <Route path="/kvkk" element={<KVKKPage />} />
                  <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
                  <Route path="/sifre-sifirla/:token" element={<ResetPasswordPage />} />

                  <Route path="/login" element={<Navigate to="/giris" replace />} />
                  <Route path="/register" element={<Navigate to="/kayit" replace />} />

                  {/* Vatandaş */}
                  <Route
                    path="/randevularim"
                    element={<ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/hesabim"
                    element={<ProtectedRoute roles={['user']}><AccountPage /></ProtectedRoute>}
                  />

                  {/* Psikolog — PsychologistLayout ile sarılı */}
                  <Route
                    element={
                      <PsyRoute>
                        <PsychologistLayout />
                      </PsyRoute>
                    }
                  >
                    <Route path="/psikolog/panel" element={<PsychologistDashboard />} />
                    <Route path="/psikolog/gecmis" element={<HistoryPage />} />
                    <Route path="/psikolog/musaitlik" element={<AvailabilityPage />} />
                    <Route path="/psikolog/hastalar" element={<PatientsPage />} />
                    <Route path="/psikolog/hastalar/:userId/notlar" element={<PatientNotesPage />} />
                    <Route path="/profilim" element={<ProfileEditPage />} />
                    <Route path="/yazilarim" element={<MyBlogPage />} />
                    <Route path="/yazilarim/yeni" element={<BlogEditPage />} />
                    <Route path="/yazilarim/:id/duzenle" element={<BlogEditPage />} />
                  </Route>

                  {/* Admin */}
                  <Route
                    path="/admin"
                    element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
                  />

                  <Route
                    path="/yetkisiz"
                    element={
                      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
                        Bu sayfaya erişim yetkiniz bulunmuyor.
                      </div>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0b1f22',
                  color: '#eaf4f4',
                  border: '1px solid rgba(40,184,180,0.2)',
                },
              }}
            />
          </KeyProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
