import { Navigate, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // Preserve the intended destination in location state
      navigate('/login', {
        state: { from: location },
        replace: false,
      });
    }
  }, [isAuthenticated, location, navigate]);

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return children;
}

export default RequireAuth;
