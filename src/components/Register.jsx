// src/components/Register.jsx
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMensaje('Usuario creado exitosamente');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Ocultar esto en producción (opcional)
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold">Registrar usuario</h2>
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Registrar
      </button>
      {mensaje && <p className="text-green-600">{mensaje}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
