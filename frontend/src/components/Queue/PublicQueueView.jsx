import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '../../hooks/useQueue';
import { MdClose, MdSchool, MdWifi, MdWifiOff, MdPlayArrow } from 'react-icons/md';

/**
 * Vista de Monitor Público (Modo TV Premium)
 * - Diseño sutil y minimalista
 * - Lógica FIFO de 10 estudiantes
 * - Sin menús laterales
 */
export const PublicQueueView = () => {
    const { level } = useParams();
    const navigate = useNavigate();
    const { queue, isConnected } = useQueue();
    const [hasStarted, setHasStarted] = React.useState(false);

    // Lógica FIFO de 10 estudiantes (Los 10 más recientes)
    const displayQueue = useMemo(() => {
        const filtered = level
            ? queue.filter(s => s.level?.toLowerCase() === level.toLowerCase())
            : queue;

        // Si hay más de 10, tomamos los último 10
        return filtered.slice(-10);
    }, [queue, level]);

    const levelNames = {
        preprimaria: 'Preprimaria',
        primaria: 'Primaria',
        secundaria: 'Secundaria'
    };

    const title = levelNames[level?.toLowerCase()] || 'Monitor General';

    // Manejador del primer clic para activar el audio
    const handleStart = () => {
        setHasStarted(true);
        // Inicializar TTS de forma silenciosa para obtener permisos
        if ('speechSynthesis' in window) {
            const temp = new SpeechSynthesisUtterance('');
            temp.volume = 0;
            window.speechSynthesis.speak(temp);
        }
        // Disparar un evento de click simulado o confiar en el listener global de socket.js para el AudioContext
    };

    if (!hasStarted) {
        return (
            <div className="fixed inset-0 bg-[#001832] flex flex-col items-center justify-center text-white cursor-pointer z-[9999]" onClick={handleStart}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.6)] animate-pulse">
                        <MdPlayArrow className="w-12 h-12 text-white ml-2" />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-widest text-center mt-4 text-blue-100">Iniciar Monitor</h1>
                    <p className="text-blue-400 font-bold uppercase tracking-widest text-sm text-center">Haz clic en cualquier parte para activar el sonido y la voz</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#001832] text-white flex flex-col font-sans overflow-hidden select-none">
            {/* Header Sutil */}
            <header className="px-12 py-10 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-400/20 shadow-lg">
                        <MdSchool className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white/90">
                            {title}
                        </h1>
                        <p className="text-blue-400/60 font-black uppercase tracking-[0.4em] text-xs mt-1">
                            Llamado en Tiempo Real • ScanQueue
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Indicador de Conexión Discreto */}
                    <div className="flex items-center gap-3 bg-white/5 py-3 px-5 rounded-full border border-white/10 backdrop-blur-md">
                        {isConnected ? (
                            <MdWifi className="w-5 h-5 text-emerald-400 animate-pulse" />
                        ) : (
                            <MdWifiOff className="w-5 h-5 text-rose-500" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                            {isConnected ? 'Sincronizado' : 'Sin Conexión'}
                        </span>
                    </div>

                    {/* Botón Salir (Solicitado) */}
                    <button
                        onClick={() => navigate('/queue')}
                        className="w-16 h-16 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all duration-300 flex items-center justify-center border border-rose-500/20 group shadow-xl"
                        title="Salir del Modo Monitor"
                    >
                        <MdClose className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Grid Principal (2x5 para 10 estudiantes) */}
            <main className="flex-1 p-10 overflow-hidden">
                {displayQueue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 transition-opacity">
                        <span className="text-[200px] mb-8">🏫</span>
                        <h2 className="text-5xl font-black uppercase tracking-[0.2em]">Esperando Alumnos</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full auto-rows-[minmax(0,1fr)] max-w-[1800px] mx-auto w-full">
                        <AnimatePresence mode="popLayout">
                            {displayQueue.map((student, index) => {
                                const isLatest = index === displayQueue.length - 1;
                                // Clave estable para animaciones fluidas y evitar duplicados visuales
                                const uniqueKey = student.student_id || student.id;

                                return (
                                    <motion.div
                                        key={uniqueKey}
                                        layout
                                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -50 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            layout: { duration: 0.3 }
                                        }}
                                        className={`
                                            relative px-8 py-5 rounded-[40px] border-2 flex flex-col justify-center transition-all duration-700
                                            ${isLatest
                                                ? 'bg-gradient-to-br from-blue-600/90 to-blue-800/90 border-blue-400 shadow-[0_20px_60px_rgba(37,99,235,0.4)] z-10 scale-[1.01]'
                                                : 'bg-white/[0.04] border-white/5 opacity-60 backdrop-blur-md shadow-lg'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`
                                                        px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]
                                                        ${isLatest ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400'}
                                                    `}>
                                                        {isLatest ? 'Llamado Ahora' : 'En Espera'}
                                                    </span>
                                                </div>
                                                <h2 className={`
                                                    font-black tracking-tighter leading-[1.1] break-words
                                                    ${isLatest ? 'text-white' : 'text-blue-500/90'}
                                                    ${student.name.length > 25 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}
                                                `}>
                                                    {student.name}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                                    <div className={`
                                                        flex items-center gap-2 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-sm
                                                        ${isLatest ? 'bg-black/20 text-white' : 'bg-white/5 text-blue-300/60'}
                                                    `}>
                                                        <span className="opacity-40 text-xs">GRADO:</span> {student.grade}
                                                    </div>
                                                    <div className={`
                                                        flex items-center gap-2 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-sm
                                                        ${isLatest ? 'bg-black/20 text-white' : 'bg-white/5 text-blue-300/60'}
                                                    `}>
                                                        <span className="opacity-40 text-xs">SEC:</span> {student.section || 'A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {isLatest && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -20 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    className="shrink-0 flex flex-col items-center gap-4"
                                                >
                                                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-[0_20px_60px_rgba(255,255,255,0.4)] animate-pulse">
                                                        <MdSchool className="w-16 h-16" />
                                                    </div>
                                                    <span className="text-white font-black text-sm uppercase tracking-[0.4em] animate-bounce drop-shadow-lg">¡Llegó!</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Número de posición estilizado con mejor contraste parcial */}
                                        <div className={`
                                            absolute left-12 bottom-10 text-[120px] font-black opacity-[0.05] select-none pointer-events-none italic leading-none
                                            ${isLatest ? 'text-white' : 'text-blue-500'}
                                        `}>
                                            #{displayQueue.length - index}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Footer Minimalista */}
            <footer className="px-12 py-8 flex items-center justify-between border-t border-white/5 opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.5em]">
                    Colegio Manos a la Obra • Sistema de Llamado v1.0
                </p>
                <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
            </footer>
        </div>
    );
};

export default PublicQueueView;
