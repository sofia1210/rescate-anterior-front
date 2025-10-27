// Utilidad para limpiar completamente el historial del navegador
export const clearBrowserHistory = () => {
  try {
    // Limpiar el historial del navegador
    window.history.replaceState(null, '', '/');
    
    // Limpiar el estado de la sesión
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
    
    // Limpiar cookies relacionadas con la sesión (opcional)
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Prevenir navegación hacia atrás
    window.history.pushState(null, '', '/');
    
    // Agregar listener para prevenir navegación hacia atrás
    const preventBackNavigation = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', '/');
    };
    
    window.addEventListener('popstate', preventBackNavigation);
    
    // Remover el listener después de 5 segundos
    setTimeout(() => {
      window.removeEventListener('popstate', preventBackNavigation);
    }, 5000);
    
  } catch (error) {
    console.warn('Error clearing browser history:', error);
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return token !== null && token.trim() !== '';
};

// Función para logout completo
export const performSecureLogout = () => {
  // Remover token
  localStorage.removeItem('token');
  
  // Limpiar historial
  clearBrowserHistory();
  
  // Redirigir al login
  window.location.href = '/';
};

// Función para validar acceso a una ruta específica
export const validateRouteAccess = (path: string): boolean | string => {
  const isLoggedIn = isAuthenticated();
  const publicRoutes = ['/', '/registro'];
  const isPublicRoute = publicRoutes.includes(path);
  
  //console.log('🔍 Validando acceso a:', path, 'Autenticado:', isLoggedIn, 'Ruta pública:', isPublicRoute);
  
  // Si no está logueado y trata de acceder a ruta protegida
  if (!isLoggedIn && !isPublicRoute) {
    console.log('❌ Acceso denegado: Usuario no autenticado intentando acceder a:', path);
    return false;
  }
  
  // Si está logueado y trata de acceder a login/registro
  if (isLoggedIn && isPublicRoute) {
    console.log('🔄 Redirigiendo usuario autenticado desde:', path);
    return 'redirect-to-app';
  }
  
  return true;
};

// Función para interceptar cambios de URL
export const interceptUrlChanges = (navigate: (path: string, options?: any) => void) => {
  let lastUrl = window.location.href;
  
  const handleUrlChange = () => {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    
    if (currentUrl !== lastUrl) {
      console.log('🔄 Cambio de URL detectado:', lastUrl, '->', currentUrl);
      lastUrl = currentUrl;
      
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
    }
  };

  // Interceptar usando MutationObserver
  const urlObserver = new MutationObserver(handleUrlChange);
  urlObserver.observe(document, { subtree: true, childList: true });

  // Interceptar usando interval como fallback
  const urlCheckInterval = setInterval(handleUrlChange, 100);

  // Interceptar eventos de navegación
  const handlePopState = () => {
    console.log('🔄 Evento popstate detectado');
    handleUrlChange();
  };

  const handleHashChange = () => {
    console.log('🔄 Cambio de hash detectado');
    handleUrlChange();
  };

  window.addEventListener('popstate', handlePopState);
  window.addEventListener('hashchange', handleHashChange);

  // Función de limpieza
  return () => {
    urlObserver.disconnect();
    clearInterval(urlCheckInterval);
    window.removeEventListener('popstate', handlePopState);
    window.removeEventListener('hashchange', handleHashChange);
  };
};
