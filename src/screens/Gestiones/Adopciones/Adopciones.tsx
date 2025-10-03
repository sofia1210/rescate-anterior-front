import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { usePets } from "../../../services/usePets";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { Input } from "../../../components/ui/input";
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
  const elegibles = useMemo(() => {
    const ok = new Set(["bueno","muy bueno","sano","muy_bueno","muy-bueno","estable"]);
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
    if (!adoptFor?.id) return;
    try {
      const payload = {
        nombreAnimal: adoptFor.name,
        estado: 'Aprobada',
        nombreAdoptante: adoptName.trim() || 'Sin nombre',
        contactoAdoptante: adoptContact.trim() || 'Sin contacto',
        observaciones: adoptObs || undefined,
        fechaAdopcion: new Date().toISOString(),
        latitud: adoptPos?.lat as number,
        longitud: adoptPos?.lng as number,
        descripcion: adoptDesc || 'Adopción',
      } as any;
      await createAdopcion(payload);
      setAdoptFor(null);
      window.location.reload();
    } catch {
      alert('No se pudo registrar la adopción');
    }
  };

  const handleLiberate = async () => {
    if (!liberateFor?.id || !releasePos) return;
    try {
      await createLiberation({
        nombreAnimal: liberateFor.name,
        fechaLiberacion: new Date().toISOString(),
        observaciones: releaseDesc || undefined,
        latitud: releasePos.lat,
        longitud: releasePos.lng,
        descripcion: releaseDesc || 'Área de liberación',
      });
      await createGeolocalizacion({
        animalId: String(liberateFor.id),
        latitud: releasePos.lat,
        longitud: releasePos.lng,
        descripcion: releaseDesc || 'Área de liberación',
        fechaRegistro: new Date().toISOString(),
      });
      // Si deseas además reflejar situación en el animal vía PUT, avísame y lo agrego.
      setLiberateFor(null);
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
      <Navbar title="Adopciones" />

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
            {["todos","muy bueno","bueno","estable","sano"].map(key => (
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
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Liberar: {liberateFor.name}</h4>
              <button onClick={()=>setLiberateFor(null)} className="text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="text-sm text-gray-600">Selecciona en el mapa el punto de liberación y añade condiciones/observaciones.</div>
              <div id="liberation-map" className="rounded border w-full h-[50vh] md:h-[300px]" />
              <div>
                <label className="block text-sm font-medium mb-1">Lugar/Descripción</label>
                <input value={releaseDesc} onChange={(e)=>setReleaseDesc(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej. Parque Nacional ..." />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={()=>setLiberateFor(null)} className="px-4 py-2 rounded border">Cancelar</button>
                <button onClick={handleLiberate} disabled={!releasePos} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60">Liberar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Adoptar */}
      {adoptFor && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Adoptar: {adoptFor.name}</h4>
              <button onClick={()=>setAdoptFor(null)} className="text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del adoptante</label>
                <input value={adoptName} onChange={(e)=>setAdoptName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ej. Carlos Ruiz" minLength={2} maxLength={80} pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]{2,80}$" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contacto del adoptante</label>
                <input value={adoptContact} onChange={(e)=>setAdoptContact(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Teléfono o correo" pattern="(^[0-9]{7,15}$)|(^[^\s@]+@[^\s@]+\.[^\s@]+$)" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observaciones</label>
                <input value={adoptObs} onChange={(e)=>setAdoptObs(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Entrega inmediata, requisitos, etc." maxLength={300} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ubicación de entrega (opcional)</label>
                <div id="adoption-map" className="rounded border w-full h-56 md:h-64" />
                <input value={adoptDesc} onChange={(e)=>setAdoptDesc(e.target.value)} className="mt-2 w-full border rounded px-3 py-2" placeholder="Barrio / referencia" />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={()=>setAdoptFor(null)} className="px-4 py-2 rounded border">Cancelar</button>
                <button onClick={handleAdopt} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">Registrar adopción</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
