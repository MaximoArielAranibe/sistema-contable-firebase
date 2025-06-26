import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App = () => {
  const { user } = useAuth();
  return <div>{user ? <Dashboard /> : <Login />}</div>;
};

export default App;
