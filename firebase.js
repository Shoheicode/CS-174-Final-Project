// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyfn1abPH8iuuAYBntEsfEkxfC3uYt3N4",
  authDomain: "finalprojectcs174e.firebaseapp.com",
  projectId: "finalprojectcs174e",
  storageBucket: "finalprojectcs174e.firebasestorage.app",
  messagingSenderId: "537486403927",
  appId: "1:537486403927:web:16168699c610789a65f612",
  measurementId: "G-PB5S33YH20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const database = getFirestore(app);

const addData = async () => {
    await setDoc(doc(db, "collectionName", "documentID"), {
        key: "value"
    });
};

export {app, database, addData}