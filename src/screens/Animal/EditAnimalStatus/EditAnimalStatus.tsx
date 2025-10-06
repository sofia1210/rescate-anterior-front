import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { updateAnimalStatus } from "../../../services/dataService";

interface EditAnimalStatusProps {
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
  };
  currentStatus: { type: string; label: string };
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAnimalStatus = ({ 
  animal, 
  currentStatus, 
  onClose, 
  onSuccess 
}: EditAnimalStatusProps): JSX.Element => {
  const { getThemeClasses } = useThemeClasses();
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus.type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    { value: 'Estable', label: 'Estable', description: 'El animal está en condición estable, sin complicaciones' },
    { value: 'Muy Bueno', label: 'Muy Bueno', description: 'El animal está en excelente condición de salud' },
    { value: 'Bueno', label: 'Bueno', description: 'El animal está en buena condición de salud' },
    { value: 'Malo', label: 'Malo', description: 'El animal requiere atención médica' },
    { value: 'Muy Malo', label: 'Muy Malo', description: 'El animal está en condición crítica' }
  ];

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus.type) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateAnimalStatus(animal.id.toString(), selectedStatus);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el estado del animal');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Muy Bueno':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Bueno':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Estable':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Malo':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Muy Malo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Cambiar Estado de Salud</h2>
            <p className="text-sm text-gray-600 mt-1">{animal.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de Salud Actual
            </label>
            <div className={`px-3 py-2 rounded-lg border ${getStatusColor(currentStatus.type)}`}>
              {currentStatus.label}
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nuevo Estado de Salud
            </label>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedStatus === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedStatus === option.value
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedStatus === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Warning for status changes */}
          {selectedStatus !== currentStatus.type && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <div className="text-yellow-800 font-medium text-sm">Confirmar cambio de estado de salud</div>
                  <div className="text-yellow-700 text-sm mt-1">
                    Esta acción cambiará el estado de salud del animal de "{currentStatus.label}" a "{statusOptions.find(opt => opt.value === selectedStatus)?.label}". 
                    Esta acción no se puede deshacer.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          
          <Button
            onClick={handleStatusChange}
            className={`flex-1 ${
              selectedStatus === currentStatus.type
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={loading || selectedStatus === currentStatus.type}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </div>
            ) : (
              'Cambiar Estado de Salud'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
