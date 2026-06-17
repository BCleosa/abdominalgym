import { useState } from "react";

const ADMIN_USER = "admin";
const ADMIN_PASS = "abdominal2024";

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.user === ADMIN_USER && form.pass === ADMIN_PASS) {
      localStorage.setItem("admin_auth", "true");
      onLogin();
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 48, objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#444" }}>Admin Panel</div>
        </div>

        <div style={{ background: "#141414", border: "1px solid #222", padding: "32px 28px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "#f0ede8", marginBottom: 24, letterSpacing: "-0.01em" }}>Masuk Admin</div>

          {error && (
            <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", padding: "10px 14px", marginBottom: 16, fontSize: "0.825rem", color: "#f44336" }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Username</label>
              <input value={form.user} onChange={e => setForm({...form, user: e.target.value})} required placeholder="Username"
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#555"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
            </div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Password</label>
              <input value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} required placeholder="Password"
                type={show ? "text" : "password"}
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none", paddingRight: 80 }}
                onFocus={e => e.target.style.borderColor = "#555"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: "absolute", right: 10, top: 30, background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                {show ? "sembunyikan" : "tampilkan"}
              </button>
            </div>
            <button type="submit" style={{ width: "100%", background: "#fff", color: "#080808", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem", padding: "12px", border: "none", cursor: "pointer" }}>
              Masuk →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}