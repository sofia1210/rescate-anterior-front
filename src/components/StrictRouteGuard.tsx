import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';
import { useStrictNavigation } from '../hooks/useStrictNavigation';

interface StrictRouteGuardProps {
  children: React.ReactNode;
}

export const StrictRouteGuard = ({ children }: StrictRouteGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const { safeNavigate } = useStrictNavigation();

  useEffect(() => {
    const validateAndSetup = () => {
      const currentPath = location.pathname;
      const isLoggedIn = isAuthenticated();
      const publicRoutes = ['/', '/registro'];
      const isPublicRoute = publicRoutes.includes(currentPath);
      
      console.log('🔍 Validando acceso estricto a:', currentPath, 'Autenticado:', isLoggedIn);
      
      // Si no está logueado y trata de acceder a ruta protegida
      if (!isLoggedIn && !isPublicRoute) {
        console.log('❌ Acceso denegado: Usuario no autenticado');
        safeNavigate('/', { replace: true });
        return false;
      }
      
      // Si está logueado y trata de acceder a login/registro
      if (isLoggedIn && isPublicRoute) {
        console.log('🔄 Redirigiendo usuario autenticado');
        safeNavigate('/pets', { replace: true });
        return false;
      }
      
      return true;
    };

    // Validar inmediatamente
    if (validateAndSetup()) {
      setIsValidating(false);
    }

    // Mostrar advertencia si detecta intentos de navegación manual
    const showNavigationWarning = () => {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    // Remover el beforeunload para evitar mensajes nativos del navegador

    // Bloquear acceso a herramientas de desarrollador
    const handleDevTools = (event: KeyboardEvent) => {
      // Solo bloquear Ctrl+U (ver código fuente) pero permitir DevTools
      if (event.ctrlKey && event.key === 'u') {
        console.log('🚫 Ver código fuente bloqueado');
        event.preventDefault();
        event.stopPropagation();
        showNavigationWarning();
        return false;
      }
    };

    // Bloquear clic derecho solo en elementos específicos
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Solo bloquear clic derecho en elementos que puedan afectar la navegación
      if (target.tagName === 'A' || target.closest('a')) {
        console.log('🚫 Clic derecho en enlace bloqueado');
        event.preventDefault();
        showNavigationWarning();
        return false;
      }
    };

    // Bloquear selección de texto solo en elementos de navegación
    const handleSelectStart = (event: Event) => {
      const target = event.target as HTMLElement;
      // Solo bloquear selección en elementos de navegación
      if (target.tagName === 'A' || target.closest('a')) {
        event.preventDefault();
        return false;
      }
    };

    // Agregar listeners
    window.addEventListener('keydown', handleDevTools);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    // Limpiar listeners
    return () => {
      window.removeEventListener('keydown', handleDevTools);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [navigate, location.pathname, safeNavigate]);

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

  return (
    <>
      {children}
      
      {/* Advertencia de navegación manual */}
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Cambio de URL bloqueado</span>
          </div>
          <p className="text-sm mt-1">Use únicamente los elementos de navegación de la interfaz</p>
        </div>
      )}
    </>
  );
};
