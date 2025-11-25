import { useEffect, useState, useContext } from 'react';
import { getProfile } from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'PASSENGER' | 'DRIVER';
}

export default function ProfileScreen() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('ProfileScreen must be used within AuthProvider');
  }
  const { token } = context;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile(token);
        setProfile(data);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError('Failed to fetch profile: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      {profile ? (
        <div className="profile-details">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          {/* Add more profile details here if available */}
        </div>
      ) : (
        <p className="no-profile-message">No profile data found.</p>
      )}
      <button onClick={() => navigate('/')} className="back-button">Back to Home</button>
    </div>
  );
}
