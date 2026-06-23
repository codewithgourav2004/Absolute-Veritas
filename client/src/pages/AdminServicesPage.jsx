import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import AdminLayout from '../components/Admin/AdminLayout';
import { SERVICE_CATEGORIES } from '../utils/constants';
import normalizeImg from '../utils/normalizeImg';

const CAT_COLORS = {
  'Certification':  'bg-blue-50 text-blue-700',
  'Testing':        'bg-purple-50 text-purple-700',
  'Inspection':     'bg-orange-50 text-orange-700',
  'IT Compliance':  'bg-green-50 text-green-700',
  'Others':         'bg-gray-100 text-gray-600',
};

const toHtml = (text) =>
  text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n');

// ── Service form ──────────────────────────────────────────────────────────────
// Wraps an HTML fragment in a full document for the preview iframe
const buildPreviewSrc = (html) => {
  if (!html?.trim()) return '';
  const isFullDoc = /<!doctype|<html/i.test(html);
  if (isFullDoc) return html;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>*, *::before, *::after { box-sizing: border-box; } body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; color: #374151; line-height: 1.7; }</style>
</head>
<body>${html}</body>
</html>`;
};

const ServiceForm = ({ initial, onSaved, onCancel }) => {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [features,    setFeatures]    = useState(initial?.features?.length ? initial.features : ['']);
  const [imageUrl,    setImageUrl]    = useState(normalizeImg(initial?.image));
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver,  setIsDragOver]  = useState(false);
  const [htmlMode,    setHtmlMode]    = useState(
    Boolean(initial?.content && /(<p>|<h[1-6]|<script|<style|<!doctype)/i.test(initial.content))
  );
  const [previewSrc,  setPreviewSrc]  = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const abortRef = useRef(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name:                   initial?.name                   || '',
      category:               initial?.category               || 'Certification',
      subcategory:            initial?.subcategory            || '',
      subcategoryIcon:        initial?.subcategoryIcon        || '',
      subcategoryDescription: initial?.subcategoryDescription || '',
      subcategoryOrder:       initial?.subcategoryOrder       ?? 0,
      description:            initial?.description            || '',
      icon:                   initial?.icon                   || '',
      order:                  initial?.order                  ?? 0,
      isActive:               initial?.isActive               ?? true,
      content:                initial?.content                || '',
    },
  });

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    setUploadError('');
    setUploading(true);
    abortRef.current = new AbortController();
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': undefined },
        signal: abortRef.current.signal,
        timeout: 30000,
      });
      setImageUrl(normalizeImg(res.data.url));
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setUploadError('Upload failed. Check your connection and try again.');
      }
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
    setUploading(false);
    setUploadError('Upload cancelled.');
  };

  const saveMutation = useMutation(
    (data) => {
      const rawContent = data.content || '';
      const payload = {
        ...data,
        image:    imageUrl,
        features: features.filter(Boolean),
        content:  htmlMode ? rawContent : (rawContent ? toHtml(rawContent) : ''),
      };
      return initial
        ? api.put(`/services/${initial._id}`, payload)
        : api.post('/services', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-services');
        onSaved();
      },
    }
  );

  const addFeature    = () => setFeatures([...features, '']);
  const removeFeature = (i) => setFeatures(features.filter((_, idx) => idx !== i));
  const setFeature    = (i, v) => setFeatures(features.map((f, idx) => idx === i ? v : f));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1.5 text-steel hover:text-indigo text-sm font-medium mb-6 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Back to Services
      </button>

      <h2 className="font-display font-bold text-indigo text-2xl mb-6">
        {initial ? 'Edit Service' : 'New Service'}
      </h2>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-5">
        {/* Name + Category */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Service Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="e.g. BIS Certification"
            />
            {errors.name && <p className="text-crimson text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Category *</label>
            <select
              {...register('category')}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson bg-white"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Group (subcategory) section ── */}
        <div className="bg-pearl rounded-xl p-4 border border-gray-100 space-y-4">
          <p className="text-xs font-mono text-steel uppercase tracking-widest">Group / Subcategory (for Certification, Testing, Inspection tabs)</p>

          {/* Subcategory name + icon */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-indigo mb-1">Group Name</label>
              <input
                {...register('subcategory')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crimson bg-white"
                placeholder="e.g. Bureau of Indian Standards (BIS)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-1">Group Icon <span className="text-steel font-normal">(emoji)</span></label>
              <input
                {...register('subcategoryIcon')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crimson bg-white"
                placeholder="🏛️"
              />
            </div>
          </div>

          {/* Subcategory description + order */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-indigo mb-1">Group Description</label>
              <input
                {...register('subcategoryDescription')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crimson bg-white"
                placeholder="Short description shown in the group header..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-1">Group Order</label>
              <input
                {...register('subcategoryOrder', { valueAsNumber: true })}
                type="number"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crimson bg-white"
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Service Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="Brief description of this specific service (shown on the service card)..."
          />
          {errors.description && <p className="text-crimson text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Icon + Order */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">
              Service Icon <span className="text-steel font-normal">(emoji)</span>
            </label>
            <input
              {...register('icon')}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
              placeholder="🔵"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Order within Group</label>
            <input
              {...register('order', { valueAsNumber: true })}
              type="number"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
              placeholder="1"
            />
          </div>
        </div>

        {/* ── Cover Image ── */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-2">
            Cover Image <span className="text-steel font-normal">(optional — shown on the service detail page)</span>
          </label>
          <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} className="hidden" />

          {imageUrl ? (
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 180 }}>
              <img src={imageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-xs font-semibold text-indigo shadow transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-crimson shadow text-lg leading-none transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragEnter={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl py-10 text-center transition-all duration-200 cursor-pointer ${
                isDragOver
                  ? 'border-crimson bg-crimson/5'
                  : 'border-gray-200 hover:border-crimson/50 hover:bg-gray-50'
              } ${uploading ? 'pointer-events-none' : ''}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin w-7 h-7 text-crimson" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="text-sm text-steel">Uploading image…</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
                    className="text-xs text-crimson font-semibold hover:underline pointer-events-auto"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <svg className={`w-8 h-8 ${isDragOver ? 'text-crimson' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className={`text-sm font-medium ${isDragOver ? 'text-crimson' : 'text-steel'}`}>
                    {isDragOver ? 'Drop image here' : 'Drag & drop image here'}
                  </p>
                  <p className="text-xs text-gray-400">or <span className="text-crimson font-semibold">click to browse</span></p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG, WebP</p>
                </div>
              )}
            </div>
          )}
          {uploadError && <p className="text-crimson text-xs mt-1.5">{uploadError}</p>}
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-2">Features / Highlights</label>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => setFeature(i, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-crimson"
                  placeholder={`Feature ${i + 1}`}
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="w-9 flex-shrink-0 text-gray-400 hover:text-crimson rounded-lg border border-gray-200 hover:border-crimson/40 transition-colors text-xl leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="mt-2 text-sm text-crimson font-semibold hover:underline"
          >
            + Add feature
          </button>
        </div>

        {/* ── Full Content ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-indigo">
              Full Content <span className="text-steel font-normal">(optional — shown on service detail page)</span>
            </label>
            <div className="flex items-center gap-2">
              {htmlMode && (
                <button
                  type="button"
                  onClick={() => {
                    const val = watch('content');
                    setPreviewSrc(buildPreviewSrc(val));
                    setShowPreview((s) => !s);
                  }}
                  className="text-xs px-3 py-1 rounded-full border border-crimson/40 text-crimson hover:bg-crimson/5 transition-colors font-semibold"
                >
                  {showPreview ? 'Hide Preview' : '▶ Preview'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { setHtmlMode((m) => !m); setShowPreview(false); }}
                className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${htmlMode ? 'bg-indigo text-white border-indigo' : 'text-steel border-gray-300 hover:border-indigo hover:text-indigo'}`}
              >
                {htmlMode ? '</> HTML / JS / CSS' : 'Plain text'}
              </button>
            </div>
          </div>
          <p className="text-xs text-steel mb-2">
            {htmlMode
              ? 'Write full HTML + CSS + JS. Supports <style>, <script>, and any HTML — it runs inside a sandboxed iframe on the website.'
              : 'Write plain text. Each blank line becomes a new paragraph. No HTML needed.'}
          </p>
          <textarea
            {...register('content')}
            rows={16}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y leading-relaxed"
            style={{ fontFamily: htmlMode ? 'JetBrains Mono, Consolas, monospace' : 'inherit' }}
            placeholder={htmlMode
              ? `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: sans-serif; padding: 2rem; }\n  .card { background: #f9fafb; border-radius: 1rem; padding: 1.5rem; }\n</style>\n</head>\n<body>\n  <div class="card">\n    <h2>BIS Certification</h2>\n    <p>Detailed content goes here...</p>\n  </div>\n  <script>\n    console.log("JS works!");\n  <\/script>\n</body>\n</html>`
              : 'Write a detailed overview of this service...\n\nExplain the process, eligibility, documents required, timelines, etc.\n\nEach blank line becomes a new paragraph.'}
          />

          {/* ── Live Preview ── */}
          {htmlMode && showPreview && previewSrc && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-mono text-steel">Preview — runs in sandboxed iframe</span>
                <button
                  type="button"
                  onClick={() => { setPreviewSrc(buildPreviewSrc(watch('content'))); }}
                  className="text-xs text-crimson font-semibold hover:underline"
                >
                  Refresh
                </button>
              </div>
              <iframe
                key={previewSrc}
                srcDoc={previewSrc}
                sandbox="allow-scripts"
                style={{ width: '100%', height: 420, border: 'none', display: 'block', background: 'white' }}
                title="Content preview"
              />
            </div>
          )}
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <div className="relative">
            <input type="checkbox" {...register('isActive')} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-checked:bg-crimson rounded-full transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-indigo">Active (visible on site)</span>
        </label>

        {saveMutation.isError && (
          <p className="text-crimson text-sm">
            {saveMutation.error?.response?.data?.message || 'Save failed. Try again.'}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isLoading}
            className="btn-primary px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saveMutation.isLoading ? 'Saving...' : initial ? 'Update Service' : 'Create Service'}
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

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminServicesPage = () => {
  const qc = useQueryClient();
  const [view, setView]       = useState('list');
  const [editing, setEditing] = useState(null);

  // Search
  const [search, setSearch] = useState('');

  // Drag-and-drop state
  const [localServices, setLocalServices] = useState([]);
  const [dragOverIdx, setDragOverIdx]     = useState(null);
  const [savingOrder, setSavingOrder]     = useState(false);
  const dragSrcIdx = useRef(null);

  const { data: services = [], isLoading } = useQuery(
    'admin-services',
    () => api.get('/services?includeInactive=true').then((r) => r.data)
  );

  useEffect(() => { setLocalServices(services); }, [services]);

  const deleteMutation = useMutation(
    (id) => api.delete(`/services/${id}`),
    { onSuccess: () => qc.invalidateQueries('admin-services') }
  );

  const toggleMutation = useMutation(
    ({ id, isActive }) => api.put(`/services/${id}`, { isActive }),
    { onSuccess: () => qc.invalidateQueries('admin-services') }
  );

  const openEdit = (svc) => { setEditing(svc); setView('edit'); };
  const closeForm = () => { setView('list'); setEditing(null); };

  // ── Drag handlers ──
  const handleDragStart = (i, e) => {
    dragSrcIdx.current = i;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnter = (i) => setDragOverIdx(i);
  const handleDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDragEnd   = () => { setDragOverIdx(null); dragSrcIdx.current = null; };

  const handleDrop = async (i) => {
    const src = dragSrcIdx.current;
    setDragOverIdx(null);
    dragSrcIdx.current = null;
    if (src === null || src === i) return;

    const reordered = [...localServices];
    const [moved] = reordered.splice(src, 1);
    reordered.splice(i, 0, moved);
    setLocalServices(reordered);

    setSavingOrder(true);
    try {
      await Promise.all(reordered.map((svc, idx) => api.put(`/services/${svc._id}`, { order: idx })));
      qc.invalidateQueries('admin-services');
    } finally {
      setSavingOrder(false);
    }
  };

  const q          = search.trim().toLowerCase();
  const isSearching = q.length > 0;
  const filtered    = isSearching
    ? localServices.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.subcategory || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      )
    : localServices;

  return (
    <>
      <Helmet><title>Admin — Services | Absolute Veritas</title></Helmet>
      <AdminLayout
        title={view === 'list' ? 'Services' : undefined}
        action={
          view === 'list' ? (
            <div className="flex items-center gap-3">
              {savingOrder && (
                <span className="text-xs text-steel animate-pulse">Saving order…</span>
              )}
              <button onClick={() => setView('new')} className="btn-primary px-6 py-2.5 text-sm">
                + New Service
              </button>
            </div>
          ) : null
        }
      >
        {view !== 'list' ? (
          <ServiceForm
            initial={view === 'edit' ? editing : null}
            onSaved={closeForm}
            onCancel={closeForm}
          />
        ) : isLoading ? (
          <div className="text-center py-20 text-steel">Loading...</div>
        ) : localServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <p className="text-steel mb-4">No services yet.</p>
            <button onClick={() => setView('new')} className="btn-primary px-8 py-3">
              Add first service
            </button>
          </div>
        ) : (
          <>
            {/* ── Search bar ── */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, category, description…"
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-crimson transition-colors bg-white"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-crimson transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <span className="text-xs text-steel whitespace-nowrap flex-shrink-0">
                {isSearching ? `${filtered.length} of ${localServices.length}` : `${localServices.length} total`}
              </span>
            </div>

            {!isSearching && (
              <p className="text-xs text-steel mb-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                </svg>
                Drag rows to reorder
              </p>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <p className="text-steel text-sm">No services match <span className="font-semibold text-indigo">"{search}"</span></p>
                <button onClick={() => setSearch('')} className="mt-3 text-xs text-crimson font-semibold hover:underline">Clear search</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filtered.map((svc, i) => (
                  <div
                    key={svc._id}
                    draggable={!isSearching}
                    onDragStart={!isSearching ? (e) => handleDragStart(i, e) : undefined}
                    onDragEnter={!isSearching ? () => handleDragEnter(i) : undefined}
                    onDragOver={!isSearching ? handleDragOver : undefined}
                    onDrop={!isSearching ? () => handleDrop(i) : undefined}
                    onDragEnd={!isSearching ? handleDragEnd : undefined}
                    className={`flex items-center gap-3 px-5 py-4 transition-colors select-none ${
                      !isSearching ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      dragOverIdx === i && !isSearching
                        ? 'bg-crimson/5 border-l-2 border-crimson'
                        : 'hover:bg-gray-50 border-l-2 border-transparent'
                    } ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {/* Drag handle — hidden during search */}
                    <span className={`flex-shrink-0 ${isSearching ? 'text-gray-100' : 'text-gray-300'}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                    </span>

                    {/* Icon */}
                    <span className="text-2xl w-8 text-center flex-shrink-0">{svc.icon || '📋'}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-indigo text-sm">{svc.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[svc.category] || CAT_COLORS['Others']}`}>
                          {svc.category}
                        </span>
                        {!svc.isActive && (
                          <span className="text-xs text-gray-400 font-medium">Hidden</span>
                        )}
                      </div>
                      <p className="text-xs text-steel mt-0.5 truncate">{svc.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        title={svc.isActive ? 'Hide from site' : 'Show on site'}
                        onClick={() => toggleMutation.mutate({ id: svc._id, isActive: !svc.isActive })}
                        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${svc.isActive ? 'bg-crimson' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${svc.isActive ? 'left-4' : 'left-0.5'}`} />
                      </button>
                      <button
                        onClick={() => openEdit(svc)}
                        className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Delete "${svc.name}"?`)) deleteMutation.mutate(svc._id); }}
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
      </AdminLayout>
    </>
  );
};

export default AdminServicesPage;
