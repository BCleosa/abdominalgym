import { useState, useEffect } from "react";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/firebase/AdminDashboard";
import MemberPage from "./admin/firebase/MemberPage";
import PelatihPage from "./admin/firebase/PelatihPage";
import KeuanganPage from "./admin/firebase/KeuanganPage";
import AbsenPage from "./admin/firebase/AbsenPage";
import StokPage from "./admin/firebase/StokPage";
import KehadiranPage from "./admin/firebase/KehadiranPage";

const menus = [
  { id: "dashboard", label: "Dashboard", icon: "▪" },
  { id: "member", label: "Data Member", icon: "▪" },
  { id: "kehadiran", label: "Kehadiran Member", icon: "▪" },
  { id: "pelatih", label: "Pelatih & Jadwal", icon: "▪" },
  { id: "absen", label: "Absen Karyawan", icon: "▪" },
  { id: "keuangan", label: "Keuangan", icon: "▪" },
  { id: "stok", label: "Stok Barang", icon: "▪" },
];

export default function AdminPanelFirebase({ onBack }) {
  const [isAuth, setIsAuth] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") setIsAuth(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuth(false);
  };

  if (!isAuth) return <AdminLogin onLogin={() => setIsAuth(true)} />;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <AdminDashboard />;
      case "member": return <MemberPage />;
      case "kehadiran": return <KehadiranPage />;
      case "pelatih": return <PelatihPage />;
      case "absen": return <AbsenPage />;
      case "keuangan": return <KeuanganPage />;
      case "stok": return <StokPage />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "linear-gradient(180deg, #0a0a0a 0%, #0D3870 100%)", borderRight: "1px solid #1e2a3a",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1e1e1e", background: "#111" }}>
          <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 100, objectFit: "contain", maxWidth: "100%" }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#FFFFF", marginTop: 6, textTransform: "uppercase" }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {menus.map(m => (
            <button key={m.id} onClick={() => setActivePage(m.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                background: activePage === m.id ? "#2a2a2a" : "none",
                border: "none",
                borderLeft: activePage === m.id ? "2px solid #fff" : "2px solid transparent",
                color: activePage === m.id ? "#ffffff" : "#666",
                fontFamily: "var(--font-body)", fontWeight: activePage === m.id ? 600 : 400,
                fontSize: "0.825rem", cursor: "pointer", transition: "all 0.2s", textAlign: "left",
              }}
              onMouseOver={e => { if (activePage !== m.id) e.currentTarget.style.color = "#aaa"; }}
              onMouseOut={e => { if (activePage !== m.id) e.currentTarget.style.color = "#666"; }}
            >
              <span style={{ fontSize: "0.6rem", color: activePage === m.id ? "#fff" : "#444" }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e1e1e", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onBack}
            style={{ background: "none", border: "1px solid #1e1e1e", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#aaa"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#555"; }}
          >← Website</button>
          <button onClick={handleLogout}
            style={{ background: "none", border: "1px solid #1e1e1e", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#f44336"; e.currentTarget.style.color = "#f44336"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#555"; }}
          >Keluar</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: "28px 32px", minHeight: "100vh", background: "#f5f5f5" }}>
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>
              Abdominal Gym · Admin
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