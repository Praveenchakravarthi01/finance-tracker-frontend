import { useState } from "react";
import "./App.css"; // Connect classes

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? "/auth/signup" : "/auth/login";
    try {
      const response = await fetch(
        `https://finance-tracker-backend-t6ks.onrender.com/api${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      if (response.ok) {
        if (isSignUp) {
          alert("Registration successful! Please Log In.");
          setIsSignUp(false);
        } else {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          onLoginSuccess();
        }
      } else {
        alert("Authentication Failed");
      }
    } catch {
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? "Create an Account" : "Sign In"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-auth">
          {isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>
      <p onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle">
        {isSignUp
          ? "Already have an account? Sign In"
          : "Need an account? Register here"}
      </p>
    </div>
  );
}
