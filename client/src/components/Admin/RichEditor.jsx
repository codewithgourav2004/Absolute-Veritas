import React, { useRef, useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../utils/api';

const FORMATS = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'align', 'blockquote', 'code-block',
  'link', 'image',
];

const WordIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const RichEditor = ({ value, onChange, placeholder }) => {
  const quillRef  = useRef(null);
  const wordRef   = useRef(null);
  const [converting,    setConverting]    = useState(false);
  const [convertError,  setConvertError]  = useState('');

  // ── image upload handler ──────────────────────────────────────────────────
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', res.data.url);
        quill.setSelection(range.index + 1);
      } catch {
        // upload failed silently — user can paste image URL via link tool
      }
    };
  };

  // ── Word (.docx) import handler ──────────────────────────────────────────
  const handleWordUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setConverting(true);
    setConvertError('');
    try {
      const mod = await import('mammoth/mammoth.browser.min');
      const mammoth = mod.default || mod;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      onChange(result.value);
    } catch {
      setConvertError('Could not read this file. Make sure it is a .docx Word document.');
    } finally {
      setConverting(false);
    }
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: { image: imageHandler },
    },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rich-editor-wrapper">
      {/* ── Word import bar ─────────────────────────────────────────────── */}
      <div className="rich-editor-word-bar flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-t-lg">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#2B579A] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[9px] font-black leading-none">W</span>
          </div>
          <p className="text-xs text-blue-700 font-medium truncate">
            {converting
              ? 'Converting Word document…'
              : 'Write directly below, or import a Word (.docx) document to fill the editor.'}
          </p>
        </div>

        <input
          ref={wordRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={handleWordUpload}
        />
        <button
          type="button"
          onClick={() => { setConvertError(''); wordRef.current?.click(); }}
          disabled={converting}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {converting ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Converting…
            </>
          ) : (
            <>
              <WordIcon />
              Upload Word
            </>
          )}
        </button>
      </div>

      {convertError && (
        <p className="text-crimson text-xs px-4 py-2 bg-red-50 border-x border-red-200">
          {convertError}
        </p>
      )}

      {/* ── Quill editor ─────────────────────────────────────────────────── */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder || 'Write content here…'}
      />
    </div>
  );
};

export default RichEditor;
