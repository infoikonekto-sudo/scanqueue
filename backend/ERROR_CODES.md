# Guía de Errores y Códigos de Respuesta

## Códigos HTTP

### Exitosos (2xx)
- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente

### Errores de Cliente (4xx)
- `400 Bad Request` - Solicitud malformada o parámetros inválidos
- `401 Unauthorized` - Token faltante o inválido
- `403 Forbidden` - Usuario sin permisos suficientes
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: usuario duplicado)

### Errores de Servidor (5xx)
- `500 Internal Server Error` - Error interno del servidor

## Mensajes de Error Comunes

### Autenticación
```json
{
  "success": false,
  "message": "Token de autenticación requerido"
}
```

```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

### Validación
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    "El nombre es requerido",
    "El email debe ser válido"
  ]
}
```

### Escaneos
```json
{
  "success": false,
  "message": "Escaneo duplicado. El estudiante fue registrado hace 30 segundos"
}
```

```json
{
  "success": false,
  "message": "Código QR no encontrado en la base de datos"
}
```

## Estructura de Respuesta Exitosa

```json
{
  "success": true,
  "message": "Operación completada",
  "data": {
    // datos del recurso
  }
}
```

## Estructura de Respuesta de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": ["Error 1", "Error 2"]
}
```

## Rate Limiting

Se permite un máximo de 10 escaneos por segundo por usuario.

Por defecto, se detectan escaneos duplicados en un intervalo de 30 segundos.

## Validación de Datos

### Email
- Debe ser un email válido
- Máximo 255 caracteres
- Debe ser único para usuarios

### Contraseña
- Mínimo 6 caracteres
- Se almacena hasheada con bcrypt

### Nombre de Estudiante
- Requerido
- Máximo 255 caracteres

### Grado
- Requerido
- Ejemplos: "1° Básico", "2° Básico", etc.

### Código Único de Estudiante
- Generado automáticamente
- Formato: STU{timestamp}{random}
- Único en la base de datos
