import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateRouteAccess, interceptUrlChanges } from '../utils/authUtils';

export const useRouteProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Validar la ruta actual al montar
    const validation = validateRouteAccess(location.pathname);
    
    if (validation === false) {
      navigate('/', { replace: true });
    } else if (validation === 'redirect-to-app') {
      navigate('/pets', { replace: true });
    }

    // Interceptar todos los cambios de URL
    const cleanup = interceptUrlChanges(navigate);

    // Limpiar listeners al desmontar
    return cleanup;
  }, [navigate, location.pathname]);
};
