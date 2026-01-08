import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAnF2q_CIsCdZ3w2U1ZkaAHS02WgPpa21g",
    authDomain: "decibelpro-v2.firebaseapp.com",
    projectId: "decibelpro-v2",
    storageBucket: "decibelpro-v2.firebasestorage.app",
    messagingSenderId: "662151740494",
    appId: "1:662151740494:web:b9bb15b12c306c4821171f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exports for the app
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signIn = () => signInAnonymously(auth);
