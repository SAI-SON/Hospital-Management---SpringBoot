import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/Badge';
import adminApi from '../../api/adminApi';
import {
  Users,
  Search,
  Lock,
  Unlock,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        page,
        size: 15,
      });
      setUsers(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleLock = async (user) => {
    const isCurrentlyLocked = !!user.lockUntil;
    const action = isCurrentlyLocked ? 'unlock' : 'lock';
    if (!window.confirm(`Are you sure you want to ${action} ${user.email}?`)) return;

    try {
      await adminApi.toggleUserLock(user.id, isCurrentlyLocked);
      toast.success(`User ${user.email} ${isCurrentlyLocked ? 'unlocked' : 'locked'}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user.`);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage registered patient and doctor accounts, failed login lockouts, and security suspensions
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-brand-600 hover:opacity-90"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="ROLE_PATIENT">Patients</option>
              <option value="ROLE_DOCTOR">Doctors</option>
              <option value="ROLE_ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-navy-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Security / Lock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                      <p className="mt-2">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-500">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isLocked = !!u.lockUntil;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{u.fullName}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                            {u.phoneNumber && u.phoneNumber !== 'N/A' && (
                              <p className="text-[10px] text-slate-400">{u.phoneNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {u.role?.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge status={u.status} />
                        </td>
                        <td className="py-4 px-6">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <Lock className="w-3.5 h-3.5" /> Locked (5 fails)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isLocked ? (
                              <button
                                type="button"
                                onClick={() => handleToggleLock(u)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold text-[11px] flex items-center gap-1"
                                title="Unlock Account"
                              >
                                <Unlock className="w-3.5 h-3.5" /> Unlock
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleLock(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px]"
                                title="Lock Account"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                u.status === 'ACTIVE'
                                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
