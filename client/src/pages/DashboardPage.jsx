// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await api.stats.getOverview();
        setData(stats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading campus dashboard analytics...
      </div>
    );
  }

  const { summary, categoryStats, zoneStats, recentActivity } = data || {};

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem' }}>Campus Operations & Recovery Analytics</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Real-time monitoring of lost items, secure custody tracking, and return rates.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/report?type=FOUND" className="btn btn-found btn-sm">
              + Check In Found Item
            </Link>
            <Link to="/items" className="btn btn-outline btn-sm">
              All Items Catalog
            </Link>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Items Tracked
              </span>
              <Layers size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              {summary ? summary.totalItems : 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {summary ? summary.lostItems : 0} Lost • {summary ? summary.foundItems : 0} Found
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recovery & Return Rate
              </span>
              <TrendingUp size={20} style={{ color: 'var(--found-dark)' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--found-dark)' }}>
              {summary ? `${summary.recoveryRate}%` : '0%'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--found-dark)', fontWeight: 600, marginTop: '0.25rem' }}>
              {summary ? summary.returnedItems : 0} items safely restored to owners
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                In Security Custody
              </span>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary-dark)' }}>
              {summary ? summary.inCustody : 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Secured at Central Security Desk #104
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Pending Claims
              </span>
              <Clock size={20} style={{ color: 'var(--lost-accent)' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--lost-dark)' }}>
              {summary ? summary.pendingClaims : 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Awaiting ownership verification review
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Distribution Charts & Activity Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Category Breakdown */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--primary)' }} />
              Category Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categoryStats && categoryStats.map((cat) => {
                const total = summary ? summary.totalItems : 1;
                const percentage = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{cat.category}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{cat.count} items ({percentage}%)</span>
                    </div>
                    <div style={{ background: 'var(--bg-page)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ background: 'var(--primary)', width: `${percentage}%`, height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campus Location Hotspots */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--primary)' }} />
              High-Frequency Campus Loss Zones
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {zoneStats && zoneStats.map((z) => {
                const total = summary ? summary.totalItems : 1;
                const percentage = Math.round((z.count / total) * 100);
                return (
                  <div key={z.location_zone}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{z.location_zone}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{z.count} reports</span>
                    </div>
                    <div style={{ background: 'var(--bg-page)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ background: 'var(--found-dark)', width: `${percentage}%`, height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audit Log / Recent Activity Table */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--primary)' }} />
              Live Campus Incident Audit Log
            </h3>
            <span className="badge badge-found">Auto Synced</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity && recentActivity.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-page)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong>{log.details}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
