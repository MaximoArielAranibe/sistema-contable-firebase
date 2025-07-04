// src/components/FinishSignIn.jsx
import { useEffect } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function FinishSignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignIn = async () => {
      const email = window.localStorage.getItem('emailForSignIn') || window.prompt('Ingresá tu email');
      if (!email) return;

      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          navigate('/dashboard'); // o redirigí a donde quieras
        } catch (error) {
          console.error('Error al iniciar sesión:', error);
        }
      }
    };

    completeSignIn();
  }, [navigate]);

  return <p className="text-center mt-8">Verificando enlace de acceso...</p>;
}
