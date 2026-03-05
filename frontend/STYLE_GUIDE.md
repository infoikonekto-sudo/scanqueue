# Guía de Estilo y Mejores Prácticas

## 📐 Convenciones de Código

### Nombres de Archivos
```
✅ Correcto
- AdminDashboard.jsx      // Componente React
- useStudents.js          // Hook
- studentService.js       // Servicio/API
- student.module.css      // Estilos

❌ Incorrecto
- admin-dashboard.jsx
- UseStudents.js
- student_service.js
```

### Nombres de Variables
```jsx
// ✅ Correcto
const [isLoading, setIsLoading] = useState(false)
const [studentData, setStudentData] = useState(null)
const fetchStudents = async () => {}

// ❌ Incorrecto
const [loading, setLoading] = useState(false)
const [data, setData] = useState(null)
const getStudents = async () => {}
```

### Estructura de Componentes
```jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@/components/shared'
import { useStudents } from '@/hooks/admin'
import './styles.css'

/**
 * Descripción del componente
 * @param {Object} props
 * @param {string} props.title - Título del componente
 * @param {Function} props.onSubmit - Callback al enviar
 */
const MyComponent = ({ title, onSubmit }) => {
  // States
  const [data, setData] = useState(null)

  // Hooks
  const { students, loading } = useStudents()

  // Effects
  useEffect(() => {
    // Lógica
  }, [])

  // Handlers
  const handleChange = (e) => {
    setData(e.target.value)
  }

  // Render
  return (
    <div className="p-4">
      <h1>{title}</h1>
    </div>
  )
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

MyComponent.defaultProps = {
  title: 'Título',
  onSubmit: () => {},
}

export default MyComponent
```

---

## 🎨 Estilos con Tailwind

### Clases comunes
```jsx
// Espaciado
<div className="p-4 m-2 mb-6">

// Flexbox
<div className="flex items-center justify-between gap-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Texto
<p className="text-lg font-bold text-gray-900">

// Colores
<div className="bg-blue-900 text-white border border-blue-200">

// Responsive
<div className="hidden md:block">  {/* Solo en desktop */}
<div className="md:hidden">         {/* Solo en mobile/tablet */}
```

### Colores del sistema
```jsx
// Primario: Azul marino
className="bg-blue-900 text-blue-900 border-blue-200"

// Secundario: Azul cielo
className="bg-blue-100 text-blue-600 border-blue-300"

// Verde (éxito)
className="bg-green-100 text-green-900 border-green-200"

// Rojo (error)
className="bg-red-100 text-red-900 border-red-200"

// Naranja (alerta)
className="bg-orange-100 text-orange-900 border-orange-200"

// Gris (neutral)
className="bg-gray-50 text-gray-700 border-gray-200"
```

### Sombras y bordes
```jsx
// Sombras
className="shadow-sm shadow-md shadow-lg"

// Bordes
className="border border-gray-200 rounded-lg"

// Hover effects
className="hover:bg-gray-100 hover:shadow-md transition-all"
```

---

## ✅ Validación

### En Cliente
```jsx
const validate = (data) => {
  const errors = {}

  // Campos requeridos
  if (!data.name?.trim()) {
    errors.name = 'El nombre es requerido'
  }

  // Longitud
  if (data.name && data.name.length < 3) {
    errors.name = 'Mínimo 3 caracteres'
  }

  // Email
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email no válido'
  }

  // Número
  if (data.age && (isNaN(data.age) || data.age < 0)) {
    errors.age = 'Edad no válida'
  }

  return errors
}

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### Validación en Formulario
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()

  const errors = validate(data)
  if (Object.keys(errors).length > 0) {
    setErrors(errors)
    addToast('Revisa los errores en el formulario', 'warning')
    return
  }

  setLoading(true)
  try {
    await apiCall(data)
    addToast('¡Éxito!', 'success')
  } catch (err) {
    addToast(err.message, 'error')
  } finally {
    setLoading(false)
  }
}
```

---

## 🔒 Seguridad

### Manejo de Tokens
```jsx
// Guardar token seguro
localStorage.setItem('token', response.data.token)

// Acceder en servicios
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

// Limpiar en logout
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  navigate('/login')
}
```

### Validación de Permisos
```jsx
const ProtectedComponent = ({ requiredRole = 'admin' }) => {
  const { user } = useAuthStore()

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />
  }

  return <div>Contenido protegido</div>
}
```

### XSS Prevention
```jsx
// ❌ Evitar
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Correcto
<div>{userInput}</div>  // React escapa automáticamente
```

---

## 📊 Mejores Prácticas en Hooks

### useEffect Cleanup
```jsx
useEffect(() => {
  const fetchData = async () => {
    const response = await api.get('/')
    setData(response.data)
  }

  let isMounted = true
  fetchData()

  return () => {
    isMounted = false  // Cleanup
  }
}, [])
```

### Evitar efectos infinitos
```jsx
// ❌ Infinito!
useEffect(() => {
  setData([...data, newItem])
})

// ✅ Correcto
useEffect(() => {
  setData([...data, newItem])
}, [newItem])  // Dependencia clara
```

### Debounce en búsqueda
```jsx
useEffect(() => {
  if (!query) return

  const timer = setTimeout(() => {
    searchAPI(query)
  }, 300)

  return () => clearTimeout(timer)
}, [query])
```

---

## 🎯 Manejo de Estado

### Estructura de estado
```jsx
// ❌ Demasiado estado
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [age, setAge] = useState(0)

// ✅ Agrupado
const [formData, setFormData] = useState({
  name: '',
  email: '',
  age: 0
})
```

### Actualizar estado anidado
```jsx
const handleChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({
    ...prev,
    [name]: value
  }))
}

// O con Zustand
const updateUser = (id, data) => {
  setUsers(users => 
    users.map(u => u.id === id ? { ...u, ...data } : u)
  )
}
```

---

## 🔄 Trabajar con Listas

### Agregar elemento
```jsx
const addItem = (item) => {
  setItems(prev => [...prev, item])
  // o con inmutabilidad
  setItems(prev => [item, ...prev])  // Al inicio
}
```

### Actualizar elemento
```jsx
const updateItem = (id, updates) => {
  setItems(prev =>
    prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  )
}
```

### Eliminar elemento
```jsx
const removeItem = (id) => {
  setItems(prev => prev.filter(item => item.id !== id))
}
```

### Ordenar
```jsx
const sortItems = (by) => {
  setItems(prev =>
    [...prev].sort((a, b) =>
      a[by] > b[by] ? 1 : -1
    )
  )
}
```

---

## 🚀 Performance

### useMemo para cálculos costosos
```jsx
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])
```

### useCallback para funciones
```jsx
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### Lazy loading de componentes
```jsx
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./AdminDashboard'))

<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Virtualization para listas grandes
```jsx
// Considerar FixedSizeList si hay >1000 items
import { FixedSizeList } from 'react-window'
```

---

## 📝 Documentación

### Comentar código complejo
```jsx
/**
 * Procesa estudiantes y agrupa por grado
 * @param {Array} students - Lista de estudiantes
 * @param {string} sortBy - Campo para ordenar
 * @returns {Object} Estudiantes agrupados por grado
 */
const groupByGrade = (students, sortBy = 'name') => {
  return students.reduce((acc, student) => {
    const grade = student.grade
    if (!acc[grade]) acc[grade] = []
    acc[grade].push(student)
    return acc
  }, {})
}
```

### README completo
```markdown
# Mi Componente

## Descripción
Breve descripción de qué hace

## Props
- `title` (string): Título obligatorio
- `onSubmit` (function): Callback al enviar

## Ejemplo de uso
\`\`\`jsx
<MiComponente title="Crear" onSubmit={handler} />
\`\`\`
```

---

## 🧪 Testing

### Estructura de test básico
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('debería renderizar el título', () => {
    render(<MyComponent title="Prueba" />)
    expect(screen.getByText('Prueba')).toBeInTheDocument()
  })

  it('debería llamar onSubmit al hacer clic', () => {
    const mockSubmit = jest.fn()
    render(<MyComponent onSubmit={mockSubmit} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSubmit).toHaveBeenCalled()
  })
})
```

---

## 🐛 Debugging

### React DevTools
```
Instalar: React Developer Tools extension para Chrome/Firefox
Permite: Ver componentes, props, state, profiling
```

### Console Logging
```jsx
// ✅ Correcto - objetos etiquetados
console.log('✅ Usuario creado:', user)
console.error('❌ Error al guardar:', error)

// ❌ Evitar
console.log(data)
console.log('data')
```

### Fuentes de errores comunes
1. **Estado no actualiza**: Verificar dependencias de useEffect
2. **Componente no renderiza**: Verificar condicionales
3. **API no responde**: Verificar URL, headers, token
4. **Estilos no aplican**: Verificar selectores, order CSS

---

## 📋 Checklist de Calidad

- [ ] Código sin `console.log` en producción
- [ ] Manejo de errores en todas las llamadas API
- [ ] Loading states para operaciones async
- [ ] Validación en cliente Y servidor
- [ ] Componentes no tienen lógica de negocio (usar hooks)
- [ ] Props están tipadas con PropTypes
- [ ] Responsive en 3 breakpoints (mobile, tablet, desktop)
- [ ] Accesibilidad: labels, alt text, aria-labels
- [ ] Sin warnings en consola
- [ ] Documentado: README, JSDoc, comments

---

**Última actualización**: 3 de marzo, 2026
