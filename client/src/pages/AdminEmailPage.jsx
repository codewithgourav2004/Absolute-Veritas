import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import api from '../utils/api';
import AdminLayout from '../components/Admin/AdminLayout';

const MAX_ATTACH_MB = 10;
const MAX_FILES     = 5;

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (mime) => {
  if (mime === 'application/pdf') return '📄';
  if (mime.startsWith('image/'))  return '🖼️';
  if (mime.includes('word'))      return '📝';
  if (mime.includes('sheet') || mime.includes('excel')) return '📊';
  return '📎';
};

// ── AdminEmailPage ─────────────────────────────────────────────────────────────
const AdminEmailPage = () => {
  const [subject,      setSubject]      = useState('');
  const [body,         setBody]         = useState('');
  const [htmlMode,     setHtmlMode]     = useState(false);
  const [selected,     setSelected]     = useState(new Set());   // subscriber _id set
  const [search,       setSearch]       = useState('');
  const [attachments,  setAttachments]  = useState([]);          // File objects
  const [dragging,     setDragging]     = useState(false);
  const [sending,      setSending]      = useState(false);
  const [result,       setResult]       = useState(null);        // { message, sent, failed } | null
  const [error,        setError]        = useState('');
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const fileRef = useRef(null);

  // ── fetch subscribers ───────────────────────────────────────────────────────
  const { data: subscribers = [], isLoading } = useQuery(
    'email-subscribers',
    () => api.get('/subscribers').then((r) => r.data),
    { staleTime: 60_000 }
  );

  const active   = subscribers.filter((s) => s.isActive);
  const filtered = active.filter((s) =>
    !search.trim() ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── selection helpers ───────────────────────────────────────────────────────
  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s._id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s._id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s._id));
        return next;
      });
    }
  };

  const selectAllActive = () => setSelected(new Set(active.map((s) => s._id)));
  const clearSelection  = () => setSelected(new Set());

  // ── attachment helpers ──────────────────────────────────────────────────────
  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList);
    setAttachments((prev) => {
      const combined = [...prev];
      for (const f of incoming) {
        if (combined.length >= MAX_FILES) break;
        if (f.size > MAX_ATTACH_MB * 1024 * 1024) {
          alert(`"${f.name}" exceeds ${MAX_ATTACH_MB} MB limit and was skipped.`);
          continue;
        }
        if (!combined.find((x) => x.name === f.name && x.size === f.size)) {
          combined.push(f);
        }
      }
      return combined;
    });
  }, []);

  const removeAttachment = (idx) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── send ────────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    setResult(null);
    setError('');

    const fd = new FormData();
    fd.append('subject', subject.trim());
    fd.append('body', body.trim());
    fd.append('recipientIds', JSON.stringify([...selected]));
    attachments.forEach((f) => fd.append('attachments', f));

    try {
      const res = await api.post('/subscribers/send-email', fd, {
        headers: { 'Content-Type': undefined },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Send failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim() && body.trim() && selected.size > 0 && !sending;

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet><title>Admin — Send Email | Absolute Veritas</title></Helmet>
      <AdminLayout title="Send Email">

        {result && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="font-semibold text-green-800 text-sm">{result.message}</p>
              {result.failed > 0 && (
                <p className="text-xs text-amber-700 mt-1">{result.failed} delivery failure{result.failed > 1 ? 's' : ''} — check server logs.</p>
              )}
            </div>
            <button onClick={() => setResult(null)} className="ml-auto text-green-500 hover:text-green-700 text-lg leading-none">&times;</button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-crimson flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm text-crimson font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-crimson/60 hover:text-crimson text-lg leading-none">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Compose + Attachments ────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Compose card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-display font-bold text-indigo text-lg mb-5">Compose Message</h2>

              {/* Subject */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-indigo mb-1.5">Subject *</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Compliance Update — June 2026"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-indigo">Message *</label>
                  <button
                    type="button"
                    onClick={() => setHtmlMode((v) => !v)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
                      htmlMode
                        ? 'bg-indigo text-white border-indigo'
                        : 'text-steel border-gray-200 hover:border-indigo hover:text-indigo'
                    }`}
                  >
                    {htmlMode ? '</> HTML mode' : 'Plain text'}
                  </button>
                </div>
                <p className="text-xs text-steel mb-2">
                  {htmlMode
                    ? 'Enter raw HTML. It will be injected into the branded email wrapper.'
                    : 'Plain text — leave a blank line between paragraphs. Will be auto-formatted.'}
                </p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={14}
                  placeholder={htmlMode
                    ? '<p>Hello,</p>\n<p>Please find the latest compliance update below.</p>'
                    : 'Hello,\n\nPlease find the latest compliance update below.\n\nBest regards,\nAbsolute Veritas'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Attachments card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-indigo text-lg">Attachments</h2>
                <span className="text-xs text-steel">{attachments.length}/{MAX_FILES} files · max {MAX_ATTACH_MB} MB each</span>
              </div>

              {/* Drop zone */}
              {attachments.length < MAX_FILES && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-colors ${
                    dragging ? 'border-crimson bg-red-50' : 'border-gray-200 hover:border-indigo hover:bg-indigo/5'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  <p className="text-sm font-semibold text-steel">{dragging ? 'Drop files here' : 'Click or drag files here'}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, images, Word, Excel — up to {MAX_FILES} files</p>
                </div>
              )}

              {/* Attached files list */}
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="text-xl flex-shrink-0">{fileIcon(f.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-indigo truncate">{f.name}</p>
                        <p className="text-xs text-steel">{fmtSize(f.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-gray-400 hover:text-crimson transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Right: Recipients ───────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              <h2 className="font-display font-bold text-indigo text-lg mb-4">Recipients</h2>

              {/* Search */}
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subscribers…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-crimson transition-colors"
                />
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-crimson"
                  />
                  <span className="text-xs font-semibold text-indigo">
                    {allFilteredSelected ? 'Deselect shown' : 'Select shown'}
                  </span>
                </label>
                <button onClick={selectAllActive} className="text-xs text-indigo border border-indigo/30 px-2.5 py-1 rounded-lg hover:bg-indigo hover:text-white transition-colors font-semibold">
                  All active
                </button>
                {selected.size > 0 && (
                  <button onClick={clearSelection} className="text-xs text-steel border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors font-semibold ml-auto">
                    Clear
                  </button>
                )}
              </div>

              {/* Count badge */}
              <div className="mb-3 text-xs font-semibold text-steel">
                {selected.size} selected &nbsp;·&nbsp; {active.length} active subscribers
              </div>

              {/* Subscriber list */}
              <div className="overflow-y-auto max-h-80 -mx-1 px-1 space-y-1">
                {isLoading ? (
                  <p className="text-sm text-steel text-center py-8">Loading…</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-steel text-center py-8">No subscribers found.</p>
                ) : (
                  filtered.map((sub) => (
                    <label
                      key={sub._id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        selected.has(sub._id) ? 'bg-red-50 border border-crimson/20' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(sub._id)}
                        onChange={() => toggleOne(sub._id)}
                        className="w-4 h-4 accent-crimson flex-shrink-0"
                      />
                      <div className="min-w-0">
                        {sub.name && (
                          <p className="text-xs font-semibold text-indigo truncate">{sub.name}</p>
                        )}
                        <p className="text-xs text-steel truncate">{sub.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Send button */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setResult(null); setError(''); setConfirmOpen(true); }}
                  disabled={!canSend}
                  className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                      Send to {selected.size} recipient{selected.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
                {!canSend && !sending && (
                  <p className="text-xs text-steel text-center mt-2">
                    {!subject.trim() ? 'Add a subject' : !body.trim() ? 'Add a message' : 'Select at least one recipient'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Confirm modal ─────────────────────────────────────────────────── */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
              <h3 className="font-display font-bold text-indigo text-xl mb-2">Confirm Send</h3>
              <p className="text-sm text-steel mb-1">
                Subject: <span className="font-semibold text-indigo">"{subject}"</span>
              </p>
              <p className="text-sm text-steel mb-1">
                Recipients: <span className="font-semibold text-indigo">{selected.size} subscriber{selected.size !== 1 ? 's' : ''}</span>
              </p>
              {attachments.length > 0 && (
                <p className="text-sm text-steel mb-4">
                  Attachments: <span className="font-semibold text-indigo">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</span>
                </p>
              )}
              <p className="text-xs text-steel mb-6 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                This action cannot be undone. Emails will be sent immediately.
              </p>
              <div className="flex gap-3">
                <button onClick={handleSend} className="flex-1 btn-primary py-3">
                  Yes, Send Now
                </button>
                <button onClick={() => setConfirmOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-steel hover:bg-gray-50 text-sm font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminEmailPage;
