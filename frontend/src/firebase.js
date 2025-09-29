// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvDaHNLHdQu3nka-Tfn-bLZX0cFqyVUVc",
  authDomain: "skill-loops.firebaseapp.com",
  projectId: "skill-loops",
  storageBucket: "skill-loops.firebasestorage.app",
  messagingSenderId: "598983136039",
  appId: "1:598983136039:web:bd9d0bd88f9373f8ad8f02",
  measurementId: "G-331EJY8CZP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();