import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Activity,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Calendar,
  LogOut,
  ShieldAlert,
  Stethoscope,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, isPatient, isDoctor, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass-header bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Medi<span className="text-brand-600 dark:text-brand-400">Book</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest -mt-1">
                Healthcare Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/doctors"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/doctors')
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800/60'
              }`}
            >
              Find Doctors
            </Link>

            {/* Role-specific Nav Items */}
            {isAuthenticated && isPatient && (
              <Link
                to="/patient/appointments"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/patient/appointments')
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800/60'
                }`}
              >
                My Appointments
              </Link>
            )}

            {isAuthenticated && isDoctor && (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/doctor/dashboard')
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800/60'
                  }`}
                >
                  Doctor Dashboard
                </Link>
                <Link
                  to="/doctor/availability"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/doctor/availability')
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800/60'
                  }`}
                >
                  Schedule
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800/60'
                  }`}
                >
                  Admin Console
                </Link>
                <Link
                  to="/admin/doctors"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/doctors')
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-navy-800/60'
                  }`}
                >
                  Approvals
                </Link>
              </>
            )}
          </div>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notification Dropdown (Auth only) */}
            {isAuthenticated && <NotificationDropdown />}

            {/* User Dropdown or Guest Login/Signup */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors border border-slate-200 dark:border-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                    {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline">
                    {user?.fullName || user?.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                        {role}
                      </span>
                    </div>

                    {isPatient && (
                      <Link
                        to="/patient/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>
                    )}

                    {isDoctor && (
                      <Link
                        to="/doctor/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                      >
                        <Stethoscope className="w-4 h-4 text-slate-400" /> Doctor Profile
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-slate-400" /> System Metrics
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 transition-all hover:shadow-brand-500/30"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-header border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            Find Doctors
          </Link>
          {isAuthenticated && isPatient && (
            <Link
              to="/patient/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              My Appointments
            </Link>
          )}
          {isAuthenticated && isDoctor && (
            <>
              <Link
                to="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor/availability"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Schedule & Slots
              </Link>
            </>
          )}
          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/doctors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Doctor Approvals
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
