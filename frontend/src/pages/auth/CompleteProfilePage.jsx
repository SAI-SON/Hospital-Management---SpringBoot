import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import { Activity, User, Phone, Calendar, Heart, ShieldCheck, MapPin, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompleteProfilePage() {
  const { pendingGoogleUser, completeGoogleRegistration } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O_POSITIVE',
    emergencyContact: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAndInit = async () => {
      let email = pendingGoogleUser?.email;
      let name = pendingGoogleUser?.fullName;
      let uid = pendingGoogleUser?.uid;

      if (!email) {
        const saved = sessionStorage.getItem('medibook_pending_google');
        if (!saved) {
          const storedUser = localStorage.getItem('medibook_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser?.role?.includes('ADMIN')) navigate('/admin/dashboard');
              else if (parsedUser?.role?.includes('DOCTOR')) navigate('/doctor/dashboard');
              else navigate('/patient/appointments');
              return;
            } catch {}
          }
          toast.error('No pending Google sign-in session found. Please sign in again.');
          navigate('/login');
          return;
        }
        const parsed = JSON.parse(saved);
        email = parsed.email;
        name = parsed.fullName;
        uid = parsed.uid;
      }

      setFormData((prev) => ({
        ...prev,
        fullName: name || prev.fullName,
      }));

      // Check if user already exists with completed profile in Neon database -> skip straight to dashboard!
      if (email) {
        try {
          const res = await authApi.firebaseLogin({
            email,
            fullName: name || 'Google User',
            firebaseUid: uid,
          });
          const payload = res?.data || res;
          const isComplete = payload?.isNewUser === false || payload?.newUser === false;
          if (isComplete && payload?.user) {
            if (payload.accessToken) {
              localStorage.setItem('medibook_access_token', payload.accessToken);
            }
            localStorage.setItem('medibook_user', JSON.stringify(payload.user));
            sessionStorage.removeItem('medibook_pending_google');
            toast.success('Welcome back! Entering your dashboard...');
            if (payload.user?.role?.includes('ADMIN')) navigate('/admin/dashboard');
            else if (payload.user?.role?.includes('DOCTOR')) navigate('/doctor/dashboard');
            else navigate('/patient/appointments');
            return;
          }
        } catch {
          // If check fails, let user fill form
        }
      }
    };

    checkAndInit();
  }, [pendingGoogleUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber.trim()) {
      toast.error('Please provide a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const user = await completeGoogleRegistration(formData);
      toast.success('Profile completed successfully! Welcome to MediBook.');
      if (user?.role?.includes('ADMIN')) navigate('/admin/dashboard');
      else if (user?.role?.includes('DOCTOR')) navigate('/doctor/dashboard');
      else navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentEmail = pendingGoogleUser?.email || JSON.parse(sessionStorage.getItem('medibook_pending_google') || '{}')?.email;
  const currentPhoto = pendingGoogleUser?.photoURL || JSON.parse(sessionStorage.getItem('medibook_pending_google') || '{}')?.photoURL;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-navy-950 transition-colors">
      <div className="w-full max-w-xl p-8 glass-card bg-white dark:bg-navy-900 rounded-3xl shadow-xl space-y-6 border border-slate-200 dark:border-slate-800">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">MediBook</span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Step 2: Patient Details
          </span>
        </div>

        {/* Google User Profile Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-navy-850 dark:to-navy-800 border border-blue-100 dark:border-slate-800 flex items-center gap-4">
          {currentPhoto ? (
            <img src={currentPhoto} alt="Google avatar" className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
              {formData.fullName?.[0] || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {formData.fullName || 'Google User'}
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Google Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentEmail}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
            Complete Your Healthcare Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Doctors and hospital staff require these details for scheduling and medical consultation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone Number & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Gender & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none cursor-pointer transition-all [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none cursor-pointer transition-all [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
              >
                <option value="O_POSITIVE">O+ (Positive)</option>
                <option value="O_NEGATIVE">O- (Negative)</option>
                <option value="A_POSITIVE">A+ (Positive)</option>
                <option value="A_NEGATIVE">A- (Negative)</option>
                <option value="B_POSITIVE">B+ (Positive)</option>
                <option value="B_NEGATIVE">B- (Negative)</option>
                <option value="AB_POSITIVE">AB+ (Positive)</option>
                <option value="AB_NEGATIVE">AB- (Negative)</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Emergency Contact Number</label>
            <div className="relative">
              <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="Guardian or emergency contact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Address / City</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                placeholder="Street address, city, pin code"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 shadow-lg shadow-brand-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
              </>
            ) : (
              <>
                Complete & Go to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
