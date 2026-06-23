import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { memberApi } from "../../utils/api";

const fmt = n => "Rp " + Number(n || 0).toLocaleString("id-ID");
const formatTgl = tgl => tgl ? new Date(tgl + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";
const formatTglShort = tgl => tgl ? new Date(tgl + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-";

function StatusBadge({ status, tanggalAkhir }) {
  const today = new Date().toISOString().split("T")[0];
  const isExpired = tanggalAkhir && tanggalAkhir < today;
  const effectiveStatus = (status === "aktif" || status === "pending") && isExpired ? "tidak aktif" : status;
  const cfg = {
    aktif: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7", label: "AKTIF" },
    pending: { bg: "#fff8e1", color: "#f57f17", border: "#ffe082", label: "PENDING" },
    "tidak aktif": { bg: "#ffebee", color: "#c62828", border: "#ffcdd2", label: "TIDAK AKTIF" },
  }[effectiveStatus] || { bg: "#f5f5f5", color: "#888", border: "#e0e0e0", label: (effectiveStatus || "").toUpperCase() };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.15em", padding: "4px 12px" }}>
      {cfg.label}
    </span>
  );
}

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("status");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [statusRes, riwayatRes] = await Promise.all([
          memberApi.get("/portal/member/status"),
          memberApi.get("/portal/member/riwayat"),
        ]);
        setData(statusRes);
        setRiwayat(riwayatRes);
      } catch (err) { setError(err.message); }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#aaa" }}>Memuat data kamu...</div>
    </div>
  );
  if (error) return <div style={{ padding: 20, color: "#f44336", fontSize: "0.875rem" }}>{error}</div>;
  if (!data) return null;

  const { member, ptInfo } = data;
  const today = new Date().toISOString().split("T")[0];
  const isExpired = member.tanggalAkhir && member.tanggalAkhir < today;
  const effectiveStatus = (member.status === "aktif" || member.status === "pending") && isExpired ? "tidak aktif" : member.status;

  let sisaHari = null;
  if (member.tanggalAkhir && member.tanggalAkhir >= today) {
    sisaHari = Math.ceil((new Date(member.tanggalAkhir) - new Date(today)) / 86400000);
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", background: "#fff" }}>
        {[["status", "Status"], ["qr", "QR Check-in"], ["pt", "PT"], ["riwayat", "Riwayat"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex: 1, background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #1a1a1a" : "2px solid transparent", padding: "14px 4px", marginBottom: -1, fontFamily: "var(--font-body)", fontWeight: activeTab === id ? 600 : 400, fontSize: "0.8rem", color: activeTab === id ? "#1a1a1a" : "#888", cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {/* STATUS */}
        {activeTab === "status" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderTop: `4px solid ${effectiveStatus === "aktif" ? "#2e7d32" : effectiveStatus === "pending" ? "#f57f17" : "#c62828"}`, padding: "20px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "#1a1a1a", marginBottom: 6 }}>{member.nama}</div>
                  <StatusBadge status={member.status} tanggalAkhir={member.tanggalAkhir} />
                </div>
                {sisaHari !== null && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.2rem", color: sisaHari <= 7 ? "#c62828" : sisaHari <= 14 ? "#f57f17" : "#2e7d32", lineHeight: 1 }}>{sisaHari}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#888" }}>hari lagi</div>
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Paket", val: member.paket || "-" },
                  { label: "No HP", val: member.noHp || "-" },
                  { label: "Mulai", val: formatTgl(member.tanggalMulai) },
                  { label: "Berakhir", val: formatTgl(member.tanggalAkhir) },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: "#f9f9f9", padding: "10px 12px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", color: "#1a1a1a" }}>{val}</div>
                  </div>
                ))}
              </div>
              {effectiveStatus === "tidak aktif" && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#fff5f5", border: "1px solid #ffcdd2", fontSize: "0.825rem", color: "#c62828" }}>
                  Membership kamu sudah habis. Hubungi admin atau datang langsung untuk perpanjang.
                </div>
              )}
            </div>

            {ptInfo && (
              <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 16 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 10 }}>Personal Training</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem", color: "#1a1a1a" }}>Pelatih: {ptInfo.pelatih}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888" }}>{ptInfo.paketLabel}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: ptInfo.habis ? "#c62828" : "#1a1a1a", lineHeight: 1 }}>
                    {ptInfo.completed}<span style={{ fontSize: "0.9rem", color: "#aaa" }}>/{ptInfo.total}</span>
                  </div>
                </div>
                <div style={{ background: "#f0f0f0", height: 8, borderRadius: 4 }}>
                  <div style={{ background: ptInfo.habis ? "#c62828" : "#2e7d32", height: 8, borderRadius: 4, width: `${Math.min((ptInfo.completed / ptInfo.total) * 100, 100)}%` }} />
                </div>
                {ptInfo.habis && <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#c62828" }}>Paket PT habis. Hubungi admin untuk perpanjang.</div>}
              </div>
            )}
          </div>
        )}

        {/* QR */}
        {activeTab === "qr" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 20, textAlign: "center" }}>
              Tunjukkan QR ini ke Kasir / Receptionist
            </div>
            <div style={{ background: "#fff", padding: 20, border: "2px solid #1a1a1a", marginBottom: 20 }}>
              <QRCodeSVG value={member.id} size={220} level="M" />
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "#1a1a1a", marginBottom: 8 }}>{member.nama}</div>
            <StatusBadge status={member.status} tanggalAkhir={member.tanggalAkhir} />
            {effectiveStatus !== "aktif" && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#fff5f5", border: "1px solid #ffcdd2", fontSize: "0.8rem", color: "#c62828", textAlign: "center", maxWidth: 280 }}>
                ⚠ Membership tidak aktif. Check-in mungkin tidak bisa diproses.
              </div>
            )}
          </div>
        )}

        {/* PT */}
        {activeTab === "pt" && (
          <div>
            {!ptInfo ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#aaa" }}>Kamu belum punya paket Personal Training.</div>
                <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 8 }}>Tanyakan ke admin untuk info paket PT.</div>
              </div>
            ) : (
              <div>
                <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "1rem", color: "#1a1a1a" }}>Pelatih: {ptInfo.pelatih}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#888" }}>{ptInfo.paketLabel}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: ptInfo.habis ? "#c62828" : "#2e7d32", lineHeight: 1 }}>
                      {ptInfo.completed}<span style={{ fontSize: "1rem", color: "#aaa" }}>/{ptInfo.total}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Array.from({ length: ptInfo.total }).map((_, i) => {
                      const done = i < ptInfo.completed;
                      const sesi = ptInfo.sesiList[i];
                      return (
                        <div key={i} style={{ width: 40, height: 40, background: done ? "#e8f5e9" : "#f5f5f5", border: `1px solid ${done ? "#a5d6a7" : "#e0e0e0"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: done ? "#2e7d32" : "#ccc" }}>{done ? "✓" : i + 1}</span>
                          {done && sesi && <span style={{ fontSize: "0.4rem", color: "#888", fontFamily: "var(--font-mono)" }}>{formatTglShort(sesi.tanggal)}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {ptInfo.sesiList.some(s => s.catatan) && (
                  <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: 16 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 12 }}>Catatan dari Pelatih</div>
                    {ptInfo.sesiList.filter(s => s.catatan).map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f5f5f5" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#aaa", minWidth: 60 }}>{formatTglShort(s.tanggal)}</div>
                        <div style={{ fontSize: "0.875rem", color: "#555" }}>{s.catatan}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIWAYAT */}
        {activeTab === "riwayat" && (
          <div>
            {riwayat.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#aaa" }}>Belum ada riwayat pembayaran.</div>
            ) : riwayat.map(r => (
              <div key={r.id} style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#1a1a1a", marginBottom: 4 }}>{r.keterangan}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#888" }}>{formatTglShort(r.tanggal)}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#888" }}>{r.metode}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "#2e7d32" }}>{fmt(r.jumlah)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}