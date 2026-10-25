import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import appointmentApi from '../../api/appointmentApi';
import {
  Calendar,
  Clock,
  Filter,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Notes Modal state
  const [notesModalApt, setNotesModalApt] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        date: filterDate || undefined,
        status: filterStatus || undefined,
        page,
        size: 15,
      };
      const res = await appointmentApi.getDoctorAppointments(params);
      setAppointments(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, filterDate, filterStatus]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentApi.updateDoctorAppointmentStatus(id, status);
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!notesModalApt) return;

    setSavingNotes(true);
    try {
      await appointmentApi.addDoctorConsultationNotes(notesModalApt.id, {
        notes: notesText.trim(),
      });
      toast.success('Consultation notes saved successfully.');
      setNotesModalApt(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <DashboardLayout role="DOCTOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Doctor Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your complete clinical schedule, confirm appointments, and maintain patient notes
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-brand-600" /> Filters:
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(0);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>

          {(filterDate || filterStatus) && (
            <button
              type="button"
              onClick={() => {
                setFilterDate('');
                setFilterStatus('');
                setPage(0);
              }}
              className="ml-auto text-xs font-bold text-slate-400 hover:text-brand-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Appointments Table / Cards */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-16 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">No Appointments Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your date or status filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded">
                      {apt.referenceNo}
                    </span>
                    <Badge status={apt.status} />
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {apt.appointmentDate} at {apt.startTime?.slice(0, 5)} - {apt.endTime?.slice(0, 5)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {apt.patientName}
                    </h3>
                    <p className="text-xs text-slate-500">Phone: {apt.patientPhone || 'Not provided'}</p>
                  </div>

                  {apt.reason && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-navy-800/60 p-2 rounded-xl">
                      <strong>Patient Reason:</strong> {apt.reason}
                    </p>
                  )}

                  {apt.consultationNotes && (
                    <p className="text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-xl">
                      <strong>Clinical Notes:</strong> {apt.consultationNotes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {apt.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                  )}

                  {apt.status === 'CONFIRMED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
                      >
                        Complete
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
                      setNotesText(apt.consultationNotes || '');
                    }}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> Clinical Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NOTES MODAL */}
      <Modal
        isOpen={!!notesModalApt}
        onClose={() => setNotesModalApt(null)}
        title="Consultation Clinical Notes"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <p className="text-xs text-slate-500">
            Write clinical diagnosis, prescribed medication, or observations for{' '}
            <strong>{notesModalApt?.patientName}</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notes & Prescription</label>
            <textarea
              rows={5}
              required
              placeholder="Clinical evaluation and doctor instructions..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
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
              disabled={savingNotes}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 disabled:opacity-50"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
