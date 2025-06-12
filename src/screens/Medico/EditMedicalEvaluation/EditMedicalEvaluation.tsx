import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, useParams, useNavigate } from "react-router-dom";

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
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/paw-logo.svg" alt="Logo" className="w-8 h-8" />
            <h1 className="text-white text-xl">Evaluaciones médicas y tratamientos</h1>
          </div>
          <nav className="flex gap-6">
            <Link to="/reports" className="text-white flex items-center gap-2">
              <img src="/reports-icon.svg" alt="Reportes" className="w-6 h-6" />
              Reportes
            </Link>
            <Link to="/management" className="text-white flex items-center gap-2">
              <img src="/management-icon.svg" alt="Gestiones" className="w-6 h-6" />
              Gestiones
            </Link>
            <Link to="/" className="text-white flex items-center gap-2">
              <img src="/home-icon.svg" alt="Home" className="w-6 h-6" />
              Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-white text-xl">Editar/Agregar Evaluaciones médicas y tratamientos Animal {id}</h2>
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