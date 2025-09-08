import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Navbar } from "../../../components/Navbar";
import { AnimalDetails } from "../AnimalDetails/AnimalDetails";
import { AddAnimal } from "../AddAnimal/AddAnimal";
import { EditRescuer } from "../../Rescatista/EditRescuer/EditRescuer";
import { usePets } from "../../../services/usePets";

export const PetsList = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showEditAnimal, setShowEditAnimal] = useState(false);
  const [showAddRescuer, setShowAddRescuer] = useState(false);
  const [currentRescuerId, setCurrentRescuerId] = useState<number | null>(null);
  const [, setCurrentRescuerFecha] = useState<string | null>(null);
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
      <Navbar title="Lista de Animales" />

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
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-green-100 transition-colors duration-200"
                  onClick={() => {
                    navigate("/adopciones");
                    setShowFilter(false);
                  }}
                >
                  Doméstico
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-green-100 transition-colors duration-200"
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto p-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="🔍 Buscar animal por nombre..."
            className="w-full pl-4 pr-12 py-3 rounded-lg bg-white border-2 border-gray-200 focus:border-green-500 transition-colors duration-200 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            aria-label="Buscar animal por nombre"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Limpiar búsqueda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {query && (
          <p className="text-white text-sm mt-2 ml-1">
            Mostrando {filteredPets.length} resultado{filteredPets.length !== 1 ? 's' : ''} para "{query}"
          </p>
        )}
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
              <p className="text-gray-600">Rescatista: {pet.rescuer?.name}</p>
              <p className={`text-sm ${pet.veterinarian ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                Veterinario: {pet.veterinarian?.name || 'Sin asignar'}
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                  onClick={() => setSelectedAnimal(pet)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Detalles
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex-1 transition-colors duration-200 flex items-center gap-2 ${
                    pet.veterinarian 
                      ? "bg-blue-500 text-white hover:bg-blue-600" 
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                  onClick={() => navigate(`/veterinario/${pet.id}`)}
                >
                  {pet.veterinarian ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Ver Veterinario
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Asignar Veterinario
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón Flotante para Añadir Rescatista */}
      <button
        onClick={() => setShowAddRescuer(true)}
        className="fixed bottom-24 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 group"
        title="Registrar nuevo rescatista"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Registrar Rescatista
        </span>
      </button>
      
      {/* Botón Flotante para Añadir Animal */}
      <button
        onClick={() => {
          if (currentRescuerId !== null) {
            setShowAddAnimal(true);
          } else {
            alert("Primero debes registrar un rescatista.");
          }
        }}
        className={`fixed bottom-8 right-8 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 group ${
          currentRescuerId !== null ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
        }`}
        title={currentRescuerId !== null ? "Registrar nuevo animal" : "Primero registra un rescatista"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className={`absolute right-16 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
          currentRescuerId !== null ? "bg-green-600 text-white" : "bg-gray-500 text-white"
        }`}>
          {currentRescuerId !== null ? "Registrar Animal" : "Registra Rescatista Primero"}
        </span>
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
    </div>
  );
};
