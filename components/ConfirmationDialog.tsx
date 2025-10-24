import React from 'react';
import { DeleteIcon, CloseIcon, InfoIcon } from './icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  icon?: React.ReactElement;
  confirmText?: string;
  confirmButtonClass?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    icon,
    confirmText = "Confirm Delete",
    confirmButtonClass = "text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-800"
}) => {
  if (!isOpen) return null;

  const defaultIcon = (
    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <DeleteIcon className="w-6 h-6 text-red-400" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
            {icon || defaultIcon}
            <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
            <p className="mb-6 text-gray-400 whitespace-pre-wrap">{message}</p>
            <div className="flex justify-center gap-4">
                <button 
                    onClick={onClose} 
                    className="text-gray-300 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className={`font-medium rounded-lg text-sm px-5 py-2.5 ${confirmButtonClass}`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;