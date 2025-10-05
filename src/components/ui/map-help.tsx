import React from "react";

interface MapHelpModalProps {
  open: boolean;
  onClose: () => void;
}

export const MapHelpModal: React.FC<MapHelpModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0-9a3.75 3.75 0 0 0-3.75 3.75.75.75 0 0 0 1.5 0 2.25 2.25 0 1 1 3.014 2.124c-.81.27-1.514.843-1.919 1.582-.213.389-.345.84-.345 1.294v.25a.75.75 0 0 0 1.5 0v-.25c0-.248.062-.494.18-.711.22-.402.61-.73 1.087-.89A3.75 3.75 0 0 0 12 6.75Z" clipRule="evenodd" />
              </svg>
            </span>
            <h4 className="text-lg font-semibold text-gray-800">¿Cómo usar el mapa?</h4>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-bold">+</div>
            <p><strong>Acercar:</strong> pulsa el botón <strong>+</strong> en el mapa para acercarte.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-bold">-</div>
            <p><strong>Alejar:</strong> pulsa el botón <strong>-</strong> para alejarte.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-8 4h5m-7 5h14a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16a2 2 0 002 2z" />
              </svg>
            </div>
            <p><strong>Desplazarse:</strong> mantén presionado y arrastra el mapa para moverte por la zona.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-green-100 text-green-700 flex items-center justify-center">●</div>
            <p><strong>Seleccionar punto:</strong> haz <strong>clic</strong> en el mapa para colocar el marcador. La dirección se rellenará automáticamente y puedes editarla.</p>
          </div>
        </div>
        <div className="px-5 pb-4 flex justify-end">
          <button onClick={onClose} className="bg-green-500 text-white hover:bg-green-600 rounded px-4 py-2">Entendido</button>
        </div>
      </div>
    </div>
  );
};

export default MapHelpModal;


