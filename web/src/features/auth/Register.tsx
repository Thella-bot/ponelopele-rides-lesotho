import { useState, useContext, type FormEvent } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../lib/auth.dto';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Register must be used within AuthProvider');
  }
  const { register } = context;
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password, role: Role.PASSENGER }); // Assuming web users are passengers
      navigate('/');
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } }; message?: string };
      setError('Registration failed: ' + (apiError.response?.data?.message || apiError.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="auth-input"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          required
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-footer-text">
        Already have an account?{' '}
        <a href="#" onClick={() => navigate('/login')} className="auth-link">
          Login
        </a>
      </p>
    </div>
  );
}


