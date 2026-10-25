import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import doctorApi from '../../api/doctorApi';
import {
  Clock,
  Calendar,
  Save,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorAvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Slot generator state
  const [genStartDate, setGenStartDate] = useState(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [genEndDate, setGenEndDate] = useState(() => format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [genLoading, setGenLoading] = useState(false);

  const daysOfWeek = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
    { num: 7, name: 'Sunday' },
  ];

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getMyAvailability();
      const existing = res.data || [];

      // Initialize default 7 days if empty
      const fullList = daysOfWeek.map((d) => {
        const found = existing.find((s) => s.dayOfWeek === d.num);
        if (found) return found;
        return {
          dayOfWeek: d.num,
          startTime: '09:00:00',
          endTime: '17:00:00',
          slotDurationMinutes: 30,
          breakStartTime: '13:00:00',
          breakEndTime: '14:00:00',
          isActive: d.num <= 5, // Mon-Fri active by default
        };
      });

      setSchedule(fullList);
    } catch {
      toast.error('Could not load availability schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleDayChange = (dayNum, field, value) => {
    setSchedule((prev) =>
      prev.map((item) => (item.dayOfWeek === dayNum ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      await doctorApi.setMyAvailability(schedule);
      toast.success('Weekly availability schedule updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    if (!genStartDate || !genEndDate) {
      toast.error('Please pick start and end dates.');
      return;
    }

    setGenLoading(true);
    try {
      const res = await doctorApi.generateSlots({
        startDate: genStartDate,
        endDate: genEndDate,
      });
      toast.success(res.message || 'Appointment slots generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate slots.');
    } finally {
      setGenLoading(false);
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
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Availability & Slot Generation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure your weekly working schedule and generate live booking slots for patients
            </p>
          </div>
        </div>

        {/* SECTION 1: SLOT GENERATOR CARD */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card bg-gradient-to-br from-brand-500/10 via-teal-500/5 to-transparent border border-brand-200/80 dark:border-brand-900 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Automated Slot Publishing
              </span>
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" /> Generate Appointment Slots
              </h2>
              <p className="text-xs text-slate-500">
                Creates slots matching your weekly schedule for the selected date range. Any days marked as scheduled leaves will automatically be excluded.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateSlots} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={genStartDate}
                onChange={(e) => setGenStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date (Max 30 Days)</label>
              <input
                type="date"
                min={genStartDate}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                value={genEndDate}
                onChange={(e) => setGenEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={genLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Slots Now
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: WEEKLY SCHEDULE FORM */}
        <form onSubmit={handleSaveSchedule} className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" /> Weekly Availability Schedule
              </h2>
              <p className="text-xs text-slate-500">Configure your shift hours, duration, and lunch breaks</p>
            </div>

            <button
              type="submit"
              disabled={savingSchedule}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Weekly Schedule
            </button>
          </div>

          <div className="space-y-4">
            {schedule.map((item) => {
              const day = daysOfWeek.find((d) => d.num === item.dayOfWeek);
              return (
                <div
                  key={item.dayOfWeek}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isActive
                      ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800'
                      : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-navy-900/50 text-slate-400'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Day name & toggle */}
                    <div className="sm:col-span-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => handleDayChange(item.dayOfWeek, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                      />
                      <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                        {day?.name}
                      </span>
                    </div>

                    {/* Shift start & end */}
                    <div className="sm:col-span-3 flex items-center gap-1.5 text-xs">
                      <input
                        type="time"
                        disabled={!item.isActive}
                        value={item.startTime?.slice(0, 5)}
                        onChange={(e) => handleDayChange(item.dayOfWeek, 'startTime', e.target.value + ':00')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs w-24 outline-none"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        disabled={!item.isActive}
                        value={item.endTime?.slice(0, 5)}
                        onChange={(e) => handleDayChange(item.dayOfWeek, 'endTime', e.target.value + ':00')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs w-24 outline-none"
                      />
                    </div>

                    {/* Slot Duration */}
                    <div className="sm:col-span-2 text-xs">
                      <select
                        disabled={!item.isActive}
                        value={item.slotDurationMinutes}
                        onChange={(e) => handleDayChange(item.dayOfWeek, 'slotDurationMinutes', Number(e.target.value))}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs w-full outline-none"
                      >
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                      </select>
                    </div>

                    {/* Break times */}
                    <div className="sm:col-span-4 flex items-center gap-1.5 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Break:</span>
                      <input
                        type="time"
                        disabled={!item.isActive}
                        value={item.breakStartTime?.slice(0, 5) || ''}
                        onChange={(e) => handleDayChange(item.dayOfWeek, 'breakStartTime', e.target.value ? e.target.value + ':00' : null)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs w-24 outline-none"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        disabled={!item.isActive}
                        value={item.breakEndTime?.slice(0, 5) || ''}
                        onChange={(e) => handleDayChange(item.dayOfWeek, 'breakEndTime', e.target.value ? e.target.value + ':00' : null)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 text-xs w-24 outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
