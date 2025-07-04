import { useState } from 'react';
import { sendSignInLinkToEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../firebase';

const actionCodeSettings = {
  url: 'https://sistema-contable-firebase.web.app/finishSignIn',
  handleCodeInApp: true,
};

export default function LoginLink() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      // Si el correo ya tiene login con contraseña
      if (methods.includes('password')) {
        setError('Este correo ya está registrado con contraseña. Iniciá sesión desde el formulario tradicional.');
        return;
      }

      // Enviar enlace si no tiene contraseña (nuevo o registrado con link)
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMensaje('Revisá tu correo. Te enviamos un enlace para iniciar sesión.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">Ingresá tu correo</h2>
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="ejemplo@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Enviar enlace
      </button>
      {mensaje && <p className="text-green-600">{mensaje}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
