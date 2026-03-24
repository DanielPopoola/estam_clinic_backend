import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  Save,
  Printer,
  CheckCircle,
  Clipboard,
  History,
  Activity,
  Droplet,
  Thermometer,
  Eye,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { format, parseISO, differenceInYears } from 'date-fns';
import { patientsApi, appointmentsApi, recordsApi } from '../../lib/api';
import type { Patient, Appointment, MedicalRecord } from '../../lib/types';
import { useAuth } from '../context/AuthContext';

export function ClinicalRecord() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { isDoctor } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestAppointment, setLatestAppointment] = useState<Appointment | null>(null);
  const [existingRecord, setExistingRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    diagnosis: '',
    treatment_plan: '',
    prescriptions: '',
    follow_up_instructions: '',
  });
  const [saving, setSaving] = useState(false);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Load patient, their latest appointment, and any existing medical record
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);

    patientsApi
      .get(Number(patientId))
      .then(async (patRes) => {
        const p: Patient = patRes.data;
        setPatient(p);

        // Get the most recent appointment for this patient
        const apptRes = await appointmentsApi.list({ page: 1 });
        const allAppts: Appointment[] = apptRes.data.results ?? [];
        const patientAppt = allAppts.find(
          (a) => a.patient_details?.id === p.id || a.patient === p.id
        );

        if (patientAppt) {
          setLatestAppointment(patientAppt);

          // Check if there's already a medical record for this appointment
          const recordsRes = await recordsApi.list();
          const allRecords: MedicalRecord[] = recordsRes.data.results ?? [];
          const existingRec = allRecords.find(
            (r) => r.appointment === patientAppt.id
          );
          if (existingRec) {
            setExistingRecord(existingRec);
            setForm({
              diagnosis: existingRec.diagnosis,
              treatment_plan: existingRec.treatment_plan,
              prescriptions: existingRec.prescriptions,
              follow_up_instructions: existingRec.follow_up_instructions,
            });
          }
        }
      })
      .catch(() => toast.error('Failed to load patient data.'))
      .finally(() => setLoading(false));
  }, [patientId]);

  async function handleSave() {
    if (!latestAppointment) {
      toast.error('No appointment found for this patient.');
      return;
    }
    setSaving(true);
    try {
      if (existingRecord) {
        const res = await recordsApi.update(existingRecord.id, form);
        setExistingRecord(res.data);
        toast.success('Medical record updated.');
      } else {
        const res = await recordsApi.create({
          appointment: latestAppointment.id,
          ...form,
        });
        setExistingRecord(res.data);
        toast.success('Medical record saved.');
      }
    } catch (err: any) {
      const msgs = err?.response?.data;
      const text = msgs
        ? Object.values(msgs as Record<string, string[]>).flat().join(' ')
        : 'Failed to save record.';
      toast.error(text);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    await handleSave();
    toast.success('Visit finalized and patient cleared.');
    navigate('/appointments');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20 text-slate-400">Patient not found.</div>
    );
  }

  const dob = patient.date_of_birth ? parseISO(patient.date_of_birth) : null;
  const age = dob ? differenceInYears(new Date(), dob) : null;
  const dobDisplay = dob
    ? `${format(dob, 'dd MMM yyyy')}${age !== null ? ` (${age} yrs)` : ''}`
    : '—';

  const allergyList = patient.allergies
    ? patient.allergies.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const initials = `${patient.first_name[0] ?? ''}${patient.last_name[0] ?? ''}`.toUpperCase();

  const doctorName = latestAppointment
    ? [latestAppointment.doctor_details.first_name, latestAppointment.doctor_details.last_name]
        .filter(Boolean)
        .join(' ') || latestAppointment.doctor_details.username
    : null;

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
          >
            <ArrowLeft className="size-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Record Entry
            </h1>
            <p className="text-slate-500 mt-1">
              Patient Encounter: {patient.first_name} {patient.last_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {existingRecord && (
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
              Record exists
            </span>
          )}
          {latestAppointment && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
              Appt:{' '}
              {format(parseISO(latestAppointment.scheduled_at), 'h:mm a')}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Patient profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-brand-navy text-white">
              <div className="flex items-center space-x-4">
                <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/20">
                  {initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-none mb-1">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-widest">
                    {patient.matric_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    DOB / Age
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{dobDisplay}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Category
                  </p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {patient.category.charAt(0) + patient.category.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {patient.phone_number && (
                  <div className="flex items-center text-sm">
                    <Phone className="size-4 text-slate-400 mr-3 shrink-0" />
                    <span className="text-slate-600 font-medium">{patient.phone_number}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="size-4 text-slate-400 mr-3 shrink-0" />
                    <span className="text-slate-600 font-medium">{patient.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                {patient.emergency_contact_name && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <History className="size-3 mr-1.5" /> Emergency Contact
                    </p>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                      {patient.emergency_contact_name}
                      {patient.emergency_contact_phone &&
                        ` (${patient.emergency_contact_phone})`}
                    </p>
                  </div>
                )}

                {allergyList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allergyList.map((allergy) => (
                        <span
                          key={allergy}
                          className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-100"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-50 pb-2">
              Patient Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {patient.blood_group && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center space-x-3">
                  <Droplet className="size-4 text-brand-blue" />
                  <div>
                    <p className="text-[9px] font-bold text-blue-500 uppercase">Blood</p>
                    <p className="text-sm font-bold text-brand-navy">{patient.blood_group}</p>
                  </div>
                </div>
              )}
              {doctorName && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center space-x-3">
                  <User className="size-4 text-purple-600" />
                  <div>
                    <p className="text-[9px] font-bold text-purple-500 uppercase">Doctor</p>
                    <p className="text-xs font-bold text-brand-navy truncate">{doctorName}</p>
                  </div>
                </div>
              )}
              {latestAppointment && (
                <div className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                    Latest Appointment
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {format(parseISO(latestAppointment.scheduled_at), 'MMM d, yyyy — h:mm a')}
                  </p>
                  {latestAppointment.reason && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{latestAppointment.reason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Clinical form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center tracking-tight">
                <Clipboard className="size-5 mr-3 text-brand-blue" />
                Consultation Details
              </h3>
              {!isDoctor && (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded uppercase tracking-wider">
                  Read-only (Receptionist)
                </span>
              )}
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
              <FormArea
                label="Diagnosis / Chief Complaints"
                value={form.diagnosis}
                onChange={(v) => setField('diagnosis', v)}
                placeholder="Describe patient symptoms and initial diagnosis..."
                disabled={!isDoctor}
              />
              <FormArea
                label="Treatment Plan & Procedures"
                value={form.treatment_plan}
                onChange={(v) => setField('treatment_plan', v)}
                placeholder="Outline the medical procedure or immediate care provided..."
                disabled={!isDoctor}
              />
              <FormArea
                label="Prescriptions (Medications)"
                value={form.prescriptions}
                onChange={(v) => setField('prescriptions', v)}
                placeholder="Enter medications, dosage, and frequency..."
                disabled={!isDoctor}
              />
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Follow-up Instructions
                </label>
                <input
                  type="text"
                  value={form.follow_up_instructions}
                  onChange={(e) => setField('follow_up_instructions', e.target.value)}
                  placeholder="E.g. Return in 7 days if symptoms persist"
                  disabled={!isDoctor}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar — only doctors can save */}
      {isDoctor && (
        <footer className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 h-20 shadow-2xl shadow-slate-900/10">
          <div className="max-w-screen-2xl mx-auto h-full px-8 flex items-center justify-between">
            <div className="flex items-center text-slate-500 text-xs font-medium">
              {existingRecord && (
                <span className="flex items-center mr-4">
                  <span className="size-2 bg-emerald-500 rounded-full mr-2" />
                  Record saved
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="size-4" />
                <span>Save Draft</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm">
                <Printer className="size-4" />
                <span>Print Rx</span>
              </button>
              <button
                onClick={handleFinalize}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-brand-navy/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                <span>Finalize Visit</span>
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function FormArea({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm leading-relaxed resize-none disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}