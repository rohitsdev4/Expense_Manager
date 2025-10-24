import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  trend: 'up' | 'down' | 'stale';
  trendValue: string;
  period: string;
  color: 'green' | 'yellow' | 'blue' | 'red';
}

const colorClasses = {
  green: {
    bg: 'bg-green-500/10',
    iconBg: 'bg-green-500/20',
    iconText: 'text-green-500 dark:text-green-400',
    trendText: 'text-green-500 dark:text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    iconBg: 'bg-yellow-500/20',
    iconText: 'text-yellow-500 dark:text-yellow-400',
    trendText: 'text-yellow-500 dark:text-yellow-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-500 dark:text-blue-400',
    trendText: 'text-blue-500 dark:text-blue-400',
  },
   red: {
    bg: 'bg-red-500/10',
    iconBg: 'bg-red-500/20',
    iconText: 'text-red-500 dark:text-red-400',
    trendText: 'text-red-500 dark:text-red-400',
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue, period, color }) => {
  const classes = colorClasses[color];

  return (
    <div className={`p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 flex flex-col justify-between bg-white dark:bg-gray-800/20 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        <div className={`p-2.5 rounded-lg ${classes.iconBg}`}>
          <Icon className={`w-6 h-6 ${classes.iconText}`} />
        </div>
      </div>
      <div>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-3">{value}</p>
        <div className="flex items-center text-sm space-x-2">
            <div className={`flex items-center ${trend === 'up' ? 'text-green-500 dark:text-green-400' : trend === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {trend === 'up' && <ArrowUpIcon className="w-4 h-4" />}
                {trend === 'down' && <ArrowDownIcon className="w-4 h-4" />}
                <span>{trendValue}</span>
            </div>
          <span className="text-gray-500 dark:text-gray-400">{period}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;