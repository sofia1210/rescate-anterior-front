// Ejemplo de cómo usar la navegación segura en componentes
import { useSafeNavigation } from '../hooks/useSafeNavigation';

export const ExampleComponent = () => {
  const { navigate, goToPets, goToReports, goBack } = useSafeNavigation();

  const handleNavigation = () => {
    // Todas estas navegaciones están autorizadas por la interfaz web
    goToPets(); // Navegar a /pets
    goToReports(); // Navegar a /reports
    navigate('/adopciones'); // Navegar a cualquier ruta
    goBack(); // Volver atrás
  };

  return (
    <div>
      <button onClick={handleNavigation}>
        Navegar de forma segura
      </button>
    </div>
  );
};
