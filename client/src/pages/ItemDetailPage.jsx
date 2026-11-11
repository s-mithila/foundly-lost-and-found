// client/src/pages/ItemDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  AlertCircle,
  User,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TypeBadge, StatusBadge, CustodyBadge } from '../components/StatusBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { ClaimModal } from '../components/ClaimModal';

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSecurityOrAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [itemData, matchesData] = await Promise.all([
        api.items.getById(id),
        api.matches.getByItemId(id).catch(() => ({ matches: [] })),
      ]);
      setItem(itemData.item);
      setClaims(itemData.claims || []);
      setMatches(matchesData.matches || []);
    } catch (err) {
      setError(err.message || 'Failed to load item details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleStatusChange(newStatus, custodyType = null) {
    setStatusUpdating(true);
    try {
      await api.items.updateStatus(id, {
        status: newStatus,
        custody_type: custodyType || item.custody_type,
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleClaimReview(claimId, status) {
    try {
      await api.claims.updateStatus(claimId, { status });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to evaluate claim.');
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading item details...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2>Item Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This report does not exist or has been removed.'}</p>
        <Link to="/items" className="btn btn-primary">
          Back to Browse Items
        </Link>
      </div>
    );
  }

  const isReporter = user && user.id === item.user_id;
  const canManage = isReporter || isSecurityOrAdmin;

  const formattedDate = new Date(item.date_event).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <TypeBadge type={item.type} />
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '2.5rem' }}>
          {/* Left Column: Media & Core Info */}
          <div>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                background: '#0f172a',
                height: 380,
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
              }}
            >
              <img
                src={item.image_url}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <CategoryIcon category={item.category} size={16} />
                <span>{item.category}</span>
              </div>

              <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{item.title}</h1>

              {item.reward_amount > 0 && item.type === 'LOST' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--lost-bg)',
                    color: 'var(--lost-dark)',
                    border: '1px solid var(--lost-border)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    marginBottom: '1.25rem',
                  }}
                >
                  <Award size={18} />
                  <span>${item.reward_amount} Recovery Reward Offered</span>
                </div>
              )}

              <h3 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Description & Identifying Marks</h3>
              <p style={{ color: 'var(--text-main)', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {item.description}
              </p>

              {/* Location Details Box */}
              <div style={{ background: 'var(--bg-page)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} />
                  Campus Incident Location
                </h4>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <strong>Zone:</strong> {item.location_zone}
                </div>
                {item.location_details && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <strong>Specific spot:</strong> {item.location_details}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  <span>Date {item.type === 'LOST' ? 'Lost' : 'Found'}: {formattedDate}</span>
                </div>
              </div>

              {/* Safe Question Challenge (if Found item) */}
              {item.safe_question && (
                <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                    Finder's Verification Challenge
                  </span>
                  <p style={{ fontWeight: 600, color: '#134e4a', marginTop: '0.25rem', fontSize: '1rem' }}>
                    "{item.safe_question}"
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#0f766e', marginTop: '0.35rem' }}>
                    True owners must answer this challenge when submitting a claim to verify genuine ownership.
                  </p>
                </div>
              )}
            </div>

            {/* Smart Matches Section */}
            {matches.length > 0 && (
              <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                    Potential Matches Found ({matches.length})
                  </h3>
                  <span className="badge badge-found">Smart Match Engine</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Our automated similarity engine found these corresponding reports in the database:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {matches.map((m) => (
                    <div key={m.item.id} className="match-card">
                      <div className="match-score-pill">
                        <div>{m.matchScore}%</div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Match</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <TypeBadge type={m.item.type} />
                          <strong style={{ fontSize: '1rem' }}>{m.item.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          📍 {m.item.location_zone} • 📅 {new Date(m.item.date_event).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
                          Match factors: {m.reasons.join(' • ')}
                        </div>
                      </div>
                      <Link to={`/items/${m.item.id}`} className="btn btn-sm btn-outline">
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Custody, Actions & Claims */}
          <div>
            {/* Custody Box */}
            <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Custody Status
                </span>
                <CustodyBadge custody={item.custody_type} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--bg-page)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <ShieldCheck size={22} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {item.custody_type === 'CAMPUS_SECURITY_DESK'
                      ? 'Stored in Central Security Safe'
                      : item.custody_type === 'STUDENT_UNION_OFFICE'
                      ? 'Student Union Information Desk'
                      : item.custody_type === 'RETURNED'
                      ? 'Returned to Owner'
                      : 'In Finder’s Possession'}
                  </strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {item.custody_location || 'Campus verification zone'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem' }}>
                {item.type === 'FOUND' && item.status !== 'RETURNED' && !isReporter && (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        setIsClaimModalOpen(true);
                      }
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                  >
                    <ShieldCheck size={18} />
                    <span>Claim This Item (Prove Ownership)</span>
                  </button>
                )}

                {/* If Reporter or Security: Management Controls */}
                {canManage && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Custodian / Officer Controls
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {item.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleStatusChange('RETURNED', 'RETURNED')}
                          className="btn btn-outline btn-sm"
                          disabled={statusUpdating}
                          style={{ borderColor: 'var(--found-border)', color: 'var(--found-dark)' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark as Officially Returned to Owner</span>
                        </button>
                      )}
                      {item.custody_type !== 'CAMPUS_SECURITY_DESK' && item.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleStatusChange(item.status, 'CAMPUS_SECURITY_DESK')}
                          className="btn btn-outline btn-sm"
                          disabled={statusUpdating}
                        >
                          <ShieldCheck size={14} />
                          <span>Deposit at Campus Security Desk</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reporter Contact Information */}
            <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Reported By
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
                <img
                  src={item.reporter_avatar}
                  alt={item.reporter_name}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--primary-border)' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.05rem' }}>{item.reporter_name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.reporter_department || 'University Member'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>📧 {item.contact_email || item.reporter_email}</div>
                {item.contact_phone && <div>📞 {item.contact_phone}</div>}
              </div>
            </div>

            {/* Claims Review Section (Visible if claims exist) */}
            {claims.length > 0 && (
              <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Claims ({claims.length})</h3>
                  <span className="badge badge-found">Verification Queue</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      style={{
                        background: 'var(--bg-page)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{claim.claimant_name}</strong>
                        <StatusBadge status={claim.status} />
                      </div>

                      <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Answer: </span>
                        {claim.verification_answer}
                      </div>

                      {claim.proof_description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>Proof: </span>
                          {claim.proof_description}
                        </div>
                      )}

                      {/* Review Buttons for Reporter/Security */}
                      {canManage && claim.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button
                            onClick={() => handleClaimReview(claim.id, 'APPROVED')}
                            className="btn btn-sm btn-primary"
                            style={{ flex: 1 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleClaimReview(claim.id, 'REJECTED')}
                            className="btn btn-sm btn-danger"
                            style={{ flex: 1 }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {canManage && claim.status === 'APPROVED' && (
                        <button
                          onClick={() => handleClaimReview(claim.id, 'HANDOVER_COMPLETED')}
                          className="btn btn-sm btn-found"
                          style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                          Confirm Handover Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <ClaimModal
          item={item}
          onClose={() => setIsClaimModalOpen(false)}
          onSuccess={() => {
            setIsClaimModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
