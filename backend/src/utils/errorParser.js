/**
 * errorParser.js
 * Parses raw compiler/interpreter output into structured error objects.
 *
 * Each error is returned as:
 * {
 *   line:         number | null,   // source line number
 *   column:       number | null,   // source column number
 *   type:         string,          // "error" | "warning"
 *   message:      string,          // clean, human-readable error message
 *   errorName:    string,          // short category name (e.g. "Undeclared Variable")
 *   raw:          string,          // original compiler message text
 *   explanation:  string,          // beginner-friendly explanation
 *   hint:         string,          // how-to-fix hint
 *   whyItHappens: string,          // why this error occurs
 * }
 *
 * Handles Windows paths (C:\...) and Unix paths (/tmp/...).
 * Errors are sorted: real errors first, warnings second.
 */

const { matchHint } = require('./beginnerHints');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a clean human-readable message from the raw GCC/Python message.
 * Strips compiler flags like [-Wunused-variable] and trims whitespace.
 */
const toMessage = (raw) => raw.trim().replace(/\s*\[.*?\]$/, '');

/**
 * Categorise a GCC error/warning message into a short type label.
 * Used when the hints dictionary has no match.
 */
const categoriseGCC = (msg) => {
  const m = msg.toLowerCase();
  if (/undeclared|was not declared/.test(m))             return 'Undeclared Identifier';
  if (/implicit declaration/.test(m))                    return 'Implicit Declaration';
  if (/expected\s+'[^']*'/.test(m))                      return 'Syntax Error';
  if (/expected (declaration|statement|expression)/.test(m)) return 'Syntax Error';
  if (/stray '[^']*' in program/.test(m))                return 'Stray Character';
  if (/return type/.test(m))                             return 'Return Type Error';
  if (/conflicting types/.test(m))                       return 'Type Conflict';
  if (/incompatible types/.test(m))                      return 'Type Mismatch';
  if (/passing argument/.test(m))                        return 'Wrong Argument Type';
  if (/too (few|many) arguments/.test(m))                return 'Wrong Argument Count';
  if (/redeclaration|redefinition/.test(m))              return 'Redeclaration';
  if (/unused variable/.test(m))                         return 'Unused Variable';
  if (/unused (parameter|function)/.test(m))             return 'Unused Symbol';
  if (/uninitialized/.test(m))                           return 'Uninitialized Variable';
  if (/control reaches end/.test(m))                     return 'Missing Return';
  if (/comparison/.test(m))                              return 'Comparison Warning';
  if (/format/.test(m))                                  return 'Format String Error';
  if (/division by zero/.test(m))                        return 'Division by Zero';
  if (/overflow/.test(m))                                return 'Integer Overflow';
  if (/array subscript/.test(m))                         return 'Array Index Error';
  if (/pointer/.test(m))                                 return 'Pointer Error';
  if (/note:/.test(m))                                   return 'Note';
  return null;
};

/**
 * Build a structured error object from extracted parts.
 * Attaches a human-readable errorName and beginner hints from the hints dictionary.
 */
const buildError = ({ lineNum, colNum, severity, rawMessage, language }) => {
  const message    = toMessage(rawMessage);
  const hintEntry  = matchHint(rawMessage, language);
  const isError    = severity === 'error';

  const fallbackName = isError ? 'Compiler Error' : 'Compiler Warning';
  const errorName    = hintEntry
    ? hintEntry.name
    : (categoriseGCC(rawMessage) ?? fallbackName);

  return {
    line:      lineNum ? parseInt(lineNum, 10) : null,
    column:    colNum  ? parseInt(colNum, 10)  : null,
    type:      isError ? 'error' : 'warning',
    message,                                              // ← structured "message" field
    errorName,
    raw:       message,                                   // kept for backward-compat
    explanation: hintEntry
      ? hintEntry.explanation
      : `The compiler flagged this line: "${message}"`,
    hint: hintEntry
      ? hintEntry.hint
      : 'Read the error message carefully. Check the indicated line for typos or missing symbols.',
    whyItHappens: hintEntry
      ? hintEntry.whyItHappens
      : 'The compiler found something on this line that does not follow the rules of the language.',
  };
};

/** Sort: errors come before warnings, then by line number ascending. */
const sortErrors = (errors) =>
  [...errors].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'error' ? -1 : 1;
    return (a.line ?? 9999) - (b.line ?? 9999);
  });

// ─── GCC / G++ parser ─────────────────────────────────────────────────────────

/**
 * GCC diagnostic line formats:
 *
 *   Unix    :  /tmp/file.c:LINE:COL: error: message
 *   Windows :  C:\path\file.c:LINE:COL: error: message
 *
 * Windows adds a drive-letter colon ("C:") before the path which breaks naive
 * [^:]+ regexes — we handle it with an optional leading `[A-Za-z]:\` group.
 *
 * Returns an array of structured error objects sorted errors-first.
 */
const parseGCCOutput = (stderr, language = 'c') => {
  const errors = [];
  const seen   = new Set();

  for (const line of stderr.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip decorative / non-diagnostic lines GCC emits
    if (
      /In function\s+/i.test(trimmed)       ||
      trimmed.startsWith('In file included') ||
      /^\^/.test(trimmed)                    ||   // caret pointer  ^
      /^~/.test(trimmed)                     ||   // tilde underline ~
      /^\s+[\^~]/.test(line)                 ||
      trimmed === '...'
    ) continue;

    /*
     * Primary regex — matches both Unix and Windows path formats:
     *
     *   Optional Windows drive letter:   (?:[A-Za-z]:[/\\])?
     *   Path body (no bare colon):        [^:]*
     *   LINE:COL:                         :(\d+):(\d+):
     *   severity + message:              \s*(error|warning|note):\s*(.+)$
     */
    const match = trimmed.match(
      /^(?:[A-Za-z]:[/\\])?[^:]*:(\d+):(\d+):\s*(error|warning|note):\s*(.+)$/
    );

    if (!match) continue;

    const [, lineNum, colNum, severity, rawMessage] = match;
    if (severity === 'note') continue;   // skip "note:" lines

    // Deduplicate by line + cleaned message
    const clean = toMessage(rawMessage);
    const key   = `${lineNum}:${clean}`;
    if (seen.has(key)) continue;
    seen.add(key);

    errors.push(buildError({ lineNum, colNum, severity, rawMessage: clean, language }));
  }

  return sortErrors(errors);
};

// ─── Python parser ─────────────────────────────────────────────────────────────

/**
 * Python traceback format:
 *   File "foo.py", line 5
 *     bad_code_here
 *   SyntaxError: invalid syntax
 *
 * Each error becomes: { line, column, type, message, errorName, raw, ... }
 */
const parsePythonOutput = (stderr) => {
  const errors  = [];
  const lines   = stderr.split(/\r?\n/);

  let currentLine = null;
  let currentCol  = null;

  for (const l of lines) {
    // "  File "...", line N"
    const fileMatch = l.match(/File\s+"[^"]*",\s+line\s+(\d+)/);
    if (fileMatch) {
      currentLine = parseInt(fileMatch[1], 10);
      currentCol  = null;
      continue;
    }

    // Caret line "    ^^^" — column indicator
    if (/^\s+\^/.test(l) && currentLine !== null) {
      currentCol = l.indexOf('^') + 1;
      continue;
    }

    // "ErrorType: message"
    const errMatch = l.match(/^(\w*(?:Error|Warning|Exception)):\s*(.+)$/);
    if (errMatch) {
      const [, errorType, detail] = errMatch;
      const fullMessage = `${errorType}: ${detail}`;
      const hintEntry   = matchHint(fullMessage, 'python');

      errors.push({
        line:      currentLine,
        column:    currentCol,
        type:      'error',
        message:   fullMessage,                             // ← structured "message" field
        errorName: hintEntry ? hintEntry.name : errorType,
        raw:       fullMessage,
        explanation: hintEntry
          ? hintEntry.explanation
          : `${errorType} on line ${currentLine ?? '?'}: ${detail}`,
        hint: hintEntry
          ? hintEntry.hint
          : 'Read the error message and look at the line Python points to.',
        whyItHappens: hintEntry
          ? hintEntry.whyItHappens
          : 'Python found a problem it cannot continue past.',
      });

      currentLine = null;
      currentCol  = null;
    }
  }

  return errors;
};

module.exports = { parseGCCOutput, parsePythonOutput };
