import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDo6efgLq_pBOpzV5uBX1tzOHGobufOFFE",
  authDomain: "astrikos-f70ad.firebaseapp.com",
  projectId: "astrikos-f70ad",
  storageBucket: "astrikos-f70ad.firebasestorage.app",
  messagingSenderId: "127265830742",
  appId: "1:127265830742:web:b5b64b79c89faf630708f7",
  measurementId: "G-ZZJWNECY3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;