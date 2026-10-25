import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from '../components/NotificationDropdown';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  Clock,
  UserCheck,
  Users,
  CalendarCheck,
  FileText,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Stethoscope,
  Shield,
  ChevronRight,
} from 'lucide-react';

export default function DashboardLayout({ children, role: requiredRole }) {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const doctorNav = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Availability & Slots', path: '/doctor/availability', icon: Clock },
    { name: 'Leaves & Holidays', path: '/doctor/leaves', icon: CalendarCheck },
    { name: 'Doctor Profile', path: '/doctor/profile', icon: Stethoscope },
  ];

  const adminNav = [
    { name: 'Overview & Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Doctor Approvals', path: '/admin/doctors', icon: UserCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'All Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Audit Trail', path: '/admin/audit-logs', icon: FileText },
  ];

  const patientNav = [
    { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Find Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'My Health Profile', path: '/patient/profile', icon: Users },
  ];

  const currentNav = role === 'ADMIN' ? adminNav : role === 'DOCTOR' ? doctorNav : patientNav;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex transition-colors">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 glass-header bg-white dark:bg-navy-900 border-r border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
                  Medi<span className="text-brand-600 dark:text-brand-400">Book</span>
                </span>
                <span className="block text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  {role} Portal
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-600 to-teal-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-800/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-header bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-brand-600">MediBook</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize">{role?.toLowerCase()} Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
