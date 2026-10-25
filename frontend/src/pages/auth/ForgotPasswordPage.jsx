import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
      toast.success('Real password reset email sent to your inbox!');
    } catch (err) {
      toast.error(err.message || 'Could not send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-navy-950">
      <div className="w-full max-w-md p-8 glass-card bg-white dark:bg-navy-900 rounded-3xl shadow-xl space-y-6 border border-slate-200 dark:border-slate-800">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">MediBook</span>
        </Link>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              Check Your Inbox
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              If an account exists with <strong className="text-slate-900 dark:text-white">{email}</strong>, you will receive a secure password reset link valid for 30 minutes.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                Forgot password?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No worries! Enter your account email and we'll send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
