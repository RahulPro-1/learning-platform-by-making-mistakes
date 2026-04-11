/**
 * compilerService.js
 * Runs the real compiler / interpreter on submitted code and returns
 * structured errors. Uses only Node.js built-ins (no extra packages).
 *
 * C / C++  → gcc / g++
 * Python   → python -m py_compile (syntax check, safe — does NOT run code)
 */

const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseGCCOutput, parsePythonOutput } = require('../utils/errorParser');

const IS_WINDOWS = process.platform === 'win32';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Write code to a temp file and return its path + a cleanup function. */
const createTempFile = (code, ext) => {
  const uid = `cla_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const filePath = path.join(os.tmpdir(), `${uid}.${ext}`);
  fs.writeFileSync(filePath, code, 'utf-8');

  const cleanup = () => {
    try { fs.unlinkSync(filePath); } catch {}
    // Also clean up the compiled binary for C / C++
    const outPath = filePath.replace(/\.\w+$/, IS_WINDOWS ? '.exe' : '.out');
    try { fs.unlinkSync(outPath); } catch {}
  };

  return { filePath, cleanup };
};

/** Execute a shell command and resolve with { stdout, stderr, exitCode }. */
const run = (cmd, timeoutMs = 10000) =>
  new Promise((resolve) => {
    exec(cmd, { timeout: timeoutMs, windowsHide: true }, (err, stdout, stderr) => {
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: err ? (err.code ?? 1) : 0,
        timedOut: err?.killed ?? false,
      });
    });
  });

// ─── Language checkers ────────────────────────────────────────────────────────

const checkC = async (code) => {
  const { filePath, cleanup } = createTempFile(code, 'c');
  const outPath = filePath.replace(/\.c$/, IS_WINDOWS ? '.exe' : '.out');

  try {
    const result = await run(`gcc "${filePath}" -o "${outPath}" -Wall -Wextra 2>&1`);

    if (result.timedOut) {
      return { success: false, errors: [], raw: 'Compilation timed out.', compilerMissing: false };
    }

    const combined = (result.stdout + result.stderr).trim();

    if (result.exitCode === 0 && !combined) {
      return { success: true, errors: [], raw: '' };
    }

    const errors = parseGCCOutput(combined, 'c');
    return { success: errors.length === 0, errors, raw: combined };
  } catch {
    return { success: false, errors: [], raw: '', compilerMissing: true };
  } finally {
    cleanup();
  }
};

const checkCpp = async (code) => {
  const { filePath, cleanup } = createTempFile(code, 'cpp');
  const outPath = filePath.replace(/\.cpp$/, IS_WINDOWS ? '.exe' : '.out');

  try {
    const result = await run(`g++ "${filePath}" -o "${outPath}" -Wall -Wextra -std=c++17 2>&1`);

    if (result.timedOut) {
      return { success: false, errors: [], raw: 'Compilation timed out.', compilerMissing: false };
    }

    const combined = (result.stdout + result.stderr).trim();

    if (result.exitCode === 0 && !combined) {
      return { success: true, errors: [], raw: '' };
    }

    const errors = parseGCCOutput(combined, 'cpp');
    return { success: errors.length === 0, errors, raw: combined };
  } catch {
    return { success: false, errors: [], raw: '', compilerMissing: true };
  } finally {
    cleanup();
  }
};

const checkPython = async (code) => {
  const { filePath, cleanup } = createTempFile(code, 'py');

  // Try python3 first (Linux/Mac), then python (Windows)
  const cmds = IS_WINDOWS
    ? [`python -m py_compile "${filePath}" 2>&1`]
    : [`python3 -m py_compile "${filePath}" 2>&1`, `python -m py_compile "${filePath}" 2>&1`];

  try {
    for (const cmd of cmds) {
      const result = await run(cmd);

      if (result.timedOut) {
        return { success: false, errors: [], raw: 'Syntax check timed out.' };
      }

      // Exit code 0 but may still have warnings
      if (result.exitCode === 0) {
        return { success: true, errors: [], raw: '' };
      }

      const combined = (result.stdout + result.stderr).trim();
      if (combined && !combined.toLowerCase().includes('not found') && !combined.toLowerCase().includes('no such file')) {
        const errors = parsePythonOutput(combined);
        return { success: false, errors, raw: combined };
      }
    }

    return { success: false, errors: [], raw: '', compilerMissing: true };
  } catch {
    return { success: false, errors: [], raw: '', compilerMissing: true };
  } finally {
    cleanup();
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run the appropriate compiler/interpreter for the given language.
 * @param {string} code
 * @param {'c'|'cpp'|'python'} language
 * @returns {{ success: boolean, errors: object[], raw: string, compilerMissing?: boolean }}
 */
const checkCode = async (code, language) => {
  switch (language) {
    case 'c':      return checkC(code);
    case 'cpp':    return checkCpp(code);
    case 'python': return checkPython(code);
    default:
      return { success: false, errors: [], raw: `Unsupported language: ${language}` };
  }
};

// ─── Run code and capture output ─────────────────────────────────────────────

/** Execute a shell command with optional stdin piped in. */
const runWithStdin = (cmd, stdin = '', timeoutMs = 8000) =>
  new Promise((resolve) => {
    const child = require('child_process').exec(
      cmd,
      { timeout: timeoutMs, windowsHide: true },
      (err, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: err ? (err.code ?? 1) : 0,
          timedOut: err?.killed ?? false,
        });
      }
    );
    if (stdin && child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });

/**
 * Compile and run C/C++/Python code, returning stdout/stderr output.
 * @param {string} code
 * @param {'c'|'cpp'|'python'} language
 * @param {string} stdin  — optional input to pipe into the program
 * @returns {{ stdout, stderr, exitCode, timedOut, compileError, compilerMissing }}
 */
const runCode = async (code, language, stdin = '') => {
  if (language === 'python') {
    const { filePath, cleanup } = createTempFile(code, 'py');
    const cmds = IS_WINDOWS
      ? [`python "${filePath}"`]
      : [`python3 "${filePath}"`, `python "${filePath}"`];

    try {
      for (const cmd of cmds) {
        const result = await runWithStdin(cmd, stdin);
        if (result.timedOut) {
          return { stdout: '', stderr: 'Execution timed out (8 s limit).', exitCode: 1, timedOut: true };
        }
        const combined = result.stdout + result.stderr;
        if (combined || result.exitCode === 0) {
          return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode, timedOut: false };
        }
      }
      return { stdout: '', stderr: '', exitCode: 1, compilerMissing: true };
    } finally {
      cleanup();
    }
  }

  // C / C++
  const ext     = language === 'cpp' ? 'cpp' : 'c';
  const compiler = language === 'cpp' ? 'g++' : 'gcc';
  const flags   = language === 'cpp' ? '-std=c++17' : '';
  const { filePath, cleanup } = createTempFile(code, ext);
  const outPath = filePath.replace(/\.\w+$/, IS_WINDOWS ? '.exe' : '.out');

  try {
    // Step 1: compile
    const compile = await run(`${compiler} "${filePath}" -o "${outPath}" ${flags} 2>&1`);
    if (compile.exitCode !== 0) {
      return {
        stdout: '',
        stderr: (compile.stdout + compile.stderr).trim(),
        exitCode: compile.exitCode,
        timedOut: false,
        compileError: true,
      };
    }

    // Step 2: execute
    const execResult = await runWithStdin(`"${outPath}"`, stdin);
    if (execResult.timedOut) {
      return { stdout: '', stderr: 'Execution timed out (8 s limit).', exitCode: 1, timedOut: true };
    }
    return {
      stdout: execResult.stdout,
      stderr: execResult.stderr,
      exitCode: execResult.exitCode,
      timedOut: false,
    };
  } catch {
    return { stdout: '', stderr: '', exitCode: 1, compilerMissing: true };
  } finally {
    cleanup();
  }
};

module.exports = { checkCode, runCode };
