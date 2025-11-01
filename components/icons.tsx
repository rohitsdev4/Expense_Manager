import React from 'react';

// Simple, reliable icons using basic SVG shapes
export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

export const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <rect x="16" y="10" width="4" height="4" rx="1" />
  </svg>
);

export const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="2" width="16" height="20" />
    <rect x="8" y="6" width="2" height="2" />
    <rect x="14" y="6" width="2" height="2" />
    <rect x="8" y="10" width="2" height="2" />
    <rect x="14" y="10" width="2" height="2" />
    <rect x="10" y="18" width="4" height="4" />
  </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="16" cy="6" r="3" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
);

export const HandshakeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="8" width="8" height="8" />
    <rect x="14" y="8" width="8" height="8" />
    <rect x="8" y="10" width="8" height="4" />
  </svg>
);

export const ChecklistIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="5" width="18" height="2" />
    <rect x="3" y="11" width="18" height="2" />
    <rect x="3" y="17" width="18" height="2" />
    <circle cx="7" cy="6" r="1" />
    <circle cx="7" cy="12" r="1" />
    <circle cx="7" cy="18" r="1" />
  </svg>
);

export const BrainCircuitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" />
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
  </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="3" />
    <rect x="11" y="1" width="2" height="6" />
    <rect x="11" y="17" width="2" height="6" />
    <rect x="1" y="11" width="6" height="2" />
    <rect x="17" y="11" width="6" height="2" />
  </svg>
);

export const MoreVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export const DollarSignIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="11" y="2" width="2" height="20" />
    <rect x="6" y="6" width="12" height="3" />
    <rect x="6" y="15" width="12" height="3" />
  </svg>
);

export const RefreshCwIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="5" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
  </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="11" y="2" width="2" height="20" />
    <rect x="2" y="11" width="20" height="2" />
  </svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="17" width="18" height="2" />
    <rect x="14" y="2" width="6" height="6" transform="rotate(45 17 5)" />
    <rect x="8" y="8" width="6" height="6" />
  </svg>
);

export const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="6" width="18" height="2" />
    <rect x="8" y="6" width="8" height="14" />
    <rect x="10" y="2" width="4" height="4" />
  </svg>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
  </svg>
);

export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="11" width="12" height="2" transform="rotate(45 12 12)" />
    <rect x="6" y="11" width="12" height="2" transform="rotate(-45 12 12)" />
  </svg>
);

export const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="11" y="6" width="2" height="12" />
    <rect x="7" y="8" width="10" height="2" transform="rotate(45 12 9)" />
  </svg>
);

export const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <rect x="11" y="6" width="2" height="12" />
    <rect x="7" y="14" width="10" height="2" transform="rotate(-45 12 15)" />
  </svg>
);

export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <rect x="11" y="7" width="2" height="6" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);