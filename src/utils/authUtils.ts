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
