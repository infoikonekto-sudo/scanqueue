/**
 * EJEMPLOS DE USO: VALIDADOR DE CÓDIGOS QR/BARRAS
 * Demostración práctica de cómo usar el sistema
 */

// ============================================
// EJEMPLO 1: Validar un código QR
// ============================================

import { validateCode } from './ValidationService.js';

async function ejemplo1_validarQR() {
  console.log('\n=== EJEMPLO 1: Validar Código QR ===\n');

  const qrCode = '{"studentId":1,"name":"Juan Pérez","grade":"1A"}';
  const context = {
    operatorId: 'OP001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
  };

  const result = await validateCode(qrCode, 'qr', context);

  console.log('Resultado:');
  console.log(result);
  
  if (result.status === 'success') {
    console.log(`\n✅ Estudiante: ${result.name}`);
    console.log(`📊 Confianza: ${result.confidence}%`);
    console.log(`⏱️ Tiempo: ${result.processingTime}ms`);
  }
}

// ============================================
// EJEMPLO 2: Validar un barcode
// ============================================

async function ejemplo2_validarBarcode() {
  console.log('\n=== EJEMPLO 2: Validar Código Barcode ===\n');

  const barcode = '001'; // ID de estudiante
  const context = {
    operatorId: 'OP002',
    ipAddress: '192.168.1.101',
  };

  const result = await validateCode(barcode, 'barcode', context);

  console.log('Resultado:');
  console.log(result);
}

// ============================================
// EJEMPLO 3: Detección automática de tipo
// ============================================

import { detectCodeType } from './ValidationService.js';

function ejemplo3_deteccionAutomatica() {
  console.log('\n=== EJEMPLO 3: Detección Automática ===\n');

  const ejemplos = [
    '{"studentId":1,"name":"Juan"}',
    '123456789',
    'STU001',
  ];

  for (const code of ejemplos) {
    const type = detectCodeType(code);
    console.log(`Código: ${code.substring(0, 30)}...`);
    console.log(`Tipo detectado: ${type}\n`);
  }
}

// ============================================
// EJEMPLO 4: Validar con timeout de 500ms
// ============================================

import { validateCodeWithTimeout } from './ValidationService.js';

async function ejemplo4_validarConTimeout() {
  console.log('\n=== EJEMPLO 4: Validar con Timeout (500ms) ===\n');

  const code = '{"studentId":1,"name":"Juan","grade":"1A"}';
  const startTime = Date.now();

  const result = await validateCodeWithTimeout(code, 'qr', {}, 500);

  const elapsed = Date.now() - startTime;
  console.log(`Tiempo real: ${elapsed}ms`);
  console.log(`Dentro de timeout: ${elapsed <= 500 ? '✅ SÍ' : '❌ NO'}`);
  console.log(`Estado: ${result.status}`);
  console.log(`Mensaje: ${result.message}`);
}

// ============================================
// EJEMPLO 5: Usar DuplicateCache
// ============================================

import { DuplicateCache } from './DuplicateCache.js';

async function ejemplo5_duplicateCache() {
  console.log('\n=== EJEMPLO 5: Caché de Duplicados ===\n');

  const cache = new DuplicateCache(100, 60000);

  // Agregar un estudiante
  console.log('1. Agregando estudiante 001 al caché...');
  cache.add(1);

  // Verificar que existe
  console.log('\n2. Verificando si 001 está en caché...');
  const found = cache.check(1);
  console.log(`Resultado: ${found ? '✅ Encontrado (DUPLICADO)' : '❌ No encontrado'}`);

  // Agregar más estudiantes
  console.log('\n3. Agregando 50 estudiantes más...');
  for (let i = 2; i <= 50; i++) {
    cache.add(i);
  }

  // Estadísticas
  console.log('\n4. Estadísticas del caché:');
  const stats = cache.getStats();
  console.log(`   Tamaño: ${stats.totalScans}/${stats.maxSize}`);
  console.log(`   Utilización: ${stats.utilizationPercent}%`);
  console.log(`   Edad promedio: ${stats.averageAgeMs}ms`);

  // Limpiar
  console.log('\n5. Limpiando caché...');
  cache.clear();
  console.log(`   Nuevo tamaño: ${cache.size()}`);
}

// ============================================
// EJEMPLO 6: Logger de Auditoría
// ============================================

import { AuditLogger } from './AuditLogger.js';

async function ejemplo6_auditLogger() {
  console.log('\n=== EJEMPLO 6: Logger de Auditoría ===\n');

  const logger = new AuditLogger();

  // Registrar un escaneo exitoso
  console.log('1. Registrando escaneo exitoso...');
  await logger.logValidation(
    {
      status: 'success',
      studentId: 1,
      name: 'Juan Pérez',
      grade: '1A',
      error: null,
      message: 'Validación exitosa',
      confidence: 100,
      duplicateFlag: false,
      processingTime: 45,
    },
    { operatorId: 'OP001' }
  );

  // Registrar un duplicado
  console.log('\n2. Registrando duplicado...');
  await logger.logValidation(
    {
      status: 'warning',
      studentId: 2,
      name: 'María García',
      grade: '1B',
      error: 'DUPLICATE_SCAN',
      message: 'Código escaneado hace 10 segundos',
      confidence: 90,
      duplicateFlag: true,
      processingTime: 25,
    },
    { operatorId: 'OP001' }
  );

  // Registrar un error
  console.log('\n3. Registrando error...');
  await logger.logValidation(
    {
      status: 'error',
      studentId: null,
      name: null,
      grade: null,
      error: 'INVALID_CODE',
      message: 'Estudiante no encontrado',
      confidence: 0,
      duplicateFlag: false,
      processingTime: 120,
    },
    { operatorId: 'OP001' }
  );

  // Resumen rápido
  console.log('\n4. Resumen de la sesión:');
  const summary = logger.getQuickSummary();
  console.log(`   Último minuto: ${summary.lastMinute.total} escaneos`);
  console.log(`   - Exitosos: ${summary.lastMinute.successful}`);
  console.log(`   - Errores: ${summary.lastMinute.errors}`);
  console.log(`   - Duplicados: ${summary.lastMinute.duplicates}`);
}

// ============================================
// EJEMPLO 7: Generar Códigos QR
// ============================================

import { generateQRCode, generateBarcode } from './CodeGeneratorService.js';

async function ejemplo7_generarCodigos() {
  console.log('\n=== EJEMPLO 7: Generar Códigos ===\n');

  const student = {
    id: 1,
    name: 'Juan Pérez',
    grade: '1A',
    section: 'A',
  };

  // Generar QR
  console.log('1. Generando QR...');
  const qr = await generateQRCode(student, {
    size: 300,
    errorCorrection: 'H',
  });
  console.log(`✅ QR generado`);
  console.log(`   Tamaño: 300x300px`);
  console.log(`   PNG URL: ${qr.pngUrl.substring(0, 50)}...`);

  // Generar Barcode
  console.log('\n2. Generando Barcode...');
  const barcode = await generateBarcode(student.id, {
    type: 'code128',
  });
  console.log(`✅ Barcode generado`);
  console.log(`   Tipo: Code128`);
  console.log(`   Valor: ${barcode.barcodeValue}`);
  console.log(`   Checksum: ${barcode.checksum}`);
}

// ============================================
// EJEMPLO 8: Caso de Uso Completo
// ============================================

async function ejemplo8_casoCompleto() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  CASO DE USO: Escanear en clase            ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const cache = new DuplicateCache(100, 60000);
  const logger = new AuditLogger();

  // Simulación: 10 estudiantes siendo escaneados
  const estudiantesQR = [
    '{"studentId":1,"name":"Juan Pérez","grade":"1A"}',
    '{"studentId":2,"name":"María García","grade":"1A"}',
    '{"studentId":1,"name":"Juan Pérez","grade":"1A"}', // DUPLICADO
    '{"studentId":3,"name":"Carlos López","grade":"1A"}',
    'CODIGO_INVALIDO', // ERROR
  ];

  for (let i = 0; i < estudiantesQR.length; i++) {
    console.log(`\n--- Escaneo ${i + 1} ---`);

    const result = await validateCode(estudiantesQR[i], 'auto', {
      operatorId: 'TEACHER001',
      ipAddress: '192.168.1.50',
    });

    // Registrar
    await logger.logValidation(result, { operatorId: 'TEACHER001' });

    // Mostrar resultado
    if (result.status === 'success') {
      console.log(`✅ ${result.name} (${result.grade}) - Confianza: ${result.confidence}%`);
      cache.add(result.studentId);
    } else if (result.status === 'warning') {
      console.log(`⚠️ ${result.message}`);
    } else {
      console.log(`❌ Error: ${result.message}`);
    }

    console.log(`Tiempo: ${result.processingTime}ms`);
  }

  // Estadísticas finales
  console.log('\n=== ESTADÍSTICAS FINALES ===');
  const summary = logger.getQuickSummary();
  console.log(`Total: ${summary.lastMinute.total}`);
  console.log(`Exitosos: ${summary.lastMinute.successful}`);
  console.log(`Errores: ${summary.lastMinute.errors}`);
  console.log(`Duplicados: ${summary.lastMinute.duplicates}`);
  console.log(`Caché: ${cache.size()}/100`);
}

// ============================================
// EJECUTAR EJEMPLOS
// ============================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  EJEMPLOS: VALIDADOR DE CÓDIGOS QR/BARRAS  ║');
  console.log('╚════════════════════════════════════════════╝');

  // Nota: Estos ejemplos requieren base de datos real
  // Por ahora solo demostramos la estructura

  try {
    ejemplo3_deteccionAutomatica();
    // ejemplo1_validarQR();  // Requiere BD
    // ejemplo2_validarBarcode();  // Requiere BD
    await ejemplo4_validarConTimeout();
    await ejemplo5_duplicateCache();
    await ejemplo6_auditLogger();
    // await ejemplo7_generarCodigos();  // Requiere dependencias
    // await ejemplo8_casoCompleto();  // Requiere BD

    console.log('\n✅ Ejemplos completados!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  ejemplo1_validarQR,
  ejemplo2_validarBarcode,
  ejemplo3_deteccionAutomatica,
  ejemplo4_validarConTimeout,
  ejemplo5_duplicateCache,
  ejemplo6_auditLogger,
  ejemplo7_generarCodigos,
  ejemplo8_casoCompleto,
  runAllExamples,
};
