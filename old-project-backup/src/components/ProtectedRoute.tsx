import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/session';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
