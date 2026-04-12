import { useState, useCallback } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import LanguageSelector from './components/LanguageSelector';
import DifficultySelector from './components/DifficultySelector';
import OutputPanel from './components/OutputPanel';
import SamplePicker from './components/SamplePicker';
import PracticePanel from './components/PracticePanel';
import ProgressBar from './components/ProgressBar';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { useRealtimeCheck } from './hooks/useRealtimeCheck';
import { analyzeCode, runCode } from './api/analyze';
import { updateProgress } from './api/progress';
import { Language, Difficulty, AnalysisResult, RunResult } from './types';

const DEFAULT_CODE: Record<Language, string> = {
  python: `# Write your Python code here
def greet(name):
    print("Hello, " + name)

greet("World")`,
  c: `// Write your C code here
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
};

type SideTab = 'output' | 'practice';

function App() {
  const { user, loading: authLoading, logout } = useAuth();

  const [language, setLanguage]     = useState<Language>('python');
  const [difficulty, setDifficulty] = useState<Difficulty>('basic');
  const [code, setCode]             = useState(DEFAULT_CODE.python);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<AnalysisResult | null>(null);
  const [apiError, setApiError]       = useState('');
  const [sideTab, setSideTab]         = useState<SideTab>('output');
  const [runResult, setRunResult]     = useState<RunResult | null>(null);
  const [runLoading, setRunLoading]   = useState(false);
  const [stdin, setStdin]             = useState('');
  const [realtimeOn, setRealtimeOn] = useState(true);
  const [showAuth, setShowAuth]     = useState(false);
  const [completedPractice, setCompletedPractice] = useState<string[]>([]);

  const { realtimeErrors, isChecking: isRealtimeChecking } =
    useRealtimeCheck(code, language, realtimeOn);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setResult(null);
    setApiError('');
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) { setApiError('Please write some code before analyzing!'); return; }
    setLoading(true);
    setApiError('');
    setResult(null);
    setSideTab('output');

    try {
      const data = await analyzeCode(code, language, difficulty);
      setResult(data);

      // Update progress if logged in
      if (user) {
        await updateProgress({
          language,
          analysisCompleted: true,
          errorsFound: data.compilerErrors.length,
        }).catch(() => {}); // non-critical
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not connect to the server. Make sure the backend is running on port 5000.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunLoading(true);
    setRunResult(null);
    setSideTab('output');
    try {
      const data = await runCode(code, language, stdin);
      setRunResult(data);
    } catch {
      setRunResult({ stdout: '', stderr: 'Could not connect to the server.', exitCode: 1, timedOut: false, compileError: false, compilerMissing: false });
    } finally {
      setRunLoading(false);
    }
  };

  const handleMarkPracticeDone = useCallback(async (id: string) => {
    setCompletedPractice((prev) => [...prev, id]);
    if (user) {
      await updateProgress({ practiceId: id }).catch(() => {});
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="pulse-loader">
          <div className="pulse-circle" /><div className="pulse-circle" /><div className="pulse-circle" />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header user={user} onAuthClick={() => setShowAuth(true)} onLogout={logout} />

      {user && <ProgressBar key={result?.difficulty} />}

      <main className="main-layout">
        {/* ── Left: Editor Panel ───────────────────────────────── */}
        <section className="editor-panel">
          <div className="panel-header">
            <h2 className="panel-title">Your Code</h2>
            <div className="editor-controls">
              <LanguageSelector language={language} onChange={handleLanguageChange} />
              <SamplePicker language={language} onSelect={setCode} />
              <label className="realtime-toggle" title="Check for errors while you type">
                <input
                  type="checkbox"
                  checked={realtimeOn}
                  onChange={(e) => setRealtimeOn(e.target.checked)}
                />
                <span>Live check</span>
              </label>
            </div>
          </div>

          <div className="difficulty-bar">
            <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
            <div className="btn-group">
              <button
                className={`run-btn ${runLoading ? 'loading' : ''}`}
                onClick={handleRun}
                disabled={runLoading || loading}
                title="Compile and run your code"
              >
                {runLoading ? (
                  <><span className="spinner" /> Running...</>
                ) : (
                  <><span className="btn-icon">▶</span> Run Code</>
                )}
              </button>
              <button
                className={`analyze-btn ${loading ? 'loading' : ''}`}
                onClick={handleAnalyze}
                disabled={loading || runLoading}
              >
                {loading ? (
                  <><span className="spinner" /> Analyzing...</>
                ) : (
                  <><span className="btn-icon">🔍</span> Analyze</>
                )}
              </button>
            </div>
          </div>

          <div className="editor-wrapper">
            <CodeEditor
              code={code}
              language={language}
              realtimeErrors={realtimeErrors}
              onChange={setCode}
            />
          </div>

          {/* stdin input */}
          <div className="stdin-bar">
            <label className="stdin-label" htmlFor="stdin-input">
              Program Input <span className="stdin-hint">(stdin — leave empty if not needed)</span>
            </label>
            <textarea
              id="stdin-input"
              className="stdin-input"
              rows={2}
              placeholder="e.g.  5  or  Alice  — values your program reads with scanf / input()"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>
        </section>

        {/* ── Right: Output / Practice tabs ─────────────────────── */}
        <section className="output-panel">
          <div className="panel-header">
            <div className="side-tabs">
              <button
                className={`side-tab ${sideTab === 'output' ? 'active' : ''}`}
                onClick={() => setSideTab('output')}
              >
                📋 Analysis
              </button>
              <button
                className={`side-tab ${sideTab === 'practice' ? 'active' : ''}`}
                onClick={() => setSideTab('practice')}
              >
                🏋️ Practice
              </button>
            </div>
          </div>

          <div className="panel-scroll">
            {sideTab === 'output' ? (
              <OutputPanel
                result={result}
                realtimeErrors={realtimeErrors}
                error={apiError}
                loading={loading}
                isRealtimeChecking={isRealtimeChecking}
                realtimeEnabled={realtimeOn}
                runResult={runResult}
                runLoading={runLoading}
                stdin={stdin}
              />
            ) : (
              <PracticePanel
                language={language}
                difficulty={difficulty}
                completedIds={completedPractice}
                onLoad={setCode}
                onMarkDone={handleMarkPracticeDone}
              />
            )}
          </div>
        </section>
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default App;
