import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { ClinicalRecord } from './pages/ClinicalRecord';
import { StaffManagement } from './pages/StaffManagement';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'patients', Component: Patients },
      { path: 'appointments', Component: Appointments },
      { path: 'records/:patientId', Component: ClinicalRecord },
      { path: 'staff', Component: StaffManagement },
    ],
  },
]);