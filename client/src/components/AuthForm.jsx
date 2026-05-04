import { useState } from "react";
import { loginUser, registerUser } from "../api/authApi";

function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload =
        mode === "register"
          ? form
          : { email: form.email, password: form.password };
      const result =
        mode === "register"
          ? await registerUser(payload)
          : await loginUser(payload);
      onAuthSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <h1 className="app-title">Chat App</h1>
      <p className="muted">{mode === "login" ? "Welcome back" : "Create account"}</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
            required
          />
        ) : null}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          required
          minLength={6}
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <button
        type="button"
        className="link-button"
        onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
      >
        {mode === "login"
          ? "No account? Register"
          : "Already have an account? Login"}
      </button>
    </section>
  );
}

export default AuthForm;
