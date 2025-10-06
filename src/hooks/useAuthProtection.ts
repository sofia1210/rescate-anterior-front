import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearBrowserHistory, isAuthenticated, performSecureLogout } from '../utils/authUtils';

export const useAuthProtection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
      return;
    }

    // Prevenir navegación hacia atrás después del logout
    const handlePopState = (event: PopStateEvent) => {
      if (!isAuthenticated()) {
        // Si no hay token, prevenir la navegación hacia atrás
        event.preventDefault();
        clearBrowserHistory();
        navigate('/', { replace: true });
      }
    };

    // Agregar listener
    window.addEventListener('popstate', handlePopState);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Función para logout seguro
  const secureLogout = () => {
    performSecureLogout();
  };

  return { secureLogout };
};
