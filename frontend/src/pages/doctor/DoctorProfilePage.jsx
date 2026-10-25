import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import doctorApi from '../../api/doctorApi';
import specializationApi from '../../api/specializationApi';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Phone,
  Briefcase,
  DollarSign,
  MapPin,
  Save,
  Loader2,
  Award,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specializations, setSpecializations] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    specializationId: '',
    yearsOfExperience: 0,
    consultationFee: 0,
    clinicAddress: '',
    clinicCity: '',
    bio: '',
    avatarUrl: '',
    isAvailable: true,
  });

  const [licenseNumber, setLicenseNumber] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, specRes] = await Promise.all([
          doctorApi.getMyProfile(),
          specializationApi.getSpecializations(),
        ]);
        setSpecializations(specRes.data || []);
        if (profRes.data) {
          const d = profRes.data;
          setFormData({
            fullName: d.fullName || '',
            phoneNumber: d.phoneNumber || '',
            specializationId: d.specialization?.id || '',
            yearsOfExperience: d.yearsOfExperience || 0,
            consultationFee: d.consultationFee || 0,
            clinicAddress: d.clinicAddress || '',
            clinicCity: d.clinicCity || '',
            bio: d.bio || '',
            avatarUrl: d.avatarUrl || '',
            isAvailable: d.isAvailable ?? true,
          });
          setLicenseNumber(d.licenseNumber || '');
          setIsApproved(d.isApproved);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorApi.updateMyProfile({
        ...formData,
        specializationId: Number(formData.specializationId),
        yearsOfExperience: Number(formData.yearsOfExperience),
        consultationFee: Number(formData.consultationFee),
      });
      updateUserProfile({ fullName: formData.fullName });
      toast.success('Doctor profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="DOCTOR">
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="DOCTOR">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Doctor Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your clinical bio, consultation fees, and practice location
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl">
          {/* Header card with License & Verification Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-2xl flex items-center justify-center border border-brand-200 dark:border-brand-800">
                {formData.fullName ? formData.fullName.replace('Dr. ', '')[0] : 'D'}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  {formData.fullName || user?.email}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-brand-600" /> License: {licenseNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isApproved
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
              }`}>
                {isApproved ? 'Verified & Active' : 'Pending Verification'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Doctor Full Name</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specialization</label>
              <select
                value={formData.specializationId}
                onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none cursor-pointer"
              >
                {specializations.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Years Experience</label>
              <input
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinic City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.clinicCity}
                onChange={(e) => setFormData({ ...formData, clinicCity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinic / Hospital Address</label>
              <input
                type="text"
                placeholder="Building, street, room number"
                value={formData.clinicAddress}
                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Bio & Overview</label>
            <textarea
              rows={4}
              placeholder="Clinical experience, academic background, surgical or medical focus..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="isAvailable" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Currently accepting new appointments from patients
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Doctor Profile
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
