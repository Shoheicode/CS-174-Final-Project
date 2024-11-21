// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc,getDocs, getDoc, limit, collection, query,orderBy, deleteDoc } from 'firebase/firestore';
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

const addData = async (Name, time) => {
    console.log("HELLo")
    await setDoc(doc(database, "NAME", Name), {
        key: Name,
        time: time
    });
    addToTopTime(Name, time)
};

const addToTopTime = async (name, time) => {
    let ref = collection(database, "TopTimes")
    const q = query(ref, orderBy("time"), limit(3));

    let delDocu = false;
    let nameSaved = ""

    const querySnapshot = await getDocs(q);
    let i = 0;
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(index)
        console.log(doc.id, " => ", doc.data());
        if(doc.data()["time"] > time){
            delDocu = true;
        }
        if (i == 2 && delDocu){
            nameSaved = doc.id;
        }
        i++;
    });

    if(delDocu && i == 3){
        deleteDoc(doc(database, "TopTimes", nameSaved));
        await setDoc(doc(database, "TopTimes", name), {
            name: name,
            time: time
        });
    } else if (delDocu) {
        await setDoc(doc(database, "TopTimes", name), {
            name: name,
            time: time
        });
    }
    


}

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

const getBestLapTimes = async ()=>{
    let ref = collection(database, "TopTimes")
    const q = query(ref, orderBy("time"), limit(3));

    let delDocu = false;
    let nameSaved = "";

    let list = [];

    const querySnapshot = await getDocs(q);
    let i = 0;
    querySnapshot.forEach((doc) => {
        list.push({
            name: doc.id,
            time:doc.data()["time"]
        })
    });

    console.log("HELLO")
    console.log(list)

    return list;
    
}

export {app, database, addData, checkDocumentExists, getBestLapTimes}