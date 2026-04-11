require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyzeRoutes  = require('./routes/analyzeRoutes');
const authRoutes     = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');
const practiceRoutes = require('./routes/practiceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '500kb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api',          analyzeRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/samples',  practiceRoutes); // samples endpoint is inside practiceRoutes

// ── Health check / root ───────────────────────────────────────────────────────
app.get('/', (_, res) =>
  res.json({ status: 'ok', message: 'Code Assistant Backend is running.', time: new Date().toISOString() })
);

app.get('/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`\nBackend running at http://localhost:${PORT}`);
  console.log('Routes: /api/analyze, /api/check, /api/auth, /api/progress, /api/practice\n');
});
