import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

export const AddMedicalTreatment = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();

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
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Agregar Tratamiento Médico" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-2">Agregar Tratamiento Médico</h1>
          <p className="text-white/80">Animal ID: {id}</p>
        </div>

        <form onSubmit={handleSubmit} className={getThemeClasses(
          "bg-white p-8 rounded-lg shadow-lg",
          "bg-white p-8 rounded-lg shadow-lg shadow-green-200/50 border border-green-100"
        )}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Información del Tratamiento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha de Inicio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Inicio *
              </label>
              <input 
                name="fechaInicio" 
                type="date"
                value={form.fechaInicio} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                required 
              />
            </div>

            {/* Fecha de Fin */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fecha de Fin *
              </label>
              <input 
                name="fechaFin" 
                type="date"
                value={form.fechaFin} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                required 
              />
            </div>

            {/* Nombre del Tratamiento */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre del Tratamiento *
              </label>
              <input 
                name="nombre" 
                placeholder="Ej: Tratamiento para infección respiratoria"
                value={form.nombre} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                required 
              />
            </div>

            {/* Medicamento */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Medicamento *
              </label>
              <input 
                name="medicamento" 
                placeholder="Ej: Amoxicilina, Ibuprofeno"
                value={form.medicamento} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                required 
              />
            </div>

            {/* Dosis */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Dosis *
              </label>
              <input 
                name="dosis" 
                placeholder="Ej: 10mg cada 8 horas"
                value={form.dosis} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                required 
              />
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Duración *
              </label>
              <input 
                name="duracion" 
                placeholder="Ej: 7 días, 2 semanas"
                value={form.duracion} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                required 
              />
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea 
                name="observaciones" 
                placeholder="Detalles adicionales sobre el tratamiento, efectos secundarios observados, etc."
                value={form.observaciones} 
                onChange={handleChange} 
                className={getThemeClasses(
                  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                  "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
                )}
                rows={4}
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-4">
            <Button 
              type="button"
              onClick={() => navigate(-1)}
              className={getThemeClasses(
                "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
                "px-6 py-2 border border-green-200 text-gray-700 rounded-lg hover:bg-green-50 transition-colors duration-200"
              )}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className={getThemeClasses(
                "px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200",
                "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              )}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Tratamiento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
