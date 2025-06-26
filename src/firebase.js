import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAcE8L8BGIHA-pGFl77ZyGL0sRHyK8Y_0o",
  authDomain: "sistema-contable-firebase.firebaseapp.com",
  projectId: "sistema-contable-firebase",
  storageBucket: "sistema-contable-firebase.firebasestorage.app",
  messagingSenderId: "374720410405",
  appId: "1:374720410405:web:27040992da6363cae060cc",
  measurementId: "G-X2J3GCQT08"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
