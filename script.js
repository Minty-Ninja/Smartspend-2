import { auth, db } from "./config.js";
import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  doc, addDoc, collection,
  getDocs, deleteDoc, updateDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Import auth UI + the flag checker
import { showDashboard, showAuth, getAndResetNewSignup } from "./authentication.js";

let monthlyChart = null; 
let monthlyCategory = null; 


let currentUserId = null;
let expenses = [], goals = [], expenseChart = null;
const displayDiv  = document.getElementById("displaydiv");
const displayDiv2 = document.getElementById("displaydiv2");

// SESSION — lives here now, no custom events needed
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log(currentUserId)
    const isNew = getAndResetNewSignup(); // true only right after signup
    showDashboard(isNew);
    await loadUserData();
  } else {
    currentUserId = null;
    expenses = [];
    goals    = [];
    if (displayDiv)  displayDiv.innerHTML  = "";
    if (displayDiv2) displayDiv2.innerHTML = "";
    if (expenseChart) { expenseChart.destroy(); expenseChart = null; }
    showAuth();
  }
});

// Nav
window.showHome = function() {
  document.getElementById("expense-section").style.display = "block";
  document.getElementById("goal-section").style.display    = "block";
  document.getElementById("monthlyIns").style.display = "none"; 
  closeSideBar()
};
window.showMonthly = async function(){
  document.getElementById("expense-section").style.display = "none";
  document.getElementById("goal-section").style.display = "none";
  document.getElementById("monthlyIns").style.display = "block"; 
  closeSideBar()
  
await renderMonthlyData()
};

async function renderMonthlyData(){
  const loading = document.getElementById("monthlyLoad")
  const content = document.getElementById("monthlyContent")
  loading.style.display = "block"; 
  content.style.display = "none";
  let allExpenses = []
  try {
     const snap = await getDocs(
      query(collection(db, "users", currentUserId, "expenses"), orderBy("createdAt", "desc"))
    ); 


    console.log(snap, "Monthly Data")
    snap.forEach(x => allExpenses.push({id: x.id, ...x.data()}))

    console.log(allExpenses, "expenses")


  }
  catch(err){
    loading.textContent = "Failed to Load Data. Please try again"
    console.error(err)
    return; 

  }

  loading.style.display = "none"; 
  content.style.display = "block";
  setTimeout(()=>buildMonthly(allExpenses), 100)

}

const categoryCol = {
  Food: { bg: "rgba(255, 99, 132, 0.8)", border: "#ff6384" },
  Leisure: { bg: "rgba(54, 162, 235, 0.8)", border: "#36a2eb" }, 
  Miscellaneous: { bg: "rgba(255, 205, 86, 0.8)", border: "#ffcd56" }
}

function getCategoryColour(category){
  return categoryCol[category]

}

function toMonthKey(dateStr) { 
  // dateStr is "YYYY-MM-DD" from the date input → returns "YYYY-MM" 
  return dateStr ? dateStr.slice(0, 7) : ""; } 

function formatMonthLabel(key) { 
  if (!key) return ""; 
  const [year, month] = key.split("-"); 
  return new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" }); 
}

function currentMonthKey() { 
  const now = new Date(); 
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}


function buildMonthly(allExpenses){

  console.log(allExpenses)
  const monthset = new Set()
  const categorySet = new Set()

  allExpenses.forEach(e=>{
  monthset.add(toMonthKey(e.date))
  categorySet.add(e.category)


  }
)

const sortedMonth = [...monthset].sort(); 
const sortedCategory = [...categorySet].sort();

const dataMap = {}
sortedCategory.forEach(ct=>{
  dataMap[ct] = {}
  sortedMonth.forEach(m=>{dataMap[ct][m]=0})
})

allExpenses.forEach(e=>{
  const key = toMonthKey(e.date)
  
  if (dataMap[e.category]){
    // dataMap[e.category][key] = (dataMap[e.category][key] || 0) + e.amount
    dataMap[e.category][key] = (dataMap[e.category][key] || 0) + parseFloat(e.amount || 0);
    
    
  }
})

console.log(sortedCategory, "sortedCategory")

const dataSets = sortedCategory.map(cat => ({ 
  label: cat, 
  data: sortedMonth.map(m => dataMap[cat][m] || 0), 
  backgroundColor: categoryCol[cat].bg, 
  borderColor: categoryCol[cat].border, 
  borderWidth: 1, 
  borderRadius: 4, }));

  const labels = sortedMonth.map(e=>
    formatMonthLabel(e)
  )

  console.log(labels)

  const ctx = document.getElementById("expenseBarChart").getContext("2d")
  if (monthlyChart){
    monthlyChart.destroy()

  }
  else{
    // monthlyChart = null; 
  }
console.log("datasets", dataSets)
monthlyChart = new Chart(ctx, {
   type: "bar",
    data: { labels, datasets: dataSets },
    options: {
      responsive: true,
      interaction: {
        mode: "index",       // tooltip shows all categories for hovered month
        intersect: false,
      },
      plugins: {
        legend: { display: false },  // we build our own legend below
        tooltip: {
          backgroundColor: (0,0,0), 
          titleColor: "#4199E1", 
          bodyColor: (255, 255, 255),
          padding: 10, 
          
          callbacks: {
            title: ctx=>ctx[0].label,  
            label: ctx =>
              ` ${ctx.datasets.label}: ${ctx.parsed.y.toFixed(2)}`

          }
        }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          min:0,
          max: 10000, 


          ticks: { stepSize:1000, callback: v => v }
        }
      }
    }
})
console.log("monthly", monthlyChart)
 // Build custom legend chips under the chart
  const legendEl = document.getElementById("barChartLegend");
  legendEl.innerHTML = sortedCategory.map(cat => `
    <span class="legend-chip">
      <span class="legend-dot" style="background:${getCategoryColour(cat).border}"></span>
      ${cat}
    </span>
  `).join("");
}

// Load all data for current user
async function loadUserData() {
  console.log("Hi")
  if (!currentUserId) return;

  try {
    const snap = await getDocs(
      query(collection(db, "users", currentUserId, "expenses"), orderBy("createdAt", "desc"))
    );
    expenses = [];
    snap.forEach(d => expenses.push({ id: d.id, ...d.data() }));
    showExpenses();
    setTimeout(updatePieChart, 1000)
  } catch (err) { console.error("Error loading expenses:", err); }

  try {
    const snap = await getDocs(
      query(collection(db, "users", currentUserId, "goals"), orderBy("createdAt", "desc"))
    );
    goals = [];
    snap.forEach(d => goals.push({ id: d.id, ...d.data() }));
    showGoals();
  } catch (err) { console.error("Error loading goals:", err); }
}

// Add expense
document.getElementById("header").addEventListener("submit", async function(event) {
  event.preventDefault();
  const amount      = parseFloat(document.getElementById("Amount").value);
  const description = document.getElementById("Description").value;
  const date        = document.getElementById("Date").value;
  const category    = document.getElementById("dropbtn").value;
  if (isNaN(amount) || !description || !date) return;
  if (!currentUserId) { alert("Please sign in first."); return; }
  try {
    const docRef = await addDoc(collection(db, "users", currentUserId, "expenses"), {
      amount, description, date, category, createdAt: Date.now()
    });
    expenses.unshift({ id: docRef.id, amount, description, date, category, createdAt: Date.now() });
    showExpenses();
    updatePieChart();
    event.target.reset();
  } catch (err) { console.error(err); alert("Failed to save expense."); }
});

// Delete expense
async function deleteExpense(id) {
  if (!currentUserId) return;
  try {
    await deleteDoc(doc(db, "users", currentUserId, "expenses", id));
    expenses = expenses.filter(e => e.id !== id);
    showExpenses();
    updatePieChart();
  } catch (err) { console.error(err); alert("Failed to delete expense."); }
}
window.deleteExpense = deleteExpense;

// Show expenses
function showExpenses() {
  if (!expenses.length) {
    displayDiv.innerHTML = '<div class="empty-state">No expenses yet. Start tracking!</div>';
    return;
  }
  let list = "", total = 0;
  for (const e of expenses) {
    total += e.amount;
    list += `<div class="expense-item">
      <div class="expense-header">
        <span class="expense-amount">₹${e.amount.toFixed(2)}</span>
        <button class="delete-btn" data-delete="${escapeHtml(e.id)}">Delete</button>
      </div>
      <div class="expense-description">${escapeHtml(e.description)}</div>
      <div class="expense-meta">
        <span class="category-badge category-${e.category.toLowerCase()}">${escapeHtml(e.category)}</span>
        <span>${new Date(e.date).toLocaleDateString()}</span>
      </div></div>`;
  }
  list += `<div class="total-section"><div class="total-amount">Total Spent: ₹${total.toFixed(2)}</div></div>`;
  displayDiv.innerHTML = list;
  displayDiv.querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", ev => deleteExpense(ev.currentTarget.getAttribute("data-delete")))
  );
}

// Pie chart
function updatePieChart() {
  const ctxElem = document.getElementById("categoryChart");
  if (!ctxElem) return;
  if (expenseChart) { expenseChart.destroy(); expenseChart = null; }
  const totals = {};
  for (const e of expenses) totals[e.category] = (totals[e.category] || 0) + e.amount;
  const labels = Object.keys(totals), values = Object.values(totals);
  if (!labels.length) return;
  expenseChart = new Chart(ctxElem.getContext("2d"), {
    type: "pie",
    data: { labels, datasets: [{ data: values,
      backgroundColor: ["#ff6384","#36a2eb","#ffcd56","#4bc0c0","#9966ff"] }] }
  });
}

// Add goal
document.getElementById("header2").addEventListener("submit", async function(event) {
  event.preventDefault();
  const amount      = parseFloat(document.getElementById("AmountToSave").value);
  const description = document.getElementById("DescriptionName").value;
  const date        = document.getElementById("DateCompletion").value;
  if (isNaN(amount) || !description || !date) return;
  if (!currentUserId) { alert("Please sign in first."); return; }
  try {
    const docRef = await addDoc(collection(db, "users", currentUserId, "goals"), {
      target: amount, saved: 0, description, date, createdAt: Date.now()
    });
    goals.unshift({ id: docRef.id, target: amount, saved: 0, description, date, createdAt: Date.now() });
    showGoals();
    event.target.reset();
  } catch (err) { console.error(err); alert("Failed to save goal."); }
});

// Delete goal
async function deleteGoal(id) {
  if (!currentUserId) return;
  try {
    await deleteDoc(doc(db, "users", currentUserId, "goals", id));
    goals = goals.filter(g => g.id !== id);
    showGoals();
  } catch (err) { console.error(err); alert("Failed to delete goal."); }
}
window.deleteGoal = deleteGoal;

// Update saved amount
async function updateSavedAmount(id) {
  const input = document.getElementById(`update-input-${id}`);
  const add   = parseFloat(input.value);
  if (isNaN(add) || add <= 0 || !currentUserId) return;
  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  const newSaved = Math.min(goal.saved + add, goal.target);
  try {
    await updateDoc(doc(db, "users", currentUserId, "goals", id), { saved: newSaved });
    goal.saved = newSaved;
    input.value = "";
    showGoals();
  } catch (err) { console.error(err); alert("Failed to update goal."); }
}
window.updateSavedAmount = updateSavedAmount;

// Show goals
function showGoals() {
  if (!goals.length) {
    displayDiv2.innerHTML = '<div class="empty-state">No goals yet. Create your first!</div>';
    return;
  }
  let list = "";
  for (const g of goals) {
    const daysLeft   = Math.ceil((new Date(g.date) - new Date()) / 86400000);
    const statusText = daysLeft > 0 ? `${daysLeft} days left`
                     : daysLeft === 0 ? "Due today!" : `${Math.abs(daysLeft)} days overdue`;
    const pct    = Math.min(Math.max(Math.round((g.saved / g.target) * 100), 0), 100);
    const safeId = escapeHtml(g.id);
    list += `<div class="goal-item">
      <div class="goal-header">
        <span class="goal-amount">₹${g.target.toFixed(2)}</span>
        <button class="delete-btn" data-delete-goal="${safeId}">Delete</button>
      </div>
      <div class="goal-description">${escapeHtml(g.description)}</div>
      <div class="goal-date">Target: ${new Date(g.date).toLocaleDateString()} • ${statusText}</div>
      <div class="progress-wrapper"><div class="progress-bar" style="width:${pct}%;"></div></div>
      <div class="progress-text">Saved: ₹${g.saved.toFixed(2)} / ₹${g.target.toFixed(2)} (${pct}%)</div>
      <div class="goal-controls">
        <input type="number" id="update-input-${safeId}" placeholder="Add" class="update-input"/>
        <button class="update-btn" data-update="${safeId}">Update</button>
      </div></div>`;
  }
  displayDiv2.innerHTML = list;
  displayDiv2.querySelectorAll("[data-delete-goal]").forEach(btn =>
    btn.addEventListener("click", ev => deleteGoal(ev.currentTarget.getAttribute("data-delete-goal")))
  );
  displayDiv2.querySelectorAll("[data-update]").forEach(btn =>
    btn.addEventListener("click", ev => updateSavedAmount(ev.currentTarget.getAttribute("data-update")))
  );
}

// Helper
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}


window.toggleSideBar = function() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sideBarOverlay");
  const btn     = document.getElementById("hamIcons");
  const isOpen  = sidebar.classList.contains("open")
  btn.style.opacity = isOpen?"1":"0"
  btn.style.pointerEvents = isOpen?"all":"none"
  if (sidebar.classList.contains("open")) {
    window.closeSideBar();
    // btn.style.display = "block"
  } else {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
    // btn.classList.add("active");
    // btn.style.display = "none"
  }
};
 
window.closeSideBar = function() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sideBarOverlay");
  const btn     = document.getElementById("hamIcons");
  sidebar.classList.remove("open");
  overlay.classList.remove("visible");
  btn.style.opacity = "1";
  btn.style.pointerEvents = "all"; 
};
 
// Close sidebar on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") window.closeSideBar();
});
 


console.log(document.getElementById("hamIcons"))