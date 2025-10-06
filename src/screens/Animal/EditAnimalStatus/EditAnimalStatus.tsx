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
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-200">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87M12 7a4 4 0 110-8 4 4 0 010 8z" />
              </svg>
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Cambiar Estado de Salud</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="bg-white/80 px-2 py-1 rounded-full text-xs border border-green-200">
                  {animal.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/60 transition-all duration-200 ml-4"
          >
            <svg className="w-6 h-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        {/* Current Status */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Estado de Salud Actual
            </label>
            <div className={`px-4 py-2 rounded-lg border-2 font-medium ${getStatusColor(currentStatus.type)}`}>
              <span className="text-current">{currentStatus.label}</span>
            </div>
          </div>
        </div>

        {/* New Status Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Nuevo Estado de Salud
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedStatus === option.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
                onClick={() => setSelectedStatus(option.value)}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedStatus === option.value
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}>
                  {selectedStatus === option.value && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${
                      option.value === 'Muy Bueno' ? 'bg-green-500' :
                      option.value === 'Bueno' ? 'bg-blue-500' :
                      option.value === 'Estable' ? 'bg-yellow-500' :
                      option.value === 'Malo' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="font-semibold text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">{option.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Warning Message */}
        {selectedStatus !== currentStatus.type && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            Confirmar cambio de estado de "<strong>{currentStatus.label}</strong>" a 
            "<strong>{statusOptions.find(opt => opt.value === selectedStatus)?.label}</strong>"
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-8 py-5 bg-gray-50 flex-shrink-0">
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-xl py-3 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleStatusChange}
            disabled={loading || selectedStatus === currentStatus.type}
            className={`flex-1 rounded-xl py-3 font-semibold ${
              selectedStatus === currentStatus.type || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {loading ? 'Actualizando...' : 'Cambiar Estado'}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
