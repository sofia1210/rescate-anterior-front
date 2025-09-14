import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAnimalById } from "../../../services/dataService";
import { getAllLiberations } from "../../../services/transferService";
import { getAllAdopciones, getAllAdoptions } from "../../../services/dataService";

interface AnimalDetailsProps {
  animal: {
    id: number;
    name: string;
    species: string;
    breed: string;
    sex: string;
    age: string;
    healthStatus: string;
    admissionDate: string;
    feedingType: string;
    recommendedAmount: string;
    recommendedFrequency: string;
    releaseDate: string;
    releaseLocation: string;
    image: string;
    tipo: string;
    rescuer?: {
      id: number;
      name: string;
      phone: string;
      rescueDate: string;
      rescueLocation: string;
    };
  };
  onClose: () => void;
  onEdit: () => void;
}

export const AnimalDetails = ({ animal, onClose, onEdit }: AnimalDetailsProps): JSX.Element => {
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const hasTreatment = false; // cambiar a true si el animal ya tiene tratamiento registrado
  const mapRef = useRef<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [liberations, setLiberations] = useState<any[]>([]);
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [rescuePoint, setRescuePoint] = useState<{ lat: number; lng: number; desc?: string } | null>(null);
  const [showRescuerModal, setShowRescuerModal] = useState(false);
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

  const formatDateDMY = (value?: string): string => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Carga liberaciones/adopciones por nombre del animal
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const nombre = String(animal?.name || "").trim();
        if (!nombre) return;
        // Liberaciones
        try {
          const lr = await getAllLiberations();
          const ld = lr?.data; const ll = Array.isArray(ld) ? ld : (ld?.postgres ?? []);
          if (alive) setLiberations(ll.filter((x: any) => {
            const n = String(x?.nombreAnimal || x?.animal?.nombre || x?.animal?.name || "").trim();
            return n === nombre;
          }));
        } catch { if (alive) setLiberations([]); }
        // Adopciones (/adoptions preferido, fallback /adopciones)
        try {
          let ar: any; try { ar = await getAllAdoptions(); } catch { ar = await getAllAdopciones(); }
          const ad = ar?.data; const al = Array.isArray(ad) ? ad : (ad?.postgres ?? []);
          if (alive) setAdoptions(al.filter((x: any) => {
            const n = String(x?.nombreAnimal || x?.animal?.nombre || x?.animal?.name || "").trim();
            return n === nombre;
          }));
        } catch { if (alive) setAdoptions([]); }
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, [animal?.name]);

  // Fechas calculadas desde endpoints
  const toDate = (v?: any): Date | null => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const latestLiberationDateStr = useMemo(() => {
    const ordered = (liberations || [])
      .map((x: any) => toDate(x?.fechaLiberacion || x?.fecha || x?.createdAt))
      .filter((d: any) => d instanceof Date) as Date[];
    if (!ordered.length) return "";
    ordered.sort((a, b) => a.getTime() - b.getTime());
    return ordered[ordered.length - 1].toLocaleString();
  }, [liberations]);

  const latestAdoptionDateStr = useMemo(() => {
    const approved = (adoptions || []).filter((x: any) => String(x?.estado || '').toLowerCase() === 'aprobada');
    const ordered = approved
      .map((x: any) => toDate(x?.fechaAdopcion || x?.fecha || x?.createdAt))
      .filter((d: any) => d instanceof Date) as Date[];
    if (!ordered.length) return "";
    ordered.sort((a, b) => a.getTime() - b.getTime());
    return ordered[ordered.length - 1].toLocaleString();
  }, [adoptions]);

  // Carga coordenadas reales de rescate del animal (lat/lng)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const full = await getAnimalById(String(animal.id));
        const lat = Number(full?.latitud ?? full?.geolocalizacion?.latitud);
        const lng = Number(full?.longitud ?? full?.geolocalizacion?.longitud);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          if (!alive) return;
          setRescuePoint({ lat, lng, desc: full?.ubicacionRescate ?? full?.geolocalizacion?.descripcion });
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [animal.id]);

  // Función para inicializar el mapa con ubicaciones
  useEffect(() => {
    if (!showMap) return;
    
    const L: any = (window as any).L;
    const container = document.getElementById('animal-location-map');
    if (!L || !container) return;

    // Coordenadas por defecto (Santa Cruz, Bolivia)
    const defaultCenter: [number, number] = [-17.7833, -63.1821];
    
    if (!mapRef.current) {
      mapRef.current = L.map('animal-location-map').setView(defaultCenter, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Limpiar marcadores anteriores
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Agregar marcadores para ubicaciones conocidas
    const locations: Array<{lat: number, lng: number, title: string, color: string}> = [];
    
    // Ubicación de rescate real (si hay lat/lng)
    if (rescuePoint) {
      locations.push({
        lat: rescuePoint.lat,
        lng: rescuePoint.lng,
        title: `Rescate: ${rescuePoint.desc || ''}`,
        color: '#ef4444'
      });
    }

    // Liberaciones reales (si existen)
    (liberations || []).forEach((x: any) => {
      const lat = Number(x?.latitud); const lng = Number(x?.longitud);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        locations.push({ lat, lng, title: `Liberación: ${x?.descripcion || ''}`, color: '#22c55e' });
      }
    });

    // Adopciones reales (si existen)
    (adoptions || []).forEach((x: any) => {
      const lat = Number(x?.latitud); const lng = Number(x?.longitud);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        locations.push({ lat, lng, title: `Adopción: ${x?.descripcion || ''}`, color: '#3b82f6' });
      }
    });

    // Agregar marcadores al mapa
    locations.forEach(location => {
      const marker = L.circleMarker([location.lat, location.lng], {
        radius: 8,
        color: location.color,
        fillColor: location.color,
        fillOpacity: 0.8,
        weight: 2
      }).addTo(mapRef.current);
      
      marker.bindPopup(`<div class="text-sm"><strong>${location.title}</strong></div>`);
    });

    // Ajustar vista si hay ubicaciones
    if (locations.length > 0) {
      const group = new L.featureGroup(locations.map(loc => L.circleMarker([loc.lat, loc.lng])));
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, animal.rescuer?.rescueLocation, animal.releaseLocation, animal.tipo, liberations, adoptions, rescuePoint]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 pb-4 backdrop-blur-sm">
      <div className={getThemeClasses(
        "bg-white rounded-lg p-6 pt-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative",
        "bg-white rounded-lg p-6 pt-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200 relative"
      )}>
        <div className={getThemeClasses(
          "flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-200",
          "flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-green-200"
        )}>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className={getThemeClasses(
              "text-gray-500 hover:text-gray-700 transition-colors duration-200",
              "text-gray-500 hover:text-gray-700 transition-colors duration-200"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{animal.name}</h2>
              <p className="text-sm text-gray-500">{animal.tipo === 'domestico' ? 'Animal Doméstico' : 'Animal Silvestre'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={getThemeClasses(
              "w-3 h-3 rounded-full",
              "w-3 h-3 rounded-full"
            )} style={{backgroundColor: animal.tipo === 'domestico' ? '#3b82f6' : '#10b981'}}></div>
            <span className="text-sm text-gray-600">{animal.species}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Información Básica */}
            <div className={getThemeClasses(
              "bg-gray-50 p-4 rounded-lg",
              "bg-green-50/50 p-4 rounded-lg border border-green-100"
            )}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="text-right font-semibold text-gray-600">Especie:</div>
                <div className="text-gray-800">{animal.species}</div>

                <div className="text-right font-semibold text-gray-600">Raza:</div>
                <div className="text-gray-800">{animal.breed}</div>

                <div className="text-right font-semibold text-gray-600">Sexo:</div>
                <div className="text-gray-800">{animal.sex}</div>

                <div className="text-right font-semibold text-gray-600 hidden">Edad:</div>
                <div className="text-gray-800 hidden">{animal.age}</div>

                <div className="text-right font-semibold text-gray-600">Estado de Salud:</div>
                <div className="text-gray-800">{animal.healthStatus}</div>

                <div className="text-right font-semibold text-gray-600">Fecha de Ingreso:</div>
                <div className="text-gray-800">{formatDateDMY(animal.admissionDate)}</div>
              </div>
            </div>

            {/* Información de Alimentación */}
            <div className={getThemeClasses(
              "bg-gray-50 p-4 rounded-lg",
              "bg-green-50/50 p-4 rounded-lg border border-green-100"
            )}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Alimentación
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="text-right font-semibold text-gray-600">Tipo:</div>
                <div className="text-gray-800">{animal.feedingType}</div>

                <div className="text-right font-semibold text-gray-600">Cantidad:</div>
                <div className="text-gray-800">{animal.recommendedAmount}</div>

                <div className="text-right font-semibold text-gray-600">Frecuencia:</div>
                <div className="text-gray-800">{animal.recommendedFrequency}</div>
              </div>
            </div>

            {/* Información del Rescatista */}
            {animal.rescuer && (
              <div className={getThemeClasses(
                "bg-gray-50 p-4 rounded-lg",
                "bg-green-50/50 p-4 rounded-lg border border-green-100"
              )}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Rescatista
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="text-right font-semibold text-gray-600">Nombre:</div>
                  <div className="text-gray-800">{animal.rescuer.name}</div>

                  <div className="text-right font-semibold text-gray-600">Teléfono:</div>
                  <div className="text-gray-800">{animal.rescuer.phone}</div>

                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-6">
            {/* Imagen del Animal */}
            <div className={getThemeClasses(
              "w-80 h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-lg",
              "w-80 h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-green-200/50 border border-green-100"
            )}>
              <img src={resolveImageSrc(animal.image)} alt={animal.name} className="w-full h-full object-cover" />
            </div>

            {/* Estado del Animal */}
            <div className={getThemeClasses(
              "bg-gray-50 p-4 rounded-lg w-full",
              "bg-green-50/50 p-4 rounded-lg border border-green-100 w-full"
            )}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estado Actual
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Tipo:</span>
                  <span className={getThemeClasses(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    "px-3 py-1 rounded-full text-xs font-medium"
                  )} style={{backgroundColor: animal.tipo === 'domestico' ? '#dbeafe' : '#d1fae5', color: animal.tipo === 'domestico' ? '#1e40af' : '#065f46'}}>
                    {animal.tipo === 'domestico' ? 'Doméstico' : 'Silvestre'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <span className="text-sm text-gray-800">{animal.healthStatus}</span>
                </div>

                {animal.tipo === 'domestico' && (latestAdoptionDateStr || animal.releaseDate) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Fecha de Adopción:</span>
                    <span className="text-sm text-gray-800">{latestAdoptionDateStr || animal.releaseDate}</span>
                  </div>
                )}

                {animal.tipo === 'silvestre' && (latestLiberationDateStr || animal.releaseDate) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Fecha de Liberación:</span>
                    <span className="text-sm text-gray-800">{latestLiberationDateStr || animal.releaseDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Ubicaciones */}
        {(animal.rescuer?.rescueLocation || (liberations && liberations.length > 0) || (adoptions && adoptions.length > 0)) && (
          <div className="mt-8">
            <div className={getThemeClasses(
              "bg-gray-50 p-6 rounded-lg",
              "bg-green-50/50 p-6 rounded-lg border border-green-100"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ubicación Importante
                </h3>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={getThemeClasses(
                    "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2",
                    "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
                </button>
              </div>

              {/* Información de ubicaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {animal.rescuer?.rescueLocation && (
                  <div className={getThemeClasses(
                    "p-4 border rounded-lg bg-white",
                    "p-4 border border-green-200 rounded-lg bg-white shadow-sm"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="font-semibold text-gray-800">Ubicación de Rescate</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{animal.rescuer.rescueLocation}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Rescatado por: {animal.rescuer.name}
                    </div>
                  </div>
                )}

                {liberations && liberations.length > 0 && (
                  <div className={getThemeClasses(
                    "p-4 border rounded-lg bg-white",
                    "p-4 border border-green-200 rounded-lg bg-white shadow-sm hidden"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="font-semibold text-gray-800">Ubicación de Liberación</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{liberations[0]?.descripcion || 'Liberación registrada'}</p>
                    {liberations[0]?.fechaLiberacion && (
                      <div className="mt-2 text-xs text-gray-500">
                        Liberado el: {new Date(liberations[0]?.fechaLiberacion).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {adoptions && adoptions.length > 0 && (
                  <div className={getThemeClasses(
                    "p-4 border rounded-lg bg-white",
                    "p-4 border border-green-200 rounded-lg bg-white shadow-sm hidden"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="font-semibold text-gray-800">Ubicación de Adopción</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{adoptions[0]?.descripcion || 'Adopción registrada'}</p>
                    {adoptions[0]?.fechaAdopcion && (
                      <div className="mt-2 text-xs text-gray-500">
                        Adoptado el: {new Date(adoptions[0]?.fechaAdopcion).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mapa */}
              {showMap && (
                <div className="mt-6">
                  <div 
                    id="animal-location-map" 
                    className={getThemeClasses(
                      "w-full h-80 rounded-lg border border-gray-200 relative z-0",
                      "w-full h-80 rounded-lg border border-green-200 relative z-0"
                    )}
                    style={{ minHeight: '320px' }}
                  ></div>
                  <div className="mt-3 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Ubicación de Rescate</span>
                      </div>
                      <div className="flex items-center gap-2 hidden">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Ubicación de Liberación</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Administración
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Evaluaciones Médicas */}
            <Button 
              className={getThemeClasses(
                "bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4",
                "bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4"
              )}
              onClick={() => navigate(`/medical-evaluation/${animal.id}`)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Evaluaciones Médicas
            </Button>

            {/* Geolocalización */}
            <Button 
              className={getThemeClasses(
                "bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4",
                "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4"
              )}
              onClick={() => navigate(`/geolocation/${animal.id}`)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Añadir Ubicación
            </Button>

            {/* Historial de Traslados */}
            <Button 
              className={getThemeClasses(
                "bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4",
                "bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4"
              )}
              onClick={() => navigate(`/transfer-history/${animal.id}`)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Historial de Traslados
            </Button>

            {/* Tratamiento Médico */}
            <Button 
              onClick={() => navigate(`/medical-treatment/${animal.id}`)}
              className={getThemeClasses(
                "bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4",
                "bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {hasTreatment ? 'Ver Tratamiento' : 'Tratamiento Médico'}
            </Button>

            {/* Ver Rescatista */}
            {animal.rescuer && (
              <Button
                className={getThemeClasses(
                  "bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4",
                  "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg w-full flex items-center gap-2 p-4"
                )}
                onClick={() => setShowRescuerModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ver Rescatista
              </Button>
            )}
          </div>
        </div>

        {/* Botón editar */}
        <div className="mt-8 flex justify-end sticky bottom-0 bg-white pt-4 hidden">
          <Button onClick={onEdit} className="bg-green-500 text-white hover:bg-green-600">
            Editar Datos
          </Button>
        </div>
      </div>
      {showRescuerModal && animal.rescuer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4">
          <div className={getThemeClasses(
            "bg-white rounded-lg w-full max-w-md p-6 shadow-2xl",
            "bg-white rounded-lg w-full max-w-md p-6 shadow-2xl border border-green-200"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Información del Rescatista</h4>
              <button onClick={() => setShowRescuerModal(false)} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">✕</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex"><span className="w-40 font-medium">Nombre:</span><span>{animal.rescuer.name || '-'}</span></div>
              <div className="flex"><span className="w-40 font-medium">Teléfono:</span><span>{animal.rescuer.phone || '-'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
