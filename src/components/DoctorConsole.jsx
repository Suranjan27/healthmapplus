import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

function DoctorConsole({ profile }) {
  const [isAvailable, setIsAvailable] = useState(true);
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing doctor stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('doctor_stats')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (data) {
        setIsAvailable(data.is_available);
        setSpecialization(data.specialization || "");
      }
    };
    fetchStats();
  }, [profile.id]);

  const updateStatus = async (status) => {
    setLoading(true);
    const { error } = await supabase
      .from('doctor_stats')
      .upsert({ 
        id: profile.id, 
        is_available: status,
        specialization: specialization 
      });
    
    if (!error) setIsAvailable(status);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Doctor Workstation</h2>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Manage your live network presence</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className={`p-8 rounded-[2.5rem] shadow-xl transition-all border-4 ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-start mb-6">
            <Activity className={isAvailable ? 'text-green-600' : 'text-red-600'} size={32} />
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isAvailable ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {isAvailable ? 'Live' : 'Offline'}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase mb-4">Availability</h3>
          <button 
            disabled={loading}
            onClick={() => updateStatus(!isAvailable)}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isAvailable ? 'bg-red-600 text-white shadow-red-200' : 'bg-green-600 text-white shadow-green-200'} shadow-lg active:scale-95`}
          >
            {isAvailable ? 'Go Offline' : 'Go Online Now'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between text-slate-400">
            <Users size={24} />
            <span className="font-black text-2xl text-blue-600">0</span>
          </div>
          <p className="font-black text-slate-800 uppercase text-xs">Today's Appointments</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between text-slate-400">
            <Clock size={24} />
            <span className="font-black text-2xl text-orange-500">--</span>
          </div>
          <p className="font-black text-slate-800 uppercase text-xs">Next Patient In</p>
        </div>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
          <CheckCircle className="text-blue-600" size={20}/> Professional Info
        </h3>
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Specialization</label>
          <input 
            type="text" 
            placeholder="e.g. Cardiologist"
            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
          <button 
            onClick={() => updateStatus(isAvailable)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
          >
            Update Specialization
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorConsole;