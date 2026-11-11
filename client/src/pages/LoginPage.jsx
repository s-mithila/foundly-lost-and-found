// client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/items';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function autofillUser(demoEmail) {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  }

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        <div className="form-card" style={{ maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Compass size={26} />
            </div>
            <h1 style={{ fontSize: '1.85rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Sign in to manage your campus lost and found reports.
            </p>
          </div>

          {/* Quick Demo Autofill Box */}
          <div
            style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Sparkles size={14} />
              <span>1-Click Demo Profiles (For Viva / Evaluation)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}
                onClick={() => autofillUser('sarah.jenkins@campus.edu')}
              >
                <span>Sarah Jenkins (Student - Lost MacBook)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Autofill</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}
                onClick={() => autofillUser('alex.chen@campus.edu')}
              >
                <span>Alex Chen (Student - Found MacBook)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Autofill</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}
                onClick={() => autofillUser('security.davis@campus.edu')}
              >
                <span>Officer Robert Davis (Campus Security)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Autofill</span>
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
