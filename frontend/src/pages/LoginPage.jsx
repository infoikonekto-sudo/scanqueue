import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/index.js'
import { authService } from '../services/api.js'
import { Button, Input, Card, Alert } from '../components/common/index.jsx'
import { motion } from 'framer-motion'

/**
 * Página de Login
 */
export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/scanner')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await authService.login(email, password)
      const { user, token } = response.data

      login(user, token)
      navigate('/scanner')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error de autenticación',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <Card className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-3xl font-bold text-primary mb-2">ScanQueue</h1>
            <p className="text-gray-600">Sistema de Llamado Escolar</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@colegio.edu"
              required
              disabled={isLoading}
              fullWidth
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3">
              Credenciales de prueba (desarrollo):
            </p>
            <code className="text-xs bg-gray-100 p-2 rounded block mb-2 text-gray-800">
              admin@colegio.edu / admin123
            </code>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage
