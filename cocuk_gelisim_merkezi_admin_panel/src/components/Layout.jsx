import { useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Building2,
  Archive,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { logout, getUser } from '../services/auth';

import atakumLogo from '../assets/atakum-logo.png';

export default function Layout({ children, isSuperAdmin }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'applications', label: 'Başvurular', icon: Users, description: 'Aktif başvuru yönetimi', path: '/dashboard/applications' },
    { id: 'archived', label: 'Arşiv', icon: Archive, description: 'Geçmiş kayıtlar', path: '/dashboard/archived' },
    { id: 'kresler', label: 'Çocuk Gelişim Merkezleri', icon: Building2, description: 'Çocuk gelişim merkezleri ve kontenjanlar', path: '/dashboard/kresler' },
    ...(isSuperAdmin ? [{ id: 'admins', label: 'Yöneticiler', icon: ShieldCheck, description: 'Yetki yönetimi', path: '/dashboard/admins' }] : [])
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        İçeriğe atla
      </a>
      {/* Sidebar */}
      <aside
        aria-label="Yönetim menüsü"
        className={`fixed lg:relative inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out border-r border-slate-100 bg-white shadow-xl flex flex-col h-screen group/sidebar
          ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'} 
        `}
      >
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-9 z-50 hidden lg:flex h-7 w-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all hover:scale-110"
          title={isSidebarOpen ? "Menüyü Daralt" : "Menüyü Genişlet"}
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        {/* Logo Area */}
        <div className={`h-20 flex items-center ${isSidebarOpen ? 'justify-between px-6' : 'justify-center'} border-b border-slate-100`}>
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src={atakumLogo} alt="Atakum Logo" className="w-full h-full object-contain" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="font-bold text-base tracking-tight text-slate-800 leading-tight">Çocuk Gelişim Merkezi Yönetim</span>
                <span className="text-xs font-medium text-slate-500 tracking-wider uppercase">Paneli</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto overflow-x-hidden" aria-label="Ana menü">
          {isSidebarOpen && (
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 animate-in fade-in duration-300">
              Ana Menü
            </div>
          )}
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              title={!isSidebarOpen ? item.label : ''}
              className={({ isActive }) => `flex items-center ${isSidebarOpen ? 'gap-4 px-4' : 'justify-center px-2'} py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl" />
                  )}
                  <item.icon
                    size={20}
                    className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                  />
                  {isSidebarOpen && (
                    <div className="flex-1 animate-in fade-in duration-300 overflow-hidden">
                      <div className="font-semibold text-sm truncate">{item.label}</div>
                      <div className={`text-xs mt-0.5 truncate transition-colors ${isActive ? 'text-blue-400/80' : 'text-slate-400 group-hover:text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  {isSidebarOpen && isActive && <ChevronRight size={16} className="text-blue-500 animate-in fade-in duration-300" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t border-slate-100 bg-slate-50/50 ${!isSidebarOpen && 'flex flex-col items-center gap-3'}`}>
          {isSidebarOpen ? (
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 mb-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 border-2 border-white shadow-sm shrink-0">
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSuperAdmin ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                    {isSuperAdmin ? 'Süper Yönetici' : 'Birim Yöneticisi'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-sm font-bold text-slate-600 border-2 border-white shadow-sm cursor-pointer" title={user?.username || 'Admin'}>
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center justify-center ${isSidebarOpen ? 'w-full gap-2 px-4' : 'w-10 h-10'} py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 group`}
            title="Oturumu Kapat"
          >
            <LogOut size={isSidebarOpen ? 16 : 20} className="group-hover:-translate-x-0.5 transition-transform" />
            {isSidebarOpen && "Oturumu Kapat"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 transition-all duration-300 w-full`}>
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-8 z-40 sticky top-0 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {menuItems.find(i => location.pathname.includes(i.path))?.label || 'Panel'}
            </h1>
          </div>

          {/* Right Side - Empty for now as per request (Search & Bell removed) */}
          <div className="flex items-center gap-3">
            {/* Future: Add meaningful actions here if needed */}
          </div>
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
        >
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
