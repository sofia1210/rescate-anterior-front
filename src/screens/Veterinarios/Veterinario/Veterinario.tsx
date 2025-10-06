import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { FormFieldWithError } from "../../../components/ui/form-field-with-error";
import { Navbar } from "../../../components/Navbar";
import { getVeterinariosList, createVeterinario, getAnimalById } from "../../../services/dataService";
import { createEvaluation, createTreatment } from "../../../services/medicalService";
import { getLocalDateTimeInputValue, toIsoWithOffset, getMinVetDate, getMaxVetDate, getMinTreatmentDate, getMaxTreatmentDate, getMinNextReviewDate, getMaxNextReviewDate } from "../../../lib/utils";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

export const Veterinario = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();

  const [vets, setVets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVet, setSelectedVet] = useState<any | null>(null);
  const [mode, setMode] = useState<"evaluation" | "treatment">("evaluation");
  const [showAddVet, setShowAddVet] = useState(false);
  const [animalName, setAnimalName] = useState<string>("");
  const [searchParams] = useSearchParams();

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
    const urlMode = (searchParams.get("mode") || "").toLowerCase();
    if (urlMode === "treatment") setMode("treatment");
    else if (urlMode === "evaluation") setMode("evaluation");
  }, [searchParams]);

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
        title="Atención Médica" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      {/* Contenido */}
      <div className="container mx-auto p-4">
        
        
        {/* Selección de modo y buscador */}
        <div className={getThemeClasses(
          "bg-white rounded-lg p-6 shadow-lg space-y-4",
          "bg-white rounded-lg p-6 shadow-lg shadow-green-200/50 border border-green-100 space-y-4"
        )}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-black">
              <h3 className="text-base md:text-lg font-semibold">
                {mode === 'treatment'
                  ? 'Seleccionar el veterinario que recetó el Tratamiento'
                  : 'Seleccionar el veterinario que realizó la Evaluación Médica'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className={getThemeClasses(
                  mode==='evaluation'? 'bg-green-600 text-white':'bg-green-500 text-white hover:bg-green-600',
                  mode==='evaluation'? 'bg-green-700 text-white':'bg-green-600 text-white hover:bg-green-700'
                )}
                onClick={() => setMode('evaluation')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Evaluación médica
              </Button>
              <Button
                className={getThemeClasses(
                  mode==='treatment'? 'bg-green-600 text-white':'bg-green-500 text-white hover:bg-green-600',
                  mode==='treatment'? 'bg-green-700 text-white':'bg-green-600 text-white hover:bg-green-700'
                )}
                onClick={() => setMode('treatment')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Tratamiento
              </Button>
            </div>
          </div>
        </div>
          <div className="flex gap-2 items-stretch md:items-center">
            <input
              className={getThemeClasses(
                "flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500",
                "flex-1 border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
              )}
              placeholder="Buscar veterinario por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
              onClick={() => setShowAddVet(true)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar veterinario
            </Button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vets
                .filter((v) => (v?.nombre || "").toLowerCase().includes((search || "").toLowerCase()))
                .map((v) => (
                  <div
                    key={v.id || v._id}
                    className={getThemeClasses(
                      `group border rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md cursor-pointer ${selectedVet?.id === v.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`,
                      `group border rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:shadow-green-200/50 cursor-pointer ${selectedVet?.id === v.id ? 'border-green-500 bg-green-100' : 'border-green-200 hover:border-green-400 bg-green-50/30'}`
                    )}
                    onClick={() => setSelectedVet(v)}
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{v.nombre}</div>
                      <div className="text-sm text-gray-600">{v.telefono}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className={getThemeClasses(
                          "bg-green-500 text-white hover:bg-green-600",
                          "bg-green-600 text-white hover:bg-green-700"
                        )}
                        onClick={(e) => { e.stopPropagation(); setSelectedVet(v); }}
                      >
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {!selectedVet && (
            <></>
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

        {/* Selección de veterinario y formulario según modo */}
        {selectedVet && (
          <div className={getThemeClasses(
            "bg-white rounded-lg p-6 shadow-lg space-y-4 mt-6",
            "bg-white rounded-lg p-6 shadow-lg shadow-green-200/50 border border-green-100 space-y-4 mt-6"
          )}>
            {mode === 'evaluation' && (
              <EvaluationForm animalName={animalName} vetName={selectedVet.nombre} onSaved={() => navigate(`/medical-evaluation/${id}`)} />
            )}
            {mode === 'treatment' && (
              <TreatmentForm animalName={animalName} vetName={selectedVet.nombre} onSaved={() => navigate(`/medical-treatment/${id}`)} />
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
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    especialidad: '',
    email: '',
    fecha: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Validación del lado del cliente antes de enviar
    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      return;
    }
    if (!form.telefono.trim() || form.telefono.trim().length < 8) {
      return;
    }
    if (!form.especialidad.trim() || form.especialidad.trim().length < 2) {
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      return;
    }
    if (!form.fecha) {
      return;
    }
    
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldWithError
          label="Nombre del veterinario"
          value={form.nombre}
          onChange={(v) => setForm({ ...form, nombre: v.replace(/\s{2,}/g, ' ') })}
          minLength={2}
          maxLength={80}
          placeholder="ej. Dr. Juan Pérez"
          required
          forceValidate={submitted}
        />
        <FormFieldWithError
          label="Teléfono de contacto"
          type="tel"
          inputMode="numeric"
          value={form.telefono}
          onChange={(v) => setForm({ ...form, telefono: v.replace(/\D/g, '') })}
          pattern="^[0-9]{8,12}$"
          minLength={8}
          maxLength={12}
          placeholder="ej. 79958632"
          required
          validateMessage="Ingrese solo números (8 a 12 dígitos)."
          forceValidate={submitted}
        />
        <FormFieldWithError
          label="Especialidad"
          value={form.especialidad}
          onChange={(v) => setForm({ ...form, especialidad: v })}
          minLength={2}
          maxLength={60}
          placeholder="ej. Medicina Veterinaria"
          required
          forceValidate={submitted}
        />
        <FormFieldWithError
          label="Correo electrónico"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
          placeholder="ej. juan.perez@correo.com"
          required
          validateMessage="Correo inválido"
          forceValidate={submitted}
        />
        <FormFieldWithError
          label="Fecha de registro"
          type="date"
          value={form.fecha}
          onChange={(v) => setForm({ ...form, fecha: v })}
          min={getMinVetDate()}
          max={getMaxVetDate()}
          required
          forceValidate={submitted}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" className={getThemeClasses(
          "bg-green-500 text-white hover:bg-green-600 px-6 py-2",
          "bg-green-600 text-white hover:bg-green-700 px-6 py-2"
        )}>
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar y Continuar
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
    fechaEvaluacion: getLocalDateTimeInputValue(new Date()),
    proximaRevision: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Validación del lado del cliente antes de enviar
    if (!form.diagnostico.trim() || form.diagnostico.trim().length < 3) {
      return;
    }
    if (!form.sintomas.trim() || form.sintomas.trim().length < 2) {
      return;
    }
    if (!form.medicacion.trim() || form.medicacion.trim().length < 2) {
      return;
    }
    if (!form.fechaEvaluacion) {
      return;
    }
    
    await createEvaluation({
      nombreAnimal: animalName,
      diagnostico: form.diagnostico,
      sintomas: form.sintomas,
      medicacion: form.medicacion,
      responsableNombre: vetName,
      fechaEvaluacion: toIsoWithOffset(form.fechaEvaluacion, -240),
      proximaRevision: form.proximaRevision ? toIsoWithOffset(form.proximaRevision, -240) : undefined,
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWithError
            label="Diagnóstico"
            value={form.diagnostico}
            onChange={(v)=>setForm({...form, diagnostico:v})}
            minLength={3}
            maxLength={200}
            required
            placeholder="ej. Infección respiratoria"
            forceValidate={submitted}
          />
          <FormFieldWithError
            label="Síntomas"
            value={form.sintomas}
            onChange={(v)=>setForm({...form, sintomas:v})}
            minLength={2}
            maxLength={160}
            required
            placeholder="ej. Tos, dificultad respiratoria"
            forceValidate={submitted}
          />
          <FormFieldWithError
            label="Medicación"
            value={form.medicacion}
            onChange={(v)=>setForm({...form, medicacion:v})}
            minLength={2}
            maxLength={120}
            placeholder="ej. Amoxicilina"
            forceValidate={submitted}
          />
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
              min={getMinTreatmentDate() + "T00:00"}
              max={getMaxTreatmentDate() + "T23:59"}
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
              min={getMinNextReviewDate() + "T00:00"}
              max={getMaxNextReviewDate() + "T23:59"}
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
    sintomas: "",
    duracion: "",
    observaciones: "",
    fechaTratamiento: getLocalDateTimeInputValue(new Date()),
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Validación del lado del cliente antes de enviar
    if (!form.tratamiento.trim() || form.tratamiento.trim().length < 3) {
      return;
    }
    if (!form.sintomas.trim() || form.sintomas.trim().length < 2) {
      return;
    }
    if (!form.duracion.trim() || form.duracion.trim().length < 2) {
      return;
    }
    if (!form.fechaTratamiento) {
      return;
    }
    
    await createTreatment({
      nombreAnimal: animalName,
      tratamiento: form.tratamiento,
      sintomas: form.sintomas,
      duracion: form.duracion,
      observaciones: form.observaciones || undefined,
      responsableNombre: vetName,
      fechaTratamiento: toIsoWithOffset(form.fechaTratamiento, -240),
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWithError
            label="Tratamiento"
            value={form.tratamiento}
            onChange={(v)=>setForm({...form, tratamiento:v})}
            minLength={3}
            maxLength={160}
            required
            placeholder="ej. Antibiótico para infección"
            forceValidate={submitted}
          />
          <FormFieldWithError
            label="Síntomas"
            value={form.sintomas}
            onChange={(v)=>setForm({...form, sintomas:v})}
            minLength={2}
            maxLength={160}
            required
            placeholder="ej. Tos, dificultad respiratoria"
            forceValidate={submitted}
          />
          <FormFieldWithError
            label="Duración"
            value={form.duracion}
            onChange={(v)=>setForm({...form, duracion:v})}
            minLength={2}
            maxLength={40}
            required
            placeholder="ej. 7 días, 2 semanas"
            forceValidate={submitted}
          />
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
              min={getMinTreatmentDate() + "T00:00"}
              max={getMaxTreatmentDate() + "T23:59"}
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
              maxLength={300}
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
