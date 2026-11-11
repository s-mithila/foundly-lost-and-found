// client/src/components/ItemCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Award } from 'lucide-react';
import { TypeBadge, StatusBadge } from './StatusBadge';
import { CategoryIcon } from './CategoryIcon';

export function ItemCard({ item }) {
  const formattedDate = new Date(item.date_event).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-card-image">
        <img
          src={item.image_url}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="item-card-type-badge">
          <TypeBadge type={item.type} />
        </div>
        {item.reward_amount > 0 && item.type === 'LOST' && (
          <div className="item-card-reward">
            <Award size={12} style={{ display: 'inline', marginRight: '3px' }} />
            ${item.reward_amount} Reward
          </div>
        )}
      </div>

      <div className="item-card-body">
        <div className="item-card-category" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CategoryIcon category={item.category} size={14} />
          <span>{item.category}</span>
        </div>

        <h3 className="item-card-title">{item.title}</h3>
        <p className="item-card-desc">{item.description}</p>

        <div className="item-card-meta">
          <div className="meta-row">
            <MapPin size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600 }}>{item.location_zone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
            <div className="meta-row">
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </div>
      </div>
    </Link>
  );
}
