
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBTnnV31aswX_SNXgKsVzgO6rrmDh9cYUs",
  authDomain: "learning-test-b1a4b.firebaseapp.com",
  projectId: "learning-test-b1a4b",
  storageBucket: "learning-test-b1a4b.firebasestorage.app",
  messagingSenderId: "88379926610",
  appId: "1:88379926610:web:03d19a05d179bf4b78978b",
  measurementId: "G-NKNRVK127S"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const GoogleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
