import { useState, useRef, useEffect,useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AnimalDetails } from "../AnimalDetails/AnimalDetails";
import { AddAnimal } from "../AddAnimal/AddAnimal";
import { EditRescuer } from "../../Rescatista/EditRescuer/EditRescuer";
import { usePets } from "../../../services/usePets";
// Nota: cargaremos rescatistas vía fetch directo para evitar caches/304

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

  useEffect(() => {
    if (!showRescuerPicker) return;
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "";
        const url = base ? `${base}/rescatistas` : "/rescatistas";
        const res = await fetch(url, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.postgres ?? []);
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
          {filteredPets.map((pet: any) => (
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

      {/* Botón Flotante para Añadir Animal (selector de rescatista) */}
      <button
        onClick={() => setShowRescuerPicker(true)}
        className={`fixed bottom-8 right-8 text-white rounded-full p-4 shadow-lg bg-green-500 hover:bg-green-600`}
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
