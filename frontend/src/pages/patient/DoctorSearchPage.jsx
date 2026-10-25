import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import RatingStars from '../../components/RatingStars';
import doctorApi from '../../api/doctorApi';
import specializationApi from '../../api/specializationApi';
import {
  Search,
  Filter,
  MapPin,
  Stethoscope,
  Briefcase,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function DoctorSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specializationId, setSpecializationId] = useState(searchParams.get('specializationId') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState('ratingAverage');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await specializationApi.getSpecializations();
        setSpecializations(res.data || []);
      } catch {
        // Ignore
      }
    };
    fetchSpecializations();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 9,
        search: search.trim() || undefined,
        specializationId: specializationId || undefined,
        city: city.trim() || undefined,
        maxFee: maxFee || undefined,
        minRating: minRating || undefined,
        sortBy,
        sortDir,
      };

      const res = await doctorApi.searchDoctors(params);
      setDoctors(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, specializationId, sortBy, sortDir]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDoctors();
  };

  const handleReset = () => {
    setSearch('');
    setSpecializationId('');
    setCity('');
    setMaxFee('');
    setMinRating('');
    setSortBy('ratingAverage');
    setSortDir('desc');
    setPage(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Find Medical Specialists
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse through {totalElements} verified hospital doctors and pick your appointment slot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTER SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-600" /> Filter Doctors
                </h3>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-400 hover:text-brand-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <form onSubmit={handleFilterSubmit} className="space-y-4">
                {/* Search Keyword */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Doctor / Keyword</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Name or bio..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specialization</label>
                  <select
                    value={specializationId}
                    onChange={(e) => setSpecializationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none cursor-pointer"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinic City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Springfield"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* Max Fee */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Fee ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    min="0"
                    step="10"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none"
                  />
                </div>

                {/* Min Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Minimum Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-brand-500/50 outline-none cursor-pointer"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-md shadow-brand-500/20"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* DOCTOR RESULTS */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort & Results Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Showing <strong className="text-slate-900 dark:text-white">{doctors.length}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{totalElements}</strong> specialists
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="ratingAverage">Highest Rating</option>
                  <option value="consultationFee">Consultation Fee</option>
                  <option value="yearsOfExperience">Experience</option>
                  <option value="fullName">Doctor Name</option>
                </select>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>

            {/* Doctors Grid */}
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading medical specialists...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-16 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <Stethoscope className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  No Doctors Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search criteria, fee range, or selected specialization.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-card hover:border-brand-500/30 transition-all"
                  >
                    <div className="space-y-4">
                      {/* Doctor header */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-black text-lg flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
                          {doc.fullName ? doc.fullName.replace('Dr. ', '')[0] : 'D'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
                            {doc.fullName}
                          </h3>
                          <span className="inline-block mt-0.5 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                            {doc.specializationName}
                          </span>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {doc.clinicCity || 'Hospital Clinic'}
                          </p>
                        </div>
                      </div>

                      {/* Stats pill */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-navy-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">Experience</p>
                          <p className="font-bold text-slate-900 dark:text-white">{doc.yearsOfExperience} years</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">Fee</p>
                          <p className="font-bold text-slate-900 dark:text-white">${doc.consultationFee}</p>
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="pt-1">
                        <RatingStars rating={doc.ratingAverage} totalReviews={doc.totalReviews} />
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Link
                        to={`/doctors/${doc.id}`}
                        className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/book/${doc.id}`}
                        className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:opacity-95 shadow-sm shadow-brand-500/20 flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-4 text-slate-600 dark:text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
