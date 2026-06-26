import React, { useState, useRef, useEffect, useCallback } from 'react';
import { parseHtmlCssJs, combineHtmlCssJs, buildMultiPreview } from '../utils/htmlCssJs';
import RibbonEditor from '../components/Admin/RibbonEditor';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import AdminLayout from '../components/Admin/AdminLayout';
import CodeEditor from '../components/Admin/CodeEditor';
import normalizeImg from '../utils/normalizeImg';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const NEWS_CATEGORIES = ['General', 'BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE', 'FCC', 'IT Compliance'];

const toHtml = (text) =>
  text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n');

// ── PdfDropZone ───────────────────────────────────────────────────────────────
const PdfDropZone = ({ onFile, onBrowse, uploading, currentLink }) => {
  const [dragging, setDragging] = React.useState(false);
  const [dragError, setDragError] = React.useState('');

  const isUploaded = currentLink && (
    currentLink.startsWith('/uploads/') ||
    currentLink.includes('cloudinary.com') ||
    currentLink.includes('res.cloudinary')
  );
  const filename = currentLink
    ? currentLink.split('/').pop().split('?')[0] || 'uploaded-file.pdf'
    : '';

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setDragError('');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setDragError('Only PDF files are allowed.');
      return;
    }
    onFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  if (uploading) {
    return (
      <div className="border-2 border-dashed border-indigo/30 rounded-xl bg-indigo/5 px-6 py-10 flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin w-8 h-8 text-indigo/50" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-indigo/60 text-sm font-medium">Uploading PDF…</p>
      </div>
    );
  }

  if (isUploaded) {
    return (
      <div className="border-2 border-green-300 rounded-xl bg-green-50 px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-green-800 font-semibold text-sm truncate">{filename}</p>
            <p className="text-green-600 text-xs">PDF uploaded successfully</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBrowse}
          className="flex-shrink-0 text-xs text-green-700 border border-green-300 hover:bg-green-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
        >
          Replace
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={onBrowse}
        className={`
          relative border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-crimson bg-crimson/5 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-indigo hover:bg-indigo/5'}
        `}
      >
        {/* PDF icon */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors pointer-events-none"
             style={{ background: dragging ? 'rgba(230,57,70,0.1)' : 'rgba(26,31,60,0.07)' }}>
          <svg className={`w-7 h-7 ${dragging ? 'text-crimson' : 'text-indigo/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="text-center pointer-events-none">
          <p className={`font-semibold text-sm mb-1 ${dragging ? 'text-crimson' : 'text-indigo'}`}>
            {dragging ? 'Drop the PDF here' : 'Drag & drop your PDF here'}
          </p>
          <p className="text-steel text-xs">
            or{' '}
            <span className="text-crimson font-semibold underline">click to browse</span>
            {' '}from your computer
          </p>
          <p className="text-gray-400 text-xs mt-1.5">PDF only · Max 50 MB</p>
        </div>

        {dragging && (
          <div className="absolute inset-0 rounded-xl border-2 border-crimson pointer-events-none" />
        )}
      </div>
      {dragError && (
        <p className="text-crimson text-xs mt-1.5">{dragError}</p>
      )}
    </div>
  );
};

// ── NewsletterForm ────────────────────────────────────────────────────────────
const NewsletterForm = ({ initial, onSaved, onCancel }) => {
  const qc = useQueryClient();
  const fileRef    = useRef(null);
  const pdfFileRef = useRef(null);
  const [preview,      setPreview]      = useState(initial?.coverImage || '');
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadErr, setPdfUploadErr] = useState('');
  const [nlEditorMode,  setNlEditorMode]  = useState('rich');
  const [nlRichContent, setNlRichContent] = useState('');
  const [nlHtml,        setNlHtml]        = useState('');
  const [nlCss,         setNlCss]         = useState('');
  const [nlJs,          setNlJs]          = useState('');
  const [nlShowPreview, setNlShowPreview] = useState(false);

  useEffect(() => {
    const raw = initial?.content || '';
    if (raw) {
      const hasCode = /<style|<script/i.test(raw);
      if (hasCode) {
        const { html, css, js } = parseHtmlCssJs(raw);
        setNlHtml(html); setNlCss(css); setNlJs(js);
        setNlEditorMode('code');
      } else {
        setNlRichContent(raw);
        setNlEditorMode('rich');
      }
    }
  }, []); // eslint-disable-line

  const handleNlModeSwitch = (mode) => {
    if (mode === nlEditorMode) return;
    if (mode === 'code') {
      setNlHtml(nlRichContent); setNlCss(''); setNlJs('');
    } else {
      if ((nlCss.trim() || nlJs.trim()) && !window.confirm('Switching to Rich Text will discard your CSS and JS code. Continue?')) return;
      setNlRichContent(nlHtml);
    }
    setNlEditorMode(mode); setNlShowPreview(false);
  };

  const getNlContent = () => nlEditorMode === 'rich' ? nlRichContent : combineHtmlCssJs(nlHtml, nlCss, nlJs);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title:       initial?.title || '',
      edition:     initial?.edition || '',
      month:       initial?.month || 'January',
      year:        initial?.year || new Date().getFullYear(),
      excerpt:     initial?.excerpt || '',
      coverImage:  initial?.coverImage || '',
      pdfLink:     initial?.pdfLink || '',
      isPublished: initial?.isPublished ?? false,
    },
  });

  const coverImage = watch('coverImage');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': undefined } });
      setValue('coverImage', res.data.url);
      setPreview(res.data.url);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;
    setPdfUploadErr('');
    setPdfUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': undefined } });
      setValue('pdfLink', res.data.url);
    } catch (err) {
      setPdfUploadErr(err.response?.data?.message || 'PDF upload failed. Try again.');
    } finally {
      setPdfUploading(false);
      if (pdfFileRef.current) pdfFileRef.current.value = '';
    }
  };

  const saveMutation = useMutation(
    (data) => {
      const payload = {
        ...data,
        year: parseInt(data.year, 10),
        content: getNlContent(),
      };
      return initial
        ? api.put(`/newsletters/${initial._id}`, payload)
        : api.post('/newsletters', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-newsletters');
        qc.invalidateQueries('newsletters');
        qc.invalidateQueries('newsletter');
        onSaved();
      },
    }
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="font-display font-bold text-indigo text-2xl mb-6">
        {initial ? 'Edit Newsletter' : 'New Newsletter'}
      </h2>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-2">Cover Image</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '16/7' }}>
            {(preview || coverImage) ? (
              <>
                <img src={normalizeImg(preview || coverImage)} alt="cover" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="bg-white text-indigo text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-indigo hover:text-white transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? 'Uploading…' : 'Change Image'}
                  </button>
                  <button type="button" onClick={() => { setPreview(''); setValue('coverImage', ''); }}
                    className="bg-white text-crimson text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-crimson hover:text-white transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="bg-black/50 text-white text-[11px] px-2 py-1 rounded-lg truncate max-w-xs backdrop-blur-sm">
                    {(preview || coverImage || '').split('/').pop().split('?')[0]}
                  </span>
                  <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">✓ Image set</span>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo hover:bg-indigo/5 transition-all cursor-pointer w-full">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{uploading ? 'Uploading…' : 'Click to upload cover image'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Recommended 1200×500px</p>
                </div>
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-steel whitespace-nowrap">Or paste URL:</span>
            <input
              {...register('coverImage')}
              placeholder="https://example.com/newsletter-cover.jpg"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-crimson"
              onChange={(e) => { setPreview(e.target.value); setValue('coverImage', e.target.value); }}
            />
          </div>
          {uploadError && <p className="text-crimson text-xs mt-1">{uploadError}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="e.g. Absolute Veritas Regulatory Compliance Bulletin"
          />
          {errors.title && <p className="text-crimson text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Edition */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Edition *</label>
          <input
            {...register('edition', { required: 'Edition is required' })}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson ${errors.edition ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="e.g. June 2026 Edition"
          />
          {errors.edition && <p className="text-crimson text-xs mt-1">{errors.edition.message}</p>}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Excerpt / Summary</label>
          <textarea
            {...register('excerpt')}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-none"
            placeholder="Short summary shown on the newsletter listing page..."
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-indigo">Full Content</label>
            {nlEditorMode === 'code' && (nlHtml.trim() || nlCss.trim() || nlJs.trim()) && (
              <button type="button" onClick={() => setNlShowPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 font-semibold transition-colors">
                {nlShowPreview ? '✕ Close Preview' : '▶ Preview'}
              </button>
            )}
          </div>
          <p className="text-xs text-steel mb-2">Leave blank if PDF-only.</p>

          {/* Editor mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-3 border border-gray-200">
            <button type="button" onClick={() => handleNlModeSwitch('rich')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${nlEditorMode === 'rich' ? 'bg-white shadow-sm text-indigo border border-gray-200' : 'text-steel hover:text-indigo'}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/></svg>
              Rich Text
            </button>
            <button type="button" onClick={() => handleNlModeSwitch('code')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${nlEditorMode === 'code' ? 'bg-white shadow-sm text-indigo border border-gray-200' : 'text-steel hover:text-indigo'}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              HTML / CSS / JS
            </button>
          </div>

          {nlEditorMode === 'rich' ? (
            <RibbonEditor key="nl-rich" value={nlRichContent} onChange={setNlRichContent} minHeight={400} />
          ) : (
            <>
              <CodeEditor multiMode htmlValue={nlHtml} cssValue={nlCss} jsValue={nlJs}
                onMultiChange={({ html, css, js }) => { setNlHtml(html); setNlCss(css); setNlJs(js); setNlShowPreview(false); }}
                height={460} />
              {nlShowPreview && (nlHtml.trim() || nlCss.trim() || nlJs.trim()) && (
                <div className="mt-3 rounded-xl overflow-hidden border-2 border-green-200 shadow-sm">
                  <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-700">Live Preview — HTML + CSS + JS combined</span>
                    <button type="button" onClick={() => setNlShowPreview(false)} className="text-green-600 hover:text-green-800 text-xs">✕ Close</button>
                  </div>
                  <iframe key={`${nlHtml}${nlCss}${nlJs}`} srcDoc={buildMultiPreview(nlHtml, nlCss, nlJs)}
                    sandbox="allow-scripts allow-same-origin" className="w-full"
                    style={{ height: 500, border: 'none', display: 'block' }} title="Preview" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Month + Year */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Month *</label>
            <select
              {...register('month', { required: 'Month is required' })}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson bg-white"
            >
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Year *</label>
            <input
              type="number"
              {...register('year', { required: 'Year is required', min: 2020, max: 2099 })}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson ${errors.year ? 'border-red-400' : 'border-gray-200'}`}
              placeholder={new Date().getFullYear()}
            />
            {errors.year && <p className="text-crimson text-xs mt-1">{errors.year.message}</p>}
          </div>
        </div>

        {/* PDF Upload / Link */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-2">PDF File</label>
          <input ref={pdfFileRef} type="file" accept=".pdf,application/pdf" className="hidden"
            onChange={(e) => handlePdfUpload(e.target.files[0])} />

          {/* Drag-and-drop zone */}
          <PdfDropZone
            onFile={(file) => handlePdfUpload(file)}
            onBrowse={() => pdfFileRef.current?.click()}
            uploading={pdfUploading}
            currentLink={watch('pdfLink')}
          />

          {pdfUploadErr && (
            <p className="text-crimson text-xs mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {pdfUploadErr}
            </p>
          )}

          {/* Paste external URL fallback */}
          <div className="mt-3">
            <p className="text-xs text-steel mb-1.5">Or paste an external PDF URL:</p>
            <input
              {...register('pdfLink')}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crimson"
              placeholder="https://example.com/newsletter-june-2026.pdf"
            />
          </div>
        </div>

        {/* Published toggle */}
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <div className="relative">
            <input type="checkbox" {...register('isPublished')} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-crimson rounded-full transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-indigo">Publish immediately</span>
        </label>

        {saveMutation.isError && (
          <p className="text-crimson text-sm">{saveMutation.error?.response?.data?.message || 'Save failed. Try again.'}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isLoading}
            className="btn-primary px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saveMutation.isLoading ? 'Saving...' : initial ? 'Update Newsletter' : 'Create Newsletter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-gray-200 text-steel hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ── NewsArticleForm ───────────────────────────────────────────────────────────
const NewsArticleForm = ({ initial, onSaved, onCancel }) => {
  const qc = useQueryClient();
  const fileRef   = useRef(null);
  const [preview, setPreview] = useState(initial?.coverImage || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [naEditorMode,  setNaEditorMode]  = useState('rich');
  const [naRichContent, setNaRichContent] = useState('');
  const [naHtml, setNaHtml] = useState('');
  const [naCss,  setNaCss]  = useState('');
  const [naJs,   setNaJs]   = useState('');
  const [naContentError, setNaContentError] = useState('');
  const [naShowPreview,  setNaShowPreview]  = useState(false);

  useEffect(() => {
    const raw = initial?.content || '';
    if (raw) {
      const hasCode = /<style|<script/i.test(raw);
      if (hasCode) {
        const { html, css, js } = parseHtmlCssJs(raw);
        setNaHtml(html); setNaCss(css); setNaJs(js);
        setNaEditorMode('code');
      } else {
        setNaRichContent(raw);
        setNaEditorMode('rich');
      }
    }
  }, []); // eslint-disable-line

  const handleNaModeSwitch = (mode) => {
    if (mode === naEditorMode) return;
    if (mode === 'code') {
      setNaHtml(naRichContent); setNaCss(''); setNaJs('');
    } else {
      if ((naCss.trim() || naJs.trim()) && !window.confirm('Switching to Rich Text will discard your CSS and JS code. Continue?')) return;
      setNaRichContent(naHtml);
    }
    setNaEditorMode(mode); setNaShowPreview(false);
  };

  const getNaContent = () => naEditorMode === 'rich' ? naRichContent : combineHtmlCssJs(naHtml, naCss, naJs);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title:       initial?.title || '',
      excerpt:     initial?.excerpt || '',
      category:    initial?.category || 'General',
      tags:        initial?.tags?.join(', ') || '',
      author:      initial?.author || 'Absolute Veritas',
      coverImage:  initial?.coverImage || '',
      isTrending:  initial?.isTrending ?? false,
      isPublished: initial?.isPublished ?? false,
    },
  });

  const coverImage = watch('coverImage');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': undefined } });
      setValue('coverImage', res.data.url);
      setPreview(res.data.url);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation(
    (data) => {
      const payload = {
        ...data,
        tags:    data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        content: getNaContent(),
      };
      return initial
        ? api.put(`/news/${initial._id}`, payload)
        : api.post('/news', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('nl-news');
        qc.invalidateQueries('admin-news');
        onSaved();
      },
    }
  );

  const onFormSubmit = (data) => {
    if (!getNaContent().trim()) { setNaContentError('Content is required'); return; }
    setNaContentError('');
    saveMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="font-display font-bold text-indigo text-2xl mb-6">
        {initial ? 'Edit News Article' : 'New News Article'}
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-2">Cover Image</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '16/7' }}>
            {(preview || coverImage) ? (
              <>
                <img src={normalizeImg(preview || coverImage)} alt="cover" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="bg-white text-indigo text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-indigo hover:text-white transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? 'Uploading…' : 'Change'}
                  </button>
                  <button type="button" onClick={() => { setPreview(''); setValue('coverImage', ''); }}
                    className="bg-white text-crimson text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-crimson hover:text-white transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="bg-black/50 text-white text-[11px] px-2 py-1 rounded-lg truncate max-w-xs backdrop-blur-sm">
                    {(preview || coverImage || '').split('/').pop().split('?')[0]}
                  </span>
                  <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">✓ Image set</span>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo hover:bg-indigo/5 transition-all cursor-pointer w-full">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{uploading ? 'Uploading…' : 'Click to upload cover image'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · Recommended 1200×500px</p>
                </div>
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-steel whitespace-nowrap">Or paste URL:</span>
            <input
              {...register('coverImage')}
              placeholder="https://example.com/image.jpg"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-crimson"
              onChange={(e) => { setPreview(e.target.value); setValue('coverImage', e.target.value); }}
            />
          </div>
          {uploadError && <p className="text-crimson text-xs mt-1">{uploadError}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Title *</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="e.g. BIS Mandatory Certification Extended to New Product Categories"
          />
          {errors.title && <p className="text-crimson text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Excerpt / Summary *</label>
          <textarea
            {...register('excerpt', { required: 'Excerpt is required' })}
            rows={2}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-none ${errors.excerpt ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="Brief summary shown on the news listing."
          />
          {errors.excerpt && <p className="text-crimson text-xs mt-1">{errors.excerpt.message}</p>}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-indigo">Content *</label>
            {naEditorMode === 'code' && (naHtml.trim() || naCss.trim() || naJs.trim()) && (
              <button type="button" onClick={() => setNaShowPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 border border-green-300 text-green-700 hover:bg-green-100 font-semibold transition-colors">
                {naShowPreview ? '✕ Close Preview' : '▶ Preview'}
              </button>
            )}
          </div>

          {/* Editor mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-3 border border-gray-200">
            <button type="button" onClick={() => handleNaModeSwitch('rich')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${naEditorMode === 'rich' ? 'bg-white shadow-sm text-indigo border border-gray-200' : 'text-steel hover:text-indigo'}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/></svg>
              Rich Text
            </button>
            <button type="button" onClick={() => handleNaModeSwitch('code')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${naEditorMode === 'code' ? 'bg-white shadow-sm text-indigo border border-gray-200' : 'text-steel hover:text-indigo'}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              HTML / CSS / JS
            </button>
          </div>

          {naEditorMode === 'rich' ? (
            <RibbonEditor key="na-rich" value={naRichContent} onChange={setNaRichContent} minHeight={400} />
          ) : (
            <>
              <CodeEditor multiMode htmlValue={naHtml} cssValue={naCss} jsValue={naJs}
                onMultiChange={({ html, css, js }) => { setNaHtml(html); setNaCss(css); setNaJs(js); setNaShowPreview(false); }}
                height={460} />
              {naShowPreview && (naHtml.trim() || naCss.trim() || naJs.trim()) && (
                <div className="mt-3 rounded-xl overflow-hidden border-2 border-green-200 shadow-sm">
                  <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-700">Live Preview — HTML + CSS + JS combined</span>
                    <button type="button" onClick={() => setNaShowPreview(false)} className="text-green-600 hover:text-green-800 text-xs">✕ Close</button>
                  </div>
                  <iframe key={`${naHtml}${naCss}${naJs}`} srcDoc={buildMultiPreview(naHtml, naCss, naJs)}
                    sandbox="allow-scripts allow-same-origin" className="w-full"
                    style={{ height: 500, border: 'none', display: 'block' }} title="Preview" />
                </div>
              )}
            </>
          )}
          {naContentError && <p className="text-crimson text-xs mt-1">{naContentError}</p>}
        </div>

        {/* Category + Author */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Category</label>
            <select
              {...register('category')}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson bg-white"
            >
              {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Author</label>
            <input
              {...register('author')}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
              placeholder="Absolute Veritas"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">
            Tags <span className="text-steel font-normal">(comma-separated)</span>
          </label>
          <input
            {...register('tags')}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
            placeholder="BIS, certification, electronics"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" {...register('isTrending')} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-gold rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-indigo">Mark as Trending</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" {...register('isPublished')} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-checked:bg-crimson rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-indigo">Publish immediately</span>
          </label>
        </div>

        {saveMutation.isError && (
          <p className="text-crimson text-sm">{saveMutation.error?.response?.data?.message || 'Save failed. Try again.'}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isLoading}
            className="btn-primary px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saveMutation.isLoading ? 'Saving...' : initial ? 'Update Article' : 'Create Article'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg border border-gray-200 text-steel hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ── AddSubscriberForm ─────────────────────────────────────────────────────────
const AddSubscriberForm = ({ onDone }) => {
  const qc = useQueryClient();
  const [fields, setFields] = React.useState({ email: '', name: '', mobile: '' });
  const [status, setStatus] = React.useState('idle'); // idle | loading | success | error
  const [msg, setMsg] = React.useState('');

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.email.trim()) return;
    setStatus('loading');
    try {
      await api.post('/subscribers/subscribe', {
        email:  fields.email.trim(),
        name:   fields.name.trim(),
        mobile: fields.mobile.trim(),
      });
      qc.invalidateQueries('admin-subscribers');
      setStatus('success');
      setMsg('Subscriber added successfully.');
      setFields({ email: '', name: '', mobile: '' });
      setTimeout(onDone, 1200);
    } catch (err) {
      setStatus('error');
      setMsg(err.response?.data?.message || 'Failed to add subscriber.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h3 className="font-display font-bold text-indigo text-lg mb-5">Add Subscriber Manually</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-steel mb-1 uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={fields.name}
              onChange={set('name')}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-crimson"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-steel mb-1 uppercase tracking-wide">Email *</label>
            <input
              type="email"
              required
              value={fields.email}
              onChange={set('email')}
              placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-crimson"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-steel mb-1 uppercase tracking-wide">Mobile</label>
            <input
              type="tel"
              value={fields.mobile}
              onChange={set('mobile')}
              placeholder="+91 98765 43210"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-crimson"
            />
          </div>
        </div>

        {msg && (
          <p className={`text-sm font-medium ${status === 'success' ? 'text-green-600' : 'text-crimson'}`}>{msg}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {status === 'loading' ? 'Adding…' : 'Add Subscriber'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-steel hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ── AdminNewsletterPage ───────────────────────────────────────────────────────
const AdminNewsletterPage = () => {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const t = searchParams.get('tab');
    if (t === 'news') return 'news';
    if (t === 'subscribers') return 'subscribers';
    return 'newsletters';
  });
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [showAddSub, setShowAddSub] = useState(false);

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab]);

  // Newsletters data (admin endpoint — returns all including drafts, with content)
  const { data: newsletters = [], isLoading: nlLoading } = useQuery('admin-newsletters', () =>
    api.get('/newsletters/admin-all').then((r) => r.data)
  );

  // News articles data (for the News tab)
  const { data: newsData, isLoading: newsLoading } = useQuery('nl-news', () =>
    api.get('/news/admin-all').then((r) => r.data)
  );
  const newsArticles = newsData?.news || [];

  const deleteNewsletterMutation = useMutation(
    (id) => api.delete(`/newsletters/${id}`),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-newsletters');
        qc.invalidateQueries('newsletters');
      },
    }
  );

  const deleteNewsMutation = useMutation(
    (id) => api.delete(`/news/${id}`),
    {
      onSuccess: () => {
        qc.invalidateQueries('nl-news');
        qc.invalidateQueries('admin-news');
      },
    }
  );

  const toggleTrendingMutation = useMutation(
    ({ id, isTrending }) => api.put(`/news/${id}`, { isTrending }),
    {
      onSuccess: () => {
        qc.invalidateQueries('nl-news');
        qc.invalidateQueries('admin-news');
      },
    }
  );

  // Subscribers data
  const { data: subscribers = [], isLoading: subLoading, refetch: refetchSubs } = useQuery(
    'admin-subscribers',
    () => api.get('/subscribers').then((r) => r.data),
    { enabled: activeTab === 'subscribers' }
  );

  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubFields, setEditSubFields] = useState({ name: '', mobile: '', isActive: true });
  const [editSubSaving, setEditSubSaving] = useState(false);

  const startEditSub = (sub) => {
    setEditingSubId(sub._id);
    setEditSubFields({ name: sub.name || '', mobile: sub.mobile || '', isActive: sub.isActive });
  };
  const cancelEditSub = () => { setEditingSubId(null); };
  const saveEditSub = async (id) => {
    setEditSubSaving(true);
    try {
      await api.put(`/subscribers/${id}`, editSubFields);
      qc.invalidateQueries('admin-subscribers');
      setEditingSubId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally {
      setEditSubSaving(false);
    }
  };

  const deleteSubMutation = useMutation(
    (id) => api.delete(`/subscribers/${id}`),
    { onSuccess: () => qc.invalidateQueries('admin-subscribers') }
  );

  // Per-newsletter send state: { [nlId]: { loading, result } }
  const [sendState, setSendState] = useState({});

  const sendNewsletter = async (nlId) => {
    setSendState((s) => ({ ...s, [nlId]: { loading: true, result: null } }));
    try {
      const res = await api.post(`/subscribers/send/${nlId}`);
      setSendState((s) => ({ ...s, [nlId]: { loading: false, result: { ok: true, msg: res.data.message } } }));
    } catch (err) {
      setSendState((s) => ({ ...s, [nlId]: { loading: false, result: { ok: false, msg: err.response?.data?.message || 'Send failed.' } } }));
    }
  };

  const [editLoading, setEditLoading] = useState(false);

  const handleEditNewsletter = async (nl) => {
    setEditLoading(nl._id);
    try {
      const res = await api.get(`/newsletters/admin/${nl._id}`);
      setEditing(res.data);
    } catch {
      setEditing(nl);
    } finally {
      setEditLoading(false);
    }
    setView('edit');
  };

  const handleEditArticle = async (article) => {
    setEditLoading(article._id);
    try {
      const res = await api.get(`/news/${article.slug}`);
      setEditing(res.data);
    } catch {
      setEditing(article);
    } finally {
      setEditLoading(false);
    }
    setView('edit');
  };

  const closeForm = () => { setView('list'); setEditing(null); };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setView('list');
    setEditing(null);
  };

  const isFormView = view !== 'list';

  return (
    <>
      <Helmet><title>Admin — Newsletters &amp; News | Absolute Veritas</title></Helmet>
      <AdminLayout
        back={isFormView ? closeForm : undefined}
      >
        {/* Tab bar */}
        {!isFormView && (
          <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => switchTab('newsletters')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'newsletters' ? 'bg-indigo text-white shadow' : 'text-steel hover:text-indigo'
                }`}
              >
                Newsletters
              </button>
              <button
                onClick={() => switchTab('news')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'news' ? 'bg-indigo text-white shadow' : 'text-steel hover:text-indigo'
                }`}
              >
                News Articles
              </button>
              <button
                onClick={() => switchTab('subscribers')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'subscribers' ? 'bg-indigo text-white shadow' : 'text-steel hover:text-indigo'
                }`}
              >
                Subscribers
                {subscribers.length > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'subscribers' ? 'bg-white/20' : 'bg-indigo/10'}`}>
                    {subscribers.filter(s => s.isActive).length}
                  </span>
                )}
              </button>
            </div>
            {activeTab !== 'subscribers' ? (
              <button onClick={() => setView('new')} className="btn-primary px-6 py-2.5 text-sm">
                {activeTab === 'newsletters' ? '+ New Newsletter' : '+ New Article'}
              </button>
            ) : (
              <button
                onClick={() => setShowAddSub((v) => !v)}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {showAddSub ? 'Cancel' : '+ Add Subscriber'}
              </button>
            )}
          </div>
        )}

        {/* ── Newsletters tab ── */}
        {activeTab === 'newsletters' && (
          <>
            {isFormView ? (
              <NewsletterForm
                initial={view === 'edit' ? editing : null}
                onSaved={closeForm}
                onCancel={closeForm}
              />
            ) : nlLoading ? (
              <div className="text-center py-20 text-steel">Loading...</div>
            ) : newsletters.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <p className="text-steel mb-6">No newsletters yet.</p>
                <button onClick={() => setView('new')} className="btn-primary px-8 py-3">
                  Create your first newsletter
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {newsletters.map((nl, i) => (
                  <div
                    key={nl._id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i < newsletters.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      {nl.coverImage ? (
                        <img src={normalizeImg(nl.coverImage)} alt={nl.title} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo to-indigo/60 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      {nl.isPublished ? (
                        <a
                          href={`/newsletter/${nl._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo text-sm truncate hover:text-crimson transition-colors block"
                        >
                          {nl.title}
                        </a>
                      ) : (
                        <p className="font-semibold text-indigo text-sm truncate">{nl.title}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-crimson font-medium">{nl.edition}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-steel">{nl.month} {nl.year}</span>
                        <span className="text-gray-300">·</span>
                        <span className={`text-xs font-semibold ${nl.isPublished ? 'text-green-600' : 'text-amber-500'}`}>
                          {nl.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {nl.pdfLink && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-teal-600 font-medium">PDF linked</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {nl.isPublished && (
                          <a
                            href={`/newsletter/${nl._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors font-medium"
                          >
                            View
                          </a>
                        )}
                        {nl.pdfLink && (
                          <a
                            href={nl.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                          >
                            PDF
                          </a>
                        )}
                        <button
                          onClick={() => {
                            if (!sendState[nl._id]?.loading &&
                              window.confirm(`Send "${nl.title}" to all active subscribers?`)) {
                              sendNewsletter(nl._id);
                            }
                          }}
                          disabled={sendState[nl._id]?.loading}
                          className="text-xs text-white bg-indigo hover:bg-indigo/90 px-3 py-1.5 rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-1"
                        >
                          {sendState[nl._id]?.loading ? (
                            <>
                              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                              </svg>
                              Sending…
                            </>
                          ) : '✉ Send to Subscribers'}
                        </button>
                        <button
                          onClick={() => handleEditNewsletter(nl)}
                          disabled={editLoading === nl._id}
                          className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors disabled:opacity-60 flex items-center gap-1"
                        >
                          {editLoading === nl._id ? (
                            <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Loading…</>
                          ) : 'Edit'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${nl.title}"?`)) deleteNewsletterMutation.mutate(nl._id);
                          }}
                          className="text-xs text-crimson hover:text-red-700 px-3 py-1.5 rounded-lg border border-crimson/30 hover:border-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      {sendState[nl._id]?.result && (
                        <p className={`text-[11px] font-medium ${sendState[nl._id].result.ok ? 'text-green-600' : 'text-crimson'}`}>
                          {sendState[nl._id].result.msg}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── News Articles tab ── */}
        {activeTab === 'news' && (
          <>
            {isFormView ? (
              <NewsArticleForm
                initial={view === 'edit' ? editing : null}
                onSaved={closeForm}
                onCancel={closeForm}
              />
            ) : newsLoading ? (
              <div className="text-center py-20 text-steel">Loading...</div>
            ) : newsArticles.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <p className="text-steel mb-6">No news articles yet.</p>
                <button onClick={() => setView('new')} className="btn-primary px-8 py-3">
                  Create your first article
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {newsArticles.map((article, i) => (
                  <div
                    key={article._id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i < newsArticles.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      {article.coverImage ? (
                        <img src={normalizeImg(article.coverImage)} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo via-indigo/80 to-crimson/60 flex items-center justify-center">
                          <span className="text-white font-black text-lg leading-none select-none">
                            {article.title?.charAt(0)?.toUpperCase() || 'N'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-indigo text-sm truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-crimson font-medium">{article.category}</span>
                        {article.isTrending && (
                          <span className="text-xs font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded-full">
                            Trending
                          </span>
                        )}
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-steel">{formatDate(article.publishedAt)}</span>
                        <span className="text-gray-300">·</span>
                        <span className={`text-xs font-semibold ${article.isPublished ? 'text-green-600' : 'text-amber-500'}`}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleTrendingMutation.mutate({ id: article._id, isTrending: !article.isTrending })}
                        disabled={toggleTrendingMutation.isLoading}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-semibold ${
                          article.isTrending
                            ? 'text-gold border-gold/40 bg-gold/10 hover:bg-gold/20'
                            : 'text-steel border-gray-200 hover:border-gold hover:text-gold'
                        }`}
                      >
                        {article.isTrending ? 'Trending' : 'Set Trending'}
                      </button>
                      {article.isPublished && (
                        <a
                          href={`/news/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() => handleEditArticle(article)}
                        disabled={editLoading === article._id}
                        className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors disabled:opacity-60 flex items-center gap-1"
                      >
                        {editLoading === article._id ? (
                          <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Loading…</>
                        ) : 'Edit'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${article.title}"?`)) deleteNewsMutation.mutate(article._id);
                        }}
                        className="text-xs text-crimson hover:text-red-700 px-3 py-1.5 rounded-lg border border-crimson/30 hover:border-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Subscribers tab ── */}
        {activeTab === 'subscribers' && (
          <div>
            {/* Manual add form */}
            {showAddSub && (
              <AddSubscriberForm onDone={() => setShowAddSub(false)} />
            )}

            {/* Stats row */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Subscribers', value: subscribers.length, color: 'text-indigo' },
                { label: 'Active',   value: subscribers.filter(s => s.isActive).length,   color: 'text-green-600' },
                { label: 'Inactive', value: subscribers.filter(s => !s.isActive).length,  color: 'text-amber-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 text-center">
                  <p className={`font-display font-black text-3xl ${color}`}>{subLoading ? '—' : value}</p>
                  <p className="text-steel text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>

            {subLoading ? (
              <div className="text-center py-20 text-steel">Loading subscribers…</div>
            ) : subscribers.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-indigo/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-indigo/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <p className="text-steel font-medium mb-1">No subscribers yet.</p>
                <p className="text-steel/60 text-sm">Subscribers will appear here once users sign up from the Newsletter page.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="grid grid-cols-[1fr_140px_110px_110px_120px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-steel uppercase tracking-wide">
                  <span>Email / Name</span>
                  <span>Mobile</span>
                  <span>Subscribed</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {subscribers.map((sub, i) => (
                  <React.Fragment key={sub._id}>
                    {/* View row */}
                    <div
                      className={`grid grid-cols-[1fr_140px_110px_110px_120px] gap-3 items-center px-5 py-3.5 transition-colors ${editingSubId === sub._id ? 'bg-indigo/5' : 'hover:bg-gray-50'} ${i < subscribers.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-indigo truncate">{sub.email}</p>
                        {sub.name && <p className="text-xs text-steel truncate">{sub.name}</p>}
                      </div>
                      <span className="text-xs text-steel">{sub.mobile || '—'}</span>
                      <span className="text-xs text-steel">{formatDate(sub.subscribedAt || sub.createdAt)}</span>
                      <span className={`text-xs font-semibold ${sub.isActive ? 'text-green-600' : 'text-amber-500'}`}>
                        {sub.isActive ? '● Active' : '○ Inactive'}
                      </span>
                      <div className="flex justify-end gap-1.5">
                        {editingSubId === sub._id ? (
                          <button
                            onClick={cancelEditSub}
                            className="text-xs text-steel hover:text-indigo px-2.5 py-1 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditSub(sub)}
                              className="text-xs text-steel hover:text-indigo px-2.5 py-1 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Remove ${sub.email} from subscribers?`))
                                  deleteSubMutation.mutate(sub._id);
                              }}
                              className="text-xs text-crimson hover:text-red-700 px-2.5 py-1 rounded-lg border border-crimson/30 hover:border-red-400 transition-colors"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline edit panel */}
                    {editingSubId === sub._id && (
                      <div className={`px-5 py-4 bg-indigo/5 border-b border-indigo/10`}>
                        <p className="text-xs font-semibold text-indigo mb-3 uppercase tracking-wide">Edit Subscriber</p>
                        <div className="grid sm:grid-cols-3 gap-3 mb-4">
                          <div>
                            <label className="block text-xs text-steel mb-1">Name</label>
                            <input
                              type="text"
                              value={editSubFields.name}
                              onChange={(e) => setEditSubFields((f) => ({ ...f, name: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                              placeholder="Full name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-steel mb-1">Mobile</label>
                            <input
                              type="tel"
                              value={editSubFields.mobile}
                              onChange={(e) => setEditSubFields((f) => ({ ...f, mobile: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                              placeholder="+91 98765 43210"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-steel mb-1">Status</label>
                            <select
                              value={editSubFields.isActive ? 'active' : 'inactive'}
                              onChange={(e) => setEditSubFields((f) => ({ ...f, isActive: e.target.value === 'active' }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditSub(sub._id)}
                            disabled={editSubSaving}
                            className="btn-primary px-5 py-2 text-xs disabled:opacity-60"
                          >
                            {editSubSaving ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button
                            onClick={cancelEditSub}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-steel hover:bg-gray-50 text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminNewsletterPage;
