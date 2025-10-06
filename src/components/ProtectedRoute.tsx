import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
      return;
    }
  }, [navigate, location.pathname]);

  // Verificar token en cada render
  if (!isAuthenticated()) {
    return null; // No renderizar nada mientras se redirige
  }

  return <>{children}</>;
};
