import { useState } from "react";

const fmt = n => "Rp " + n.toLocaleString("id-ID");

const membership = [
  { id: "INS", label: "Insidentil",  dur: "1 Hari",    price: 30000 },
  { id: "MON", label: "Monthly",     dur: "1 Bulan",   price: 160000 },
  { id: "SIL", label: "Silver",      dur: "3 Bulan",   price: 420000 },
  { id: "GLD", label: "Gold",        dur: "6 Bulan",   price: 730000 },
  { id: "PLT", label: "Platinum",    dur: "12 Bulan",  price: 1240000 },
];

const pt = [
  { label: "Trial",      sess: "1 sesi",   price: 150000 },
  { label: "8× Sesi",    sess: "8 sesi",   price: 700000, best: true  },
  { label: "12× Sesi",   sess: "12 sesi",  price: 950000 },
  { label: "16× Sesi",   sess: "16 sesi",  price: 1200000 },
];

export default function Pricing() {
  const [tab, setTab] = useState("member");

  return (
    <section id="pricing" style={{ background: "#0a0a0a", padding: "50px 0 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>Harga & Paket</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1 }}>
            Choose Your Plan <br />
          </h2>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #1e1e1e" }}>
          {[["member","Membership"],["pt","Personal Trainer"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: "none", border: "none",
              borderBottom: tab === id ? "2px solid #fff" : "2px solid transparent",
              padding: "10px 20px", marginBottom: -1,
              fontFamily: "var(--font-body)", fontWeight: tab === id ? 600 : 400,
              fontSize: "0.875rem", color: tab === id ? "#f0ede8" : "#555",
              cursor: "pointer", transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* Cards */}
        {tab === "member" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
            {membership.map((pkg, i) => (
              <div key={i} style={{
                background: pkg.best ? "#141414" : "#0f0f0f",
                border: pkg.best ? "1px solid #444" : "1px solid #1e1e1e",
                padding: "24px 20px", position: "relative", overflow: "hidden",
                transition: "border-color 0.25s",
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#555"}
              onMouseOut={e => e.currentTarget.style.borderColor = pkg.best ? "#444" : "#1e1e1e"}
              >
                {pkg.best && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#fff" }} />}
                {pkg.badge && (
                  <div style={{ display: "inline-block", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", padding: "2px 9px", marginBottom: 10 }}>
                    {pkg.badge}
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 5 }}>{pkg.dur}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.05rem", color: "#f0ede8", marginBottom: 8, letterSpacing: "-0.01em" }}>{pkg.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: pkg.best ? "#fff" : "#ccc", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>{fmt(pkg.price)}</div>
                <p style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.5, fontWeight: 300, marginBottom: 18 }}>{pkg.note}</p>
                <a href="#contact" style={{
                  display: "block", textAlign: "center", padding: "9px",
                  background: pkg.best ? "#fff" : "transparent",
                  color: pkg.best ? "#080808" : "#666",
                  border: pkg.best ? "none" : "1px solid #2a2a2a",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.78rem",
                  textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseOver={e => { if (!pkg.best) { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}}
                onMouseOut={e => { if (!pkg.best) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}}
                >{pkg.best ? "Daftar Sekarang" : "Pilih"}</a>
              </div>
            ))}
          </div>
        )}

        {tab === "pt" && (
          <div>
            <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>Pilih pelatih</span>
              {[["Tyo","♂"],["Elia","♀"],["Indah","♀"]].map(([n, g]) => (
                <span key={n} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.82rem", padding: "5px 14px" }}>
                  {n} <span style={{ color: "#555" }}>{g}</span>
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {pt.map((pkg, i) => (
                <div key={i} style={{
                  background: pkg.best ? "#141414" : "#0f0f0f",
                  border: pkg.best ? "1px solid #444" : "1px solid #1e1e1e",
                  padding: "24px 20px", position: "relative",
                  transition: "border-color 0.25s",
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = "#555"}
                onMouseOut={e => e.currentTarget.style.borderColor = pkg.best ? "#444" : "#1e1e1e"}
                >
                  {pkg.best && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#fff" }} />}
                  {pkg.best && <div style={{ display: "inline-block", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", padding: "2px 9px", marginBottom: 10 }}>Paling diminati</div>}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 5 }}>{pkg.sess}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.05rem", color: "#f0ede8", marginBottom: 8 }}>{pkg.label}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: pkg.best ? "#fff" : "#ccc", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>{fmt(pkg.price)}</div>
                  <p style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.5, fontWeight: 300, marginBottom: 18 }}>{pkg.note}</p>
                  <a href="#contact" style={{
                    display: "block", textAlign: "center", padding: "9px",
                    background: pkg.best ? "#fff" : "transparent",
                    color: pkg.best ? "#080808" : "#666",
                    border: pkg.best ? "none" : "1px solid #2a2a2a",
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.78rem",
                    textDecoration: "none", transition: "all 0.2s",
                  }}
                  onMouseOver={e => { if (!pkg.best) { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}}
                  onMouseOut={e => { if (!pkg.best) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}}
                  >{pkg.best ? "Daftar Sekarang" : "Pilih"}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: "0.78rem", color: "#444", fontWeight: 300 }}>
          * Harga belum termasuk biaya pendaftaran. Info lebih lanjut hubungi <a href="tel:+6282324720045" style={{ color: "#666", textDecoration: "none" }}>+62 823 2472 0045</a>
        </p>
      </div>
    </section>
  );
}
