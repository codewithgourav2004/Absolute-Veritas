import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setError('');
    try {
      await login(email, password);
      navigate('/admin/blogs');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <>
      <Helmet><title>Admin Login | Absolute Veritas</title></Helmet>
      <div className="min-h-screen bg-indigo flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-black text-indigo">
              Absolute <span className="text-crimson">Veritas</span>
            </h1>
            <p className="text-steel text-sm mt-2">Admin Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-crimson rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo mb-1">Email</label>
              <input
                {...register('email', { required: true })}
                type="email"
                autoComplete="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
                placeholder="admin@absoluteveritas.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-1">Password</label>
              <input
                {...register('password', { required: true })}
                type="password"
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-crimson"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center py-4 text-base"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
