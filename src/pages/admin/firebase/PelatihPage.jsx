import { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import { exportToExcel } from "../../../utils/exportExcel";

const pelatihList = ["Tyo", "Elia", "Indah"];
const paketPTOptions = [
  { value: "trial", label: "1x Trial (150rb)", total: 1 },
  { value: "8x", label: "8x Coaching (600rb)", total: 8 },
  { value: "12x", label: "12x Coaching (800rb)", total: 12 },
  { value: "16x", label: "16x Coaching (1000rb)", total: 16 },
];
const emptySesiForm = { pelatih: "Tyo", member: "", paket: "8x", tanggal: new Date().toISOString().split("T")[0], catatan: "" };

const formatTgl = (tgl) => tgl ? tgl.slice(5).split("-").reverse().join("/") : "";
const normKey = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const toTitleCase = (s) => (s || "").trim().replace(/\s+/g, " ").split(" ").map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(" ");

export default function PelatihPage() {
  const [sesi, setSesi] = useState([]);
  const [pendingSesi, setPendingSesi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSesiForm, setShowSesiForm] = useState(false);
  const [sesiForm, setSesiForm] = useState(emptySesiForm);
  const [activeTab, setActiveTab] = useState("sesi");
  const [selected, setSelected] = useState(new Set());
  const [searchSesi, setSearchSesi] = useState("");
  const [searchKeseluruhan, setSearchKeseluruhan] = useState("");
  const [expandedPelatih, setExpandedPelatih] = useState(new Set());
  const [sisaInfo, setSisaInfo] = useState(null);
  const [cekLoading, setCekLoading] = useState(false);
  const [showPerpanjangModal, setShowPerpanjangModal] = useState(false);
  const [perpanjangPaket, setPerpanjangPaket] = useState("8x");
  const [perpanjangLoading, setPerpanjangLoading] = useState(false);
  const [justHabis, setJustHabis] = useState(false);

  const toggleExpandPelatih = (p) => {
    setExpandedPelatih(prev => { const next = new Set(prev); next.has(p) ? next.delete(p) : next.add(p); return next; });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, pend] = await Promise.all([api.get("/pelatih"), api.get("/pelatih/pending")]);
      setSesi(data); setPendingSesi(pend);
    } catch (err) { alert("Gagal memuat data: " + err.message); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const cekSisa = async (pelatih, member) => {
    if (!pelatih || !member.trim()) { setSisaInfo(null); return; }
    setCekLoading(true);
    try { const data = await api.get(`/pelatih/cek-sisa?pelatih=${encodeURIComponent(pelatih)}&member=${encodeURIComponent(member.trim())}`); setSisaInfo(data); }
    catch { setSisaInfo(null); }
    setCekLoading(false);
  };

  const handleSesiSubmit = async (e) => {
    e.preventDefault();
    if (sisaInfo?.habis) { setShowPerpanjangModal(true); return; }
    try {
      await api.post("/pelatih", sesiForm);
      const updatedSisa = await api.get(`/pelatih/cek-sisa?pelatih=${encodeURIComponent(sesiForm.pelatih)}&member=${encodeURIComponent(sesiForm.member.trim())}`);
      setSisaInfo(updatedSisa);
      if (updatedSisa?.habis) { setShowSesiForm(false); setSesiForm(emptySesiForm); setJustHabis(true); setShowPerpanjangModal(true); }
      else { setShowSesiForm(false); setSesiForm(emptySesiForm); setSisaInfo(null); }
      fetchData();
    } catch (err) { alert("Gagal menyimpan sesi latihan: " + err.message); }
  };

  const handlePerpanjang = async () => {
    setPerpanjangLoading(true);
    try {
      await api.post("/pelatih/perpanjang", { pelatih: justHabis ? sisaInfo?.pelatih || sesiForm.pelatih : sesiForm.pelatih, member: justHabis ? sisaInfo?.member || sesiForm.member : sesiForm.member, paket: perpanjangPaket });
      setShowPerpanjangModal(false); setJustHabis(false);
      setSesiForm(p => ({ ...p, paket: perpanjangPaket }));
      await cekSisa(sesiForm.pelatih, sesiForm.member); fetchData();
    } catch (err) { alert("Gagal perpanjang paket: " + err.message); }
    setPerpanjangLoading(false);
  };

  const inputStyle = { width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };
  const labelStyle = { display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 5 };
  const exportBtnStyle = { background: "#fff", border: "1px solid #ddd", color: "#555", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", padding: "9px 16px", cursor: "pointer" };
  const addBtnStyle = { background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" };
  const searchInputStyle = { background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.825rem", padding: "8px 12px", outline: "none", width: 220 };

  const sesiFiltered = sesi.filter(s => !searchSesi || normKey(s.member).includes(normKey(searchSesi)));

  const grouped = {};
  pelatihList.forEach(p => { grouped[p] = {}; });
  sesi.forEach(s => {
    if (!grouped[s.pelatih]) grouped[s.pelatih] = {};
    const key = normKey(s.member);
    if (!key) return;
    if (!grouped[s.pelatih][key]) grouped[s.pelatih][key] = { displayName: toTitleCase(s.member), entries: [] };
    grouped[s.pelatih][key].entries.push(s);
  });

  const toggleSelect = (id) => { setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const toggleSelectAll = () => { setSelected(prev => prev.size === sesiFiltered.length ? new Set() : new Set(sesiFiltered.map(s => s.id))); };

  const getCycleInfo = (rawEntries) => {
    const entries = [...rawEntries].sort((a, b) => {
      const ta = a.createdAt?._seconds ?? (typeof a.createdAt === "string" ? new Date(a.createdAt).getTime()/1000 : 0);
      const tb = b.createdAt?._seconds ?? (typeof b.createdAt === "string" ? new Date(b.createdAt).getTime()/1000 : 0);
      return ta - tb;
    });
    let cycleStart = 0; let currentPaket = entries[entries.length-1]?.paket || "8x";
    for (let i = entries.length-1; i >= 0; i--) { if (entries[i].placeholder) { cycleStart = i; currentPaket = entries[i].paket || "8x"; break; } }
    const cycleEntries = entries.slice(cycleStart);
    const paketInfo = paketPTOptions.find(o => o.value === currentPaket) || paketPTOptions[1];
    return { paketInfo, total: paketInfo.total, slice: cycleEntries.filter(e => !e.placeholder) };
  };

  const handleExport = () => {
    if (activeTab === "sesi") {
      const source = selected.size > 0 ? sesiFiltered.filter(s => selected.has(s.id)) : sesiFiltered;
      exportToExcel(source.map(s => ({ "Tanggal": s.tanggal, "Pelatih": s.pelatih, "Member": toTitleCase(s.member), "Paket": paketPTOptions.find(o => o.value === s.paket)?.label || s.paket || "-", "Catatan": s.catatan || "" })), "Sesi_Latihan", "Sesi");
    } else {
      const rows = [];
      pelatihList.forEach(p => {
        Object.values(grouped[p] || {}).forEach(({ displayName, entries: rawEntries }) => {
          if (searchKeseluruhan && !normKey(displayName).includes(normKey(searchKeseluruhan))) return;
          const { paketInfo, total, slice } = getCycleInfo(rawEntries);
          rows.push({ "Pelatih": p, "Member": displayName, "Paket": paketInfo.label, "Sesi Selesai": slice.length, "Total Sesi": total, "Tanggal Terakhir": slice[slice.length-1]?.tanggal || "-" });
        });
      });
      exportToExcel(rows, "Data_Keseluruhan_Pelatih", "Keseluruhan");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e1e1e", marginBottom: 16 }}>
        {[["sesi", "Sesi Latihan"], ["keseluruhan", "Data Keseluruhan"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ background: "none", border: "none", borderBottom: activeTab===id?"2px solid #1a1a1a":"2px solid transparent", padding: "8px 18px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab===id?600:400, fontSize: "0.85rem", color: activeTab===id?"#1a1a1a":"#888", cursor: "pointer", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "sesi" && (
        <div>
          {/* Panel Konfirmasi Sesi Pending */}
          {pendingSesi.length > 0 && (
            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", padding: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: "#1a1a1a", marginBottom: 12 }}>
                ⏳ Konfirmasi Sesi dari Pelatih ({pendingSesi.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendingSesi.map(p => (
                  <div key={p.id} style={{ background: "#fff", border: "1px solid #ffe082", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.875rem" }}>{p.pelatih}</span>
                      <span style={{ color: "#888", margin: "0 6px" }}>→</span>
                      <span style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.875rem" }}>{p.member}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888", marginLeft: 8 }}>{p.paket} · {p.tanggal}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={async () => { try { await api.post(`/pelatih/pending/${p.id}/approve`); fetchData(); } catch (err) { alert(err.message); } }}
                        style={{ background: "#2e7d32", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.75rem", padding: "6px 14px", cursor: "pointer" }}>✓ Setujui</button>
                      <button onClick={async () => { const alasan = prompt("Alasan penolakan (opsional):") || ""; try { await api.post(`/pelatih/pending/${p.id}/reject`, { alasan }); fetchData(); } catch (err) { alert(err.message); } }}
                        style={{ background: "#c62828", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.75rem", padding: "6px 14px", cursor: "pointer" }}>✕ Tolak</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <input value={searchSesi} onChange={e => setSearchSesi(e.target.value)} placeholder="🔍 Cari nama member..." style={searchInputStyle} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {selected.size > 0 && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#1565c0" }}>{selected.size} dipilih</span>}
              <button onClick={handleExport} style={exportBtnStyle}>Export Excel</button>
              <button onClick={fetchData} style={{ ...exportBtnStyle, color: "#1565c0", borderColor: "#1565c0" }}>⟳ Refresh</button>
              <button onClick={() => setShowSesiForm(true)} style={addBtnStyle}>+ Catat Sesi Latihan</button>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  <th style={{ background: "#f5f5f5", padding: "8px 14px", width: 32, borderBottom: "1px solid #1a1a1a" }}>
                    <input type="checkbox" checked={sesiFiltered.length > 0 && selected.size === sesiFiltered.length} onChange={toggleSelectAll} />
                  </th>
                  {["Tanggal","Pelatih","Member","Paket","Catatan","Aksi"].map(h => (
                    <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#aaa" }}>Memuat...</td></tr>
                ) : sesiFiltered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>Belum ada sesi latihan</td></tr>
                ) : sesiFiltered.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0", background: selected.has(s.id) ? "#f5faff" : "transparent" }}
                    onMouseOver={e => e.currentTarget.style.background = selected.has(s.id) ? "#eef6ff" : "#fafafa"}
                    onMouseOut={e => e.currentTarget.style.background = selected.has(s.id) ? "#f5faff" : "transparent"}>
                    <td style={{ padding: "8px 14px" }}><input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                    <td style={{ padding: "8px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.tanggal}</td>
                    <td style={{ padding: "8px 14px", fontWeight: 600, color: "#1a1a1a" }}>{s.pelatih}</td>
                    <td style={{ padding: "8px 14px", color: "#555" }}>{toTitleCase(s.member)}</td>
                    <td style={{ padding: "8px 14px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#1565c0", background: "#e3f2fd", padding: "2px 7px" }}>
                        {paketPTOptions.find(o => o.value === s.paket)?.label || s.paket || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 14px", color: "#888", fontSize: "0.75rem" }}>{s.catatan || "-"}</td>
                    <td style={{ padding: "8px 14px" }}>
                      <button onClick={async () => { try { await api.delete(`/pelatih/${s.id}`); fetchData(); } catch (err) { alert("Gagal menghapus sesi: " + err.message); } }} style={{ background: "none", border: "none", color: "#c62828", fontFamily: "var(--font-mono)", fontSize: "0.62rem", cursor: "pointer", padding: "2px 6px" }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "keseluruhan" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <input value={searchKeseluruhan} onChange={e => setSearchKeseluruhan(e.target.value)} placeholder="🔍 Cari nama member..." style={searchInputStyle} />
            <button onClick={handleExport} style={exportBtnStyle}>Export Excel</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pelatihList.map(p => {
              const members = grouped[p] || {};
              const memberKeys = Object.keys(members).filter(k => !searchKeseluruhan || normKey(members[k].displayName).includes(normKey(searchKeseluruhan)));
              if (searchKeseluruhan && memberKeys.length === 0) return null;
              const isExpanded = expandedPelatih.has(p) || !!searchKeseluruhan;
              return (
                <div key={p} style={{ background: "#fff", border: "1px solid #e0e0e0" }}>
                  <button onClick={() => toggleExpandPelatih(p)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", color: "#1a1a1a" }}>{p}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#999", background: "#f5f5f5", padding: "2px 8px" }}>{memberKeys.length} member</span>
                    </div>
                    <span style={{ color: "#999", fontSize: "0.7rem", transform: isExpanded?"rotate(180deg)":"rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f0f0f0" }}>
                      {memberKeys.length === 0 ? (
                        <p style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.7rem", marginTop: 12 }}>Belum ada member yang dilatih.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                          {memberKeys.map(key => {
                            const { displayName, entries: rawEntries } = members[key];
                            const { paketInfo, total, slice } = getCycleInfo(rawEntries);
                            return (
                              <div key={key} style={{ background: "#fafafa", border: "1px solid #e0e0e0", padding: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "#1a1a1a" }}>{displayName}</div>
                                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#1565c0", background: "#e3f2fd", padding: "2px 8px" }}>{paketInfo.label}</span>
                                </div>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {Array.from({ length: total }).map((_, i) => {
                                    const entry = slice[i]; const done = !!entry;
                                    return (
                                      <div key={i} style={{ width: 30, height: 30, background: done?"#e8f5e9":"#fff", border: `1px solid ${done?"#a5d6a7":"#ddd"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <span style={{ color: done?"#2e7d32":"#999", fontWeight: 700, fontSize: "0.65rem" }}>{done?"✓":i+1}</span>
                                        {done && <span style={{ color: "#2e7d32", fontSize: "0.42rem", fontFamily: "var(--font-mono)" }}>{formatTgl(entry.tanggal)}</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#888", marginTop: 6 }}>{slice.length} / {total} sesi selesai</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showSesiForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowSesiForm(false); }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 440, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #e0e0e0" }}>Catat Sesi Latihan</div>
            <form onSubmit={handleSesiSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Pelatih *</label>
                  <select style={{ ...inputStyle, appearance: "none" }} value={sesiForm.pelatih} onChange={e => { setSesiForm(p => ({ ...p, pelatih: e.target.value })); if (sesiForm.member.trim()) cekSisa(e.target.value, sesiForm.member); }}>
                    {pelatihList.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tanggal *</label>
                  <input style={inputStyle} type="date" value={sesiForm.tanggal} onChange={e => setSesiForm(p => ({ ...p, tanggal: e.target.value }))} onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nama Member *</label>
                <input style={inputStyle} value={sesiForm.member} onChange={e => setSesiForm(p => ({ ...p, member: e.target.value }))} required placeholder="Nama member yang dilatih"
                  onFocus={e => e.target.style.borderColor="#aaa"}
                  onBlur={e => { e.target.style.borderColor="#ddd"; cekSisa(sesiForm.pelatih, e.target.value); }} />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#aaa", marginTop: 4 }}>Huruf besar/kecil tidak masalah.</p>
                {cekLoading && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#999", marginTop: 2 }}>Mengecek sisa sesi...</p>}
                {!cekLoading && sisaInfo && sisaInfo.sisa !== null && (
                  <div style={{ marginTop: 6, padding: "8px 12px", background: sisaInfo.habis?"#fff5f5":sisaInfo.sisa<=2?"#fffde7":"#f1f8e9", border: `1px solid ${sisaInfo.habis?"#ffcdd2":sisaInfo.sisa<=2?"#fff59d":"#c5e1a5"}`, fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                    {sisaInfo.habis ? <span style={{ color: "#c62828", fontWeight: 700 }}>⚠ Paket PT sudah habis ({sisaInfo.completed}/{sisaInfo.total} sesi)</span>
                      : <span style={{ color: sisaInfo.sisa<=2?"#f57f17":"#2e7d32" }}>Sisa {sisaInfo.sisa} dari {sisaInfo.total} sesi (paket {sisaInfo.paket})</span>}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Paket PT *</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={sesiForm.paket} onChange={e => setSesiForm(p => ({ ...p, paket: e.target.value }))}>
                  {paketPTOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Catatan</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={sesiForm.catatan} onChange={e => setSesiForm(p => ({ ...p, catatan: e.target.value }))} placeholder="Program latihan, progress, dll" onFocus={e => e.target.style.borderColor="#aaa"} onBlur={e => e.target.style.borderColor="#ddd"} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => { setShowSesiForm(false); setSisaInfo(null); }} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Batal</button>
                {sisaInfo?.habis ? (
                  <button type="button" onClick={() => setShowPerpanjangModal(true)} style={{ background: "#c62828", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Paket Habis — Perpanjang</button>
                ) : (
                  <button type="submit" style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: "pointer" }}>Simpan</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showPerpanjangModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowPerpanjangModal(false); setJustHabis(false); } }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", width: "100%", maxWidth: 400, padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#c62828", marginBottom: 6 }}>⚠ Paket PT Sudah Habis</div>
            <p style={{ fontSize: "0.825rem", color: "#555", marginBottom: 20 }}>
              {justHabis
                ? <>Sesi terakhir paket <strong>{sesiForm.member || sisaInfo?.member}</strong> bersama <strong>{sesiForm.pelatih || sisaInfo?.pelatih}</strong> baru dicatat dan paket penuh. Perpanjang?</>
                : <>Paket PT <strong>{sesiForm.member}</strong> bersama <strong>{sesiForm.pelatih}</strong> sudah habis. Perpanjang dulu sebelum mencatat sesi baru.</>
              }
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>Pilih Paket</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {paketPTOptions.map(o => (
                  <button key={o.value} type="button" onClick={() => setPerpanjangPaket(o.value)}
                    style={{ padding: "10px 12px", border: `2px solid ${perpanjangPaket===o.value?"#1a1a1a":"#e0e0e0"}`, background: perpanjangPaket===o.value?"#1a1a1a":"#fff", color: perpanjangPaket===o.value?"#fff":"#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: perpanjangPaket===o.value?700:400, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setShowPerpanjangModal(false); setJustHabis(false); }} style={{ background: "none", border: "1px solid #ddd", color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer" }}>Tidak Sekarang</button>
              <button onClick={handlePerpanjang} disabled={perpanjangLoading}
                style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "9px 20px", cursor: perpanjangLoading?"default":"pointer", opacity: perpanjangLoading?0.6:1 }}>
                {perpanjangLoading ? "Memproses..." : "Perpanjang Paket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}