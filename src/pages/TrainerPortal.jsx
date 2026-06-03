import { useState } from "react";
import TrainerSchedule from "./trainer/TrainerSchedule";

// Akun pelatih — password bisa diubah di sini
const TRAINER_ACCOUNTS = [
  { id: "tyo",   name: "Tyo",   password: "tyo123",   role: "Head Trainer",    color: "#5ba3d9" },
  { id: "elia",  name: "Elia",  password: "elia123",  role: "Personal Trainer", color: "#f48fb1" },
  { id: "indah", name: "Indah", password: "indah123", role: "Personal Trainer", color: "#a5d6a7" },
];

export default function TrainerPortal({ onBack }) {
  const [trainer, setTrainer] = useState(null);
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const found = TRAINER_ACCOUNTS.find(
      t => t.name.toLowerCase() === form.name.trim().toLowerCase() && t.password === form.password
    );
    if (found) {
      setTrainer(found);
      setError("");
    } else {
      setError("Nama atau password salah.");
    }
  };

  if (trainer) {
    return <TrainerSchedule trainer={trainer} onLogout={() => { setTrainer(null); setForm({ name: "", password: "" }); }} onBack={onBack} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <img src="/logo.jpg" alt="Abdominal Gym" style={{ height: 48, objectFit: "contain", marginBottom: 20 }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-mid)" }}>
            Portal Pelatih
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: "36px 32px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--white)", marginBottom: 6, letterSpacing: "-0.01em" }}>
            Masuk
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--gray-mid)", marginBottom: 28 }}>
            Kelola jadwal latihanmu
          </div>

          {error && (
            <div style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.25)", borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 20, fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "#f44336" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Nama Pelatih</label>
              <input
                className="form-input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Tyo / Elia / Indah"
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Password kamu"
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: "absolute", right: 12, top: 30, background: "none", border: "none", color: "var(--gray-mid)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
              >
                {showPass ? "sembunyikan" : "tampilkan"}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8, fontSize: "0.875rem" }}>
              Masuk →
            </button>
          </form>

          {/* Hint akun */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--gray-dark)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: 10 }}>Akun tersedia</div>
            <div style={{ display: "flex", gap: 8 }}>
              {TRAINER_ACCOUNTS.map(t => (
                <button key={t.id} onClick={() => setForm({ name: t.name, password: "" })}
                  style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: t.color, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.8rem", padding: "6px 14px", borderRadius: "var(--radius)", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = t.color}
                  onMouseOut={e => e.currentTarget.style.borderColor = "var(--gray-dark)"}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--gray-mid)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", cursor: "pointer", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "var(--white)"}
            onMouseOut={e => e.currentTarget.style.color = "var(--gray-mid)"}
          >
            ← Kembali ke website
          </button>
        </div>
      </div>
    </div>
  );
}
