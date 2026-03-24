import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Download,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { patientsApi } from '../../lib/api';
import type { Patient, Paginated } from '../../lib/types';

const CATEGORY_LABELS: Record<string, string> = {
  All: '',
  Students: 'STUDENT',
  Staff: 'STAFF',
};

export function Patients() {
  const navigate = useNavigate();

  const [data, setData] = useState<Paginated<Patient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch patients whenever filter / search / page changes
  useEffect(() => {
    setLoading(true);
    patientsApi
      .list({
        search: searchQuery || undefined,
        category: CATEGORY_LABELS[filter] || undefined,
        page,
      })
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load patients.'))
      .finally(() => setLoading(false));
  }, [filter, searchQuery, page]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, 350);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this patient? This cannot be undone.'))
      return;
    setDeleting(id);
    try {
      await patientsApi.delete(id);
      toast.success('Patient deleted.');
      setData((prev) =>
        prev
          ? { ...prev, results: prev.results.filter((p) => p.id !== id), count: prev.count - 1 }
          : prev
      );
    } catch {
      toast.error('Failed to delete patient.');
    } finally {
      setDeleting(null);
    }
  }

  const patients = data?.results ?? [];

  return (
    <div className="space-y-6 max-w-(--breakpoint-2xl) mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Directory
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and access all patient records centrally.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="size-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === cat
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or matric no..."
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Matric Number
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Full Name
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Phone
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {patients.map((patient) => (
                    <motion.tr
                      key={patient.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                          {patient.matric_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="size-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs mr-3 border border-slate-200">
                            {`${patient.first_name[0] ?? ''}${patient.last_name[0] ?? ''}`.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {patient.first_name} {patient.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="size-3.5 mr-2 text-slate-400" />
                          {patient.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="size-3.5 mr-2 text-slate-400" />
                          {patient.email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            patient.category === 'STAFF'
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {patient.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/records/${patient.id}`)}
                            className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                            title="View Records"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            disabled={deleting === patient.id}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Showing{' '}
            <span className="text-slate-900">{patients.length}</span> of{' '}
            <span className="text-slate-900">{data?.count ?? 0}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <button
              disabled={!data?.previous}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              disabled={!data?.next}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Patient panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <AddPatientPanel
            onClose={() => setIsPanelOpen(false)}
            onCreated={(p) => {
              setData((prev) =>
                prev
                  ? { ...prev, results: [p, ...prev.results], count: prev.count + 1 }
                  : prev
              );
              setIsPanelOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Add Patient slide-out panel ───────────────────────────────────────────────
function AddPatientPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Patient) => void;
}) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    matric_number: '',
    date_of_birth: '',
    phone_number: '',
    email: '',
    category: 'STUDENT',
    blood_group: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await patientsApi.create(form);
      toast.success('Patient registered successfully!');
      onCreated(res.data);
    } catch (err: any) {
      const msg =
        err?.response?.data &&
        Object.values(err.response.data as Record<string, string[]>)
          .flat()
          .join(' ');
      toast.error(msg || 'Failed to register patient.');
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
              Register New Patient
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the patient's details below.
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name">
              <input required value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="Jane" className={inputCls} />
            </Field>
            <Field label="Last Name">
              <input required value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Doe" className={inputCls} />
            </Field>
          </div>
          <Field label="Matric Number">
            <input required value={form.matric_number} onChange={(e) => set('matric_number', e.target.value)} placeholder="EUC/23/CS/042" className={inputCls} />
          </Field>
          <Field label="Date of Birth">
            <input required type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Phone Number">
            <input required value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} placeholder="+234 801 234 5678" className={inputCls} />
          </Field>
          <Field label="Email (optional)">
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="patient@estam.edu" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
              </select>
            </Field>
            <Field label="Blood Group">
              <select value={form.blood_group} onChange={(e) => set('blood_group', e.target.value)} className={inputCls}>
                <option value="">Unknown</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Known Allergies (comma-separated)">
            <input value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Penicillin, Dust" className={inputCls} />
          </Field>
          <Field label="Emergency Contact Name">
            <input value={form.emergency_contact_name} onChange={(e) => set('emergency_contact_name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Emergency Contact Phone">
            <input value={form.emergency_contact_phone} onChange={(e) => set('emergency_contact_phone', e.target.value)} className={inputCls} />
          </Field>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center space-x-3">
          <button onClick={onClose} type="button" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={(e) => { e.preventDefault(); document.querySelector<HTMLFormElement>('form')?.requestSubmit(); }}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Saving…' : 'Register Patient'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm';