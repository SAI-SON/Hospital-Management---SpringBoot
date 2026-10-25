import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import doctorApi from '../../api/doctorApi';
import appointmentApi from '../../api/appointmentApi';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Stethoscope,
  MapPin,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';

export default function BookingWizardPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user, isPatient } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1); // 1: Date & Doctor, 2: Slot, 3: Reason & Confirm, 4: Success
  const [selectedDate, setSelectedDate] = useState(() => addDays(new Date(), 1)); // Default tomorrow
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Generate next 14 days for horizontal picker
  const upcomingDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorApi.getDoctorById(doctorId);
        setDoctor(res.data);
      } catch {
        toast.error('Could not load doctor details.');
      } finally {
        setLoadingDoc(false);
      }
    };
    fetchDoc();
  }, [doctorId]);

  // Fetch slots whenever selectedDate or doctorId changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await doctorApi.getAvailableSlots(doctorId, dateStr);
        setSlots(res.data || []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [doctorId, selectedDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error('Please select an appointment time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        doctorId: Number(doctorId),
        slotId: selectedSlot.id,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        reason: reason.trim() || 'General Medical Consultation',
      };

      const res = await appointmentApi.bookAppointment(payload);
      setConfirmedBooking(res.data);
      setCurrentStep(4);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('This slot was just booked by another patient! Please select another slot.');
        // Refresh slots for this date
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const refreshRes = await doctorApi.getAvailableSlots(doctorId, dateStr);
        setSlots(refreshRes.data || []);
        setSelectedSlot(null);
        setCurrentStep(2);
      } else {
        toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Group slots by Morning / Afternoon / Evening
  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime?.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime?.split(':')[0], 10);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime?.split(':')[0], 10);
    return hour >= 17;
  });

  if (loadingDoc) {
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
        {/* Wizard Step Indicator (Steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
              {[
                { num: 1, label: 'Select Date' },
                { num: 2, label: 'Pick Slot' },
                { num: 3, label: 'Confirm' },
              ].map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div key={step.num} className="flex flex-col items-center gap-1.5 relative z-10 bg-slate-50 dark:bg-navy-950 px-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-md shadow-brand-500/30'
                          : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                    </div>
                    <span className={`text-[11px] font-bold ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Doctor Summary Header Pill */}
        {doctor && currentStep < 4 && (
          <div className="mb-6 p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold flex items-center justify-center shrink-0">
                {doctor.fullName ? doctor.fullName.replace('Dr. ', '')[0] : 'D'}
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">{doctor.fullName}</h3>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{doctor.specialization?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fee</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">${doctor.consultationFee}</p>
            </div>
          </div>
        )}

        {/* STEP 1: DATE PICKER */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" /> Choose Appointment Date
              </h2>
              <p className="text-xs text-slate-500">Pick any available date over the next 14 days</p>
            </div>

            {/* Horizontal Date Scroller */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar">
              {upcomingDays.map((dateItem) => {
                const isSelected = isSameDay(dateItem, selectedDate);
                return (
                  <button
                    type="button"
                    key={dateItem.toISOString()}
                    onClick={() => setSelectedDate(dateItem)}
                    className={`flex flex-col items-center justify-center min-w-[70px] py-3.5 px-2 rounded-2xl border transition-all shrink-0 ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/30 scale-105'
                        : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500/50'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {format(dateItem, 'EEE')}
                    </span>
                    <span className="text-lg font-black mt-0.5">{format(dateItem, 'dd')}</span>
                    <span className="text-[10px] font-medium opacity-80">{format(dateItem, 'MMM')}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Selected: <strong className="text-brand-600 dark:text-brand-400">{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 shadow-sm flex items-center gap-1.5"
              >
                Proceed to Slots <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SLOT SELECTION */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" /> Available Time Slots
                </h2>
                <p className="text-xs text-slate-500">
                  Showing slots for {format(selectedDate, 'EEEE, MMM dd, yyyy')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Date
              </button>
            </div>

            {loadingSlots ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                <p className="text-xs text-slate-500">Loading open slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  No Available Slots on This Date
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dr. {doctor.fullName} has no open slots on {format(selectedDate, 'MMM dd')}. Please pick another date.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950"
                >
                  Choose Another Date
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Morning (Before 12:00 PM)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {morningSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={slot.booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                              slot.booked
                                ? 'bg-slate-100 dark:bg-navy-800 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed line-through opacity-60'
                                : isSelected
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/30 ring-2 ring-brand-500/50'
                                : 'bg-white dark:bg-navy-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                            }`}
                          >
                            {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {afternoonSlots.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Afternoon (12:00 PM - 5:00 PM)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {afternoonSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={slot.booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                              slot.booked
                                ? 'bg-slate-100 dark:bg-navy-800 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed line-through opacity-60'
                                : isSelected
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/30 ring-2 ring-brand-500/50'
                                : 'bg-white dark:bg-navy-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                            }`}
                          >
                            {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {eveningSlots.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Evening (After 5:00 PM)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {eveningSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={slot.booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                              slot.booked
                                ? 'bg-slate-100 dark:bg-navy-800 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed line-through opacity-60'
                                : isSelected
                                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/30 ring-2 ring-brand-500/50'
                                : 'bg-white dark:bg-navy-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                            }`}
                          >
                            {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 Bottom Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 disabled:opacity-40 shadow-sm flex items-center gap-1.5"
              >
                Continue to Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REASON & CONFIRM */}
        {currentStep === 3 && (
          <form
            onSubmit={handleBookingSubmit}
            className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" /> Review & Confirm Appointment
              </h2>
              <p className="text-xs text-slate-500">Please describe your symptoms and review booking details</p>
            </div>

            {/* Appointment Summary Box */}
            <div className="p-5 rounded-2xl bg-brand-50/40 dark:bg-brand-950/30 border border-brand-200/70 dark:border-brand-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Doctor</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{doctor.fullName}</p>
                <p className="text-[11px] text-brand-600">{doctor.specialization?.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Date & Time</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{format(selectedDate, 'MMM dd, yyyy')}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {selectedSlot?.startTime?.slice(0, 5)} - {selectedSlot?.endTime?.slice(0, 5)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Hospital Location</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{doctor.clinicCity}</p>
                <p className="text-[11px] text-slate-500">{doctor.clinicAddress || 'Hospital Main Pavilion'}</p>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Visit / Symptoms (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Experiencing mild chest tightness, routine blood pressure checkup..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>

            {/* Cancellation Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cancellation Policy:</strong> You may cancel or reschedule free of charge up to 2 hours before the appointment. After that, the slot cannot be cancelled.
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                Back to Slots
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Securing Slot...
                  </>
                ) : (
                  <>
                    Confirm & Book Now <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {currentStep === 4 && confirmedBooking && (
          <div className="p-8 sm:p-12 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Booking Confirmed
              </span>
              <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                You're All Set!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Your consultation has been reserved. A confirmation email and calendar invite have been dispatched.
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-slate-700/80 space-y-3 text-left text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-semibold">Reference Code:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                  {confirmedBooking.referenceNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-bold text-slate-900 dark:text-white">{confirmedBooking.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {confirmedBooking.appointmentDate} at {confirmedBooking.startTime?.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clinic:</span>
                <span className="font-bold text-slate-900 dark:text-white">{confirmedBooking.clinicCity}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/patient/appointments"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-teal-500 shadow-md shadow-brand-500/20"
              >
                Go to My Appointments
              </Link>
              <Link
                to="/doctors"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200"
              >
                Find Another Doctor
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
