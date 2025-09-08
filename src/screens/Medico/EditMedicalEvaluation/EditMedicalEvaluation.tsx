import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";

export const EditMedicalEvaluation = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState({
    diagnostico: '',
    sintomasObservados: '',
    tratamientoAdministrado: '',
    medicacionRecetada: '',
    veterinarioACargo: '',
    fechaEvaluacion: '',
    horaEvaluacion: '8:00',
    proximaRevision: '',
    horaRevision: '8:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(evaluation);
    navigate(`/medical-evaluation/${id}`);
  };

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Editar Evaluación Médica" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Editar/Agregar Evaluaciones médicas y tratamientos Animal {id}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Diagnóstico:</label>
                <Input
                  value={evaluation.diagnostico}
                  onChange={(e) => setEvaluation({ ...evaluation, diagnostico: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Síntomas observados:</label>
                <textarea
                  value={evaluation.sintomasObservados}
                  onChange={(e) => setEvaluation({ ...evaluation, sintomasObservados: e.target.value })}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tratamiento administrado:</label>
                <textarea
                  value={evaluation.tratamientoAdministrado}
                  onChange={(e) => setEvaluation({ ...evaluation, tratamientoAdministrado: e.target.value })}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Medicación recetada:</label>
                <Input
                  value={evaluation.medicacionRecetada}
                  onChange={(e) => setEvaluation({ ...evaluation, medicacionRecetada: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Veterinario a cargo:</label>
                <Input
                  value={evaluation.veterinarioACargo}
                  onChange={(e) => setEvaluation({ ...evaluation, veterinarioACargo: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de evaluación:</label>
                <div className="flex gap-4">
                  <Input
                    type="date"
                    value={evaluation.fechaEvaluacion}
                    onChange={(e) => setEvaluation({ ...evaluation, fechaEvaluacion: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={evaluation.horaEvaluacion}
                    onChange={(e) => setEvaluation({ ...evaluation, horaEvaluacion: e.target.value })}
                    className="w-24"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Próxima revisión:</label>
                <div className="flex gap-4">
                  <Input
                    type="date"
                    value={evaluation.proximaRevision}
                    onChange={(e) => setEvaluation({ ...evaluation, proximaRevision: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={evaluation.horaRevision}
                    onChange={(e) => setEvaluation({ ...evaluation, horaRevision: e.target.value })}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button type="submit" className="bg-green-500 text-white hover:bg-green-600 px-8">
              GUARDAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};