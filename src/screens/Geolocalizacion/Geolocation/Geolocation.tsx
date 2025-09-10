import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { getAnimalById } from "../../../services/dataService";
import { createGeolocalizacion } from "../../../services/transferService";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

declare global {
  interface Window { google: any }
}

export const Geolocation = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Usamos LoadScript para evitar conflictos de loader entre pantallas
  const [animalName, setAnimalName] = useState<string>("");
  const [newPos, setNewPos] = useState<{ lat: number; lng: number; descripcion?: string } | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const animal: any = await getAnimalById(String(id));
        const name = animal?.nombre || animal?.name || "";
        setAnimalName(name);
      } catch {}
    })();
  }, [id]);

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
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Geolocalización y Monitoreo" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Ubicación del Animal</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Seleccionar ubicación de traslado</h3>
          <div className="relative">
            {!mapReady && (
              <div className="h-[380px] w-full flex items-center justify-center bg-gray-50 rounded border">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Cargando mapa...
                </div>
              </div>
            )}
            <LoadScript googleMapsApiKey={(import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE"} libraries={["places"]}>
              <GoogleMap
                  mapContainerStyle={{ width: '100%', height: 380 }}
                  center={newPos || { lat: -17.7833, lng: -63.1821 }}
                  zoom={13}
                  onLoad={() => setMapReady(true)}
                  onClick={(e) => {
                    if (!e.latLng) return;
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    setNewPos({ lat, lng });
                    try {
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                        if (status === 'OK' && results && results[0]) {
                          setNewPos((prev) => prev ? { ...prev, descripcion: results[0].formatted_address } : { lat, lng, descripcion: results[0].formatted_address });
                        }
                      });
                    } catch {}
                  }}
                >
                  {newPos && <Marker position={{ lat: newPos.lat, lng: newPos.lng }} />}
                </GoogleMap>
            </LoadScript>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Descripción de la ubicación</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Dirección o referencia"
              value={newPos?.descripcion || ""}
              onChange={(e) => setNewPos((prev) => prev ? { ...prev, descripcion: e.target.value } : { lat: -17.7833, lng: -63.1821, descripcion: e.target.value })}
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button className="bg-green-500 text-white hover:bg-green-600" onClick={handleSave} disabled={!newPos}>
              Registrar geolocalización
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
