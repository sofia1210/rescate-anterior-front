import { Button } from "../../../components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { getAllGeolocalizaciones } from "../../../services/transferService";

export const TransferHistory = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [geos, setGeos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Eliminado mapa: mantenemos solo la lista

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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