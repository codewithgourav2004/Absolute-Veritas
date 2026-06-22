import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import AdminLayout from '../components/Admin/AdminLayout';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const NEWS_CATEGORIES = ['General', 'BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE', 'FCC', 'IT Compliance'];

const normalizeImg = (url) => {
  if (!url) return null;
  return url.replace(/^https?:\/\/localhost:\d+/, '');
};

const toHtml = (text) =>
  text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n');

// ── NewsletterForm ────────────────────────────────────────────────────────────
const NewsletterForm = ({ initial, onSaved, onCancel }) => {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(initial?.coverImage || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
      content:     initial?.content || '',
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
      const payload = {
        ...data,
        year: parseInt(data.year, 10),
        content: data.content ? toHtml(data.content) : '',
      };
      return initial
        ? api.put(`/newsletters/${initial._id}`, payload)
        : api.post('/newsletters', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-newsletters');
        qc.invalidateQueries('newsletters');
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
          <div className="flex gap-4 items-start">
            <div
              className="w-32 h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-pearl flex-shrink-0 cursor-pointer hover:border-crimson transition-colors"
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
                {uploading ? 'Uploading...' : 'Upload Cover'}
              </button>
              <p className="text-xs text-steel">or paste a URL below</p>
              <input
                {...register('coverImage')}
                placeholder="https://example.com/newsletter-cover.jpg"
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
          <label className="block text-sm font-medium text-indigo mb-1">Full Content</label>
          <p className="text-xs text-steel mb-2">Write the newsletter article here. Double newline = new paragraph. Leave blank if PDF-only.</p>
          <textarea
            {...register('content')}
            rows={14}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y font-mono leading-relaxed"
            placeholder="Write your newsletter content here...&#10;&#10;Start a new paragraph by leaving a blank line."
          />
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

        {/* PDF Link */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">PDF Link</label>
          <input
            {...register('pdfLink')}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
            placeholder="https://example.com/newsletter-june-2026.pdf"
          />
          <p className="text-xs text-steel mt-1">Direct link to the PDF file or cloud storage URL.</p>
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
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(initial?.coverImage || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
      content:     initial?.content || '',
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
      const payload = {
        ...data,
        tags:    data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        content: toHtml(data.content),
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="font-display font-bold text-indigo text-2xl mb-6">
        {initial ? 'Edit News Article' : 'New News Article'}
      </h2>

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
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
          <label className="block text-sm font-medium text-indigo mb-1">
            Content * <span className="text-steel font-normal">(separate paragraphs with a blank line)</span>
          </label>
          <textarea
            {...register('content', { required: 'Content is required' })}
            rows={12}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y font-mono ${errors.content ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="Write your article content here. Leave a blank line between paragraphs..."
          />
          {errors.content && <p className="text-crimson text-xs mt-1">{errors.content.message}</p>}
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

  // Newsletters data
  const { data: newsletters = [], isLoading: nlLoading } = useQuery('admin-newsletters', () =>
    api.get('/newsletters').then((r) => r.data)
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
        title={!isFormView ? undefined : undefined}
        action={null}
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
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-indigo/10 flex-shrink-0">
                      {nl.coverImage ? (
                        <img src={normalizeImg(nl.coverImage)} alt={nl.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo to-indigo/60 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-indigo text-sm truncate">{nl.title}</p>
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
                          onClick={() => { setEditing(nl); setView('edit'); }}
                          className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                        >
                          Edit
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
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-indigo/10 flex-shrink-0">
                      {article.coverImage ? (
                        <img src={normalizeImg(article.coverImage)} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo to-indigo/60" />
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
                        onClick={() => { setEditing(article); setView('edit'); }}
                        className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors"
                      >
                        Edit
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
                <div className="grid grid-cols-[1fr_130px_110px_100px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-steel uppercase tracking-wide">
                  <span>Email / Name</span>
                  <span>Mobile</span>
                  <span>Subscribed</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {subscribers.map((sub, i) => (
                  <div
                    key={sub._id}
                    className={`grid grid-cols-[1fr_130px_110px_100px_80px] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors ${i < subscribers.length - 1 ? 'border-b border-gray-100' : ''}`}
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
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${sub.email} from subscribers?`))
                            deleteSubMutation.mutate(sub._id);
                        }}
                        className="text-xs text-crimson hover:text-red-700 px-2.5 py-1 rounded-lg border border-crimson/30 hover:border-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
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
