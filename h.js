// ---------------- EXPENSES ----------------
let expenses = [];
const displayDiv = document.getElementById('displaydiv');

document.getElementById('header').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = document.getElementById('Amount').value;
  const description = document.getElementById('Description').value;
  const date = document.getElementById('Date').value;
  const category = document.getElementById('dropbtn').value;

  const expense = {
    amount: amount,
    description: description,
    date: date,
    category: category
  };

  expenses.push(expense);
  showExpenses();
  event.target.reset(); // clear form
});

function showExpenses() {
  displayDiv.innerHTML = ""; 
  let list = "";
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    list += `You spent ₹${e.amount} on ${e.description} in ${e.category} on ${e.date}<br>`;
  }
  displayDiv.innerHTML = list;
}

// ---------------- GOALS ----------------
let goals = [];
const displayDiv2 = document.getElementById('displaydiv2');

document.getElementById('header2').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = document.getElementById('AmountToSave').value;
  const description = document.getElementById('DescriptionName').value;
  const date = document.getElementById('DateCompletion').value;

  const goal = {
    amount: amount,
    description: description,
    date: date
  };

  goals.push(goal);
  showGoals();
  event.target.reset(); // clear form
});

function showGoals() {
  displayDiv2.innerHTML = ""; 
  let list = "";
  for (let i = 0; i < goals.length; i++) {
    const g = goals[i];
    list += `You want to save ₹${g.amount} for ${g.description} by ${g.date}<br>`;
  }
  displayDiv2.innerHTML = list;
}
