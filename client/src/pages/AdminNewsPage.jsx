import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import AdminLayout from '../components/Admin/AdminLayout';
import RichEditor from '../components/Admin/RichEditor';

const NEWS_CATEGORIES = ['General', 'BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE', 'FCC', 'IT Compliance'];

const normalizeImg = (url) => {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, '');
};

const toHtml = (text) =>
  text
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

const buildPreviewSrc = (html) => {
  if (!html?.trim()) return '';
  if (/<!doctype|<html/i.test(html)) return html;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>*, *::before, *::after { box-sizing: border-box; } body { margin: 0; font-family: 'DM Sans', system-ui, sans-serif; color: #374151; line-height: 1.7; padding: 1.5rem; }</style>
</head>
<body>${html}</body>
</html>`;
};

const detectContentMode = (c) => {
  if (!c) return 'plain';
  if (/(<script|<style|<!doctype|<link)/i.test(c)) return 'html';
  if (/<[a-z]/i.test(c)) return 'rich';
  return 'plain';
};

// ── NewsForm ──────────────────────────────────────────────────────────────────
const NewsForm = ({ initial, onSaved, onCancel }) => {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(initial?.coverImage || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const _initMode = detectContentMode(initial?.content);
  const [contentMode, setContentMode] = useState(_initMode);
  const [quillValue, setQuillValue] = useState(_initMode === 'rich' ? (initial?.content || '') : '');
  const [previewSrc, setPreviewSrc] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [richError, setRichError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title:       initial?.title || '',
      excerpt:     initial?.excerpt || '',
      content:     _initMode !== 'rich' ? (initial?.content || '') : '',
      category:    initial?.category || 'General',
      tags:        initial?.tags?.join(', ') || '',
      author:      initial?.author || 'Absolute Veritas',
      coverImage:  initial?.coverImage || '',
      isTrending:  initial?.isTrending ?? false,
      isPublished: initial?.isPublished ?? false,
    },
  });

  const coverImage = watch('coverImage');

  const switchMode = (newMode) => {
    if (newMode === contentMode) return;
    const currentText = watch('content') || '';
    if (newMode === 'rich') {
      setQuillValue(contentMode === 'plain' ? (currentText ? toHtml(currentText) : '') : currentText);
    } else if (contentMode === 'rich') {
      const qHtml = quillValue === '<p><br></p>' ? '' : quillValue;
      setValue('content', qHtml);
      clearErrors('content');
    }
    setContentMode(newMode);
    setShowPreview(false);
    setRichError('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setValue('coverImage', res.data.url);
      setPreview(res.data.url);
    } catch {
      setUploadError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation(
    (data) => {
      let content;
      if (contentMode === 'rich') {
        content = (!quillValue || quillValue === '<p><br></p>') ? '' : quillValue;
      } else if (contentMode === 'html') {
        content = data.content || '';
      } else {
        const raw = data.content || '';
        content = raw ? toHtml(raw) : '';
      }
      const payload = {
        ...data,
        tags:    data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        content,
      };
      return initial
        ? api.put(`/news/${initial._id}`, payload)
        : api.post('/news', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-news');
        onSaved();
      },
    }
  );

  const onFormSubmit = (data) => {
    if (contentMode === 'rich') {
      if (!quillValue || quillValue === '<p><br></p>') {
        setRichError('Content is required');
        return;
      }
      setRichError('');
    } else if (!data.content?.trim()) {
      setError('content', { message: 'Content is required' });
      return;
    }
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
          <div className="flex gap-4 items-start">
            <div
              className="w-40 h-28 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-pearl flex-shrink-0 cursor-pointer hover:border-crimson transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {(preview || coverImage) ? (
                <img src={normalizeImg(preview || coverImage)} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400 text-xs p-2">
                  <svg className="w-8 h-8 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Click to upload
                </div>
              )}
            </div>
            <div className="flex-grow space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-indigo text-white rounded-lg hover:bg-indigo/90 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <p className="text-xs text-steel">or paste a URL below</p>
              <input
                {...register('coverImage')}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                onChange={(e) => { setPreview(e.target.value); setValue('coverImage', e.target.value); }}
              />
              {uploadError && <p className="text-crimson text-xs">{uploadError}</p>}
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-indigo">Content *</label>
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {[
                { key: 'plain', label: 'Plain' },
                { key: 'rich',  label: '✦ Rich Editor' },
                { key: 'html',  label: '</> HTML' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchMode(key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                    contentMode === key
                      ? 'bg-white text-indigo shadow-sm font-semibold'
                      : 'text-steel hover:text-indigo'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-steel mb-2">
            {contentMode === 'rich'
              ? 'Format like a Word document — headings, bold, lists, colours, links, and image uploads.'
              : contentMode === 'html'
              ? 'Write full HTML + CSS + JS — rendered in a sandboxed iframe on the website.'
              : 'Write plain text. Each blank line becomes a new paragraph. No HTML needed.'}
          </p>

          {contentMode === 'rich' ? (
            <div>
              <RichEditor
                value={quillValue}
                onChange={(val) => { setQuillValue(val); if (richError) setRichError(''); }}
                placeholder="Write your article content — use the toolbar to format headings, lists, links, and more..."
              />
              {richError && <p className="text-crimson text-xs mt-1">{richError}</p>}
            </div>
          ) : contentMode === 'html' ? (
            <div>
              <div className="flex justify-end mb-1.5">
                <button
                  type="button"
                  onClick={() => { setPreviewSrc(buildPreviewSrc(watch('content'))); setShowPreview((s) => !s); }}
                  className="text-xs px-3 py-1 rounded-full border border-crimson/40 text-crimson hover:bg-crimson/5 transition-colors font-semibold"
                >
                  {showPreview ? 'Hide Preview' : '▶ Preview'}
                </button>
              </div>
              <textarea
                {...register('content')}
                rows={14}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y leading-relaxed font-mono"
                placeholder={`<h2>Section Title</h2>\n<p>Content here...</p>`}
              />
              {errors.content && <p className="text-crimson text-xs mt-1">{errors.content.message}</p>}
              {showPreview && previewSrc && (
                <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-mono text-steel">Preview — sandboxed iframe</span>
                    <button type="button" onClick={() => setPreviewSrc(buildPreviewSrc(watch('content')))} className="text-xs text-crimson font-semibold hover:underline">Refresh</button>
                  </div>
                  <iframe key={previewSrc} srcDoc={previewSrc} sandbox="allow-scripts" style={{ width: '100%', height: 420, border: 'none', display: 'block', background: 'white' }} title="Content preview" />
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                {...register('content')}
                rows={14}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y leading-relaxed ${errors.content ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Write your article content here. Leave a blank line between paragraphs..."
              />
              {errors.content && <p className="text-crimson text-xs mt-1">{errors.content.message}</p>}
            </div>
          )}
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

// ── AdminNewsPage ─────────────────────────────────────────────────────────────
const AdminNewsPage = () => {
  const qc = useQueryClient();
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery('admin-news', () =>
    api.get('/news/admin-all').then((r) => r.data)
  );
  const articles = data?.news || [];

  const deleteMutation = useMutation(
    (id) => api.delete(`/news/${id}`),
    { onSuccess: () => qc.invalidateQueries('admin-news') }
  );

  const toggleTrendingMutation = useMutation(
    ({ id, isTrending }) => api.put(`/news/${id}`, { isTrending }),
    { onSuccess: () => qc.invalidateQueries('admin-news') }
  );

  const closeForm = () => { setView('list'); setEditing(null); };

  return (
    <>
      <Helmet><title>Admin — News | Absolute Veritas</title></Helmet>
      <AdminLayout
        title={view === 'list' ? 'News & Updates' : undefined}
        action={
          view === 'list' ? (
            <button onClick={() => setView('new')} className="btn-primary px-6 py-2.5 text-sm">
              + New Article
            </button>
          ) : null
        }
      >
        {view !== 'list' ? (
          <NewsForm
            initial={view === 'edit' ? editing : null}
            onSaved={closeForm}
            onCancel={closeForm}
          />
        ) : isLoading ? (
          <div className="text-center py-20 text-steel">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <p className="text-steel mb-6">No news articles yet.</p>
            <button onClick={() => setView('new')} className="btn-primary px-8 py-3">
              Create your first article
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {articles.map((article, i) => (
              <div
                key={article._id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i < articles.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-indigo/10 flex-shrink-0">
                  {article.coverImage ? (
                    <img src={normalizeImg(article.coverImage)} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo to-indigo/60" />
                  )}
                </div>

                {/* Info */}
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

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleTrendingMutation.mutate({ id: article._id, isTrending: !article.isTrending })}
                    disabled={toggleTrendingMutation.isLoading}
                    title={article.isTrending ? 'Remove from trending' : 'Mark as trending'}
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
                    onClick={() => { setEditing(article); setView('edit'); }}
                    className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${article.title}"?`)) deleteMutation.mutate(article._id);
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
      </AdminLayout>
    </>
  );
};

export default AdminNewsPage;
