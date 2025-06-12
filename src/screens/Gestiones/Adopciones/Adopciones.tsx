import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

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
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Adopciones</h1>
          </div>
          <nav className="flex gap-6 items-center">
            <Link to="/reports" className="text-white flex items-center gap-2">
              <img src="/imagenes/reportesillo.png" alt="Reportes" className="w-10 h-10" />
              Reportes
            </Link>

            {/* Botón Gestiones */}
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilter(!showFilter)} 
                className="text-white flex items-center gap-2"
              >
                <img src="/imagenes/Gestion.png" alt="Gestiones" className="w-12 h-12" />
                Gestiones
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-50 w-40">
                  {location.pathname === "/adopciones" && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-green-100"
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

            <Link to="/pets" className="text-white flex items-center gap-2">
              <img src="/imagenes/home.png" alt="Home" className="w-8 h-8" />
              Home
            </Link>
            <Link to="/" className="text-white flex items-center gap-2">
              Cerrar Sesión
              <img src="/imagenes/cerrar_sesion.png" alt="Logout" className="w-6 h-6" />
            </Link>
          </nav>
        </div>
      </header>

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
