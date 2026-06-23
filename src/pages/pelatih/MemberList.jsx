import { useState, useEffect } from "react";
import { pelatihApi } from "../../utils/api";
import { exportToExcel } from "../../utils/exportExcel";

const PAKET_COLORS = { trial: "#ff9800", "8x": "#1565c0", "12x": "#6a1b9a", "16x": "#c62828" };
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const formatTgl = (tgl) => {
  if (!tgl) return "-";
  const d = new Date(tgl);
  return `${HARI[d.getDay()]}, ${d.toLocaleDateString("id-ID", { day:"numeric", month:"short" })}`;
};

export default function MemberList() {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [expandedTab, setExpandedTab] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [programData, setProgramData] = useState({});
  const [programLoading, setProgramLoading] = useState({});
  const [requestModal, setRequestModal] = useState(null);
  const [requestForm, setRequestForm] = useState({ tanggal: new Date().toISOString().split("T")[0] });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  const fetchData = async () => {
    try {
      const [res, pend] = await Promise.all([
        pelatihApi.get("/portal/pelatih/members"),
        pelatihApi.get("/portal/pelatih/pending-sesi"),
      ]);
      setData(res);
      setPending(pend);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const loadProgram = async (member) => {
    if (programData[member]) return;
    setProgramLoading(p => ({ ...p, [member]: true }));
    try {
      const res = await pelatihApi.get(`/portal/pelatih/program?member=${encodeURIComponent(member)}`);
      setProgramData(p => ({ ...p, [member]: { content: res.content || "", saved: res.content || "" } }));
    } catch { setProgramData(p => ({ ...p, [member]: { content: "", saved: "" } })); }
    setProgramLoading(p => ({ ...p, [member]: false }));
  };

  const saveProgram = async (member) => {
    setProgramLoading(p => ({ ...p, [member]: true }));
    try {
      await pelatihApi.post("/portal/pelatih/program", { member, content: programData[member]?.content || "" });
      setProgramData(p => ({ ...p, [member]: { ...p[member], saved: p[member]?.content } }));
    } catch (err) { alert("Gagal menyimpan program: " + err.message); }
    setProgramLoading(p => ({ ...p, [member]: false }));
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setRequestLoading(true); setRequestError("");
    try {
      await pelatihApi.post("/portal/pelatih/request-sesi", { member: requestModal.member, tanggal: requestForm.tanggal });
      setRequestModal(null);
      fetchData();
    } catch (err) { setRequestError(err.message); }
    setRequestLoading(false);
  };

  const handleExport = () => {
    const rows = (data?.members || []).map(m => ({
      "Member": m.member, "Paket": m.paketLabel, "Sesi Selesai": m.completed,
      "Total Sesi": m.total, "Status": m.habis ? "Habis" : m.hampirHabis ? "Sisa 1" : "Aktif",
      "Tanggal Terakhir": m.tanggalTerakhir || "-",
    }));
    exportToExcel(rows, "Data_Member_Pelatih", "Member");
  };

  if (loading && !data) return <div style={{ padding: 40, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Memuat data member...</div>;
  if (error) return <div style={{ padding: 20, color: "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{error}</div>;

  const allMembers = data?.members || [];
  const habisCount = allMembers.filter(m => m.habis).length;
  const hampirCount = allMembers.filter(m => m.hampirHabis && !m.habis).length;
  const pendingCount = pending.filter(p => p.status === "pending").length;

  const sorted = [
    ...allMembers.filter(m => !m.habis && !m.hampirHabis),
    ...allMembers.filter(m => m.hampirHabis && !m.habis),
    ...allMembers.filter(m => m.habis),
  ];

  const members = sorted.filter(m => {
    const matchSearch = !search || m.member.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "semua" ? true : filterStatus === "habis" ? m.habis : filterStatus === "hampir" ? (m.hampirHabis && !m.habis) : filterStatus === "aktif" ? (!m.habis && !m.hampirHabis) : true;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ paddingBottom: 80 }}>
      {pendingCount > 0 && (
        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", padding: "10px 16px", marginBottom: 10, fontSize: "0.8rem", color: "#f57f17", fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⏳ {pendingCount} sesi menunggu persetujuan admin</span>
        </div>
      )}

      {!bannerDismissed && (habisCount > 0 || hampirCount > 0) && (
        <div style={{ background: habisCount > 0 ? "#fff5f5" : "#fffde7", border: `1px solid ${habisCount > 0 ? "#ffcdd2" : "#fff59d"}`, padding: "10px 16px", marginBottom: 10, fontSize: "0.8rem", color: habisCount > 0 ? "#c62828" : "#f57f17", fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            {habisCount > 0 && <span>⚠ {habisCount} member paket habis</span>}
            {habisCount > 0 && hampirCount > 0 && <span> · </span>}
            {hampirCount > 0 && <span>⚡ {hampirCount} member sisa 1 sesi</span>}
          </span>
          <button onClick={() => setBannerDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "1rem", padding: "0 4px" }}>✕</button>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama member..."
        style={{ width: "100%", background: "#fff", border: "1px solid #e0e0e0", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.9rem", padding: "12px 16px", outline: "none", marginBottom: 10, boxSizing: "border-box" }} />

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "semua", label: `Semua (${allMembers.length})` },
            { id: "aktif", label: `Aktif (${allMembers.filter(m => !m.habis && !m.hampirHabis).length})` },
            { id: "hampir", label: `Sisa 1 (${hampirCount})`, color: "#f57f17" },
            { id: "habis", label: `Habis (${habisCount})`, color: "#c62828" },
          ].map(f => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              style={{ padding: "6px 14px", background: filterStatus === f.id ? (f.color || "#1a1a1a") : "#fff", color: filterStatus === f.id ? "#fff" : (f.color || "#555"), border: `1px solid ${f.color || "#ddd"}`, fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: filterStatus === f.id ? 700 : 400, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={handleExport} style={{ background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "6px 14px", cursor: "pointer" }}>Export Excel</button>
      </div>

      {pending.length > 0 && filterStatus === "semua" && !search && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 14, marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 10 }}>Riwayat Pengajuan Sesi</div>
          {pending.slice(0, 5).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "0.8rem" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{p.member}</span>
                <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.68rem", marginLeft: 8 }}>{formatTgl(p.tanggal)}</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", padding: "2px 8px", background: p.status === "pending" ? "#fff8e1" : p.status === "approved" ? "#e8f5e9" : "#ffebee", color: p.status === "pending" ? "#f57f17" : p.status === "approved" ? "#2e7d32" : "#c62828", border: `1px solid ${p.status === "pending" ? "#ffe082" : p.status === "approved" ? "#a5d6a7" : "#ffcdd2"}` }}>
                {p.status === "pending" ? "Menunggu" : p.status === "approved" ? "Disetujui" : "Ditolak"}
              </span>
            </div>
          ))}
        </div>
      )}

      {loading && <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>Memuat ulang...</div>}
      {!loading && members.length === 0 && <p style={{ textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem", padding: 40 }}>Tidak ada member</p>}

      {members.map(m => {
        const isExpanded = expanded === m.member;
        const activeTab = expandedTab[m.member] || "sesi";
        const accentColor = m.habis ? "#e0e0e0" : m.hampirHabis ? "#f57f17" : "#2e7d32";
        const pct = m.total > 0 ? (m.completed / m.total) * 100 : 0;
        const memberPending = pending.filter(p => p.member === m.member && p.status === "pending");

        return (
          <div key={m.member} style={{ background: "#fff", border: "1px solid #e0e0e0", borderLeft: `4px solid ${accentColor}`, marginBottom: 10, opacity: m.habis ? 0.75 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 0" }}>
              <button onClick={() => { setExpanded(isExpanded ? null : m.member); if (!isExpanded && programData[m.member] === undefined) loadProgram(m.member); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1rem", color: m.habis ? "#aaa" : "#1a1a1a", marginBottom: 4 }}>{m.member}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: m.habis ? "#aaa" : (PAKET_COLORS[m.paket] || "#888"), background: "#f5f5f5", padding: "2px 8px" }}>{m.paketLabel}</span>
                    {m.habis && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#fff", background: "#bbb", padding: "2px 8px" }}>HABIS</span>}
                    {m.hampirHabis && !m.habis && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#fff", background: "#f57f17", padding: "2px 8px" }}>SISA 1</span>}
                    {memberPending.length > 0 && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#f57f17", background: "#fff8e1", border: "1px solid #ffe082", padding: "2px 8px" }}>⏳ menunggu</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: accentColor }}>{m.completed}/{m.total}</span>
                  <span style={{ color: "#aaa", fontSize: "0.7rem" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {!m.habis && memberPending.length === 0 && (
                <button onClick={() => { setRequestModal(m); setRequestForm({ tanggal: new Date().toISOString().split("T")[0] }); setRequestError(""); }}
                  style={{ marginLeft: 12, background: "#2e7d32", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.75rem", padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  ✓ Ajukan Sesi
                </button>
              )}
            </div>

            <div style={{ height: 4, background: "#f0f0f0", margin: "12px 16px" }}>
              <div style={{ height: 4, background: accentColor, width: `${Math.min(pct, 100)}%`, transition: "width 0.3s" }} />
            </div>

            {isExpanded && (
              <div style={{ borderTop: "1px solid #f5f5f5" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
                  {["sesi", "program"].map(tab => (
                    <button key={tab} onClick={() => setExpandedTab(p => ({ ...p, [m.member]: tab }))}
                      style={{ flex: 1, background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #1a1a1a" : "2px solid transparent", padding: "8px 0", fontFamily: "var(--font-body)", fontWeight: activeTab === tab ? 600 : 400, fontSize: "0.8rem", color: activeTab === tab ? "#1a1a1a" : "#888", cursor: "pointer" }}>
                      {tab === "sesi" ? "Riwayat Sesi" : "Program Latihan"}
                    </button>
                  ))}
                </div>

                {activeTab === "sesi" && (
                  <div style={{ padding: "12px 16px 16px" }}>
                    {m.sesiList.length === 0 ? (
                      <p style={{ color: "#aaa", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>Belum ada sesi dicatat</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[...m.sesiList].sort((a, b) => {
                          const da = new Date(a.tanggal); const db2 = new Date(b.tanggal);
                          const dayA = da.getDay() === 0 ? 7 : da.getDay();
                          const dayB = db2.getDay() === 0 ? 7 : db2.getDay();
                          return dayA - dayB || a.tanggal.localeCompare(b.tanggal);
                        }).map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 24, height: 24, minWidth: 24, background: "#e8f5e9", border: "1px solid #a5d6a7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#2e7d32", fontWeight: 700 }}>{i + 1}</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888" }}>{formatTgl(s.tanggal)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.habis && <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff5f5", border: "1px solid #ffcdd2", fontSize: "0.8rem", color: "#c62828" }}>⚠ Paket habis — ingatkan member untuk perpanjang lewat Admin.</div>}
                  </div>
                )}

                {activeTab === "program" && (
                  <div style={{ padding: "12px 16px 16px" }}>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Program Latihan</label>
                    {programLoading[m.member] ? (
                      <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>Memuat...</p>
                    ) : (
                      <>
                        <textarea value={programData[m.member]?.content || ""} onChange={e => setProgramData(p => ({ ...p, [m.member]: { ...p[m.member], content: e.target.value } }))}
                          placeholder="Tulis program latihan untuk member ini..." rows={5}
                          style={{ width: "100%", background: "#f9f9f9", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 12px", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                          onFocus={e => e.target.style.borderColor="#888"} onBlur={e => e.target.style.borderColor="#ddd"} />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                          <button onClick={() => saveProgram(m.member)} disabled={programLoading[m.member]}
                            style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}>
                            {programLoading[m.member] ? "Menyimpan..." : "Simpan Program"}
                          </button>
                        </div>
                        {programData[m.member]?.saved && programData[m.member]?.saved === programData[m.member]?.content && (
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#2e7d32", marginTop: 4 }}>✓ Tersimpan</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal Ajukan Sesi */}
      {requestModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setRequestModal(null); }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 600, padding: 24, paddingBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 4 }}>Ajukan Sesi Latihan</div>
            <p style={{ fontSize: "0.825rem", color: "#888", marginBottom: 4 }}>{requestModal.member} · {requestModal.paketLabel} · Sesi ke-{requestModal.completed + 1} dari {requestModal.total}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#f57f17", marginBottom: 16 }}>⏳ Perlu persetujuan admin sebelum dicatat resmi.</p>
            <form onSubmit={handleRequest}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 6 }}>Tanggal Sesi</label>
                <input type="date" value={requestForm.tanggal} onChange={e => setRequestForm({ tanggal: e.target.value })}
                  style={{ width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.9rem", padding: "12px 14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              {requestError && <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 14, fontSize: "0.8rem", color: "#c62828" }}>{requestError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setRequestModal(null)}
                  style={{ flex: 1, background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "12px", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={requestLoading}
                  style={{ flex: 2, background: "#2e7d32", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem", padding: "12px", cursor: requestLoading ? "default" : "pointer", opacity: requestLoading ? 0.6 : 1 }}>
                  {requestLoading ? "Mengajukan..." : "Ajukan ke Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}