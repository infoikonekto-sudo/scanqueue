import React, { useState, useEffect } from 'react'
import { PageHeader, Card, Button, Input, Select, useToast, LoadingSpinner } from '../../components/shared'
import { MdSave, MdRefresh } from 'react-icons/md'

const AdminSettings = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const [settings, setSettings] = useState({
    schoolName: 'Colegio San José',
    schoolEmail: 'admin@colegio.local',
    schoolPhone: '+56 9 1234 5678',
    openingTime: '08:00',
    closingTime: '16:00',
    timezone: 'America/Santiago',
    language: 'es',
    theme: 'light',
    strictValidation: true,
    contactName: 'Director',
    contactEmail: 'director@colegio.local',
    contactPhone: '+56 9 9876 5432',
  })

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ]

  const themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
  ]

  const timezones = [
    { value: 'America/Santiago', label: 'Santiago, Chile' },
    { value: 'America/Los_Angeles', label: 'Los Angeles' },
    { value: 'America/New_York', label: 'Nueva York' },
  ]

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // TODO: Guardar configuración en API
      await new Promise(resolve => setTimeout(resolve, 1000))
      addToast('Configuración actualizada', 'success')
    } catch (err) {
      addToast('Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Ajusta los parámetros generales de ScanQueue"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Configuración' },
        ]}
        action={
          <Button
            variant="primary"
            icon={MdRefresh}
            onClick={() => location.reload()}
          >
            Recargar
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Datos del Colegio */}
        <Card title="Datos de la Institución">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Institución"
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
            />
            <Input
              label="Email de la Institución"
              type="email"
              value={settings.schoolEmail}
              onChange={(e) => setSettings({ ...settings, schoolEmail: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={settings.schoolPhone}
              onChange={(e) => setSettings({ ...settings, schoolPhone: e.target.value })}
            />
            <Input
              label="Localidad/Ciudad"
              placeholder="Santiago, Chile"
            />
          </div>
        </Card>

        {/* Horarios */}
        <Card title="Horarios de Operación">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Hora de Apertura"
              type="time"
              value={settings.openingTime}
              onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
            />
            <Input
              label="Hora de Cierre"
              type="time"
              value={settings.closingTime}
              onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
            />
          </div>
        </Card>

        {/* Preferencias */}
        <Card title="Preferencias del Sistema">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Huso Horario"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              options={timezones}
            />
            <Select
              label="Idioma"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              options={languages}
            />
            <Select
              label="Tema"
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              options={themes}
            />
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.strictValidation}
                  onChange={(e) => setSettings({ ...settings, strictValidation: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700">Validaciones Estrictas</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Contacto Emergencia */}
        <Card title="Contacto de Emergencia">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={settings.contactName}
              onChange={(e) => setSettings({ ...settings, contactName: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            />
            <Input
              label="Teléfono"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            />
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={MdSave}
            loading={saving}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </>
  )
}

export default AdminSettings
