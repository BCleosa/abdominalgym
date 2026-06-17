import { useState } from "react";
import MembersPage from "./admin/MembersPage";
import TrainersPage from "./admin/TrainersPage";
import SchedulePage from "./admin/SchedulePage";
import AttendancePage from "./admin/AttendancePage";
import FinancePage from "./admin/FinancePage";
import DashboardPage from "./admin/DashboardPage";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "members", label: "Data Member", icon: "👥" },
  { id: "trainers", label: "Data Pelatih", icon: "💪" },
  { id: "schedule", label: "Jadwal Kelas", icon: "📅" },
  { id: "attendance", label: "Absen Karyawan", icon: "✅" },
  { id: "finance", label: "Keuangan", icon: "💰" },
];

export default function AdminPanel({ onBack }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "members": return <MembersPage />;
      case "trainers": return <TrainersPage />;
      case "schedule": return <SchedulePage />;
      case "attendance": return <AttendancePage />;
      case "finance": return <FinancePage />;
      default: return <DashboardPage />;
    }
  };

  const activeNav = navItems.find(n => n.id === activePage);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--gray-dark)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "var(--accent)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--black)", fontFamily: "var(--font-display)" }}>IF</span>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.1em", color: "var(--white)" }}>IRON FORGE</div>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.55rem", letterSpacing: "0.25em", color: "var(--accent)" }}>ADMIN PANEL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                background: activePage === item.id ? "var(--dark3)" : "none",
                border: "none",
                borderLeft: activePage === item.id ? "3px solid var(--accent)" : "3px solid transparent",
                color: activePage === item.id ? "var(--white)" : "var(--gray-mid)",
                fontFamily: "var(--font-condensed)",
                fontWeight: activePage === item.id ? 700 : 400,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseOver={e => { if (activePage !== item.id) e.currentTarget.style.color = "var(--gray-light)"; }}
              onMouseOut={e => { if (activePage !== item.id) e.currentTarget.style.color = "var(--gray-mid)"; }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Back to site */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--gray-dark)" }}>
          <button onClick={onBack}
            style={{
              width: "100%",
              background: "none",
              border: "1px solid var(--gray-dark)",
              color: "var(--gray-mid)",
              fontFamily: "var(--font-condensed)",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "10px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "var(--gray-dark)"; e.currentTarget.style.color = "var(--gray-mid)"; }}
          >
            ← Kembali ke Website
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--gray-dark)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: 4 }}>Iron Forge Admin</div>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--white)" }}>
              {activeNav?.icon} {activeNav?.label}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.75rem", color: "var(--gray-mid)" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}
