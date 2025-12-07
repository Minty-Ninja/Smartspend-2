
// ---------- FIREBASE (imports must run in module context) ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, doc, setDoc }
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
    toggleText.innerText = "Don’t have an account?";
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
    await setDoc(doc(db, "users", userCredential.user.uid), { name, email });

    // Redirect directly to dashboard after successful signup
    showDashboard(true);
  } catch (err) {
    // show user-friendly error
    alert(err.message || "Sign up error");
  }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // On success, show dashboard with slide animation
    showDashboard(true);
  } catch (err) {
    alert("Incorrect email or password.");
  }
});

// ---------- NAV / ANIMATION ----------
function showDashboard(withSlide = false) {
  // prepare dashboard
  dashboardSection.style.display = 'block';
  dashboardSection.setAttribute('aria-hidden', 'false');

  if (withSlide) {
    // animate auth out and dashboard in
    authSection.classList.add('slide-out-up');
    dashboardSection.classList.add('slide-in-up');
    // after animation, hide auth completely
    setTimeout(() => {
      authSection.style.display = 'none';
      authSection.classList.remove('slide-out-up');
      dashboardSection.classList.remove('slide-in-up');
    }, 650);
  } else {
    authSection.style.display = 'none';
  }
}

// Expose for possible external calls
window.showDashboard = showDashboard;

// ---------- DASHBOARD LOGIC (expenses + goals) ----------

// ---------- EXPENSES ----------
let expenses = [];
let expenseChart = null;

const displayDiv = document.getElementById('displaydiv');

document.getElementById('header').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('Amount').value);
  const description = document.getElementById('Description').value;
  const date = document.getElementById('Date').value;
  const category = document.getElementById('dropbtn').value;

  if (isNaN(amount) || !description || !date) return;

  const expense = {
    id: Date.now(),
    amount,
    description,
    date,
    category
  };

  expenses.push(expense);
  showExpenses();
  updatePieChart();
  event.target.reset();
});

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  showExpenses();
  updatePieChart();
}

// expose globally for inline onClick safety
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

    // use data-id to attach listeners instead of relying only on inline callbacks
    list += `
      <div class="expense-item" data-id="${e.id}">
        <div class="expense-header">
          <span class="expense-amount">₹${e.amount.toFixed(2)}</span>
          <button class="delete-btn" data-delete="${e.id}">Delete</button>
        </div>
        <div class="expense-description">${escapeHtml(e.description)}</div>
        <div class="expense-meta">
          <span class="category-badge ${categoryClass}">${e.category}</span>
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

  // attach delete listeners (clean)
  displayDiv.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = Number(ev.currentTarget.getAttribute('data-delete'));
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
  const ctx = ctxElem.getContext('2d');

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (labels.length === 0) {
    if (expenseChart) {
      expenseChart.destroy();
      expenseChart = null;
    }
    return;
  }

  if (expenseChart) {
    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = values;
    expenseChart.update();
    return;
  }

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

document.getElementById('header2').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('AmountToSave').value);
  const description = document.getElementById('DescriptionName').value;
  const date = document.getElementById('DateCompletion').value;

  if (isNaN(amount) || !description || !date) return;

  const goal = {
    id: Date.now(),
    target: amount,
    saved: 0,
    description,
    date
  };

  goals.push(goal);
  showGoals();
  event.target.reset();
});

function deleteGoal(id) {
  goals = goals.filter(goal => goal.id !== id);
  showGoals();
}
window.deleteGoal = deleteGoal;

function updateSavedAmount(id) {
  const input = document.getElementById(`update-input-${id}`);
  const add = parseFloat(input.value);

  if (isNaN(add) || add <= 0) return;

  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  goal.saved += add;
  if (goal.saved > goal.target) goal.saved = goal.target;

  input.value = "";
  showGoals();
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

    list += `
      <div class="goal-item" data-id="${g.id}">
        <div class="goal-header">
          <span class="goal-amount">₹${g.target.toFixed(2)}</span>
          <button class="delete-btn" data-delete-goal="${g.id}">Delete</button>
        </div>

        <div class="goal-description">${escapeHtml(g.description)}</div>
        <div class="goal-date">Target: ${new Date(g.date).toLocaleDateString()} • ${statusText}</div>

        <div class="progress-wrapper">
          <div class="progress-bar" style="width:${pctDisplay}%;"></div>
        </div>

        <div class="progress-text">Saved: ₹${g.saved.toFixed(2)} / ₹${g.target.toFixed(2)} (${pctDisplay}%)</div>

        <div class="goal-controls">
          <input type="number" id="update-input-${g.id}" placeholder="Add" class="update-input"/>
          <button class="update-btn" data-update="${g.id}">Update</button>
        </div>
      </div>
    `;
  }

  displayDiv2.innerHTML = list;

  // attach delete / update listeners
  displayDiv2.querySelectorAll('[data-delete-goal]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = Number(ev.currentTarget.getAttribute('data-delete-goal'));
      deleteGoal(id);
    });
  });
  displayDiv2.querySelectorAll('[data-update]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const id = Number(ev.currentTarget.getAttribute('data-update'));
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

// ---------- INITIAL STATE: show auth -->
// (dashboard hidden by default; auth visible)

