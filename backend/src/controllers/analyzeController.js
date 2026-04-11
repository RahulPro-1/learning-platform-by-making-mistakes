/**
 * analyzeController.js
 *
 * POST /api/analyze  – Full analysis: real compiler + AI explanation (Google Gemini)
 * POST /api/check    – Quick check: real compiler only (for real-time detection)
 *
 * Uses Google Gemini (gemini-1.5-flash) — free tier:
 *   • 15 requests/min
 *   • 1 million tokens/day
 *   • No credit card required
 *   Get a free key at: https://aistudio.google.com/app/apikey
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { checkCode, runCode } = require('../services/compilerService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const LANG_LABEL = { c: 'C', cpp: 'C++', python: 'Python' };

const DIFFICULTY_TONE = {
  basic:
    'Use very simple language. Assume the student has never programmed before. Avoid jargon. Be extra encouraging.',
  intermediate:
    'Use clear language. The student knows the basics. You can mention concepts like scope, types, and loops.',
  advanced:
    'You can use standard CS terminology. The student is comfortable with the language fundamentals.',
};

// ─── POST /api/check (real-time — no AI) ─────────────────────────────────────

const checkCodeRealtime = async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Both "code" and "language" are required.' });
  }
  if (!code.trim()) {
    return res.json({ compilerErrors: [], hasCompilerErrors: false });
  }

  try {
    const result = await checkCode(code, language);
    return res.json({
      compilerErrors: result.errors,
      hasCompilerErrors: result.errors.length > 0,
      compilerMissing: result.compilerMissing ?? false,
    });
  } catch (err) {
    console.error('Check error:', err.message);
    return res.json({ compilerErrors: [], hasCompilerErrors: false });
  }
};

// ─── POST /api/analyze (full analysis) ───────────────────────────────────────

const analyzeCode = async (req, res) => {
  const { code, language, difficulty = 'basic' } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Both "code" and "language" are required.' });
  }
  if (!code.trim()) {
    return res.status(400).json({ error: 'Code cannot be empty.' });
  }

  const langLabel = LANG_LABEL[language] || language.toUpperCase();
  const tone      = DIFFICULTY_TONE[difficulty] || DIFFICULTY_TONE.basic;

  // ── Step 1: Run the real compiler ──────────────────────────────────────────
  let compilerResult;
  try {
    compilerResult = await checkCode(code, language);
  } catch {
    compilerResult = { success: true, errors: [], raw: '', compilerMissing: true };
  }

  const compilerErrors    = compilerResult.errors;
  const hasCompilerErrors = compilerErrors.length > 0;

  // ── Step 2: Build AI prompt ───────────────────────────────────────────────
  const errorSection = hasCompilerErrors
    ? `The compiler found the following errors:\n${compilerErrors
        .map((e, i) => `${i + 1}. Line ${e.line ?? '?'}: [${e.type}] ${e.message}`)
        .join('\n')}`
    : compilerResult.compilerMissing
    ? '(Compiler not available — perform your own static analysis of the code.)'
    : 'The compiler found NO errors. The code compiles successfully.';

  const prompt = `You are a friendly, encouraging coding tutor for beginner CS students.

Difficulty level: ${difficulty.toUpperCase()}. ${tone}

Analyze the following ${langLabel} code:
\`\`\`${language}
${code}
\`\`\`

${errorSection}

Provide a response in this EXACT JSON format (no text outside the JSON):
{
  "explanation": "A clear, beginner-friendly explanation of what this code is trying to do (2-4 sentences).",
  "hints": [
    "General tip 1 to improve, fix, or learn from this code",
    "General tip 2",
    "General tip 3 (optional — omit if not useful)"
  ],
  "aiErrors": [
    {
      "raw": "Short description of the problem",
      "explanation": "Beginner-friendly explanation of what this error means",
      "hint": "How to fix it (do NOT give the full solution — guide them)",
      "whyItHappens": "Why this error occurs in simple terms",
      "line": null
    }
  ]
}

Rules:
- "aiErrors" should list errors/bugs you detect that the compiler may have MISSED (logical errors, bad practices).
  If you find none, return "aiErrors": [].
- If compiler already found errors, focus your "hints" on how to approach fixing them.
- If no errors at all, give 2-3 tips to improve the code quality.
- Keep each string short and clear. Use simple words.
- Be encouraging — never discouraging.`;

  // ── Step 3: Call Gemini ───────────────────────────────────────────────────
  try {
    const result  = await geminiModel.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Extract JSON from the response (Gemini sometimes wraps it in markdown)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response. Please try again.' });
    }

    const ai = JSON.parse(jsonMatch[0]);
    if (typeof ai.hints === 'string') ai.hints = [ai.hints];
    if (!Array.isArray(ai.aiErrors)) ai.aiErrors = [];

    // Merge: compiler errors first (with structured message), then AI-detected extras
    const allErrors = [
      ...compilerErrors,
      ...ai.aiErrors.map((e) => ({
        line:        e.line ?? null,
        column:      null,
        type:        'ai-detected',
        message:     e.raw || '',          // ← structured message field
        errorName:   'AI-Detected Issue',
        raw:         e.raw || '',
        explanation: e.explanation || '',
        hint:        e.hint || '',
        whyItHappens: e.whyItHappens || '',
      })),
    ];

    return res.json({
      compilerErrors: allErrors,
      hasCompilerErrors: allErrors.length > 0,
      compilerOutput: compilerResult.raw || '',
      compilerMissing: compilerResult.compilerMissing ?? false,
      explanation: ai.explanation || 'No explanation available.',
      hints: ai.hints || [],
      difficulty,
    });
  } catch (err) {
    console.error('AI analysis error:', err.message);

    // Detect quota / key errors
    const isQuotaError =
      err.message?.includes('quota') ||
      err.message?.includes('API_KEY') ||
      err.message?.includes('429');

    const explanation = isQuotaError
      ? 'AI explanation unavailable (Gemini API quota reached or key missing). Showing compiler results only.'
      : 'AI explanation unavailable. Showing compiler results only.';

    const hints = hasCompilerErrors
      ? ['Fix the compiler errors shown above, then re-analyze.']
      : ['Your code compiled successfully! Check your GEMINI_API_KEY to get AI tips and explanations.'];

    // Always return a usable result — never a 500 — so the UI shows compiler output
    return res.json({
      compilerErrors,
      hasCompilerErrors,
      compilerOutput: compilerResult.raw || '',
      compilerMissing: compilerResult.compilerMissing ?? false,
      explanation,
      hints,
      difficulty,
      aiUnavailable: true,
    });
  }
};

// ─── POST /api/run (execute code, return stdout/stderr) ──────────────────────

const runCodeHandler = async (req, res) => {
  const { code, language, stdin = '' } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Both "code" and "language" are required.' });
  }
  if (!code.trim()) {
    return res.status(400).json({ error: 'Code cannot be empty.' });
  }

  try {
    const result = await runCode(code, language, stdin);
    return res.json({
      stdout:         result.stdout || '',
      stderr:         result.stderr || '',
      exitCode:       result.exitCode ?? 0,
      timedOut:       result.timedOut ?? false,
      compileError:   result.compileError ?? false,
      compilerMissing: result.compilerMissing ?? false,
    });
  } catch (err) {
    console.error('Run error:', err.message);
    return res.status(500).json({ error: 'Failed to run code.' });
  }
};

module.exports = { analyzeCode, checkCodeRealtime, runCodeHandler };
