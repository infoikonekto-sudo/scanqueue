import React, { useEffect, useState } from 'react'
import { PageHeader, Card, Button, Input, Select, DataTable, Modal, ConfirmModal, LoadingSpinner, useToast } from '../../components/shared'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { addToast } = useToast()
  const [formData, setFormData] = useState({ name: '', capacity: 0, description: '' })

  useEffect(() => {
    // TODO: Cargar rutas desde API
    const mockRoutes = [
      { id: 1, name: 'Ruta Norte', capacity: 25, students: 24, description: 'Sector norte de la ciudad' },
      { id: 2, name: 'Ruta Sur', capacity: 30, students: 28, description: 'Sector sur de la ciudad' },
      { id: 3, name: 'Ruta Este', capacity: 20, students: 18, description: 'Sector este de la ciudad' },
    ]
    setRoutes(mockRoutes)
  }, [])

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'capacity', label: 'Capacidad', sortable: true },
    {
      key: 'students',
      label: 'Estudiantes',
      render: (value, row) => `${value}/${row.capacity}`
    },
    { key: 'description', label: 'Descripción' },
    {
      key: 'actions',
      label: 'Acciones',
      width: '150px',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={MdEdit}
            onClick={() => {
              setSelectedRoute(row)
              setFormData(row)
              setShowFormModal(true)
            }}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={MdDelete}
            onClick={() => {
              setSelectedRoute(row)
              setShowDeleteModal(true)
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedRoute) {
      setRoutes(routes.map(r => r.id === selectedRoute.id ? { ...formData, id: r.id } : r))
      addToast('Ruta actualizada', 'success')
    } else {
      setRoutes([...routes, { ...formData, id: Math.max(...routes.map(r => r.id)) + 1, students: 0 }])
      addToast('Ruta creada', 'success')
    }
    setShowFormModal(false)
    setFormData({ name: '', capacity: 0, description: '' })
  }

  const handleDelete = () => {
    setRoutes(routes.filter(r => r.id !== selectedRoute.id))
    addToast('Ruta eliminada', 'success')
    setShowDeleteModal(false)
  }

  return (
    <>
      <PageHeader
        title="Gestión de Rutas de Transporte"
        subtitle="Crea y administra las rutas de transporte escolar"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Rutas' },
        ]}
        action={
          <Button
            variant="primary"
            icon={MdAdd}
            onClick={() => {
              setSelectedRoute(null)
              setFormData({ name: '', capacity: 0, description: '' })
              setShowFormModal(true)
            }}
          >
            Crear Ruta
          </Button>
        }
      />

      <Card>
        <DataTable columns={columns} data={routes} loading={loading} />
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal && !showDeleteModal}
        onClose={() => setShowFormModal(false)}
        title={selectedRoute ? 'Editar Ruta' : 'Crear Ruta'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la Ruta"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Capacidad de Estudiantes"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            required
          />

          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ej: Sector norte de la ciudad"
          />

          <Button type="submit" variant="primary" className="w-full">
            {selectedRoute ? 'Actualizar' : 'Crear'} Ruta
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Ruta"
        message={`¿Está seguro de que desea eliminar la ruta "${selectedRoute?.name}"? Los estudiantes asignados quedarán sin ruta.`}
        onConfirm={handleDelete}
        isDangerous={true}
      />
    </>
  )
}

export default AdminRoutes
