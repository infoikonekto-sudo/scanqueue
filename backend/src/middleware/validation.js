import Joi from 'joi';

/**
 * Esquema de validación para login
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe ser válido',
    'any.required': 'El email es requerido',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida',
  }),
});

/**
 * Esquema de validación para registrarse
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe ser válido',
    'any.required': 'El email es requerido',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida',
  }),
  name: Joi.string().required().messages({
    'any.required': 'El nombre es requerido',
  }),
});

/**
 * Esquema de validación para crear estudiante
 */
export const studentSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'El nombre es requerido',
  }),
  grade: Joi.string().required().messages({
    'any.required': 'El grado es requerido',
  }),
  section: Joi.string().allow(null, ''),
  level: Joi.string().valid('preprimaria', 'primaria', 'secundaria').allow(null, ''),
  transport_route_id: Joi.alternatives().try(
    Joi.number(),
    Joi.string()
  ).allow(null).optional(),
  parent_email: Joi.string().email().allow(null, '').messages({
    'string.email': 'El email del apoderado debe ser válido',
  }),
  parent_phone: Joi.string().allow(null, ''),
  photo_url: Joi.string().allow(null, ''),
}).options({ stripUnknown: true }); // Ignorar campos extra en lugar de rechazarlos

/**
 * Esquema de validación para crear ruta
 */
export const routeSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'El nombre de la ruta es requerido',
  }),
  capacity: Joi.number().required().messages({
    'any.required': 'La capacidad es requerida',
  }),
  description: Joi.string().allow(null),
});

/**
 * Esquema de validación para escaneo
 */
export const scanSchema = Joi.object({
  student_id: Joi.number().required().messages({
    'any.required': 'El ID del estudiante es requerido',
  }),
  barcode: Joi.string().allow(null),
});

/**
 * Middleware para validar request body
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: messages,
      });
    }

    req.validatedData = value;
    next();
  };
}

export default {
  loginSchema,
  registerSchema,
  studentSchema,
  routeSchema,
  scanSchema,
  validateRequest,
};
