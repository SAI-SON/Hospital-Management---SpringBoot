import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import RatingStars from '../../components/RatingStars';
import doctorApi from '../../api/doctorApi';
import reviewApi from '../../api/reviewApi';
import {
  Stethoscope,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Award,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [docRes, revRes] = await Promise.all([
          doctorApi.getDoctorById(id),
          reviewApi.getDoctorReviews(id, { page: 0, size: 10 }),
        ]);
        setDoctor(docRes.data);
        setReviews(revRes.data?.content || []);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-400" />
          <h2 className="text-xl font-bold font-heading">Doctor Not Found</h2>
          <Link to="/doctors" className="text-xs font-bold text-brand-600 hover:underline">
            Return to search
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Doctor Bio, Experience, Schedule, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-3xl flex items-center justify-center border border-brand-200 dark:border-brand-800 shrink-0">
                  {doctor.fullName ? doctor.fullName.replace('Dr. ', '')[0] : 'D'}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                      {doctor.fullName}
                    </h1>
                    {doctor.isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {doctor.specialization?.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {doctor.yearsOfExperience} Years Experience
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {doctor.clinicCity || 'Medical Center'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Lic: {doctor.licenseNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating and fee breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Patient Rating</p>
                  <div className="flex justify-center mt-1">
                    <RatingStars rating={doctor.ratingAverage} totalReviews={doctor.totalReviews} />
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Consultation Fee</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    ${doctor.consultationFee}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Next Available</p>
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    Slots Open Today
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 pt-2">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  About the Specialist
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {doctor.bio || 'Experienced medical specialist committed to evidence-based healthcare, compassionate patient evaluation, and preventive diagnostics.'}
                </p>
              </div>

              {/* Clinic Location */}
              <div className="space-y-2 pt-2">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Clinic & Hospital Location
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{doctor.clinicAddress || 'Hospital Main Outpatient Pavilion, 2nd Floor, Room 204'}, {doctor.clinicCity}</span>
                </p>
              </div>
            </div>

            {/* Weekly Availability Schedule */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" /> Weekly Working Hours
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {daysOfWeek.map((dayName, idx) => {
                  const dayNum = idx + 1;
                  const sched = doctor.weeklyAvailability?.find((s) => s.dayOfWeek === dayNum);
                  const isAvailable = sched && sched.isActive;

                  return (
                    <div
                      key={dayNum}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                        isAvailable
                          ? 'border-brand-200/80 dark:border-brand-800/80 bg-brand-50/40 dark:bg-brand-950/20'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-850 opacity-60'
                      }`}
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{dayName}</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {isAvailable
                          ? `${sched.startTime?.slice(0, 5)} - ${sched.endTime?.slice(0, 5)}`
                          : 'Off Duty'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient Reviews Section */}
            <div className="p-6 sm:p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-600" /> Patient Reviews ({reviews.length})
                </h3>
                <RatingStars rating={doctor.ratingAverage} totalReviews={doctor.totalReviews} />
              </div>

              {reviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No patient reviews yet. Be the first to leave a review after your appointment!
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                            {rev.patientName ? rev.patientName[0].toUpperCase() : 'P'}
                          </div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {rev.patientName || 'Verified Patient'}
                          </span>
                        </div>
                        <RatingStars rating={rev.rating} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment || 'Smooth consultation and thorough explanation of treatment options.'}
                      </p>
                      {rev.createdAt && (
                        <p className="text-[10px] text-slate-400">
                          {format(new Date(rev.createdAt), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Sticky Book CTA Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6 sticky top-24 shadow-xl">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Appointment Booking
                </span>
                <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Schedule Consultation
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${doctor.consultationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot Duration:</span>
                  <span className="font-bold text-slate-900 dark:text-white">30 Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cancellation:</span>
                  <span className="font-bold text-emerald-600">Free up to 2h before</span>
                </div>
              </div>

              <Link
                to={`/book/${doctor.id}`}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-center text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Select Date & Slot <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-2 text-[11px] text-slate-500">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Instant booking confirmation
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" /> 24h & 1h appointment reminders
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
