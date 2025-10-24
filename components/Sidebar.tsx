import React from 'react';
import type { Page } from '../types';
import {
  GeminiIcon,
  DashboardIcon,
  WalletIcon,
  BuildingIcon,
  UsersIcon,
  HandshakeIcon,
  ChecklistIcon,
  BrainCircuitIcon,
  SettingsIcon,
  UserIcon,
} from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems: { page: Page; icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string }[] = [
  { page: 'Dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { page: 'Payments & Expenses', icon: WalletIcon, label: 'Payments & Expenses' },
  { page: 'Sites', icon: BuildingIcon, label: 'Sites' },
  { page: 'Labour', icon: UsersIcon, label: 'Labour' },
  { page: 'Clients', icon: HandshakeIcon, label: 'Clients' },
  { page: 'Tasks & Habits', icon: ChecklistIcon, label: 'Tasks & Habits' },
  { page: 'Settings', icon: SettingsIcon, label: 'Settings' },
  { page: 'Chat with AI', icon: BrainCircuitIcon, label: 'Chat with AI' },
];

const NavLink: React.FC<{
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6 mr-4 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <aside className="w-72 bg-white dark:bg-gray-800 flex-col p-4 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 hidden md:flex">
      <div className="flex items-center justify-between p-3 mb-6">
        <div className="flex items-center space-x-3">
          <GeminiIcon className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">PBMS-AI</h1>
        </div>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.page}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.page}
              onClick={() => setActivePage(item.page)}
            />
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
        <div className="flex items-center p-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-4">
                <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
            </div>
            <div>
                <p className="font-semibold text-gray-800 dark:text-white">Business Owner</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Premium Plan</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
