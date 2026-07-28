import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTelemetryStore } from '../store/useTelemetryStore';

export const useSocket = (url: string = 'http://localhost:4000') => {
  const socketRef = useRef<Socket | null>(null);
  const updateTelemetry = useTelemetryStore(state => state.updateTelemetry);

  useEffect(() => {
    socketRef.current = io(url);

    socketRef.current.on('connect', () => {
      console.log('Connected to real-time telemetry service');
    });

    socketRef.current.on('telemetry_update', (data) => {
      updateTelemetry(data);
    });

    socketRef.current.on('notification_update', () => {
      window.dispatchEvent(new Event('notification_update'));
    });

    socketRef.current.on('alarm_update', () => {
      window.dispatchEvent(new Event('alarm_update'));
    });

    socketRef.current.on('ticket_update', () => {
      window.dispatchEvent(new Event('ticket_update'));
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from telemetry service');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url, updateTelemetry]);

  return socketRef.current;
};
