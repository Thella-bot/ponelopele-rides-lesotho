import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../../App';

const API_BASE = import.meta.env.VITE_API_URL as string | undefined;

export default function Confirm() {
  const navigate = useNavigate();
  const { pickupData, destinationData, setPickupData, setDestinationData } = useRide();
  const [loading, setLoading] = useState(false);
  const [mobileMoney, setMobileMoney] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // If pickupData or destinationData is not set, redirect to previous pages
    if (!pickupData) {
      navigate('/pickup');
    } else if (!destinationData) {
      navigate('/destination');
    }
  }, [pickupData, destinationData, navigate]);

  // Stable fare for the life of this component render
  const fare = useMemo(() => Math.round(Math.random() * 200 + 350), []);

  const isValid = Boolean(pickupData && destinationData && destinationData.name);

  const requestRide = async () => {
    if (!isValid) return;

    if (!API_BASE) {
      setError('Configuration error: API base URL not set. Please set VITE_API_URL in your environment.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/rides`;
      const res = await axios.post(url, {
        pickup: pickupData,
        destination: destinationData,
        paymentMethod: mobileMoney ? 'mobile_money' : 'cash',
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Unexpected status ${res.status}`);
      }

      setSuccessMessage('🚕 Ride requested! Your driver is on the way');
      setPickupData(null); // Clear ride data after successful request
      setDestinationData(null);
      setTimeout(() => navigate('/'), 3000); // Go to home after a delay
    } catch (e: unknown) {
      // Attempt to surface server-provided error message if available
      const err = e as { response?: { data?: any; status?: number }; message?: string };
      const serverMsg =
        (err.response?.data && (err.response.data.message || err.response.data.error || err.response.data.msg)) ||
        err.message ||
        'Please try again';
      setError(`Request failed: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!pickupData || !destinationData) {
    return (
      <section className="redirect-section">
        <p>Missing ride details. Redirecting…</p>
        <button type="button" onClick={() => navigate('/')} className="redirect-button">Go to Home</button>
      </section>
    );
  }

  return (
    <div className="confirm-container">
      <h1 className="confirm-title">Confirm Your Ride</h1>

      <div className="confirm-detail-card">
        <p className="confirm-detail-label">PICKUP</p>
        <h2 className="confirm-detail-value">{pickupData?.w3w || 'Your tapped location'}</h2>
      </div>

      <div className="confirm-detail-card">
        <p className="confirm-detail-label">DROP-OFF</p>
        <h2 className="confirm-detail-value">{destinationData?.name || 'Destination not set'}</h2>
      </div>

      <button
        type="button"
        onClick={() => setMobileMoney((v) => !v)}
        aria-pressed={mobileMoney}
        className={`confirm-payment-method-button ${mobileMoney ? 'mobile-money-selected' : ''}`}
      >
        <h3 className="confirm-payment-method-text">{mobileMoney ? 'ECOCASH / M-Pesa ✓' : 'Cash'}</h3>
      </button>

      <div className="confirm-fare-card">
        <p>Estimated Fare</p>
        <h1 className="confirm-fare-value">M {fare}</h1>
      </div>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <button
        onClick={requestRide}
        disabled={loading || !isValid}
        className="confirm-request-button"
      >
        {loading ? 'Requesting...' : isValid ? 'Request Taxi Now' : 'Select valid pickup/drop-off'}
      </button>

      <p className="confirm-driver-note">
        Driver will see your exact What3Words + photo if added
      </p>
    </div>
  );
}
