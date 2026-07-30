import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css"; // Connect classes

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div>
      <nav className="navbar">
        <button onClick={handleLogout} className="btn-logout">
          Log Out
        </button>
      </nav>
      <Dashboard />
    </div>
  );
}
