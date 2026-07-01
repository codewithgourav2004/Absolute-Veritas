# React Component Template

## Public Component (Light bg)
```jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ComponentName = ({ prop1, prop2, onAction }) => (
  <section className="bg-pearl section-padding">
    <div className="container-max">
      <div className="text-center mb-12">
        <span className="text-sm font-mono font-medium tracking-widest uppercase text-crimson">
          Label
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-indigo mt-2">
          Section Title
        </h2>
      </div>

      {/* Content grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* items */}
      </div>
    </div>
  </section>
);

export default ComponentName;
```

## Dark Panel Component (Dark bg)
```jsx
const DarkComponent = ({ category, onEnquire }) => (
  <div
    className="flex rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl"
    style={{ background: 'linear-gradient(135deg, rgba(11,15,36,0.99) 0%, rgba(17,21,48,0.99) 100%)', height: 640 }}
  >
    {/* Sidebar */}
    <div className="w-[268px] flex-shrink-0 border-r border-white/[0.07] flex flex-col"
         style={{ background: 'rgba(8,11,30,0.6)' }}>
      {/* sidebar content */}
    </div>

    {/* Content panel */}
    <div className="flex-grow overflow-y-auto">
      {/* main content */}
    </div>
  </div>
);
```

## Admin Page Component
```jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AdminLayout from '../components/Admin/AdminLayout';
import api from '../utils/api';

const AdminResourcePage = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: items = [], isLoading } = useQuery(
    'admin-resource',
    () => api.get('/resource').then(r => r.data)
  );

  const save = useMutation(
    (data) => data._id
      ? api.put(`/resource/${data._id}`, data)
      : api.post('/resource', data),
    { onSuccess: () => { qc.invalidateQueries('admin-resource'); setEditing(null); } }
  );

  const remove = useMutation(
    (id) => api.delete(`/resource/${id}`),
    { onSuccess: () => qc.invalidateQueries('admin-resource') }
  );

  if (editing !== null) {
    return (
      <AdminLayout back={() => setEditing(null)}>
        {/* Form */}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* List view */}
    </AdminLayout>
  );
};

export default AdminResourcePage;
```

## Card Component
```jsx
const Card = ({ item, onEnquire }) => (
  <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-crimson/30 hover:shadow-2xl hover:shadow-crimson/8 transition-all duration-300 overflow-hidden flex flex-col">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-crimson via-rose-400 to-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative p-6 flex flex-col flex-grow">
      {/* content */}
    </div>
  </div>
);
```
