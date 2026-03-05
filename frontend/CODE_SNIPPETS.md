# Code Snippets & Ejemplos Útiles

## 🎯 Snippets Frecuentes

### 1. Listar Datos con Paginación
```jsx
import { useState, useEffect } from 'react'
import { studentService } from '@/services/admin'
import { DataTable, LoadingSpinner } from '@/components/shared'

const StudentsList = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await studentService.list({ 
          page: currentPage, 
          limit: 20 
        })
        setStudents(data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [currentPage])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'grade', label: 'Grado' },
  ]

  return (
    <>
      {loading ? <LoadingSpinner /> : (
        <DataTable 
          columns={columns} 
          data={students}
          pagination={true}
        />
      )}
    </>
  )
}
```

### 2. Crear con Validación
```jsx
import { useState } from 'react'
import { Input, Button, useToast } from '@/components/shared'
import { studentService } from '@/services/admin'

const CreateStudent = () => {
  const [data, setData] = useState({ name: '', grade: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!data.name?.trim()) newErrors.name = 'Nombre requerido'
    if (!data.grade) newErrors.grade = 'Grado requerido'
    if (data.name?.length < 3) newErrors.name = 'Mínimo 3 caracteres'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      addToast('Revisa los errores', 'warning')
      return
    }

    setLoading(true)
    try {
      await studentService.create(data)
      addToast('Estudiante creado', 'success')
      setData({ name: '', grade: '' })
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        error={errors.name}
        required
      />
      <Input
        label="Grado"
        value={data.grade}
        onChange={(e) => setData({ ...data, grade: e.target.value })}
        error={errors.grade}
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Crear
      </Button>
    </form>
  )
}
```

### 3. Editar con Modal
```jsx
import { useState } from 'react'
import { Modal, Input, Button, ConfirmModal, useToast } from '@/components/shared'
import { studentService } from '@/services/admin'

const EditStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [data, setData] = useState(student || {})
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await studentService.update(student.id, data)
      addToast('Actualizado', 'success')
      onClose()
      onSuccess?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await studentService.delete(student.id)
      addToast('Eliminado', 'success')
      onClose()
      setShowDelete(false)
      onSuccess?.()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Estudiante"
        footer={
          <>
            <Button 
              variant="danger" 
              onClick={() => setShowDelete(true)}
            >
              Eliminar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              loading={loading}
              onClick={handleSubmit}
            >
              Actualizar
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={data.name || ''}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
          <Input
            label="Grado"
            value={data.grade || ''}
            onChange={(e) => setData({ ...data, grade: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Eliminar Estudiante"
        message={`¿Eliminar a ${student?.name}?`}
        onConfirm={handleDelete}
        isDangerous={true}
        loading={loading}
      />
    </>
  )
}
```

### 4. Importar CSV
```jsx
import { useState } from 'react'
import { UploadZone, Button, useToast } from '@/components/shared'
import { studentService } from '@/services/admin'

const ImportCSV = ({ onSuccess }) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleImport = async () => {
    if (!files.length) return

    setLoading(true)
    try {
      const file = files[0]
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim())

      const students = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const obj = {}
        headers.forEach((h, idx) => {
          obj[h] = values[idx]
        })
        return obj
      })

      const result = await studentService.bulkCreate(students)
      addToast(`${result.data.length} estudiantes importados`, 'success')
      setFiles([])
      onSuccess?.()
    } catch (err) {
      addToast('Error al procesar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <UploadZone
        onFiles={setFiles}
        accept=".csv"
        multiple={false}
        label="Carga CSV aquí"
      />
      <Button
        variant="primary"
        loading={loading}
        onClick={handleImport}
        disabled={!files.length}
        className="w-full"
      >
        Importar
      </Button>
    </div>
  )
}
```

### 5. Exportar PDF
```jsx
import { Button, useToast } from '@/components/shared'
import { reportService } from '@/services/admin'

const ExportButton = () => {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleExport = async () => {
    setLoading(true)
    try {
      const blob = await reportService.exportPDF({
        dateFrom: new Date(Date.now() - 24*60*60*1000),
        dateTo: new Date(),
      })

      // Descargar
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)

      addToast('Descargado', 'success')
    } catch (err) {
      addToast('Error al descargar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="primary"
      loading={loading}
      onClick={handleExport}
    >
      Descargar PDF
    </Button>
  )
}
```

### 6. Búsqueda en Vivo
```jsx
import { useState, useEffect } from 'react'
import { Input, LoadingSpinner } from '@/components/shared'
import { studentService } from '@/services/admin'

const SearchStudents = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await studentService.search(query)
        setResults(data)
      } finally {
        setLoading(false)
      }
    }, 300) // Debounce

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-4">
      <Input
        label="Buscar estudiante"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nombre o email..."
      />

      {loading && <LoadingSpinner size="sm" />}

      {results.length > 0 && (
        <ul className="bg-white border border-gray-200 rounded-lg divide-y">
          {results.map(student => (
            <li key={student.id} className="p-3 hover:bg-gray-50">
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-600">{student.grade}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### 7. Estadísticas en Tiempo Real
```jsx
import { useState, useEffect } from 'react'
import { StatsCard, LoadingSpinner } from '@/components/shared'
import { dashboardService } from '@/services/admin'

const LiveStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const { data } = await dashboardService.stats()
        setStats(data)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refrescar cada 30 segundos
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        label="Escaneados hoy"
        value={stats?.scannedToday || 0}
        color="green"
        change={{ value: 12, positive: true }}
      />
      <StatsCard
        label="En cola"
        value={stats?.waitingInQueue || 0}
        color="orange"
      />
      <StatsCard
        label="En transporte"
        value={stats?.inTransport || 0}
        color="blue"
      />
    </div>
  )
}
```

---

## 🎨 Componentes Frecuentes

### Header con Acciones
```jsx
import { PageHeader, Button } from '@/components/shared'
import { MdAdd, MdRefresh } from 'react-icons/md'

<PageHeader
  title="Gestión de Estudiantes"
  subtitle="Administra el registro"
  breadcrumbs={[
    { label: 'Dashboard', href: '/admin' },
    { label: 'Estudiantes' }
  ]}
  action={
    <div className="flex gap-3">
      <Button icon={MdRefresh} variant="secondary">
        Actualizar
      </Button>
      <Button icon={MdAdd} variant="primary">
        Crear
      </Button>
    </div>
  }
/>
```

### Card con Acciones
```jsx
import { Card, Button } from '@/components/shared'

<Card>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-bold">Título</h3>
      <p className="text-sm text-gray-600">Descripción</p>
    </div>
    <div className="flex gap-2">
      <Button variant="secondary">Editar</Button>
      <Button variant="danger">Eliminar</Button>
    </div>
  </div>
</Card>
```

### Form Layout
```jsx
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input label="Nombre" />
    <Input label="Email" />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Select label="Grado" options={grades} />
    <Select label="Ruta" options={routes} />
    <Input label="Teléfono" />
  </div>

  <div className="flex gap-3 justify-end">
    <Button variant="ghost">Cancelar</Button>
    <Button type="submit" variant="primary">
      Guardar
    </Button>
  </div>
</form>
```

---

## 🔗 API Calls Comunes

### GET con Parámetros
```jsx
// Obtener página 2, 20 resultados
const { data } = await studentService.list({
  page: 2,
  limit: 20,
  sort: 'name',
  order: 'asc'
})
```

### POST con Validación
```jsx
try {
  const { data } = await studentService.create({
    name: 'Juan',
    grade: '1° Básico',
    parent_email: 'parent@email.com',
    transport_route_id: 1
  })
  console.log('Creado:', data.id)
} catch (err) {
  if (err.response?.status === 400) {
    // Validación fallida
    console.log(err.response.data.errors)
  }
}
```

### PUT Parcial
```jsx
const { data } = await studentService.update(studentId, {
  name: 'Juan Actualizado'
  // Solo enviamos campos a actualizar
})
```

### DELETE con Confirmación
```jsx
if (window.confirm('¿Estás seguro?')) {
  try {
    await studentService.delete(studentId)
    console.log('Eliminado')
  } catch (err) {
    console.error('Error:', err.message)
  }
}
```

---

## 🧮 Utilidades

### Formatear Fecha
```jsx
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'

const formatted = format(new Date(), 'dd/MMM/yyyy HH:mm', { locale: es })
// "03/mar/2026 14:30"
```

### Validar Email
```jsx
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### Generar ID Único
```jsx
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

### Agrupar Array
```jsx
const grouped = data.reduce((acc, item) => {
  const key = item.grade
  if (!acc[key]) acc[key] = []
  acc[key].push(item)
  return acc
}, {})
```

---

**Última actualización**: 3 de marzo, 2026
