// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwX860euQy41KzMrsgq5HURk5_rimgAWU",
  authDomain: "wordle-game-30542.firebaseapp.com",
  projectId: "wordle-game-30542",
  storageBucket: "wordle-game-30542.appspot.com",
  messagingSenderId: "783690136596",
  appId: "1:783690136596:web:377b7f5459d46101b77b01",
  measurementId: "G-X3ZMY7Z99H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore();

export class FirebaseClient {
  constructor() {
    throw new Error('Use Singleton.getInstance()');
  }
  static getInstance(): FirebaseApp {
    return app;
  }

  static getDB(): FirebaseFirestore.Firestore {
    return db;
  }
}