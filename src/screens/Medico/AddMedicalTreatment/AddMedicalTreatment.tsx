import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export const AddMedicalTreatment = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fechaInicio: "",
    fechaFin: "",
    nombre: "",
    medicamento: "",
    dosis: "",
    duracion: "",
    observaciones: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tratamiento agregado:", form);
    // Aquí enviarías al backend con fetch o axios
    navigate(`/medical-treatment/${id}`);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <button onClick={() => navigate(-1)} className="text-blue-700 mb-4">← Cancelar</button>
      <h1 className="text-2xl font-semibold mb-6">Agregar Tratamiento Médico - Animal {id}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="fechaInicio" placeholder="Fecha de inicio" value={form.fechaInicio} onChange={handleChange} className="border p-2 rounded" required />
        <input name="fechaFin" placeholder="Fecha de fin" value={form.fechaFin} onChange={handleChange} className="border p-2 rounded" required />
        <input name="nombre" placeholder="Nombre del tratamiento" value={form.nombre} onChange={handleChange} className="border p-2 rounded" required />
        <input name="medicamento" placeholder="Medicamento" value={form.medicamento} onChange={handleChange} className="border p-2 rounded" required />
        <input name="dosis" placeholder="Dosis" value={form.dosis} onChange={handleChange} className="border p-2 rounded" required />
        <input name="duracion" placeholder="Duración" value={form.duracion} onChange={handleChange} className="border p-2 rounded" required />
        <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={handleChange} className="border p-2 rounded md:col-span-2" rows={3} />
        
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Guardar Tratamiento
          </Button>
        </div>
      </form>
    </div>
  );
};
