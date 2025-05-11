import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyC4pVxXXGuEmormtasU5v2W8dhuAjt76vI",

  authDomain: "tools-authentication-7e702.firebaseapp.com",

  projectId: "tools-authentication-7e702",

  storageBucket: "tools-authentication-7e702.firebasestorage.app",

  messagingSenderId: "653077360519",

  appId: "1:653077360519:web:10d1c65b49d8f37ca5ed22"

};


// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Exporter l'instance d'authentification
export const auth = getAuth(app)