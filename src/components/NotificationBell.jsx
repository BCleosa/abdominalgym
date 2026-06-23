import { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";

export default function NotificationBell() {
  const [checkin, setCheckin] = useState({ count: 0, items: [] });
  const [expiring, setExpiring] = useState({ expiredCount: 0, expiringSoonCount: 0, items: [] });
  const [ptHabis, setPtHabis] = useState({ habisCount: 0, hampirHabisCount: 0, items: [] });
  const [pendingSesi, setPendingSesi] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const fetchNotif = async () => {
    try { const r = await api.get("/kehadiran/notifikasi"); setCheckin(r); } catch {}
    try { const r = await api.get("/member/notifikasi-expired"); setExpiring(r); } catch {}
    try { const r = await api.get("/pelatih/notifikasi-habis"); setPtHabis(r); } catch {}
    try { const r = await api.get("/pelatih/pending"); setPendingSesi(r || []); } catch {}
  };

  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const pendingCount = pendingSesi.length;
  const totalCount = checkin.count + expiring.expiredCount + expiring.expiringSoonCount + ptHabis.habisCount + ptHabis.hampirHabisCount + pendingCount;

  const handleOpen = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && checkin.count > 0) {
      try { await api.post("/kehadiran/notifikasi/baca", {}); setCheckin(p => ({ ...p, count: 0 })); } catch {}
    }
  };

  const approve = async (id) => {
    try { await api.post(`/pelatih/pending/${id}/approve`); fetchNotif(); } catch (err) { alert(err.message); }
  };
  const reject = async (id) => {
    const alasan = prompt("Alasan penolakan (opsional):") || "";
    try { await api.post(`/pelatih/pending/${id}/reject`, { alasan }); fetchNotif(); } catch (err) { alert(err.message); }
  };

  const SectionHeader = ({ label, count, countBg, countColor, countBorder }) => (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: count > 0 ? countColor : "#888", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{label}</span>
      {count > 0 && <span style={{ background: countBg, color: countColor, border: `1px solid ${countBorder}`, padding: "1px 8px", borderRadius: 10, fontSize: "0.6rem", fontWeight: 700 }}>{count}</span>}
    </div>
  );

  const Empty = ({ msg }) => <p style={{ padding: "14px 16px", color: "#aaa", fontSize: "0.78rem" }}>{msg}</p>;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button onClick={handleOpen} style={{ position: "relative", background: "none", border: "1px solid #ddd", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {totalCount > 0 && (
          <span style={{ position: "absolute", top: -2, right: -2, background: pendingCount > 0 ? "#f57f17" : "#e53935", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: 44, right: 0, width: 360, maxHeight: 520, overflowY: "auto", background: "#fff", border: "1px solid #e0e0e0", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200 }}>

          {/* 1. Konfirmasi Sesi Pelatih */}
          <SectionHeader label="Konfirmasi Sesi Pelatih" count={pendingCount} countBg="#fff8e1" countColor="#f57f17" countBorder="#ffe082" />
          {pendingSesi.length === 0 ? <Empty msg="Tidak ada sesi yang perlu dikonfirmasi." /> :
            pendingSesi.map(p => (
              <div key={p.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5", background: "#fffdf5" }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>{p.pelatih}</span>
                  <span style={{ color: "#aaa", margin: "0 5px" }}>→</span>
                  <span style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>{p.member}</span>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#888", marginTop: 2 }}>{p.paket} · {p.tanggal}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => approve(p.id)} style={{ flex: 1, background: "#2e7d32", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.72rem", padding: "6px", cursor: "pointer" }}>✓ Setujui</button>
                  <button onClick={() => reject(p.id)} style={{ flex: 1, background: "#fff", color: "#c62828", border: "1px solid #ffcdd2", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.72rem", padding: "6px", cursor: "pointer" }}>✕ Tolak</button>
                </div>
              </div>
            ))
          }

          {/* 2. Check-in Member */}
          <SectionHeader label="Check-in Member" count={checkin.count} countBg="#e3f2fd" countColor="#1565c0" countBorder="#90caf9" />
          {checkin.items.length === 0 ? <Empty msg="Belum ada check-in hari ini." /> :
            checkin.items.map(item => (
              <div key={item.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>{item.namaMember}</span>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#fff", background: item.method === "scan" ? "#1565c0" : "#555", padding: "1px 6px", borderRadius: 3 }}>
                      {item.method === "scan" ? "QR Scan" : "Manual"}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#aaa" }}>{item.waktu}</span>
                  </div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{item.tanggal}</div>
              </div>
            ))
          }

          {/* 3. Member Akan/Sudah Habis */}
          <SectionHeader label="Member Akan / Sudah Habis" count={expiring.expiredCount + expiring.expiringSoonCount} countBg="#ffebee" countColor="#c62828" countBorder="#ffcdd2" />
          {expiring.items.length === 0 ? <Empty msg="Tidak ada member yang mau habis dalam 3 hari." /> :
            expiring.items.map(item => (
              <div key={item.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>{item.nama}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 700, color: item.sudahHabis ? "#c62828" : "#f57f17", background: item.sudahHabis ? "#ffebee" : "#fff8e1", padding: "2px 7px", borderRadius: 2 }}>
                    {item.sudahHabis ? `Habis ${Math.abs(item.diffDays)}h lalu` : item.diffDays === 0 ? "Habis hari ini" : `${item.diffDays}h lagi`}
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{item.paket} · s/d {item.tanggalAkhir}</div>
              </div>
            ))
          }

          {/* 4. Sesi PT Akan/Sudah Habis */}
          <SectionHeader label="Sesi PT Akan / Sudah Habis" count={ptHabis.habisCount + ptHabis.hampirHabisCount} countBg="#fff8e1" countColor="#f57f17" countBorder="#ffe082" />
          {ptHabis.items.length === 0 ? <Empty msg="Tidak ada sesi PT yang mau habis." /> :
            ptHabis.items.map((item, i) => (
              <div key={`${item.pelatih}-${item.member}-${i}`} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.825rem", color: "#1a1a1a" }}>{item.member}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 700, color: item.sudahHabis ? "#c62828" : "#f57f17", background: item.sudahHabis ? "#ffebee" : "#fff8e1", padding: "2px 7px", borderRadius: 2 }}>
                    {item.sudahHabis ? "Sudah habis" : `Sisa ${item.sisa} sesi`}
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>Pelatih {item.pelatih} · {item.paket} ({item.completed}/{item.total})</div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}