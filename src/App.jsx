import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import VehicleRegistry from "./pages/VehicleRegistry";
import TripDispatcher from "./pages/TripDispatcher";
import Maintenance from "./pages/Maintenance";
import TripAndExpense from "./pages/TripAndExpense";
import Performance from "./pages/Performance";
import Analytics from "./pages/Analytics";

const ROLES = {
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCE_ANALYST: "Finance Analyst",
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — all roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Fleet Manager only */}
          <Route
            path="/vehicle-registry"
            element={
              <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER]}>
                <VehicleRegistry />
              </ProtectedRoute>
            }
          />

          {/* Dispatcher only */}
          <Route
            path="/trip-dispatcher"
            element={
              <ProtectedRoute allowedRoles={[ROLES.DISPATCHER]}>
                <TripDispatcher />
              </ProtectedRoute>
            }
          />

          {/* Fleet Manager + Safety Officer */}
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]}>
                <Maintenance />
              </ProtectedRoute>
            }
          />

          {/* Finance Analyst only */}
          <Route
            path="/trip-expense"
            element={
              <ProtectedRoute allowedRoles={[ROLES.FINANCE_ANALYST]}>
                <TripAndExpense />
              </ProtectedRoute>
            }
          />

          {/* Safety Officer only */}
          <Route
            path="/performance"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SAFETY_OFFICER]}>
                <Performance />
              </ProtectedRoute>
            }
          />

          {/* Finance Analyst + Fleet Manager */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={[ROLES.FINANCE_ANALYST, ROLES.FLEET_MANAGER]}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
