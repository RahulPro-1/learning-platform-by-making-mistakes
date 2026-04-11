const express = require('express');
const router = express.Router();
const { PRACTICE_QUESTIONS } = require('../data/practiceQuestions');
const { SAMPLE_PROGRAMS } = require('../data/samplePrograms');

/** GET /api/practice?difficulty=basic&language=python */
router.get('/', (req, res) => {
  const { difficulty, language } = req.query;
  let questions = PRACTICE_QUESTIONS;

  if (difficulty) questions = questions.filter((q) => q.difficulty === difficulty);
  if (language)   questions = questions.filter((q) => q.language === language);

  // Never send the solution in the list view
  const safe = questions.map(({ solution: _s, ...rest }) => rest);
  res.json({ questions: safe, total: safe.length });
});

/** GET /api/practice/:id */
router.get('/:id', (req, res) => {
  const q = PRACTICE_QUESTIONS.find((q) => q.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found.' });
  const { solution: _s, ...safe } = q; // omit solution
  res.json({ question: safe });
});

/** GET /api/samples/:language */
router.get('/samples/:language', (req, res) => {
  const { language } = req.params;
  const programs = SAMPLE_PROGRAMS[language];
  if (!programs) return res.status(400).json({ error: `No samples for language: ${language}` });
  res.json({ samples: programs });
});

module.exports = router;
