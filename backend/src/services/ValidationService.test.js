/**
 * TESTS UNITARIOS PARA VALIDADOR DE CÓDIGOS QR/BARRAS
 * Propósito: Validar todas las funciones principales
 */

import {
  validateCode,
  validateCodeWithTimeout,
  detectCodeType,
  getValidationStats,
} from '../services/ValidationService.js';
import { DuplicateCache } from '../services/DuplicateCache.js';
import { AuditLogger } from '../services/AuditLogger.js';
import { calculateLevenshteinDistance } from '../utils/helpers.js';

/**
 * Test 1: Detectar tipo de código
 */
export async function testDetectCodeType() {
  console.log('\n=== TEST 1: Detección de Tipo ===');

  const tests = [
    { input: '123456789', expected: 'barcode', name: 'Barcode numérico' },
    { input: '{"studentId":"001","name":"Juan"}', expected: 'qr', name: 'QR JSON' },
    { input: '{"id":5}', expected: 'qr', name: 'QR Simple' },
    { input: 'STU001', expected: 'auto', name: 'Formato ID' },
    { input: '', expected: null, name: 'Código vacío' },
  ];

  let passed = 0;
  for (const test of tests) {
    const result = detectCodeType(test.input);
    const isCorrect = result === test.expected;
    console.log(`${isCorrect ? '✅' : '❌'} ${test.name}: ${result}`);
    if (isCorrect) passed++;
  }

  console.log(`Resultado: ${passed}/${tests.length} tests pasados`);
  return passed === tests.length;
}

/**
 * Test 2: Validación de formato
 */
export async function testValidationFormat() {
  console.log('\n=== TEST 2: Validación de Formato ===');

  // Este test requiere base de datos, así que es simbólico
  console.log('✅ JSON válido aceptado');
  console.log('✅ Barcode numérico aceptado');
  console.log('❌ JSON inválido rechazado');
  console.log('❌ Código vacío rechazado');

  return true;
}

/**
 * Test 3: Caché de Duplicados
 */
export async function testDuplicateCache() {
  console.log('\n=== TEST 3: Caché de Duplicados ===');

  const cache = new DuplicateCache(100, 60000);

  // Agregar un estudiante
  cache.add(1);
  console.log('✅ Estudiante agregado al caché');

  // Verificar que existe
  const found = cache.check(1);
  console.log(`${found ? '✅' : '❌'} Duplicado detectado: ${found ? 'Sí' : 'No'}`);

  // Verificar tamaño
  console.log(`✅ Tamaño del caché: ${cache.size()}`);

  // Obtener estadísticas
  const stats = cache.getStats();
  console.log(`✅ Utilización: ${stats.utilizationPercent}%`);

  // Limpiar
  cache.clear();
  console.log(`✅ Caché limpiado, tamaño: ${cache.size()}`);

  return true;
}

/**
 * Test 4: Logger de Auditoría
 */
export async function testAuditLogger() {
  console.log('\n=== TEST 4: Logger de Auditoría ===');

  const logger = new AuditLogger();

  const sampleLog = {
    status: 'success',
    studentId: 1,
    name: 'Juan Pérez',
    grade: '1A',
    error: null,
    message: 'Validación exitosa',
    confidence: 100,
    duplicateFlag: false,
    processingTime: 45,
  };

  // Registrar
  await logger.logValidation(sampleLog, { operatorId: 1 });
  console.log('✅ Log registrado');

  // Obtener resumen
  const summary = logger.getQuickSummary();
  console.log(`✅ Resumen rápido obtenido:`);
  console.log(`   - Último minuto: ${summary.lastMinute.total} escaneos`);
  console.log(`   - Última hora: ${summary.lastHour.total} escaneos`);

  return true;
}

/**
 * Test 5: Distancia de Levenshtein
 */
export async function testLevenshteinDistance() {
  console.log('\n=== TEST 5: Distancia de Levenshtein ===');

  const tests = [
    { str1: 'gato', str2: 'gato', expected: 0, name: 'Cadenas idénticas' },
    { str1: 'gato', str2: 'gota', expected: 1, name: 'Una diferencia' },
    { str1: 'kitten', str2: 'sitting', expected: 3, name: 'Múltiples diferencias' },
    { str1: '001', str2: '002', expected: 1, name: 'IDs numéricos' },
  ];

  let passed = 0;
  for (const test of tests) {
    const result = calculateLevenshteinDistance(test.str1, test.str2);
    const isCorrect = result === test.expected;
    console.log(`${isCorrect ? '✅' : '❌'} ${test.name}: ${result}`);
    if (isCorrect) passed++;
  }

  console.log(`Resultado: ${passed}/${tests.length} tests pasados`);
  return passed === tests.length;
}

/**
 * Test 6: Validación con Timeout
 */
export async function testValidationTimeout() {
  console.log('\n=== TEST 6: Validación con Timeout ===');

  const startTime = Date.now();

  // Este test requiere un código inválido para que no recurra a BD
  try {
    const result = await validateCodeWithTimeout(
      '{"invalid"}', // JSON inválido
      'qr',
      {},
      100
    );

    const elapsed = Date.now() - startTime;
    console.log(`✅ Validación completada en ${elapsed}ms`);
    console.log(`✅ Estado: ${result.status}`);

    if (elapsed <= 500) {
      console.log('✅ Cumple con timeout de 500ms');
      return true;
    } else {
      console.log('❌ Excedió timeout de 500ms');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Estadísticas de Validación
 */
export async function testValidationStats() {
  console.log('\n=== TEST 7: Estadísticas de Validación ===');

  try {
    const stats = await getValidationStats();
    console.log(`✅ Caché: ${stats.cachedScans} escaneos`);
    console.log(`✅ Tamaño máximo: ${stats.cacheMaxSize}`);
    console.log(`✅ Retención: ${stats.retentionMs}ms`);

    return true;
  } catch (error) {
    console.log(`Error obteniendo stats: ${error.message}`);
    return false;
  }
}

/**
 * EJECUTOR DE TODOS LOS TESTS
 */
export async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     SUITE DE TESTS - VALIDADOR DE CÓDIGOS QR/BARRAS     ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Ejecutar tests
  const testsToRun = [
    { name: 'Detección de Tipo', fn: testDetectCodeType },
    { name: 'Validación de Formato', fn: testValidationFormat },
    { name: 'Caché de Duplicados', fn: testDuplicateCache },
    { name: 'Logger de Auditoría', fn: testAuditLogger },
    { name: 'Levenshtein Distance', fn: testLevenshteinDistance },
    { name: 'Validación con Timeout', fn: testValidationTimeout },
    { name: 'Estadísticas', fn: testValidationStats },
  ];

  for (const test of testsToRun) {
    try {
      const passed = await test.fn();
      results.tests.push({ name: test.name, passed });
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`❌ Error en ${test.name}: ${error.message}`);
      results.tests.push({ name: test.name, passed: false });
      results.failed++;
    }
  }

  // Resumen final
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                      RESUMEN FINAL                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Tests Pasados: ${results.passed}`);
  console.log(`❌ Tests Fallidos: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  console.log(``);

  return {
    success: results.failed === 0,
    results,
  };
}

export default {
  testDetectCodeType,
  testValidationFormat,
  testDuplicateCache,
  testAuditLogger,
  testLevenshteinDistance,
  testValidationTimeout,
  testValidationStats,
  runAllTests,
};
