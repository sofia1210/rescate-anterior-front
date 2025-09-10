import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { getVeterinariosList, createVeterinario, getAnimalById } from "../../../services/dataService";
import { createEvaluation, createTreatment } from "../../../services/medicalService";

export const Veterinario = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Veterinario" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      {/* Contenido */}
      <div className="container mx-auto p-4">
        
        
        {/* Buscador y lista de veterinarios */}
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
        <div className="text-black mb-4">
         <h3 className="text-lg font-semibold">Selecciona el veterinario para agregar la evaluación o tratamiento.</h3>
        </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Buscar veterinario por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="bg-green-500 text-white hover:bg-green-600" onClick={() => setSelectedVet(null)}>
              Limpiar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {vets
              .filter((v) => (v?.nombre || "").toLowerCase().includes((search || "").toLowerCase()))
              .map((v) => (
                <div key={v.id || v._id} className={`border rounded p-3 flex items-center justify-between ${selectedVet?.id === v.id ? 'border-green-500' : ''}`}>
                  <div>
                    <div className="font-semibold">{v.nombre}</div>
                    <div className="text-sm text-gray-600">{v.telefono}</div>
                  </div>
                  <Button className="bg-green-500 text-white hover:bg-green-600" onClick={() => setSelectedVet(v)}>
                    Elegir
                  </Button>
                </div>
              ))}
          </div>

          {!selectedVet && (
            <div className="flex justify-end">
              <Button className="bg-green-500 text-white hover:bg-green-600" onClick={() => setShowAddVet(true)}>
                Añadir veterinario
              </Button>
            </div>
          )}
        </div>

        {showAddVet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nuevo Veterinario</h3>
                <button
                  aria-label="Cerrar"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddVet(false)}
                >
                  ✕
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
          <div className="bg-white rounded-lg p-6 shadow-lg space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Veterinario seleccionado:</div>
                <div>{selectedVet.nombre}</div>
              </div>
              <div className="flex gap-2">
                <Button className={mode==='evaluation'? 'bg-green-600 text-white':'bg-green-500 text-white hover:bg-green-600'} onClick={() => setMode('evaluation')}>
                  Evaluación médica
                </Button>
                <Button className={mode==='treatment'? 'bg-green-600 text-white':'bg-green-500 text-white hover:bg-green-600'} onClick={() => setMode('treatment')}>
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
        type="text"
        placeholder="Especialidad"
        value={form.especialidad}
        onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
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

const EvaluationForm = ({ animalName, vetName, onSaved }: { animalName: string; vetName: string; onSaved: () => void }) => {
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className="w-full border rounded px-3 py-2" placeholder="Diagnóstico" value={form.diagnostico} onChange={(e)=>setForm({...form, diagnostico:e.target.value})} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Síntomas" value={form.sintomas} onChange={(e)=>setForm({...form, sintomas:e.target.value})} />
      <input className="w-full border rounded px-3 py-2" placeholder="Medicación" value={form.medicacion} onChange={(e)=>setForm({...form, medicacion:e.target.value})} />
      <label className="block text-sm">Fecha evaluación</label>
      <input type="datetime-local" className="w-full border rounded px-3 py-2" value={form.fechaEvaluacion} onChange={(e)=>setForm({...form, fechaEvaluacion:e.target.value})} required />
      <label className="block text-sm">Próxima revisión (opcional)</label>
      <input type="datetime-local" className="w-full border rounded px-3 py-2" value={form.proximaRevision} onChange={(e)=>setForm({...form, proximaRevision:e.target.value})} />
      <div className="flex justify-end">
        <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">Guardar evaluación</Button>
      </div>
    </form>
  );
};

const TreatmentForm = ({ animalName, vetName, onSaved }: { animalName: string; vetName: string; onSaved: () => void }) => {
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className="w-full border rounded px-3 py-2" placeholder="Tratamiento" value={form.tratamiento} onChange={(e)=>setForm({...form, tratamiento:e.target.value})} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Duración" value={form.duracion} onChange={(e)=>setForm({...form, duracion:e.target.value})} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Observaciones (opcional)" value={form.observaciones} onChange={(e)=>setForm({...form, observaciones:e.target.value})} />
      <label className="block text-sm">Fecha de tratamiento</label>
      <input type="datetime-local" className="w-full border rounded px-3 py-2" value={form.fechaTratamiento} onChange={(e)=>setForm({...form, fechaTratamiento:e.target.value})} required />
      <div className="flex justify-end">
        <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">Guardar tratamiento</Button>
      </div>
    </form>
  );
};
