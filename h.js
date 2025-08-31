// ---------------- EXPENSES ----------------
let expenses = [];
const displayDiv = document.getElementById('displaydiv');

document.getElementById('header').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('Amount').value);
  const description = document.getElementById('Description').value;
  const date = document.getElementById('Date').value;
  const category = document.getElementById('dropbtn').value;

  const expense = {
    id: Date.now(), // unique ID for deletion
    amount: amount,
    description: description,
    date: date,
    category: category
  };

  expenses.push(expense);
  showExpenses();
  event.target.reset(); // clear form
});

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  showExpenses();
}

function showExpenses() {
  if (expenses.length === 0) {
    displayDiv.innerHTML = '<div class="empty-state">No expenses added yet. Start tracking your spending!</div>';
    return;
  }

  let list = "";
  let total = 0;
  
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    total += e.amount;
    const categoryClass = `category-${e.category.toLowerCase()}`;
    
    list += `
      <div class="expense-item">
        <div class="expense-header">
          <span class="expense-amount">₹${e.amount.toFixed(2)}</span>
          <button class="delete-btn" onclick="deleteExpense(${e.id})">Delete</button>
        </div>
        <div class="expense-description">${e.description}</div>
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
}

// ---------------- GOALS ----------------
let goals = [];
const displayDiv2 = document.getElementById('displaydiv2');

document.getElementById('header2').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('AmountToSave').value);
  const description = document.getElementById('DescriptionName').value;
  const date = document.getElementById('DateCompletion').value;

  const goal = {
    id: Date.now(), // unique ID for deletion
    amount: amount,
    description: description,
    date: date
  };

  goals.push(goal);
  showGoals();
  event.target.reset(); // clear form
});

function deleteGoal(id) {
  goals = goals.filter(goal => goal.id !== id);
  showGoals();
}

function getDaysUntilDate(targetDate) {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function showGoals() {
  if (goals.length === 0) {
    displayDiv2.innerHTML = '<div class="empty-state">No goals set yet. Create your first savings goal!</div>';
    return;
  }

  let list = "";
  
  for (let i = 0; i < goals.length; i++) {
    const g = goals[i];
    const daysLeft = getDaysUntilDate(g.date);
    const statusText = daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today!' : `${Math.abs(daysLeft)} days overdue`;
    const statusClass = daysLeft > 0 ? 'text-green-600' : daysLeft === 0 ? 'text-yellow-600' : 'text-red-600';
    
    list += `
      <div class="goal-item">
        <div class="goal-header">
          <span class="goal-amount">₹${g.amount.toFixed(2)}</span>
          <button class="delete-btn" onclick="deleteGoal(${g.id})">Delete</button>
        </div>
        <div class="goal-description">${g.description}</div>
        <div class="goal-date">
          Target: ${new Date(g.date).toLocaleDateString()} • ${statusText}
        </div>
      </div>
    `;
  }
  
  displayDiv2.innerHTML = list;
}
