import { useState, useEffect } from "react";
import { api } from "../../../utils/api";

const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, aktif: 0, hadirHariIni: 0, pelatih: 0, stokHabis: 0 });
  const [keuangan, setKeuangan] = useState({ masuk: 0, keluar: 0 });
  const [recentKehadiran, setRecentKehadiran] = useState([]);
  const [recentKeuangan, setRecentKeuangan] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [members, kehadiran, pelatihData, stok, keu] = await Promise.all([
          api.get("/member"),
          api.get("/kehadiran"),
          api.get("/pelatih"),
          api.get("/stok/barang"),
          api.get("/keuangan"),
        ]);

        const bulanIni = new Date().toISOString().slice(0, 7);
        const keuBulanIni = keu.filter(k => k.tanggal?.startsWith(bulanIni));

        setStats({
          members: members.length,
          aktif: members.filter(m => m.status === "aktif").length,
          hadirHariIni: kehadiran.filter(k => k.tanggal === today).length,
          pelatih: pelatihData.length,
          stokHabis: stok.filter(s => s.stok === 0).length,
        });

        setKeuangan({
          masuk: keuBulanIni.filter(k => k.tipe === "pemasukan").reduce((s, k) => s + k.jumlah, 0),
          keluar: keuBulanIni.filter(k => k.tipe === "pengeluaran").reduce((s, k) => s + k.jumlah, 0),
        });

        setRecentKehadiran(
          kehadiran.filter(k => k.tanggal === today)
            .sort((a, b) => b.waktu?.localeCompare(a.waktu))
            .slice(0, 5)
        );

        setRecentKeuangan(
          keu.sort((a, b) => {
            const ta = a.createdAt || a.tanggal || "";
            const tb = b.createdAt || b.tanggal || "";
            return tb.localeCompare(ta);
          }).slice(0, 8)
        );
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: "Total Member", val: stats.members, sub: `${stats.aktif} aktif`, color: "#1a1a1a", icon: "👥" },
    { label: "Hadir Hari Ini", val: stats.hadirHariIni, sub: "member masuk", color: "#4caf50", icon: "✅" },
    { label: "Stok Habis", val: stats.stokHabis, sub: "item perlu restock", color: stats.stokHabis > 0 ? "#f44336" : "#4caf50", icon: "📦" },
    { label: "Pemasukan Bulan Ini", val: fmt(keuangan.masuk), sub: "total masuk", color: "#4caf50", icon: "💰" },
    { label: "Pengeluaran Bulan Ini", val: fmt(keuangan.keluar), sub: "total keluar", color: "#f44336", icon: "💸" },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#444", letterSpacing: "0.15em", textTransform: "uppercase" }}>Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
            <div style={{ fontSize: "1.3rem", marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: s.color, lineHeight: 1, letterSpacing: "-0.01em" }}>{s.val}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginTop: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#999", marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Kehadiran hari ini */}
        <div style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>Kehadiran Hari Ini</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #1e1e1e" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          {recentKehadiran.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#999", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>Belum ada member masuk hari ini</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentKehadiran.map((k, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a" }}>{k.namaMember}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#555", marginTop: 2 }}>{k.noHp} · {k.paket}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.85rem", color: "#4caf50" }}>{k.waktu}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: k.method === "scan" ? "#5ba3d9" : "#ffc107", marginTop: 2 }}>
                      {k.method === "scan" ? "QR Scan" : "Manual"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaksi terbaru */}
        <div style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", padding: 20 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>Transaksi Terbaru</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #1e1e1e" }}>
            Keuangan
          </div>
          {recentKeuangan.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#999", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>Belum ada transaksi</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentKeuangan.map((k, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.825rem", color: "#1a1a1a", fontWeight: 500 }}>{k.keterangan}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#555" }}>{k.kategori} · {k.tanggal}</span>
                      {k.metode && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", padding: "1px 6px", background: k.metode === "QRIS" ? "#f3e5f5" : k.metode === "Transfer" ? "#e3f2fd" : "#e8f5e9", color: k.metode === "QRIS" ? "#7b1fa2" : k.metode === "Transfer" ? "#1565c0" : "#2e7d32" }}>
                          {k.metode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.875rem", color: k.tipe === "pemasukan" ? "#4caf50" : "#f44336", marginLeft: 12, flexShrink: 0 }}>
                    {k.tipe === "pemasukan" ? "+" : "-"}{fmt(k.jumlah)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Saldo bulan ini */}
      <div style={{ marginTop: 16, background: "#e8e8e8", border: "1px solid #e0e0e0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>Saldo Bersih Bulan Ini</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em", color: keuangan.masuk - keuangan.keluar >= 0 ? "#4caf50" : "#f44336" }}>
          {fmt(keuangan.masuk - keuangan.keluar)}
        </div>
      </div>
    </div>
  );
}