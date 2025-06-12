import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export const Reports = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-400/80">
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Reportes Automáticos</h1>
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

      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-white text-xl">Reportes Automáticos</h2>
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
            <Button className="bg-green-500 text-white hover:bg-green-600 px-8">
              GUARDAR REPORTES
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};