// ---------- FIREBASE (imports must run in module context) ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, getDocs, deleteDoc, updateDoc, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlqTN_qGHoR_pATZ1esqxnrCrx83WyJ3E",
  authDomain: "smartspend-48e3b.firebaseapp.com",
  projectId: "smartspend-48e3b",
  storageBucket: "smartspend-48e3b.firebasestorage.app",
  messagingSenderId: "873649852935",
  appId: "1:873649852935:web:782453dd97b8d8709210a2",
  measurementId: "G-DF00ZPLQ8K" 
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

