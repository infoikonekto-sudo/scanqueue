# Componentes Compartidos - ScanQueue

## 📚 Descripción General

Librería de componentes reutilizables para ScanQueue. Todos están construidos con React, styled con Tailwind CSS y son completamente responsivos.

---

## 🎨 Card Component

### Card (tarjeta básica)
```jsx
import { Card } from '@/components/shared'

<Card 
  title="Mi tarjeta"
  subtitle="Subtítulo opcional"
  className="mb-4"
>
  Contenido aquí
</Card>

// Con icono
<Card 
  title="Usuarios"
  icon={MdPeople}
>
  250 usuarios activos
</Card>
```

**Props**:
- `title`: Título de la tarjeta
- `subtitle`: Subtítulo
- `icon`: Componente de icono
- `className`: Clases Tailwind adicionales
- `children`: Contenido

### StatsCard (tarjeta de estadística)
```jsx
import { StatsCard } from '@/components/shared'

<StatsCard
  label="Total Estudiantes"
  value={250}
  icon={MdPeople}
  color="blue"
  change={{ value: 5, positive: true }}
/>
```

**Props**:
- `label`: Etiqueta
- `value`: Valor a mostrar
- `icon`: Icono (react-icons)
- `color`: 'blue' | 'green' | 'red' | 'orange'
- `change`: `{ value: number, positive: boolean }`

---

## 🔘 Button Component

```jsx
import { Button } from '@/components/shared'

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="success">Éxito</Button>
<Button variant="danger">Peligro</Button>
<Button variant="warning">Advertencia</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="link">Enlace</Button>

// Tamaños
<Button size="xs">Extra pequeño</Button>
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano (defecto)</Button>
<Button size="lg">Grande</Button>

// Con icono
<Button icon={MdAdd}>Crear</Button>
<Button icon={MdDelete} iconPosition="right">Eliminar</Button>

// Estados
<Button disabled>Deshabilitado</Button>
<Button loading>Cargando...</Button>
<Button loading className="w-full">Enviando...</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'link'
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `icon`: Componente de icono
- `iconPosition`: 'left' | 'right'
- `disabled`: boolean
- `loading`: boolean
- `className`: Clases Tailwind

---

## ⌨️ Input Components

### Input
```jsx
import { Input } from '@/components/shared'

<Input
  label="Nombre"
  type="text"
  placeholder="Ingresa tu nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>

// Con icono
<Input
  label="Email"
  type="email"
  icon={MdEmail}
  iconPosition="left"
/>

// Con error
<Input
  label="Contraseña"
  type="password"
  error="Contraseña incorrecta"
  helperText="Mínimo 8 caracteres"
/>

// Deshabilitado
<Input
  label="Lectura"
  disabled
  value="Solo lectura"
/>
```

**Props**:
- `label`: Etiqueta
- `type`: HTML input type
- `icon`: Componente de icono
- `iconPosition`: 'left' | 'right'
- `error`: Mensaje de error
- `helperText`: Texto de ayuda
- `disabled`: boolean
- `required`: boolean
- `ref`: useRef (forwardRef)

### Select
```jsx
import { Select } from '@/components/shared'

<Select
  label="Grado"
  value={grade}
  onChange={(e) => setGrade(e.target.value)}
  options={[
    { value: '1', label: '1° Básico' },
    { value: '2', label: '2° Básico' },
    { value: '3', label: '3° Básico' },
  ]}
  required
/>
```

**Props**:
- `label`: Etiqueta
- `options`: `Array<{ value, label }>`
- `error`: Mensaje de error
- `helperText`: Texto de ayuda

### Textarea
```jsx
import { Textarea } from '@/components/shared'

<Textarea
  label="Descripción"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Ingresa una descripción"
/>
```

---

## 🪟 Modal Components

### Modal
```jsx
import { Modal } from '@/components/shared'

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Crear Estudiante"
  size="md"
>
  <Form onSubmit={handleSubmit} />
</Modal>

// Con footer custom
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirmar"
  footer={
    <>
      <Button onClick={onClose} variant="ghost">Cancelar</Button>
      <Button onClick={handleConfirm} variant="primary">Confirmar</Button>
    </>
  }
>
  ¿Estás seguro?
</Modal>
```

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: Título del modal
- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `footer`: ReactNode
- `className`: Clases Tailwind

### ConfirmModal
```jsx
import { ConfirmModal } from '@/components/shared'

<ConfirmModal
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  title="Eliminar Estudiante"
  message="¿Está seguro de que desea eliminarlo?"
  onConfirm={handleDelete}
  isDangerous={true}
  loading={false}
/>
```

**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: Título
- `message`: Mensaje
- `onConfirm`: () => Promise|void
- `isDangerous`: boolean (cambia botón a rojo)
- `loading`: boolean

---

## 📊 Table Components

### Table (básica)
```jsx
import { Table } from '@/components/shared'

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Nombre' },
  { key: 'grade', label: 'Grado' },
  {
    key: 'actions',
    label: 'Acciones',
    render: (_, row) => (
      <Button onClick={() => edit(row)}>Editar</Button>
    )
  }
]

<Table
  columns={columns}
  data={students}
  loading={false}
  striped={true}
  hoverable={true}
  onRowClick={(row) => console.log(row)}
/>
```

**Props**:
- `columns`: `Array<{ key, label, width?, render? }>`
- `data`: Array de datos
- `loading`: boolean
- `striped`: boolean (filas alternadas)
- `hoverable`: boolean (hover effect)
- `onRowClick`: (row) => void

### DataTable (avanzada)
```jsx
import { DataTable } from '@/components/shared'

<DataTable
  columns={[
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'grade', label: 'Grado', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
  ]}
  data={students}
  loading={false}
  search={true}
  pagination={true}
  pageSize={20}
  onRowClick={(row) => console.log(row)}
/>
```

**Features**:
- ✅ Búsqueda en tiempo real
- ✅ Ordenamiento por columnas
- ✅ Paginación
- ✅ Click en filas

**Props**:
- `columns`: Array con propiedad `sortable`
- `data`: Array de datos
- `loading`: boolean
- `search`: boolean
- `pagination`: boolean
- `pageSize`: number (defecto 20)

---

## 🔔 Toast Notifications

### useToast Hook
```jsx
import { useToast } from '@/components/shared'

const { addToast, removeToast } = useToast()

// Usar en componentes
addToast('¡Éxito!', 'success')
addToast('Error: algo salió mal', 'error')
addToast('Advertencia importante', 'warning')
addToast('Información útil', 'info')

// Con ID para remover manualmente
const id = addToast('Procesando...')
setTimeout(() => removeToast(id), 5000)
```

**Tipos**:
- `'success'`: Verde ✓
- `'error'`: Rojo ✗
- `'warning'`: Naranja ⚠
- `'info'`: Azul ℹ

**Props de addToast**:
- `message`: string
- `type`: 'success' | 'error' | 'warning' | 'info'
- `duration`: number (ms, defecto 4000)

**Envolver app en ToastProvider**:
```jsx
import { ToastProvider } from '@/components/shared'

<ToastProvider>
  <App />
</ToastProvider>
```

---

## ⏳ Loading & Skeleton

### LoadingSpinner
```jsx
import { LoadingSpinner } from '@/components/shared'

<LoadingSpinner />
<LoadingSpinner size="sm" text="Cargando..." />
<LoadingSpinner size="lg" />
```

**Props**:
- `size`: 'sm' | 'md' | 'lg'
- `text`: string

### SkeletonLoader
```jsx
import { SkeletonLoader } from '@/components/shared'

<SkeletonLoader count={5} className="space-y-3" />
```

---

## 📤 UploadZone

```jsx
import { UploadZone } from '@/components/shared'

<UploadZone
  onFiles={(files) => handleUpload(files)}
  accept=".csv,.xlsx,.xls"
  maxSize={5 * 1024 * 1024}
  multiple={false}
  label="Carga tu archivo aquí"
/>
```

**Features**:
- ✅ Drag & drop
- ✅ Click para seleccionar
- ✅ Validación de tamaño
- ✅ Validación de tipo
- ✅ Vista previa de archivos

**Props**:
- `onFiles`: (files: File[]) => void
- `accept`: string (MIME types)
- `maxSize`: number (bytes)
- `multiple`: boolean
- `label`: string

---

## 🧭 Navigation Components

### Breadcrumb
```jsx
import { Breadcrumb } from '@/components/shared'

<Breadcrumb
  items={[
    { label: 'Dashboard', href: '/admin' },
    { label: 'Estudiantes', href: '/admin/students' },
    { label: 'Juan Pérez' },
  ]}
/>
```

### PageHeader
```jsx
import { PageHeader } from '@/components/shared'

<PageHeader
  title="Gestión de Estudiantes"
  subtitle="Administra el registro de estudiantes"
  breadcrumbs={[...]}
  action={<Button>Crear</Button>}
/>
```

**Props**:
- `title`: Título principal
- `subtitle`: Subtítulo
- `breadcrumbs`: Array de items (opcional)
- `action`: Elemento a mostrar en la derecha

---

## 🎯 Best Practices

1. **Sempre usar forwardRef**: Para inputs que necesiten ser controlados
   ```jsx
   const input = React.useRef()
   ```

2. **Validar antes de enviar**: Usar estados para errores
   ```jsx
   const [errors, setErrors] = useState({})
   ```

3. **Loading states**: Mostrar feedback visual
   ```jsx
   <Button loading={isLoading}>Guardar</Button>
   ```

4. **Toasts para feedback**: No usar alert()
   ```jsx
   addToast('¡Creado!', 'success')
   ```

5. **Confirmación para destructivas**: Usar ConfirmModal
   ```jsx
   <ConfirmModal isDangerous onConfirm={delete} />
   ```

---

## 🔄 Ejemplos Completos

### Formulario con Validación
```jsx
import { useState } from 'react'
import { Input, Select, Button, useToast } from '@/components/shared'

export const StudentForm = () => {
  const [data, setData] = useState({ name: '', grade: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!data.name) newErrors.name = 'Requerido'
    if (!data.grade) newErrors.grade = 'Requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // API call
      addToast('¡Creado!', 'success')
    } catch (err) {
      addToast(err.message, 'error')
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
      <Select
        label="Grado"
        value={data.grade}
        onChange={(e) => setData({ ...data, grade: e.target.value })}
        options={[
          { value: '1', label: '1° Básico' },
        ]}
        error={errors.grade}
      />
      <Button type="submit" loading={loading} className="w-full">
        Crear
      </Button>
    </form>
  )
}
```

---

**Última actualización**: 3 de marzo, 2026
