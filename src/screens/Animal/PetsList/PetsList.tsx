import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Navbar } from "../../../components/Navbar";
import { AnimalDetails } from "../AnimalDetails/AnimalDetails";
import { AddAnimal } from "../AddAnimal/AddAnimal";
import { EditRescuer } from "../../Rescatista/EditRescuer/EditRescuer";
import { usePets } from "../../../services/usePets";
import { getRescatistasList } from "../../../services/dataService";

export const PetsList = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<any | null>(null);
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showEditAnimal, setShowEditAnimal] = useState(false);
  const [showAddRescuer, setShowAddRescuer] = useState(false);
  const [showRescuerPicker, setShowRescuerPicker] = useState(false);
  const [rescuers, setRescuers] = useState<any[]>([]);
  const [rescuerSearch, setRescuerSearch] = useState("");
  const [currentRescuerId, setCurrentRescuerId] = useState<string | number | null>(null);
  const [selectedRescuer, setSelectedRescuer] = useState<any | null>(null);
  // filtros removidos
  // const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // filtro removido
  }, []);

  useEffect(() => {
    if (!showRescuerPicker) return;
    (async () => {
      try {
        const list = await getRescatistasList();
        setRescuers(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("No se pudieron cargar rescatistas", e);
        setRescuers([]);
      }
    })();
  }, [showRescuerPicker]);

  // antes: const pets = [ ...hardcoded... ];
  const { pets } = usePets(
    import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/animales` : "/animales"
  );
  const [query, setQuery] = useState("");
  const resolveImageSrc = (filename?: string | null) => {
    const fallback = "/imagenes/patita.png";
    if (!filename) return fallback;
    const clean = String(filename).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.startsWith("/imagenes/")) return clean;
    const fileOnly = clean.split("/").pop() || clean;
    const host = import.meta.env.VITE_BACK;
    return `${host}/uploads/${fileOnly}`;
  };
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

  const handleAddRescuerSuccess = (_: { id: number | string; fechaRescate: string; nombre?: string; telefono?: string }) => {
    setShowAddRescuer(false);
    navigate("/pets");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar title="Lista de Animales" />

      {/* eliminado dropdown "Gestiones" */}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {filteredPets.map((pet: any) => (
            <div key={pet.id} className="bg-white rounded-lg p-4 shadow-md h-full flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-center mb-4">
                  <div className="w-40 h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    <img src={resolveImageSrc(pet.image)} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center md:text-left">{pet.name}</h3>
                <p className="text-gray-600"><span className="font-medium">Nombre:</span> {pet.name}</p>
                <p className="text-gray-600"><span className="font-medium">Especie:</span> {pet.species}</p>
                <p className="text-gray-600"><span className="font-medium">Tipo:</span> {pet.tipo === 'domestico' ? 'Doméstico' : 'Silvestre'}</p>
                <p className="text-gray-600"><span className="font-medium">Rescatista:</span> {pet.rescuer?.name || '-'}</p>
                
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => setSelectedAnimal(pet)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Detalles
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full transition-colors duration-200 flex items-center justify-center gap-2 ${
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
                      Tratamiento
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón Flotante para Añadir Animal (selector de rescatista) */}
      <button
        onClick={() => setShowRescuerPicker(true)}
        className={`fixed bottom-8 right-8 text-white rounded-full p-4 shadow-lg bg-green-500 hover:bg-green-600`}
        title="Agregar Animal"
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
            setEditingAnimal(selectedAnimal);
            setSelectedAnimal(null);
            setShowEditAnimal(true);
          }}
        />
      )}

      {showAddAnimal && (
        <AddAnimal 
          rescuerId={currentRescuerId !== null ? String(currentRescuerId) : undefined}
          selectedRescuer={selectedRescuer}
          onClose={() => {
            setShowAddAnimal(false);
            setCurrentRescuerId(null);
            setSelectedRescuer(null);
          }}
          onSuccess={() => {
            setShowAddAnimal(false);
            setCurrentRescuerId(null);
            setSelectedRescuer(null);
            navigate("/pets");
            window.location.reload();
          }}
        />
      )}

      {showEditAnimal && (
        <AddAnimal
          isEditing
          initialAnimal={editingAnimal}
          rescuerId={editingAnimal?.rescuer?.id ? String(editingAnimal.rescuer.id) : undefined}
          onClose={() => setShowEditAnimal(false)}
          onSuccess={() => {
            setShowEditAnimal(false);
            setEditingAnimal(null);
            navigate("/pets");
            window.location.reload();
          }}
        />
      )}
      {showAddRescuer && (
        <EditRescuer
          onClose={() => setShowAddRescuer(false)}
          onSuccess={handleAddRescuerSuccess}
        />
      )}

      {showRescuerPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Seleccionar Rescatista</h3>
              <button className="text-gray-500" onClick={() => setShowRescuerPicker(false)} aria-label="Cerrar">✕</button>
            </div>
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Buscar por nombre o teléfono..."
                value={rescuerSearch}
                onChange={(e) => setRescuerSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {rescuers
                .filter((r: any) => {
                  const q = (rescuerSearch || "").toLowerCase();
                  return (
                    (r?.nombre || "").toLowerCase().includes(q) ||
                    (r?.telefono || "").toLowerCase().includes(q)
                  );
                })
                .map((r: any) => (
                  <div key={r.id || r._id} className="flex items-center justify-between border rounded px-3 py-2">
                    <div>
                      <div className="font-medium">{r.nombre}</div>
                      <div className="text-sm text-gray-600">{r.telefono}</div>
                    </div>
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => {
                        setCurrentRescuerId((r.id || r._id) as any);
                        setSelectedRescuer(r);
                        setShowRescuerPicker(false);
                        setShowAddAnimal(true);
                      }}
                    >
                      Elegir
                    </Button>
                  </div>
                ))}
              {rescuers.length === 0 && (
                <div className="text-center text-gray-500 py-8">No hay rescatistas disponibles.</div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={() => {
                  setShowRescuerPicker(false);
                  setShowAddRescuer(true);
                }}
              >
                Añadir nuevo rescatista
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
