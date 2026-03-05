import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as UserModel from '../models/User.js';

/**
 * POST /api/auth/login
 * Login de usuario
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.validatedData;

    // Buscar usuario
    let user;
    try {
      user = await UserModel.getUserByEmail(email);
    } catch (dbError) {
      console.error('Error de base de datos en login:', dbError.message);

      // MODO FALLBACK: Si la DB está caída o son credenciales maestras, permitir login
      const isConfigAdmin = email === config.admin.email && password === config.admin.password;
      const isEmergencyAdmin = email === 'admin@admin.com' && password === 'admin123';

      if (isConfigAdmin || isEmergencyAdmin) {
        console.log('Utilizando login de emergencia/maestro');
        user = {
          id: 'admin-fallback',
          email: isEmergencyAdmin ? 'admin@admin.com' : config.admin.email,
          name: 'Administrador Maestro',
          role: 'admin',
          password: 'fakepassword'
        };

        // Generar token y responder
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          config.jwt.secret,
          { expiresIn: config.jwt.expiration }
        );

        return res.json({
          success: true,
          message: 'Autenticación exitosa (Modo Maestro)',
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
      }
      throw dbError; // Re-lanzar si no es el admin maestra
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Validar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiration }
    );

    res.json({
      success: true,
      message: 'Autenticación exitosa',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (solo admin)
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.validatedData;

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya existe',
      });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await UserModel.createUser(email, hashedPassword, name);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
export async function getCurrentUser(req, res, next) {
  try {
    const user = await UserModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  login,
  register,
  getCurrentUser,
};
