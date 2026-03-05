/**
 * Índice de exportaciones para acceso fácil a modelos, controladores y servicios
 */

// Modelos
export * as UserModel from './models/User.js';
export * as StudentModel from './models/Student.js';
export * as ScanModel from './models/Scan.js';
export * as RouteModel from './models/Route.js';
export * as QRCodeModel from './models/QRCode.js';

// Controladores
export * as AuthController from './controllers/AuthController.js';
export * as StudentController from './controllers/StudentController.js';
export * as ScanController from './controllers/ScanController.js';
export * as RouteController from './controllers/RouteController.js';
export * as QRController from './controllers/QRController.js';
export * as DashboardController from './controllers/DashboardController.js';

// Servicios
export * as QRService from './services/QRService.js';
export * as ScanService from './services/ScanService.js';
export * as ReportService from './services/ReportService.js';
export * as ValidationService from './services/ValidationService.js';
export * as CodeGeneratorService from './services/CodeGeneratorService.js';
export { DuplicateCache } from './services/DuplicateCache.js';
export { AuditLogger } from './services/AuditLogger.js';

// Middleware
export * as AuthMiddleware from './middleware/auth.js';
export * as ValidationMiddleware from './middleware/validation.js';
export * as ErrorMiddleware from './middleware/errorHandler.js';

// Utilidades
export * as Helpers from './utils/helpers.js';
