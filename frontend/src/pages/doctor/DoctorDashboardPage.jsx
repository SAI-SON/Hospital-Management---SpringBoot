import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import appointmentApi from '../../api/appointmentApi';
import doctorApi from '../../api/doctorApi';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Star,
  FileText,
  Loader2,
  Stethoscope,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notes Modal state
  const [notesModalApt, setNotesModalApt] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, aptRes] = await Promise.all([
        doctorApi.getMyProfile(),
        appointmentApi.getDoctorAppointments({ date: todayStr, page: 0, size: 20 }),
      ]);
      setProfile(profRes.data);
      setTodayAppointments(aptRes.data?.content || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentApi.updateDoctorAppointmentStatus(id, newStatus);
      toast.success(`Appointment marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!notesModalApt) return;

    setNotesLoading(true);
    try {
      await appointmentApi.addDoctorConsultationNotes(notesModalApt.id, {
        notes: consultationNotes.trim(),
      });
      toast.success('Consultation notes saved successfully.');
      setNotesModalApt(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setNotesLoading(false);
    }
  };

  const pendingCount = todayAppointments.filter((a) => a.status === 'PENDING').length;
  const confirmedCount = todayAppointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <DashboardLayout role="DOCTOR">
      <div className="space-y-8">
        {/* Top welcome banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Doctor Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {profile?.fullName || 'Doctor'}. Here is your schedule for today ({format(new Date(), 'EEEE, MMM dd')}).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/doctor/availability"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 shadow-sm"
            >
              + Generate Slots
            </Link>
          </div>
        </div>

        {/* 4 Stat KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Visits</span>
              <Calendar className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              {todayAppointments.length}
            </p>
            <p className="text-[11px] text-slate-500">Scheduled for today</p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
              {pendingCount}
            </p>
            <p className="text-[11px] text-slate-500">Awaiting confirmation</p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-emerald-600">
              {completedCount}
            </p>
            <p className="text-[11px] text-slate-500">Finished consultations</p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Rating Avg</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              {profile?.ratingAverage ? Number(profile.ratingAverage).toFixed(1) : '5.0'}
            </p>
            <p className="text-[11px] text-slate-500">From {profile?.totalReviews || 0} reviews</p>
          </div>
        </div>

        {/* Today's Appointments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" /> Today's Consultation Schedule
            </h2>
            <Link
              to="/doctor/appointments"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View all dates <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
              <p className="text-xs text-slate-500">Loading appointments...</p>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-12 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">No Consultations Scheduled for Today</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ensure you have generated open slots for today or check your schedule settings.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded">
                        {apt.referenceNo}
                      </span>
                      <Badge status={apt.status} />
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {apt.startTime?.slice(0, 5)} - {apt.endTime?.slice(0, 5)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">Phone: {apt.patientPhone || 'Not provided'}</p>
                    </div>

                    {apt.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-navy-800/60 p-2 rounded-xl">
                        <strong>Reason:</strong> {apt.reason}
                      </p>
                    )}

                    {apt.consultationNotes && (
                      <p className="text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-xl">
                        <strong>Notes:</strong> {apt.consultationNotes}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {apt.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                      >
                        Accept Visit
                      </button>
                    )}

                    {apt.status === 'CONFIRMED' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
                        >
                          Mark Completed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'NO_SHOW')}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200"
                        >
                          No-Show
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setNotesModalApt(apt);
                        setConsultationNotes(apt.consultationNotes || '');
                      }}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NOTES MODAL */}
      <Modal
        isOpen={!!notesModalApt}
        onClose={() => setNotesModalApt(null)}
        title="Consultation Clinical Notes"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <p className="text-xs text-slate-500">
            Record medical observations, prescription summaries, or follow-up recommendations for{' '}
            <strong>{notesModalApt?.patientName}</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Notes</label>
            <textarea
              rows={5}
              required
              placeholder="e.g. Patient presented with seasonal allergies. Prescribed antihistamine 10mg once daily. Follow-up in 2 weeks if symptoms persist..."
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNotesModalApt(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={notesLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 disabled:opacity-50"
            >
              {notesLoading ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
