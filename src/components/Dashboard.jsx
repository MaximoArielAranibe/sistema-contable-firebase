import React from 'react';
import Clientes from './Clientes';
import '../styles/dashboard.scss'

export default function Dashboard() {
  return (
    <div className='dashboard'>
      <Clientes />
    </div>
  );
}
