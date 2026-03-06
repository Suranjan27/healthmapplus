import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    getProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  if (!profile) return <div className="flex justify-center items-center h-screen font-bold text-h-blue animate-pulse">Accessing Health Records...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans">
      {/* Container - Max width 4xl for desktop, full width for mobile */}
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation / Header */}
        <header className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-xl md:text-2xl font-black text-h-blue tracking-tighter">HEALTHMAP<span className="text-h-orange">+</span></h1>
          <button onClick={handleSignOut} className="bg-white border border-gray-200 px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
            LOGOUT
          </button>
        </header>

        {/* --- MAIN GRID LAYOUT --- */}
        {/* On mobile: 1 column | On Desktop: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Emergency SOS Card */}
          <section className="bg-red-600 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl md:text-8xl font-black">SOS</div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white text-red-600 w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shadow-lg">!</div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest leading-tight">Emergency<br/>Medical ID</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Blood Group</p>
                <p className="text-3xl md:text-4xl font-black">{profile.blood_group || 'N/A'}</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Allergies</p>
                <p className="text-lg md:text-xl font-bold truncate">{profile.allergies || 'NONE'}</p>
              </div>
            </div>

            {profile.emergency_contact && (
              <a 
                href={`tel:${profile.emergency_contact}`} 
                className="flex items-center justify-center gap-3 bg-white text-red-600 w-full py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-gray-100 active:scale-95 transition-all"
              >
                📞 CALL CONTACT
              </a>
            )}
          </section>

          {/* Right Column: Profile Details */}
          <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 h-full">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mb-6">Patient Information</h3>
            
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</p>
                <p className="text-xl md:text-2xl font-bold text-h-dark">{profile.full_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Age</p>
                  <p className="text-lg font-bold">{profile.age} Years</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Contact</p>
                  <p className="text-lg font-bold truncate">+91 {profile.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Registered Address</p>
                <p className="text-sm md:text-base font-medium text-gray-600 leading-relaxed">{profile.location}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Home;