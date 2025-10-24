import React, { useState } from 'react';

export interface Filters {
  startDate: string;
  endDate: string;
  category: string;
}

interface FilterBarProps {
  onFilter: (filters: Filters) => void;
  onReset: () => void;
  categoryOptions?: { value: string; label: string }[];
  categoryLabel?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter, onReset, categoryOptions = [], categoryLabel = "Category" }) => {
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    category: 'all',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => onFilter(filters);
  const handleReset = () => {
    setFilters({ startDate: '', endDate: '', category: 'all' });
    onReset();
  };
  
  const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
      <input 
        {...props}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      />
  );
  
  const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
      <select 
        {...props}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      />
  );

  return (
    <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-gray-300">Start Date</label>
          <Input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="endDate" className="block mb-2 text-sm font-medium text-gray-300">End Date</label>
          <Input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
        </div>
        {categoryOptions.length > 0 && (
          <div className="lg:col-span-1">
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-300">{categoryLabel}</label>
            <Select name="category" value={filters.category} onChange={handleChange}>
              <option value="all">All</option>
              {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </div>
        )}
        <div className="flex items-center space-x-2 col-span-1 md:col-span-3 lg:col-span-2 justify-self-end w-full lg:w-auto">
          <button onClick={handleApply} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Apply Filters</button>
          <button onClick={handleReset} className="w-full text-gray-300 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Reset</button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
