import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.isNewUser) {
        toast('Google connected! Please complete your healthcare details.', { icon: '📝' });
        navigate('/complete-profile');
      } else {
        const user = result.user;
        toast.success(`Welcome back, ${user.fullName || user.email}!`);
        if (from === '/') {
          if (user.role?.includes('ADMIN')) navigate('/admin/dashboard');
          else if (user.role?.includes('DOCTOR')) navigate('/doctor/dashboard');
          else navigate('/patient/appointments');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.fullName || user.email}!`);

      // Smart redirect based on role if default root
      if (from === '/') {
        if (user.role?.includes('ADMIN')) navigate('/admin/dashboard');
        else if (user.role?.includes('DOCTOR')) navigate('/doctor/dashboard');
        else navigate('/patient/appointments');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.code === 'ERR_NETWORK' || !err.response) {
          msg = 'Cannot connect to backend server (http://localhost:8080). Please ensure the backend is running.';
        } else {
          msg = 'Login failed. Please check your credentials.';
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (email, pass) => {
    setFormData({ email, password: pass });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-navy-950 transition-colors">
      {/* Left side brand presentation */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Brand header */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight font-heading">
              Medi<span className="text-brand-400">Book</span>
            </span>
            <span className="block text-xs font-semibold text-brand-300 uppercase tracking-widest">
              Hospital Appointment System
            </span>
          </div>
        </Link>

        {/* Center message */}
        <div className="space-y-6 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-brand-300">
            <ShieldCheck className="w-4 h-4" /> HIPAA Certified & Concurrency-Safe
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading leading-tight">
            Seamless healthcare appointments at your fingertips.
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Real-time doctor calendar slots, conflict-free instant bookings, automated visit reminders, and verified patient reviews.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl font-extrabold text-brand-400">50+</p>
              <p className="text-xs text-slate-400">Specialists</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-teal-400">0%</p>
              <p className="text-xs text-slate-400">Double Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-coral-400">24/7</p>
              <p className="text-xs text-slate-400">Reminders</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-xs text-slate-400 relative z-10">
          © {new Date().getFullYear()} MediBook Healthcare. Built with Spring Boot 3 & React.
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <Link to="/" className="inline-flex lg:hidden items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">MediBook</span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to access your MediBook account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In to Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 dark:bg-navy-950 px-2 text-slate-500 font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-navy-850 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleLoading ? 'Connecting Google...' : 'Sign in with Google'}
          </button>

          {/* Quick Demo Fill Buttons for testing */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <p className="font-bold text-slate-700 dark:text-slate-300">Quick Test Credentials (Seed Data):</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@medibook.com', 'Admin@123')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
              >
                Admin (Admin@123)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor.sarah@medibook.com', 'Admin@123')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
              >
                Doctor Sarah (Admin@123)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor.rajesh@medibook.com', 'Admin@123')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
              >
                Doctor Rajesh (Admin@123)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('patient.john@medibook.com', 'Admin@123')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors cursor-pointer"
              >
                Patient John (Admin@123)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
