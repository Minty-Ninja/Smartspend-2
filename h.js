// ---------------- EXPENSES ----------------
let expenses = [];
const displayDiv = document.getElementById('displaydiv');

// Charts
let categoryChart = null;
let monthlyChart = null;
let dailyChart = null;

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
  updateCharts();
  updateStats();
  event.target.reset(); // clear form
});

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  showExpenses();
  updateCharts();
  updateStats();
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

// ---------------- CHARTS & ANALYTICS ----------------

function initCharts() {
  // Category Pie Chart
  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx) {
    categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 } }
          }
        }
      }
    });
  }

  // Monthly Line Chart
  const monthlyCtx = document.getElementById('monthlyChart');
  if (monthlyCtx) {
    monthlyChart = new Chart(monthlyCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Monthly Spending',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 10 } }
          },
          x: {
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  }

  // Daily Bar Chart
  const dailyCtx = document.getElementById('dailyChart');
  if (dailyCtx) {
    dailyChart = new Chart(dailyCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Daily Spending',
          data: [],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 10 } }
          },
          x: {
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  }
}

function updateCharts() {
  if (expenses.length === 0) {
    // Clear all charts
    if (categoryChart) {
      categoryChart.data.labels = [];
      categoryChart.data.datasets[0].data = [];
      categoryChart.update();
    }
    if (monthlyChart) {
      monthlyChart.data.labels = [];
      monthlyChart.data.datasets[0].data = [];
      monthlyChart.update();
    }
    if (dailyChart) {
      dailyChart.data.labels = [];
      dailyChart.data.datasets[0].data = [];
      dailyChart.update();
    }
    return;
  }

  updateCategoryChart();
  updateMonthlyChart();
  updateDailyChart();
}

function updateCategoryChart() {
  if (!categoryChart) return;

  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  categoryChart.data.labels = labels;
  categoryChart.data.datasets[0].data = data;
  categoryChart.update();
}

function updateMonthlyChart() {
  if (!monthlyChart) return;

  const monthlyTotals = {};
  expenses.forEach(expense => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
  });

  const labels = Object.keys(monthlyTotals).slice(-6); // Last 6 months
  const data = labels.map(label => monthlyTotals[label]);

  monthlyChart.data.labels = labels;
  monthlyChart.data.datasets[0].data = data;
  monthlyChart.update();
}

function updateDailyChart() {
  if (!dailyChart) return;

  const dailyTotals = {};
  const last7Days = [];
  const today = new Date();

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const displayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    last7Days.push({ date: dateStr, display: displayStr });
    dailyTotals[dateStr] = 0;
  }

  expenses.forEach(expense => {
    if (dailyTotals.hasOwnProperty(expense.date)) {
      dailyTotals[expense.date] += expense.amount;
    }
  });

  const labels = last7Days.map(day => day.display);
  const data = last7Days.map(day => dailyTotals[day.date]);

  dailyChart.data.labels = labels;
  dailyChart.data.datasets[0].data = data;
  dailyChart.update();
}

function updateStats() {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseCount = expenses.length;
  
  // Calculate average daily spending
  const uniqueDays = [...new Set(expenses.map(exp => exp.date))].length;
  const avgDaily = uniqueDays > 0 ? totalSpent / uniqueDays : 0;
  
  // Find highest spending category
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  const highestCategory = Object.keys(categoryTotals).reduce((a, b) => 
    categoryTotals[a] > categoryTotals[b] ? a : b, '-'
  );

  // Update DOM
  document.getElementById('totalSpent').textContent = `₹${totalSpent.toFixed(2)}`;
  document.getElementById('avgDaily').textContent = `₹${avgDaily.toFixed(2)}`;
  document.getElementById('highestCategory').textContent = highestCategory;
  document.getElementById('expenseCount').textContent = expenseCount;
}

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initCharts();
    updateCharts();
    updateStats();
  }, 100);
});
