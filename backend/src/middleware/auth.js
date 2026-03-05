import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Middleware para validar JWT
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
}

/**
 * Middleware para validar rol de admin
 */
export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Permiso denegado. Se requiere rol de administrador',
    });
  }
  next();
}

/**
 * Middleware para validar rol de operador o admin
 */
export function authorizeOperator(req, res, next) {
  const role = req.user?.role;
  if (!req.user || (role !== 'admin' && role !== 'operator')) {
    return res.status(403).json({
      success: false,
      message: 'Permiso denegado. Se requiere rol de operador o administrador',
    });
  }
  next();
}

export default {
  authenticateToken,
  authorizeAdmin,
  authorizeOperator,
};
