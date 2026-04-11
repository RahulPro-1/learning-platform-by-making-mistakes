import { useState } from 'react';
import { AnalysisResult, CompilerError, RunResult } from '../types';

interface Props {
  result: AnalysisResult | null;
  realtimeErrors: CompilerError[];
  error: string;
  loading: boolean;
  isRealtimeChecking: boolean;
  realtimeEnabled: boolean;
  runResult: RunResult | null;
  runLoading: boolean;
}

const TYPE_BADGE: Record<string, string> = {
  error:        'badge-error',
  warning:      'badge-warning',
  'ai-detected':'badge-ai',
};

const TYPE_LABEL: Record<string, string> = {
  error:        'Error',
  warning:      'Warning',
  'ai-detected':'Logic',
};

function ErrorCard({ err }: { err: CompilerError }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="error-card" onClick={() => setOpen((o) => !o)}>
      <div className="error-card-header">
        <div className="error-card-left">
          <span className={`err-badge ${TYPE_BADGE[err.type] ?? 'badge-error'}`}>
            {TYPE_LABEL[err.type] ?? err.type}
          </span>
          {err.line && <span className="err-line">Line {err.line}</span>}
          <span className="err-raw">{err.raw}</span>
        </div>
        <span className="err-toggle">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="error-card-body">
          <div className="err-section">
            <span className="err-section-icon">💡</span>
            <div>
              <p className="err-section-title">What it means</p>
              <p className="err-section-text">{err.explanation}</p>
            </div>
          </div>
          <div className="err-section">
            <span className="err-section-icon">🎯</span>
            <div>
              <p className="err-section-title">Hint</p>
              <p className="err-section-text">{err.hint}</p>
            </div>
          </div>
          {err.whyItHappens && (
            <div className="err-section">
              <span className="err-section-icon">🔍</span>
              <div>
                <p className="err-section-title">Why this happens</p>
                <p className="err-section-text">{err.whyItHappens}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function RunOutputPanel({ runResult, runLoading }: { runResult: RunResult | null; runLoading: boolean }) {
  if (runLoading) {
    return (
      <div className="run-output-card">
        <div className="run-output-header">
          <span className="run-output-icon">▶</span>
          <span className="run-output-title">Running...</span>
          <span className="spinner run-spinner" />
        </div>
      </div>
    );
  }
  if (!runResult) return null;

  const { stdout, stderr, exitCode, timedOut, compileError, compilerMissing } = runResult;

  let statusIcon = '🟢';
  let statusText = `Exited with code ${exitCode}`;
  if (timedOut)        { statusIcon = '⏱️'; statusText = 'Timed out (8 s limit)'; }
  else if (compilerMissing) { statusIcon = '⚠️'; statusText = 'Compiler not found on this machine'; }
  else if (compileError)    { statusIcon = '🔴'; statusText = 'Compilation failed'; }
  else if (exitCode !== 0)  { statusIcon = '🔴'; statusText = `Exited with code ${exitCode}`; }

  return (
    <div className="run-output-card">
      <div className="run-output-header">
        <span className="run-output-icon">▶</span>
        <span className="run-output-title">Run Output</span>
        <span className="run-status">{statusIcon} {statusText}</span>
      </div>

      {stdout && (
        <div className="run-section">
          <p className="run-section-label">stdout</p>
          <pre className="run-terminal">{stdout}</pre>
        </div>
      )}

      {stderr && (
        <div className="run-section">
          <p className="run-section-label run-section-err">stderr</p>
          <pre className="run-terminal run-terminal-err">{stderr}</pre>
        </div>
      )}

      {!stdout && !stderr && (
        <pre className="run-terminal run-terminal-empty">(no output)</pre>
      )}
    </div>
  );
}

function OutputPanel({ result, realtimeErrors, error, loading, isRealtimeChecking, realtimeEnabled, runResult, runLoading }: Props) {
  if (loading) {
    return (
      <div className="output-state">
        <div className="pulse-loader">
          <div className="pulse-circle" />
          <div className="pulse-circle" />
          <div className="pulse-circle" />
        </div>
        <p className="state-text">Analyzing your code with AI...</p>
        <p className="state-subtext">This usually takes a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="output-state">
        <div className="state-icon error-icon">⚠</div>
        <p className="state-text">Something went wrong</p>
        <p className="state-subtext error-msg">{error}</p>
      </div>
    );
  }

  // Show real-time errors while waiting for a full analysis
  if (!result) {
    return (
      <div className="output-state-idle">
        <RunOutputPanel runResult={runResult} runLoading={runLoading} />
        {realtimeEnabled && realtimeErrors.length > 0 ? (
          <>
            <p className="realtime-header">
              <span className="realtime-dot" />
              Live check — {realtimeErrors.length} issue{realtimeErrors.length !== 1 ? 's' : ''} found
            </p>
            <ul className="error-list">
              {realtimeErrors.map((e, i) => <ErrorCard key={i} err={e} />)}
            </ul>
          </>
        ) : (
          <>
            <div className="state-icon">💻</div>
            <p className="state-text">Ready to analyze!</p>
            <p className="state-subtext">
              Write your code, choose a language and difficulty, then click{' '}
              <strong>Analyze Code</strong>.
              {realtimeEnabled && <><br /><em>Live error detection is active.</em></>}
            </p>
          </>
        )}
        {isRealtimeChecking && (
          <p className="realtime-checking">⟳ Checking...</p>
        )}
      </div>
    );
  }

  const hasErrors = result.hasCompilerErrors;

  return (
    <div className="output-results">
      <RunOutputPanel runResult={runResult} runLoading={runLoading} />

      {result.aiUnavailable && (
        <div className="ai-unavailable-notice">
          ⚠️ AI explanation is unavailable. Compiler results are shown below.
        </div>
      )}
      {/* Compiler / AI Errors */}
      <div className={`result-card ${hasErrors ? 'card-error' : 'card-success'}`}>
        <div className="card-header">
          <span className="card-icon">{hasErrors ? '🔴' : '🟢'}</span>
          <h3 className="card-title">
            {hasErrors
              ? `${result.compilerErrors.length} Issue${result.compilerErrors.length !== 1 ? 's' : ''} Found`
              : 'No Errors — Great Job!'}
          </h3>
          {result.compilerMissing && (
            <span className="compiler-missing-badge" title="GCC/Python not found — AI analysis only">
              AI only
            </span>
          )}
        </div>

        {hasErrors ? (
          <ul className="error-list">
            {result.compilerErrors.map((e, i) => (
              <ErrorCard key={i} err={e} />
            ))}
          </ul>
        ) : (
          <p className="result-text success-msg">
            Your code compiled successfully. Keep it up! 🎉
          </p>
        )}
      </div>

      {/* Explanation */}
      <div className="result-card card-info">
        <div className="card-header">
          <span className="card-icon">💡</span>
          <h3 className="card-title">What Your Code Does</h3>
        </div>
        <p className="result-text">{result.explanation}</p>
      </div>

      {/* Hints */}
      {result.hints.length > 0 && (
        <div className="result-card card-hint">
          <div className="card-header">
            <span className="card-icon">🎯</span>
            <h3 className="card-title">Tips to Improve</h3>
          </div>
          <ul className="result-list">
            {result.hints.map((hint, i) => (
              <li key={i} className="result-item">
                <span className="hint-number">{i + 1}</span>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OutputPanel;
