import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import patientApi from '../../api/patientApi';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Phone,
  Calendar,
  Heart,
  MapPin,
  Save,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O_POSITIVE',
    emergencyContact: '',
    address: '',
    avatarUrl: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await patientApi.getProfile();
        if (res.data) {
          setFormData({
            fullName: res.data.fullName || '',
            phoneNumber: res.data.phoneNumber || '',
            dateOfBirth: res.data.dateOfBirth || '',
            gender: res.data.gender || 'MALE',
            bloodGroup: res.data.bloodGroup || 'O_POSITIVE',
            emergencyContact: res.data.emergencyContact || '',
            address: res.data.address || '',
            avatarUrl: res.data.avatarUrl || '',
          });
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await patientApi.updateProfile(formData);
      updateUserProfile({ fullName: formData.fullName });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Patient Health Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep your clinical contact and emergency medical records up to date
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl">
          {/* Avatar and basic info banner */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-2xl flex items-center justify-center border border-brand-200 dark:border-brand-800">
              {formData.fullName ? formData.fullName[0].toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                {formData.fullName || user?.email}
              </h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full">
                Verified Patient
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none cursor-pointer transition-all [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none cursor-pointer transition-all [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-navy-900 dark:[&>option]:text-white"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Emergency Contact Number</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Residential Address</label>
              <input
                type="text"
                placeholder="Street address, city"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 shadow-md shadow-brand-500/20 active:scale-[0.99] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
