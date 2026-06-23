import { useState, useEffect } from "react";
import PelatihLogin from "./pelatih/PelatihLogin";
import MemberList from "./pelatih/MemberList";
import { pelatihApi } from "../utils/api";

export default function PelatihPanel({ onBack }) {
  const [authState, setAuthState] = useState("checking");
  const [nama, setNama] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("pelatih_token");
    if (!token) { setAuthState("out"); return; }
    pelatihApi.get("/auth/me")
      .then(res => {
        if (res.user?.role === "pelatih") { setNama(res.user.nama || ""); setAuthState("in"); }
        else setAuthState("out");
      })
      .catch(() => setAuthState("out"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pelatih_token");
    localStorage.removeItem("pelatih_nama");
    setAuthState("out");
  };

  if (authState === "checking") return <div style={{ minHeight: "100vh", background: "#0a1a0a" }} />;
  if (authState === "out") return <PelatihLogin onLogin={d => { setNama(d.nama); setAuthState("in"); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#1a2e1a", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4caf50", marginBottom: 2 }}>Abdominal Gym</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>Portal Pelatih</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>{nama}</span>
          <button onClick={handleLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em", padding: "5px 10px", cursor: "pointer" }}>Keluar</button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <MemberList />
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, background: "#fff", borderTop: "1px solid #e0e0e0", padding: "10px 16px", display: "flex", justifyContent: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", cursor: "pointer" }}>← Kembali ke Website</button>
      </div>
    </div>
  );
}