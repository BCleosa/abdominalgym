import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCvZdxCUp6N804qVWUvSbCjA42a4IoJjKY",
  authDomain: "abdominalgym-kudus.firebaseapp.com",
  projectId: "abdominalgym-kudus",
  storageBucket: "abdominalgym-kudus.firebasestorage.app",
  messagingSenderId: "776059583001",
  appId: "1:776059583001:web:50c37354a4fbfa852d8888",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;