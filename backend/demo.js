#!/usr/bin/env node

/**
 * Script de demostración para ScanQueue
 * Simula escaneos y eventos en tiempo real
 * 
 * Uso: node demo.js (desde carpeta backend)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuración
const BACKEND_URL = 'http://localhost:3001';
const DEMO_DURATION = 60000; // 1 minuto
const SCAN_INTERVAL = 3000; // Cada 3 segundos

// Estudiantes de prueba
const mockStudents = [
  { name: 'Juan Pérez García', grade: '10°A', section: 'A' },
  { name: 'María González López', grade: '10°B', section: 'B' },
  { name: 'Carlos Rodríguez Silva', grade: '9°A', section: 'A' },
  { name: 'Ana Martínez Flores', grade: '9°C', section: 'C' },
  { name: 'Pedro Sánchez Díaz', grade: '11°A', section: 'A' },
  { name: 'Laura Jiménez Torres', grade: '10°C', section: 'C' },
  { name: 'Diego Ramírez Castro', grade: '8°B', section: 'B' },
  { name: 'Sofia López Moreno', grade: '11°B', section: 'B' },
];

const routes = ['Ruta A', 'Ruta B', 'Ruta C', 'Ruta D'];

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.blue}[${timestamp}]${colors.reset} ${message}`);
}

function getRandomStudent() {
  return mockStudents[Math.floor(Math.random() * mockStudents.length)];
}

function getRandomRoute() {
  return routes[Math.floor(Math.random() * routes.length)];
}

async function makeRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(endpoint, BACKEND_URL);
      const options = {
        method,
        timeout: 5000,
      };

      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? require('https') : require('http');

      const req = lib.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function checkBackendStatus() {
  try {
    log('info', 'Verificando estado del backend...');
    const response = await makeRequest('/api/health');
    log('success', `✅ Backend activo: ${JSON.stringify(response)}`);
    return true;
  } catch (error) {
    log('error', `❌ No se puede alcanzar el backend en ${BACKEND_URL}`);
    log('error', error.message);
    return false;
  }
}

function displayBanner() {
  console.log(`
${colors.bright}${colors.green}
╔════════════════════════════════════════╗
║     🎬 DEMO - ScanQueue                ║
║     Sistema de Cola en Tiempo Real    ║
╚════════════════════════════════════════╝
${colors.reset}

${colors.bright}Configuración:${colors.reset}
- Backend: ${BACKEND_URL}
- Duración: ${DEMO_DURATION / 1000} segundos
- Intervalo de escaneo: ${SCAN_INTERVAL / 1000} segundos
- Total de estudiantes: ${mockStudents.length}

${colors.yellow}Pasos a seguir:${colors.reset}
1. Abre http://localhost:3000 en tu navegador
2. Asegúrate que el indicador de conexión esté ${colors.green}✅ verde${colors.reset}
3. Este script simulará:
   - Nuevos escaneos
   - Estudiantes retirados
   - Asignaciones a transporte

Presiona ${colors.bright}Ctrl+C${colors.reset} para detener la demo.
${colors.bright}Iniciando en 3 segundos...${colors.reset}
  `);
}

async function runDemo() {
  displayBanner();

  // Esperar 3 segundos
  await new Promise(r => setTimeout(r, 3000));

  const isBackendUp = await checkBackendStatus();
  if (!isBackendUp) {
    log('error', 'Por favor, inicia el backend: npm run dev');
    process.exit(1);
  }

  log('info', 'Demo iniciada 🚀');
  console.log('');

  let studentCount = 0;
  const completedStudents = [];
  const completedIds = [];

  const scanInterval = setInterval(async () => {
    const action = Math.random();
    
    if (action < 0.5) {
      // Nuevo escaneo
      const student = getRandomStudent();
      studentCount++;
      const studentId = `${Date.now()}-${studentCount}`;

      log('info', `${colors.green}📱 Nuevo escaneo: ${student.name}${colors.reset}`);
      log('info', `   └─ Grado: ${student.grade}, Sección: ${student.section}`);
      completedStudents.push(studentId);

    } else if (action < 0.75 && completedStudents.length > 0) {
      // Marcar como completado
      const studentId = completedStudents.pop();
      const student = getRandomStudent();
      
      log('info', `${colors.green}✅ ${student.name} - RETIRADO${colors.reset}`);
      completedIds.push(studentId);

    } else if (completedStudents.length > 0) {
      // Asignar a transporte
      const studentId = completedStudents.pop();
      const route = getRandomRoute();
      const student = getRandomStudent();
      
      log('info', `${colors.yellow}🚌 ${student.name} → ${route}${colors.reset}`);
    }
  }, SCAN_INTERVAL);

  // Estadísticas finales
  setTimeout(() => {
    clearInterval(scanInterval);
    
    console.log('');
    log('info', '📊 Estadísticas de la Demo:');
    console.log(`${colors.bright}
  Estudiantes escaneados: ${studentCount}
  Estudiantes retirados: ${completedIds.length}
  En espera: ${completedStudents.length}
${colors.reset}`);
    
    log('info', 'Demo completada ✨');
    process.exit(0);
  }, DEMO_DURATION);
}

// Iniciar
runDemo().catch(error => {
  log('error', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  log('warn', 'Demo detenida por el usuario');
  process.exit(0);
});
