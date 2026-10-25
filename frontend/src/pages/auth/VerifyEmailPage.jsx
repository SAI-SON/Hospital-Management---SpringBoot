import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Activity } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('VERIFYING'); // 'VERIFYING' | 'SUCCESS' | 'ERROR'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setMessage('Missing or invalid verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus('SUCCESS');
        setMessage(res.data?.message || 'Your email has been verified successfully!');
      } catch (err) {
        setStatus('ERROR');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-navy-950">
      <div className="w-full max-w-md p-8 glass-card bg-white dark:bg-navy-900 rounded-3xl shadow-xl text-center space-y-6 border border-slate-200 dark:border-slate-800">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">MediBook</span>
        </Link>

        {status === 'VERIFYING' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Verifying your email...
            </h3>
            <p className="text-xs text-slate-500">Please wait while we confirm your account security.</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              Account Verified!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message || 'You can now sign in with your email and password.'}
            </p>
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20"
            >
              Sign In to Your Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
            <Link
              to="/login"
              className="w-full inline-block py-3 px-4 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
