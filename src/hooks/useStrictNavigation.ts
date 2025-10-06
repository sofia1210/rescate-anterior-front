import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';

export const useStrictNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const allowedNavigationRef = useRef(false);
  const lastValidPathRef = useRef(location.pathname);

  useEffect(() => {
    // Función para validar si la navegación es permitida
    const validateNavigation = (targetPath: string): boolean => {
      const isLoggedIn = isAuthenticated();
      const publicRoutes = ['/', '/registro'];
      const isPublicRoute = publicRoutes.includes(targetPath);
      
      // Si no está logueado, solo puede acceder a rutas públicas
      if (!isLoggedIn && !isPublicRoute) {
        return false;
      }
      
      // Si está logueado, puede acceder a cualquier ruta excepto login/registro
      if (isLoggedIn && isPublicRoute) {
        return false; // Será redirigido automáticamente
      }
      
      return true;
    };

    // Función para bloquear navegación no autorizada
    const blockUnauthorizedNavigation = (event?: Event) => {
      const currentPath = window.location.pathname;
      
      // Si la navegación no fue autorizada por la interfaz web
      if (!allowedNavigationRef.current) {
        console.log('🚫 Navegación manual bloqueada:', currentPath);
        
        // Prevenir el cambio de URL
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        // Restaurar la URL anterior
        window.history.replaceState(null, '', lastValidPathRef.current);
        
        // Redirigir según el estado de autenticación
        if (!isAuthenticated()) {
          navigate('/', { replace: true });
        } else {
          navigate(lastValidPathRef.current, { replace: true });
        }
        
        return false;
      }
      
      // Si la navegación es válida, actualizar la referencia
      if (validateNavigation(currentPath)) {
        lastValidPathRef.current = currentPath;
        allowedNavigationRef.current = false; // Resetear para la próxima navegación
        return true;
      }
      
      return false;
    };

    // Interceptar cambios de URL usando múltiples métodos
    const handlePopState = (event: PopStateEvent) => {
      console.log('🔄 Evento popstate detectado');
      blockUnauthorizedNavigation(event);
    };

    const handleHashChange = (event: HashChangeEvent) => {
      console.log('🔄 Cambio de hash detectado');
      blockUnauthorizedNavigation(event);
    };

    // Interceptar cambios de URL usando MutationObserver
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔄 Cambio de URL detectado por MutationObserver');
        lastUrl = currentUrl;
        blockUnauthorizedNavigation();
      }
    });

    // Interceptar usando interval como fallback
    const urlCheckInterval = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔄 Cambio de URL detectado por interval');
        lastUrl = currentUrl;
        blockUnauthorizedNavigation();
      }
    }, 50); // Verificar cada 50ms para mayor precisión

    // Interceptar eventos de teclado que puedan cambiar la URL
    const handleKeyDown = (event: KeyboardEvent) => {
      // Bloquear solo comandos específicos para cambiar URL, pero permitir DevTools
      if (
        (event.ctrlKey && event.key === 'l') ||  // Ctrl+L (ir a barra de direcciones)
        event.key === 'F6' ||                    // F6 (ir a barra de direcciones)
        (event.altKey && event.key === 'd')     // Alt+D (ir a barra de direcciones)
      ) {
        console.log('🚫 Comando de navegación manual bloqueado');
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Interceptar clics en la barra de direcciones
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Si el usuario hace clic en la barra de direcciones del navegador
      if (target.tagName === 'INPUT' && target.getAttribute('type') === 'url') {
        console.log('🚫 Clic en barra de direcciones bloqueado');
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Agregar todos los listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick, true); // Usar capture
    urlObserver.observe(document, { subtree: true, childList: true });

    // Limpiar listeners
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick, true);
      urlObserver.disconnect();
      clearInterval(urlCheckInterval);
    };
  }, [navigate, location.pathname]);

  // Función para autorizar navegación desde la interfaz web
  const authorizeNavigation = (callback: () => void) => {
    allowedNavigationRef.current = true;
    callback();
  };

  // Función para navegar de forma segura
  const safeNavigate = (path: string, options?: any) => {
    authorizeNavigation(() => {
      navigate(path, options);
    });
  };

  return { safeNavigate, authorizeNavigation };
};
