import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateRouteAccess } from '../utils/authUtils';
import { useRouteProtection } from '../hooks/useRouteProtection';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  // Usar el hook de protección de rutas
  useRouteProtection();

  useEffect(() => {
    const validateRoute = () => {
      const validation = validateRouteAccess(location.pathname);
      
      if (validation === false) {
        navigate('/', { replace: true });
        return false;
      } else if (validation === 'redirect-to-app') {
        navigate('/pets', { replace: true });
        return false;
      }
      
      return true;
    };

    // Validar inmediatamente
    if (validateRoute()) {
      setIsValidating(false);
    }
  }, [navigate, location.pathname]);

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
