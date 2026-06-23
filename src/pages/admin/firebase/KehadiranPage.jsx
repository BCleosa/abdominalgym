import { useState, useEffect, useRef } from "react";
import { api } from "../../../utils/api";
import { exportToExcel } from "../../../utils/exportExcel";
import { Html5QrcodeScanner } from "html5-qrcode";

const ADMIN_WA = "6282324720045";

// Member yang gak boleh check-in: status manual non-aktif, ATAU statusnya aktif/pending tapi
// tanggal akhirnya udah lewat hari ini.
function getCheckinBlock(member, todayStr) {
  if (member.status === "tidak aktif" || member.status === "expired") {
    return { blocked: true, reason: "tidak_aktif" };
  }
  if ((member.status === "aktif" || member.status === "pending") && member.tanggalAkhir && member.tanggalAkhir < todayStr) {
    return { blocked: true, reason: "expired" };
  }
  if (member.status === "pending") {
    return { blocked: true, reason: "pending" };
  }
  return { blocked: false, reason: null };
}

export default function KehadiranPage() {
  const [kehadiran, setKehadiran] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("log");
  const [scanResult, setScanResult] = useState(null);
  const [manualId, setManualId] = useState("");
  const [manualResult, setManualResult] = useState(null);
  const [manualError, setManualError] = useState("");
  const [filterAwal, setFilterAwal] = useState("");
  const [filterAkhir, setFilterAkhir] = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [selected, setSelected] = useState(new Set());
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchKehadiran = async () => {
    setLoading(true);
    try {
      const [kehadiranData, membersData] = await Promise.all([
        api.get("/kehadiran"),
        api.get("/member"),
      ]);
      const mMap = {};
      membersData.forEach(m => { mMap[m.id] = m; });
      setMembersMap(mMap);
      setKehadiran(kehadiranData.sort((a, b) => (b.waktu || "").localeCompare(a.waktu || "")));
    } catch (err) {
      alert("Gagal memuat data kehadiran: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchKehadiran(); }, []);

  // QR Scanner
  useEffect(() => {
    if (activeTab !== "scan") return;
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scannerInstance.current = scanner;
    scanner.render(
      async (decodedText) => {
        scanner.clear();
        await handleCheckin(decodedText, "scan");
      },
      (err) => {}
    );
    return () => { scanner.clear().catch(() => {}); };
  }, [activeTab]);

  const handleCheckin = async (memberId, method) => {
    try {
      const member = await api.get(`/kehadiran/member/${memberId}`);
      const block = getCheckinBlock(member, today);

      if (block.blocked) {
        setScanResult({ error: false, blocked: true, reason: block.reason, member });
        return;
      }

      const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      await api.post("/kehadiran", {
        memberId, namaMember: member.nama, noHp: member.noHp,
        paket: member.paket, status: member.status, method,
      });
      setScanResult({ error: false, member, waktu });
      fetchKehadiran();
    } catch (err) {
      const notFound = err.message === "Member tidak ditemukan";
      setScanResult({ error: true, message: notFound ? "Member tidak ditemukan di database." : "Gagal memproses. Coba lagi." });
    }
  };

  const handleManualCheckin = async (e) => {
    e.preventDefault();
    setManualError(""); setManualResult(null);
    if (!manualId.trim()) return;

    try {
      const allMembers = await api.get("/member");

      // Cari by nama atau no HP
      const found = allMembers.find(m =>
        m.nama?.toLowerCase() === manualId.trim().toLowerCase() ||
        m.noHp?.replace(/\D/g, "") === manualId.trim().replace(/\D/g, "")
      );

      if (!found) { setManualError("Member tidak ditemukan. Cek nama atau no HP."); return; }

      const block = getCheckinBlock(found, today);
      if (block.blocked) {
        setManualResult({ blocked: true, reason: block.reason, member: found });
        setManualId("");
        return;
      }

      const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      await api.post("/kehadiran", {
        memberId: found.id, namaMember: found.nama, noHp: found.noHp,
        paket: found.paket, status: found.status, method: "manual",
      });
      setManualResult({ member: found, waktu });
      setManualId("");
      fetchKehadiran();
    } catch (err) {
      setManualError("Gagal memproses. Coba lagi.");
    }
  };

  const filtered = kehadiran.filter(k =>
    (!filterAwal || k.tanggal >= filterAwal) &&
    (!filterAkhir || k.tanggal <= filterAkhir) &&
    (!searchNama || k.namaMember?.toLowerCase().includes(searchNama.toLowerCase()))
  );

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(k => k.id)));
  };

  const handleExport = () => {
    const source = selected.size > 0 ? filtered.filter(k => selected.has(k.id)) : filtered;
    const rows = source.map(k => {
      const member = membersMap[k.memberId];
      const tanggalAkhir = member?.tanggalAkhir || "";
      const isExpired = tanggalAkhir && new Date(tanggalAkhir) < new Date();
      return {
        "Nama Member": k.namaMember,
        "Tanggal Kehadiran": k.tanggal,
        "Waktu Kehadiran": k.waktu,
        "Tgl Habis Member": tanggalAkhir || "-",
        "Status": isExpired ? "Sudah Habis" : "Aktif",
      };
    });
    exportToExcel(rows, "Kehadiran_Member", "Kehadiran");
  };
  const todayCount = kehadiran.filter(k => k.tanggal === today).length;

  const inputStyle = { background: "#fff", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Hadir Hari Ini", val: todayCount, color: "#4caf50" },
          { label: "Total Log", val: kehadiran.length, color: "#1a1a1a" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color === "#f0ede8" || s.color === "#1a1a1a" ? "#1a1a1a" : s.color }}>{s.val}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e1e1e", marginBottom: 20 }}>
        {[["log", "Log Kehadiran"], ["scan", "Scan QR"], ["manual", "Input Manual"]].map(([id, label]) => (
          <button key={id} onClick={() => { setScanResult(null); setManualResult(null); setActiveTab(id); }}
            style={{ background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #1a1a1a" : "2px solid transparent", padding: "9px 20px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab === id ? 600 : 400, fontSize: "0.875rem", color: activeTab === id ? "#1a1a1a" : "#888", cursor: "pointer", transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Log Tab */}
      {activeTab === "log" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
            <input value={searchNama} onChange={e => setSearchNama(e.target.value)}
              placeholder="Cari nama member..."
              style={{ ...inputStyle, width: 220 }} />
            <input type="date" value={filterAwal} onChange={e => setFilterAwal(e.target.value)}
              style={{ ...inputStyle, width: "auto" }} />
            <span style={{ color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>s/d</span>
            <input type="date" value={filterAkhir} onChange={e => setFilterAkhir(e.target.value)}
              style={{ ...inputStyle, width: "auto" }} />
            {(filterAwal || filterAkhir || searchNama) && (
              <button onClick={() => { setFilterAwal(""); setFilterAkhir(""); setSearchNama(""); }}
                style={{ background: "none", border: "1px solid #222", color: "#555", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "8px 14px", cursor: "pointer" }}>Reset</button>
            )}
            <button onClick={handleExport}
              style={{ background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.75rem", padding: "8px 14px", cursor: "pointer", marginLeft: "auto" }}>
              Export Excel
            </button>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#444" }}>{filtered.length} data{selected.size > 0 ? ` · ${selected.size} dipilih` : ""}</span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  <th style={{ background: "#f5f5f5", padding: "10px 14px", width: 36, borderBottom: "1px solid #1a1a1a" }}>
                    <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleSelectAll} />
                  </th>
                  {["Nama Member", "Tanggal Kehadiran", "Waktu Kehadiran", "Tgl Habis Member", "Status"].map(h => (
                    <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data kehadiran</td></tr>
                ) : filtered.map(k => {
                  const member = membersMap[k.memberId];
                  const tanggalAkhir = member?.tanggalAkhir || "";
                  const isExpired = tanggalAkhir && new Date(tanggalAkhir) < new Date();
                  return (
                    <tr key={k.id} style={{ borderBottom: "1px solid #f0f0f0", background: selected.has(k.id) ? "#f5faff" : "transparent" }}
                      onMouseOver={e => e.currentTarget.style.background = selected.has(k.id) ? "#eef6ff" : "#fafafa"}
                      onMouseOut={e => e.currentTarget.style.background = selected.has(k.id) ? "#f5faff" : "transparent"}
                    >
                      <td style={{ padding: "10px 14px" }}>
                        <input type="checkbox" checked={selected.has(k.id)} onChange={() => toggleSelect(k.id)} />
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{k.namaMember}</td>
                      <td style={{ padding: "10px 14px", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{k.tanggal}</td>
                      <td style={{ padding: "10px 14px", color: "#2e7d32", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{k.waktu}</td>
                      <td style={{ padding: "10px 14px", color: isExpired ? "#c62828" : "#2e7d32", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 600 }}>
                        {tanggalAkhir || "-"}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          background: isExpired ? "#ffebee" : "#e8f5e9",
                          color: isExpired ? "#c62828" : "#2e7d32",
                          fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "3px 10px",
                          borderRadius: 20, fontWeight: 600,
                          border: `1px solid ${isExpired ? "#ef9a9a" : "#a5d6a7"}`
                        }}>
                          {isExpired ? "Sudah Habis" : "Aktif"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scan QR Tab */}
      {activeTab === "scan" && (
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 24, marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", marginBottom: 4 }}>Scan QR Code Member</div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#444", marginBottom: 20 }}>Arahkan kamera ke QR Code member untuk absen masuk</p>
            <div id="qr-reader" style={{ width: "100%" }} />
          </div>

          {scanResult && (
            <div style={{ background: scanResult.error ? "#1a0a0a" : scanResult.blocked ? "#1a1408" : "#0a1a0a", border: `1px solid ${scanResult.error ? "#3a1a1a" : scanResult.blocked ? "#3a3010" : "#1a3a1a"}`, padding: 20, borderRadius: 4 }}>
              {scanResult.error ? (
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f44336", marginBottom: 8 }}>❌ Gagal</div>
                  <p style={{ color: "#888", fontSize: "0.875rem" }}>{scanResult.message}</p>
                </div>
              ) : scanResult.blocked ? (
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f0c040", marginBottom: 10 }}>⚠️ Belum Bisa Check In</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 8 }}>{scanResult.member.nama}</div>
                  <p style={{ color: "#cbb070", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 14 }}>
                    {scanResult.reason === "pending"
                      ? "Status membership masih menunggu konfirmasi pembayaran. Silakan selesaikan pembayaran dulu ke admin."
                      : `Masa aktif membership sudah habis${scanResult.member.tanggalAkhir ? ` sejak ${scanResult.member.tanggalAkhir}` : ""}. Silakan perpanjang dulu lewat website (bagian "Cek Status Membership") atau hubungi admin.`}
                  </p>
                  <a href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(`Halo Admin, saya ${scanResult.member.nama} mau perpanjang membership.`)}`} target="_blank" rel="noopener"
                    style={{ display: "block", textAlign: "center", background: "#f0c040", color: "#1a1408", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "10px", textDecoration: "none" }}>
                    Hubungi Admin via WhatsApp →
                  </a>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#4caf50", marginBottom: 12 }}>✓ Berhasil Check In!</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "#f0ede8" }}>{scanResult.member.nama}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888" }}>{scanResult.member.noHp}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#aaa" }}>{scanResult.member.paket}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#4caf50", marginTop: 4 }}>Waktu: {scanResult.waktu}</div>
                  </div>
                </div>
              )}
              <button onClick={() => setScanResult(null)}
                style={{ marginTop: 16, background: "#fff", color: "#080808", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "8px 20px", cursor: "pointer", width: "100%" }}>
                Scan Lagi
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Input Tab */}
      {activeTab === "manual" && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 28 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#1a1a1a", marginBottom: 4 }}>Input Manual Kehadiran</div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
              Masukkan nama lengkap atau nomor HP member.
            </p>

            <form onSubmit={handleManualCheckin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 5 }}>
                  Nama / No HP Member
                </label>
                <input value={manualId} onChange={e => setManualId(e.target.value)} required
                  placeholder="Contoh: Nama atau No Telp"
                  style={{ width: "100%", background: "#f5f5f5", border: "1px solid #ddd", color: "#1a1a1a", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#aaa"}
                  onBlur={e => e.target.style.borderColor = "#ddd"}
                />
              </div>
              {manualError && (
                <div style={{ background: "#fff5f5", border: "1px solid #ffcdd2", padding: "10px 14px", marginBottom: 14, fontSize: "0.825rem", color: "#c62828" }}>{manualError}</div>
              )}
              <button type="submit" style={{ width: "100%", background: "#1a1a1a", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem", padding: "12px", cursor: "pointer" }}>
                Check In →
              </button>
            </form>

            {manualResult && manualResult.blocked ? (
              <div style={{ marginTop: 20, background: "#fff8e1", border: "1px solid #ffe082", padding: 18 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f57f17", marginBottom: 8 }}>⚠️ Belum Bisa Check In</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 8 }}>{manualResult.member.nama}</div>
                <p style={{ color: "#a07d1a", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: 14 }}>
                  {manualResult.reason === "pending"
                    ? "Status membership masih menunggu konfirmasi pembayaran. Silakan selesaikan pembayaran dulu ke admin."
                    : `Masa aktif membership sudah habis${manualResult.member.tanggalAkhir ? ` sejak ${manualResult.member.tanggalAkhir}` : ""}. Silakan perpanjang dulu lewat website (bagian "Cek Status Membership") atau hubungi admin.`}
                </p>
                <a href={`https://wa.me/6282324720045?text=${encodeURIComponent(`Halo Admin, saya ${manualResult.member.nama} mau perpanjang membership.`)}`} target="_blank" rel="noopener"
                  style={{ display: "block", textAlign: "center", background: "#f57f17", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem", padding: "10px", textDecoration: "none" }}>
                  Hubungi Admin via WhatsApp →
                </a>
              </div>
            ) : manualResult && (
              <div style={{ marginTop: 20, background: "#f1f8e9", border: "1px solid #c5e1a5", padding: 18 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#2e7d32", marginBottom: 10 }}>✓ Check In Berhasil!</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a", marginBottom: 4 }}>{manualResult.member.nama}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#666", marginBottom: 2 }}>{manualResult.member.noHp}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888", marginBottom: 6 }}>{manualResult.member.paket}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#2e7d32" }}>Waktu: {manualResult.waktu}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}