
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
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Current User ----------
let currentUserId = null;

// ---------- Screen elements ----------
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const homePopup = document.getElementById('home-popup');
const popupBtn = document.getElementById('popup-btn');

window.toggleForms = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const toggleText = document.getElementById("toggle-text");
  const toggleLink = document.getElementById("toggle-link");
  const message = document.getElementById("auth-message");

  if (signupForm.style.display === "none" || signupForm.style.display === "") {
    signupForm.style.display = "flex";
    loginForm.style.display = "none";
    toggleText.innerText = "Already have an account?";
    toggleLink.innerText = "Log in";
    message.innerText = "Create an account to start tracking smarter";
  } else {
    signupForm.style.display = "none";
    loginForm.style.display = "flex";
    toggleText.innerText = "Don't have an account?";
    toggleLink.innerText = "Sign Up";
    message.innerText = "Welcome back! Log in to your account";
  }
};

// ---------- AUTH FORM LISTENERS ----------
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    currentUserId = userCredential.user.uid;
    await setDoc(doc(db, "users", currentUserId), { name, email });

    // Show dashboard first, then load user data (so chart renders on visible canvas)
    showDashboard(true);
    setTimeout(async () => {
      await loadUserData();
    }, 100);
  } catch (err) {
    alert(err.message || "Sign up error");
  }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    currentUserId = userCredential.user.uid;

    // Show dashboard first, then load user data (so chart renders on visible canvas)
    showDashboard(true);
    setTimeout(async () => {
      await loadUserData();
    }, 100);
  } catch (err) {
    alert("Incorrect email or password.");
  }
});

// ---------- LOAD USER DATA FROM FIREBASE ----------
async function loadUserData() {
  if (!currentUserId) return;

  // Load expenses
  try {
    const expensesRef = collection(db, "users", currentUserId, "expenses");
    const expensesSnap = await getDocs(query(expensesRef, orderBy("createdAt", "desc")));
    expenses = [];
    expensesSnap.forEach((docSnap) => {
      expenses.push({ id: docSnap.id, ...docSnap.data() });
    });
    showExpenses();
    updatePieChart();
  } catch (err) {
    console.error("Error loading expenses:", err);
  }

  // Load goals
  try {
    const goalsRef = collection(db, "users", currentUserId, "goals");
    const goalsSnap = await getDocs(query(goalsRef, orderBy("createdAt", "desc")));
    goals = [];
    goalsSnap.forEach((docSnap) => {
      goals.push({ id: docSnap.id, ...docSnap.data() });
    });
    showGoals();
  } catch (err) {
    console.error("Error loading goals:", err);
  }
}

// ---------- NAV / ANIMATION ----------
function showDashboard(withSlide = false) {
  dashboardSection.style.display = 'block';
  dashboardSection.setAttribute('aria-hidden', 'false');

  if (withSlide) {
    authSection.classList.add('slide-out-up');
    dashboardSection.classList.add('slide-in-up');
    setTimeout(() => {
      authSection.style.display = 'none';
      authSection.classList.remove('slide-out-up');
      dashboardSection.classList.remove('slide-in-up');
    }, 650);
  } else {
    authSection.style.display = 'none';
  }
}

window.showDashboard = showDashboard;

// ---------- DASHBOARD LOGIC (expenses + goals) ----------

// ---------- EXPENSES ----------
let expenses = [];
let expenseChart = null;

const displayDiv = document.getElementById('displaydiv');

document.getElementById('header').addEventListener('submit', async function(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('Amount').value);
  const description = document.getElementById('Description').value;
  const date = document.getElementById('Date').value;
  const category = document.getElementById('dropbtn').value;

  if (isNaN(amount) || !description || !date) return;
  if (!currentUserId) {
    alert("Please sign in first");
    return;
  }

  try {
    // Save to Firebase
    const docRef = await addDoc(collection(db, "users", currentUserId, "expenses"), {
      amount,
      description,
      date,
      category,
      createdAt: Date.now()
    });

    // Add to local array with Firebase doc ID
    const expense = {
      id: docRef.id,
      amount,
      description,
      date,
      category,
      createdAt: Date.now()
    };

    expenses.unshift(expense);
    showExpenses();
    updatePieChart();
    event.target.reset();
  } catch (err) {
    console.error("Error adding expense:", err);
    alert("Failed to save expense. Please try again.");
  }
});

async function deleteExpense(id) {
  if (!currentUserId) return;

  try {
    // Delete from Firebase
    await deleteDoc(doc(db, "users", currentUserId, "expenses", id));

    // Remove from local array
    expenses = expenses.filter(expense => expense.id !== id);
    showExpenses();
    updatePieChart();
  } catch (err) {
    console.error("Error deleting expense:", err);
    alert("Failed to delete expense. Please try again.");
  }
}

window.deleteExpense = deleteExpense;

function showExpenses() {
  if (expenses.length === 0) {
    displayDiv.innerHTML = '<div class="empty-state">No expenses added yet. Start tracking your spending!</div>';
    return;
  }

  let list = "";
  let total = 0;

  for (const e of expenses) {
    total += e.amount;
    const categoryClass = `category-${e.category.toLowerCase()}`;

    list += `
      <div class="expense-item" data-id="${escapeHtml(e.id)}">
        <div class="expense-header">
          <span class="expense-amount">₹${e.amount.toFixed(2)}</span>
          <button class="delete-btn" data-delete="${escapeHtml(e.id)}">Delete</button>
        </div>
        <div class="expense-description">${escapeHtml(e.description)}</div>
        <div class="expense-meta">
          <span class="category-badge ${escapeHtml(categoryClass)}">${escapeHtml(e.category)}</span>
          <span>${new Date(e.date).toLocaleDateString()}</span>
        </div>
      </div>
    `;
  }

  list += `
    <div class="total-section">
      <div class="total-amount">Total Spent: ₹${total.toFixed(2)}</div>
    </div>
  `;

  displayDiv.innerHTML = list;

  displayDiv.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = ev.currentTarget.getAttribute('data-delete');
      deleteExpense(id);
    });
  });
}

// ---------- PIE CHART FOR EXPENSES ----------
function getCategoryTotals() {
  const totals = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  }
  return totals;
}

function updatePieChart() {
  const totals = getCategoryTotals();
  const ctxElem = document.getElementById('categoryChart');
  if (!ctxElem) return;

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (labels.length === 0) {
    if (expenseChart) {
      expenseChart.destroy();
      expenseChart = null;
    }
    return;
  }

  // Always destroy and recreate chart to avoid rendering issues
  if (expenseChart) {
    expenseChart.destroy();
    expenseChart = null;
  }

  const ctx = ctxElem.getContext('2d');
  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        label: 'Expenses by Category',
        backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff']
      }]
    }
  });
}

// ---------- GOALS ----------
let goals = [];
const displayDiv2 = document.getElementById('displaydiv2');

document.getElementById('header2').addEventListener('submit', async function(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('AmountToSave').value);
  const description = document.getElementById('DescriptionName').value;
  const date = document.getElementById('DateCompletion').value;

  if (isNaN(amount) || !description || !date) return;
  if (!currentUserId) {
    alert("Please sign in first");
    return;
  }

  try {
    // Save to Firebase
    const docRef = await addDoc(collection(db, "users", currentUserId, "goals"), {
      target: amount,
      saved: 0,
      description,
      date,
      createdAt: Date.now()
    });

    // Add to local array with Firebase doc ID
    const goal = {
      id: docRef.id,
      target: amount,
      saved: 0,
      description,
      date,
      createdAt: Date.now()
    };

    goals.unshift(goal);
    showGoals();
    event.target.reset();
  } catch (err) {
    console.error("Error adding goal:", err);
    alert("Failed to save goal. Please try again.");
  }
});

async function deleteGoal(id) {
  if (!currentUserId) return;

  try {
    // Delete from Firebase
    await deleteDoc(doc(db, "users", currentUserId, "goals", id));

    // Remove from local array
    goals = goals.filter(goal => goal.id !== id);
    showGoals();
  } catch (err) {
    console.error("Error deleting goal:", err);
    alert("Failed to delete goal. Please try again.");
  }
}
window.deleteGoal = deleteGoal;

async function updateSavedAmount(id) {
  const input = document.getElementById(`update-input-${id}`);
  const add = parseFloat(input.value);

  if (isNaN(add) || add <= 0) return;
  if (!currentUserId) return;

  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  let newSaved = goal.saved + add;
  if (newSaved > goal.target) newSaved = goal.target;

  try {
    // Update in Firebase
    await updateDoc(doc(db, "users", currentUserId, "goals", id), {
      saved: newSaved
    });

    // Update local
    goal.saved = newSaved;
    input.value = "";
    showGoals();
  } catch (err) {
    console.error("Error updating goal:", err);
    alert("Failed to update goal. Please try again.");
  }
}
window.updateSavedAmount = updateSavedAmount;

function getDaysUntilDate(targetDate) {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function showGoals() {
  if (goals.length === 0) {
    displayDiv2.innerHTML = '<div class="empty-state">No goals set yet. Create your first savings goal!</div>';
    return;
  }

  let list = "";

  for (const g of goals) {
    const daysLeft = getDaysUntilDate(g.date);
    const statusText = daysLeft > 0 ? `${daysLeft} days left`
                     : daysLeft === 0 ? 'Due today!'
                     : `${Math.abs(daysLeft)} days overdue`;

    const percentage = ((g.saved / g.target) * 100);
    const pctDisplay = Math.min(Math.max(Math.round(percentage), 0), 100);

    const safeId = escapeHtml(g.id);
    list += `
      <div class="goal-item" data-id="${safeId}">
        <div class="goal-header">
          <span class="goal-amount">₹${g.target.toFixed(2)}</span>
          <button class="delete-btn" data-delete-goal="${safeId}">Delete</button>
        </div>

        <div class="goal-description">${escapeHtml(g.description)}</div>
        <div class="goal-date">Target: ${new Date(g.date).toLocaleDateString()} • ${statusText}</div>

        <div class="progress-wrapper">
          <div class="progress-bar" style="width:${pctDisplay}%;"></div>
        </div>

        <div class="progress-text">Saved: ₹${g.saved.toFixed(2)} / ₹${g.target.toFixed(2)} (${pctDisplay}%)</div>

        <div class="goal-controls">
          <input type="number" id="update-input-${safeId}" placeholder="Add" class="update-input"/>
          <button class="update-btn" data-update="${safeId}">Update</button>
        </div>
      </div>
    `;
  }

  displayDiv2.innerHTML = list;

  displayDiv2.querySelectorAll('[data-delete-goal]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = ev.currentTarget.getAttribute('data-delete-goal');
      deleteGoal(id);
    });
  });
  displayDiv2.querySelectorAll('[data-update]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = ev.currentTarget.getAttribute('data-update');
      updateSavedAmount(id);
    });
  });
}

// ---------- small helper ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
