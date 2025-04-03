window.onload = function () {
    class Transaction {
        constructor(amount, category, type, date) {
            this.amount = parseFloat(amount);
            this.category = category;
            this.type = type;
            this.date = date;
        }

        TransactionSummary() {
            return `${this.date} | ${this.type.toUpperCase()} | ${this.category} | $${this.amount}`;
        }
    }

    class BudgetTracker {
        constructor() {
            this.transactions = [];
            this.loadFromStorage();
        }

        addTransaction(transaction) {
            this.transactions.push(transaction);
            this.saveToStorage();
        }

        ShowTransactions() {
            const outputDiv = document.getElementById("transaction-output");
            outputDiv.innerHTML = "";
            this.transactions.forEach((tx) => {
                const p = document.createElement("p");
                p.textContent = tx.TransactionSummary();
                p.classList.add(tx.type); // income or expense
                outputDiv.appendChild(p);
            });
        }

        ShowIncomeTransactions() {
            return this.transactions
                .filter(tx => tx.type === "income")
                .reduce((sum, tx) => sum + tx.amount, 0);
        }

        ShowExpensesTransactions() {
            return this.transactions
                .filter(tx => tx.type === "expense")
                .reduce((sum, tx) => sum + tx.amount, 0);
        }

        showBalance() {
            return this.ShowIncomeTransactions() - this.ShowExpensesTransactions();
        }

        saveToStorage() {
            localStorage.setItem("transactions", JSON.stringify(this.transactions));
        }

        loadFromStorage() {
            const data = JSON.parse(localStorage.getItem("transactions"));
            if (data) {
                this.transactions = data.map(tx => new Transaction(tx.amount, tx.category, tx.type, tx.date));
            }
        }

        clearAll() {
            this.transactions = [];
            this.saveToStorage();
        }
    }

    const KatherineBudget = new BudgetTracker();

    KatherineBudget.ShowTransactions();
    updateSummary();

    document.getElementById("transaction-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const amount = document.getElementById("amount").value;
        const category = document.getElementById("category").value;
        const type = document.getElementById("type").value;
        const date = document.getElementById("date").value;

        const newTx = new Transaction(amount, category, type, date);
        KatherineBudget.addTransaction(newTx);
        KatherineBudget.ShowTransactions();
        updateSummary();
        this.reset();
    });

    document.getElementById("clear-btn").addEventListener("click", function () {
        if (confirm("Are you sure you want to clear all transactions?")) {
            KatherineBudget.clearAll();
            KatherineBudget.ShowTransactions();
            updateSummary();
        }
    });

    document.getElementById("download-btn").addEventListener("click", () => {
        if (KatherineBudget.transactions.length === 0) {
            alert("No transactions to download!");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,Date,Type,Category,Amount\n";

        KatherineBudget.transactions.forEach(tx => {
            csvContent += `${tx.date},${tx.type},${tx.category},${tx.amount}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "katherine_budget_tracker.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function updateSummary() {
        const summaryDiv = document.getElementById("summary");
        summaryDiv.innerHTML = `
            <h3>Summary 🐣</h3>
            <p>Total Income: <strong>$${KatherineBudget.ShowIncomeTransactions().toFixed(2)}</strong></p>
            <p>Total Expenses: <strong>$${KatherineBudget.ShowExpensesTransactions().toFixed(2)}</strong></p>
            <p>Current Balance: <strong>$${KatherineBudget.showBalance().toFixed(2)}</strong></p>
        `;
    }
};
