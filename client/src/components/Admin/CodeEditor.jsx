import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'javascript', label: 'JS'   },
];

const CodeEditor = ({
  // ── Single-mode (backward-compatible) ─────────────────────────────────────
  value = '',
  onChange,
  language = 'html',
  onLanguageChange,
  height = 500,
  // ── Multi-mode (separate HTML / CSS / JS tabs) ─────────────────────────────
  multiMode = false,
  htmlValue = '',
  cssValue  = '',
  jsValue   = '',
  onMultiChange,        // ({ html, css, js }) => void
}) => {
  const editorRef = useRef(null);
  const [activeLang, setActiveLang] = useState('html');
  const [multiContent, setMultiContent] = useState({
    html: htmlValue,
    css:  cssValue,
    js:   jsValue,
  });

  // Sync when parent pushes new values (file / Word upload)
  useEffect(() => {
    if (!multiMode) return;
    setMultiContent({ html: htmlValue, css: cssValue, js: jsValue });
  }, [multiMode, htmlValue, cssValue, jsValue]);

  const currentValue = multiMode ? multiContent[activeLang] : value;
  const currentLang  = multiMode ? activeLang : language;

  const handleMount = (editor) => {
    editorRef.current = editor;
    if (currentValue?.trim()) {
      setTimeout(() => editor.getAction('editor.action.formatDocument')?.run(), 300);
    }
  };

  const handleChange = (val) => {
    if (multiMode) {
      const updated = { ...multiContent, [activeLang]: val ?? '' };
      setMultiContent(updated);
      onMultiChange?.(updated);
    } else {
      onChange?.(val ?? '');
    }
  };

  const handleTabSwitch = (lang) => {
    if (multiMode) setActiveLang(lang);
    else onLanguageChange?.(lang);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-white/40 font-mono">
            {multiMode ? 'html + css + js' : 'code editor'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language tabs */}
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {LANGUAGES.map((lang) => {
              const hasContent = multiMode && !!multiContent[lang.value]?.trim();
              return (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => handleTabSwitch(lang.value)}
                  className={`relative px-3 py-1 text-xs font-mono transition-colors ${
                    currentLang === lang.value
                      ? 'bg-[#0e639c] text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang.label}
                  {hasContent && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Format button */}
          <button
            type="button"
            onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
            className="text-xs text-white/50 hover:text-white font-mono px-2 py-1 rounded hover:bg-white/10 transition-colors"
            title="Format document"
          >
            ⌥F Format
          </button>
        </div>
      </div>

      {/* Monaco Editor — key forces remount on language switch for correct syntax highlighting */}
      <Editor
        key={currentLang}
        height={height}
        language={currentLang}
        value={currentValue}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          fontSize: 13,
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          renderLineHighlight: 'gutter',
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: false,
          suggestOnTriggerCharacters: true,
          quickSuggestions: { other: true, comments: false, strings: true },
          parameterHints: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          colorDecorators: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
