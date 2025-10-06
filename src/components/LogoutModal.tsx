import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal = ({ isOpen, onClose, onConfirm }: LogoutModalProps) => {
  if (!isOpen) return null;

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-green-200 transform scale-100 transition-all duration-200 z-[10000] animate-in zoom-in-95 duration-200">
        {/* Icono de logout */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
          Cerrar Sesión
        </h3>

        {/* Mensaje */}
        <p className="text-gray-600 text-center mb-8 text-lg">
          ¿Está seguro de que quiere cerrar sesión?
        </p>

        {/* Botones */}
        <div className="flex gap-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg py-3 text-lg font-medium"
          >
            No
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg py-3 text-lg font-medium"
          >
            Sí
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
