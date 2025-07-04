// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const App = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Página principal: si está logueado → Dashboard, si no → Login */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />

        {/* Dashboard protegido */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        {/* Registro solo visible si no está logueado y si estás en desarrollo */}
        {process.env.NODE_ENV !== 'production' && (
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
