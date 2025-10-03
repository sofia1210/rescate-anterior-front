import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { createGeolocalizacion } from "../../../services/transferService";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
// Leaflet via global L from CDN

declare global {
  interface Window { google: any }
}

export const Geolocation = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const [newPos, setNewPos] = useState<{ lat: number; lng: number; descripcion?: string } | null>(null);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const centerOnceRef = useRef<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return '';
      const data: any = await res.json();
      const name = data?.display_name as string | undefined;
      if (name) return name;
      const a = data?.address || {};
      const parts = [a.road, a.neighbourhood, a.suburb, a.city || a.town || a.village, a.state, a.country]
        .filter(Boolean)
        .join(', ');
      return parts;
    } catch {
      return '';
    }
  }

  useEffect(() => {
    const L: any = (window as any).L;
    const container = document.getElementById('leaflet-map');
    if (!L || !container) return;

    const defaultCenter: [number, number] = [newPos?.lat || -17.7833, newPos?.lng || -63.1821];

    if (!mapRef.current) {
      mapRef.current = L.map('leaflet-map').setView(defaultCenter, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      mapRef.current.on('click', async (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        let descripcion = '';
        try {
          descripcion = await reverseGeocode(lat, lng);
        } catch {}
        setNewPos({ lat, lng, descripcion });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
        // Si el usuario no está suficientemente cerca (poco zoom), acercar un poco; si ya está con buen zoom, no mover
        const currentZoom = mapRef.current.getZoom();
        if (typeof currentZoom === 'number' && currentZoom < 14) {
          mapRef.current.setView([lat, lng], 14, { animate: true });
        }
      });
    } else if (newPos) {
      if (markerRef.current) {
        markerRef.current.setLatLng([newPos.lat, newPos.lng]);
      } else {
        markerRef.current = L.marker([newPos.lat, newPos.lng]).addTo(mapRef.current);
      }
      // Recentrar solo si viene de geolocalización inicial
      if (centerOnceRef.current) {
        mapRef.current.setView([newPos.lat, newPos.lng], 15, { animate: true });
        centerOnceRef.current = false;
      }
    }
  }, [newPos]);

  // Intentar obtener ubicación del usuario al entrar
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let descripcion = '';
        try { descripcion = await reverseGeocode(lat, lng); } catch {}
        centerOnceRef.current = true;
        setNewPos({ lat, lng, descripcion });
      },
      () => {
        // Usuario denegó o falló: mantenemos centro por defecto
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const handleSave = async () => {
    if (!newPos || !id) return;
    await createGeolocalizacion({
      animalId: String(id),
      latitud: newPos.lat,
      longitud: newPos.lng,
      descripcion: newPos.descripcion || "Nueva ubicación",
      fechaRegistro: new Date().toISOString(),
    });
    navigate(`/transfer-history/${id}`);
  };

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Geolocalización y Monitoreo" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Ubicación del Animal</h2>
        </div>

        <div className={getThemeClasses(
          "bg-white p-6 rounded-lg shadow-md",
          "bg-white p-6 rounded-lg shadow-md shadow-green-200/50 border border-green-100"
        )}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Seleccionar ubicación de traslado</h3>
            <button
              type="button"
              aria-label="¿Cómo usar el mapa?"
              onClick={() => setShowHelp(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-white hover:bg-green-50"
              title="¿Cómo usar el mapa?"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0-9a3.75 3.75 0 0 0-3.75 3.75.75.75 0 0 0 1.5 0 2.25 2.25 0 1 1 3.014 2.124c-.81.27-1.514.843-1.919 1.582-.213.389-.345.84-.345 1.294v.25a.75.75 0 0 0 1.5 0v-.25c0-.248.062-.494.18-.711.22-.402.61-.73 1.087-.89A3.75 3.75 0 0 0 12 6.75Z" clipRule="evenodd" />
              </svg>
              <span className="inline">¿Cómo usar el mapa?</span>
            </button>
          </div>
          <div className="relative">
            <div id="leaflet-map" className="rounded" style={{ height: 380, width: '100%' }} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Descripción de la ubicación</label>
            <input
              type="text"
              className={getThemeClasses(
                "w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Dirección o referencia"
              value={newPos?.descripcion || ""}
              onChange={(e) => setNewPos((prev) => prev ? { ...prev, descripcion: e.target.value } : { lat: -17.7833, lng: -63.1821, descripcion: e.target.value })}
              minLength={3}
              maxLength={160}
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button className="bg-green-500 text-white hover:bg-green-600" onClick={handleSave} disabled={!newPos}>
              Registrar geolocalización
            </Button>
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0-9a3.75 3.75 0 0 0-3.75 3.75.75.75 0 0 0 1.5 0 2.25 2.25 0 1 1 3.014 2.124c-.81.27-1.514.843-1.919 1.582-.213.389-.345.84-.345 1.294v.25a.75.75 0 0 0 1.5 0v-.25c0-.248.062-.494.18-.711.22-.402.61-.73 1.087-.89A3.75 3.75 0 0 0 12 6.75Z" clipRule="evenodd" />
                  </svg>
                </span>
                <h4 className="text-lg font-semibold text-gray-800">¿Cómo usar el mapa?</h4>
              </div>
              <button onClick={() => setShowHelp(false)} aria-label="Cerrar"
                className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-bold">+</div>
                <p><strong>Acercar:</strong> pulsa el botón <strong>+</strong> en el mapa para acercarte.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-bold">-</div>
                <p><strong>Alejar:</strong> pulsa el botón <strong>-</strong> para alejarte.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-8 4h5m-7 5h14a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2z" />
                  </svg>
                </div>
                <p><strong>Desplazarse:</strong> mantén presionado y arrastra el mapa para moverte por la zona.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center">●</div>
                <p><strong>Seleccionar punto:</strong> haz <strong>clic</strong> en el mapa para colocar el marcador. La dirección se rellenará automáticamente y puedes editarla.</p>
              </div>
            </div>
            <div className="px-5 pb-4 flex justify-end">
              <button onClick={() => setShowHelp(false)} className="bg-green-500 text-white hover:bg-green-600 rounded px-4 py-2">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
