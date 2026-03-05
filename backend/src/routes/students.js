import express from 'express';
import * as StudentController from '../controllers/StudentController.js';
import { authenticateToken, authorizeOperator } from '../middleware/auth.js';
import { validateRequest, studentSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * GET /api/students
 * Obtiene lista de estudiantes
 */
router.get('/', authenticateToken, StudentController.getAllStudents);

/**
 * POST /api/students
 * Crea un nuevo estudiante
 */
router.post('/', authenticateToken, authorizeOperator, validateRequest(studentSchema), StudentController.createStudent);
router.post('/bulk', authenticateToken, authorizeOperator, StudentController.bulkCreateStudents);
router.post('/bulk-upsert', authenticateToken, authorizeOperator, StudentController.bulkUpsertStudents);
router.delete('/all', authenticateToken, authorizeOperator, StudentController.deleteAllStudents);

/**
 * GET /api/students/grade/:grade
 * Obtiene estudiantes por grado
 * NOTA: Debe estar ANTES de /:id para evitar ambigüedad en Express
 */
router.get('/grade/:grade', authenticateToken, StudentController.getStudentsByGrade);

/**
 * GET /api/students/search/:query
 * Busca estudiantes
 * NOTA: Debe estar ANTES de /:id para evitar ambigüedad en Express
 */
router.get('/search/:query', authenticateToken, StudentController.searchStudents);

/**
 * GET /api/students/:id
 * Obtiene un estudiante por ID
 */
router.get('/:id', authenticateToken, StudentController.getStudentById);

/**
 * PUT /api/students/:id
 * Actualiza un estudiante
 */
router.put('/:id', authenticateToken, authorizeOperator, validateRequest(studentSchema), StudentController.updateStudent);

/**
 * DELETE /api/students/:id
 * Elimina un estudiante
 */
router.delete('/:id', authenticateToken, authorizeOperator, StudentController.deleteStudent);

export default router;
