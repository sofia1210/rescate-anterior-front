import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";

export const Adopciones = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const animalesDomesticos = [
    {
      id: 1,
      nombre: "Rocky",
      especie: "Perro",
      raza: "Labrador",
      edad: "3 años",
      imagen: "/imagenes/Mamba.jpg",
      estado: "Disponible"
    },
    {
      id: 2,
      nombre: "Miau",
      especie: "Gato",
      raza: "Siames",
      edad: "1 año",
      imagen: "/imagenes/gato.jpg",
      estado: "En proceso"
    }
  ];

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar title="Adopciones" />

      {/* Gestiones Dropdown */}
      <div className="container mx-auto p-4">
        <div className="flex justify-end mb-4">
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilter(!showFilter)} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              Gestiones
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-50 w-40">
                {location.pathname === "/adopciones" && (
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-green-100 transition-colors duration-200"
                    onClick={() => {
                      navigate("/liberaciones");
                      setShowFilter(false);
                    }}
                  >
                    Silvestre
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Animales en Adopción */}
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Animales Disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {animalesDomesticos.map(animal => (
            <div key={animal.id} className="bg-white rounded-lg shadow-md p-4">
              <img src={animal.imagen} alt={animal.nombre} className="w-full h-40 object-contain mb-4" />
              <h3 className="text-lg font-bold">{animal.nombre}</h3>
              <p className="text-gray-700">Especie: {animal.especie}</p>
              <p className="text-gray-700">Raza: {animal.raza}</p>
              <p className="text-gray-700">Edad: {animal.edad}</p>
              <p className="text-green-700 font-semibold mt-2">Estado: {animal.estado}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
