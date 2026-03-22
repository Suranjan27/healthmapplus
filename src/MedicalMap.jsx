import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- HELPER: This forces the map to move when coordinates change ---
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15); // Zoom level 15
      map.invalidateSize(); // Fixes gray box issue
    }
  }, [lat, lng, map]);
  return null;
}

function MedicalMap({ lat, lng, hospitals }) {
  // Custom Icon for User (Blue Pulse)
  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7085/7085424.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Custom Icon for Hospitals (Red Pin)
  const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
    iconSize: [35, 35],
  });

  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={15} 
      style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Logic to move the camera to your real location */}
      <RecenterMap lat={lat} lng={lng} />

      {/* User Location Marker */}
      <Marker position={[lat, lng]} icon={userIcon}>
        <Popup className="font-black uppercase text-[10px]">Your Current Location</Popup>
      </Marker>

      {/* Hospital Markers */}
      {hospitals.map((h) => (
        <Marker key={h.id} position={[h.lat, h.lon]} icon={hospitalIcon}>
          <Popup>
            <div className="p-2">
              <h4 className="font-black uppercase text-blue-600 text-xs">{h.name}</h4>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Medical Center • Open</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MedicalMap;