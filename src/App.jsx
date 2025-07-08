import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import ErrorPage from './pages/ErrorPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/booking/:courtType" element={user ? <Booking user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
