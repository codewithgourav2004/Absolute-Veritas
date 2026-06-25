import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
];

const CodeEditor = ({ value = '', onChange, language = 'html', onLanguageChange, height = 500 }) => {
  const editorRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;
    // Auto-format on mount if content exists
    if (value?.trim()) {
      setTimeout(() => editor.getAction('editor.action.formatDocument')?.run(), 300);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-white/40 font-mono">code editor</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => onLanguageChange?.(lang.value)}
                className={`px-3 py-1 text-xs font-mono transition-colors ${
                  language === lang.value
                    ? 'bg-[#0e639c] text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang.label}
              </button>
            ))}
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

      {/* Monaco Editor */}
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange?.(val ?? '')}
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
