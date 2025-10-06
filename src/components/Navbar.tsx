import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { useAuthProtection } from "../hooks/useAuthProtection";

interface NavbarProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Navbar = ({ title, showBackButton = false, onBackClick }: NavbarProps) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getThemeClasses } = useThemeClasses();
  const { secureLogout } = useAuthProtection();

  const navigationItems = [
    /*{
      path: "/home",
      label: "Inicio"
    },*/
    {
      path: "/reports",
      label: "Reportes"
    },
    {
      path: "/adopciones",
      label: "Adopciones y Liberaciones"
    },
    {
      path: "/pets",
      label: "Animales"
    }
  ];

  const handleLogout = () => {
    secureLogout();
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={getThemeClasses(
      "bg-green-500/80 backdrop-blur-sm shadow-lg",
      "bg-gradient-to-r from-green-700 to-green-600 backdrop-blur-sm shadow-lg shadow-green-200/50"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Flecha atrás + Logo y título */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button 
                onClick={onBackClick}
                className="text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-lg hover:bg-green-600/50 mr-1"
                aria-label="Volver"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div className={getThemeClasses(
              "w-12 h-12 rounded-full shadow-md hover:scale-105 transition-transform duration-200",
              "w-12 h-12 rounded-full shadow-md hover:scale-105 transition-transform duration-200 bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:bg-white/30"
            )}>
              <img 
                src="/imagenes/Patota.png" 
                alt="Logo" 
                className="w-full h-full rounded-full object-cover" 
              />
            </div>
            <h1 className="text-white text-xl font-semibold">{title}</h1>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActiveRoute(item.path)
                    ? getThemeClasses(
                        "bg-green-600/80 text-white shadow-md",
                        "bg-green-800/80 text-white shadow-md shadow-green-200/50"
                      )
                    : getThemeClasses(
                        "text-white hover:bg-green-600/50 hover:text-gray-100",
                        "text-white hover:bg-green-700/50 hover:text-gray-100"
                      )
                }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className={getThemeClasses(
                "px-4 py-2 rounded-lg transition-all duration-200 font-medium text-white hover:bg-red-600/50 hover:text-gray-100",
                "px-4 py-2 rounded-lg transition-all duration-200 font-medium text-white hover:bg-red-600/50 hover:text-gray-100"
              )}
            >
              Cerrar Sesión
            </button>
            
            {/* Botón de cambio de tema */}
            <ThemeToggle />

          </div>

          {/* Botón de menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-green-600/50 transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-green-400/50 bg-green-600/90 backdrop-blur-sm">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActiveRoute(item.path)
                      ? "bg-green-700/80 text-white shadow-md"
                      : "text-white hover:bg-green-700/50 hover:text-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Botón de logout en móvil */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block px-4 py-3 rounded-lg transition-all duration-200 font-medium text-white hover:bg-red-600/50 hover:text-gray-100"
              >
                Cerrar Sesión
              </button>
              
              {/* Botón de cambio de tema en móvil */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};