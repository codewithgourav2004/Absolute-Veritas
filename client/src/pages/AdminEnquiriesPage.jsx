import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import AdminLayout from '../components/Admin/AdminLayout';
import { formatDate } from '../utils/helpers';

const CATEGORY_TABS = [
  { label: 'All',            value: '' },
  { label: 'Certification',  value: 'Certification' },
  { label: 'Testing',        value: 'Testing' },
  { label: 'Inspection',     value: 'Inspection' },
  { label: 'IT Compliance',  value: 'IT Compliance' },
  { label: 'Consultation',   value: 'Consultation' },
  { label: 'Others',         value: 'Others' },
];

const CATEGORY_BADGE = {
  Certification:   'bg-blue-50 text-blue-700 border-blue-200',
  Testing:         'bg-amber-50 text-amber-700 border-amber-200',
  Inspection:      'bg-green-50 text-green-700 border-green-200',
  'IT Compliance': 'bg-purple-50 text-purple-700 border-purple-200',
  Consultation:    'bg-crimson/10 text-crimson border-crimson/20',
  Others:          'bg-gray-100 text-gray-600 border-gray-200',
};

const CATEGORY_ACTIVE = {
  '':              'bg-indigo text-white border-indigo shadow',
  Certification:   'bg-blue-600 text-white border-blue-600 shadow',
  Testing:         'bg-amber-500 text-white border-amber-500 shadow',
  Inspection:      'bg-green-600 text-white border-green-600 shadow',
  'IT Compliance': 'bg-purple-600 text-white border-purple-600 shadow',
  Consultation:    'bg-crimson text-white border-crimson shadow',
  Others:          'bg-gray-500 text-white border-gray-500 shadow',
};

const CATEGORY_BAR = {
  Certification:   '#2563eb',
  Testing:         '#f59e0b',
  Inspection:      '#16a34a',
  'IT Compliance': '#9333ea',
  Consultation:    '#E63946',
  Others:          '#6b7280',
};

const STATUS_STYLES = {
  'new':         'bg-blue-50 text-blue-700 border-blue-200',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'resolved':    'bg-green-50 text-green-700 border-green-200',
};

const STATUS_LABEL = {
  'new':         'New',
  'in-progress': 'In Progress',
  'resolved':    'Resolved',
};

const ALLOWED_NEXT = {
  'new':         ['in-progress', 'resolved'],
  'in-progress': ['resolved'],
  'resolved':    ['in-progress'],
};

const StatCard = ({ label, count, icon, active, onClick, accent }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-[120px] flex flex-col gap-1 px-5 py-4 rounded-2xl border-2 transition-all text-left ${
      active
        ? `border-transparent shadow-lg text-white`
        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md text-indigo'
    }`}
    style={active ? { backgroundColor: accent } : {}}
  >
    <div className="flex items-center justify-between">
      <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-white/70' : 'text-steel'}`}>
        {label}
      </span>
      <span className="text-lg">{icon}</span>
    </div>
    <span className={`text-3xl font-black font-display ${active ? 'text-white' : 'text-indigo'}`}>
      {count}
    </span>
  </button>
);

const AdminEnquiriesPage = () => {
  const [statusFilter,   setStatusFilter]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [unreadFilter,   setUnreadFilter]   = useState(false);
  const [expandedId,     setExpandedId]     = useState(null);
  const [localRead,      setLocalRead]      = useState(new Set());
  const [localUnread,    setLocalUnread]    = useState(new Set());
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const qc = useQueryClient();

  // Always fetch all for accurate stats, filter client-side for category
  const { data: allEnquiries = [], isLoading } = useQuery(
    ['admin-enquiries', unreadFilter ? '' : statusFilter, categoryFilter],
    () => {
      const params = new URLSearchParams();
      // When unread filter is on, skip status filter — unread spans all statuses
      if (!unreadFilter && statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const qs = params.toString();
      return api.get(qs ? `/enquiries?${qs}` : '/enquiries').then((r) => r.data);
    },
    { onSuccess: () => { setLocalRead(new Set()); setLocalUnread(new Set()); } }
  );

  // Fetch all for stats (no filter)
  const { data: allForStats = [] } = useQuery(
    'admin-enquiries-stats',
    () => api.get('/enquiries').then((r) => r.data),
    { staleTime: 30000 }
  );

  const updateMutation = useMutation(
    ({ id, ...patch }) => api.put(`/enquiries/${id}`, patch),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-enquiries');
        qc.invalidateQueries('admin-enquiries-stats');
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/enquiries/${id}`),
    {
      onSuccess: () => {
        setDeleteConfirm(null);
        setExpandedId(null);
        qc.invalidateQueries('admin-enquiries');
        qc.invalidateQueries('admin-enquiries-stats');
      },
    }
  );

  const isEffectivelyRead = (enq) => {
    if (localUnread.has(enq._id)) return false;
    return enq.isRead || localRead.has(enq._id);
  };

  const markRead = (id) => {
    setLocalRead((prev) => new Set([...prev, id]));
    setLocalUnread((prev) => { const s = new Set(prev); s.delete(id); return s; });
    updateMutation.mutate({ id, isRead: true });
  };

  const markUnread = (id) => {
    setLocalUnread((prev) => new Set([...prev, id]));
    setLocalRead((prev) => { const s = new Set(prev); s.delete(id); return s; });
    updateMutation.mutate({ id, isRead: false });
  };

  const handleExpand = (enq) => {
    const isOpening = expandedId !== enq._id;
    setExpandedId(isOpening ? enq._id : null);
    if (isOpening && !isEffectivelyRead(enq)) markRead(enq._id);
  };

  const enquiries   = unreadFilter
    ? allEnquiries.filter((e) => !isEffectivelyRead(e))
    : allEnquiries;
  const unreadCount = allEnquiries.filter((e) => !isEffectivelyRead(e)).length;
  const catCounts   = enquiries.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + 1; return a; }, {});

  // Stats always from full unfiltered data
  const totalCount    = allForStats.length;
  const newCount      = allForStats.filter((e) => e.status === 'new').length;
  const progressCount = allForStats.filter((e) => e.status === 'in-progress').length;
  const resolvedCount = allForStats.filter((e) => e.status === 'resolved').length;
  const unreadTotal   = allForStats.filter((e) => !e.isRead).length;

  return (
    <>
      <Helmet><title>Admin — Enquiries | Absolute Veritas</title></Helmet>
      <AdminLayout title="Enquiries">

        {/* ── Stat cards ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard
            label="Total"    count={totalCount}    icon="📋"
            active={statusFilter === '' && !unreadFilter} accent="#1A1F3C"
            onClick={() => { setStatusFilter(''); setUnreadFilter(false); }}
          />
          <StatCard
            label="New"      count={newCount}       icon="🆕"
            active={statusFilter === 'new' && !unreadFilter} accent="#2563eb"
            onClick={() => { setStatusFilter('new'); setUnreadFilter(false); }}
          />
          <StatCard
            label="In Progress" count={progressCount} icon="⏳"
            active={statusFilter === 'in-progress' && !unreadFilter} accent="#d97706"
            onClick={() => { setStatusFilter('in-progress'); setUnreadFilter(false); }}
          />
          <StatCard
            label="Resolved" count={resolvedCount}  icon="✅"
            active={statusFilter === 'resolved' && !unreadFilter} accent="#16a34a"
            onClick={() => { setStatusFilter('resolved'); setUnreadFilter(false); }}
          />
          <StatCard
            label="Unread"   count={unreadTotal}    icon="📬"
            active={unreadFilter} accent="#E63946"
            onClick={() => { setUnreadFilter((prev) => !prev); setStatusFilter(''); }}
          />
        </div>

        {/* ── Unread alert ── */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-3 bg-crimson/5 border border-crimson/20 rounded-xl px-4 py-3 mb-5">
            <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-pulse flex-shrink-0" />
            <p className="text-sm text-crimson font-semibold">
              {unreadCount} unread {unreadCount === 1 ? 'enquiry' : 'enquiries'} in current view
            </p>
            <span className="ml-auto text-xs text-steel">Click a row to expand &amp; auto-mark as read</span>
          </div>
        )}

        {/* ── Category filter ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
          <p className="text-xs font-bold text-steel uppercase tracking-wider mb-3">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCategoryFilter(tab.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  categoryFilter === tab.value
                    ? CATEGORY_ACTIVE[tab.value]
                    : 'bg-gray-50 text-steel border-gray-200 hover:border-indigo hover:text-indigo hover:bg-white'
                }`}
              >
                {tab.label}
                {tab.value && catCounts[tab.value] ? (
                  <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-bold ${
                    categoryFilter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-steel'
                  }`}>
                    {catCounts[tab.value]}
                  </span>
                ) : null}
              </button>
            ))}
            <span className="ml-auto text-xs text-steel self-center font-medium">
              Showing <strong className="text-indigo">{enquiries.length}</strong> {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
            </span>
          </div>
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="text-center py-20 text-steel">Loading...</div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-steel font-medium">No enquiries found for the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {enquiries.map((enq) => {
              const isExpanded = expandedId === enq._id;
              const isUnread   = !isEffectivelyRead(enq);

              return (
                <div
                  key={enq._id}
                  className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-200 ${
                    isUnread ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Row */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors select-none"
                    onClick={() => handleExpand(enq)}
                  >
                    {/* Category colour bar */}
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_BAR[enq.category] || '#1A1F3C' }}
                    />

                    {/* Unread dot */}
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm ${isUnread ? 'font-bold text-indigo' : 'font-semibold text-indigo'}`}>
                          {enq.name}
                        </p>
                        {enq.company && (
                          <span className="text-xs text-steel">· {enq.company}</span>
                        )}
                        {enq.category && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${CATEGORY_BADGE[enq.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {enq.category}
                          </span>
                        )}
                        {isUnread && (
                          <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-steel mt-0.5 truncate max-w-lg">{enq.message}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-steel hidden sm:block">{formatDate(enq.createdAt, true)}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[enq.status]}`}>
                        {STATUS_LABEL[enq.status]}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/60">

                      {/* Info grid */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm mb-5 bg-white rounded-xl border border-gray-100 p-4">
                        {[
                          ['Email',    enq.email,    `mailto:${enq.email}`],
                          ['Phone',    enq.phone,    `tel:${enq.phone}`],
                          ['Company',  enq.company],
                          ['Category', enq.category],
                          ['Service',  enq.service],
                          ['Received', formatDate(enq.createdAt, true)],
                        ].map(([label, value, href]) =>
                          value ? (
                            <div key={label} className="flex gap-2 items-start">
                              <span className="text-steel font-semibold w-20 flex-shrink-0 text-xs uppercase tracking-wide pt-0.5">{label}</span>
                              {href ? (
                                <a href={href} className="text-crimson hover:underline font-medium">{value}</a>
                              ) : label === 'Category' ? (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${CATEGORY_BADGE[value] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                  {value}
                                </span>
                              ) : (
                                <span className="text-indigo font-medium">{value}</span>
                              )}
                            </div>
                          ) : null
                        )}
                      </div>

                      {/* Message */}
                      <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-crimson p-4 text-sm text-indigo leading-relaxed mb-5 whitespace-pre-wrap">
                        {enq.message}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap bg-white rounded-xl border border-gray-100 px-4 py-3">

                        {/* Read toggle */}
                        <button
                          onClick={() => isUnread ? markRead(enq._id) : markUnread(enq._id)}
                          className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
                            isUnread
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-white text-steel border-gray-200 hover:border-amber-400 hover:text-amber-600'
                          }`}
                        >
                          {isUnread ? (
                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Mark as Read</>
                          ) : (
                            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Mark Unread</>
                          )}
                        </button>

                        <div className="w-px h-5 bg-gray-200 mx-1" />

                        <span className="text-xs text-steel font-semibold">Move to:</span>

                        {/* Current status — non-clickable */}
                        <span className={`text-xs font-semibold px-3 py-2 rounded-lg border cursor-default ${STATUS_STYLES[enq.status]}`}>
                          ✓ {STATUS_LABEL[enq.status]}
                        </span>

                        {/* Allowed next states */}
                        {ALLOWED_NEXT[enq.status].map((s) => (
                          <button
                            key={s}
                            disabled={updateMutation.isLoading}
                            onClick={() => updateMutation.mutate({ id: enq._id, status: s })}
                            className="text-xs font-semibold px-3 py-2 rounded-lg border bg-white text-steel border-gray-200 hover:border-indigo hover:text-white hover:bg-indigo transition-colors disabled:opacity-50"
                          >
                            → {STATUS_LABEL[s]}
                          </button>
                        ))}

                        <div className="ml-auto flex items-center gap-2">
                          {enq.email && (
                            <a
                              href={`mailto:${enq.email}?subject=Re: Your Enquiry — Absolute Veritas`}
                              className="text-xs font-semibold px-4 py-2 rounded-lg bg-crimson hover:bg-indigo text-white transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                              Reply via Email
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(enq)}
                            className="text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* ── Delete confirmation modal ── */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-indigo text-base">Delete Enquiry</h3>
                  <p className="text-xs text-steel">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-5">
                Are you sure you want to delete the enquiry from{' '}
                <strong className="text-indigo">{deleteConfirm.name}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-steel hover:border-indigo hover:text-indigo transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleteMutation.isLoading}
                  onClick={() => deleteMutation.mutate(deleteConfirm._id)}
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminEnquiriesPage;
