import { useEffect, useState } from 'react';
import { socketService } from '../services/socket.js';
import { useQueueStore } from '../stores/index.js';

/**
 * Hook de Cola en Tiempo Real (Versión Unificada)
 * Utilizado por PublicQueueView para conectarse al servidor central.
 */
export const useQueue = () => {
  const { queue } = useQueueStore();
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    // Conectar usando el servicio central (ya usa puerto 5000)
    const socket = socketService.connect();

    const handleConnect = () => {
      console.log('✅ Monitor Conectado');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Monitor Desconectado');
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Estado inicial
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return {
    queue,
    isConnected,
    socket: socketService.getSocket()
  };
};
