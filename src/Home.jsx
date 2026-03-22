import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map as MapIcon, User, Home as HomeIcon,
  Calendar, Package, FileText, Hospital, UserRound, 
  MessageSquare, Store, LogOut, ChevronRight, Activity, AlertCircle, Phone, Navigation, Microscope 
} from 'lucide-react';
import MedicalMap from './MedicalMap';

function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState(null);
  const [location, setLocation] = useState({ lat: 23.6889, lng: 86.9661 });
  const [hospitals, setHospitals] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastManualRefresh, setLastManualRefresh] = useState(Date.now());
  const navigate = useNavigate();

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1); 
  };

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/signin');
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    getProfile();
  }, [navigate]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const findMedicalFacilities = useCallback(async (lat, lng, type = "hospital") => {
    if (!lat || !lng) return;
    setIsScanning(true);
    const typeMap = {
      hospital: 'hospital',
      pharmacy: 'pharmacy',
      doctor: 'clinic"];node["amenity"="doctors', 
      diagnostics: 'laboratory'
    };
    const amenityQuery = typeMap[type] || type; 
    const query = `[out:json];(node["amenity"="${amenityQuery}"](around:15000,${lat},${lng});way["amenity"="${amenityQuery}"](around:15000,${lat},${lng});relation["amenity"="${amenityQuery}"](around:15000,${lat},${lng}););out center;`;
    
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("API Limit Reached");
      const data = await response.json();
      const cleaned = data.elements.map(h => ({
        id: h.id,
        lat: h.lat || h.center.lat,
        lon: h.lon || h.center.lon,
        name: h.tags.name || (type === "doctor" ? "Specialist / Chamber" : (type === "diagnostics" ? "Diagnostic Lab" : "Medical Center")),
        info: h.tags.speciality || h.tags.opening_hours || "Verified Healthcare",
        phone: h.tags.phone || h.tags["contact:phone"] || "+91 00000 00000",
        rating: (Math.random() * (5 - 4.1) + 4.1).toFixed(1), 
        distance: parseFloat(calculateDistance(lat, lng, h.lat || h.center.lat, h.lon || h.center.lon))
      }));
      setHospitals(cleaned.sort((a, b) => a.distance - b.distance));
    } catch (e) { 
      console.error(e); 
      setHospitals([]); 
    } finally { setIsScanning(false); }
  }, []);

  useEffect(() => {
    const types = { hospitals: 'hospital', pharmacy: 'pharmacy', doctors: 'doctor', diagnostics: 'diagnostics' };
    if (types[activeTab]) findMedicalFacilities(location.lat, location.lng, types[activeTab]);
  }, [activeTab, lastManualRefresh, findMedicalFacilities, location.lat, location.lng]);

  if (!profile) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse italic uppercase tracking-widest">HealthMap+ Loading...</div>;

  const renderContent = () => {
    const refresh = () => setLastManualRefresh(Date.now());
    switch (activeTab) {
      case 'home': return profile.role === 'doctor' ? <DoctorDashboard profile={profile} /> : <DashboardContent profile={profile} location={location} />;
      case 'maps': return (
          <div className="bg-white p-4 rounded-[3.5rem] shadow-sm border h-[600px] w-full relative overflow-hidden">
             <MedicalMap lat={location.lat} lng={location.lng} hospitals={hospitals} />
          </div>
        );
      case 'hospitals': return <HospitalListView hospitals={hospitals} isScanning={isScanning} onRefresh={refresh} />;
      case 'pharmacy': return <PharmacyListView pharmacies={hospitals} isScanning={isScanning} onRefresh={refresh} />;
      case 'doctors': return <DoctorListView doctors={hospitals} isScanning={isScanning} onRefresh={refresh} />;
      case 'diagnostics': return <DiagnosticListView labs={hospitals} isScanning={isScanning} onRefresh={refresh} />;
      case 'profile': return <PatientProfileView profile={profile} setProfile={setProfile} />;
      default: return <DashboardContent profile={profile} location={location} />;
    }
  };

  const menuItems = profile.role === 'doctor' ? [
    { id: 'home', label: 'Console', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
  ] : [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'maps', label: 'Maps', icon: MapIcon },
    { id: 'doctors', label: 'Doctors', icon: UserRound },
    { id: 'diagnostics', label: 'Labs', icon: Microscope },
    { id: 'hospitals', label: 'Hospitals', icon: Hospital },
    { id: 'pharmacy', label: 'Pharmacy', icon: Store },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-blue-100">
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r p-8 h-screen sticky top-0 shadow-sm">
        <h1 className="text-2xl font-black text-blue-700 italic mb-12 uppercase tracking-tighter">HealthMap<span className="text-orange-500">+</span></h1>
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={18} strokeWidth={2.5} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/signin'))} className="text-slate-300 font-black text-[11px] uppercase p-4 hover:text-red-500 flex items-center gap-2"><LogOut size={18}/> Logout</button>
      </aside>

      <div className="lg:hidden flex justify-between items-center p-6 bg-white border-b sticky top-0 z-40">
        <h1 className="text-xl font-black text-blue-700 italic uppercase">HealthMap+</h1>
        <div className="bg-blue-50 p-2 rounded-full text-blue-600" onClick={() => setActiveTab('profile')}><User size={20} /></div>
      </div>

      <main className="flex-1 p-4 lg:p-12 pb-32">
        <section className="max-w-5xl mx-auto">{renderContent()}</section>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t flex justify-around items-center py-4 z-50 rounded-t-[2.5rem] shadow-2xl">
        {menuItems.slice(0, 5).map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-blue-600 scale-110' : 'text-slate-300'} transition-all`}>
            <item.icon size={22} />
            <span className="text-[7px] font-black uppercase">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function DashboardContent({ profile, location }) {
  const sendSOS = (type) => {
    if (!profile.emergency_contact) return alert("Add emergency contact first!");
    const phone = profile.emergency_contact.replace(/\D/g, '');
    const mapLink = `http://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    const message = `🚨 EMERGENCY SOS 🚨\nI need help! My location: ${mapLink}`;
    if (type === 'whatsapp') window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
    else window.open(`sms:+91${phone}?body=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Control Panel</h2><p className="text-slate-400 font-bold text-[10px] uppercase mt-1">Ready: {profile.full_name}</p></div>
        <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> GPS Active</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-red-600 rounded-[3.5rem] p-8 text-white shadow-2xl h-80 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 opacity-10 text-9xl font-black italic">SOS</div>
           <div className="grid grid-cols-2 gap-3 relative z-10 mt-auto">
              <button onClick={() => sendSOS('whatsapp')} className="bg-green-500 py-4 rounded-2xl font-black uppercase text-[9px]">WhatsApp</button>
              <button onClick={() => sendSOS('sms')} className="bg-white text-red-600 py-4 rounded-2xl font-black uppercase text-[9px]">SMS Alert</button>
           </div>
        </div>
        <div className="bg-slate-900 rounded-[3.5rem] p-8 text-white shadow-xl h-80 flex flex-col justify-between border-4 border-slate-800">
           <h3 className="text-2xl font-black uppercase italic text-orange-500">Emergency</h3>
           <div className="space-y-3">
              <button onClick={() => window.open('tel:108', '_self')} className="w-full bg-orange-600 py-5 rounded-3xl font-black uppercase text-[12px]">Call 108</button>
              <button onClick={() => window.open('tel:102', '_self')} className="w-full border-2 border-slate-700 py-5 rounded-3xl font-black uppercase text-[12px]">Call 102</button>
           </div>
        </div>
        <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between h-80">
           <div>
             <p className="text-slate-400 font-black text-[10px] uppercase mb-6 tracking-widest text-slate-500">Medical ID</p>
             <div className="flex justify-between border-b pb-4"><span className="font-bold text-[10px]">Blood</span><span className="text-3xl font-black text-red-600 uppercase">{profile.blood_group || 'N/A'}</span></div>
             <div className="flex justify-between py-4"><span className="font-bold text-[10px]">Allergy</span><span className="text-xs font-black text-orange-600 uppercase text-right truncate">{profile.allergies || 'None'}</span></div>
           </div>
           <button className="text-blue-600 font-black text-[10px] uppercase flex items-center gap-1 hover:underline">Update <ChevronRight size={14}/></button>
        </div>
      </div>
    </div>
  );
}

function FacilityItem({ item, colorClass }) {
  const nav = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`, '_blank');
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border flex flex-col md:flex-row justify-between items-center shadow-sm gap-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`${colorClass} p-4 rounded-2xl font-black text-xs text-center min-w-[75px]`}>{item.distance} <br/> KM</div>
        <div>
          <h4 className="font-black text-sm uppercase text-slate-800">{item.name}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase italic truncate max-w-[200px]">{item.info}</p>
          <p className="text-orange-500 font-black text-[10px]">★ {item.rating} • {item.phone}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => window.open(`tel:${item.phone}`, '_self')} className="bg-slate-50 p-4 rounded-xl text-slate-400"><Phone size={18}/></button>
        <button onClick={nav} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg">Navigate</button>
      </div>
    </div>
  );
}

function HospitalListView({ hospitals, isScanning, onRefresh }) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between px-2 items-center"><h2 className="text-2xl font-black text-slate-800 uppercase italic">Hospitals</h2><button onClick={onRefresh} className="text-[9px] font-black uppercase text-blue-600 underline">Refresh</button></div>
      {isScanning ? <div className="p-20 text-center animate-pulse text-slate-300 font-black">SCANNING...</div> : hospitals.map(h => <FacilityItem key={h.id} item={h} colorClass="bg-blue-50 text-blue-600" />)}
    </div>
  );
}

function PharmacyListView({ pharmacies, isScanning, onRefresh }) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between px-2 items-center"><h2 className="text-2xl font-black text-slate-800 uppercase italic">Pharmacy</h2><button onClick={onRefresh} className="text-[9px] font-black uppercase text-blue-600 underline">Refresh</button></div>
      {isScanning ? <div className="p-20 text-center animate-pulse text-slate-300 font-black">SCANNING...</div> : pharmacies.map(p => <FacilityItem key={p.id} item={p} colorClass="bg-green-50 text-green-600" />)}
    </div>
  );
}

function DoctorListView({ doctors, isScanning, onRefresh }) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between px-2 items-center"><h2 className="text-2xl font-black text-slate-800 uppercase italic">Doctors</h2><button onClick={onRefresh} className="text-[9px] font-black uppercase text-blue-600 underline">Refresh</button></div>
      {isScanning ? <div className="p-20 text-center animate-pulse text-slate-300 font-black">SCANNING...</div> : doctors.map(d => <FacilityItem key={d.id} item={d} colorClass="bg-blue-600 text-white" />)}
    </div>
  );
}

function DiagnosticListView({ labs, isScanning, onRefresh }) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between px-2 items-center"><h2 className="text-2xl font-black text-slate-800 uppercase italic">Labs</h2><button onClick={onRefresh} className="text-[9px] font-black uppercase text-blue-600 underline">Refresh</button></div>
      {isScanning ? <div className="p-20 text-center animate-pulse text-slate-300 font-black">SCANNING...</div> : labs.map(l => <FacilityItem key={l.id} item={l} colorClass="bg-orange-50 text-orange-600" />)}
    </div>
  );
}

function PatientProfileView({ profile, setProfile }) {
  const [formData, setFormData] = useState({...profile});
  const handleSave = async () => {
    const { data } = await supabase.from('profiles').update(formData).eq('id', profile.id).select().single();
    if (data) setProfile(data);
  };
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border">
      <h2 className="text-2xl font-black uppercase italic mb-8">Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['full_name', 'blood_group', 'emergency_contact', 'allergies'].map(key => (
          <div key={key} className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">{key.replace('_', ' ')}</label>
            <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData[key] || ''} onChange={(e) => setFormData({...formData, [key]: e.target.value})} />
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="mt-8 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl">Apply Changes</button>
    </div>
  );
}

function DoctorDashboard({ profile }) {
  return (
    <div className="space-y-8 animate-in zoom-in-95">
      <div className="bg-white p-10 rounded-[4rem] border shadow-sm flex items-center gap-6">
        <div className="bg-blue-600 p-6 rounded-full text-white animate-pulse"><Activity size={32} /></div>
        <div><h2 className="text-3xl font-black uppercase italic tracking-tighter">Console Active</h2><p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{profile.full_name} • General Surgeon</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl h-48 flex flex-col justify-between"><p className="text-[10px] font-black uppercase opacity-60">Daily Patients</p><h4 className="text-5xl font-black italic">08</h4></div>
        <div className="bg-white p-8 rounded-[3rem] border shadow-sm h-48 flex flex-col justify-between"><p className="text-[10px] font-black uppercase text-slate-400">Incoming GPS</p><h4 className="text-5xl font-black text-blue-600 italic">03</h4></div>
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white h-48 flex flex-col justify-between"><p className="text-[10px] font-black uppercase opacity-60">Wait Time</p><h4 className="text-5xl font-black text-orange-500 italic">12m</h4></div>
      </div>
    </div>
  );
}

export default Home;