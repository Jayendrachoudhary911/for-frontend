import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEovxWPq-yTF0Ck3hezl6EC5zRSrI1WrU",
  authDomain: "jantavoice-8ff20.firebaseapp.com",
  projectId: "jantavoice-8ff20",
  storageBucket: "jantavoice-8ff20.firebasestorage.app",
  messagingSenderId: "410089988284",
  appId: "1:410089988284:web:7b6df8fad23a025b4af0b9",
  measurementId: "G-HF26QQRJB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const firestore = getFirestore(app);

export { auth, db, firestore };