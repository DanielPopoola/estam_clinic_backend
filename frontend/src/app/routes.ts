import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { Appointments } from "./pages/Appointments";
import { ClinicalRecord } from "./pages/ClinicalRecord";
import { StaffManagement } from "./pages/StaffManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "patients",
        Component: Patients,
      },
      {
        path: "appointments",
        Component: Appointments,
      },
      {
        path: "records/:patientId",
        Component: ClinicalRecord,
      },
      {
        path: "staff",
        Component: StaffManagement,
      },
    ],
  },
]);
