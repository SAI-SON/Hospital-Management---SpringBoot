import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import { Activity, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing reset token');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              Password Reset Complete
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20"
            >
              Sign In to Your Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                Set new password
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please enter a new secure password for your MediBook account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
