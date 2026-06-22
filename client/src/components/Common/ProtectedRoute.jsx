import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

export default ProtectedRoute;
