// server/routes/matches.js
const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Helper to tokenize text into lowercase keywords (ignoring short stopwords)
function getKeywords(text) {
  if (!text) return [];
  const stopwords = new Set([
    'the', 'and', 'with', 'for', 'this', 'that', 'near', 'from', 'have', 'lost', 'found',
    'area', 'left', 'please', 'side', 'after', 'some', 'desk', 'room', 'floor', 'hall'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

// GET /api/items/:id/matches
router.get('/:id', (req, res) => {
  const itemId = req.params.id;

  const currentItem = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
  if (!currentItem) {
    return res.status(404).json({ error: 'Item not found.' });
  }

  // Opposite type: if current is LOST, search FOUND; if FOUND, search LOST
  const targetType = currentItem.type === 'LOST' ? 'FOUND' : 'LOST';

  const candidates = db
    .prepare(`
      SELECT 
        items.*,
        users.name AS reporter_name,
        users.avatar_url AS reporter_avatar,
        users.department AS reporter_department
      FROM items
      JOIN users ON items.user_id = users.id
      WHERE items.type = ? AND items.id != ? AND items.status != 'RETURNED'
    `)
    .all(targetType, itemId);

  const currentKeywords = new Set([
    ...getKeywords(currentItem.title),
    ...getKeywords(currentItem.description),
  ]);

  const matches = [];

  for (const candidate of candidates) {
    let score = 0;
    const reasons = [];

    // 1. Category Match (40 pts)
    if (candidate.category === currentItem.category) {
      score += 40;
      reasons.push(`Identical category: ${candidate.category}`);
    }

    // 2. Location Zone Match (30 pts)
    if (candidate.location_zone === currentItem.location_zone) {
      score += 30;
      reasons.push(`Same campus zone: ${candidate.location_zone}`);
    }

    // 3. Keyword Match (up to 20 pts)
    const candidateKeywords = [
      ...getKeywords(candidate.title),
      ...getKeywords(candidate.description),
    ];
    let sharedKeywords = 0;
    const matchedWords = [];
    for (const kw of candidateKeywords) {
      if (currentKeywords.has(kw) && !matchedWords.includes(kw)) {
        sharedKeywords++;
        matchedWords.push(kw);
      }
    }
    if (sharedKeywords > 0) {
      const keywordScore = Math.min(20, sharedKeywords * 7);
      score += keywordScore;
      reasons.push(`Matching terms: ${matchedWords.slice(0, 3).join(', ')}`);
    }

    // 4. Date Proximity (up to 10 pts)
    if (currentItem.date_event && candidate.date_event) {
      const d1 = new Date(currentItem.date_event);
      const d2 = new Date(candidate.date_event);
      const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        score += 10;
        reasons.push('Reported within 3 days of each other');
      } else if (diffDays <= 7) {
        score += 5;
        reasons.push('Reported within 1 week');
      }
    }

    // Only include if there is some meaningful overlap (>= 35%)
    if (score >= 35) {
      matches.push({
        item: candidate,
        matchScore: Math.min(score, 98), // Cap at 98% to encourage verification
        reasons,
      });
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    currentItem,
    matches,
    totalMatches: matches.length,
  });
});

module.exports = router;
