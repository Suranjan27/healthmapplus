import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import SignUp from './SignUp';
import SignIn from './SignIn';
import Home from './Home';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check if a user is already logged in when the app starts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* If session exists, show Home. If not, send them to Sign In */}
        <Route 
          path="/home" 
          element={session ? <Home /> : <Navigate to="/signin" />} 
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;