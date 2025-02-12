import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { restoreAuth } from '../Redux/Slices/LoginSlices';
import React from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles: string[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.login);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  if (!isAuthenticated && localStorage.getItem("token")) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && user.role && (roles.includes(user.role) || user.role === 'system_leader')) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
}

export default ProtectedRoute;