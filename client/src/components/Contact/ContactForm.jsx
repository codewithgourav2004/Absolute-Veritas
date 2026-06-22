import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import { SERVICE_CATEGORIES } from '../../utils/constants';

const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const MAX_MSG = 500;

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ mode: 'onBlur' }); // #1 — validate on blur

  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const messageValue = watch('message', '');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await api.post('/enquiries', data);
      setSuccess(true);
      reset();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  // #3 — animated success card replaces the form entirely
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-indigo text-xl mb-2">Enquiry Submitted!</h3>
        <p className="text-steel text-sm mb-6 max-w-xs">
          Thank you! One of our advisors will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-crimson font-semibold text-sm hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Name *</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors ${
              errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Your full name"
          />
          {errors.name && <p className="text-crimson text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Email *</label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            type="email"
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors ${
              errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="your@company.com"
          />
          {errors.email && <p className="text-crimson text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Phone</label>
          {/* #2 — Indian phone validation */}
          <input
            {...register('phone', {
              pattern: { value: PHONE_RE, message: 'Enter a valid 10-digit Indian mobile number' },
            })}
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors ${
              errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="+91 98765 43210"
          />
          {errors.phone && <p className="text-crimson text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-indigo mb-1">Company</label>
          <input
            {...register('company')}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
            placeholder="Company name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-indigo mb-1">Service Category</label>
        <select
          {...register('category')}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson bg-white"
        >
          <option value="">Select a category</option>
          {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        {/* #4 — character counter */}
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-indigo">Message *</label>
          <span className={`text-xs tabular-nums ${messageValue.length > MAX_MSG ? 'text-crimson font-semibold' : 'text-steel'}`}>
            {messageValue.length}/{MAX_MSG}
          </span>
        </div>
        <textarea
          {...register('message', {
            required: 'Message is required',
            maxLength: { value: MAX_MSG, message: `Message must be ${MAX_MSG} characters or fewer` },
          })}
          rows={4}
          className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-none transition-colors ${
            errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
          placeholder="Describe your requirement..."
        />
        {errors.message && <p className="text-crimson text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Sending...
          </span>
        ) : 'Send Enquiry'}
      </button>
    </form>
  );
};

export default ContactForm;
