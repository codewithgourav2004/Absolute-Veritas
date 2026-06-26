import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';

// ── Ribbon CSS (injected once into <head>) ────────────────────────────────────
const RIBBON_CSS = `
.ribbon-editor-content .ProseMirror {
  outline: none;
  min-height: 300px;
  font-family: Calibri, "Calibri Body", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #000;
}
.ribbon-editor-content .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: .6em 0 .3em; line-height: 1.2; }
.ribbon-editor-content .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: .6em 0 .3em; line-height: 1.25; }
.ribbon-editor-content .ProseMirror h3 { font-size: 1.17em; font-weight: 700; margin: .6em 0 .3em; }
.ribbon-editor-content .ProseMirror p  { margin: 0 0 .6em; }
.ribbon-editor-content .ProseMirror ul { list-style: disc; padding-left: 1.5em; margin: .5em 0; }
.ribbon-editor-content .ProseMirror ol { list-style: decimal; padding-left: 1.5em; margin: .5em 0; }
.ribbon-editor-content .ProseMirror li { margin: .2em 0; }
.ribbon-editor-content .ProseMirror blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1em;
  color: #6b7280;
  margin: .8em 0;
  font-style: italic;
}
.ribbon-editor-content .ProseMirror a { color: #2563eb; text-decoration: underline; }
.ribbon-editor-content .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1em 0; }
.ribbon-editor-content .ProseMirror code {
  background: #f3f4f6; border-radius: 3px; padding: 0 3px; font-size: .9em;
}
.ribbon-editor-content .ProseMirror pre {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px; padding: 12px 16px;
  font-size: 13px; overflow-x: auto; margin: .8em 0;
}
.ribbon-editor-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
`;

let ribbonStyleInjected = false;
function injectRibbonStyles() {
  if (ribbonStyleInjected) return;
  const tag = document.createElement('style');
  tag.textContent = RIBBON_CSS;
  document.head.appendChild(tag);
  ribbonStyleInjected = true;
}

// ── Tiny SVG icons ────────────────────────────────────────────────────────────
const Ico = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  bold:       'M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z',
  italic:     'M19 4h-9M14 20H5M15 4L9 20',
  underline:  'M6 3v7a6 6 0 006 6 6 6 0 006-6V3M4 21h16',
  strike:     'M17.3 12H6.7M10 8.4C10 7.1 11 6 12.3 6c.5 0 1 .1 1.3.4M14 15.6c0 1.3-1 2.4-2.3 2.4-.6 0-1.1-.2-1.4-.5',
  h1:         'M4 12h16M4 6h6M4 18h6',
  h2:         'M4 12h10M4 6h6M4 18h6',
  h3:         'M4 12h8M4 6h6M4 18h6',
  alignL:     'M21 6H3M15 12H3M17 18H3',
  alignC:     'M21 6H3M17 12H7M19 18H5',
  alignR:     'M21 6H3M21 12H9M21 18H11',
  alignJ:     'M21 6H3M21 12H3M21 18H3',
  bullet:     'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  ordered:    'M10 6h11M10 12h11M10 18h11M4 6v4M4 6l2-1M6 18H4l2.5-3A1.5 1.5 0 004 13',
  indent:     'M3 8h18M3 16h18M8 12h10M8 12l-4 4m4-4l-4-4',
  outdent:    'M3 8h18M3 16h18M6 12h10M6 12l-4 4m4-4l-4-4',
  link:       'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  unlink:     'M18.84 12.25l1.72-1.71a5 5 0 00-7.07-7.07l-1.72 1.71M16 12l-8 8M5.16 11.75l-1.72 1.71a5 5 0 007.07 7.07l1.71-1.71M8 12l8-8',
  quote:      'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
  clear:      'M6.5 6.5l11 11M4 7v13h13M7 4h13v13',
  undo:       'M3 7v6h6M3.51 15A9 9 0 1021 12',
  redo:       'M21 7v6h-6M20.49 15A9 9 0 113 12',
  separator:  '',
};

// ── Toolbar atoms ─────────────────────────────────────────────────────────────
const Btn = ({ onClick, active, title, disabled, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
    className={`
      flex items-center justify-center w-7 h-7 rounded transition-all text-[13px]
      ${active
        ? 'bg-blue-100 text-blue-700 border border-blue-400 shadow-inner'
        : 'text-gray-700 hover:bg-gray-200 border border-transparent'}
      disabled:opacity-30 disabled:cursor-not-allowed
    `}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-gray-300 mx-0.5 flex-shrink-0" />;

const GroupLabel = ({ label }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-0.5 flex-wrap justify-center">{/* slot filled by children via wrapper */}</div>
    <span className="text-[9px] text-gray-400 mt-0.5 leading-none tracking-wide uppercase">{label}</span>
  </div>
);

// Wrapper that stacks buttons + label like a Word ribbon group
const Group = ({ label, children }) => (
  <div className="flex flex-col items-center px-2 border-r border-gray-200 last:border-r-0">
    <div className="flex items-center gap-0.5 flex-wrap justify-center pb-0.5">{children}</div>
    <span className="text-[9px] text-gray-400 leading-none tracking-wide uppercase whitespace-nowrap">{label}</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const RibbonEditor = ({ value = '', onChange, minHeight = 380 }) => {
  const colorInputRef = useRef(null);
  const highlightInputRef = useRef(null);

  useEffect(() => { injectRibbonStyles(); }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'ribbon-link', rel: 'noopener noreferrer' },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync incoming value changes (mode switches)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const incoming = value || '';
    const current  = editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming, false);
    }
  }, [value]); // eslint-disable-line

  const handleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('Enter URL (e.g. https://example.com):');
    if (url && url.trim()) {
      editor.chain().focus().setLink({ href: url.trim() }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const can = editor.can();

  return (
    <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm flex flex-col">
      {/* ── Tab bar ── */}
      <div className="bg-[#f0f0f0] border-b border-gray-300 flex items-center px-3 pt-1 gap-1">
        <button className="text-[12px] font-semibold text-blue-700 border-b-2 border-blue-600 px-3 pb-1 -mb-px bg-white rounded-t-md shadow-sm">
          Home
        </button>
        <button className="text-[12px] text-gray-500 hover:text-gray-700 px-3 pb-1">Insert</button>
        <button className="text-[12px] text-gray-500 hover:text-gray-700 px-3 pb-1">Format</button>
      </div>

      {/* ── Ribbon toolbar ── */}
      <div className="bg-white border-b border-gray-200 px-2 py-1.5 flex items-stretch gap-0 overflow-x-auto flex-shrink-0">

        {/* Clipboard group */}
        <Group label="Clipboard">
          <Btn title="Undo (Ctrl+Z)" disabled={!can.undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Ico d={icons.undo} />
          </Btn>
          <Btn title="Redo (Ctrl+Y)" disabled={!can.redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Ico d={icons.redo} />
          </Btn>
        </Group>

        {/* Font group */}
        <Group label="Font">
          <Btn title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/></svg>
          </Btn>
          <Btn title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 4h-9M14 20H5M15 4L9 20" strokeLinecap="round"/></svg>
          </Btn>
          <Btn title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0012 0V3M4 21h16" strokeLinecap="round"/></svg>
          </Btn>
          <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12H4" strokeLinecap="round"/><path d="M10 8.5C10 7.1 11 6 12.5 6c.8 0 1.5.3 1.9.8" strokeLinecap="round"/><path d="M14.5 15.5c0 1.4-1.1 2.5-2.5 2.5-1 0-1.8-.5-2.2-1.3" strokeLinecap="round"/></svg>
          </Btn>

          {/* Text color */}
          <div className="relative" title="Text Color">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click(); }}
              className="flex flex-col items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-all border border-transparent"
            >
              <span className="text-[13px] font-bold leading-none text-gray-800">A</span>
              <div className="w-4 h-[3px] rounded-sm mt-0.5 bg-red-500" />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              defaultValue="#e63946"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            />
          </div>

          {/* Highlight */}
          <div className="relative" title="Highlight Color">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); highlightInputRef.current?.click(); }}
              className={`flex flex-col items-center justify-center w-7 h-7 rounded hover:bg-gray-200 transition-all border ${editor.isActive('highlight') ? 'border-blue-400 bg-blue-50' : 'border-transparent'}`}
            >
              <span className="text-[11px] font-bold leading-none" style={{ background: '#fef08a', padding: '0 2px' }}>ab</span>
              <div className="w-4 h-[3px] rounded-sm mt-0.5 bg-yellow-400" />
            </button>
            <input
              ref={highlightInputRef}
              type="color"
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              defaultValue="#fef08a"
              onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            />
          </div>
        </Group>

        {/* Styles group */}
        <Group label="Styles">
          {[
            { label: 'Normal', action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive('paragraph') && !editor.isActive('heading') },
            { label: 'H1',     action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
            { label: 'H2',     action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
            { label: 'H3',     action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
          ].map(({ label, action, active }) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); action(); }}
              className={`px-2.5 h-7 text-[11px] font-semibold rounded border transition-all
                ${active
                  ? 'bg-blue-100 border-blue-400 text-blue-800'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }`}
            >
              {label}
            </button>
          ))}
        </Group>

        {/* Paragraph group */}
        <Group label="Paragraph">
          {/* Alignment */}
          <Btn title="Align Left"    active={editor.isActive({ textAlign: 'left' })}    onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 6H3M15 12H3M17 18H3" strokeLinecap="round"/></svg>
          </Btn>
          <Btn title="Center"        active={editor.isActive({ textAlign: 'center' })}  onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 6H3M17 12H7M19 18H5" strokeLinecap="round"/></svg>
          </Btn>
          <Btn title="Align Right"   active={editor.isActive({ textAlign: 'right' })}   onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 6H3M21 12H9M21 18H11" strokeLinecap="round"/></svg>
          </Btn>
          <Btn title="Justify"       active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 6H3M21 12H3M21 18H3" strokeLinecap="round"/></svg>
          </Btn>

          <Sep />

          {/* Lists */}
          <Btn title="Bullet List"   active={editor.isActive('bulletList')}   onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>
          </Btn>
          <Btn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 6h11M10 12h11M10 18h11" strokeLinecap="round"/><path d="M4 6v4M4 6l2-1" strokeLinecap="round"/><path d="M6 18H4l2.5-3A1.5 1.5 0 004 13" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Btn>

          <Sep />

          {/* Indent / Outdent */}
          <Btn title="Increase Indent" disabled={!can.sinkListItem('listItem')} onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h18M3 16h18M9 12h9" strokeLinecap="round"/><path d="M3 12l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Btn>
          <Btn title="Decrease Indent" disabled={!can.liftListItem('listItem')} onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h18M3 16h18M9 12h9" strokeLinecap="round"/><path d="M9 12l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Btn>
        </Group>

        {/* Insert group */}
        <Group label="Insert">
          <Btn title={editor.isActive('link') ? 'Remove Link' : 'Insert Link'} active={editor.isActive('link')} onClick={handleLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {editor.isActive('link')
                ? <><path d="M18.84 12.25l1.72-1.71"/><path d="M5.16 11.75l-1.72 1.71"/><path d="M3.05 7.05L7 3M17 21l3.95-3.95M9 15l-5.95 5.95M14.95 3.05L21 9.1"/></>
                : <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>
              }
            </svg>
          </Btn>
          <Btn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
          </Btn>
          <Btn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" strokeLinecap="round"/></svg>
          </Btn>
          <Btn title="Clear Formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M6 12h9.5"/><path d="M14 6H5l4 6"/>
            </svg>
          </Btn>
        </Group>
      </div>

      {/* ── Editor area (Word-like white page) ── */}
      <div className="bg-[#737373] flex-1 flex justify-center py-6 px-4 overflow-auto" style={{ minHeight: minHeight }}>
        <div
          className="bg-white shadow-xl w-full max-w-[800px] ribbon-editor-content"
          style={{ padding: '48px 64px', minHeight: minHeight }}
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default RibbonEditor;
