// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  AlertCircle,
  CheckCircle2,
  Inbox,
  LayoutDashboard,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  async function handleQuickDemo(email) {
    try {
      await login(email, 'password123');
      setShowDemoMenu(false);
      navigate('/items');
    } catch (err) {
      console.error('Demo login error:', err);
    }
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-link">
            <div className="brand-badge">
              <Compass size={22} />
            </div>
            <span>
              Found<span style={{ color: 'var(--primary)' }}>ly</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="nav-links">
            <Link to="/items" className={`nav-link ${isActive('/items') ? 'active' : ''}`}>
              <Compass size={16} />
              Browse Items
            </Link>
            <Link to="/report?type=LOST" className={`nav-link ${location.search.includes('type=LOST') ? 'active' : ''}`}>
              <AlertCircle size={16} style={{ color: 'var(--lost-accent)' }} />
              Report Lost
            </Link>
            <Link to="/report?type=FOUND" className={`nav-link ${location.search.includes('type=FOUND') ? 'active' : ''}`}>
              <CheckCircle2 size={16} style={{ color: 'var(--found-accent)' }} />
              Report Found
            </Link>
            {user && (
              <Link to="/claims" className={`nav-link ${isActive('/claims') ? 'active' : ''}`}>
                <Inbox size={16} />
                My Claims
              </Link>
            )}
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={16} />
              Campus Stats
            </Link>
          </div>

          {/* Actions / Auth */}
          <div className="nav-actions">
            {/* Quick Demo Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-sm btn-outline"
                style={{ borderColor: 'var(--primary-border)', color: 'var(--primary-dark)', background: 'var(--primary-light)' }}
                onClick={() => setShowDemoMenu(!showDemoMenu)}
              >
                <Sparkles size={14} />
                <span>Demo Profiles</span>
                <ChevronDown size={14} />
              </button>

              {showDemoMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    width: 250,
                    padding: '0.5rem',
                    zIndex: 150,
                  }}
                >
                  <div style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    1-Click Switch Persona
                  </div>
                  <button
                    onClick={() => handleQuickDemo('sarah.jenkins@campus.edu')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.65rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-page)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <strong style={{ fontSize: '0.85rem' }}>Sarah Jenkins (Student)</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lost MacBook Pro & AirPods</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('alex.chen@campus.edu')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.65rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-page)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <strong style={{ fontSize: '0.85rem' }}>Alex Chen (Student)</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found MacBook in Library</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('security.davis@campus.edu')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.65rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-page)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <strong style={{ fontSize: '0.85rem' }}>Officer Robert Davis</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Campus Security Officer</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--primary-border)' }}
                />
                <button onClick={logout} className="btn btn-sm btn-outline" title="Log out">
                  <LogOut size={14} />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-sm btn-outline">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
