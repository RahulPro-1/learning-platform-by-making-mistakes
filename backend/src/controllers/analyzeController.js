/**
 * analyzeController.js
 *
 * POST /api/analyze  – Full analysis: real compiler + local rule-based explanation
 * POST /api/check    – Quick check: real compiler only (for real-time detection)
 *
 * No external AI API is used. All error analysis is done locally using the
 * compiler output and the beginnerHints dictionary.
 */

const { checkCode, runCode } = require('../services/compilerService');
const { ERROR_PATTERNS } = require('../utils/beginnerHints');

// ─── Standard library include map ────────────────────────────────────────────

const INCLUDE_MAP = {
  printf:  '<stdio.h>', fprintf: '<stdio.h>', scanf:   '<stdio.h>',
  fscanf:  '<stdio.h>', sprintf: '<stdio.h>', sscanf:  '<stdio.h>',
  puts:    '<stdio.h>', gets:    '<stdio.h>', fgets:   '<stdio.h>',
  fopen:   '<stdio.h>', fclose:  '<stdio.h>', fread:   '<stdio.h>',
  fwrite:  '<stdio.h>', feof:    '<stdio.h>', perror:  '<stdio.h>',
  getchar: '<stdio.h>', putchar: '<stdio.h>',
  sqrt:  '<math.h>', pow:   '<math.h>', abs:   '<math.h>',
  ceil:  '<math.h>', floor: '<math.h>', fabs:  '<math.h>',
  sin:   '<math.h>', cos:   '<math.h>', tan:   '<math.h>',
  log:   '<math.h>', exp:   '<math.h>', round: '<math.h>',
  malloc:  '<stdlib.h>', free:    '<stdlib.h>', calloc:  '<stdlib.h>',
  realloc: '<stdlib.h>', exit:    '<stdlib.h>', atoi:    '<stdlib.h>',
  atof:    '<stdlib.h>', rand:    '<stdlib.h>', srand:   '<stdlib.h>',
  strlen:  '<string.h>', strcpy:  '<string.h>', strcat:  '<string.h>',
  strcmp:  '<string.h>', strncpy: '<string.h>', strncmp: '<string.h>',
  memset:  '<string.h>', memcpy:  '<string.h>',
};

// ─── Type detection from assigned value ──────────────────────────────────────

const detectTypeFromAssignment = (varName, codeLine) => {
  if (!codeLine) return null;
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\s*(?:[+\\-*/%&|^]?=)\\s*([^;,)\\n]+)`);
  const match   = codeLine.match(pattern);
  if (!match) return null;
  const value = match[1].trim();
  if (/^'[^']'$/.test(value))                         return 'char';
  if (/^"[^"]*"$/.test(value))                        return 'char[]';
  if (/^-?\d+\.\d+[fF]$/.test(value))                 return 'float';
  if (/^-?\d+\.\d+([eE][+-]?\d+)?$/.test(value))      return 'double';
  if (/^-?\d+[Ll]$/.test(value))                      return 'long';
  if (/^-?\d+$/.test(value))                          return 'int';
  return null;
};

// ─── Missing opening quote detection (code-line analysis) ────────────────────

/**
 * Examines a code line to decide if the opening `"` was forgotten.
 *
 * Rule: if there is a function call  word(...)  where the first argument does
 * NOT start with `"` but a `"` appears BEFORE the first comma, the student
 * most likely forgot the opening quote.
 *
 * Examples that return true:
 *   printf(Sum = %.2lf\n", sum)   ← missing opening "
 *   printf(Hello")                ← missing opening "
 *
 * Examples that return false:
 *   printf("Hello", x)            ← opening " is present
 *   printf(x, "format")           ← " is after the first comma (second arg)
 */
const codeLineMissingOpenQuote = (codeLine) => {
  // Must be a function call: identifier followed by (
  const callMatch = codeLine.match(/\b\w+\s*\((.+)/s);
  if (!callMatch) return false;

  const argsSection = callMatch[1];

  // Opening quote already present → not this error
  if (/^\s*"/.test(argsSection)) return false;

  const commaIdx = argsSection.indexOf(',');
  const quoteIdx = argsSection.indexOf('"');

  // " must exist AND appear before the first comma (i.e. inside the first arg)
  return quoteIdx !== -1 && (commaIdx === -1 || quoteIdx < commaIdx);
};

/**
 * Collapse all errors on lines where the student forgot the opening `"`.
 * Two detection methods are combined:
 *   1. GCC gives "expected ')' before '"' token" + undeclared on same line.
 *   2. Code-line analysis: function call whose first arg has no leading `"`.
 */
const fixMissingOpeningQuote = (compilerErrors, codeLines) => {
  const missingOpenQuoteLines = new Set();

  // Method 1 — GCC error pattern
  for (const err of compilerErrors) {
    if (/expected\s+'\)'\s+before\s+'"'\s+token/i.test(err.raw) && err.line !== null) {
      const hasUndeclared = compilerErrors.some(
        (o) => o.line === err.line && /undeclared|not\s+declared/i.test(o.raw)
      );
      if (hasUndeclared) missingOpenQuoteLines.add(err.line);
    }
  }

  // Method 2 — code-line analysis (catches printf(Sum = %.2lf\n", sum) style)
  const undeclaredLines = new Set(
    compilerErrors
      .filter((e) => /undeclared|not\s+declared/i.test(e.raw) && e.line !== null)
      .map((e) => e.line)
  );
  for (const lineNum of undeclaredLines) {
    if (missingOpenQuoteLines.has(lineNum)) continue;
    const codeLine = codeLines[lineNum - 1] || '';
    if (codeLineMissingOpenQuote(codeLine)) {
      missingOpenQuoteLines.add(lineNum);
    }
  }

  if (missingOpenQuoteLines.size === 0) return compilerErrors;

  const seen   = new Set();
  const result = [];

  for (const err of compilerErrors) {
    if (err.line !== null && missingOpenQuoteLines.has(err.line)) {
      if (!seen.has(err.line)) {
        seen.add(err.line);
        // Build the mini-fix from the actual code line
        const codeLine   = codeLines[err.line - 1] || '';
        const callMatch  = codeLine.match(/\b(\w+)\s*\(/);
        const fnName     = callMatch ? callMatch[1] : 'printf';
        result.push({
          ...err,
          errorName:    'Missing Opening Quotation Mark',
          explanation:  `You forgot the opening \`"\` before your string in the \`${fnName}\` call. The compiler reads the text as variable names.`,
          hint:         `Add \`"\` right after the opening \`(\` on line ${err.line}. Every string must start and end with double quotes.`,
          whyItHappens: 'In C, strings must be surrounded by double quotes on both sides. Without the opening `"`, C reads the text as variable names.',
          miniFixExample: `${fnName}(Sum = ...)  →  ${fnName}("Sum = ...")`,
        });
      }
      continue; // drop all other errors on this line (cascading effects)
    }
    result.push(err);
  }

  return result;
};

// ─── Per-error enrichment helpers ────────────────────────────────────────────

/**
 * "Variable Not Declared" — two cases:
 *   a) The name is a known stdlib function (printf, scanf…) → missing #include
 *   b) A real undeclared variable → detect its type from the assigned value
 */
const enrichUndeclaredVariable = (err, codeLines) => {
  const varMatch =
    err.raw.match(/'(\w+)'\s+undeclared/i)           ||
    err.raw.match(/'(\w+)'\s+was\s+not\s+declared/i) ||
    err.raw.match(/use\s+of\s+undeclared\s+identifier\s+'(\w+)'/i);

  if (!varMatch) return err;
  const varName = varMatch[1];

  // Known stdlib function → the real problem is a missing #include
  if (INCLUDE_MAP[varName]) {
    const include = INCLUDE_MAP[varName];
    return {
      ...err,
      errorName:    'Function Used Without Including Header',
      explanation:  `You used \`${varName}\` but its header file is not included at the top of your file.`,
      hint:         `Add \`#include ${include}\` at the very top of your file (before \`int main()\`).`,
      whyItHappens: `\`${varName}\` is a built-in C function. You must include its header: \`#include ${include}\``,
      miniFixExample: `(add at top of file)  →  #include ${include}`,
    };
  }

  // Regular variable — detect type from assigned value
  const lineNum      = err.line;
  const codeLine     = lineNum ? codeLines[lineNum - 1] : null;
  const detectedType = detectTypeFromAssignment(varName, codeLine) || 'int';

  return {
    ...err,
    hint: `Declare \`${varName}\` before you use it on line ${lineNum ?? '?'}. Based on what you assigned, try: \`${detectedType} ${varName};\``,
    miniFixExample: `${varName} = ...;  →  ${detectedType} ${varName};  (add before line ${lineNum ?? '?'})`,
  };
};

/**
 * "Function Used Without Including Header" — give a targeted function-specific hint.
 * Handles both forms of the GCC warning:
 *   - "implicit declaration of function 'printf'"
 *   - "incompatible implicit declaration of built-in function 'printf'"
 */
const enrichImplicitDeclaration = (err) => {
  const fnMatch =
    err.raw.match(/implicit\s+declaration\s+of\s+function\s+'(\w+)'/i) ||
    err.raw.match(/incompatible\s+implicit\s+declaration\s+of\s+built-in\s+function\s+'(\w+)'/i);

  if (!fnMatch) return err;
  const fnName  = fnMatch[1];
  const include = INCLUDE_MAP[fnName] || null;

  return {
    ...err,
    explanation: `You used \`${fnName}\` but its header file is not included at the top of your file.`,
    hint: include
      ? `Add \`#include ${include}\` at the very top of your file (before \`int main()\`). This gives you access to \`${fnName}\`.`
      : `Add the correct \`#include\` at the top. For printf/scanf use \`#include <stdio.h>\`.`,
    miniFixExample: include
      ? `(add at top of file)  →  #include ${include}`
      : `(add missing #include at the very top)`,
  };
};

/**
 * Detects when the student forgot to write the function name entirely, e.g.:
 *   (Sum = %.2lf\n", sum);    ← should be:  printf("Sum = %.2lf\n", sum);
 *
 * GCC sees the comma expression and warns: "left-hand operand of comma
 * expression has no effect". We replace this with a clear, actionable message.
 */
const enrichMissingFunctionName = (err, codeLines) => {
  if (err.line === null) return err;
  const codeLine = (codeLines[err.line - 1] || '').trim();

  // Line starts with ( (no function name) AND contains a " → likely a forgotten printf/scanf
  if (!codeLine.startsWith('(')) return err;
  if (!codeLine.includes('"'))   return err;

  return {
    ...err,
    errorName:    'Missing Function Name (printf / scanf)',
    explanation:  'It looks like you forgot to write the function name before `(`. The compiler sees this as an expression, not a function call.',
    hint:         `Add \`printf\` (or the correct function name) before \`(\` on line ${err.line}.`,
    whyItHappens: 'In C, to print output you must call a function like `printf(...)`. Just writing `(...)` alone is not a valid print statement.',
    miniFixExample: `(Sum = %.2lf\\n", sum)  →  printf("Sum = %.2lf\\n", sum)`,
  };
};

/**
 * Detects "missing `(` after function name":  printf"Hello")
 * GCC gives "expected ';' before string constant", which normally matches the
 * semicolon pattern — wrong diagnosis.
 */
const enrichMissingOpenParen = (err, codeLines) => {
  if (err.line === null) return null;
  const codeLine = codeLines[err.line - 1] || '';

  // Pattern: a word directly followed by " with no ( between them
  if (!/\b\w+\s*"/.test(codeLine)) return null;
  if (/\bchar\b/.test(codeLine))    return null; // skip char declarations

  const match  = codeLine.match(/\b(\w+)\s*"/);
  const fnName = match ? match[1] : 'printf';

  return {
    ...err,
    errorName:    'Missing Opening Parenthesis',
    explanation:  `You forgot the opening \`(\` after \`${fnName}\`. The compiler sees the string and gets confused.`,
    hint:         `Add \`(\` after \`${fnName}\` on line ${err.line}. Function calls must have parentheses: \`${fnName}(...)\`.`,
    whyItHappens: 'Every function call in C must have parentheses. Without `(`, the compiler does not know you are calling a function.',
    miniFixExample: `${fnName}"..."  →  ${fnName}("...")`,
  };
};

/**
 * Fix the wrong line number for missing-semicolon errors.
 *
 * GCC only discovers a missing `;` when it reads the NEXT line and finds an
 * unexpected token. So it reports the error on line N+1, not on line N where
 * the semicolon is actually absent.
 *
 * Strategy: when we get a "Missing Semicolon" error on line N, look at
 * line N-1. If that line is a regular statement that ends without `;`, `{`,
 * `}`, or other valid terminators, the real mistake is there — shift the
 * reported line number back by one and update all messages accordingly.
 */
const enrichMissingSemicolon = (err, codeLines) => {
  const lineNum = err.line;
  if (!lineNum || lineNum <= 1) return err;

  const prevLine = (codeLines[lineNum - 2] || '').trim();
  if (!prevLine) return err;

  // Lines that legitimately don't end with a semicolon — don't touch them
  const validEnding   = /[;{},]$/.test(prevLine);
  const isComment     = prevLine.startsWith('//') || prevLine.startsWith('/*') || prevLine.endsWith('*/');
  const isPreproc     = prevLine.startsWith('#');
  // Only skip control-flow keywords — NOT function calls like printf(...) which DO need ;
  const isControlFlow = /^(if|else\s*if|for|while|switch|do|else)\b/.test(prevLine);

  if (validEnding || isComment || isPreproc || isControlFlow) return err;

  // The previous line is a statement missing its semicolon — correct the line number
  const correctedLine = lineNum - 1;

  const shortPrev = prevLine.length <= 40
    ? prevLine
    : prevLine.slice(0, 38) + '…';

  return {
    ...err,
    line:           correctedLine,
    explanation:    `You are missing a semicolon \`;\` at the end of line ${correctedLine}. Every statement in C must end with a semicolon.`,
    hint:           `Add \`;\` at the very end of line ${correctedLine}.`,
    miniFixExample: `${shortPrev}  →  ${shortPrev};`,
  };
};

// ─── Main enrichment pipeline ─────────────────────────────────────────────────

const enrichErrors = (compilerErrors, code) => {
  const codeLines = code.split('\n');

  // Pass 1 — detect and collapse "missing opening quote" scenarios
  const pass1 = fixMissingOpeningQuote(compilerErrors, codeLines);

  // Pass 2 — improve individual error messages
  return pass1.map((err) => {

    // "Variable Not Declared" might actually be:
    //   a) missing #include (printf undeclared)  b) real undeclared variable
    if (err.errorName === 'Variable Not Declared') {
      return enrichUndeclaredVariable(err, codeLines);
    }

    // Explicit implicit-declaration warning → targeted include hint
    if (err.errorName === 'Function Used Without Including Header') {
      return enrichImplicitDeclaration(err);
    }

    if (err.errorName === 'Missing Semicolon') {
      // "Expected ';' before string constant" may be a missing '(' e.g. printf"Hello")
      const improvedParen = enrichMissingOpenParen(err, codeLines);
      if (improvedParen) return improvedParen;

      // Otherwise fix the line number — GCC reports on the NEXT line, not the actual one
      return enrichMissingSemicolon(err, codeLines);
    }

    // Comma-expression warnings: student forgot the function name entirely
    if (/comma\s+expression|statement\s+has\s+no\s+effect|left-hand\s+operand/i.test(err.raw)) {
      return enrichMissingFunctionName(err, codeLines);
    }

    return err;
  });
};

// ─── Local error analysis (no API) ───────────────────────────────────────────

const getPatternEntry = (errorName) =>
  ERROR_PATTERNS.find((p) => p.name === errorName) || null;

const generateLocalAnalysis = (compilerErrors) => {
  if (compilerErrors.length === 0) {
    return {
      explanation:
        'Your code compiled successfully! No errors were found.\n\nGreat job! Try running your code to check the output.',
      hints: [
        'Run your code and verify the output is correct.',
        'Read your code line by line to double-check your logic.',
      ],
    };
  }

  const first       = compilerErrors[0];
  const lineNum     = first.line ?? '?';
  const errorType   = first.errorName  || 'Syntax Error';
  const whatIsWrong = first.explanation || 'There is a mistake in your code at the line shown.';
  const hintText    = first.hint        || 'Check the line mentioned and fix the issue.';

  const lineHint = lineNum !== '?'
    ? hintText.replace(/line\s*\?/gi, `line ${lineNum}`)
    : hintText;

  const entry          = getPatternEntry(first.errorName);
  const miniFixExample = first.miniFixExample || entry?.miniFixExample || '(See the hint above)';

  const explanation = [
    `Error Type: ${errorType}`,
    ``,
    `Line Number: ${lineNum}`,
    ``,
    `What is wrong:`,
    whatIsWrong,
    ``,
    `Hint:`,
    lineHint,
    ``,
    `Mini Fix Example:`,
    miniFixExample,
  ].join('\n');

  const hints = [
    'Fix this error first — it is the most important one.',
    compilerErrors.length > 1
      ? `There ${compilerErrors.length - 1 === 1 ? 'is' : 'are'} ${
          compilerErrors.length - 1
        } more error${compilerErrors.length - 1 === 1 ? '' : 's'} — fix the first one and re-analyse.`
      : null,
  ].filter(Boolean);

  return { explanation, hints };
};

// ─── POST /api/check ─────────────────────────────────────────────────────────

const checkCodeRealtime = async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language)
    return res.status(400).json({ error: 'Both "code" and "language" are required.' });
  if (!code.trim())
    return res.json({ compilerErrors: [], hasCompilerErrors: false });

  try {
    const result   = await checkCode(code, language);
    const enriched = enrichErrors(result.errors, code);
    return res.json({
      compilerErrors:    enriched,
      hasCompilerErrors: enriched.length > 0,
      compilerMissing:   result.compilerMissing ?? false,
    });
  } catch (err) {
    console.error('Check error:', err.message);
    return res.json({ compilerErrors: [], hasCompilerErrors: false });
  }
};

// ─── POST /api/analyze ───────────────────────────────────────────────────────

const analyzeCode = async (req, res) => {
  const { code, language, difficulty = 'basic' } = req.body;
  if (!code || !language)
    return res.status(400).json({ error: 'Both "code" and "language" are required.' });
  if (!code.trim())
    return res.status(400).json({ error: 'Code cannot be empty.' });

  let compilerResult;
  try {
    compilerResult = await checkCode(code, language);
  } catch {
    compilerResult = { success: true, errors: [], raw: '', compilerMissing: true };
  }

  const compilerErrors    = enrichErrors(compilerResult.errors, code);
  const hasCompilerErrors = compilerErrors.length > 0;
  const { explanation, hints } = generateLocalAnalysis(compilerErrors);

  return res.json({
    compilerErrors,
    hasCompilerErrors,
    compilerOutput:  compilerResult.raw || '',
    compilerMissing: compilerResult.compilerMissing ?? false,
    explanation,
    hints,
    difficulty,
  });
};

// ─── POST /api/run ───────────────────────────────────────────────────────────

const runCodeHandler = async (req, res) => {
  const { code, language, stdin = '' } = req.body;
  if (!code || !language)
    return res.status(400).json({ error: 'Both "code" and "language" are required.' });
  if (!code.trim())
    return res.status(400).json({ error: 'Code cannot be empty.' });

  try {
    const result = await runCode(code, language, stdin);
    return res.json({
      stdout:          result.stdout       || '',
      stderr:          result.stderr       || '',
      exitCode:        result.exitCode     ?? 0,
      timedOut:        result.timedOut     ?? false,
      compileError:    result.compileError ?? false,
      compilerMissing: result.compilerMissing ?? false,
    });
  } catch (err) {
    console.error('Run error:', err.message);
    return res.status(500).json({ error: 'Failed to run code.' });
  }
};

module.exports = { analyzeCode, checkCodeRealtime, runCodeHandler };
