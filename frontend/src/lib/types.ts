export type Role = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_active: boolean;
  date_joined?: string;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  matric_number: string;
  date_of_birth: string;
  phone_number: string;
  email: string;
  address: string;
  category: 'STUDENT' | 'STAFF';
  blood_group: string;
  allergies: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  patient: number;
  doctor: number;
  scheduled_at: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
  doctor_details: User;
  patient_details: Patient;
}

export interface MedicalRecord {
  id: number;
  appointment: number;
  diagnosis: string;
  treatment_plan: string;
  prescriptions: string;
  follow_up_instructions: string;
  created_at: string;
  updated_at: string;
  appointment_details?: Appointment;
}

export interface DashboardChartPoint {
  date: string;
  day: string;
  patients: number;
}

export interface DashboardStats {
  todays_appointments: number;
  new_patients: number;
  pending_appointments: number;
  chart_data: DashboardChartPoint[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TokenPair {
  access: string;
  refresh: string;
}
