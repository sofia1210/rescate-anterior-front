import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Input } from "../../components/ui/input";

export const VeterinarianList = () => {
  const { id } = useParams();
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    if (!q) return veterinarians;
    return veterinarians.filter((v) =>
      (v?.nombre || "").toLowerCase().includes(q) ||
      (v?.telefono || "").toLowerCase().includes(q)
    );
  }, [veterinarians, query]);

  if (loading) return <div className="container mx-auto p-4">Cargando veterinarios...</div>;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar title="Veterinarios" />
      <div className="container mx-auto p-4">
        <div className="mb-3">
          <Input
            type="search"
            placeholder="Buscar por nombre o teléfono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar veterinario"
          />
          {query && (
            <p className="text-sm text-gray-600 mt-2">Mostrando {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "{query}"</p>
          )}
        </div>
        <ul>
        {filtered.map((vet) => (
          <li key={vet.id || vet._id} className="mb-2 p-2 border rounded">
            <div className="font-semibold">{vet.nombre}</div>
            <div className="text-sm text-gray-600">{vet.telefono}</div>
            {/* Agrega más campos si los tienes */}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-gray-500">No hay veterinarios registrados.</li>
        )}
        </ul>
      </div>
    </div>
  );
};