import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";

export const MedicalEvaluation = (): JSX.Element => {
  const { id } = useParams(); // id del animal
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Evaluación Médica" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

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
