import { useState, useEffect, useCallback } from "react";
import { request } from "./api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./App.css";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "EXPENSE",
    category: "",
    date: "",
  });

  // Budget threshold state
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem("monthly_budget_limit");
    return saved ? parseFloat(saved) : 5000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetLimit);

  // Active timeframe drop-down tracking states
  const currentLocalDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentLocalDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(
    currentLocalDate.getFullYear(),
  );

  const loadTransactions = useCallback(async () => {
    try {
      const data = await request("/api/transactions");
      setTransactions(data);
    } catch {
      alert(
        "Could not fetch the data. Please log out and sign back in to renew your token.",
      );
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await request("/api/transactions", "POST", form);
      setForm({
        description: "",
        amount: "",
        type: "EXPENSE",
        category: "",
        date: "",
      });
      loadTransactions();
    } catch {
      alert("Failed to save transaction");
    }
  };

  const handleDelete = async (id) => {
    try {
      await request(`/api/transactions/${id}`, "DELETE");
      loadTransactions();
    } catch {
      alert("Failed to delete transaction");
    }
  };

  const handleSaveBudget = () => {
    const parsedBudget = parseFloat(tempBudget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      alert("Please enter a valid budget amount");
      return;
    }
    setBudgetLimit(parsedBudget);
    localStorage.setItem("monthly_budget_limit", parsedBudget);
    setIsEditingBudget(false);
  };

  // EXPORTS WHICHEVER MONTH IS CURRENTLY CHOSEN ON THE DASHBOARD DROPDOWNS
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");

      // Attaches active state selections to target URL query string
      const targetUrl = `https://finance-tracker-backend-t6ks.onrender.com/api/transactions/export?month=${selectedMonth}&year=${selectedYear}`;

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed with status " + response.status);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.setAttribute(
        "download",
        `expenses_${selectedYear}_${selectedMonth}.csv`,
      );
      document.body.appendChild(link);

      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to securely export data: " + err.message);
    }
  };

  // Filter everything dynamically based on the dropdown selections
  const displayedTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const [year, month] = t.date.split("-");
    return (
      parseInt(month) === parseInt(selectedMonth) &&
      parseInt(year) === parseInt(selectedYear)
    );
  });

  const totalExpenses = displayedTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = displayedTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const pieData = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpenses },
  ];
  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Personal Finance Tracker</h1>

      {/* Contextual Timeframe Dropdowns Header Wrapper */}
      <div
        style={{
          display: "flex",
          justifycontent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
            margin: 0,
          }}
        >
          Dashboard
        </h3>

        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{ padding: "8px 12px", height: "auto" }}
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: "8px 12px", height: "auto" }}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      <div className="metrics-container">
        <div
          className="metric-card"
          style={{ borderLeft: "4px solid #3b82f6" }}
        >
          <p>Net Balance</p>
          <h2 style={{ color: netBalance >= 0 ? "#10b981" : "#ef4444" }}>
            ${netBalance.toFixed(2)}
          </h2>
        </div>
        <div
          className="metric-card"
          style={{ borderLeft: "4px solid #10b981" }}
        >
          <p>Total Income</p>
          <h2 style={{ color: "#10b981" }}>${totalIncome.toFixed(2)}</h2>
        </div>
        <div
          className="metric-card"
          style={{ borderLeft: "4px solid #ef4444", position: "relative" }}
        >
          <p>Total Expenses</p>
          <h2 style={{ color: "#ef4444" }}>${totalExpenses.toFixed(2)}</h2>

          <div
            style={{
              marginTop: "12px",
              paddingTop: "8px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            {isEditingBudget ? (
              <>
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "12px",
                    width: "90px",
                    height: "26px",
                  }}
                />
                <button
                  onClick={handleSaveBudget}
                  style={{
                    background: "var(--color-success)",
                    color: "white",
                    padding: "4px 8px",
                    fontSize: "11px",
                    borderRadius: "4px",
                  }}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Limit: ${budgetLimit}
                </span>
                <button
                  onClick={() => {
                    setTempBudget(budgetLimit);
                    setIsEditingBudget(true);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-main)",
                    padding: "4px 8px",
                    fontSize: "11px",
                    borderRadius: "4px",
                  }}
                >
                  Set Limit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {totalExpenses > budgetLimit && (
        <div className="budget-alert">
          <strong>Warning:</strong> Your expenses for this month have exceeded
          your dynamic threshold limit of ${budgetLimit}!
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Financial Structure Overview</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={45}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#151b2c",
                  borderColor: "#24304f",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Transaction Volumes</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={displayedTransactions}>
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#151b2c",
                  borderColor: "#24304f",
                  color: "#fff",
                }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="action-form">
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value === "" ? "" : parseFloat(e.target.value),
            })
          }
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <button type="submit" className="btn-add">
          Add Transaction
        </button>
        <button type="button" onClick={handleExport} className="btn-export">
          Export to CSV
        </button>
      </form>

      <div className="table-container">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td>{t.category}</td>
                <td
                  className={
                    t.type === "INCOME" ? "text-income" : "text-expense"
                  }
                  style={{ fontWeight: "600" }}
                >
                  {t.type}
                </td>
                <td style={{ fontWeight: "600" }}>${t.amount.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
