import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import * as XLSX from 'xlsx';
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

const fileIcon = (mime = '') => {
  if (mime === 'application/pdf') return '📄';
  if (mime.startsWith('image/'))  return '🖼️';
  if (mime.includes('word'))      return '📝';
  if (mime.includes('sheet') || mime.includes('excel')) return '📊';
  return '📎';
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Parse Excel / CSV file and return [{email, name}]
const parseExcel = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb  = XLSX.read(e.target.result, { type: 'array' });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows.length) { resolve([]); return; }

      // Detect column names case-insensitively
      const keys   = Object.keys(rows[0]);
      const emailK = keys.find((k) => /email/i.test(k)) || keys[0];
      const nameK  = keys.find((k) => /name/i.test(k) && !/email/i.test(k));

      const result = rows
        .map((r) => ({
          email: String(r[emailK] || '').trim().toLowerCase(),
          name:  nameK ? String(r[nameK] || '').trim() : '',
        }))
        .filter((r) => isValidEmail(r.email));

      resolve(result);
    } catch (err) {
      reject(err);
    }
  };
  reader.onerror = reject;
  reader.readAsArrayBuffer(file);
});

// ── AdminEmailPage ─────────────────────────────────────────────────────────────
const AdminEmailPage = () => {
  // Compose
  const [subject,     setSubject]     = useState('');
  const [body,        setBody]        = useState('');
  const [htmlMode,    setHtmlMode]    = useState(false);

  // Subscriber selection (existing DB subscribers)
  const [selected,    setSelected]    = useState(new Set());
  const [search,      setSearch]      = useState('');

  // Extra / custom recipients (manual + excel)
  const [extras,      setExtras]      = useState([]); // [{email, name, source}]
  const [addToList,   setAddToList]   = useState(false);

  // Manual add
  const [manualEmail, setManualEmail] = useState('');
  const [manualName,  setManualName]  = useState('');
  const [manualErr,   setManualErr]   = useState('');

  // Excel import
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const [xlsxInfo,    setXlsxInfo]    = useState('');
  const xlsxRef = useRef(null);

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [dragging,    setDragging]    = useState(false);
  const attachRef = useRef(null);

  // Send state
  const [sending,     setSending]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── fetch existing subscribers ──────────────────────────────────────────────
  const { data: subscribers = [], isLoading } = useQuery(
    'email-subscribers',
    () => api.get('/subscribers').then((r) => r.data),
    { staleTime: 60000 }
  );

  const active   = subscribers.filter((s) => s.isActive);
  const filtered = active.filter((s) =>
    !search.trim() ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // ── subscriber selection ────────────────────────────────────────────────────
  const toggleOne = (id) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s._id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((s) => n.delete(s._id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((s) => n.add(s._id)); return n; });
    }
  };

  const selectAllActive = () => setSelected(new Set(active.map((s) => s._id)));
  const clearSelection  = () => setSelected(new Set());

  // ── extra recipients ────────────────────────────────────────────────────────
  const addExtra = (email, name, source) => {
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return false;
    setExtras((prev) => {
      if (prev.find((x) => x.email === e)) return prev;
      return [...prev, { email: e, name: name.trim(), source }];
    });
    return true;
  };

  const removeExtra = (email) =>
    setExtras((prev) => prev.filter((x) => x.email !== email));

  const clearExtras = () => setExtras([]);

  // Manual add
  const handleManualAdd = () => {
    setManualErr('');
    if (!manualEmail.trim()) { setManualErr('Enter an email address.'); return; }
    if (!isValidEmail(manualEmail)) { setManualErr('Invalid email format.'); return; }
    const added = addExtra(manualEmail, manualName, 'manual');
    if (!added) { setManualErr('This email is already in the list.'); return; }
    setManualEmail('');
    setManualName('');
  };

  // Excel import
  const handleExcelImport = async (file) => {
    if (!file) return;
    setXlsxLoading(true);
    setXlsxInfo('');
    try {
      const rows = await parseExcel(file);
      if (!rows.length) { setXlsxInfo('No valid email addresses found in the file.'); return; }
      let added = 0;
      rows.forEach((r) => { if (addExtra(r.email, r.name, 'excel')) added++; });
      setXlsxInfo(`Imported ${added} of ${rows.length} row${rows.length !== 1 ? 's' : ''} (${rows.length - added} duplicate${rows.length - added !== 1 ? 's' : ''} skipped).`);
    } catch {
      setXlsxInfo('Could not parse the file. Make sure it is a valid .xlsx, .xls, or .csv file.');
    } finally {
      setXlsxLoading(false);
      if (xlsxRef.current) xlsxRef.current.value = '';
    }
  };

  // ── attachments ─────────────────────────────────────────────────────────────
  const addFiles = useCallback((fileList) => {
    setAttachments((prev) => {
      const combined = [...prev];
      for (const f of Array.from(fileList)) {
        if (combined.length >= MAX_FILES) break;
        if (f.size > MAX_ATTACH_MB * 1024 * 1024) { alert(`"${f.name}" exceeds ${MAX_ATTACH_MB} MB and was skipped.`); continue; }
        if (!combined.find((x) => x.name === f.name && x.size === f.size)) combined.push(f);
      }
      return combined;
    });
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  // ── send ────────────────────────────────────────────────────────────────────
  const totalRecipients = selected.size + extras.length;
  const canSend = subject.trim() && body.trim() && totalRecipients > 0 && !sending;

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    setResult(null);
    setError('');

    const fd = new FormData();
    fd.append('subject',     subject.trim());
    fd.append('body',        body.trim());
    fd.append('recipientIds', JSON.stringify([...selected]));
    fd.append('extraEmails',  JSON.stringify(extras.map(({ email, name }) => ({ email, name }))));
    fd.append('addToList',    String(addToList));
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

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet><title>Admin — Send Email | Absolute Veritas</title></Helmet>
      <AdminLayout title="Send Email">

        {/* Result / error banners */}
        {result && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p className="font-semibold text-green-800 text-sm">{result.message}</p>
              {result.failed > 0 && <p className="text-xs text-amber-700 mt-1">{result.failed} delivery failure{result.failed > 1 ? 's' : ''} — check server logs.</p>}
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

          {/* ── LEFT: Compose + Attachments ──────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Compose */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-display font-bold text-indigo text-lg mb-5">Compose Message</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-indigo mb-1.5">Subject *</label>
                <input
                  value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Important Compliance Update — June 2026"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-indigo">Message *</label>
                  <button type="button" onClick={() => setHtmlMode((v) => !v)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${htmlMode ? 'bg-indigo text-white border-indigo' : 'text-steel border-gray-200 hover:border-indigo hover:text-indigo'}`}>
                    {htmlMode ? '</> HTML mode' : 'Plain text'}
                  </button>
                </div>
                <p className="text-xs text-steel mb-2">
                  {htmlMode ? 'Raw HTML — injected into the branded email wrapper.' : 'Plain text — blank line between paragraphs.'}
                </p>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14}
                  placeholder={htmlMode ? '<p>Hello,</p>\n<p>Please find the update below.</p>' : 'Hello,\n\nPlease find the latest compliance update below.\n\nBest regards,\nAbsolute Veritas'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-y leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-indigo text-lg">Attachments</h2>
                <span className="text-xs text-steel">{attachments.length}/{MAX_FILES} files · max {MAX_ATTACH_MB} MB each</span>
              </div>
              {attachments.length < MAX_FILES && (
                <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
                  onClick={() => attachRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-colors ${dragging ? 'border-crimson bg-red-50' : 'border-gray-200 hover:border-indigo hover:bg-indigo/5'}`}>
                  <input ref={attachRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  <p className="text-sm font-semibold text-steel">{dragging ? 'Drop files here' : 'Click or drag files here'}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, images, Word, Excel — up to {MAX_FILES} files</p>
                </div>
              )}
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="text-xl flex-shrink-0">{fileIcon(f.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-indigo truncate">{f.name}</p>
                        <p className="text-xs text-steel">{fmtSize(f.size)}</p>
                      </div>
                      <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-crimson transition-colors flex-shrink-0">
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

          {/* ── RIGHT: Recipients ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* ── Import & Manual Add ──────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-display font-bold text-indigo text-base mb-4">Add Recipients</h2>

              {/* Excel import */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-2">Import from Excel / CSV</p>
                <div className="flex items-center gap-2">
                  <label className={`flex-1 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer transition-colors text-xs font-semibold ${xlsxLoading ? 'opacity-50 pointer-events-none' : 'hover:border-indigo hover:bg-indigo/5 text-steel hover:text-indigo'}`}>
                    <input ref={xlsxRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                      onChange={(e) => handleExcelImport(e.target.files[0])} />
                    {xlsxLoading ? (
                      <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Reading…</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> Upload .xlsx / .xls / .csv</>
                    )}
                  </label>
                </div>
                {xlsxInfo && (
                  <p className={`text-xs mt-1.5 ${xlsxInfo.startsWith('Imported') ? 'text-green-700' : 'text-amber-700'}`}>{xlsxInfo}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">File must have an <strong>email</strong> column. A <strong>name</strong> column is optional.</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-2">Add manually</p>
                <div className="flex gap-2 mb-2">
                  <input value={manualName} onChange={(e) => setManualName(e.target.value)}
                    placeholder="Name (optional)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-crimson"
                  />
                </div>
                <div className="flex gap-2">
                  <input value={manualEmail} onChange={(e) => { setManualEmail(e.target.value); setManualErr(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                    placeholder="email@example.com *"
                    className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${manualErr ? 'border-crimson' : 'border-gray-200 focus:border-crimson'}`}
                  />
                  <button type="button" onClick={handleManualAdd}
                    className="flex-shrink-0 bg-indigo text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo/90 transition-colors">
                    Add
                  </button>
                </div>
                {manualErr && <p className="text-crimson text-[11px] mt-1">{manualErr}</p>}
              </div>

              {/* Add to subscriber list toggle */}
              {extras.length > 0 && (
                <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none">
                  <div className="relative flex-shrink-0">
                    <input type="checkbox" checked={addToList} onChange={(e) => setAddToList(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-crimson rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-xs text-steel font-medium">Also add imported emails to subscriber list</span>
                </label>
              )}

              {/* Imported / manual recipients list */}
              {extras.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-indigo">{extras.length} custom recipient{extras.length !== 1 ? 's' : ''}</p>
                    <button onClick={clearExtras} className="text-[11px] text-steel hover:text-crimson font-semibold transition-colors">Clear all</button>
                  </div>
                  <div className="overflow-y-auto max-h-40 space-y-1">
                    {extras.map((ex) => (
                      <div key={ex.email} className="flex items-center gap-2 bg-indigo/5 rounded-lg px-3 py-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ex.source === 'excel' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {ex.source === 'excel' ? 'XLS' : 'MAN'}
                        </span>
                        <div className="flex-1 min-w-0">
                          {ex.name && <p className="text-[11px] font-semibold text-indigo truncate">{ex.name}</p>}
                          <p className="text-[11px] text-steel truncate">{ex.email}</p>
                        </div>
                        <button onClick={() => removeExtra(ex.email)} className="text-gray-400 hover:text-crimson flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Existing subscribers ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
              <h2 className="font-display font-bold text-indigo text-base mb-3">Subscribers</h2>

              <div className="relative mb-2.5">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-crimson transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} className="w-3.5 h-3.5 accent-crimson" />
                  <span className="text-[11px] font-semibold text-indigo">{allFilteredSelected ? 'Deselect shown' : 'Select shown'}</span>
                </label>
                <button onClick={selectAllActive} className="text-[11px] text-indigo border border-indigo/30 px-2 py-0.5 rounded-lg hover:bg-indigo hover:text-white transition-colors font-semibold">All active</button>
                {selected.size > 0 && (
                  <button onClick={clearSelection} className="text-[11px] text-steel border border-gray-200 px-2 py-0.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold ml-auto">Clear</button>
                )}
              </div>

              <p className="text-[11px] font-semibold text-steel mb-2">{selected.size} selected · {active.length} active</p>

              <div className="overflow-y-auto max-h-52 -mx-1 px-1 space-y-0.5">
                {isLoading ? (
                  <p className="text-xs text-steel text-center py-6">Loading…</p>
                ) : filtered.length === 0 ? (
                  <p className="text-xs text-steel text-center py-6">No subscribers found.</p>
                ) : filtered.map((sub) => (
                  <label key={sub._id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors ${selected.has(sub._id) ? 'bg-red-50 border border-crimson/20' : 'hover:bg-gray-50 border border-transparent'}`}>
                    <input type="checkbox" checked={selected.has(sub._id)} onChange={() => toggleOne(sub._id)} className="w-3.5 h-3.5 accent-crimson flex-shrink-0" />
                    <div className="min-w-0">
                      {sub.name && <p className="text-[11px] font-semibold text-indigo truncate">{sub.name}</p>}
                      <p className="text-[11px] text-steel truncate">{sub.email}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Send button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-semibold text-steel mb-3 text-center">
                  {totalRecipients} total recipient{totalRecipients !== 1 ? 's' : ''}
                  {selected.size > 0 && extras.length > 0 && (
                    <span className="text-gray-400"> ({selected.size} subscriber{selected.size !== 1 ? 's' : ''} + {extras.length} custom)</span>
                  )}
                </div>
                <button
                  onClick={() => { setResult(null); setError(''); setConfirmOpen(true); }}
                  disabled={!canSend}
                  className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {sending ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Sending…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>Send to {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}</>
                  )}
                </button>
                {!canSend && !sending && (
                  <p className="text-[11px] text-steel text-center mt-2">
                    {!subject.trim() ? 'Add a subject' : !body.trim() ? 'Add a message' : 'Add at least one recipient'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Confirm modal ──────────────────────────────────────────────────── */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
              <h3 className="font-display font-bold text-indigo text-xl mb-3">Confirm Send</h3>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-steel">Subject: <span className="font-semibold text-indigo">"{subject}"</span></p>
                <p className="text-sm text-steel">Recipients: <span className="font-semibold text-indigo">{totalRecipients}</span>
                  {selected.size > 0 && extras.length > 0 && (
                    <span className="text-xs text-gray-400"> ({selected.size} subscribers + {extras.length} custom)</span>
                  )}
                </p>
                {attachments.length > 0 && (
                  <p className="text-sm text-steel">Attachments: <span className="font-semibold text-indigo">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</span></p>
                )}
                {addToList && extras.length > 0 && (
                  <p className="text-sm text-steel">Custom emails will also be <span className="font-semibold text-indigo">added to subscriber list</span></p>
                )}
              </div>
              <p className="text-xs text-steel bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
                Emails will be sent immediately. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={handleSend} className="flex-1 btn-primary py-3">Yes, Send Now</button>
                <button onClick={() => setConfirmOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-steel hover:bg-gray-50 text-sm font-semibold transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminEmailPage;
