import React from 'react';
import { ChecklistIcon, SettingsIcon } from '../components/icons';

interface PlaceholderPageProps {
  title: string;
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    'Productivity Hub': ChecklistIcon,
    'Settings': SettingsIcon,
};

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const Icon = iconMap[title] || ChecklistIcon;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
      <div className="w-full max-w-lg p-8 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl">
        <Icon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-2">{title}</h2>
        <p className="max-w-md mx-auto text-sm sm:text-base">
          This module is currently under construction. Full functionality for managing your {title.toLowerCase()} will be available here soon.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;