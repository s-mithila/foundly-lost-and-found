// client/src/pages/ClaimsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CheckCircle2, Clock, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, TypeBadge } from '../components/StatusBadge';

export function ClaimsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('submitted');
  const [claimsData, setClaimsData] = useState({ submitted: [], incoming: [] });
  const [loading, setLoading] = useState(true);

  async function loadClaims() {
    setLoading(true);
    try {
      const data = await api.claims.getAll();
      setClaimsData(data);
    } catch (err) {
      console.error('Fetch claims error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  async function handleUpdateStatus(claimId, status) {
    try {
      await api.claims.updateStatus(claimId, { status });
      await loadClaims();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  }

  const currentList = activeTab === 'submitted' ? claimsData.submitted : claimsData.incoming;

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem' }}>Claims & Verification Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Track item ownership proofs, review verification answers, and coordinate safe handovers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('submitted')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'submitted' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'submitted' ? '3px solid var(--primary)' : '3px solid transparent',
            }}
          >
            My Submitted Claims ({claimsData.submitted.length})
          </button>

          <button
            onClick={() => setActiveTab('incoming')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'incoming' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'incoming' ? '3px solid var(--primary)' : '3px solid transparent',
            }}
          >
            Claims on My Reported Items ({claimsData.incoming.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading claims...
          </div>
        ) : currentList.length === 0 ? (
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: 500,
              margin: '0 auto',
            }}
          >
            <Inbox size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Claims in this View</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {activeTab === 'submitted'
                ? 'You have not submitted any ownership claims on found items yet.'
                : 'No one has submitted a claim on your reported items yet.'}
            </p>
            <Link to="/items" className="btn btn-primary">
              Browse Campus Items
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentList.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '1.5rem',
                  alignItems: 'center',
                }}
              >
                {/* Thumbnail */}
                <img
                  src={c.item_image}
                  alt={c.item_title}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    background: '#0f172a',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <TypeBadge type={c.item_type} />
                    <Link to={`/items/${c.item_id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {c.item_title}
                    </Link>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {c.item_zone} • Submitted on {new Date(c.created_at).toLocaleDateString()}
                  </div>

                  <div style={{ background: 'var(--bg-page)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700 }}>Verification Answer: </span>
                    <span style={{ color: 'var(--text-main)' }}>"{c.verification_answer}"</span>
                  </div>

                  {c.review_notes && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                      Reviewer Note: {c.review_notes}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: 160 }}>
                  <StatusBadge status={c.status} />

                  {activeTab === 'incoming' && c.status === 'PENDING' && c.item_status !== 'RETURNED' && c.item_custody !== 'RETURNED' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                        className="btn btn-sm btn-primary"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                        className="btn btn-sm btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === 'incoming' && c.status === 'APPROVED' && c.item_status !== 'RETURNED' && c.item_custody !== 'RETURNED' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'HANDOVER_COMPLETED')}
                      className="btn btn-sm btn-found"
                    >
                      Complete Handover
                    </button>
                  )}

                  <Link to={`/items/${c.item_id}`} className="btn btn-sm btn-outline">
                    View Item
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
