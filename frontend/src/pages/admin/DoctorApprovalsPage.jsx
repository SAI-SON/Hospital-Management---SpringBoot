import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Modal from '../../components/Modal';
import adminApi from '../../api/adminApi';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  Award,
  MapPin,
  Briefcase,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorApprovalsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterApproved, setFilterApproved] = useState(false); // Default to pending
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Reject modal state
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDoctors({
        approved: filterApproved === null ? undefined : filterApproved,
        page,
        size: 10,
      });
      setDoctors(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filterApproved, page]);

  const handleApprove = async (doc) => {
    if (!window.confirm(`Approve ${doc.fullName} for live clinical bookings?`)) return;

    try {
      await adminApi.approveDoctor(doc.id, { approved: true });
      toast.success(`${doc.fullName} has been approved and activated!`);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve doctor.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalDoc) return;

    setActionLoading(true);
    try {
      await adminApi.approveDoctor(rejectModalDoc.id, {
        approved: false,
        reason: rejectReason.trim() || 'Credentials verification was unsuccessful.',
      });
      toast.success(`${rejectModalDoc.fullName}'s application was rejected.`);
      setRejectModalDoc(null);
      setRejectReason('');
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject doctor.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Doctor Credentials Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review medical licenses, specialization board certificates, and approve doctors for outpatient appointments
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200/80 dark:bg-navy-900">
            <button
              type="button"
              onClick={() => {
                setFilterApproved(false);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterApproved === false
                  ? 'bg-white dark:bg-navy-800 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pending Verification
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterApproved(true);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterApproved === true
                  ? 'bg-white dark:bg-navy-800 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Approved Doctors
            </button>
          </div>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading doctor applications...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-16 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              No Doctors in this Queue
            </h3>
            <p className="text-xs text-slate-500">
              {filterApproved === false
                ? 'All doctor applications have been processed and verified!'
                : 'No approved doctors found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold flex items-center justify-center shrink-0">
                      {doc.fullName ? doc.fullName.replace('Dr. ', '')[0] : 'D'}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        {doc.fullName}
                      </h3>
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {doc.specialization?.name} • {doc.email}
                      </p>
                    </div>
                    <span
                      className={`ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        doc.isApproved
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {doc.isApproved ? 'Approved' : 'Pending Verification'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-navy-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">License</span>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{doc.licenseNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Experience</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{doc.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Fee</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">${doc.consultationFee}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">City</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{doc.clinicCity || 'N/A'}</p>
                    </div>
                  </div>

                  {doc.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      <strong>Bio:</strong> {doc.bio}
                    </p>
                  )}
                </div>

                {/* Approve / Reject buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {!doc.isApproved ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(doc)}
                        className="flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Doctor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalDoc(doc);
                          setRejectReason('');
                        }}
                        className="flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectModalDoc(doc);
                        setRejectReason('');
                      }}
                      className="py-2 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100"
                    >
                      Revoke Approval
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-4 text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      <Modal
        isOpen={!!rejectModalDoc}
        onClose={() => setRejectModalDoc(null)}
        title="Reject Doctor Application"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Specify reason for rejecting <strong>{rejectModalDoc?.fullName}</strong>. An administrative notification will be sent to their email.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rejection Reason</label>
            <textarea
              rows={4}
              required
              placeholder="e.g. License number unverified with state medical council, invalid board certifications..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs focus:ring-2 focus:ring-rose-500/50 outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalDoc(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
