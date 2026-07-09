import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (eventId = null, listeners = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('http://localhost:3000', { transports: ['websocket'] });
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
