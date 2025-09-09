import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const VeterinarianList = () => {
  const { id } = useParams();
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVeterinarians = async () => {
      try {
        // Ajusta la URL según tu backend
        const base = import.meta.env.VITE_API_URL || "";
        const url = base ? `${base}/veterinarios` : "/veterinarios";
        const res = await fetch(url);
        const data = await res.json();
        setVeterinarians(Array.isArray(data) ? data : data?.postgres ?? []);
      } catch (e) {
        setVeterinarians([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVeterinarians();
  }, []);

  if (loading) return <div>Cargando veterinarios...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl text-green-600 font-bold mb-4">Lista de Veterinarios</h2>
      <ul>
        {veterinarians.map((vet) => (
          <li key={vet.id || vet._id} className="mb-2 p-2 border rounded">
            <div className="font-semibold">{vet.nombre}</div>
            <div className="text-sm text-gray-600">{vet.telefono}</div>
            {/* Agrega más campos si los tienes */}
          </li>
        ))}
        {veterinarians.length === 0 && (
          <li className="text-gray-500">No hay veterinarios registrados.</li>
        )}
      </ul>
    </div>
  );
};