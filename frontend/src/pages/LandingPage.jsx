import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RatingStars from '../components/RatingStars';
import doctorApi from '../api/doctorApi';
import specializationApi from '../api/specializationApi';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Heart,
  Baby,
  Activity,
  Brain,
  Stethoscope,
  Smile,
  Flower2,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          specializationApi.getSpecializations(),
          doctorApi.searchDoctors({ page: 0, size: 6, sortBy: 'ratingAverage', sortDir: 'desc' }),
        ]);
        setSpecializations(specRes.data || []);
        setFeaturedDoctors(docRes.data?.content || []);
      } catch {
        // Fallbacks if backend starting up
      }
    };
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedSpecialization) params.append('specializationId', selectedSpecialization);
    navigate(`/doctors?${params.toString()}`);
  };

  const getSpecIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'heart': return Heart;
      case 'sparkles': return Sparkles;
      case 'baby': return Baby;
      case 'brain': return Brain;
      case 'stethoscope': return Stethoscope;
      case 'smile': return Smile;
      case 'flower2': return Flower2;
      default: return Activity;
    }
  };

  const faqs = [
    {
      q: 'How does MediBook prevent double booking of appointments?',
      a: 'Our booking engine uses database-level pessimistic write locking on individual time slots and strict unique constraints. When two patients pick the same slot simultaneously, only one transaction succeeds, preventing overlaps.',
    },
    {
      q: 'Can I cancel or reschedule my appointment?',
      a: 'Yes, patients can cancel or reschedule appointments anytime up to 2 hours before the scheduled appointment start time. Once cancelled, the slot is automatically released back to the availability pool.',
    },
    {
      q: 'Do I get visit reminders?',
      a: 'Absolutely. MediBook automatically sends email and in-app notifications 24 hours and 1 hour before your scheduled consultation.',
    },
    {
      q: 'Are all doctors certified and approved?',
      a: 'Yes. Every doctor registered on MediBook undergoes medical credential and license verification by our hospital administrative board before their profile is published.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 via-teal-400/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-500" />
              Direct Outpatient Healthcare Scheduling
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.15]"
            >
              Book appointments with{' '}
              <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                top verified doctors
              </span>{' '}
              in seconds.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Experience seamless clinical care. Browse doctor availability, select live time slots, and receive guaranteed conflict-free appointment confirmations.
            </motion.p>

            {/* Interactive Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearch}
              className="p-3 sm:p-4 rounded-3xl glass-card bg-white/90 dark:bg-navy-900/90 shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 max-w-3xl mx-auto mt-8"
            >
              <div className="flex-1 flex items-center gap-3 w-full px-3 py-2 bg-slate-50 dark:bg-navy-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Doctor name, clinic, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex-1 flex items-center gap-3 w-full px-3 py-2 bg-slate-50 dark:bg-navy-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <Stethoscope className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Search Slots <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>

            {/* Quick Metrics Banner */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Conflict-Safe
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-500" /> Board Certified Doctors
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" /> Real-time 30-Day Slots
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECIALIZATIONS GRID */}
      <section className="py-16 bg-white dark:bg-navy-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Medical Disciplines
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
                Explore by Specialization
              </h2>
            </div>
            <Link
              to="/doctors"
              className="text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Browse all specialists <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {specializations.map((spec) => {
              const Icon = getSpecIcon(spec.iconName);
              return (
                <Link
                  key={spec.id}
                  to={`/doctors?specializationId=${spec.id}`}
                  className="p-5 rounded-2xl glass-card bg-white dark:bg-navy-800/60 hover:border-brand-500/50 hover:shadow-glow transition-all group flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {spec.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Effortless Booking
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              How MediBook Works in 3 Steps
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              From search to verified confirmation in under 60 seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 relative">
              <span className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
                1
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Find Your Specialist
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Filter verified medical practitioners by specialization, location, ratings, fees, and patient reviews.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 relative">
              <span className="w-10 h-10 rounded-2xl bg-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-teal-500/20">
                2
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Select Date & Time Slot
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                View real-time doctor availability over the next 30 days and pick an exact appointment slot that fits your schedule.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 relative">
              <span className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
                3
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Instant Confirmation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive an immediate booking reference code, calendar invitation, and automated 24h & 1h appointment reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED TOP DOCTORS */}
      {featuredDoctors.length > 0 && (
        <section className="py-16 bg-white dark:bg-navy-900/60 border-y border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  Medical Excellence
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
                  Top Rated Medical Specialists
                </h2>
              </div>
              <Link
                to="/doctors"
                className="text-xs sm:text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                View all doctors <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-800/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-card transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-xl flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
                        {doc.fullName ? doc.fullName.replace('Dr. ', '')[0] : 'D'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base truncate">
                          {doc.fullName}
                        </h3>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {doc.specializationName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {doc.clinicCity || 'Medical Center'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                      <RatingStars rating={doc.ratingAverage} totalReviews={doc.totalReviews} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ${doc.consultationFee} <span className="text-[10px] text-slate-400 font-normal">/ visit</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/doctors/${doc.id}`}
                    className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs text-center text-white bg-slate-900 dark:bg-brand-600 hover:bg-brand-600 transition-colors shadow-sm"
                  >
                    View Schedule & Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FAQ SECTION */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Clear Answers
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
