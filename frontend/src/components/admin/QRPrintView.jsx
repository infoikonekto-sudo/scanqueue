import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Vista de impresión para carnets con QR
 * Diseñada para ser amigable con impresoras (Blanco y Negro / Alto Contraste)
 */
export const QRPrintView = ({ students = [] }) => {
    return (
        <div className="bg-white p-8 min-h-screen print:p-0">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center border-b pb-4 print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Generador de Carnets</h1>
                        <p className="text-gray-500">Vista optimizada para impresión</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-primary-hover transition-all"
                    >
                        🖨️ Imprimir Carnets
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="border-2 border-primary rounded-xl p-6 flex flex-col items-center bg-white shadow-sm print:shadow-none print:break-inside-avoid"
                            style={{ minHeight: '300px' }}
                        >
                            {/* Logo / Título del Colegio */}
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-black text-primary uppercase tracking-tighter">COLEGIO</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Llamado Escolar</p>
                            </div>

                            {/* Código QR */}
                            <div className="bg-white p-2 border border-gray-100 rounded-lg mb-4">
                                <QRCodeSVG
                                    value={student.unique_code || student.id.toString()}
                                    size={140}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            {/* Información del Alumno */}
                            <div className="text-center">
                                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{student.name}</h2>
                                <p className="text-sm font-bold text-primary mt-1 uppercase tracking-wide">{student.grade}</p>

                                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Entrega Segura</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; }
          @page { margin: 1cm; }
        }
      `}} />
        </div>
    );
};

export default QRPrintView;
