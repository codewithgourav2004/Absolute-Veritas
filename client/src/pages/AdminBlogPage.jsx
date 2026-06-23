import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';
import AdminLayout from '../components/Admin/AdminLayout';
import normalizeImg from '../utils/normalizeImg';

const BLOG_CATEGORIES = ['Certification', 'Testing', 'Compliance', 'Industry News', 'General'];

// ── helpers ──────────────────────────────────────────────────────────────────
const toHtml = (text) =>
  text
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');

// Convert stored <p> HTML back to plain text for the textarea
const htmlToText = (html) => {
  if (!html) return '';
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// ── BlogForm ─────────────────────────────────────────────────────────────────
const BlogForm = ({ initial, onSaved, onCancel }) => {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(initial?.coverImage || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title:       initial?.title || '',
      excerpt:     initial?.excerpt || '',
      content:     htmlToText(initial?.content),
      category:    initial?.category || 'Certification',
      tags:        initial?.tags?.join(', ') || '',
      author:      initial?.author || 'Absolute Veritas',
      coverImage:  initial?.coverImage || '',
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
        content: data.content ? toHtml(data.content) : '',
      };
      return initial
        ? api.put(`/blogs/${initial._id}`, payload)
        : api.post('/blogs', payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-blogs');
        onSaved();
      },
    }
  );

  const onFormSubmit = (data) => {
    if (!data.content?.trim()) {
      setError('content', { message: 'Content is required' });
      return;
    }
    saveMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="font-display font-bold text-indigo text-2xl mb-6">
        {initial ? 'Edit Blog Post' : 'New Blog Post'}
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Cover image */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-2">Cover Image</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* Preview area */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '16/7' }}>
            {(preview || coverImage) ? (
              <>
                <img
                  src={normalizeImg(preview || coverImage)}
                  alt="cover"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="bg-white text-indigo text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-indigo hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? 'Uploading…' : 'Change Image'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPreview(''); setValue('coverImage', ''); }}
                    className="bg-white text-crimson text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-crimson hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove
                  </button>
                </div>
                {/* Image filename badge */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="bg-black/50 text-white text-[11px] px-2 py-1 rounded-lg truncate max-w-xs backdrop-blur-sm">
                    {(preview || coverImage || '').split('/').pop().split('?')[0]}
                  </span>
                  <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                    ✓ Image set
                  </span>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo hover:bg-indigo/5 transition-all cursor-pointer w-full"
              >
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

          {/* URL paste fallback */}
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
            placeholder="e.g. BIS CRS Registration: Complete Guide for 2025"
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
            placeholder="One or two sentences shown on the blog listing card."
          />
          {errors.excerpt && <p className="text-crimson text-xs mt-1">{errors.excerpt.message}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Content *</label>
          <p className="text-xs text-steel mb-2">Write plain text. Leave a blank line between paragraphs — the template handles all formatting automatically.</p>
          <textarea
            {...register('content')}
            rows={16}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y leading-relaxed ${errors.content ? 'border-red-400' : 'border-gray-200'}`}
            placeholder={"Start writing your blog post here.\n\nLeave a blank line to start a new paragraph.\n\nKeep writing naturally — no formatting needed."}
          />
          {errors.content && <p className="text-crimson text-xs mt-1">{errors.content.message}</p>}
        </div>

        {/* Category + Author row */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-indigo mb-1">Category</label>
            <select
              {...register('category')}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson bg-white"
            >
              {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
            {saveMutation.isLoading ? 'Saving...' : initial ? 'Update Post' : 'Create Post'}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-lg border border-gray-200 text-steel hover:bg-gray-50 text-sm font-semibold transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ── AdminBlogPage ─────────────────────────────────────────────────────────────
const AdminBlogPage = () => {
  const qc = useQueryClient();
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const { data, isLoading } = useQuery('admin-blogs', () =>
    api.get('/blogs?limit=100').then((r) => r.data)
  );
  const blogs = data?.blogs || [];

  const deleteMutation = useMutation(
    (id) => api.delete(`/blogs/${id}`),
    { onSuccess: () => qc.invalidateQueries('admin-blogs') }
  );

  const handleEdit = async (blog) => {
    setEditLoading(blog._id);
    try {
      const res = await api.get(`/blogs/${blog.slug}`);
      setEditing(res.data);
    } catch {
      setEditing(blog);
    } finally {
      setEditLoading(false);
    }
    setView('edit');
  };

  const closeForm = () => { setView('list'); setEditing(null); };

  return (
    <>
      <Helmet><title>Admin — Blog | Absolute Veritas</title></Helmet>
      <AdminLayout
        title={view === 'list' ? 'Blog Posts' : undefined}
        action={
          view === 'list' ? (
            <button onClick={() => setView('new')} className="btn-primary px-6 py-2.5 text-sm">
              + New Post
            </button>
          ) : null
        }
      >
        {view !== 'list' ? (
          <BlogForm
            initial={view === 'edit' ? editing : null}
            onSaved={closeForm}
            onCancel={closeForm}
          />
        ) : isLoading ? (
          <div className="text-center py-20 text-steel">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <p className="text-steel mb-6">No blog posts yet.</p>
            <button onClick={() => setView('new')} className="btn-primary px-8 py-3">
              Create your first post
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {blogs.map((blog, i) => (
              <div
                key={blog._id}
                className={`flex items-center gap-5 px-5 py-4 hover:bg-gray-50/70 transition-colors ${i < blogs.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                {/* Thumbnail */}
                <div className="w-20 h-[52px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                  {blog.coverImage ? (
                    <img
                      src={normalizeImg(blog.coverImage)}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo via-indigo/80 to-crimson/60 flex items-center justify-center">
                      <span className="text-white font-black text-lg leading-none select-none">
                        {blog.title?.charAt(0)?.toUpperCase() || 'B'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-indigo text-sm leading-snug truncate mb-1">{blog.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-white bg-crimson/80 px-2 py-0.5 rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-xs text-steel">{formatDate(blog.publishedAt)}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${blog.isPublished ? 'text-green-700 bg-green-100' : 'text-amber-700 bg-amber-100'}`}>
                      {blog.isPublished ? '● Published' : '○ Draft'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {blog.isPublished && (
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-steel hover:text-indigo px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo transition-colors font-medium"
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(blog)}
                    disabled={editLoading === blog._id}
                    className="text-xs text-indigo hover:bg-indigo hover:text-white px-3 py-1.5 rounded-lg border border-indigo/30 hover:border-indigo transition-all font-medium disabled:opacity-60 flex items-center gap-1"
                  >
                    {editLoading === blog._id ? (
                      <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Loading…</>
                    ) : 'Edit'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${blog.title}"?`)) deleteMutation.mutate(blog._id);
                    }}
                    className="text-xs text-crimson hover:bg-crimson hover:text-white px-3 py-1.5 rounded-lg border border-crimson/30 hover:border-crimson transition-all font-medium"
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

export default AdminBlogPage;
