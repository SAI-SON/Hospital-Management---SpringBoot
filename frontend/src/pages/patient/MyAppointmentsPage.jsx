import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import RatingStars from '../../components/RatingStars';
import appointmentApi from '../../api/appointmentApi';
import reviewApi from '../../api/reviewApi';
import doctorApi from '../../api/doctorApi';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  X,
  RotateCw,
  Star,
  FileText,
  Loader2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST'

  // Modal states
  const [cancelModalApt, setCancelModalApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const [reviewModalApt, setReviewModalApt] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => addDays(new Date(), 1));
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotId, setRescheduleSlotId] = useState(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getPatientAppointments({ page: 0, size: 50 });
      setAppointments(res.data?.content || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch slots when reschedule date changes
  useEffect(() => {
    const fetchRescheduleSlots = async () => {
      if (!rescheduleModalApt) return;
      try {
        const dateStr = format(rescheduleDate, 'yyyy-MM-dd');
        const res = await doctorApi.getAvailableSlots(rescheduleModalApt.doctorId, dateStr);
        setRescheduleSlots(res.data || []);
      } catch {
        setRescheduleSlots([]);
      }
    };
    if (rescheduleModalApt) {
      fetchRescheduleSlots();
    }
  }, [rescheduleModalApt, rescheduleDate]);

  // Handle Cancel
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalApt) return;

    setCancelLoading(true);
    try {
      await appointmentApi.cancelAppointment(cancelModalApt.id, {
        cancellationReason: cancelReason.trim() || 'Patient requested cancellation',
      });
      toast.success('Appointment cancelled. Slot has been released.');
      setCancelModalApt(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalApt) return;

    setReviewLoading(true);
    try {
      await reviewApi.submitReview(reviewModalApt.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success('Review submitted successfully! Thank you for your feedback.');
      setReviewModalApt(null);
      setReviewComment('');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Handle Reschedule
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModalApt || !rescheduleSlotId) {
      toast.error('Please pick a new time slot.');
      return;
    }

    setRescheduleLoading(true);
    try {
      await appointmentApi.rescheduleAppointment(rescheduleModalApt.id, {
        newSlotId: rescheduleSlotId,
        newDate: format(rescheduleDate, 'yyyy-MM-dd'),
      });
      toast.success('Appointment rescheduled successfully!');
      setRescheduleModalApt(null);
      setRescheduleSlotId(null);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Filter into Upcoming vs Past
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const upcomingList = appointments.filter((a) => {
    return (
      (a.status === 'PENDING' || a.status === 'CONFIRMED') &&
      a.appointmentDate >= todayStr
    );
  });

  const pastList = appointments.filter((a) => {
    return (
      a.status === 'COMPLETED' ||
      a.status === 'CANCELLED' ||
      a.status === 'NO_SHOW' ||
      ((a.status === 'PENDING' || a.status === 'CONFIRMED') && a.appointmentDate < todayStr)
    );
  });

  const displayList = activeTab === 'UPCOMING' ? upcomingList : pastList;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your upcoming hospital visits and consultation history
            </p>
          </div>
          <Link
            to="/doctors"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20 self-start sm:self-auto"
          >
            + Book New Appointment
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-navy-900 max-w-sm mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('UPCOMING')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-white dark:bg-navy-800 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Upcoming ({upcomingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAST')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PAST'
                ? 'bg-white dark:bg-navy-800 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past History ({pastList.length})
          </button>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading your appointments...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-16 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              No {activeTab === 'UPCOMING' ? 'Upcoming' : 'Past'} Appointments
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'UPCOMING'
                ? 'You have no scheduled doctor consultations. Discover top specialists and book a visit.'
                : 'Your completed or cancelled appointments will appear here.'}
            </p>
            {activeTab === 'UPCOMING' && (
              <Link
                to="/doctors"
                className="mt-2 inline-block px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-teal-500"
              >
                Find Doctors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayList.map((apt) => (
              <div
                key={apt.id}
                className="p-5 sm:p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-card transition-all"
              >
                {/* Left: Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                      {apt.referenceNo}
                    </span>
                    <Badge status={apt.status} />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                      {apt.doctorName}
                    </h3>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {apt.doctorSpecialization} • Fee: ${apt.doctorFee}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" /> {apt.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-teal-600" /> {apt.startTime?.slice(0, 5)} - {apt.endTime?.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {apt.clinicCity}
                    </span>
                  </div>

                  {apt.reason && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-navy-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-slate-700 dark:text-slate-300">Reason:</strong> {apt.reason}
                    </p>
                  )}

                  {apt.consultationNotes && (
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                      <strong>Doctor's Notes:</strong> {apt.consultationNotes}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col gap-2 shrink-0 md:min-w-[140px]">
                  {/* Reschedule Button */}
                  {apt.canReschedule && (
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleModalApt(apt);
                        setRescheduleDate(addDays(new Date(), 1));
                      }}
                      className="flex-1 md:flex-initial py-2 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                  )}

                  {/* Cancel Button */}
                  {apt.canCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelModalApt(apt);
                        setCancelReason('');
                      }}
                      className="flex-1 md:flex-initial py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel Visit
                    </button>
                  )}

                  {/* Review Button */}
                  {apt.canReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewModalApt(apt);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="flex-1 md:flex-initial py-2 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Rate Doctor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CANCEL MODAL */}
      <Modal
        isOpen={!!cancelModalApt}
        onClose={() => setCancelModalApt(null)}
        title="Cancel Appointment"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Are you sure you want to cancel your appointment with <strong>{cancelModalApt?.doctorName}</strong> on <strong>{cancelModalApt?.appointmentDate}</strong>?
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Cancellation</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Schedule conflict, feeling better..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-rose-500/50 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalApt(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={cancelLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
            >
              {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RATE & REVIEW MODAL */}
      <Modal
        isOpen={!!reviewModalApt}
        onClose={() => setReviewModalApt(null)}
        title="Rate & Review Consultation"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              How was your experience with <strong>{reviewModalApt?.doctorName}</strong>?
            </p>
            <div className="flex justify-center py-2">
              <RatingStars
                rating={reviewRating}
                size="lg"
                interactive={true}
                onRate={(stars) => setReviewRating(stars)}
              />
            </div>
            <span className="text-xs font-bold text-amber-500">{reviewRating} out of 5 Stars</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Review / Feedback</label>
            <textarea
              rows={4}
              placeholder="Share how the doctor helped you, wait times, clarity of consultation..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReviewModalApt(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RESCHEDULE MODAL */}
      <Modal
        isOpen={!!rescheduleModalApt}
        onClose={() => setRescheduleModalApt(null)}
        title="Reschedule Appointment"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pick New Date</label>
            <input
              type="date"
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              value={format(rescheduleDate, 'yyyy-MM-dd')}
              onChange={(e) => setRescheduleDate(new Date(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select New Time Slot</label>
            {rescheduleSlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No open slots on this date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {rescheduleSlots.map((slot) => {
                  const isSelected = rescheduleSlotId === slot.id;
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setRescheduleSlotId(slot.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                      }`}
                    >
                      {slot.startTime?.slice(0, 5)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRescheduleModalApt(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rescheduleLoading || !rescheduleSlotId}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 disabled:opacity-50"
            >
              {rescheduleLoading ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
