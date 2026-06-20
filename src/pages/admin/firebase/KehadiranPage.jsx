import { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function KehadiranPage() {
  const [kehadiran, setKehadiran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("log");
  const [scanResult, setScanResult] = useState(null);
  const [manualId, setManualId] = useState("");
  const [manualResult, setManualResult] = useState(null);
  const [manualError, setManualError] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchKehadiran = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "kehadiran"));
    setKehadiran(snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.waktu?.localeCompare(a.waktu)));
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
      const memberDoc = await getDoc(doc(db, "members", memberId));
      if (!memberDoc.exists()) {
        setScanResult({ error: true, message: "Member tidak ditemukan di database." });
        return;
      }
      const member = memberDoc.data();
      const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      await addDoc(collection(db, "kehadiran"), {
        memberId, namaMember: member.nama, noHp: member.noHp,
        paket: member.paket, status: member.status,
        tanggal: today, waktu, method,
        createdAt: serverTimestamp(),
      });
      setScanResult({ error: false, member, waktu });
      fetchKehadiran();
    } catch (err) {
      setScanResult({ error: true, message: "Gagal memproses. Coba lagi." });
    }
  };

  const handleManualCheckin = async (e) => {
  e.preventDefault();
  setManualError(""); setManualResult(null);
  if (!manualId.trim()) return;

  try {
    const snap = await getDocs(collection(db, "members"));
    const allMembers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Cari by nama atau no HP
    const found = allMembers.find(m =>
      m.nama?.toLowerCase() === manualId.trim().toLowerCase() ||
      m.noHp?.replace(/\D/g, "") === manualId.trim().replace(/\D/g, "")
    );

    if (!found) { setManualError("Member tidak ditemukan. Cek nama atau no HP."); return; }

    const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    await addDoc(collection(db, "kehadiran"), {
      memberId: found.id, namaMember: found.nama, noHp: found.noHp,
      paket: found.paket, status: found.status,
      tanggal: today, waktu, method: "manual",
      createdAt: serverTimestamp(),
    });
    setManualResult({ member: found, waktu });
    setManualId("");
    fetchKehadiran();
  } catch (err) {
    setManualError("Gagal memproses. Coba lagi.");
  }
};

  const filtered = kehadiran.filter(k => !filterTanggal || k.tanggal === filterTanggal);
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
          <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
            <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)}
              style={{ ...inputStyle, width: "auto" }} />
            {filterTanggal && (
              <button onClick={() => setFilterTanggal("")}
                style={{ background: "none", border: "1px solid #222", color: "#555", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "8px 14px", cursor: "pointer" }}>Reset</button>
            )}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#444", marginLeft: "auto" }}>{filtered.length} data</span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr>
                  {["Nama Member", "No HP", "Tanggal", "Waktu", "Paket", "Status", "Metode"].map(h => (
                    <th key={h} style={{ background: "#f5f5f5", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px", textAlign: "left", borderBottom: "1px solid #f0ede8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333" }}>Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#333", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Belum ada data kehadiran</td></tr>
                ) : filtered.map(k => (
                  <tr key={k.id} style={{ borderBottom: "1px solid #1a1a1a" }}
                    onMouseOver={e => e.currentTarget.style.background = "#f9f9f9"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#f0ede8" }}>{k.namaMember}</td>
                    <td style={{ padding: "10px 14px", color: "#888" }}>{k.noHp}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{k.tanggal}</td>
                    <td style={{ padding: "10px 14px", color: "#4caf50", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{k.waktu}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem" }}>{k.paket}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: k.status === "aktif" ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)", color: k.status === "aktif" ? "#4caf50" : "#f44336", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px" }}>{k.status}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: k.method === "scan" ? "rgba(91,163,217,0.15)" : "rgba(255,193,7,0.15)", color: k.method === "scan" ? "#5ba3d9" : "#ffc107", fontFamily: "var(--font-mono)", fontSize: "0.65rem", padding: "2px 8px" }}>
                        {k.method === "scan" ? "QR Scan" : "Manual"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scan QR Tab */}
      {activeTab === "scan" && (
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 24, marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f0ede8", marginBottom: 4 }}>Scan QR Code Member</div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#444", marginBottom: 20 }}>Arahkan kamera ke QR Code member untuk absen masuk</p>
            <div id="qr-reader" style={{ width: "100%" }} />
          </div>

          {scanResult && (
            <div style={{ background: scanResult.error ? "#1a0a0a" : "#0a1a0a", border: `1px solid ${scanResult.error ? "#3a1a1a" : "#1a3a1a"}`, padding: 20, borderRadius: 4 }}>
              {scanResult.error ? (
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f44336", marginBottom: 8 }}>❌ Gagal</div>
                  <p style={{ color: "#888", fontSize: "0.875rem" }}>{scanResult.message}</p>
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

      {manualResult && (
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