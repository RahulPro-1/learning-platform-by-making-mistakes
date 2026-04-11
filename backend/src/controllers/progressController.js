/**
 * progressController.js
 * Tracks per-user learning progress — analyses done, streak, level, practice.
 * Stored in backend/data/progress.json (keyed by userId).
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, '../../data/progress.json');

// ─── File helpers ─────────────────────────────────────────────────────────────

const readAll = () => {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) {
      fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
      fs.writeFileSync(PROGRESS_FILE, '{}');
    }
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  } catch {
    return {};
  }
};

const writeAll = (data) => {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
};

const todayStr = () => new Date().toISOString().split('T')[0]; // "2026-04-11"

const calcLevel = (analysesCount) => {
  if (analysesCount >= 30) return 'advanced';
  if (analysesCount >= 10) return 'intermediate';
  return 'beginner';
};

/** Return or create a default progress record for a user. */
const getOrCreate = (all, userId) => {
  if (!all[userId]) {
    all[userId] = {
      analysesCount: 0,
      languagesUsed: [],
      practiceCompleted: [],
      streak: 0,
      lastActive: null,
      totalErrorsFound: 0,
      level: 'beginner',
    };
  }
  return all[userId];
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/** GET /api/progress */
const getProgress = (req, res) => {
  const all = readAll();
  const record = getOrCreate(all, req.user.id);
  return res.json({ progress: { ...record, level: calcLevel(record.analysesCount) } });
};

/**
 * POST /api/progress/update
 * Body can contain:
 *   - language: string           (add to languagesUsed)
 *   - errorsFound: number        (add to totalErrorsFound)
 *   - practiceId: string         (mark practice question done)
 *   - analysisCompleted: boolean (increment analysesCount + streak)
 */
const updateProgress = (req, res) => {
  const { language, errorsFound, practiceId, analysisCompleted } = req.body;
  const all = readAll();
  const record = getOrCreate(all, req.user.id);

  if (analysisCompleted) {
    record.analysesCount += 1;

    // Streak logic
    const today = todayStr();
    if (record.lastActive === null) {
      record.streak = 1;
    } else {
      const last = new Date(record.lastActive);
      const now = new Date(today);
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        record.streak += 1; // consecutive day
      } else if (diffDays === 0) {
        // Same day — keep streak
      } else {
        record.streak = 1; // streak broken
      }
    }
    record.lastActive = today;
  }

  if (language && !record.languagesUsed.includes(language)) {
    record.languagesUsed.push(language);
  }

  if (typeof errorsFound === 'number' && errorsFound > 0) {
    record.totalErrorsFound = (record.totalErrorsFound || 0) + errorsFound;
  }

  if (practiceId && !record.practiceCompleted.includes(practiceId)) {
    record.practiceCompleted.push(practiceId);
  }

  record.level = calcLevel(record.analysesCount);
  all[req.user.id] = record;
  writeAll(all);

  return res.json({ progress: record });
};

module.exports = { getProgress, updateProgress };
