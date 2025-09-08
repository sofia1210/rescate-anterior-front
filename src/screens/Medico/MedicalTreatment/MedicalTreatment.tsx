import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";

export const MedicalTreatmentView = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [treatment, setTreatment] = useState<null | {
    fechaInicio: string;
    fechaFin: string;
    nombre: string;
    medicamento: string;
    dosis: string;
    duracion: string;
    observaciones: string;
  }>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    nombre: "",
    medicamento: "",
    dosis: "",
    duracion: "",
    observaciones: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTreatment(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Tratamiento Médico" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Tratamiento Médico - Animal {id}
        </h1>

        {isEditing ? (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              name="fechaInicio"
              placeholder="Fecha de Inicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              name="fechaFin"
              placeholder="Fecha de Fin"
              value={formData.fechaFin}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del tratamiento"
              value={formData.nombre}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="medicamento"
              placeholder="Medicamento"
              value={formData.medicamento}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="dosis"
              placeholder="Dosis"
              value={formData.dosis}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="duracion"
              placeholder="Duración"
              value={formData.duracion}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <textarea
              name="observaciones"
              placeholder="Observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="border p-2 rounded md:col-span-2"
              rows={3}
              required
            ></textarea>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Guardar Tratamiento
              </button>
            </div>
          </form>
        ) : treatment ? (
          <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>Fecha de Inicio:</strong> {treatment.fechaInicio}</div>
            <div><strong>Fecha de Fin:</strong> {treatment.fechaFin}</div>
            <div><strong>Nombre:</strong> {treatment.nombre}</div>
            <div><strong>Medicamento:</strong> {treatment.medicamento}</div>
            <div><strong>Dosis:</strong> {treatment.dosis}</div>
            <div><strong>Duración:</strong> {treatment.duracion}</div>
            <div className="md:col-span-2"><strong>Observaciones:</strong> {treatment.observaciones}</div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button onClick={() => { setFormData(treatment); setIsEditing(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Editar Tratamiento
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">No hay tratamiento registrado.</p>
            <button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Añadir Tratamiento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
