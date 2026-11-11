// client/src/services/api.js
// Foundly API Client Service

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    getMe: () => request('/auth/me'),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
    getDemoUsers: () => request('/auth/demo-users'),
  },

  // Items (Lost & Found)
  items: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/items${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/items/${id}`),
    create: (itemData) =>
      request('/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
      }),
    updateStatus: (id, statusData) =>
      request(`/items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }),
    delete: (id) =>
      request(`/items/${id}`, {
        method: 'DELETE',
      }),
  },

  // Smart Matching Engine
  matches: {
    getByItemId: (itemId) => request(`/matches/${itemId}`),
  },

  // Claims & Verifications
  claims: {
    getAll: () => request('/claims'),
    submit: (itemId, claimData) =>
      request(`/claims/items/${itemId}`, {
        method: 'POST',
        body: JSON.stringify(claimData),
      }),
    updateStatus: (claimId, updateData) =>
      request(`/claims/${claimId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }),
  },

  // Analytics & Statistics
  stats: {
    getOverview: () => request('/stats/overview'),
  },
};
