import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZRfAGRuqjyyRd3XPkQcBCsCJA7d7AwUU",
  authDomain: "ai-vision-surveillance-system.firebaseapp.com",
  projectId: "ai-vision-surveillance-system",
  storageBucket: "ai-vision-surveillance-system.firebasestorage.app",
  messagingSenderId: "92384008990",
  appId: "1:92384008990:web:27be160792ba948d8ac70f",
  measurementId: "G-ZJVP6S984X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-visionguardproai-9327f37c-b0c5-43ed-bd1e-f3b6415ad3e4");
