import React from 'react';
import { 
  Home as HomeIcon, Map, Hospital, 
  Store, Stethoscope, LogOut, Activity, Package, UserRound 
} from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, onLogout, role }) {
  
  // Define unique menus for each role - NO DUPLICATES
  const menuConfig = {
    patient: [
      { id: 'home', label: 'Home', icon: HomeIcon }, 
      { id: 'maps', label: 'Live Map', icon: Map },
      { id: 'hospitals', label: 'Find Hospitals', icon: Hospital },
      { id: 'doctors', label: 'Find Doctors', icon: Stethoscope },
      { id: 'pharmacy', label: 'Medical Store', icon: Store },
    ],
    doctor: [
      { id: 'home', label: 'Doctor Console', icon: Activity },
      { id: 'appointments', label: 'My Appointments', icon: UserRound },
    ],
    pharmacist: [
      { id: 'home', label: 'Inventory Hub', icon: Package },
      { id: 'stock', label: 'Manage Meds', icon: Store },
    ]
  };

  const currentMenu = menuConfig[role] || menuConfig.patient;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 z-50">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black text-blue-700 italic tracking-tighter uppercase">
          HEALTHMAP<span className="text-orange-500">+</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {currentMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 uppercase text-[10px] tracking-widest'
            }`}
          >
            <item.icon size={18} strokeWidth={2.5} />
            {item.label}
          </button>
        ))}
      </nav>

      <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;