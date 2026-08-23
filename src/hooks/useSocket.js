import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const useSocket = (room, type = 'property') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      if (room) {
        const eventName = type === 'property' ? 'join-property' : 'join-room';
        newSocket.emit(eventName, room);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [room, type]);

  return { socket, isConnected };
};