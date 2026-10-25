import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import specializationApi from '../../api/specializationApi';
import {
  Activity,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Building,
  DollarSign,
  Award,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [roleType, setRoleType] = useState('PATIENT'); // 'PATIENT' | 'DOCTOR'
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successRegistered, setSuccessRegistered] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.isNewUser) {
        toast('Google connected! Please complete your healthcare details.', { icon: '📝' });
        navigate('/complete-profile');
      } else {
        toast.success(`Welcome back, ${result.user.fullName || result.user.email}!`);
        navigate('/patient/appointments');
      }
    } catch (err) {
      toast.error(err.message || 'Google sign up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    // Patient specific
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O_POSITIVE',
    emergencyContact: '',
    address: '',
    // Doctor specific
    licenseNumber: '',
    specializationId: '',
    yearsOfExperience: 3,
    consultationFee: 50.0,
    bio: '',
    clinicCity: '',
    clinicAddress: '',
  });

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await specializationApi.getSpecializations();
        setSpecializations(res.data || []);
        if (res.data?.length > 0) {
          setFormData((prev) => ({ ...prev, specializationId: res.data[0].id }));
        }
      } catch {
        // Fallback default
      }
    };
    fetchSpecializations();
  }, []);

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-teal-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        role: roleType === 'DOCTOR' ? 'ROLE_DOCTOR' : 'ROLE_PATIENT',
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        ...(roleType === 'PATIENT'
          ? {
              dateOfBirth: formData.dateOfBirth || null,
              gender: formData.gender,
              bloodGroup: formData.bloodGroup,
              emergencyContact: formData.emergencyContact,
              address: formData.address,
            }
          : {
              licenseNumber: formData.licenseNumber.trim(),
              specializationId: Number(formData.specializationId),
              yearsOfExperience: Number(formData.yearsOfExperience),
              consultationFee: Number(formData.consultationFee),
              bio: formData.bio,
              clinicCity: formData.clinicCity,
              clinicAddress: formData.clinicAddress,
            }),
      };

      await signup(payload);
      setSuccessRegistered(true);
      toast.success('Registration successful! Verification email sent.');
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.code === 'ERR_NETWORK' || !err.response) {
          msg = 'Cannot connect to backend server (http://localhost:8080). Please ensure the backend is running.';
        } else {
          msg = 'Registration failed. Please check your details.';
        }
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (successRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-navy-950">
        <div className="w-full max-w-md p-8 glass-card bg-white dark:bg-navy-900 rounded-3xl shadow-xl text-center space-y-5 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We have sent a verification link to <strong className="text-slate-900 dark:text-white">{formData.email}</strong>.
            Please click the link in your email to activate your account.
          </p>
          <div className="p-4 rounded-xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs text-brand-800 dark:text-brand-300 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-brand-900 dark:text-brand-200">
              <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Real Email Verification Dispatched:
            </p>
            <p>A real verification email from Google Firebase has been delivered directly to your inbox. Check your inbox (and spam folder) and click the link to confirm.</p>
          </div>
          <Link
            to="/login"
            className="w-full block py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-navy-950 transition-colors">
      {/* Left side branding banner */}
      <div className="hidden lg:flex lg:col-span-4 flex-col justify-between p-10 bg-gradient-to-br from-navy-900 to-brand-950 text-white relative">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black font-heading">
            Medi<span className="text-brand-400">Book</span>
          </span>
        </Link>

        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-brand-300">
            Join 10,000+ Patients & Specialists
          </span>
          <h2 className="text-3xl font-extrabold font-heading leading-tight">
            Comprehensive medical appointments made simple.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Register in seconds. Choose whether you're seeking care or applying to join our certified medical staff.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} MediBook Healthcare System.
        </div>
      </div>

      {/* Right side register form */}
      <div className="lg:col-span-8 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Create your MediBook account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select your role and provide your basic information
            </p>
          </div>

          {/* Fast Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-navy-850 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleLoading ? 'Connecting Google...' : 'Sign up instantly with Google'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-50 dark:bg-navy-950 px-2 text-slate-500 font-semibold">Or register manually</span>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-navy-900 border border-slate-300/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRoleType('PATIENT')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                roleType === 'PATIENT'
                  ? 'bg-white dark:bg-navy-800 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 text-brand-500" /> I am a Patient
            </button>
            <button
              type="button"
              onClick={() => setRoleType('DOCTOR')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                roleType === 'DOCTOR'
                  ? 'bg-white dark:bg-navy-800 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-500" /> Apply as Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name {roleType === 'DOCTOR' ? '(e.g. Dr. John Doe)' : ''}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                  {formData.password && (
                    <span className="text-[10px] font-bold text-slate-500">
                      Strength: {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 8 chars"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
                {formData.password && (
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* PATIENT SPECIFIC FIELDS */}
            {roleType === 'PATIENT' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
                    >
                      <option value="A_POSITIVE">A+</option>
                      <option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option>
                      <option value="B_NEGATIVE">B-</option>
                      <option value="AB_POSITIVE">AB+</option>
                      <option value="AB_NEGATIVE">AB-</option>
                      <option value="O_POSITIVE">O+</option>
                      <option value="O_NEGATIVE">O-</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address</label>
                  <input
                    type="text"
                    placeholder="123 Health Ave, Springfield"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>
            )}

            {/* DOCTOR SPECIFIC FIELDS */}
            {roleType === 'DOCTOR' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Medical License Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MED-8921-X"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specialization</label>
                    <select
                      value={formData.specializationId}
                      onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
                    >
                      {specializations.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Years Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Consultation Fee ($)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinic City</label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={formData.clinicCity}
                      onChange={(e) => setFormData({ ...formData, clinicCity: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Bio</label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of certifications, clinical interests, and clinical practice..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
