import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { usePets } from "../../../services/usePets";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FormFieldWithError } from "../../../components/ui/form-field-with-error";
import { createAdopcion, getAllAdopciones, getAllAdoptions } from "../../../services/dataService";
import { createGeolocalizacion, createLiberation, getAllLiberations } from "../../../services/transferService";

export const Adopciones = (): JSX.Element => {
  const { getThemeClasses } = useThemeClasses();
  const { pets } = usePets(
    import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/animales` : "/animales"
  );
  const [query, setQuery] = useState("");
  const [typeChoice, setTypeChoice] = useState<string>("todos"); // todos|domestico|silvestre
  const [healthChoice, setHealthChoice] = useState<string>("todos"); // todos|muy bueno|bueno|estable|sano
  const [liberateFor, setLiberateFor] = useState<any | null>(null);
  const [adoptFor, setAdoptFor] = useState<any | null>(null);
  const [releasePos, setReleasePos] = useState<{ lat: number; lng: number } | null>(null);
  const [releaseDesc, setReleaseDesc] = useState<string>("");
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // Adopción
  const adoptMapRef = useRef<any>(null);
  const adoptMarkerRef = useRef<any>(null);
  const [adoptPos, setAdoptPos] = useState<{ lat: number; lng: number } | null>(null);
  const [adoptDesc, setAdoptDesc] = useState<string>("");
  const [adoptName, setAdoptName] = useState<string>("");
  const [adoptContact, setAdoptContact] = useState<string>("");
  const [adoptObs, setAdoptObs] = useState<string>("");
  const [adoptedNames, setAdoptedNames] = useState<Set<string>>(new Set());
  const [liberatedNames, setLiberatedNames] = useState<Set<string>>(new Set());
  
  // Estados para validaciones
  const [adoptSubmitted, setAdoptSubmitted] = useState(false);
  const [liberateSubmitted, setLiberateSubmitted] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const resolveImageSrc = (filename?: string | null) => {
    const fallback = "/imagenes/patita.png";
    if (!filename) return fallback;
    const clean = String(filename).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.startsWith("/imagenes/")) return clean;
    const host = import.meta.env.VITE_BACK;
    const fileOnly = clean.split("/").pop() || clean;
    return `${host}/uploads/${fileOnly}`;
  };

  const normalize = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Función para obtener ubicación del dispositivo
  const getCurrentLocation = async (type: 'adopt' | 'liberate') => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en este navegador');
      return;
    }

    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      
      if (type === 'adopt') {
        setAdoptPos({ lat: latitude, lng: longitude });
        // Actualizar marcador en mapa de adopción
        setTimeout(() => {
          const mapElement = document.getElementById('adoption-map');
          if (mapElement && window.L && window.L.map) {
            // Si el mapa ya existe, actualizarlo
            if (adoptMapRef.current) {
              adoptMapRef.current.setView([latitude, longitude], 15);
              if (adoptMarkerRef.current) {
                adoptMarkerRef.current.setLatLng([latitude, longitude]);
              } else {
                // Crear marcador si no existe
                adoptMarkerRef.current = window.L.marker([latitude, longitude]).addTo(adoptMapRef.current)
                  .openPopup();
              }
            } else {
              // Crear mapa si no existe
              adoptMapRef.current = window.L.map('adoption-map').setView([latitude, longitude], 15);
              window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
              }).addTo(adoptMapRef.current);
              
              adoptMarkerRef.current = window.L.marker([latitude, longitude]).addTo(adoptMapRef.current)
                .openPopup();
              
              // Agregar evento de click al mapa
              adoptMapRef.current.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                setAdoptPos({ lat, lng });
                if (adoptMarkerRef.current) {
                  adoptMarkerRef.current.setLatLng([lat, lng]);
                }
              });
            }
          }
        }, 100);
      } else {
        setReleasePos({ lat: latitude, lng: longitude });
        // Actualizar marcador en mapa de liberación
        setTimeout(() => {
          const mapElement = document.getElementById('liberation-map');
          if (mapElement && window.L && window.L.map) {
            // Si el mapa ya existe, actualizarlo
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 15);
              if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
              } else {
                // Crear marcador si no existe
                markerRef.current = window.L.marker([latitude, longitude]).addTo(mapRef.current)
                  .openPopup();
              }
            } else {
              // Crear mapa si no existe
              mapRef.current = window.L.map('liberation-map').setView([latitude, longitude], 15);
              window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
              }).addTo(mapRef.current);
              
              markerRef.current = window.L.marker([latitude, longitude]).addTo(mapRef.current)
                .openPopup();
              
              // Agregar evento de click al mapa
              mapRef.current.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                setReleasePos({ lat, lng });
                if (markerRef.current) {
                  markerRef.current.setLatLng([lat, lng]);
                }
              });
            }
          }
        }, 100);
      }

      // Obtener dirección usando geocodificación inversa
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url);
        const data = await response.json();
        const address = data?.display_name || "";
        
        if (type === 'adopt') {
          setAdoptDesc(address);
        } else {
          setReleaseDesc(address);
        }
      } catch (error) {
        console.log('No se pudo obtener la dirección');
      }
      
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      alert('No se pudo obtener tu ubicación. Por favor, selecciona manualmente en el mapa.');
    } finally {
      setIsGettingLocation(false);
    }
  };
  const elegibles = useMemo(() => {
    const ok = new Set(["bueno","muy bueno","muy_bueno","muy-bueno","estable"]);
    return (pets || [])
      .filter((p: any) => ok.has(normalize(p?.healthStatus)))
      .filter((p: any) => {
        const q = normalize(query.trim());
        if (q && !normalize(p?.name).includes(q)) return false;
        if (typeChoice !== "todos") {
          const t = (p?.tipo || "").toLowerCase();
          if (typeChoice === "domestico" && t !== "domestico") return false;
          if (typeChoice === "silvestre" && t !== "silvestre") return false;
        }
        if (healthChoice !== "todos" && normalize(p?.healthStatus) !== normalize(healthChoice)) return false;
        // excluir adoptados
        const nk = normalize(p?.name || "");
        if (adoptedNames.has(nk)) return false;
        // excluir liberados
        if (liberatedNames.has(nk)) return false;
        return true;
      });
  }, [pets, query, typeChoice, healthChoice, adoptedNames, liberatedNames]);

  useEffect(() => {
    if (!liberateFor) return;
    const L: any = (window as any).L;
    const container = document.getElementById('liberation-map');
    if (!L || !container) return;
    if (!mapRef.current) {
      mapRef.current = L.map('liberation-map').setView([-17.7833, -63.1821], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
      mapRef.current.on('click', async (e: any) => {
        const lat = e.latlng.lat; const lng = e.latlng.lng;
        setReleasePos({ lat, lng });
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
          const r = await fetch(url); const j = await r.json();
          setReleaseDesc(j?.display_name || "");
        } catch {}
      });
    }
  }, [liberateFor]);

  useEffect(() => {
    if (!adoptFor) return;
    const L: any = (window as any).L;
    const container = document.getElementById('adoption-map');
    if (!L || !container) return;
    if (!adoptMapRef.current) {
      adoptMapRef.current = L.map('adoption-map').setView([-17.7833, -63.1821], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(adoptMapRef.current);
      adoptMapRef.current.on('click', async (e: any) => {
        const lat = e.latlng.lat; const lng = e.latlng.lng;
        setAdoptPos({ lat, lng });
        if (adoptMarkerRef.current) adoptMarkerRef.current.setLatLng([lat, lng]);
        else adoptMarkerRef.current = L.marker([lat, lng]).addTo(adoptMapRef.current);
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
          const r = await fetch(url); const j = await r.json();
          setAdoptDesc(j?.display_name || "");
        } catch {}
      });
    }
  }, [adoptFor]);

  // Cargar adopciones aprobadas y excluir en el listado
  useEffect(() => {
    (async () => {
      try {
        // prefer /adoptions si existe, fallback a /adopciones
        let r: any;
        try { r = await getAllAdoptions(); } catch { r = await getAllAdopciones(); }
        const data: any = r?.data;
        const arr: any[] = Array.isArray(data) ? data : (data?.postgres ?? []);
        const set = new Set<string>();
        arr.forEach((a: any) => {
          const estado = String(a?.estado || '').toLowerCase();
          if (estado === 'aprobada') {
            const nombreFromAnimal = a?.animal?.nombre || a?.animal?.name;
            const nombrePlano = nombreFromAnimal || a?.nombreAnimal || '';
            const k = (String(nombrePlano)
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')).trim();
            if (k) set.add(k);
          }
        });
        setAdoptedNames(set);
      } catch {
        setAdoptedNames(new Set());
      }
    })();
  }, []);

  // Cargar liberaciones y excluir en el listado
  useEffect(() => {
    (async () => {
      try {
        const r: any = await getAllLiberations();
        const data: any = r?.data;
        const arr: any[] = Array.isArray(data) ? data : (data?.postgres ?? []);
        const set = new Set<string>();
        arr.forEach((l: any) => {
          const nombreFromAnimal = l?.animal?.nombre || l?.animal?.name;
          const nombrePlano = nombreFromAnimal || l?.nombreAnimal || '';
          const k = normalize(String(nombrePlano).trim());
          if (k) set.add(k);
        });
        setLiberatedNames(set);
      } catch {
        setLiberatedNames(new Set());
      }
    })();
  }, []);

  const handleAdopt = async () => {
    setAdoptSubmitted(true);
    
    // Validaciones del lado del cliente
    if (!adoptFor?.id) return;
    if (!adoptName.trim() || adoptName.trim().length < 2) return;
    if (!adoptContact.trim()) return;
    if (!adoptPos) {
      alert('Debes seleccionar una ubicación en el mapa o usar tu ubicación actual');
      return;
    }
    
    try {
      const payload = {
        nombreAnimal: adoptFor.name,
        estado: 'Aprobada',
        nombreAdoptante: adoptName.trim(),
        contactoAdoptante: adoptContact.trim(),
        observaciones: adoptObs.trim() || undefined,
        fechaAdopcion: new Date().toISOString(),
        latitud: adoptPos.lat,
        longitud: adoptPos.lng,
        descripcion: adoptDesc.trim() || 'Adopción',
      } as any;
      await createAdopcion(payload);
      setAdoptFor(null);
      setAdoptSubmitted(false);
      window.location.reload();
    } catch {
      alert('No se pudo registrar la adopción');
    }
  };

  const handleLiberate = async () => {
    setLiberateSubmitted(true);
    
    // Validaciones del lado del cliente
    if (!liberateFor?.id) return;
    if (!releasePos) {
      alert('Debes seleccionar una ubicación en el mapa o usar tu ubicación actual');
      return;
    }
    if (!releaseDesc.trim()) {
      alert('Debes proporcionar una descripción del lugar de liberación');
      return;
    }
    
    try {
      await createLiberation({
        nombreAnimal: liberateFor.name,
        fechaLiberacion: new Date().toISOString(),
        observaciones: releaseDesc.trim(),
        latitud: releasePos.lat,
        longitud: releasePos.lng,
        descripcion: releaseDesc.trim(),
      });
      await createGeolocalizacion({
        animalId: String(liberateFor.id),
        latitud: releasePos.lat,
        longitud: releasePos.lng,
        descripcion: releaseDesc.trim(),
        fechaRegistro: new Date().toISOString(),
      });
      setLiberateFor(null);
      setLiberateSubmitted(false);
      window.location.reload();
    } catch {
      alert('No se pudo registrar la liberación');
    }
  };

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar title="Animales Saludables" />

      {/* Buscar y explorar */}
      <div className="container mx-auto p-6">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">Adoptar o Liberar</h2>
        </div>
        {/* Search Bar */}
        <div className="relative mb-3">
          <Input
            type="search"
            placeholder="Buscar por nombre"
            className="w-full pl-4 pr-12 py-3 rounded-lg bg-white border-2 border-gray-200 focus:border-green-500 transition-colors duration-200 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar animal por nombre"
          />
        </div>
        {/* Filtros: Tipo y Estado en la misma fila (izquierda) */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-800">Tipo:</span>
            {[{key:"todos",label:"Todos"},{key:"domestico",label:"Doméstico"},{key:"silvestre",label:"Silvestre"}].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTypeChoice(opt.key)}
                className={`px-3 py-1 rounded-full text-sm border ${typeChoice===opt.key? 'bg-green-600 text-white border-green-600':'bg-white text-gray-700 border-gray-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-800">Estado:</span>
            {["todos","muy bueno","bueno","estable"].map(key => (
              <button
                key={key}
                onClick={() => setHealthChoice(key)}
                className={`px-3 py-1 rounded-full text-sm border ${healthChoice===key? 'bg-green-600 text-white border-green-600':'bg-white text-gray-700 border-gray-300'}`}
              >
                {key[0].toUpperCase()+key.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {elegibles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {elegibles.map((p: any) => (
              <div key={p.id} className={getThemeClasses(
                "bg-white rounded-lg shadow-md p-4",
                "bg-white rounded-lg shadow-md shadow-green-200/50 border border-green-100 p-4"
              )}>
                <div className="flex justify-center mb-4">
                  <div className="w-40 h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    <img src={resolveImageSrc(p.image)} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-gray-700">Especie: {p.species}</p>
                {p.breed && (<p className="text-gray-700">Raza: {p.breed}</p>)}
                <p className="text-green-700 font-semibold mt-2">Estado: {p.healthStatus}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(p.tipo || '').toLowerCase()==='domestico' && (
                    <button onClick={()=>setAdoptFor(p)} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm">Adoptar</button>
                  )}
                  {(p.tipo || '').toLowerCase()==='silvestre' && (
                    <button onClick={()=>{ setLiberateFor(p); setReleasePos(null); setReleaseDesc(""); mapRef.current=null; markerRef.current=null; }} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">Liberar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={getThemeClasses(
            "flex flex-col items-center justify-center py-16 px-4",
            "flex flex-col items-center justify-center py-16 px-4"
          )}>
            <div className={getThemeClasses(
              "w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6",
              "w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
            )}>
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className={getThemeClasses("text-xl font-semibold text-gray-600 mb-2","text-xl font-semibold text-gray-700 mb-2")}>No hay animales elegibles</h3>
            <p className={getThemeClasses(
              "text-gray-500 text-center max-w-md",
              "text-gray-600 text-center max-w-md"
            )}>
              En este momento no tenemos animales con salud suficiente para adoptar o liberar. ¡Vuelve pronto!
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Actualizamos nuestra lista regularmente</span>
            </div>
          </div>
        )}
      </div>
      {/* Modal Liberar */}
      {liberateFor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setLiberateFor(null);
                      setLiberateSubmitted(false);
                    }} 
                    className="p-3 rounded-2xl hover:bg-white/60 transition-all duration-200 group shadow-sm"
                    aria-label="Cerrar formulario"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                      Liberar Animal
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-blue-200">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Campos obligatorios marcados con *
                      </span>
                      <span className="bg-white/80 px-3 py-1 rounded-full border border-green-200 text-green-700">
                        🐾 {liberateFor.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del formulario */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-8 py-6">
                {/* Card: Mapa y Ubicación */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Ubicación de Liberación</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
                        onClick={() => getCurrentLocation('liberate')}
                        disabled={isGettingLocation}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                      </Button>
                      <span className="text-sm text-gray-600">o haz clic en el mapa</span>
                    </div>

                    <div id="liberation-map" className="rounded-lg border border-gray-300 w-full h-[400px]" />
                    
                    {/* Campo oculto para mantener la funcionalidad */}
                    <div style={{ display: 'none' }}>
                      <FormFieldWithError
                        label="Descripción del lugar de liberación"
                        value={releaseDesc}
                        onChange={(v) => setReleaseDesc(v)}
                        minLength={10}
                        maxLength={200}
                        required
                        placeholder="ej. Parque Nacional Amboró, zona de bosque húmedo"
                        forceValidate={liberateSubmitted}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50/50">
                <div className="flex justify-end gap-3">
                  
                  <Button
                    type="button"
                    onClick={handleLiberate}
                    disabled={!releasePos || !releaseDesc.trim()}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 shadow-md hover:shadow-lg active:shadow-sm transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Liberar Animal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Adoptar */}
      {adoptFor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setAdoptFor(null);
                      setAdoptSubmitted(false);
                    }} 
                    className="p-3 rounded-2xl hover:bg-white/60 transition-all duration-200 group shadow-sm"
                    aria-label="Cerrar formulario"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                      Adoptar Animal
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Campos obligatorios marcados con *
                      </span>
                      <span className="bg-white/80 px-3 py-1 rounded-full border border-blue-200 text-blue-700">
                        🐾 {adoptFor.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del formulario */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form onSubmit={(e) => { e.preventDefault(); handleAdopt(); }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 py-6" noValidate>
                {/* Card 1: Información del Adoptante */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm min-h-[500px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Información del Adoptante</h3>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <FormFieldWithError
                      label="Nombre del adoptante"
                      value={adoptName}
                      onChange={(v) => setAdoptName(v.replace(/\s{2,}/g, ' '))}
                      minLength={2}
                      maxLength={80}
                      required
                      placeholder="ej. Carlos Ruiz"
                      forceValidate={adoptSubmitted}
                    />

                    <FormFieldWithError
                      label="Contacto del adoptante"
                      value={adoptContact}
                      onChange={(v) => setAdoptContact(v)}
                      minLength={7}
                      maxLength={50}
                      required
                      placeholder="ej. 79958632 o carlos@email.com"
                      forceValidate={adoptSubmitted}
                    />

                    <FormFieldWithError
                      label="Observaciones"
                      value={adoptObs}
                      onChange={(v) => setAdoptObs(v)}
                      maxLength={300}
                      placeholder="ej. Entrega inmediata, requisitos especiales"
                      forceValidate={adoptSubmitted}
                    />
                  </div>
                </div>

                {/* Card 2: Ubicación de Entrega */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm min-h-[500px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Ubicación de Entrega</h3>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
                        onClick={() => getCurrentLocation('adopt')}
                        disabled={isGettingLocation}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                      </Button>
                      <span className="text-sm text-gray-600">o haz clic en el mapa</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Ubicación de entrega</label>
                      <div id="adoption-map" className="rounded-lg border border-gray-300 w-full h-[250px]" />
                    </div>

                    <div style={{ display: 'none' }}>
                      <FormFieldWithError
                        label="Descripción del lugar"
                        value={adoptDesc}
                        onChange={(v) => setAdoptDesc(v)}
                        minLength={5}
                        maxLength={100}
                        required
                        placeholder="ej. Barrio Plan 3000, casa con jardín"
                        forceValidate={adoptSubmitted}
                      />
                    </div>

                  </div>
                </div>
              </form>

              {/* Botones de acción */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50/50">
                <div className="flex justify-end gap-3">
                  
                  <Button
                    type="button"
                    onClick={handleAdopt}
                    disabled={!adoptPos || !adoptName.trim() || !adoptContact.trim() || !adoptDesc.trim()}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 shadow-md hover:shadow-lg active:shadow-sm transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Registrar Adopción
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
