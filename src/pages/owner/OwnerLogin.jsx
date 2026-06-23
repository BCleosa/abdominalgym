import { useState } from "react";
import { api } from "../../utils/api";

export default function OwnerLogin({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await api.post("/auth/login", form);
      if (data.role !== "owner") {
        setError("Akun ini bukan akun Owner.");
        setLoading(false);
        return;
      }
      localStorage.setItem("owner_token", data.token);
      localStorage.setItem("owner_nama", data.nama);
      onLogin(data);
    } catch (err) {
      setError(err.message || "Gagal login.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 100, objectFit: "contain", marginBottom: 16 }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#b8860b" }}>Owner Portal</div>
        </div>

        <div style={{ background: "#141414", border: "1px solid #2a2210", padding: "32px 28px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "#f0ede8", marginBottom: 24, letterSpacing: "-0.01em" }}>Masuk Owner</div>

          {error && (
            <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", padding: "10px 14px", marginBottom: 16, fontSize: "0.825rem", color: "#f44336" }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Username</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="Username"
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#b8860b"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
            </div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Password</label>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Password"
                type={show ? "text" : "password"}
                style={{ width: "100%", background: "#1a1a1a", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none", paddingRight: 80 }}
                onFocus={e => e.target.style.borderColor = "#b8860b"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: "absolute", right: 10, top: 30, background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                {show ? "sembunyikan" : "tampilkan"}
              </button>
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: "#b8860b", color: "#0a0a0a", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem", padding: "12px", border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Memproses..." : "Masuk →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}