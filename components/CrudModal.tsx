import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea';
    options?: { value: string; label: string }[];
    required?: boolean;
}

interface CrudModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: T) => void;
  fields: FormField[];
  initialData?: T | null;
  title: string;
  onDataChange?: (data: T, fieldName: string) => T;
}

const CrudModal = <T extends Record<string, any>>({ isOpen, onClose, onSave, fields, initialData, title, onDataChange }: CrudModalProps<T>) => {
  const [formData, setFormData] = useState<T>({} as T);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaultState = fields.reduce((acc, field) => {
        acc[field.name as keyof T] = '' as any;
        return acc;
      }, {} as T);
      setFormData(defaultState);
    }
  }, [initialData, fields, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number' || fields.find(f => f.name === name)?.type === 'number';
    
    let newFormData = {
      ...formData,
      [name]: isNumber ? Number(value) : value,
    };

    if (onDataChange) {
        newFormData = onDataChange(newFormData, name);
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleChange,
      required: field.required,
      className: "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    };

    switch (field.type) {
        case 'select':
            return (
                <select {...commonProps}>
                    <option value="">Select {field.label}</option>
                    {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            );
        case 'textarea':
             return <textarea {...commonProps} rows={3} />;
        default:
            return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {fields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block mb-2 text-sm font-medium text-gray-300">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end p-4 border-t border-gray-700 space-x-2">
            <button type="button" onClick={onClose} className="text-gray-300 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-2.5">
              Cancel
            </button>
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;