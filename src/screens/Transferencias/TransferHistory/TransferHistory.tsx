import { Button } from "../../../components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { getAllGeolocalizaciones } from "../../../services/transferService";

export const TransferHistory = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [geos, setGeos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const r = await getAllGeolocalizaciones();
        const data: any = r?.data;
        const list = Array.isArray(data) ? data : (data?.postgres ?? []);
        if (!alive) return;
        const currentId = decodeURIComponent(String(id));
        const filtered = (Array.isArray(list) ? list : [])
          .filter((g: any) => String(g.animalId) === String(currentId))
          .sort((a: any, b: any) => new Date(a.fechaRegistro || a.createdAt || a.updatedAt || 0).getTime() - new Date(b.fechaRegistro || b.createdAt || b.updatedAt || 0).getTime());
        setGeos(filtered);
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

    if (!points.length) return;

    const latlngs = points.map((p) => [p.lat, p.lng]);
    // Polyline del recorrido
    const line = L.polyline(latlngs, { color: '#16a34a', weight: 3 }).addTo(layersRef.current);

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

    // Ajustar vista a todos los puntos, o al menos al recorrido
    try {
      mapRef.current.fitBounds(line.getBounds(), { padding: [20, 20] });
    } catch {}
  }, [points]);

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Historial de Traslados y Seguimiento" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Historial de Traslados y Seguimiento</h2>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg space-y-6">
          {loading && <div className="text-gray-600">Cargando historial...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            geos.length > 0 ? (
              <>
                <div className="h-[360px] rounded overflow-hidden border" id="history-map" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {points.map((p, i: number) => (
                    <div key={p.id || i} className="p-4 border rounded">
                      <div className="font-semibold mb-1">{p.descripcion || 'Ubicación'}</div>
                      <div className="text-sm text-gray-600">{p.fecha ? new Date(p.fecha).toLocaleString() : '-'}</div>
                      <div className="text-sm hidden">Lat: {p.lat} · Lng: {p.lng}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-600">Sin traslados registrados.</div>
            )
          )}
          <div className="flex justify-end">
            <Button 
              onClick={() => navigate(`/geolocation/${id}`)}
              className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar Traslado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};