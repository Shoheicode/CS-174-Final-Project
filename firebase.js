// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc,getDoc } from 'firebase/firestore';
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
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// const analytics = getAnalytics(app);

const database = getFirestore(app);



const addData = async (Name, time) => {
    console.log("HELLo")
    await setDoc(doc(database, "NAME", Name), {
        key: Name,
        time: time
    });
};

const checkDocumentExists = async (documentId) => {
    const docRef = doc(database, "NAME", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        // console.log("Document exists:", docSnap.data());
        return true; // Document exists
    } else {
        // console.log("No such document!");
        return false; // Document does not exist
    }
};

const createUserWithEmailAndPassword = async (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
    });
}

export {app, database, addData, checkDocumentExists}