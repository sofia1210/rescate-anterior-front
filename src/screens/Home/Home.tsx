import { Navbar } from "../../components/Navbar";
import { TaskCard } from "../../components/ui/task-card";
import { useThemeClasses } from "../../hooks/useThemeClasses";

export const Home = (): JSX.Element => {
  const { getThemeClasses } = useThemeClasses();

  const cards = [
    { 
      title: "Agregar Animal", 
      desc: "Añade un nuevo ingreso rápidamente", 
      to: "/pets", 
      cta: "Ir a Animales",
      icon: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    { 
      title: "Evaluaciones y Tratamientos", 
      desc: "Gestiona la atención médica", 
      to: "/management", 
      cta: "Ir a Gestiones",
      icon: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      title: "Reportes", 
      desc: "Exporta y comparte informes", 
      to: "/reports", 
      cta: "Ver Reportes",
      icon: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      title: "Veterinarios", 
      desc: "Consulta y gestiona contactos", 
      to: "/veterinarios", 
      cta: "Ver Veterinarios",
      icon: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar title="Inicio" />
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">¿Qué deseas hacer?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <TaskCard
              key={card.title}
              title={card.title}
              description={card.desc}
              to={card.to}
              ctaText={card.cta}
              icon={card.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


