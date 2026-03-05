## Patrones de Socket.io Comunes

### 1. Reconexión Automática Mejorada

```javascript
const socket = io(URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling']
});

socket.on('reconnect_attempt', () => {
  console.log('Intentando reconectar...');
});

socket.on('reconnect_error', (error) => {
  console.error('Error de reconexión:', error);
});

socket.on('reconnect', () => {
  console.log('✅ Reconectado!');
  socket.emit('queue:refresh');
});
```

### 2. Almacenamiento Local Fallback

```javascript
// Guardar estado local
const saveQueueToLocalStorage = (queue) => {
  localStorage.setItem('queue_cache', JSON.stringify({
    timestamp: Date.now(),
    data: queue
  }));
};

// Recuperar si es necesario
const loadQueueFromLocalStorage = () => {
  const cached = localStorage.getItem('queue_cache');
  if (cached) {
    const { data } = JSON.parse(cached);
    return data;
  }
  return [];
};
```

### 3. Rate Limiting en Frontend

```javascript
// Evitar enviar múltiples eventos rápidamente
const createRateLimiter = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

const limitedMarkAsCompleted = createRateLimiter(markAsCompleted, 500);
```

### 4. Manejo de Errores Robusto

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  setConnectionError(error);
  
  // Intentar reconectar
  setTimeout(() => {
    socket.connect();
  }, 2000);
});

// En backend
socket.on('student:completed', (data, callback) => {
  try {
    // Procesar
    callback({ success: true });
  } catch (error) {
    callback({ success: false, error: error.message });
  }
});
```

### 5. Validación de Datos

```javascript
// En frontend
const validateStudent = (student) => {
  return {
    isValid: student.name && student.grade && student.section,
    errors: {
      name: !student.name ? 'Nombre requerido' : null,
      grade: !student.grade ? 'Grado requerido' : null,
      section: !student.section ? 'Sección requerida' : null
    }
  };
};

if (validateStudent(student).isValid) {
  socket.emit('scan:new', student);
}
```

### 6. Logging Console Organizado

```javascript
const log = {
  info: (msg, data) => console.log(`ℹ️ ${msg}`, data || ''),
  success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`⚠️ ${msg}`, data || ''),
  error: (msg, data) => console.error(`❌ ${msg}`, data || '')
};

log.info('Conectando socket...');
socket.on('connect', () => log.success('Socket conectado'));
```

### 7. Métricas de Rendimiento

```javascript
const metrics = {
  socketLatency: 0,
  updateTime: 0
};

socket.on('connect', () => {
  const startTime = Date.now();
  socket.emit('ping', () => {
    metrics.socketLatency = Date.now() - startTime;
    console.log(`Latencia: ${metrics.socketLatency}ms`);
  });
});
```

### 8. Actualización Optimista

```javascript
const markAsCompletedOptimistic = (studentId) => {
  // Actualizar UI inmediatamente
  setQueue(prev => prev.filter(s => s.id !== studentId));
  
  // Enviar al servidor
  socket.emit('student:completed', { studentId }, (response) => {
    if (!response.success) {
      // Revertir si falla
      requestQueueRefresh();
    }
  });
};
```

### 9. Debouncing de Búsqueda

```javascript
import { useEffect, useState } from 'react';

const useDebouncedSearch = (query, delay = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return debouncedQuery;
};

// Uso
const debouncedSearch = useDebouncedSearch(searchQuery);
```

### 10. Batch Updates

```javascript
// Agrupar múltiples cambios en una sola actualización
let updateQueue = [];
let updateTimeout;

const queueUpdate = (update) => {
  updateQueue.push(update);
  
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    socket.emit('batch:update', updateQueue);
    updateQueue = [];
  }, 100);
};
```

---

**Más patrones en próximas versiones...**
