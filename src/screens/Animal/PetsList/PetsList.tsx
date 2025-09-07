import React, { useState, useRef, useEffect,useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AnimalDetails } from "../AnimalDetails/AnimalDetails";
import { AddAnimal } from "../AddAnimal/AddAnimal";
import { RescuerDetails } from "../../Rescatista/RescuerDetails/RescuerDetails";
import { EditRescuer } from "../../Rescatista/EditRescuer/EditRescuer";
import { usePets } from "../../../services/usePets";

export const PetsList = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showEditAnimal, setShowEditAnimal] = useState(false);
  const [showRescuerDetails, setShowRescuerDetails] = useState<number | null>(null);
  const [showAddRescuer, setShowAddRescuer] = useState(false);
  const [currentRescuerId, setCurrentRescuerId] = useState<number | null>(null);
  const [currentRescuerFecha, setCurrentRescuerFecha] = useState<string | null>(null);
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

  // antes: const pets = [ ...hardcoded... ];
  const { pets } = usePets(
    import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/animales` : "/animales"
  );
  const [query, setQuery] = useState("");
  const normalize = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // ⬇️ Filtrado por nombre (pet.name)
  const filteredPets = useMemo(() => {
    if (!query.trim()) return pets;
    const q = normalize(query.trim());
    return pets.filter((p: any) => normalize(p?.name).includes(q));
  }, [pets, query]);

  const handleAddRescuerSuccess = (rescuerData: { id: number; fechaRescate: string }) => {
    setCurrentRescuerId(rescuerData.id);
    setCurrentRescuerFecha(rescuerData.fechaRescate);
    setShowAddRescuer(false);
    setShowAddAnimal(true);
  };

  return (
    <div className="min-h-screen bg-green-400/80">
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Lista de Animales</h1>
          </div>
          <nav className="flex gap-6 items-center">
            <Link to="/reports" className="text-white flex items-center gap-2">
              <img src="imagenes/reportesillo.png" alt="Reportes" className="w-10 h-10" />
              Reportes
            </Link>

            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilter(!showFilter)} 
                className="text-white flex items-center gap-2"
              >
                <img src="imagenes/Gestion.png" alt="Gestiones" className="w-12 h-12" />
                Gestiones
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-50 w-40">
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                    onClick={() => {
                      navigate("/adopciones");
                      setShowFilter(false);
                    }}
                  >
                    Doméstico
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                    onClick={() => {
                      navigate("/liberaciones");
                      setShowFilter(false);
                    }}
                  >
                    Silvestre
                  </button>
                </div>
              )}
            </div>

            <Link to="/pets" className="text-white flex items-center gap-2">
              <img src="imagenes/home.png" alt="Home" className="w-8 h-8" />
              Home
            </Link>
            <Link to="/" className="text-white flex items-center gap-2">
              Cerrar Sesión
              <img src="imagenes/cerrar_sesion.png" alt="Logout" className="w-6 h-6" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto p-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Búsqueda por nombre del animal..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white"
            // ⬇️ Controlado
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            aria-label="Buscar por nombre"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <img src="imagenes/lupa.png" alt="Clear search" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex justify-center mb-4">
                {pet.image ? (
                  <img src={"imagenes/patita.png"} alt={pet.name} className="w-32 h-32 object-contain" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{pet.name}</h3>
              <p className="text-gray-600">Nombre: {pet.name}</p>
              <p className="text-gray-600">Especie: {pet.species}</p>
              <p className="text-gray-600">Tipo: {pet.tipo === 'domestico' ? 'Doméstico' : 'Silvestre'}</p>
              <p className="text-gray-600 mb-2">Rescatista: {pet.rescuer?.name}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-green-500 text-white hover:bg-green-600"
                  onClick={() => setSelectedAnimal(pet)}
                >
                  Datos
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 bg-green-500 text-white hover:bg-green-600"
                  onClick={() => navigate(`/veterinario/${pet.id}`)}
                >
                  Veterinario
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón Flotante para Añadir Rescatista (más arriba) */}
      <button
        onClick={() => setShowAddRescuer(true)}
        className="fixed bottom-24 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg mb-4"
        title="Agregar Rescatista"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      {/* Botón Flotante para Añadir Animal (más abajo) */}
      <button
        onClick={() => {
          if (currentRescuerId !== null) {
            setShowAddAnimal(true);
          } else {
            alert("Primero debes registrar un rescatista.");
          }
        }}
        className={`fixed bottom-8 right-8 text-white rounded-full p-4 shadow-lg ${
          currentRescuerId !== null ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
        }`}
        title="Agregar Animal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>


      {/* Modals */}
      {selectedAnimal && (
        <AnimalDetails 
          animal={selectedAnimal} 
          onClose={() => setSelectedAnimal(null)}
          onEdit={() => {
            setSelectedAnimal(null);
            setShowEditAnimal(true);
          }}
        />
      )}

      {showAddAnimal && (
        <AddAnimal 
          rescuerId={currentRescuerId !== null ? String(currentRescuerId) : undefined} 
          fechaRescate={currentRescuerFecha || undefined}
          onClose={() => {
            setShowAddAnimal(false);
            setCurrentRescuerId(null);
            setCurrentRescuerFecha(null);
          }} 
        />
      )}

      {showEditAnimal && (
        <AddAnimal onClose={() => setShowEditAnimal(false)} />
      )}

      {showAddRescuer && (
        <EditRescuer
          animalId={0}
          onClose={() => setShowAddRescuer(false)}
          onSuccess={handleAddRescuerSuccess}
        />
      )}

      {showAddRescuer && (
        <EditRescuer
          animalId={1} // Podés pasar el id real del animal si lo tenés
          onClose={() => setShowAddRescuer(false)}
          onSuccess={handleAddRescuerSuccess}
        />
      )}
    </div>
  );
};
