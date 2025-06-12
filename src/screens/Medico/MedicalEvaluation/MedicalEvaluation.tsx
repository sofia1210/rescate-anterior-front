import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export const MedicalEvaluation = (): JSX.Element => {
  const { id } = useParams(); // id del animal

  const [evaluation, setEvaluation] = useState<null | {
    diagnostico: string;
    sintomas?: string;
    medicacion?: string;
    responsableId?: string;
    fechaEvaluacion?: string;
    proximaRevision?: string;
  }>(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    diagnostico: "",
    sintomas: "",
    medicacion: "",
    responsableId: "",
    fechaEvaluacion: "",
    proximaRevision: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluation({ ...formData });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-green-100">
      {/* NAVBAR HEADER */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Evaluación Médica</h1>
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

      {/* CONTENIDO */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Evaluación Médica - Animal {id}
        </h1>

        {!showForm && !evaluation && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">No hay evaluación médica registrada.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            >
              Añadir Evaluación Médica
            </button>
          </div>
        )}

        {!showForm && evaluation && (
          <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Diagnóstico:</strong> {evaluation.diagnostico}</div>
            <div><strong>Fecha de Evaluación:</strong> {evaluation.fechaEvaluacion}</div>
            <div><strong>Próxima Revisión:</strong> {evaluation.proximaRevision}</div>
            <div className="md:col-span-2"><strong>Síntomas:</strong> {evaluation.sintomas}</div>
            <div><strong>Medicación:</strong> {evaluation.medicacion}</div>
            <div><strong>Veterinario Responsable:</strong> {evaluation.responsableId}</div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                onClick={() => {
                  setFormData(evaluation);
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
              >
                Editar Evaluación Médica
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico:</label>
              <input type="text" name="diagnostico" value={formData.diagnostico} onChange={handleChange} className="border p-2 rounded w-full" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Evaluación:</label>
              <input type="date" name="fechaEvaluacion" value={formData.fechaEvaluacion} onChange={handleChange} className="border p-2 rounded w-full" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Revisión:</label>
              <input type="date" name="proximaRevision" value={formData.proximaRevision} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas Observados:</label>
              <textarea name="sintomas" value={formData.sintomas} onChange={handleChange} className="border p-2 rounded w-full" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicación Recetada:</label>
              <input type="text" name="medicacion" value={formData.medicacion} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID del Veterinario Responsable:</label>
              <input type="text" name="responsableId" value={formData.responsableId} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Guardar Evaluación
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
