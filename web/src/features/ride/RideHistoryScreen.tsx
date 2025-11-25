import { useEffect, useState, useContext } from 'react';
import { getRideHistory } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Ride {
  id: string;
  pickupName: string;
  destName: string;
  fare: number;
  createdAt: string;
}

export default function RideHistoryScreen() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('RideHistoryScreen must be used within AuthProvider');
  }
  const { token } = context;
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchRideHistory = async () => {
      try {
        setLoading(true);
        const data = await getRideHistory(token);
        setRides(data);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError('Failed to fetch ride history: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, [token, navigate]);

  if (loading) {
    return <div className="loading-container">Loading ride history...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="ride-history-container">
      <h1 className="ride-history-title">Your Ride History</h1>
      {rides.length === 0 ? (
        <p className="no-rides-message">No rides found.</p>
      ) : (
        <ul className="ride-list">
          {rides.map((ride) => (
            <li key={ride.id} className="ride-item">
              <p>From: {ride.pickupName}</p>
              <p>To: {ride.destName}</p>
              <p>Fare: M {ride.fare}</p>
              <p>Date: {new Date(ride.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate('/')} className="back-button">Back to Home</button>
    </div>
  );
}
