// client/src/components/ClaimModal.jsx
import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function ClaimModal({ item, onClose, onSuccess }) {
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!verificationAnswer.trim()) {
      setError('Please provide an answer to the verification question or identity check.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.claims.submit(item.id, {
        verification_answer: verificationAnswer,
        proof_description: proofDescription,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Claim Item Ownership</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Verifying ownership for: <strong>{item.title}</strong>
            </p>
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
          {item.safe_question && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px dashed var(--primary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Finder's Verification Challenge
              </span>
              <p style={{ fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                "{item.safe_question}"
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Your Answer / Proof of Identification <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. The lockscreen wallpaper is my dog, or the student ID number ends in 8901..."
              value={verificationAnswer}
              onChange={(e) => setVerificationAnswer(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Additional Details & Unique Identifying Marks (Optional)
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Serial numbers, purchase receipts, specific scratches, stickers..."
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Claim Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
