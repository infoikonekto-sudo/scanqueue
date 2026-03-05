import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useSettingsStore } from '../stores/index.js'
import { adminService } from '../services/api.js'
import { Button, Input, Card, Alert, Modal, Tabs } from '../components/common/index.jsx'
import { motion } from 'framer-motion'

/**
 * Página de Panel Administrativo
 */
export const AdminPanel = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { soundEnabled, vibrationEnabled, darkMode, updateSettings } =
    useSettingsStore()

  const [activeTab, setActiveTab] = React.useState('settings')
  const [users, setUsers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [showNewUserModal, setShowNewUserModal] = React.useState(false)

  const [newUser, setNewUser] = React.useState({
    name: '',
    email: '',
    role: 'teacher',
    password: '',
  })

  // Verificar autenticación y permisos
  React.useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.role !== 'admin') {
      navigate('/scanner')
    }
  }, [user, navigate])

  // Cargar usuarios
  React.useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [activeTab])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getUsers()
      setUsers(response.data.users)
    } catch (err) {
      setError('Error cargando usuarios')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await adminService.createUser(newUser)
      setShowNewUserModal(false)
      setNewUser({ name: '', email: '', role: 'teacher', password: '' })
      loadUsers()
    } catch (err) {
      setError('Error creando usuario')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar usuario?')) return
    try {
      await adminService.deleteUser(userId)
      loadUsers()
    } catch (err) {
      setError('Error eliminando usuario')
    }
  }

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-white px-4 py-6 shadow-md"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel Administrativo</h1>
            <p className="text-sm opacity-90">Log in como: {user?.email}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} size="sm">
            🚪 Salir
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'settings', label: '⚙️ Configuración' },
            { id: 'users', label: '👥 Usuarios' },
            { id: 'reports', label: '📊 Reportes' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Preferencias</h2>

              {/* Sonido */}
              <div className="flex items-center justify-between py-3 border-b">
                <label>🔊 Sonido Habilitado</label>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) =>
                    updateSettings({ soundEnabled: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </div>

              {/* Vibración */}
              <div className="flex items-center justify-between py-3 border-b">
                <label>📳 Vibración Habilitada</label>
                <input
                  type="checkbox"
                  checked={vibrationEnabled}
                  onChange={(e) =>
                    updateSettings({ vibrationEnabled: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </div>

              {/* Modo oscuro */}
              <div className="flex items-center justify-between py-3">
                <label>🌙 Modo Oscuro</label>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) =>
                    updateSettings({ darkMode: e.target.checked })
                  }
                  className="w-5 h-5"
                  disabled
                />
              </div>
            </Card>

            {/* Información del sistema */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Sistema</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Versión:</strong> 1.0.0
                </p>
                <p>
                  <strong>Actualizado:</strong> 2024-01-01
                </p>
                <p>
                  <strong>Estado:</strong> ✓ Activo
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gestionar Usuarios</h2>
              <Button
                variant="primary"
                onClick={() => setShowNewUserModal(true)}
              >
                ➕ Nuevo Usuario
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{u.name}</td>
                        <td className="px-6 py-3">{u.email}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            🗑️ Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Nuevo Usuario Modal */}
            <Modal
              isOpen={showNewUserModal}
              onClose={() => setShowNewUserModal(false)}
              title="Crear Nuevo Usuario"
              actions={[
                <Button
                  key="cancel"
                  variant="ghost"
                  onClick={() => setShowNewUserModal(false)}
                >
                  Cancelar
                </Button>,
                <Button
                  key="create"
                  variant="primary"
                  onClick={handleCreateUser}
                >
                  Crear
                </Button>,
              ]}
            >
              <form className="space-y-4">
                <Input
                  label="Nombre"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="teacher">Profesor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </form>
            </Modal>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <Card className="p-6 text-center">
              <p className="text-lg text-gray-600">
                📊 Reportes en desarrollo
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
