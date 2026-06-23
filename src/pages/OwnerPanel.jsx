import { useState, useEffect } from "react";
import OwnerLogin from "./owner/OwnerLogin";
import RingkasanKeuangan from "./owner/RingkasanKeuangan";
import GajiPelatihKaryawan from "./owner/GajiPelatihKaryawan";
import Analisis from "./owner/Analisis";
import { ownerApi } from "../utils/api";

const menus = [
  { id: "keuangan", label: "Ringkasan Keuangan", icon: "▪" },
  { id: "gaji", label: "Gaji Pelatih & Karyawan", icon: "▪" },
  { id: "analisis", label: "Analisis", icon: "▪" },
];

export default function OwnerPanel({ onBack }) {
  const [authState, setAuthState] = useState("checking"); // checking | in | out
  const [nama, setNama] = useState("");
  const [activePage, setActivePage] = useState("keuangan");

  useEffect(() => {
    const token = localStorage.getItem("owner_token");
    if (!token) { setAuthState("out"); return; }
    ownerApi.get("/auth/me")
      .then((res) => {
        if (res.user?.role === "owner") {
          setNama(res.user.nama || localStorage.getItem("owner_nama") || "Owner");
          setAuthState("in");
        } else {
          setAuthState("out");
        }
      })
      .catch(() => setAuthState("out"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("owner_token");
    localStorage.removeItem("owner_nama");
    setAuthState("out");
  };

  if (authState === "checking") {
    return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  }
  if (authState === "out") {
    return <OwnerLogin onLogin={(data) => { setNama(data.nama); setAuthState("in"); }} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "keuangan": return <RingkasanKeuangan />;
      case "gaji": return <GajiPelatihKaryawan />;
      case "analisis": return <Analisis />;
      default: return <RingkasanKeuangan />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>

      {/* Sidebar — gradasi gold/amber buat bedain dari Admin (biru-ungu) */}
      <aside style={{
        width: 220,
        background: "linear-gradient(180deg, #0a0a0a 0%, #3a2a10 50%, #8a6d1a 100%)",
        borderRight: "1px solid #2a2210",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: "20px 16px", background: "linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 40%, rgba(10,10,10,0.85) 55%, rgba(10,10,10,0.5) 70%, rgba(10,10,10,0.15) 88%, rgba(10,10,10,0) 100%)" }}>
          <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 100, objectFit: "contain", maxWidth: "100%" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#fff", marginTop: 6, textTransform: "uppercase" }}>Owner Portal</div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {menus.map(m => (
            <button key={m.id} onClick={() => setActivePage(m.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", margin: 0, borderRadius: 0,
                background: activePage === m.id ? "rgba(220,220,220,0.22)" : "none",
                boxShadow: activePage === m.id ? "0 2px 10px rgba(0,0,0,0.2)" : "none",
                border: "none",
                borderLeft: activePage === m.id ? "2px solid #ffd700" : "2px solid transparent",
                color: activePage === m.id ? "#ffd700" : "rgba(255,255,255,0.85)",
                textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                fontFamily: "var(--font-body)", fontWeight: activePage === m.id ? 600 : 400,
                fontSize: "0.825rem", cursor: "pointer", transition: "all 0.2s", textAlign: "left",
              }}
              onMouseOver={e => { if (activePage !== m.id) e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { if (activePage !== m.id) e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
            >
              <span style={{ fontSize: "0.6rem", color: activePage === m.id ? "#ffd700" : "rgba(255,255,255,0.6)" }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onBack}
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.5)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#FDECEF"; e.currentTarget.style.color = "#FDECEF"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
          >← Website</button>
          <button onClick={handleLogout}
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.5)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#f44336"; e.currentTarget.style.color = "#f44336"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
          >Keluar</button>
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: "28px 32px", minHeight: "100vh", background: "#f5f5f5" }}>
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>
              Abdominal Gym · Owner
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "#1a1a1a", letterSpacing: "-0.01em" }}>
              {menus.find(m => m.id === activePage)?.label}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#888" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}