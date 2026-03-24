import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock3,
  X,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format, addDays, parseISO } from 'date-fns';
import { appointmentsApi, patientsApi, usersApi } from '../../lib/api';
import type { Appointment, Patient, User, Paginated } from '../../lib/types';

const inputCls =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm';

function statusStyle(s: string) {
  if (s === 'SCHEDULED') return 'bg-blue-100 text-blue-700';
  if (s === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
  return 'bg-red-100 text-red-700';
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'SCHEDULED') return <Clock3 className="size-3 mr-1.5" />;
  if (status === 'COMPLETED') return <CheckCircle className="size-3 mr-1.5" />;
  return <XCircle className="size-3 mr-1.5" />;
}

const TABS = ['Today', 'Tomorrow', 'This Week'] as const;
type Tab = (typeof TABS)[number];

function tabToDate(tab: Tab): string | undefined {
  if (tab === 'Today') return format(new Date(), 'yyyy-MM-dd');
  if (tab === 'Tomorrow') return format(addDays(new Date(), 1), 'yyyy-MM-dd');
  return undefined;
}

export function Appointments() {
  const [data, setData] = useState<Paginated<Appointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [page, setPage] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function load(tab: Tab, p: number) {
    setLoading(true);
    appointmentsApi
      .list({ date: tabToDate(tab), page: p })
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(activeTab, page);
  }, [activeTab, page]);

  async function handleStatusChange(id: number, status: string) {
    setUpdatingId(id);
    try {
      await appointmentsApi.update(id, { status });
      setData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((a) =>
                a.id === id ? { ...a, status: status as Appointment['status'] } : a
              ),
            }
          : prev
      );
      toast.success('Status updated.');
    } catch {
      toast.error('Failed to update.');
    } finally {
      setUpdatingId(null);
    }
  }

  const appointments = data?.results ?? [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Appointment Scheduler
          </h1>
          <p className="text-slate-500 mt-1">View and manage all upcoming patient visits.</p>
        </div>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-all shadow-md active:scale-95"
        >
          <Plus className="size-4" />
          <span>New Appointment</span>
        </button>
      </header>

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button
            disabled={!data?.previous}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm font-bold text-slate-900 min-w-32 text-center uppercase tracking-widest">
            {format(new Date(), 'MMM d, yyyy')}
          </span>
          <button
            disabled={!data?.next}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-40"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="hidden md:block w-px h-6 bg-slate-200" />
          <button className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg">
            <Calendar className="size-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-1/2" />
            </div>
          ))
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No appointments {activeTab.toLowerCase()}.
          </div>
        ) : (
          appointments.map((appt) => {
            const patient = appt.patient_details;
            const doctor = appt.doctor_details;
            const time = format(parseISO(appt.scheduled_at), 'h:mm a');
            const dateLabel = format(parseISO(appt.scheduled_at), 'MMM d');
            const doctorName =
              [doctor.first_name, doctor.last_name].filter(Boolean).join(' ') ||
              doctor.username;
            const patientName = `${patient.first_name} ${patient.last_name}`;

            return (
              <div
                key={appt.id}
                className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="size-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                      {format(parseISO(appt.scheduled_at), 'MMM')}
                    </span>
                    <span className="text-lg font-bold text-brand-navy leading-none">
                      {format(parseISO(appt.scheduled_at), 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                      {patientName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center">
                        <Clock className="size-3.5 mr-1.5 text-slate-400" />
                        {time}
                      </span>
                      <span className="flex items-center">
                        <span className="size-1.5 bg-slate-300 rounded-full mr-2" />
                        {patient.matric_number}
                      </span>
                      <span className="flex items-center">
                        <span className="size-1.5 bg-slate-300 rounded-full mr-2" />
                        Dr. {doctorName}
                      </span>
                      {appt.reason && (
                        <span className="flex items-center">
                          <span className="size-1.5 bg-slate-300 rounded-full mr-2" />
                          {appt.reason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 self-end md:self-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyle(appt.status)}`}
                  >
                    <StatusIcon status={appt.status} />
                    {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                  </span>
                  <div className="h-8 w-px bg-slate-100 hidden md:block" />
                  <div className="flex items-center space-x-2">
                    {appt.status === 'SCHEDULED' && (
                      <>
                        <button
                          disabled={updatingId === appt.id}
                          onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Complete
                        </button>
                        <button
                          disabled={updatingId === appt.id}
                          onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New appointment panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <NewAppointmentPanel
            onClose={() => setIsPanelOpen(false)}
            onCreated={() => {
              setIsPanelOpen(false);
              load(activeTab, page);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── New Appointment slide-out panel ───────────────────────────────────────────
function NewAppointmentPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    scheduled_at: '',
    reason: '',
    notes: '',
    status: 'SCHEDULED',
  });

  // Load doctors once on mount
  useEffect(() => {
    Promise.all([
      usersApi.doctors(),
      patientsApi.list({ page: 1 }),
    ])
      .then(([docRes, patRes]) => {
        setDoctors(docRes.data);
        setPatients(patRes.data.results ?? []);
      })
      .catch(() => toast.error('Could not load doctors or patients.'))
      .finally(() => setLoadingSelects(false));
  }, []);

  // Search patients as user types
  useEffect(() => {
    if (!patientSearch) return;
    const t = setTimeout(() => {
      patientsApi.list({ search: patientSearch }).then((res) => {
        setPatients(res.data.results ?? []);
      });
    }, 350);
    return () => clearTimeout(t);
  }, [patientSearch]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await appointmentsApi.create({
        ...form,
        patient: Number(form.patient),
        doctor: Number(form.doctor),
      });
      toast.success('Appointment scheduled!');
      onCreated();
    } catch (err: any) {
      const msgs = err?.response?.data;
      const text = msgs
        ? Object.values(msgs as Record<string, string[]>).flat().join(' ')
        : 'Failed to schedule appointment.';
      toast.error(text);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-navy/30 backdrop-blur-sm z-50 cursor-pointer"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Schedule Appointment
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the details for the new patient visit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="size-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {loadingSelects ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Patient search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Patient
                </label>
                <input
                  type="text"
                  placeholder="Search by name or matric no..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className={inputCls}
                />
                <select
                  required
                  value={form.patient}
                  onChange={(e) => set('patient', e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select patient —</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} — {p.matric_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Doctor
                </label>
                <select
                  required
                  value={form.doctor}
                  onChange={(e) => set('doctor', e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select doctor —</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {[d.first_name, d.last_name].filter(Boolean).join(' ') || d.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Date &amp; Time
                </label>
                <input
                  required
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => set('scheduled_at', e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => set('reason', e.target.value)}
                  placeholder="e.g. General consultation"
                  className={inputCls}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Add any specific concerns or medical context..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </>
          )}
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              document.querySelector<HTMLFormElement>('form')?.requestSubmit();
            }}
            disabled={saving || loadingSelects}
            className="flex-1 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? 'Scheduling…' : 'Confirm Schedule'}
          </button>
        </div>
      </motion.div>
    </>
  );
}