import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      <h1 className="home-title">Urban Taxis</h1>
      <p className="home-subtitle">No house numbers needed. Just tap your roof.</p>
      <button
        type="button"
        onClick={() => navigate('/pickup')}
        className="home-button"
        aria-label="Request a ride"
        data-testid="request-ride-btn"
      >
        Request a Ride
      </button>
      <button
        type="button"
        onClick={() => navigate('/ride-history')}
        className="home-button secondary-button"
        aria-label="View ride history"
      >
        View Ride History
      </button>
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="home-button secondary-button"
        aria-label="View profile"
      >
        View Profile
      </button>
    </main>
  );
}