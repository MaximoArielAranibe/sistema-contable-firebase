import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-4 max-w-xs mx-auto gap-2">
      <input className="border p-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2" type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 rounded" type="submit">Ingresar</button>
    </form>
  );
}
