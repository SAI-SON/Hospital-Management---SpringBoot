import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/Badge';
import adminApi from '../../api/adminApi';
import {
  Calendar,
  Clock,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from 'lucide-react';

export default function AllAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllAppointments({
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        size: 15,
      });
      setAppointments(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, status, fromDate, toDate]);

  const handleReset = () => {
    setStatus('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Hospital Appointment Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete hospital-wide appointment registry ({totalElements} total bookings)
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-brand-600" /> Filters:
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
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

          <div className="flex items-center gap-2">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(0);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(0);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs outline-none"
            />
          </div>

          {(status || fromDate || toDate) && (
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto text-xs font-bold text-slate-400 hover:text-brand-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-850 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Reference No</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Doctor</th>
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      <p className="mt-2">Loading appointments...</p>
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {a.referenceNo}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                        {a.patientName}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{a.doctorName}</p>
                          <p className="text-[10px] text-brand-600 dark:text-brand-400">{a.doctorSpecialization}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {a.appointmentDate} at {a.startTime?.slice(0, 5)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge status={a.status} />
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        ${a.doctorFee}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Page {page + 1} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
