
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCHRvBAY3PvN9P_QQJA6XUEEAEwVUWQogE",
    authDomain: "fueltrackpro-a4856.firebaseapp.com",
    projectId: "fueltrackpro-a4856",
    storageBucket: "fueltrackpro-a4856.firebasestorage.app",
    messagingSenderId: "22618337014",
    appId: "1:22618337014:web:42234d4ea94d44a7b186d7",
    measurementId: "G-91ESV42JR3"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db ,storage};
