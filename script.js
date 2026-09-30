const STORAGE_KEY = "expenseTrackerTransactions";

const form = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");
const transactionCount = document.getElementById("transactionCount");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const clearAllBtn = document.getElementById("clearAllBtn");

let transactions = loadTransactions();

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2
  }).format(value);
}

function render() {
  const income = transactions
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = transactions
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  balanceEl.textContent = formatMoney(income - expense);
  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(expense);
  transactionCount.textContent = transactions.length;

  emptyState.style.display = transactions.length ? "none" : "block";
  transactionList.innerHTML = "";

  [...transactions].reverse().forEach(transaction => {
    const item = document.createElement("div");
    item.className = `transaction ${transaction.type}`;

    const sign = transaction.type === "income" ? "+" : "-";
    const icon = transaction.type === "income" ? "↑" : "↓";

    item.innerHTML = `
      <div class="transaction-icon">${icon}</div>
      <div class="transaction-info">
        <strong>${escapeHtml(transaction.description)}</strong>
        <span>${escapeHtml(transaction.category)} • ${transaction.date}</span>
      </div>
      <div class="transaction-amount">${sign}${formatMoney(transaction.amount)}</div>
      <button class="delete-btn" title="Delete transaction" aria-label="Delete transaction">×</button>
    `;

    item.querySelector(".delete-btn").addEventListener("click", () => {
      transactions = transactions.filter(t => t.id !== transaction.id);
      saveTransactions();
      render();
    });

    transactionList.appendChild(item);
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    alert("Please enter a valid description and amount.");
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
    type: typeInput.value,
    category: categoryInput.value,
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  });

  saveTransactions();
  render();

  form.reset();
  typeInput.value = "income";
  categoryInput.value = "Salary";
  descriptionInput.focus();
});

clearAllBtn.addEventListener("click", () => {
  if (!transactions.length) return;

  const confirmed = confirm("Delete all transactions?");
  if (!confirmed) return;

  transactions = [];
  saveTransactions();
  render();
});

render();
