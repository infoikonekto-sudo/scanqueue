# Inicio Rápido - Panel de Administración

## 🚀 Primeros Pasos

### 1. Instalar Dependencias
```bash
cd frontend
npm install
npm install chart.js react-chartjs-2  # Para gráficos
```

### 2. Configurar Variables de Entorno
Editar `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

### 4. Acceder al Panel
```
http://localhost:5173/admin
```

---

## 📍 Rutas del Panel Admin

| Ruta | Página | Función |
|------|--------|---------|
| `/admin` | Dashboard | Estadísticas en tiempo real |
| `/admin/students` | Estudiantes | CRUD de estudiantes |
| `/admin/routes` | Rutas | Gestión de rutas de transporte |
| `/admin/reports` | Reportes | Exportación de datos |
| `/admin/analytics` | Analítica | Análisis detallado |
| `/admin/settings` | Configuración | Ajustes del sistema |

---

## 📦 Estructura de Carpetas (Actualizada)

```
frontend/src/
├── components/
│   ├── admin/                    ← Panel admin específico
│   │   ├── AdminLayout.jsx
│   │   ├── StudentComponents.jsx
│   │   ├── Charts.jsx
│   │   ├── CommonComponents.jsx
│   │   └── index.jsx
│   ├── shared/                   ← Componentes reutilizables
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Toast.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── UploadZone.jsx
│   │   ├── BreadCrumb.jsx
│   │   └── index.jsx
│   └── Layout/                   ← Layout tradicional (scanner, queue)
├── pages/
│   ├── admin/                    ← Páginas del admin
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminStudents.jsx
│   │   ├── AdminRoutes.jsx
│   │   ├── AdminReports.jsx
│   │   ├── AdminAnalytics.jsx
│   │   ├── AdminSettings.jsx
│   │   └── index.js
│   ├── ScannerPage.jsx           ← Existentes
│   ├── QueuePage.jsx
│   ├── AdminPanel.jsx
│   └── LoginPage.jsx
├── hooks/
│   ├── admin/                    ← Hooks del admin
│   │   ├── useStudents.js
│   │   └── useDashboard.js
│   └── index.js                  ← Hooks existentes
├── services/
│   ├── admin.js                  ← API del admin
│   └── ...                       ← Servicios existentes
├── stores/
│   └── index.js                  ← Zustand stores
├── styles/
│   └── globals.css               ← CSS global
├── App.jsx                       ← Actualizado con rutas admin
└── main.jsx
```

---

## 🔑 Conceptos Clave

### 1. Layout Admin
El `AdminLayout` proporciona:
- Sidebar con navegación
- Header con información de usuario
- Contenido principal responsive
- Manejo automático de mobile

```jsx
import { AdminLayout } from '@/components/admin'

const MyPage = () => {
  return (
    <AdminLayout>
      {/* Contenido */}
    </AdminLayout>
  )
}
```

### 2. Componentes Compartidos
Todos los componentes UI están en `@/components/shared`:

```jsx
import {
  Card, StatsCard, Button, Input, Select,
  Modal, Table, DataTable, Toast, useToast,
  LoadingSpinner, UploadZone, PageHeader
} from '@/components/shared'
```

### 3. Hooks Personalizados
Encapsulan lógica de negocio:

```jsx
import { useStudents } from '@/hooks/admin/useStudents'
import { useDashboard } from '@/hooks/admin/useDashboard'
```

### 4. Servicios API
Centralizados en `@/services/admin`:

```jsx
import {
  studentService,
  routeService,
  qrService,
  scanService,
  dashboardService,
  reportService,
  adminService,
} from '@/services/admin'
```

---

## 💡 Ejemplos de Uso

### Crear una Nueva Página Admin

**Paso 1**: Crear archivo en `src/pages/admin/`
```jsx
// AdminNewFeature.jsx
import { AdminLayout } from '@/components/admin'
import { PageHeader, Card, Button } from '@/components/shared'
import { MdAdd } from 'react-icons/md'

const AdminNewFeature = () => {
  return (
    <AdminLayout>
      <PageHeader
        title="Nueva Funcionalidad"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Nueva' }
        ]}
        action={<Button icon={MdAdd}>Crear</Button>}
      />
      
      <Card>
        Contenido aquí
      </Card>
    </AdminLayout>
  )
}

export default AdminNewFeature
```

**Paso 2**: Exportar en `src/pages/admin/index.js`
```jsx
export { default as AdminNewFeature } from './AdminNewFeature'
```

**Paso 3**: Agregar ruta en `src/App.jsx`
```jsx
<Route path="/admin/new-feature" element={<AdminNewFeature />} />
```

**Paso 4**: Agregar enlace en sidebar (AdminLayout.jsx)
```jsx
{ icon: MdNewIcon, label: 'Nueva', href: '/admin/new-feature' },
```

---

### Usando useStudents Hook

```jsx
import { useStudents } from '@/hooks/admin/useStudents'
import { useToast } from '@/components/shared'

const MyComponent = () => {
  const {
    students,
    loading,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents()

  const { addToast } = useToast()

  const handleCreate = async (data) => {
    try {
      await createStudent(data)
      // Toast automático
    } catch (err) {
      // Error handling automático
    }
  }

  return (
    <>
      {loading ? <LoadingSpinner /> : (
        <div>
          {students.map(s => (
            <div key={s.id}>{s.name}</div>
          ))}
        </div>
      )}
    </>
  )
}
```

---

### Llamar a APIMúltiples Datos

```jsx
import {
  studentService,
  dashboardService,
  routeService,
} from '@/services/admin'

// En useEffect
useEffect(() => {
  const fetchData = async () => {
    try {
      const [students, stats, routes] = await Promise.all([
        studentService.list(),
        dashboardService.stats(),
        routeService.list(),
      ])
      
      setData({
        students: students.data,
        stats: stats.data,
        routes: routes.data,
      })
    } catch (err) {
      console.error(err)
    }
  }

  fetchData()
}, [])
```

---

### Crear un Formulario Modal

```jsx
import { useState } from 'react'
import { Modal, Input, Button } from '@/components/shared'

const FormModal = ({ isOpen, onClose, onSubmit }) => {
  const [data, setData] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Elemento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Crear
        </Button>
      </form>
    </Modal>
  )
}
```

---

### DataTable con Filtrado

```jsx
import { DataTable } from '@/components/shared'

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'actions',
    label: 'Acciones',
    render: (_, row) => (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleEdit(row)}
      >
        Editar
      </Button>
    )
  }
]

<DataTable
  columns={columns}
  data={students}
  loading={loading}
  search={true}
  pagination={true}
  pageSize={20}
/>
```

---

### Gráficos

```jsx
import { LineChart, BarChart, PieChart } from '@/components/admin'

// Gráfico de línea
<Card title="Tendencia">
  <LineChart
    labels={['Lun', 'Mar', 'Mié', 'Jue', 'Vie']}
    data={[45, 52, 48, 61, 55]}
    title="Retiros"
  />
</Card>

// Gráfico de barras
<Card title="Retiros por hora">
  <BarChart
    labels={['06:00', '07:00', '08:00']}
    data={[12, 25, 18]}
    title="Cantidad"
  />
</Card>

// Gráfico de pie
<Card title="Distribución">
  <PieChart
    labels={['Retiro', 'Transporte', 'Esperando']}
    data={[120, 45, 15]}
  />
</Card>
```

---

## 🎯 Checklist para Nueva Funcionalidad

- [ ] Crear página en `src/pages/admin/`
- [ ] Crear hook si es necesario en `src/hooks/admin/`
- [ ] Crear servicios si es necesario en `src/services/`
- [ ] Importar componentes compartidos necesarios
- [ ] Wrappear en `AdminLayout`
- [ ] Agregar `PageHeader` con breadcrumbs
- [ ] Exportar en `src/pages/admin/index.js`
- [ ] Agregar ruta en `src/App.jsx`
- [ ] Agregar navegación en `AdminLayout` sidebar
- [ ] Probar responsividad
- [ ] Documentar en README

---

## 🧪 Testing

### Mocks para desarrollo
```jsx
// Mock de datos en desarrollo
const mockStudents = [
  { id: 1, name: 'Juan', grade: '1°', email: 'juan@...', transport_route_id: 1 },
  { id: 2, name: 'María', grade: '2°', email: 'maria@...', transport_route_id: 2 },
]

// Usar en componentes
const [students] = useState(mockStudents)
```

---

## 🐛 Debugging

### Console Logs
```jsx
console.log('Data:', students)
console.log('Error:', error)
console.log('Loading:', loading)
```

### Redux DevTools
Aunque usamos Zustand, podemos ver estado:
```jsx
import { useAuthStore } from '@/stores'

const state = useAuthStore.getState()
console.log(state)
```

### Network Inspector
- F12 → Network
- Filtrar por XHR
- Ver requests a API
- Verificar headers, body, response

---

## 📱 Testing Responsivo

```bash
# En navegador
Ctrl+Shift+M  # Firefox, Chrome
Cmd+Shift+M   # Mac

# Viewport sizes a probar
- Desktop: 1440px
- Tablet: 768px
- Mobile: 360px
```

---

## 🚨 Errores Comunes

### Error: "useToast debe ser usado dentro de ToastProvider"
**Solución**: Envolver app en `<ToastProvider>` en App.jsx

### Error: "Chart is not a constructor"
**Solución**: Instalar Chart.js `npm install chart.js react-chartjs-2`

### Error: "API returns 401"
**Solución**: Verificar token en localStorage, hacer login nuevamente

### Error: "Component not found"
**Solución**: Verificar imports, revisar nombres exactos

---

## 📖 Documentación Relacionada

- [ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md) - Guía detallada del panel
- [SHARED_COMPONENTS.md](./SHARED_COMPONENTS.md) - Documentación de componentes
- [API_REFERENCE.md](../backend/API_REFERENCE.md) - Endpoints disponibles

---

**Última actualización**: 3 de marzo, 2026
**Versión**: 1.0.0
