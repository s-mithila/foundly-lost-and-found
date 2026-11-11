// client/src/pages/ReportItemPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  Image as ImageIcon,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Electronics',
  'IDs & Cards',
  'Keys & Wallets',
  'Bags & Luggage',
  'Books & Stationery',
  'Clothing & Accessories',
  'Personal Essentials',
  'Others',
];

const ZONES = [
  'Main Library',
  'Science Complex / Labs',
  'Student Cafeteria',
  'Sports Complex / Gym',
  'Auditorium & Arts',
  'Administration Building',
  'Dormitory / Hostels',
  'Bus Stop / Campus Transit',
  'General Campus',
];

// Presets for quick photo filling
const SAMPLE_PHOTOS = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Phone/Tablet', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80' },
  { label: 'AirPods/Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
  { label: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
];

export function ReportItemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';
  const [type, setType] = useState(initialType);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [dateEvent, setDateEvent] = useState(new Date().toISOString().split('T')[0]);
  const [locationZone, setLocationZone] = useState('Main Library');
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [rewardAmount, setRewardAmount] = useState('0');

  // Specific to FOUND
  const [safeQuestion, setSafeQuestion] = useState('');
  const [custodyType, setCustodyType] = useState('WITH_FINDER');
  const [custodyLocation, setCustodyLocation] = useState('');

  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (!contactEmail) setContactEmail(user.email || '');
      if (!contactPhone) setContactPhone(user.phone || '');
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      navigate('/login?redirect=/report');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.items.create({
        type,
        title: title.trim(),
        category,
        date_event: dateEvent,
        location_zone: locationZone,
        location_details: locationDetails.trim(),
        description: description.trim(),
        image_url: imageUrl.trim(),
        reward_amount: parseInt(rewardAmount, 10) || 0,
        safe_question: type === 'FOUND' ? safeQuestion.trim() : null,
        custody_type: type === 'FOUND' ? custodyType : 'WITH_FINDER',
        custody_location: type === 'FOUND' ? custodyLocation.trim() : null,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
      });

      navigate(`/items/${data.item.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        <div className="form-card">
          {/* Toggle Type Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setType('LOST')}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: type === 'LOST' ? '2px solid var(--lost-accent)' : '1px solid var(--border-color)',
                background: type === 'LOST' ? 'var(--lost-bg)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                fontWeight: 700,
                fontSize: '1rem',
                color: type === 'LOST' ? 'var(--lost-dark)' : 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
            >
              <AlertCircle size={20} />
              <span>I Lost an Item</span>
            </button>

            <button
              type="button"
              onClick={() => setType('FOUND')}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: type === 'FOUND' ? '2px solid var(--found-dark)' : '1px solid var(--border-color)',
                background: type === 'FOUND' ? 'var(--found-bg)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                fontWeight: 700,
                fontSize: '1rem',
                color: type === 'FOUND' ? 'var(--found-dark)' : 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
            >
              <CheckCircle2 size={20} />
              <span>I Found an Item</span>
            </button>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>
              {type === 'LOST' ? 'File a Lost Property Report' : 'Register a Found Campus Item'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {type === 'LOST'
                ? 'Provide detailed descriptions so our smart matching engine can connect you with finders.'
                : 'Help reunite this item with its rightful student or staff owner safely.'}
            </p>
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
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                Item Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={type === 'LOST' ? 'e.g. Apple 14" M2 MacBook Pro (Space Gray)' : 'e.g. Space Gray Laptop in Black Case'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category & Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date {type === 'LOST' ? 'Lost' : 'Found'}</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateEvent}
                  onChange={(e) => setDateEvent(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campus Zone & Details */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Campus Zone</label>
                <select className="form-control" value={locationZone} onChange={(e) => setLocationZone(e.target.value)}>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Location Spot</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2nd floor quiet study table #14"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div className="form-group">
              <label className="form-label">
                Description & Identifiable Characteristics <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Describe color, brand, condition, scratches, protective case, keychain, or stickers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Safe Verification Challenge (FOUND ONLY) */}
            {type === 'FOUND' && (
              <div
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary-dark)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                    Safe Verification Challenge Question
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#0f766e', marginBottom: '0.75rem' }}>
                  Set a question that ONLY the true owner would know, without revealing the answer in your description.
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. What sticker is on the lid? / What is the name etched on the back?"
                  value={safeQuestion}
                  onChange={(e) => setSafeQuestion(e.target.value)}
                />

                <div className="form-row" style={{ marginTop: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Current Custody</label>
                    <select className="form-control" value={custodyType} onChange={(e) => setCustodyType(e.target.value)}>
                      <option value="WITH_FINDER">In My Possession (Finder)</option>
                      <option value="CAMPUS_SECURITY_DESK">Deposited at Campus Security Desk</option>
                      <option value="STUDENT_UNION_OFFICE">Turned in at Student Union Desk</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Custody Pickup Info</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Central Security Office Room 104"
                      value={custodyLocation}
                      onChange={(e) => setCustodyLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reward (LOST ONLY) */}
            {type === 'LOST' && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={14} style={{ color: 'var(--lost-accent)' }} />
                  Optional Cash Reward for Finder ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  className="form-control"
                  placeholder="0"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                />
              </div>
            )}

            {/* Photo Image Selection */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={14} />
                Item Photo (Image URL or Choose Sample)
              </label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/item-photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem', alignSelf: 'center' }}>
                  Quick Fill:
                </span>
                {SAMPLE_PHOTOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className={`btn btn-lg ${type === 'LOST' ? 'btn-lost' : 'btn-primary'}`}
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading
                  ? 'Saving Report...'
                  : type === 'LOST'
                  ? 'Publish Lost Item Report'
                  : 'Register Found Item to Campus Database'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
