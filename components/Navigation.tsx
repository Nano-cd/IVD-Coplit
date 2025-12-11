import React from 'react';
import { LayoutDashboard, MessageSquareText, FileText, Settings, Microscope } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-ivd-50 text-ivd-700 font-medium shadow-sm' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <div className={`${active ? 'text-ivd-600' : 'text-gray-400'}`}>{icon}</div>
    <span>{label}</span>
  </button>
);

interface Props {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navigation: React.FC<Props> = ({ currentTab, setTab }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="bg-ivd-600 p-2 rounded-lg text-white">
           <Microscope size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">IVD-Copilot</h1>
          <p className="text-[10px] text-gray-500 font-mono">v2.5.0-PRO</p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={currentTab === 'dashboard'} 
          onClick={() => setTab('dashboard')} 
        />
        <NavItem 
          icon={<MessageSquareText size={20} />} 
          label="AI Assistant" 
          active={currentTab === 'chat'} 
          onClick={() => setTab('chat')} 
        />
        <NavItem 
          icon={<FileText size={20} />} 
          label="Reports" 
          active={currentTab === 'reports'} 
          onClick={() => setTab('reports')} 
        />
        <NavItem 
          icon={<Settings size={20} />} 
          label="Configuration" 
          active={currentTab === 'config'} 
          onClick={() => setTab('config')} 
        />
      </nav>

      <div className="mt-auto">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-1">Service Contract</p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Active until Dec 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;