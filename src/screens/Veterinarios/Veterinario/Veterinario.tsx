import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";

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
      {/* Navbar */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Veterinario</h1>
          </div>
          <nav className="flex gap-6">
            <Link to="/reports" className="text-white flex items-center gap-2">
              <img src="/imagenes/reportesillo.png" alt="Reportes" className="w-10 h-10" />
              Reportes
            </Link>
            <Link to="/management" className="text-white flex items-center gap-2">
              <img src="/imagenes/Gestion.png" alt="Gestiones" className="w-12 h-12" />
              Gestiones
            </Link>
            <Link to="/pets" className="text-white flex items-center gap-2">
              <img src="/imagenes/home.png" alt="Home" className="w-8 h-8" />
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-white text-xl">Veterinario asignado al Animal {id}</h2>
        </div>

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
