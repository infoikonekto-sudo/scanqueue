# Panel de Administración - ScanQueue

## 📋 Descripción General

El Panel de Administración de ScanQueue es una suite completa de herramientas para directivos y administrativos que permite:

- ✅ Gestión completa de estudiantes
- ✅ Administración de rutas de transporte
- ✅ Generación de reportes y exportación de datos
- ✅ Análisis y estadísticas en tiempo real
- ✅ Configuración del sistema
- ✅ Gráficos interactivos y KPIs

---

## 🏗️ Estructura de Archivos

```
src/
├── components/
│   ├── admin/               # Componentes específicos del admin
│   │   ├── AdminLayout.jsx  # Layout principal del admin
│   │   ├── StudentComponents.jsx  # Tabla y formulario de estudiantes
│   │   ├── Charts.jsx       # Gráficos (línea, barra, pie, etc)
│   │   ├── CommonComponents.jsx   # Componentes reutilizables
│   │   └── index.jsx        # Exportaciones
│   └── shared/              # Componentes compartidos
│       ├── Card.jsx         # Tarjeta y StatsCard
│       ├── Button.jsx       # Botones con variantes
│       ├── Input.jsx        # Inputs, selects, textarea
│       ├── Modal.jsx        # Modales y confirmaciones
│       ├── Table.jsx        # Tabla y DataTable
│       ├── Toast.jsx        # Notificaciones
│       ├── LoadingSpinner.jsx
│       ├── UploadZone.jsx   # Zona de carga de archivos
│       ├── BreadCrumb.jsx   # Breadcrumbs y PageHeader
│       └── index.jsx        # Exportaciones
├── pages/
│   └── admin/               # Páginas del panel admin
│       ├── AdminDashboard.jsx      # Dashboard principal
│       ├── AdminStudents.jsx       # Gestión de estudiantes
│       ├── AdminRoutes.jsx         # Gestión de rutas
│       ├── AdminReports.jsx        # Reportes y exportación
│       ├── AdminAnalytics.jsx      # Analítica avanzada
│       ├── AdminSettings.jsx       # Configuración
│       └── index.js                # Exportaciones
├── hooks/
│   └── admin/               # Hooks personalizados
│       ├── useStudents.js   # Hook para estudiantes
│       ├── useDashboard.js  # Hook para dashboard
│       └── ...otros
├── services/
│   └── admin.js             # Servicios API del admin
└── styles/
    └── globals.css          # Estilos globales
```

---

## 🎨 Componentes Reutilizables

### Card
Tarjeta base para mostrar contenido

```jsx
import { Card, StatsCard } from '@/components/shared'

<Card title="Título" subtitle="Subtítulo">
  Contenido aquí
</Card>

<StatsCard
  label="Total Estudiantes"
  value={250}
  color="blue"
  icon={MdPeople}
  change={{ value: 5, positive: true }}
/>
```

### Button
Botones con múltiples variantes

```jsx
<Button variant="primary" icon={MdAdd}>Crear</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="ghost">Cancelar</Button>
<Button variant="success">Guardar</Button>
```

### Input, Select, Textarea
Campos de formulario

```jsx
<Input
  label="Nombre"
  type="text"
  icon={MdPerson}
  error="Campo requerido"
  helperText="Ingresa el nombre completo"
/>

<Select
  label="Grado"
  options={[
    { value: '1', label: '1° Básico' },
    { value: '2', label: '2° Básico' }
  ]}
/>

<Textarea label="Descripción" />
```

### Modal
Modales y confirmaciones

```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Crear Estudiante"
>
  {/* Contenido */}
</Modal>

<ConfirmModal
  isOpen={showDelete}
  title="Eliminar"
  message="¿Está seguro?"
  onConfirm={handleDelete}
  isDangerous={true}
/>
```

### Table & DataTable
Tablas con soporte para búsqueda, ordenamiento y paginación

```jsx
// Tabla básica
<Table columns={columns} data={students} />

// DataTable con filtrado avanzado
<DataTable
  columns={columns}
  data={students}
  search={true}
  pagination={true}
  pageSize={20}
/>
```

### Toast Notifications
Notificaciones tipo toast

```jsx
import { useToast } from '@/components/shared'

const { addToast } = useToast()

addToast('¡Operación exitosa!', 'success')
addToast('Algo salió mal', 'error')
addToast('Advertencia', 'warning')
addToast('Información', 'info')
```

### UploadZone
Zona de carga de archivos con drag-drop

```jsx
<UploadZone
  onFiles={handleFiles}
  accept=".csv,.xlsx"
  label="Arrastra archivos aquí"
/>
```

---

## 📄 Páginas del Admin

### 1. Dashboard (`/admin`)
**Función**: Estadísticas en tiempo real del sistema

**Componentes**:
- 6 StatsCards con métricas principales
- Acciones rápidas (4 tarjetas)
- Botones de exportación (PDF, Excel, CSV)
- Gráfico de barras: Retiros por hora
- Gráfico de pie: Distribución actual
- Gráfico de línea: Tendencia del día
- Tabla: Últimos 10 escaneos

**Métricas mostradas**:
- Total estudiantes
- Escaneados hoy (X/Y)
- En cola esperando
- Retirados
- En transporte
- Tiempo promedio retiro

```jsx
import AdminDashboard from '@/pages/admin/AdminDashboard'

// En rutas
<Route path="/admin" element={<AdminDashboard />} />
```

### 2. Gestión de Estudiantes (`/admin/students`)
**Función**: CRUD completo de estudiantes

**Características**:
- Tabla con búsqueda, ordenamiento y paginación
- Crear nuevo estudiante (formulario modal)
- Editar estudiante existente
- Eliminar con confirmación
- Importar CSV con validación
- Descargar plantilla CSV

**Campos del formulario**:
- Nombre (requerido)
- Grado (select con opciones predefinidas)
- Email del apoderado
- ID Ruta de Transporte

```jsx
import AdminStudents from '@/pages/admin/AdminStudents'

// El hook useStudents maneja toda la lógica
const { students, createStudent, updateStudent, deleteStudent } = useStudents()
```

### 3. Rutas de Transporte (`/admin/routes`)
**Función**: Crear, editar y eliminar rutas

**Características**:
- Tabla con todas las rutas
- Crear nueva ruta
- Editar ruta existente
- Eliminar ruta (con confirmación)
- Ver cantidad de estudiantes por ruta
- Información de capacidad

**Campos**:
- Nombre de la ruta
- Capacidad de estudiantes
- Descripción

### 4. Reportes y Exportación (`/admin/reports`)
**Función**: Descargar reportes en múltiples formatos

**Opciones de exportación**:
- PDF: Reporte diario con gráficos
- Excel: Detallado con fórmulas y macros
- CSV: Simple para sistemas externos

**Filtros disponibles**:
- Rango de fechas
- Filtro por grado
- Filtro por ruta
- Filtro por estado

**Datos historiales**:
- Tabla con reportes diarios
- Total escaneados
- Retiros completados
- En transporte
- Pendientes

### 5. Analítica (`/admin/analytics`)
**Función**: Análisis detallado de datos históricos

**KPIs principales**:
- Tasa de Retiro Promedio
- Velocidad de Atención (escaneos/minuto)
- Estudiantes sin Recoger
- Eficiencia del Transporte

**Gráficos**:
- Retiros por semana (últimas 4 semanas)
- Rutas más utilizadas (pie chart)
- Tendencia de asistencia (últimos 30 días)
- Tabla de horas pico con estadísticas

**Filtros**:
- Rango de fechas
- Filtro por grado

### 6. Configuración (`/admin/settings`)
**Función**: Ajustes generales del sistema

**Secciones**:

**Datos de la Institución**:
- Nombre de la institución
- Email
- Teléfono
- Localidad

**Horarios de Operación**:
- Hora de apertura
- Hora de cierre

**Preferencias**:
- Huso horario
- Idioma (ES/EN)
- Tema (claro/oscuro)
- Validaciones estrictas (on/off)

**Contacto de Emergencia**:
- Nombre
- Email
- Teléfono

---

## 🎣 Hooks Personalizados

### useStudents
Maneja toda la lógica de estudiantes

```jsx
const {
  students,        // Array de estudiantes
  loading,         // boolean
  error,           // string o null
  fetchStudents,   // () => Promise
  createStudent,   // (data) => Promise
  updateStudent,   // (id, data) => Promise
  deleteStudent,   // (id) => Promise
  uploadPhoto,     // (id, file) => Promise
  bulkCreate,      // (students) => Promise
} = useStudents()
```

### useDashboard
Obtiene estadísticas en tiempo real

```jsx
const {
  stats,           // Objeto con estadísticas
  todayData,       // Datos del día actual
  loading,         // boolean
  refetch,         // () => Promise
} = useDashboard()
```

---

## 🔌 API Integration (services/admin.js)

Todos los servicios están centralizados en `src/services/admin.js`

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

// Estudiantes
await studentService.list(params)
await studentService.get(id)
await studentService.create(data)
await studentService.update(id, data)
await studentService.delete(id)
await studentService.bulkCreate(students)

// Rutas
await routeService.list()
await routeService.create(data)
await routeService.update(id, data)
await routeService.delete(id)

// Reportes
await reportService.exportPDF(params)
await reportService.exportExcel(params)
await reportService.exportCSV(params)

// Dashboard
await dashboardService.stats()
await dashboardService.today()
await dashboardService.attendance(params)
```

---

## 🎨 Diseño y Colores

**Paleta de colores**:
- Primario: `#1e3a8a` (azul marino)
- Secundario: `#60a5fa` (azul cielo)
- Éxito: `#16a34a` (verde)
- Alerta: `#ea580c` (naranja)
- Error: `#dc2626` (rojo)
- Fondo: `#F8FAFB` (gris muy claro)
- Cards: Blanco con bordes grises

**Estilos**:
- Bordes y radios: 8px
- Sombras: shadow-md para cards
- Tipografía: Sistema de Tailwind (inter por defecto)

---

## 📱 Responsive Design

- **Desktop** (1024px+): Layout completo con sidebar fijo
- **Tablet** (768px): Sidebar colapsable
- **Móvil** (320px): Sidebar desplegable con menú hamburguesa

---

## ✅ Validación y Seguridad

- Validación en cliente Y servidor
- Confirmación antes de operaciones destructivas
- Control de roles por página
- Manejo de errores amigable
- Manejo automático de tokens JWT

---

## 🚀 Cómo Usar

### 1. Navegar al Dashboard
```
http://localhost:5173/admin
```

### 2. Crear un Estudiante
1. Ir a `/admin/students`
2. Clic en "Crear Estudiante"
3. Completar formulario
4. Clic en "Crear Estudiante"

### 3. Importar Estudiantes (CSV)
1. Ir a `/admin/students`
2. Clic en "Importar CSV"
3. Descargar plantilla como referencia
4. Cargar archivo CSV
5. Clic en "Importar"

**Formato CSV esperado**:
```csv
name,grade,parent_email,transport_route_id
Juan Pérez,1° Básico,juan@email.com,1
María García,2° Básico,maria@email.com,2
```

### 4. Generar Reportes
1. Ir a `/admin/reports`
2. Seleccionar rango de fechas
3. Aplicar filtros (opcional)
4. Clic en formato deseado (PDF, Excel, CSV)

### 5. Ver Estadísticas
1. Ir a `/admin` (Dashboard)
2. Statscard se actualizan cada 30 segundos
3. Ver gráficos interactivos
4. Hacer clic en "Actualizar" para refrescar manualmente

---

## 🛠️ Desarrollo

### Crear un nuevo componente admin
```jsx
// src/components/admin/NewComponent.jsx
import { Card, Button } from '../shared'

export const NewComponent = ({ data, onAction }) => {
  return (
    <Card title="Mi Componente">
      {/* Contenido */}
    </Card>
  )
}

export default NewComponent
```

### Agregar una nueva página admin
```jsx
// src/pages/admin/AdminNewPage.jsx
import { AdminLayout } from '../../components/admin'
import { PageHeader, Card } from '../../components/shared'

const AdminNewPage = () => {
  return (
    <AdminLayout>
      <PageHeader title="Nueva Página" />
      {/* Contenido */}
    </AdminLayout>
  )
}

export default AdminNewPage
```

### Llamar a la API
```jsx
import { studentService } from '@/services/admin'
import { useToast } from '@/components/shared'

const MyComponent = () => {
  const { addToast } = useToast()

  const handleCreate = async (data) => {
    try {
      const response = await studentService.create(data)
      addToast('¡Creado exitosamente!', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    {/* JSX */}
  )
}
```

---

## 📊 Gráficos Disponibles

Usando Chart.js a través de react-chartjs-2:

```jsx
import { LineChart, BarChart, PieChart, DoughnutChart } from '@/components/admin'

<LineChart
  labels={['06:00', '07:00', ...]}
  data={[12, 19, ...]}
  title="Estudiantes procesados"
/>

<BarChart
  labels={['Lunes', 'Martes', ...]}
  data={[45, 52, ...]}
  title="Retiros"
/>

<PieChart
  labels={['Retiro', 'Transporte', 'Esperando']}
  data={[120, 45, 15]}
/>
```

---

## 🔐 Autenticación

El panel de administración respeta el sistema de autenticación existente:

- Verificar `isAuthenticated` en el store
- Token JWT se envía automáticamente en headers
- Rutas protegidas redirigen a login si no está autenticado

```jsx
import { useAuthStore } from '@/stores'

const { token, user, isAuthenticated } = useAuthStore()
```

---

## 📝 Notas Importantes

1. **Toast Provider**: Envolve toda la app en `<ToastProvider>` en App.jsx
2. **LocalStorage**: Los tokens se guardan automáticamente
3. **Reload 30s**: Dashboard se actualiza cada 30 segundos
4. **Responsivo**: Todos los componentes son fully responsive
5. **Accesibilidad**: Usar labels en inputs y aria-labels donde sea necesario

---

## 🐛 Troubleshooting

### Los gráficos no se muestran
- Verificar que Chart.js esté instalado: `npm install chart.js react-chartjs-2`
- Revisar que el componente tenga datos

### Los datos no se cargan
- Verificar que la API esté corriendo en `http://localhost:5000`
- Revisar token en localStorage
- Revisar console para errores

### Modal no se abre
- Verificar que `isOpen={true}` está siendo pasado
- Revisar que el `onClose` callback está definido

---

## 📚 Referencias

- Chart.js: https://www.chartjs.org/
- React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- Zustand: https://zustand-demo.vercel.app/

---

**Última actualización**: 3 de marzo, 2026
