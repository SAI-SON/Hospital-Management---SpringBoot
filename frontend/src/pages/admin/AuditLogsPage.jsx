import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminApi from '../../api/adminApi';
import {
  FileText,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        action: actionFilter.trim() || undefined,
        page,
        size: 15,
      });
      setLogs(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            Security & System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of key actions, doctor verifications, security locks, and cancellations
          </p>
        </div>

        {/* Filter */}
        <div className="p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 text-xs">
          <Filter className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-xs outline-none cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="APPROVE_DOCTOR">APPROVE_DOCTOR</option>
            <option value="REJECT_DOCTOR">REJECT_DOCTOR</option>
            <option value="LOCK_USER">LOCK_USER</option>
            <option value="UNLOCK_USER">UNLOCK_USER</option>
            <option value="SUBMIT_REVIEW">SUBMIT_REVIEW</option>
            <option value="CANCEL_APPOINTMENT">CANCEL_APPOINTMENT</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-navy-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Initiated By</th>
                  <th className="py-4 px-6">Target Entity</th>
                  <th className="py-4 px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      <p className="mt-2">Loading audit trail...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500">
                      No audit entries recorded.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                        {log.userEmail}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        {log.entityName} #{log.entityId}
                      </td>
                      <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                        {log.details || '—'}
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
