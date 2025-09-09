import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { VeterinarianList } from "../VeterinarioList";

export const Veterinario = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [veterinario, setVeterinario] = useState<null | {
    nombre: string;
    telefono: string;
    email: string;
    fecha: string;
  }>(null);

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Veterinario" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      {/* Contenido */}
      <div className="container mx-auto p-4">
        <div className="mb-6 hidden">
          <h2 className="text-white text-xl font-semibold">Veterinario asignado</h2>
        </div>
        <VeterinarianList/>

        <div className="bg-white rounded-lg p-6 shadow-lg space-y-6">
          {!veterinario ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Veterinario no asignado aún.</p>
              <AddVeterinario onSave={(data) => setVeterinario(data)} />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Datos del Veterinario</h3>
                <p><strong>Nombre:</strong> {veterinario.nombre}</p>
                <p><strong>Teléfono:</strong> {veterinario.telefono}</p>
                <p><strong>Email:</strong> {veterinario.email}</p>
                <p><strong>Fecha de asignación:</strong> {veterinario.fecha}</p>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={() => setVeterinario(null)}
                >
                  Editar Veterinario
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente interno para añadir veterinario
const AddVeterinario = ({ onSave }: { onSave: (data: any) => void }) => {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <input
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="w-full p-2 rounded border"
        required
      />
      <input
        type="tel"
        placeholder="Teléfono"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
        className="w-full p-2 rounded border"
        required
      />
      <input
        type="email"
        placeholder="Correo"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 rounded border"
        required
      />
      <input
        type="date"
        max={new Date().toISOString().split("T")[0]}
        value={form.fecha}
        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        className="w-full p-2 rounded border"
        required
      />
      <Button type="submit" className="bg-green-500 text-white hover:bg-green-600 px-4 py-2">
        Guardar Veterinario
      </Button>
    </form>
  );
};
