// ── Users / Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
}

// ── Patients ──────────────────────────────────────────────────────────────────
export type PatientCategory = 'STUDENT' | 'STAFF';

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  matric_number: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  address: string;
  category: PatientCategory;
  blood_group: string;
  allergies: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

// ── Appointments ──────────────────────────────────────────────────────────────
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  patient: number;
  doctor: number;
  scheduled_at: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
  doctor_details: User;
  patient_details: Patient;
}

// ── Medical Records ────────────────────────────────────────────────────────────
export interface MedicalRecord {
  id: number;
  appointment: number;
  diagnosis: string;
  treatment_plan: string;
  prescriptions: string;
  follow_up_instructions: string;
  created_at: string;
  updated_at: string;
  appointment_details: Appointment;
}

// ── Pagination wrapper ─────────────────────────────────────────────────────────
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export interface DashboardStats {
  todays_appointments: number;
  new_patients: number;
  pending_appointments: number;
  chart_data: Array<{ date: string; day: string; patients: number }>;
}