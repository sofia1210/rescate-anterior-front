import { useNavigate } from 'react-router-dom';
import { useStrictNavigation } from './useStrictNavigation';

export const useSafeNavigation = () => {
  const navigate = useNavigate();
  const { safeNavigate } = useStrictNavigation();

  return {
    navigate: safeNavigate,
    // Función específica para navegar a rutas comunes
    goToPets: () => safeNavigate('/pets'),
    goToReports: () => safeNavigate('/reports'),
    goToAdoptions: () => safeNavigate('/adopciones'),
    goToLogin: () => safeNavigate('/'),
    goBack: () => safeNavigate(-1),
  };
};
