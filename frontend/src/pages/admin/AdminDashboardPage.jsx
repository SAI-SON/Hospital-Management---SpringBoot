import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import adminApi from '../../api/adminApi';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="flex items-center justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      </DashboardLayout>
    );
  }

  const dailyTrend = stats?.appointmentsPerDay?.map((d) => ({
    name: d.date?.slice(5) || d.date,
    appointments: d.count,
  })) || [];

  const specStats = stats?.appointmentsPerSpecialization?.map((s) => ({
    name: s.specialization,
    count: s.count,
  })) || [];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Hospital System Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time platform metrics, revenue tracking, and doctor verification oversight
            </p>
          </div>
          {stats?.pendingDoctorApprovals > 0 && (
            <Link
              to="/admin/doctors"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto animate-pulse"
            >
              <AlertCircle className="w-4 h-4" /> {stats.pendingDoctorApprovals} Doctors Awaiting Approval
            </Link>
          )}
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Registered Patients</span>
              <Users className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              {stats?.totalPatients || 0}
            </p>
            <p className="text-[11px] text-slate-500">Active customer accounts</p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Verified Doctors</span>
              <UserCheck className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              {stats?.totalDoctors || 0}
            </p>
            <p className="text-[11px] text-slate-500">{stats?.pendingDoctorApprovals || 0} pending review</p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Bookings</span>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              {stats?.totalAppointments || 0}
            </p>
            <p className="text-[11px] text-slate-500">{stats?.todayAppointments || 0} today</p>
          </div>

          <div className="p-5 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Consultation Revenue</span>
              <DollarSign className="w-4 h-4 text-coral-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
              ${stats?.totalRevenue || 0}
            </p>
            <p className="text-[11px] text-slate-500">From completed visits</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Appointment Volume Chart */}
          <div className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" /> 7-Day Booking Trend
              </h3>
              <span className="text-[11px] text-slate-400">Past 7 days</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Specialization Distribution Chart */}
          <div className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" /> Bookings by Specialization
              </h3>
              <span className="text-[11px] text-slate-400">Distribution</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Appointment Status Cards Grid */}
        <div className="p-6 rounded-3xl glass-card bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Appointment Status Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">PENDING</span>
              <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                {stats?.appointmentsByStatus?.PENDING || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">CONFIRMED</span>
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                {stats?.appointmentsByStatus?.CONFIRMED || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase">COMPLETED</span>
              <p className="text-xl font-extrabold text-teal-700 dark:text-teal-300 mt-1">
                {stats?.appointmentsByStatus?.COMPLETED || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">CANCELLED</span>
              <p className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                {stats?.appointmentsByStatus?.CANCELLED || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">NO SHOW</span>
              <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                {stats?.appointmentsByStatus?.NO_SHOW || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
