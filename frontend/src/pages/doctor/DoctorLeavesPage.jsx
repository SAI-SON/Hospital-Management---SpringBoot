import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import doctorApi from '../../api/doctorApi';
import {
  CalendarX2,
  Calendar,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // New leave form
  const [leaveDate, setLeaveDate] = useState(() => format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getMyLeaves();
      setLeaves(res.data || []);
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate) {
      toast.error('Please pick a leave date.');
      return;
    }

    setAdding(true);
    try {
      await doctorApi.addLeave({
        leaveDate,
        reason: reason.trim() || 'Scheduled Personal Leave',
      });
      toast.success('Leave scheduled successfully!');
      setReason('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule leave.');
    } finally {
      setAdding(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Cancel this scheduled leave? Your availability for this date will be restored.')) return;
    try {
      await doctorApi.cancelLeave(id);
      toast.success('Leave cancelled.');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave.');
    }
  };

  return (
    <DashboardLayout role="DOCTOR">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Doctor Leaves & Holidays
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule off-duty days or annual medical leave to prevent appointment slots from being booked
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule Leave Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAddLeave} className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xl">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarX2 className="w-4 h-4 text-coral-500" /> Schedule Leave Day
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Leave Date</label>
                <input
                  type="date"
                  required
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Medical symposium, annual vacation, personal day..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-coral-500 to-rose-600 hover:opacity-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Schedule Leave
              </button>
            </form>
          </div>

          {/* Scheduled Leaves List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" /> Upcoming Scheduled Leaves ({leaves.length})
            </h3>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-12 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">No Scheduled Leaves</h4>
                <p className="text-xs text-slate-500">You are currently active according to your weekly availability schedule.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarX2 className="w-4 h-4 text-rose-500" />
                        {leave.leaveDate}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{leave.reason || 'Personal Leave'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelLeave(leave.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Cancel Leave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
