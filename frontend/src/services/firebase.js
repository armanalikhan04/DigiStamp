import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {

  apiKey: "AIzaSyCSg9vLUdkpFN-t9WysAjFg1mfJa9skczY",

  authDomain: "digistamp-01.firebaseapp.com",

  projectId: "digistamp-01",

  storageBucket: "digistamp-01.firebasestorage.app",

  messagingSenderId: "109290949459",

  appId: "1:109290949459:web:f30256474c2962370e2fa6"

};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);