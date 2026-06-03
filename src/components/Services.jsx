import { useState } from "react";

const membership = [
  { id: "INS", name: "Insidentil", duration: "1 Hari", price: 30000, color: "#777", desc: "Akses gym seharian penuh. Cocok untuk kamu yang ingin mencoba dulu." },
  { id: "MON", name: "Monthly", duration: "1 Bulan", price: 160000, color: "#5ba3d9", desc: "Akses tak terbatas selama sebulan. Pilihan paling fleksibel." },
  { id: "SIL", name: "Silver", duration: "3 Bulan", price: 420000, color: "#aaa", badge: "Hemat 12%", desc: "Komitmen 3 bulan, harga lebih hemat. Konsisten dan semakin progresif." },
  { id: "GLD", name: "Gold", duration: "6 Bulan", price: 730000, color: "#e8c84a", badge: "Hemat 24%", desc: "Setengah tahun perjalanan fitness. Harga terbaik untuk hasil optimal." },
  { id: "PLT", name: "Platinum", duration: "12 Bulan", price: 1240000, color: "#ffffff", badge: "Hemat 35% 🔥", desc: "Full year membership. Komitmen penuh untuk transformasi luar biasa.", popular: true },
];

const ptPackages = [
  { name: "1 Day Trial", sessions: "1 Sesi", price: 150000, desc: "Coba personal training bersama pelatih pilihan. Kenali metode latihan kami." },
  { name: "8× Coaching", sessions: "8 Sesi", price: 600000, desc: "Program 8 sesi untuk mulai membangun kebiasaan latihan yang benar." },
  { name: "12× Coaching", sessions: "12 Sesi", price: 800000, desc: "Program intensif 12 sesi. Ideal untuk mencapai target dalam waktu singkat.", popular: true },
  { name: "16× Coaching", sessions: "16 Sesi", price: 1000000, desc: "Program lengkap 16 sesi. Transformasi fisik signifikan dengan bimbingan penuh." },
];

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

function MemberCard({ pkg, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: pkg.popular ? "var(--dark3)" : "var(--dark2)",
        border: `1px solid ${hovered || pkg.popular ? pkg.color : "var(--gray-dark)"}`,
        borderRadius: "var(--radius)", padding: "28px 24px",
        transition: "all 0.25s", cursor: "default", position: "relative", overflow: "hidden",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {pkg.popular && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: pkg.color }} />
      )}
      {pkg.badge && (
        <span style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", padding: "3px 10px", borderRadius: "20px", marginBottom: 12, border: "1px solid rgba(255,255,255,0.2)" }}>
          {pkg.badge}
        </span>
      )}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: pkg.color, marginBottom: 6 }}>{pkg.id} · {pkg.duration}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem", color: "var(--white)", marginBottom: 8, letterSpacing: "-0.01em" }}>{pkg.name}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: pkg.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 12 }}>{fmt(pkg.price)}</div>
      <p style={{ fontSize: "0.825rem", color: "var(--gray-mid)", lineHeight: 1.6, fontWeight: 300, marginBottom: 20 }}>{pkg.desc}</p>
      <a href="#contact" className="btn" style={{
        textDecoration: "none", width: "100%", justifyContent: "center",
        background: pkg.popular ? pkg.color : "transparent",
        color: pkg.popular ? "var(--black)" : "var(--gray-light)",
        border: pkg.popular ? "none" : "1px solid var(--gray-dark)",
        fontSize: "0.78rem", padding: "10px",
        clipPath: pkg.popular ? "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)" : "none",
      }}>
        {pkg.popular ? "Pilih Platinum →" : "Daftar Sekarang"}
      </a>
    </div>
  );
}

function PTCard({ pkg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--dark2)", border: `1px solid ${hovered || pkg.popular ? "var(--white)" : "var(--gray-dark)"}`,
        borderRadius: "var(--radius)", padding: "28px 24px",
        transition: "all 0.25s", cursor: "default", position: "relative",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {pkg.popular && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--white)" }} />}
      {pkg.popular && <span style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "var(--white)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", padding: "3px 10px", borderRadius: "20px", marginBottom: 12, border: "1px solid rgba(255,255,255,0.2)" }}>PALING DIMINATI</span>}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: 6 }}>{pkg.sessions}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--white)", marginBottom: 8 }}>{pkg.name}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", color: "var(--white)", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 12 }}>{fmt(pkg.price)}</div>
      <p style={{ fontSize: "0.825rem", color: "var(--gray-mid)", lineHeight: 1.6, fontWeight: 300, marginBottom: 20 }}>{pkg.desc}</p>
      <a href="#contact" className="btn btn-ghost" style={{ textDecoration: "none", width: "100%", justifyContent: "center", fontSize: "0.78rem", padding: "10px", borderRadius: "var(--radius)" }}>Daftar PT</a>
    </div>
  );
}

export default function Services() {
  const [tab, setTab] = useState("membership");

  return (
    <section id="services" style={{ background: "var(--black)", padding: "100px 0", position: "relative" }}>
      <div className="h-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="section-eyebrow">Harga & Paket</div>
            <h2 className="section-title">Program &<br /><em>Membership</em></h2>
          </div>
          {/* Tab toggle */}
          <div style={{ display: "flex", background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: 4, gap: 4 }}>
            {[{ id: "membership", label: "🏷 Membership" }, { id: "pt", label: "💪 Personal Training" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "var(--white)" : "transparent",
                  color: tab === t.id ? "var(--black)" : "var(--gray-mid)",
                  border: "none", fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "0.8rem", padding: "9px 18px", cursor: "pointer",
                  borderRadius: "calc(var(--radius) - 2px)", transition: "all 0.2s",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Membership tab */}
        {tab === "membership" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
            {membership.map((pkg, i) => <MemberCard key={i} pkg={pkg} index={i} />)}
          </div>
        )}

        {/* PT tab */}
        {tab === "pt" && (
          <div>
            {/* PT trainers callout */}
            <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--white)" }}>Pelatih Tersedia</div>
              <div style={{ display: "flex", gap: 12 }}>
                {["Elia (♀)", "Indah (♀)", "Tyo (♂)"].map((name, i) => (
                  <span key={i} style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: "var(--gray-light)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.8rem", padding: "6px 14px", borderRadius: "var(--radius)" }}>{name}</span>
                ))}
              </div>
              <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gray-mid)" }}>Pilih pelatih sesuai preferensi</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
              {ptPackages.map((pkg, i) => <PTCard key={i} pkg={pkg} />)}
            </div>
          </div>
        )}

        {/* Bottom note */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius)", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "var(--white)", fontSize: "1rem" }}>ℹ</span>
          <p style={{ fontSize: "0.82rem", color: "var(--gray-mid)", fontWeight: 300 }}>
            Harga belum termasuk biaya pendaftaran. Hubungi kami di <strong style={{ color: "var(--white)" }}>+62 823 2472 0045</strong> atau kunjungi langsung di Jl. Bhakti No. 90A Burikan, Kudus untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    </section>
  );
}
