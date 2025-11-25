import { io, Socket } from 'socket.io-client';

// Expo public runtime env for mobile apps
const API_BASE = (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.replace(/\/$/, '');
const SOCKET_NAMESPACE = process.env.EXPO_PUBLIC_SOCKET_NS || ''; // e.g., '/drivers'

// Types
export interface RidePayload {
  id?: string;
  w3w?: string;
  destination?: string;
  fare?: number;
  pickup?: any; // refine with a concrete shape when available
  // ... additional fields as needed
}

export type NewRideHandler = (ride: RidePayload) => void;

let socketInstance: Socket | null = null;

// Simple env-aware logger
const log = (...args: any[]) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[socket]', ...args);
  }
};

export const initSocket = (opts?: {
  token?: string; // JWT or session token for handshake auth
  driverId?: string; // additional identifier if required by backend
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
      ...(opts?.driverId ? { driverId: opts.driverId } : {}),
    },
  });

  // Lifecycle logs and basic error handling
  socketInstance.on('connect', () => log('Connected to server', socketInstance?.id));
  socketInstance.on('connect_error', (err) => log('Connect error', err.message));
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
  return () => {
    s.off('newRide', handler);
  };
};

// Example: emit helper if needed later
export const acknowledgeRide = (rideId: string) => {
  const s = socketInstance;
  if (!s) return;
  s.emit('ackRide', { rideId });
};

// Auto-initialize if env present (optional)
// Call initSocket({ token, driverId }) explicitly from app bootstrap to pass auth
if (API_BASE) {
  // Do not pass auth by default; expect caller to provide via initSocket
  // initSocket();
}
