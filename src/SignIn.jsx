import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      phone: '+91' + phoneNumber,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Welcome back to HealthMap+!');
      navigate('/home');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-h-cream p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-h-orange">
        <h2 className="text-2xl font-bold text-h-dark mb-6 text-center">Login 🔑</h2>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">+91</span>
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-3 pl-12 border-2 border-h-light rounded-lg outline-none focus:border-h-orange"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 pr-12 border-2 border-h-light rounded-lg outline-none focus:border-h-orange"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="flex justify-end">
            <span 
              className="text-sm text-h-blue cursor-pointer hover:underline"
              onClick={() => alert('Password reset functionality coming soon!')}
            >
              Forgot Password?
            </span>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-h-orange text-white py-3 rounded-lg font-bold hover:bg-h-dark transition shadow-lg"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
          
          <p className="text-center text-sm mt-4">
            New user? 
            <span 
              className="text-h-blue cursor-pointer underline ml-1 font-bold"
              onClick={() => navigate('/signup')}
            >
              Create Medical ID
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;