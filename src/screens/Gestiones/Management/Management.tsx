import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export const Management = (): JSX.Element => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombreAnimal: 'Nombre Animal',
    estado: 'En adopción, Adoptado, Liberado',
    nombreAdoptante: 'Nombre del adoptante',
    contactoAdoptante: 'Contacto del adoptante',
    direccionAdoptante: 'Direccion del adoptante',
    observaciones: 'Observaciones',
    fechaLiberacion: 'Jun 10, 2024',
    horaLiberacion: '9:41 AM'
  });

  if (isEditing) {
    return (
      <div className="min-h-screen bg-green-400/80">
        {/* Header */}
        <header className="bg-green-500/80 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
              <h1 className="text-white text-xl">Gestión de Adopciones y Liberaciones</h1>
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
            <button onClick={() => setIsEditing(false)} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-white text-xl">Gestión de Adopciones y Liberaciones</h2>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nombre del animal:</label>
                  <Input
                    type="text"
                    placeholder="Nombre Animal"
                    className="w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Estado actual:</label>
                  <Input
                    type="text"
                    placeholder="En adopción, Adoptado, Liberado"
                    className="w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nombre del adoptante:</label>
                  <Input
                    type="text"
                    placeholder="Nombre del adoptante"
                    className="w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Contacto del adoptante:</label>
                  <Input
                    type="text"
                    placeholder="Contacto del adoptante"
                    className="w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Dirección del adoptante:</label>
                  <Input
                    type="text"
                    placeholder="Dirección del adoptante"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Observaciones:</label>
                  <textarea
                    className="w-full h-32 p-2 border rounded-md"
                    placeholder="Observaciones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de rescate/liberación</label>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-lg font-semibold mb-2">June 2024</div>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      <div className="text-gray-500">SUN</div>
                      <div className="text-gray-500">MON</div>
                      <div className="text-gray-500">TUE</div>
                      <div className="text-gray-500">WED</div>
                      <div className="text-gray-500">THU</div>
                      <div className="text-gray-500">FRI</div>
                      <div className="text-gray-500">SAT</div>
                      {/* Calendar days would be dynamically generated here */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span>Ends</span>
                    <Input
                      type="time"
                      defaultValue="8:00"
                      className="w-24"
                    />
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded bg-gray-200">AM</button>
                      <button className="px-2 py-1 rounded">PM</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button className="bg-green-500 text-white hover:bg-green-600 px-8">
                GUARDAR
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-400/80">
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/paw-logo.svg" alt="Logo" className="w-8 h-8" />
            <h1 className="text-white text-xl">Gestión de Adopciones y Liberaciones</h1>
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
          <h2 className="text-white text-xl">Gestión de Adopciones y Liberaciones</h2>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del animal</label>
                <Input
                  value={formData.nombreAnimal}
                  className="w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Liberación</label>
                <div className="flex gap-4">
                  <Input
                    value={formData.fechaLiberacion}
                    className="flex-1"
                    readOnly
                  />
                  <Input
                    value={formData.horaLiberacion}
                    className="w-24"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estado actual</label>
                <Input
                  value={formData.estado}
                  className="w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del adoptante</label>
                <Input
                  value={formData.nombreAdoptante}
                  className="w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contacto del adoptante</label>
                <Input
                  value={formData.contactoAdoptante}
                  className="w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dirección del adoptante</label>
                <Input
                  value={formData.direccionAdoptante}
                  className="w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar/Editar Gestion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};