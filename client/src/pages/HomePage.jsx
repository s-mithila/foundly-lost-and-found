// client/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';

export function HomePage() {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [statsData, itemsData] = await Promise.all([
          api.stats.getOverview(),
          api.items.getAll({ limit: 6 }),
        ]);
        setStats(statsData.summary);
        setRecentItems(itemsData.items.slice(0, 6));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/items');
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-tagline">
                <Sparkles size={16} />
                <span>Smart Campus Recovery Network</span>
              </div>
              <h1>
                Reuniting Campuses, <span>One Found Item</span> at a Time.
              </h1>
              <p className="hero-desc">
                Foundly matches misplaced student belongings with recovered items across campus libraries, labs, and dorms using smart attribute scoring and safe ownership verification.
              </p>

              {/* Quick Search Input */}
              <form onSubmit={handleSearchSubmit} style={{ maxWidth: 520, marginBottom: '2rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search
                    size={20}
                    style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for MacBook, ID card, keys, wallet..."
                    style={{
                      paddingLeft: '2.85rem',
                      paddingRight: '6.5rem',
                      height: 52,
                      fontSize: '1rem',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: 'var(--shadow-md)',
                      borderColor: 'var(--border-color)',
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      position: 'absolute',
                      right: '0.35rem',
                      height: 42,
                      padding: '0 1.25rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/report?type=LOST" className="btn btn-lost btn-lg">
                  <AlertCircle size={18} />
                  <span>I Lost Something</span>
                </Link>
                <Link to="/report?type=FOUND" className="btn btn-found btn-lg">
                  <CheckCircle2 size={18} />
                  <span>I Found an Item</span>
                </Link>
              </div>
            </div>

            {/* Live Campus Recovery Stats Card */}
            <div className="hero-stats-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                  Campus Recovery Pulse
                </h3>
                <span className="badge badge-found">Live Feed</span>
              </div>

              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-num">{stats ? stats.totalItems : '10'}</div>
                  <div className="stat-label">Total Items Reported</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: 'var(--found-dark)' }}>
                    {stats ? `${stats.recoveryRate}%` : '75%'}
                  </div>
                  <div className="stat-label">Successful Return Rate</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: 'var(--lost-accent)' }}>
                    {stats ? stats.lostItems : '4'}
                  </div>
                  <div className="stat-label">Active Lost Searches</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: 'var(--primary)' }}>
                    {stats ? stats.inCustody : '3'}
                  </div>
                  <div className="stat-label">Safe in Security Custody</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', margin: 0 }}>
                  Items turned into <strong>Campus Security</strong> are secured in Admin Hall #104 with photo-ID verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Foundly Works */}
      <section style={{ padding: '4rem 0', background: 'white', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Simple & Reliable Protocol
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>How Foundly Secures Item Returns</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
              No messy bulletin boards or lost Facebook posts. An organized campus protocol for rapid, verified returns.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ background: 'var(--bg-page)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--lost-bg)', color: 'var(--lost-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Report Item</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Quickly report what you lost or found with campus zone, date, and descriptions. Finders set a secret verification challenge.
              </p>
            </div>

            <div style={{ background: 'var(--bg-page)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Smart Match Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Our automated algorithm instantly cross-references categories, campus zones, keywords, and dates to calculate match probabilities.
              </p>
            </div>

            <div style={{ background: 'var(--bg-page)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--found-bg)', color: 'var(--found-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Verified Handover</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Owners submit claims answering the verification challenge. Once approved, pickup is arranged safely at the Security Desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Recently Logged
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Recent Campus Activity</h2>
            </div>
            <Link to="/items" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>View All Items</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading recent reports...
            </div>
          ) : recentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No items reported yet. Be the first to report!
            </div>
          ) : (
            <div className="items-grid">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
