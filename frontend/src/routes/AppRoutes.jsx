import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import LandingPage from '../pages/LandingPage';
import DoctorSearchPage from '../pages/patient/DoctorSearchPage';
import DoctorDetailPage from '../pages/patient/DoctorDetailPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CompleteProfilePage from '../pages/auth/CompleteProfilePage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Patient pages
import BookingWizardPage from '../pages/patient/BookingWizardPage';
import MyAppointmentsPage from '../pages/patient/MyAppointmentsPage';
import PatientProfilePage from '../pages/patient/PatientProfilePage';

// Doctor pages
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorAvailabilityPage from '../pages/doctor/DoctorAvailabilityPage';
import DoctorLeavesPage from '../pages/doctor/DoctorLeavesPage';
import DoctorAppointmentsPage from '../pages/doctor/DoctorAppointmentsPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import DoctorApprovalsPage from '../pages/admin/DoctorApprovalsPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AllAppointmentsPage from '../pages/admin/AllAppointmentsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/doctors" element={<DoctorSearchPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Patient Routes */}
      <Route
        path="/book/:doctorId"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <BookingWizardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorAvailabilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/leaves"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorLeavesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DoctorApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AllAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
