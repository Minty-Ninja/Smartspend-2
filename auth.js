import { auth, db}    from "./config";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut }
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { doc, setDoc, addDoc, collection, getDocs, deleteDoc, updateDoc, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
  
//DOM reference
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const homePopup = document.getElementById('home-popup');
const popupBtn = document.getElementById('popup-btn');

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const toggleText = document.getElementById("toggle-text");
const toggleLink = document.getElementById("toggle-link");
const message = document.getElementById("auth-message");
const statusBox = document.getElementById("status-box");
const logOut = document.getElementById("logOut")

//Helpers
function showStatus(msg, isError=false){
  statusBox.style.display = "block" 
  statusBox.textContent = msg; 
  statusBox.style.background = isError? "red":"green"; 
  statusBox.style.color= isError? "white":"white"; 
  statusBox.style.border= isError? "1px solid red":"1px solid green"; 

}

function hideStatus(){
  statusBox.style.display = "none" 
}

export function showDashboard(isnewUser=false){ 
  dashboardSection.style.display="block"
  dashboardSection.setAttribute("aria- hidden", false)
  authSection.classList.add("slide-out-up")
  dashboardSection.classList.add("slide-in-up")
  setTimeout(()=>{
  authSection.style.display = "none"
  authSection.classList.remove("slide-out-up")
  dashboardSection.classList.remove("slide-in-up")
  if (isnewUser){
    homePopup.style.display = "flex"
  }


  },600) 

}
function showAuth(){
  dashboardSection.style.display="none"
  authSection.style.display="flex"
  hideStatus()
}

export function toggleForm(e){ 
  if (e && e.preventDefault){
    e.preventDefault()
  }

hideStatus()

const signupVisible = signupForm.style.display !== "none"
if (signupVisible){ 
  signupForm.style.display = "none"
  loginForm.style.display = "flex"
  toggleText.innerText = "Don't have an account?"
  toggleLink.innerText = "Sign Up"
  message.innerText = "Welcome Back. Login to your account"
}
else {
  signupForm.style.display = "flex"
  loginForm.style.display = "none"
  toggleText.innerText = "Already have an account?"
  toggleLink.innerText = "Log in"
  message.innerText = "Create an account to start tracking smarter"
}

}

window.toggleForms = toggleForm()

//Sign up

signupForm.addEventListener("submit", async (e)=>{
  
  e.preventDefault()
  hideStatus()
  const name = document.getElementById("name").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value

if (password.length<=8){
  showStatus("Password must be atleast 8 characters", true)
  return
}

  try {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const userID = cred.user.uid


  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email, 
    createdAt : Date
  })

  showStatus(`Account Created. Welcome, ${name}`);

  setTimeout(()=>{
    showDashboard(true)
  }, 600)

}

  catch(error){
    const msg = {
      "auth/email-already-in-use":"This email is already registered. Try logging in", 
      "auth/weak-password": "Password is too weak. Please create another one", 
      "auth/invalid-email": "Email is invalid. Please provide a valid address",
      

    }
    showStatus(msg[error.code] || error.msg, true)
  }

}
)

loginForm.addEventListener("submit", async (e)=>{
  
  e.preventDefault()
  hideStatus()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value

    try {
  const cred = await signInWithEmailAndPassword(auth, email, password);;
  const userID = cred.user.uid



  showStatus(`Logged in Successfully. Welcome Back, ${name}. Loading your data`);

  setTimeout(()=>{
    showDashboard(false)
  }, 600)

}

  catch(error){
    const msg = {
      "auth/user-not-found":"This email is not registered. Try signing up!", 
      "auth/invalid-email": "Email is invalid. Please provide a valid address",
      "auth/incorrect-password": "Password is incorrect. Please try again.", 
      "auth/invalid-credentials": "Incorrect email or password. Please try again"
      

    }
    showStatus(msg[error.code] || "Login failed. Please try again", true)
  }

}
)

// ---------- LOGOUT ----------
export async function logoutUser() {
  try {
    await signOut(auth);              //Changing auth when signing out
    showAuth()

  }
  
  catch(error){
    showStatus("Log out error." + error, true)

  }


}
window.logOut = logoutUser()

popupBtn.addEventListener("click", ()=>{
  homePopup.style.display = "none"
})

window.showHome = function () {
  document.getElementById("expense-section").style.display = "block";
  document.getElementById("goal-section").style.display    = "block";
};

window.showMonthly = function () {
  // Placeholder — could show a monthly breakdown view
  alert("Monthly Review coming soon!");
};

// ---------- SESSION LISTENER ----------
export function listenSession(callback) {
  onAuthStateChanged(auth, callback);
}

