import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore, useUIStore } from './stores/index.js'
import { useIsMobile } from './hooks/index.js'
import { MainLayout, MobileLayout, LoadingLayout } from './components/Layout/LayoutComponents.jsx'
import { ToastProvider } from './components/shared/Toast'
import ScannerPage from './pages/ScannerPage.jsx'
import QueuePage from './pages/QueuePage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import LoginPage from './pages/LoginPage.jsx'
import {
  AdminDashboard,
  AdminStudents,
  AdminRoutes,
  AdminReports,
  AdminAnalytics,
  AdminSettings,
  QRPrintView,
} from './pages/admin/index.js'
import { useStudents } from './hooks/admin/useStudents'
import { PublicQueueView } from './components/Queue/PublicQueueView.jsx'
import './styles/globals.css'

/**
 * Componente protegido de ruta
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

import { AdminLayout } from './components/admin/AdminLayout.jsx'

/**
 * Layout wrapper unificado basado en el diseño Admin Premium (Azul)
 */
function UnifiedLayout() {
  const { user } = useAuthStore()
  return <AdminLayout user={user} />
}

/**
 * Componente para imprimir QR que carga sus propios datos
 */
const AdminPrintQR = () => {
  const { students, fetchStudents, loading } = useStudents()
  React.useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  if (loading) return <LoadingLayout message="Generando códigos QR..." />
  return <QRPrintView students={students} />
}

/**
 * Componente principal App
 */
function App() {
  const { isAuthenticated } = useAuthStore()
  const [isInitializing, setIsInitializing] = React.useState(true)

  // Inicializar autenticación
  React.useEffect(() => {
    const init = async () => {
      try {
        // Restaurar sesión si existe (ya se restaura automáticamente en el store)
        localStorage.getItem('auth')
      } catch (err) {
        console.error('Error inicializando:', err)
      } finally {
        setIsInitializing(false)
      }
    }

    init()
  }, [])

  if (isInitializing) {
    return <LoadingLayout message="Inicializando ScanQueue..." />
  }

  return (
    <ToastProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Sistema Unificado con Menú Lateral Azul */}
          <Route
            element={
              <ProtectedRoute>
                <UnifiedLayout />
              </ProtectedRoute>
            }
          >
            {/* Index redirige a Dashboard */}
            <Route index element={<Navigate to="/admin" replace />} />

            {/* Dashboard y Secciones de Gestión */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/routes" element={<AdminRoutes />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Operaciones Escenciales */}
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/queue/:level" element={<QueuePage />} />

            {/* Vistas Especiales */}
            <Route path="/admin/print-qr" element={<AdminPrintQR />} />
            <Route path="/admin-legacy" element={<AdminPanel />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Monitor Público - Pantalla Independiente sin Menú */}
          <Route path="/monitor" element={
            <ProtectedRoute>
              <PublicQueueView />
            </ProtectedRoute>
          } />
          <Route path="/monitor/:level" element={
            <ProtectedRoute>
              <PublicQueueView />
            </ProtectedRoute>
          } />

          {/* Redirección raíz */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to="/scanner" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
