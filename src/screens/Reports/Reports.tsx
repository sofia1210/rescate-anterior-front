import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Navbar } from "../../components/Navbar";

export const Reports = (): JSX.Element => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [savedReportData, setSavedReportData] = useState<any>(null);

  // Datos hardcodeados del reporte
  const reportData = {
    fechaGeneracion: new Date().toLocaleDateString('es-ES'),
    periodo: "Enero - Noviembre 2024",
    totalAnimalesRegistrados: 156,
    animalesEnTratamiento: 23,
    animalesRescatados: 134,
    animalesLiberados: 45,
    porcentajeRegistrados: 86,
    porcentajeTratamiento: 34,
    porcentajeRescatados: 86,
    porcentajeLiberados: 34
  };

  const handleSaveReport = async () => {
    setIsSaving(true);
    
    // Simular guardado con delay
    setTimeout(() => {
      setSavedReportData(reportData);
      setReportSaved(true);
      setIsSaving(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Reportes Automáticos" 
       
      />

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Reportes Automáticos</h2>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Periodo del reporte Rango de Fechas de Rescate</h3>
              <div className="h-64 bg-gray-100 rounded-lg p-4">
                {/* Bar chart would go here */}
                <div className="w-full h-full flex items-end justify-between gap-4">
                  <div className="h-1/3 w-8 bg-blue-500"></div>
                  <div className="h-1/4 w-8 bg-green-500"></div>
                  <div className="h-2/3 w-8 bg-purple-500"></div>
                  <div className="h-1/4 w-8 bg-pink-500"></div>
                  <div className="h-1/6 w-8 bg-blue-300"></div>
                  <div className="h-1/3 w-8 bg-yellow-500"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>January</span>
                  <span>February</span>
                  <span>March</span>
                  <span>April</span>
                  <span>June</span>
                  <span>November</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Total de animales registrados</h4>
                <div className="text-3xl font-bold mb-2">86%</div>
                <div className="h-8 bg-blue-100 rounded">
                  <div className="h-full w-3/4 bg-blue-500 rounded"></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Animales en tratamiento</h4>
                <div className="text-3xl font-bold mb-2">+34%</div>
                <div className="h-8 bg-blue-100 rounded">
                  <div className="h-full w-1/3 bg-blue-500 rounded"></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Animales rescatados</h4>
                <div className="text-3xl font-bold mb-2">86%</div>
                <div className="h-8 bg-blue-100 rounded">
                  <div className="h-full w-3/4 bg-blue-500 rounded"></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Animales liberados</h4>
                <div className="text-3xl font-bold mb-2">+34%</div>
                <div className="h-8 bg-blue-100 rounded">
                  <div className="h-full w-1/3 bg-blue-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={handleSaveReport}
              disabled={isSaving}
              className="bg-green-500 text-white hover:bg-green-600 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  GUARDANDO...
                </div>
              ) : (
                "GUARDAR REPORTES"
              )}
            </Button>
          </div>

          {/* Mensaje de confirmación */}
          {reportSaved && (
            <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">¡Reporte guardado exitosamente!</span>
              </div>
              <p className="mt-1 text-sm">El reporte se ha guardado con fecha: {savedReportData?.fechaGeneracion}</p>
            </div>
          )}

          {/* Mostrar datos guardados */}
          {savedReportData && (
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos del Reporte Guardado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Fecha de Generación</p>
                  <p className="font-semibold text-blue-800">{savedReportData.fechaGeneracion}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="font-semibold text-green-800">{savedReportData.periodo}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Animales</p>
                  <p className="font-semibold text-purple-800">{savedReportData.totalAnimalesRegistrados}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">En Tratamiento</p>
                  <p className="font-semibold text-orange-800">{savedReportData.animalesEnTratamiento}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Animales Rescatados</p>
                  <p className="font-semibold text-red-800">{savedReportData.animalesRescatados}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Animales Liberados</p>
                  <p className="font-semibold text-yellow-800">{savedReportData.animalesLiberados}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => {
                    setReportSaved(false);
                    setSavedReportData(null);
                  }}
                  className="bg-gray-500 text-white hover:bg-gray-600 px-4"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};