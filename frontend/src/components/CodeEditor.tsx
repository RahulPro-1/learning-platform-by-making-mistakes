import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Language, CompilerError } from '../types';
import type * as Monaco from 'monaco-editor';

interface Props {
  code: string;
  language: Language;
  realtimeErrors: CompilerError[];
  onChange: (value: string) => void;
}

const MONACO_LANGUAGE: Record<Language, string> = {
  python: 'python',
  c: 'c',
  cpp: 'cpp',
};

function CodeEditor({ code, language, realtimeErrors, onChange }: Props) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationsRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Apply error squiggles whenever realtimeErrors changes
  if (editorRef.current && monacoRef.current) {
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();

    if (model) {
      const markers: Monaco.editor.IMarkerData[] = realtimeErrors
        .filter((e) => e.line !== null)
        .map((e) => ({
          severity:
            e.type === 'warning'
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Error,
          startLineNumber: e.line!,
          startColumn: e.column ?? 1,
          endLineNumber: e.line!,
          endColumn: model.getLineMaxColumn(e.line!),
          message: e.raw,
        }));

      monaco.editor.setModelMarkers(model, 'realtime-check', markers);
    }

    // Decorations for lines without column info
    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = realtimeErrors
      .filter((e) => e.line !== null && e.column === null)
      .map((e) => ({
        range: new monaco.Range(e.line!, 1, e.line!, 1),
        options: {
          isWholeLine: true,
          className: 'error-line-highlight',
          glyphMarginClassName: 'error-glyph',
        },
      }));

    if (decorationsRef.current) {
      decorationsRef.current.set(newDecorations);
    } else if (newDecorations.length > 0) {
      decorationsRef.current = editorRef.current.createDecorationsCollection(newDecorations);
    }
  }

  return (
    <Editor
      height="100%"
      language={MONACO_LANGUAGE[language]}
      value={code}
      onChange={(value) => onChange(value ?? '')}
      theme="vs-dark"
      onMount={handleMount}
      options={{
        fontSize: 15,
        fontFamily: "'Fira Code', 'Consolas', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 4,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        renderLineHighlight: 'line',
        glyphMargin: true,
      }}
    />
  );
}

export default CodeEditor;
