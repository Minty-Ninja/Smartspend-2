import { auth, db } from "./config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// ---------- DOM ----------
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const homePopup = document.getElementById("home-popup");
const chatwrapper = document.getElementById("chatwrapper")

// ---------- TOGGLE LOGIN / SIGNUP ----------
window.toggleForms = function (e) {
  if (e) e.preventDefault();

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const toggleText = document.getElementById("toggle-text");
  const toggleLink = document.getElementById("toggle-link");
  const message = document.getElementById("auth-message");

  const isSignupVisible = signupForm.style.display !== "none";

  signupForm.style.display = isSignupVisible ? "none" : "flex";
  loginForm.style.display = isSignupVisible ? "flex" : "none";

  toggleText.innerText = isSignupVisible
    ? "Don't have an account?"
    : "Already have an account?";

  toggleLink.innerText = isSignupVisible ? "Sign Up" : "Log in";

  message.innerText = isSignupVisible
    ? "Welcome back! Log in to your account"
    : "Create an account to start tracking smarter";
};

// ---------- SHOW DASHBOARD ----------
export function showDashboard() {
  authSection.style.display = "none";
  dashboardSection.style.display = "block";
  chatwrapper.style.display = "block"
}

// ---------- SHOW AUTH ----------
export function showAuth() {
  dashboardSection.style.display = "none";
  authSection.style.display = "block";
}

// ---------- SIGNUP ----------
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email
    });

    homePopup.style.display = "flex";

  } catch (err) {
    alert(err.message);
  }
});

// ---------- LOGIN ----------
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    alert("Invalid email or password");
  }
});

// ---------- LOGOUT ----------
window.logout = async function () {
  await signOut(auth);
};

// ---------- AUTH STATE LISTENER ----------
onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboard();
    window.dispatchEvent(new CustomEvent("userLoggedIn", { detail: { uid: user.uid } }));

  } else {
    showAuth();
    window.dispatchEvent(new CustomEvent("userLoggedOut"));
  }
});

homePopup.addEventListener("click", () => { homePopup.style.display = "none"; });
export function getAndResetNewSignup(){
  const val = isNewSignUp
  isNewSignUp = false
  return val
}