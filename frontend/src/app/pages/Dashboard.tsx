import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Users,
  Calendar,
  Clock,
  MoreVertical,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi, appointmentsApi } from '../../lib/api';
import type { DashboardStats, Appointment } from '../../lib/types';
import { useAuth } from '../context/AuthContext';
import { format, isToday, parseISO } from 'date-fns';

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-amber-100 text-amber-600',
  COMPLETED: 'bg-blue-100 text-blue-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const firstName = user?.first_name || user?.username || 'there';

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    // Fetch today's appointments for the activity feed
    appointmentsApi
      .list({ date: new Date().toISOString().split('T')[0], page: 1 })
      .then((res) => setRecentAppointments(res.data.results ?? []))
      .catch(console.error)
      .finally(() => setLoadingActivity(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Today's Appointments",
          value: stats.todays_appointments,
          icon: Calendar,
          color: 'bg-blue-500',
        },
        {
          label: 'New Patients (7 days)',
          value: stats.new_patients,
          icon: Users,
          color: 'bg-emerald-500',
        },
        {
          label: 'Pending Appointments',
          value: stats.pending_appointments,
          icon: Clock,
          color: 'bg-amber-500',
        },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Clinic Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {firstName}. Here's what's happening today.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-sm"
          >
            + New Appointment
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loadingStats
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-24 animate-pulse"
              />
            ))
          : statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center group hover:border-brand-blue/30 transition-colors"
              >
                <div
                  className={`size-12 rounded-lg ${stat.color} flex items-center justify-center text-white shrink-0 shadow-md`}
                >
                  <stat.icon className="size-6" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider leading-none mb-2">
                    {stat.label}
                  </p>
                  <span className="text-2xl font-bold text-slate-900 leading-none">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 tracking-tight">
              Patient Traffic (Last 7 days)
            </h3>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase">
              <span className="size-2 bg-brand-blue rounded-full" />
              <span>Total Visits</span>
            </div>
          </div>
          <div className="h-72 w-full">
            {loadingStats ? (
              <div className="h-full bg-slate-50 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chart_data ?? []}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182CE" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="#3182CE"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPatients)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Today's appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 tracking-tight">
              Today's Activity
            </h3>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="size-4" />
            </button>
          </div>

          <div className="p-2 flex-1 overflow-y-auto max-h-[380px]">
            {loadingActivity ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 mb-1 bg-slate-50 rounded-lg animate-pulse h-16"
                />
              ))
            ) : recentAppointments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No appointments today.
              </div>
            ) : (
              recentAppointments.map((appt) => {
                const patient = appt.patient_details;
                const name = `${patient.first_name} ${patient.last_name}`;
                const time = format(parseISO(appt.scheduled_at), 'h:mm a');
                return (
                  <div
                    key={appt.id}
                    onClick={() => navigate(`/records/${patient.id}`)}
                    className="p-4 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-blue transition-colors">
                        {name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                        {time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {patient.matric_number}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {appt.reason || 'Consultation'}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                          STATUS_STYLES[appt.status]
                        )}
                      >
                        {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => navigate('/appointments')}
            className="p-4 text-center text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors uppercase tracking-widest border-t border-slate-100"
          >
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  );
}