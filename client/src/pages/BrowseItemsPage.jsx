// client/src/pages/BrowseItemsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, AlertCircle, CheckCircle2, RotateCcw, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { CategoryIcon } from '../components/CategoryIcon';

const CATEGORIES = [
  'All',
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
  'All',
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

export function BrowseItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters from query params
  const currentType = searchParams.get('type') || 'All';
  const currentCategory = searchParams.get('category') || 'All';
  const currentZone = searchParams.get('zone') || 'All';
  const currentStatus = searchParams.get('status') || 'All';
  const currentSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const params = {};
        if (currentType !== 'All') params.type = currentType;
        if (currentCategory !== 'All') params.category = currentCategory;
        if (currentZone !== 'All') params.zone = currentZone;
        if (currentStatus !== 'All') params.status = currentStatus;
        if (currentSearch) params.search = currentSearch;

        const data = await api.items.getAll(params);
        setItems(data.items);
      } catch (err) {
        console.error('Fetch items error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [currentType, currentCategory, currentZone, currentStatus, currentSearch]);

  function updateFilter(key, value) {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  }

  function handleResetFilters() {
    setSearchInput('');
    setSearchParams({});
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header & Type Switcher Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem' }}>Browse Campus Items</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Filter by status, category, or campus location to find lost property.
            </p>
          </div>

          {/* Type Tabs */}
          <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '0.35rem' }}>
            {['All', 'LOST', 'FOUND'].map((type) => (
              <button
                key={type}
                onClick={() => updateFilter('type', type)}
                className={`btn btn-sm ${currentType === type ? 'btn-primary' : ''}`}
                style={{
                  background: currentType === type ? 'var(--primary)' : 'transparent',
                  color: currentType === type ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.45rem 1rem',
                }}
              >
                {type === 'All' ? 'All Items' : type === 'LOST' ? 'Lost Items' : 'Found Items'}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Keyword search..."
                  style={{ paddingLeft: '2.4rem' }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </form>

            {/* Zone Selector */}
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                value={currentZone}
                onChange={(e) => updateFilter('zone', e.target.value)}
              >
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone === 'All' ? '📍 All Campus Zones' : zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="form-control"
                value={currentStatus}
                onChange={(e) => updateFilter('status', e.target.value)}
              >
                <option value="All">⚡ All Statuses</option>
                <option value="REPORTED">Open / Reported</option>
                <option value="MATCH_SUGGESTED">Match Found</option>
                <option value="CLAIM_PENDING">Claim Under Review</option>
                <option value="CLAIM_APPROVED">Claim Approved</option>
                <option value="RETURNED">Returned & Resolved</option>
              </select>
            </div>

            {/* Reset */}
            <button
              onClick={handleResetFilters}
              className="btn btn-outline"
              title="Reset all filters"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Chips Bar */}
          <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="category-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`category-chip ${currentCategory === cat ? 'active' : ''}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CategoryIcon category={cat} size={14} />
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong>{items.length}</strong> {items.length === 1 ? 'item' : 'items'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/report?type=LOST" className="btn btn-sm btn-lost">
              + Report Lost
            </Link>
            <Link to="/report?type=FOUND" className="btn btn-sm btn-found">
              + Report Found
            </Link>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Searching database...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: 550,
              margin: '2rem auto',
            }}
          >
            <AlertCircle size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Matching Items Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We couldn't find any reports matching your search criteria. Try loosening your filters or file a new report.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={handleResetFilters} className="btn btn-outline">
                Clear Filters
              </button>
              <Link to="/report" className="btn btn-primary">
                File a Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
