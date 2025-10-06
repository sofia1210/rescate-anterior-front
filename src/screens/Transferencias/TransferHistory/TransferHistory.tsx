import { Button } from "../../../components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { getAllGeolocalizaciones, getAllLiberations } from "../../../services/transferService";
import { getAnimalById, getAllAdopciones, getAllAdoptions } from "../../../services/dataService";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

export const TransferHistory = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const [geos, setGeos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any>(null);
  const [rescuePoint, setRescuePoint] = useState<{ lat: number; lng: number; desc: string } | null>(null);
  const [events, setEvents] = useState<Array<{ lat: number; lng: number; fecha?: string; desc: string }>>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const currentId = decodeURIComponent(String(id));

        // Geolocalizaciones del animal
        const r = await getAllGeolocalizaciones();
        const data: any = r?.data;
        const list = Array.isArray(data) ? data : (data?.postgres ?? []);
        const filtered = (Array.isArray(list) ? list : [])
          .filter((g: any) => String(g.animalId) === String(currentId))
          .sort((a: any, b: any) => new Date(a.fechaRegistro || a.createdAt || a.updatedAt || 0).getTime() - new Date(b.fechaRegistro || b.createdAt || b.updatedAt || 0).getTime());

        // Punto de rescate desde el animal
        let rescue: { lat: number; lng: number; desc: string } | null = null;
        try {
          const animal = await getAnimalById(currentId);
          const lat = Number(animal?.latitud);
          const lng = Number(animal?.longitud);
          console.log(animal);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            rescue = { lat, lng, desc: animal?.ubicacionRescate || 'Ubicación de rescate' };
          }
        } catch {}

        // Eventos de liberación y adopción
        const evs: Array<{ lat: number; lng: number; fecha?: string; desc: string }> = [];
        try {
          const animal = await getAnimalById(currentId);
          const nombre = String(animal?.nombre || animal?.name || '').trim();
          if (nombre) {
            try {
              const li = await getAllLiberations();
              const ld = li?.data; const ll = Array.isArray(ld) ? ld : (ld?.postgres ?? []);
              ll.filter((x: any) => String(x?.nombreAnimal || '').trim() === nombre)
                .forEach((x: any) => {
                  const la = Number(x?.latitud); const lo = Number(x?.longitud);
                  if (Number.isFinite(la) && Number.isFinite(lo)) evs.push({ lat: la, lng: lo, fecha: x?.fechaLiberacion, desc: x?.descripcion || 'Liberación' });
                });
            } catch {}
            try {
              // prefer /adoptions si existe, fallback a /adopciones
              let ad: any;
              try { ad = await getAllAdoptions(); } catch { ad = await getAllAdopciones(); }
              const adata = ad?.data; const al = Array.isArray(adata) ? adata : (adata?.postgres ?? []);
              al.filter((x: any) => String(x?.nombreAnimal || '').trim() === nombre)
                .forEach((x: any) => {
                  const la = Number(x?.latitud); const lo = Number(x?.longitud);
                  if (Number.isFinite(la) && Number.isFinite(lo)) evs.push({ lat: la, lng: lo, fecha: x?.fechaAdopcion, desc: x?.descripcion || 'Adopción' });
                });
            } catch {}
          }
        } catch {}

        if (!alive) return;
        setGeos(filtered);
        setRescuePoint(rescue);
        setEvents(evs);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error al cargar historial");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Normaliza geos → lista
  const points = useMemo(() => (
    (geos || [])
      .map((g: any) => {
        let lat = Number(g.latitud);
        let lng = Number(g.longitud);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        // Si vienen invertidos o fuera de rango, intenta corregir
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          const tmp = lat; lat = lng; lng = tmp;
        }
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
        return {
          id: g.id || g._id,
          lat,
          lng,
          descripcion: g.descripcion,
          fecha: g.fechaRegistro || g.createdAt || g.updatedAt,
        };
      })
      .filter(Boolean) as { id: string; lat: number; lng: number; descripcion?: string; fecha?: string }[]
  ), [geos]);

  // Pintar mapa con Leaflet (global L desde CDN)
  useEffect(() => {
    const L: any = (window as any).L;
    if (!L) return;
    const container = document.getElementById('history-map');
    if (!container) return;

    // Crear mapa una sola vez
    if (!mapRef.current) {
      mapRef.current = L.map('history-map').setView([-17.7833, -63.1821], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Limpiar capas anteriores
    if (layersRef.current) {
      layersRef.current.clearLayers();
      mapRef.current.removeLayer(layersRef.current);
    }
    layersRef.current = L.layerGroup().addTo(mapRef.current);

    if (!points.length && !rescuePoint && !events.length) return;

    const latlngs = points.map((p) => [p.lat, p.lng]);
    // Polyline del recorrido
    if (latlngs.length > 1) {
      L.polyline(latlngs, { color: '#16a34a', weight: 3 }).addTo(layersRef.current);
    }

    // Markers: puntos intermedios como círculos, último como marker destacado
    points.forEach((p, idx) => {
      const isLast = idx === points.length - 1;
      const when = p.fecha ? new Date(p.fecha).toLocaleString() : '';
      const popupHtml = `<div><div style="font-weight:600">${p.descripcion || 'Ubicación'}</div><div style="font-size:12px;color:#4b5563">${when}</div><div style="font-size:12px;color:#4b5563">Lat: ${p.lat.toFixed(5)} · Lng: ${p.lng.toFixed(5)}</div></div>`;
      if (isLast) {
        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [30, 50],
          iconAnchor: [15, 50],
        });
        L.marker([p.lat, p.lng], { icon }).addTo(layersRef.current).bindPopup(popupHtml);
      } else {
        L.circleMarker([p.lat, p.lng], { radius: 6, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.9 }).addTo(layersRef.current).bindPopup(popupHtml);
      }
    });

    // Rescate: marker/círculo GRANDE en verde
    if (rescuePoint) {
      const popup = `<div><div style=\"font-weight:700;color:#166534\">Lugar de rescate</div><div style=\"font-size:12px;color:#4b5563\">${rescuePoint.desc || ''}</div></div>`;
      L.circleMarker([rescuePoint.lat, rescuePoint.lng], { radius: 14, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1 })
        .addTo(layersRef.current).bindPopup(popup);
    }

    // Eventos
    events.forEach(ev => {
      const color = /adop/i.test(ev.desc) ? '#3b82f6' : '#22c55e';
      const when = ev.fecha ? new Date(ev.fecha).toLocaleString() : '';
      const popup = `<div><div style=\"font-weight:700\">${ev.desc}</div><div style=\"font-size:12px;color:#4b5563\">${when}</div></div>`;
      L.circleMarker([ev.lat, ev.lng], { radius: 6, color, fillColor: color, fillOpacity: 0.9 })
        .addTo(layersRef.current).bindPopup(popup);
    });

    // Ajustar vista
    try {
      const fg = L.featureGroup([]);
      if (rescuePoint) fg.addLayer(L.marker([rescuePoint.lat, rescuePoint.lng]));
      points.forEach(p => fg.addLayer(L.marker([p.lat, p.lng])));
      events.forEach(e => fg.addLayer(L.marker([e.lat, e.lng])));
      const b = fg.getLayers().length ? fg.getBounds() : undefined;
      if (b) mapRef.current.fitBounds(b, { padding: [20, 20] });
    } catch {}
  }, [points, rescuePoint, events]);

  // Feed combinado para lista:
  const feed = useMemo(() => {
    const arr: Array<{ kind: 'Rescate'|'Traslado'|'Liberación'|'Adopción'; fecha?: string; desc: string; lat?: number; lng?: number; key: string }> = [];
    if (rescuePoint) arr.push({ kind: 'Rescate', fecha: undefined, desc: rescuePoint.desc, lat: rescuePoint.lat, lng: rescuePoint.lng, key: 'rescue' });
    points.forEach((p, i) => arr.push({ kind: 'Traslado', fecha: p.fecha, desc: p.descripcion || 'Ubicación', lat: p.lat, lng: p.lng, key: `geo-${p.id || i}` }));
    events.forEach((e, i) => arr.push({ kind: /adop/i.test(e.desc) ? 'Adopción' : 'Liberación', fecha: e.fecha, desc: e.desc, lat: e.lat, lng: e.lng, key: `ev-${i}` }));
    return arr.sort((a, b) => {
      const da = a.fecha ? new Date(a.fecha).getTime() : 0;
      const db = b.fecha ? new Date(b.fecha).getTime() : 0;
      return da - db;
    });
  }, [rescuePoint, points, events]);

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Historial de Traslados y Seguimiento" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-4">
        
      <div className="flex justify-end pb-4">
            <Button 
              onClick={() => navigate(`/geolocation/${id}`)}
              className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Traslado
            </Button>
          </div>
        <div className={getThemeClasses(
          "bg-white rounded-lg p-6 shadow-lg space-y-6",
          "bg-white rounded-lg p-6 shadow-lg shadow-green-200/50 border border-green-100 space-y-6"
        )}>
          {loading && <div className="text-gray-600">Cargando historial...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            geos.length > 0 ? (
              <>
                <div className="h-[360px] rounded overflow-hidden border" id="history-map" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {feed.map((item) => (
                    <div key={item.key} className={getThemeClasses(
                      "p-4 border rounded hover:shadow-md transition-shadow",
                      "p-4 border border-green-200 rounded hover:shadow-md hover:shadow-green-200/50 transition-shadow bg-green-50/30"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.kind==='Rescate' ? 'bg-red-100 text-red-700' : item.kind==='Adopción' ? 'bg-blue-100 text-blue-700' : item.kind==='Liberación' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.kind}</span>
                        <span className="font-semibold text-gray-800">{item.desc || (item.kind==='Traslado' ? 'Ubicación' : item.kind)}</span>
                      </div>
                      <div className="text-sm text-gray-600">{item.fecha ? new Date(item.fecha).toLocaleString() : '-'}</div>
                      {item.lat !== undefined && item.lng !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">Lat: {item.lat} · Lng: {item.lng}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className={getThemeClasses(
                  "text-xl font-semibold text-gray-600 mb-2",
                  "text-xl font-semibold text-gray-700 mb-2"
                )}>
                  Sin traslados registrados
                </h3>
                <p className={getThemeClasses(
                  "text-gray-500 text-center max-w-md mb-4",
                  "text-gray-600 text-center max-w-md mb-4"
                )}>
                  Este animal aún no tiene historial de traslados. 
                  ¡Registra la primera ubicación para comenzar el seguimiento!
                </p>
                <Button 
                  onClick={() => navigate(`/geolocation/${id}`)}
                  className={getThemeClasses(
                    "px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium",
                    "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  )}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Traslado
                </Button>
              </div>
            )
          )}
          
        </div>
      </div>
    </div>
  );
};