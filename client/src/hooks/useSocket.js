import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (eventId = null, listeners = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';
    const socket = io(socketUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    if (eventId) socket.emit('join_event', { eventId });

    Object.entries(listeners).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    });

    return () => {
      Object.entries(listeners).forEach(([eventName]) => socket.off(eventName));
      socket.disconnect();
    };
  }, [eventId]);

  return socketRef.current;
};

export default useSocket;
