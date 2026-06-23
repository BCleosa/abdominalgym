import { useState, useEffect } from "react";
import MemberLogin from "./member/MemberLogin";
import MemberDashboard from "./member/MemberDashboard";
import { memberApi } from "../utils/api";

export default function MemberPanel({ onBack }) {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("member_token");
    if (!token) { setAuthState("out"); return; }
    memberApi.get("/auth/me")
      .then(res => {
        if (res.user?.role === "member") { setUser(res.user); setAuthState("in"); }
        else setAuthState("out");
      })
      .catch(() => setAuthState("out"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("member_token");
    localStorage.removeItem("member_nama");
    setAuthState("out");
    setUser(null);
  };

  if (authState === "checking") return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  if (authState === "out") return <MemberLogin onLogin={d => { setUser(d); setAuthState("in"); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "#1a1a1a", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ width: 80 }} />
        <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 100, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "rgba(255,255,255,0.5)" }}>{user?.nama}</span>
          <button onClick={handleLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)", fontSize: "0.58rem", padding: "5px 8px", cursor: "pointer" }}>Keluar</button>
        </div>
      </div>

      <MemberDashboard />

      <div style={{ padding: "20px 16px", textAlign: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", cursor: "pointer" }}>← Kembali ke Website</button>
      </div>
    </div>
  );
}