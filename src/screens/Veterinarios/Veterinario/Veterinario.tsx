import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { getVeterinariosList, createVeterinario, getAnimalById } from "../../../services/dataService";
import { createEvaluation, createTreatment } from "../../../services/medicalService";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

export const Veterinario = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();

  const [vets, setVets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVet, setSelectedVet] = useState<any | null>(null);
  const [mode, setMode] = useState<"none" | "evaluation" | "treatment">("none");
  const [showAddVet, setShowAddVet] = useState(false);
  const [animalName, setAnimalName] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const list = await getVeterinariosList();
        setVets(list);
      } catch (e) {
        setVets([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const animal: any = await getAnimalById(String(id));
        const name = animal?.nombre || animal?.name || "";
        setAnimalName(name || "");
      } catch {
        setAnimalName("");
      }
    })();
  }, [id]);

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Veterinario" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      {/* Contenido */}
      <div className="container mx-auto p-4">
        
        
        {/* Buscador y lista de veterinarios */}
        <div className={getThemeClasses(
          "bg-white rounded-lg p-6 shadow-lg space-y-4",
          "bg-white rounded-lg p-6 shadow-lg shadow-green-200/50 border border-green-100 space-y-4"
        )}>
        <div className="text-black mb-4">
         <h3 className="text-lg font-semibold">Selecciona el veterinario para agregar la evaluación o tratamiento.</h3>
        </div>
          <div className="flex gap-2">
            <input
              className={getThemeClasses(
                "flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "flex-1 border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Buscar veterinario por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button className={getThemeClasses(
              "bg-green-500 text-white hover:bg-green-600",
              "bg-green-600 text-white hover:bg-green-700"
            )} onClick={() => setSelectedVet(null)}>
              Limpiar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {vets
              .filter((v) => (v?.nombre || "").toLowerCase().includes((search || "").toLowerCase()))
              .map((v) => (
                <div key={v.id || v._id} className={getThemeClasses(
                  `border rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md ${selectedVet?.id === v.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`,
                  `border rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:shadow-green-200/50 ${selectedVet?.id === v.id ? 'border-green-500 bg-green-100' : 'border-green-200 hover:border-green-400 bg-green-50/30'}`
                )}>
                  <div>
                    <div className="font-semibold text-gray-800">{v.nombre}</div>
                    <div className="text-sm text-gray-600">{v.telefono}</div>
                  </div>
                  <Button className={getThemeClasses(
                    "bg-green-500 text-white hover:bg-green-600",
                    "bg-green-600 text-white hover:bg-green-700"
                  )} onClick={() => setSelectedVet(v)}>
                    Elegir
                  </Button>
                </div>
              ))}
          </div>

          {!selectedVet && (
            <div className="flex justify-end">
              <Button className={getThemeClasses(
                "bg-green-500 text-white hover:bg-green-600",
                "bg-green-600 text-white hover:bg-green-700"
              )} onClick={() => setShowAddVet(true)}>
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Añadir veterinario
              </Button>
            </div>
          )}
        </div>

        {showAddVet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className={getThemeClasses(
              "bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl",
              "bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl border border-green-200"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Nuevo Veterinario
                </h3>
                <button
                  aria-label="Cerrar"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowAddVet(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddVeterinario
                onSave={async (data) => {
                  await createVeterinario({
                    nombre: data.nombre,
                    telefono: data.telefono,
                    especialidad: data.especialidad || "Medicina Veterinaria",
                    email: data.email,
                  });
                  const list = await getVeterinariosList();
                  setVets(list);
                  setShowAddVet(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Selección de acción */}
        {selectedVet && (
          <div className={getThemeClasses(
            "bg-white rounded-lg p-6 shadow-lg space-y-4 mt-6",
            "bg-white rounded-lg p-6 shadow-lg shadow-green-200/50 border border-green-100 space-y-4 mt-6"
          )}>
            <div className="flex items-center justify-between">
              <div className={getThemeClasses(
                "bg-gray-50 p-4 rounded-lg",
                "bg-green-50/50 p-4 rounded-lg border border-green-100"
              )}>
                <div className="font-semibold text-gray-700 mb-1">Veterinario seleccionado:</div>
                <div className="text-lg text-gray-800">{selectedVet.nombre}</div>
                <div className="text-sm text-gray-600">{selectedVet.telefono}</div>
              </div>
              <div className="flex gap-3">
                <Button className={getThemeClasses(
                  mode==='evaluation'? 'bg-green-600 text-white':'bg-green-500 text-white hover:bg-green-600',
                  mode==='evaluation'? 'bg-green-700 text-white':'bg-green-600 text-white hover:bg-green-700'
                )} onClick={() => setMode('evaluation')}>
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Evaluación médica
                </Button>
                <Button className={getThemeClasses(
                  mode==='treatment'? 'bg-green-600 text-white':'bg-green-500 text-white hover:bg-green-600',
                  mode==='treatment'? 'bg-green-700 text-white':'bg-green-600 text-white hover:bg-green-700'
                )} onClick={() => setMode('treatment')}>
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Tratamiento
                </Button>
              </div>
            </div>

            {mode === 'evaluation' && (
              <EvaluationForm animalName={animalName} vetName={selectedVet.nombre} onSaved={() => navigate(-1)} />
            )}
            {mode === 'treatment' && (
              <TreatmentForm animalName={animalName} vetName={selectedVet.nombre} onSaved={() => navigate(-1)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente interno para añadir veterinario
const AddVeterinario = ({ onSave }: { onSave: (data: any) => void }) => {
  const { getThemeClasses } = useThemeClasses();
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    especialidad: '',
    email: '',
    fecha: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            type="text"
            placeholder="Dr. Juan Pérez"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className={getThemeClasses(
              "w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
            )}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
          <input
            type="tel"
            placeholder="12345678"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
            className={getThemeClasses(
              "w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
            )}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Especialidad *</label>
          <input
            type="text"
            placeholder="Medicina Veterinaria"
            value={form.especialidad}
            onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
            className={getThemeClasses(
              "w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
            )}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Correo *</label>
          <input
            type="email"
            placeholder="dr.perez@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={getThemeClasses(
              "w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
            )}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Fecha de Registro *</label>
          <input
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            className={getThemeClasses(
              "w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
            )}
            required
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className={getThemeClasses(
          "bg-green-500 text-white hover:bg-green-600 px-6 py-2",
          "bg-green-600 text-white hover:bg-green-700 px-6 py-2"
        )}>
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar Veterinario
        </Button>
      </div>
    </form>
  );
};

const EvaluationForm = ({ animalName, vetName, onSaved }: { animalName: string; vetName: string; onSaved: () => void }) => {
  const { getThemeClasses } = useThemeClasses();
  const [form, setForm] = useState({
    diagnostico: "",
    sintomas: "",
    medicacion: "",
    fechaEvaluacion: new Date().toISOString().slice(0, 16),
    proximaRevision: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvaluation({
      nombreAnimal: animalName,
      diagnostico: form.diagnostico,
      sintomas: form.sintomas || undefined,
      medicacion: form.medicacion || undefined,
      responsableNombre: vetName,
      fechaEvaluacion: new Date(form.fechaEvaluacion).toISOString(),
      proximaRevision: form.proximaRevision ? new Date(form.proximaRevision).toISOString() : undefined,
    });
    onSaved();
  };

  return (
    <div className={getThemeClasses(
      "bg-gray-50 p-6 rounded-lg",
      "bg-green-50/50 p-6 rounded-lg border border-green-100"
    )}>
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Nueva Evaluación Médica
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Diagnóstico *</label>
            <input 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Ej: Infección respiratoria"
              value={form.diagnostico} 
              onChange={(e)=>setForm({...form, diagnostico:e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Síntomas</label>
            <input 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Ej: Tos, dificultad respiratoria"
              value={form.sintomas} 
              onChange={(e)=>setForm({...form, sintomas:e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Medicación</label>
            <input 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Ej: Amoxicilina"
              value={form.medicacion} 
              onChange={(e)=>setForm({...form, medicacion:e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fecha de Evaluación *</label>
            <input 
              type="datetime-local" 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              value={form.fechaEvaluacion} 
              onChange={(e)=>setForm({...form, fechaEvaluacion:e.target.value})} 
              required 
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Próxima Revisión (opcional)</label>
            <input 
              type="datetime-local" 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              value={form.proximaRevision} 
              onChange={(e)=>setForm({...form, proximaRevision:e.target.value})} 
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" className={getThemeClasses(
            "bg-green-500 text-white hover:bg-green-600 px-6 py-2",
            "bg-green-600 text-white hover:bg-green-700 px-6 py-2"
          )}>
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar Evaluación
          </Button>
        </div>
      </form>
    </div>
  );
};

const TreatmentForm = ({ animalName, vetName, onSaved }: { animalName: string; vetName: string; onSaved: () => void }) => {
  const { getThemeClasses } = useThemeClasses();
  const [form, setForm] = useState({
    tratamiento: "",
    duracion: "",
    observaciones: "",
    fechaTratamiento: new Date().toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTreatment({
      nombreAnimal: animalName,
      tratamiento: form.tratamiento,
      duracion: form.duracion,
      observaciones: form.observaciones || undefined,
      responsableNombre: vetName,
      fechaTratamiento: new Date(form.fechaTratamiento).toISOString(),
    });
    onSaved();
  };

  return (
    <div className={getThemeClasses(
      "bg-gray-50 p-6 rounded-lg",
      "bg-green-50/50 p-6 rounded-lg border border-green-100"
    )}>
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Nuevo Tratamiento Médico
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tratamiento *</label>
            <input 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Ej: Antibiótico para infección"
              value={form.tratamiento} 
              onChange={(e)=>setForm({...form, tratamiento:e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Duración *</label>
            <input 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Ej: 7 días, 2 semanas"
              value={form.duracion} 
              onChange={(e)=>setForm({...form, duracion:e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fecha de Tratamiento *</label>
            <input 
              type="datetime-local" 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              value={form.fechaTratamiento} 
              onChange={(e)=>setForm({...form, fechaTratamiento:e.target.value})} 
              required 
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Observaciones (opcional)</label>
            <textarea 
              className={getThemeClasses(
                "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Detalles adicionales sobre el tratamiento..."
              value={form.observaciones} 
              onChange={(e)=>setForm({...form, observaciones:e.target.value})} 
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" className={getThemeClasses(
            "bg-green-500 text-white hover:bg-green-600 px-6 py-2",
            "bg-green-600 text-white hover:bg-green-700 px-6 py-2"
          )}>
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar Tratamiento
          </Button>
        </div>
      </form>
    </div>
  );
};
