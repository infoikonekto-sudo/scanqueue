import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './src/config/index.js';

console.log('✅ Base imports OK');
console.log('Testing routes...');

try {
    const auth = await import('./src/routes/auth.js');
    console.log('✅ Auth routes OK');
    const students = await import('./src/routes/students.js');
    console.log('✅ Students routes OK');
    const scans = await import('./src/routes/scans.js');
    console.log('✅ Scans routes OK');
    const routes = await import('./src/routes/routes.js');
    console.log('✅ Routes routes OK');
    const qr = await import('./src/routes/qr.js');
    console.log('✅ QR routes OK');
    const dashboard = await import('./src/routes/dashboard.js');
    console.log('✅ Dashboard routes OK');
    const queue = await import('./src/routes/queue.js');
    console.log('✅ Queue routes OK');

    console.log('ALL MODULES LOADED SUCCESSFULLY!');
} catch (err) {
    console.error('❌ FAILED TO LOAD MODULE:');
    console.error(err);
    process.exit(1);
}
