import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create the Auth User
    const { data, error: authError } = await supabase.auth.signUp({
      phone: '+91' + phoneNumber,
      password: password,
    });

    if (authError) {
      alert(authError.message);
    } else if (data.user) {
      // 2. Save medical details into 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          age: parseInt(age),
          location: address,
          phone: phoneNumber,
          blood_group: bloodGroup, // Verify this column exists in Supabase
          allergies: allergies,     // Verify this column exists in Supabase
          emergency_contact: emergencyContact
        });

      if (profileError) {
        console.error("Profile Error:", profileError);
        alert("Auth succeeded, but profile failed: " + profileError.message);
      } else {
        alert('Medical Profile Created Successfully! 🏥');
        navigate('/signin');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-h-cream p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-h-blue mb-6 text-center">Create Health ID 🏥</h2>
        
        <form onSubmit={handleSignUp} className="space-y-3">
          <input type="text" placeholder="Full Name" className="w-full p-3 border-2 rounded-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          
          <div className="flex gap-2">
            <input type="number" placeholder="Age" className="w-1/3 p-3 border-2 rounded-lg" value={age} onChange={(e) => setAge(e.target.value)} required />
            <input type="tel" placeholder="Phone Number" className="w-2/3 p-3 border-2 rounded-lg" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </div>

          <select 
            className="w-full p-3 border-2 rounded-lg bg-white"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            required
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>

          <input type="text" placeholder="Known Allergies (or 'None')" className="w-full p-3 border-2 rounded-lg" value={allergies} onChange={(e) => setAllergies(e.target.value)} required />
          
          <input type="tel" placeholder="Emergency Contact Number" className="w-full p-3 border-2 rounded-lg" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required />

          <input type="text" placeholder="Address" className="w-full p-3 border-2 rounded-lg" value={address} onChange={(e) => setAddress(e.target.value)} required />

          <input type="password" placeholder="Password" className="w-full p-3 border-2 rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button disabled={loading} className="w-full bg-h-orange text-white py-3 rounded-lg font-bold hover:bg-h-dark transition mt-4">
            {loading ? 'Processing...' : 'Complete Registration'}
          </button>

          <p className="text-center text-sm mt-2">
            Already have an account? 
            <span 
              className="text-h-blue cursor-pointer underline ml-1"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;