import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { SERVICE_CATEGORIES } from '../../utils/constants';

const QuickEnquiry = () => {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      setError('');
      await api.post('/enquiries', data);
      setSent(true);
      reset();
      // auto-close after success, but keep panel open so user sees the confirmation
      setTimeout(() => { setSent(false); setOpen(false); }, 3000);
    } catch (err) {
      // #7 — error keeps panel open; error message persists
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-crimson text-white px-5 py-3 rounded-full shadow-2xl font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
      >
        💬 Quick Enquiry
      </button>

      {open && (
        // #6 — backdrop click closes the modal
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-crimson">✕</button>
            <h3 className="font-display font-bold text-indigo text-lg mb-4">Quick Enquiry</h3>

            {sent ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-semibold">Submitted!</p>
                <p className="text-steel text-xs mt-1">We'll call you back shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <input
                  {...register('name', { required: true })}
                  placeholder="Your Name *"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                />
                <input
                  {...register('phone', { required: true })}
                  placeholder="Phone Number *"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                />
                <input
                  {...register('email')}
                  placeholder="Email"
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                />
                {/* #5 — service category dropdown */}
                <select
                  {...register('category')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson bg-white text-gray-500"
                >
                  <option value="">Select Service Category</option>
                  {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea
                  {...register('message', { required: true })}
                  placeholder="Brief requirement *"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-crimson resize-none"
                />
                {/* #7 — error stays visible, doesn't dismiss panel */}
                {error && <p className="text-red-600 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickEnquiry;
