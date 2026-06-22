import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';

const ServiceModal = ({ service, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    // #10 — pre-fill message with service name
    defaultValues: {
      message: service ? `I'm interested in ${service.name}. Please share more details.` : '',
    },
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      setError('');
      await api.post('/enquiries', { ...data, service: service?.name });
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  if (!service) return null;

  return (
    // #9 — backdrop click closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-crimson text-xl leading-none">✕</button>

        {/* #8 — inline success card instead of alert() */}
        {success ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-indigo text-xl mb-2">Enquiry Submitted!</h3>
            <p className="text-steel text-sm mb-1">We've received your enquiry about</p>
            <p className="text-crimson font-semibold text-sm mb-6">{service.name}</p>
            <p className="text-steel text-xs mb-6">Our team will contact you within 24 hours.</p>
            <button
              onClick={onClose}
              className="btn-primary px-8 py-2.5 text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display font-bold text-indigo text-xl mb-1">Enquire About</h3>
            <p className="text-crimson font-semibold mb-6">{service.name}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="Your Name *"
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="text-crimson text-xs -mt-2">{errors.name.message}</p>}

              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
                placeholder="Email Address *"
                type="email"
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson transition-colors ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.email && <p className="text-crimson text-xs -mt-2">{errors.email.message}</p>}

              <input
                {...register('phone')}
                placeholder="Phone Number"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
              />
              <input
                {...register('company')}
                placeholder="Company Name"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
              />
              <textarea
                {...register('message', { required: 'Please describe your requirement' })}
                placeholder="Brief requirement *"
                rows={3}
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson resize-none transition-colors ${
                  errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.message && <p className="text-crimson text-xs -mt-2">{errors.message.message}</p>}

              {error && <p className="text-red-600 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Enquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceModal;
