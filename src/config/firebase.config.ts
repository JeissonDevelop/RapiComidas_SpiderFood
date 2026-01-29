import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY5_qlAXe--p2OoYbV4hCk8MqVgRt5t9s",
  authDomain: "rapicomidas-spiderfood.firebaseapp.com",
  projectId: "rapicomidas-spiderfood",
  storageBucket: "rapicomidas-spiderfood.firebasestorage.app",
  messagingSenderId: "174762264609",
  appId: "1:174762264609:web:1142fcb299bd7340273b60",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

console.log("✅ Firebase inicializado correctamente");
