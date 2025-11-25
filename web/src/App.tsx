import { useState, createContext, useContext, Component, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './features/ride/Home';
import Pickup from './features/ride/Pickup';
import Destination from './features/ride/Destination';
import Confirm from './features/ride/Confirm';
import RideHistoryScreen from './features/ride/RideHistoryScreen'; // Import RideHistoryScreen
import ProfileScreen from './features/user/ProfileScreen'; // Import ProfileScreen
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import './App.css'; // Import the CSS file

// Types for navigation and payloads
export interface PickupData { lat: number; lng: number; w3w: string }
export interface DestinationData { name: string; w3w?: string }

interface RideContextType {
  pickupData: PickupData | null;
  destinationData: DestinationData | null;
  setPickupData: (data: PickupData | null) => void;
  setDestinationData: (data: DestinationData | null) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const useRide = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

const RideProvider = ({ children }: { children: ReactNode }) => {
  const [pickupData, setPickupData] = useState<PickupData | null>(null);
  const [destinationData, setDestinationData] = useState<DestinationData | null>(null);

  return (
    <RideContext.Provider value={{ pickupData, destinationData, setPickupData, setDestinationData }}>
      {children}
    </RideContext.Provider>
  );
};

// Simple Error Boundary to avoid white screens
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h2 className="error-boundary-title">Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const NotFound = () => (
  <div className="redirect-section">
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
    <button type="button" onClick={() => window.location.href = '/'} className="redirect-button">Go to Home</button>
  </div>
);

export default function App() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <AppErrorBoundary>
      <div className="app-container">
        {/* Launch Banner */}
        {showBanner && (
          <div
            role="region"
            aria-label="Launch promotion"
            className="launch-banner"
            data-testid="launch-banner"
          >
            <span>🎉 URBAN TAXIS LIVE IN MASERU – First 50 rides 50% OFF!</span>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="launch-banner-dismiss-button"
              aria-label="Dismiss promotion banner"
            >
              Dismiss
            </button>
          </div>
        )}

        <main>
          <RideProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pickup" element={<ProtectedRoute><Pickup /></ProtectedRoute>} />
              <Route path="/destination" element={<ProtectedRoute><Destination /></ProtectedRoute>} />
              <Route path="/confirm" element={<ProtectedRoute><Confirm /></ProtectedRoute>} />
              <Route path="/ride-history" element={<ProtectedRoute><RideHistoryScreen /></ProtectedRoute>} /> {/* New Route */}
              <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} /> {/* New Profile Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RideProvider>
        </main>
      </div>
    </AppErrorBoundary>
  );
}
