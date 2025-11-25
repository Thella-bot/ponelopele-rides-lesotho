import { io, Socket } from 'socket.io-client';

// Environment configuration (Expo runtime)
const API_BASE = (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, '');
const SOCKET_NAMESPACE = process.env.EXPO_PUBLIC_SOCKET_NS || ''; // e.g., '/passengers'

// Types for events
export interface RideEvent {
  id?: string;
  w3w?: string;
  destination?: string;
  fare?: number;
  pickup?: any; // refine as backend stabilizes
  [key: string]: any;
}

export type NewRideHandler = (ride: RideEvent) => void;

let socketInstance: Socket | null = null;

// Simple dev logger
const log = (...args: any[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log('[socket-passenger]', ...args);
  }
};

export const initSocket = (opts?: {
  token?: string; // JWT token for handshake
  userId?: string; // passenger/user identifier if server expects it
}) => {
  if (socketInstance) return socketInstance;

  if (!API_BASE) {
    log('Missing EXPO_PUBLIC_API_URL; socket will not initialize.');
    return null;
  }

  const url = `${API_BASE}${SOCKET_NAMESPACE}`;
  socketInstance = io(url, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    forceNew: false,
    auth: {
      ...(opts?.token ? { token: opts.token } : {}),
      ...(opts?.userId ? { userId: opts.userId } : {}),
    },
  });

  socketInstance.on('connect', () => log('Connected', socketInstance?.id));
  socketInstance.on('connect_error', (err) => log('Connect error', err?.message || err));
  socketInstance.on('disconnect', (reason) => log('Disconnected', reason));
  socketInstance.on('reconnect_attempt', (n) => log('Reconnecting attempt', n));
  socketInstance.on('reconnect_failed', () => log('Reconnection failed'));

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// Subscription helpers
export const onNewRide = (handler: NewRideHandler) => {
  const s = socketInstance;
  if (!s) {
    log('Socket not initialized; call initSocket() first');
    return () => {};
  }
  s.on('newRide', handler);
  return () => s.off('newRide', handler);
};

// Example emit helper
export const acknowledgeRide = (rideId: string) => {
  const s = socketInstance;
  if (!s) return;
  s.emit('ackRide', { rideId });
};

// Note: Do not auto-init here to allow caller to pass auth explicitly
