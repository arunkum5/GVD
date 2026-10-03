import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/LoginPage'
import AppShell from '@/components/layout/AppShell'
import CustomerPortal from '@/pages/customer/CustomerPortal'
import StaffDashboard from '@/pages/staff/StaffDashboard'
import CreateJobCard from '@/pages/staff/CreateJobCard'
import JobCardDetail from '@/pages/staff/JobCardDetail'
import TechnicianDashboard from '@/pages/technician/TechnicianDashboard'
import InspectionPage from '@/pages/technician/InspectionPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import InventoryPage from '@/pages/admin/InventoryPage'
import QRScanner from '@/pages/scanner/QRScanner'
import LocationPage from '@/pages/location/LocationPage'
import { Toaster } from 'sonner'
import PWAInstallPrompt from '@/components/layout/PWAInstallPrompt'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function RoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { user } = useAuthStore()
  if (user?.role === 'CUSTOMER') return <Navigate to="/customer" replace />
  if (user?.role === 'STAFF') return <Navigate to="/staff" replace />
  if (user?.role === 'TECHNICIAN') return <Navigate to="/technician" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors theme="dark" />
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<HomeRedirect />} />
          <Route path="customer" element={<CustomerPortal />} />
          <Route path="staff" element={<RoleRoute roles={['STAFF', 'ADMIN']}><StaffDashboard /></RoleRoute>} />
          <Route path="staff/job-cards/new" element={<RoleRoute roles={['STAFF', 'ADMIN']}><CreateJobCard /></RoleRoute>} />
          <Route path="staff/job-cards/:id" element={<RoleRoute roles={['STAFF', 'ADMIN']}><JobCardDetail /></RoleRoute>} />
          <Route path="technician" element={<RoleRoute roles={['TECHNICIAN', 'ADMIN']}><TechnicianDashboard /></RoleRoute>} />
          <Route path="technician/inspect/:id" element={<RoleRoute roles={['TECHNICIAN', 'ADMIN']}><InspectionPage /></RoleRoute>} />
          <Route path="admin" element={<RoleRoute roles={['ADMIN']}><AdminDashboard /></RoleRoute>} />
          <Route path="admin/inventory" element={<RoleRoute roles={['ADMIN', 'STAFF']}><InventoryPage /></RoleRoute>} />
          <Route path="scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
          <Route path="location" element={<LocationPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
