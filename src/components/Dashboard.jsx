import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Clientes from './Clientes';

export default function Dashboard() {
  return (
    <div className="text-center p-4">
      <h1 className="text-xl">Panel contable</h1>
      <button className="bg-red-500 text-white p-2 mt-4" onClick={() => signOut(auth)}>Salir</button>
      <Clientes />

    </div>
  );
}
