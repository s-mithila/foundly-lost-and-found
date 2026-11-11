// client/src/components/Footer.jsx
import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Foundly</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#99f6e4', lineHeight: 1.6 }}>
              Smart campus lost & found matching portal. Connecting students, staff, and campus safety divisions for rapid item recovery.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Link to="/items?type=LOST">Search Lost Items</Link>
              <Link to="/items?type=FOUND">Browse Found Items</Link>
              <Link to="/report?type=LOST">File a Lost Item Report</Link>
              <Link to="/report?type=FOUND">Turn In a Found Item</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Campus Custody Centers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#99f6e4' }}>
              <span>🛡️ Central Security: Admin Hall #104</span>
              <span>📚 Library Help Desk: 1st Floor East</span>
              <span>🏛️ Student Union: Info Desk Room 202</span>
              <span>🚌 Transit Booth: Shuttle Pavilion</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '1rem' }}>Academic Project</h4>
            <p style={{ fontSize: '0.85rem', color: '#99f6e4', lineHeight: 1.6 }}>
              Built with React, Vite, Node.js, Express, and SQLite for University Capstone Evaluation.
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #115e59',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#5eead4',
          }}
        >
          <div>© {new Date().getFullYear()} Foundly University Network. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Designed for campus safety & integrity</span>
            <ShieldCheck size={14} />
          </div>
        </div>
      </div>
    </footer>
  );
}
