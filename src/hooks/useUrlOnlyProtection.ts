import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';

export const useUrlOnlyProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Función para validar acceso a una ruta
    const validateRouteAccess = (path: string): boolean | string => {
      const isLoggedIn = isAuthenticated();
      const publicRoutes = ['/', '/registro'];
      const isPublicRoute = publicRoutes.includes(path);
      
      //console.log('🔍 Validando acceso a:', path, 'Autenticado:', isLoggedIn);
      
      // Si no está logueado y trata de acceder a ruta protegida
      if (!isLoggedIn && !isPublicRoute) {
        console.log('❌ Acceso denegado: Usuario no autenticado');
        return false;
      }
      
      // Si está logueado y trata de acceder a login/registro
      if (isLoggedIn && isPublicRoute) {
        console.log('🔄 Redirigiendo usuario autenticado');
        return 'redirect-to-app';
      }
      
      return true;
    };

    // Interceptar cambios de URL usando múltiples métodos
    const handleUrlChange = () => {
      const currentPath = window.location.pathname;
      const validation = validateRouteAccess(currentPath);
      
      if (validation === false) {
        console.log('🚫 Bloqueando acceso no autorizado');
        window.history.replaceState(null, '', '/');
        navigate('/', { replace: true });
      } else if (validation === 'redirect-to-app') {
        console.log('🔄 Redirigiendo usuario autenticado');
        window.history.replaceState(null, '', '/pets');
        navigate('/pets', { replace: true });
      }
    };

    // Interceptar navegación hacia atrás/adelante
    const handlePopState = () => {
      console.log('🔄 Evento popstate detectado');
      handleUrlChange();
    };

    // Interceptar cambios de URL usando MutationObserver
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔄 Cambio de URL detectado:', lastUrl, '->', currentUrl);
        lastUrl = currentUrl;
        handleUrlChange();
      }
    });

    // Interceptar usando interval como fallback
    const urlCheckInterval = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔄 Cambio de URL detectado por interval');
        lastUrl = currentUrl;
        handleUrlChange();
      }
    }, 100);

    // Agregar listeners
    window.addEventListener('popstate', handlePopState);
    urlObserver.observe(document, { subtree: true, childList: true });

    // Limpiar listeners
    return () => {
      window.removeEventListener('popstate', handlePopState);
      urlObserver.disconnect();
      clearInterval(urlCheckInterval);
    };
  }, [navigate, location.pathname]);
};
