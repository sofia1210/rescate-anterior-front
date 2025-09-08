import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";

interface AnimalDetailsProps {
  animal: {
    id: number;
    name: string;
    species: string;
    breed: string;
    sex: string;
    age: string;
    healthStatus: string;
    admissionDate: string;
    feedingType: string;
    recommendedAmount: string;
    recommendedFrequency: string;
    releaseDate: string;
    releaseLocation: string;
    image: string;
    tipo: string;
    rescuer?: {
      id: number;
      name: string;
      phone: string;
      rescueDate: string;
      rescueLocation: string;
    };
  };
  onClose: () => void;
  onEdit: () => void;
}

export const AnimalDetails = ({ animal, onClose, onEdit }: AnimalDetailsProps): JSX.Element => {
  const navigate = useNavigate();
  const hasTreatment = false; // cambiar a true si el animal ya tiene tratamiento registrado

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white z-10 pb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold">Datos Animal {animal.name}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="text-right font-semibold">Nombre:</div>
              <div>{animal.name}</div>

              <div className="text-right font-semibold">Tipo:</div>
              <div>{animal.tipo === 'domestico' ? 'Doméstico' : 'Silvestre'}</div>

              <div className="text-right font-semibold">Especie:</div>
              <div>{animal.species}</div>

              <div className="text-right font-semibold">Raza:</div>
              <div>{animal.breed}</div>

              <div className="text-right font-semibold">Sexo:</div>
              <div>{animal.sex}</div>

              <div className="text-right font-semibold">Edad:</div>
              <div>{animal.age}</div>

              <div className="text-right font-semibold">Estado de Salud:</div>
              <div>{animal.healthStatus}</div>

              <div className="text-right font-semibold">Fecha de Ingreso:</div>
              <div>{animal.admissionDate}</div>

              <div className="text-right font-semibold">Tipo de alimentación:</div>
              <div>{animal.feedingType}</div>

              <div className="text-right font-semibold">Cantidad recomendada:</div>
              <div>{animal.recommendedAmount}</div>

              <div className="text-right font-semibold">Frecuencia recomendada:</div>
              <div>{animal.recommendedFrequency}</div>

              <div className="text-right font-semibold">
                {animal.tipo === 'domestico' ? 'Fecha de Adopción:' : 'Fecha de Liberación:'}
              </div>
              <div>{animal.releaseDate}</div>

              {animal.tipo === 'silvestre' && (
                <>
                  <div className="text-right font-semibold">Ubicación de Liberación:</div>
                  <div>{animal.releaseLocation}</div>
                </>
              )}

              {animal.rescuer && (
                <>
                  <div className="text-right font-semibold">Rescatista:</div>
                  <div>{animal.rescuer.name}</div>

                  <div className="text-right font-semibold">Teléfono del Rescatista:</div>
                  <div>{animal.rescuer.phone}</div>

                  <div className="text-right font-semibold">Fecha de Rescate:</div>
                  <div>{animal.rescuer.rescueDate}</div>

                  <div className="text-right font-semibold">Ubicación de Rescate:</div>
                  <div>{animal.rescuer.rescueLocation}</div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            {animal.image ? (
              <img src={animal.image} alt={animal.name} className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Botones para otras acciones */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
            onClick={() => navigate(`/medical-evaluation/${animal.id}`)}
          >
            Ev.Medicas
          </Button>

          <Button 
            className="bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
            onClick={() => navigate(`/geolocation/${animal.id}`)}
          >
            Geolocalización
          </Button>

          <Button 
            className="bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
            onClick={() => navigate(`/transfer-history/${animal.id}`)}
          >
            Historial de Traslados
          </Button>
        </div>

        {/* Botones para tratamiento médico con lógica condicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {hasTreatment && (
            <button 
              onClick={() => navigate(`/medical-treatment/${animal.id}`)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded w-full"
            >
              Ver Tratamiento Médico
            </button>
          )}
        <Button
          className="bg-green-500 text-white hover:bg-green-600 mt-4"
          onClick={() => navigate(`/RescuerDetails/${animal.rescuer?.id}`)} // o lo que uses
        >
          Ver Rescatista
        </Button>

          {!hasTreatment && (
            <button 
            onClick={() => navigate(`/medical-treatment/${animal.id}`)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded w-full"
            >
              Tratamiento Médico
            </button>
          )}
        </div>

        {/* Botón editar */}
        <div className="mt-8 flex justify-end sticky bottom-0 bg-white pt-4">
          <Button onClick={onEdit} className="bg-green-500 text-white hover:bg-green-600">
            Editar Datos
          </Button>
        </div>
      </div>
    </div>
  );
};
