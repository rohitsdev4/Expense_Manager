import React from 'react';
import { EditIcon, DeleteIcon } from './icons';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

const DataTable = <T extends { id: any }>({ columns, data, onEdit, onDelete }: DataTableProps<T>) => {
  if (data.length === 0) {
    return <p className="text-center text-gray-500 py-8">No data available.</p>;
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              {columns.map((col) => (
                <th key={String(col.accessor)} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.accessor)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {col.render ? col.render(item[col.accessor], item) : String(item[col.accessor])}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-4">
                    <button onClick={() => onEdit(item)} className="text-blue-400 hover:text-blue-300">
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(item)} className="text-red-400 hover:text-red-300">
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {data.map((item) => (
          <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
            {columns.map((col, index) => (
               <div key={String(col.accessor)} className={`flex justify-between items-start py-2 gap-4 ${index !== columns.length -1 ? 'border-b border-gray-600/50' : ''}`}>
                 <span className="font-semibold text-gray-300 text-sm flex-shrink-0 pr-4">{col.header}</span>
                 <span className="text-gray-200 text-sm text-right break-words">
                    {col.render ? col.render(item[col.accessor], item) : String(item[col.accessor])}
                 </span>
               </div>
            ))}
             <div className="flex justify-end space-x-4 pt-4 mt-2 border-t border-gray-600/50">
                <button onClick={() => onEdit(item)} className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-md text-sm">
                  <EditIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button onClick={() => onDelete(item)} className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-md text-sm">
                  <DeleteIcon className="w-4 h-4" />
                   <span>Delete</span>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;