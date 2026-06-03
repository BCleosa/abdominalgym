import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Beranda", href: "#hero" },
    { label: "Harga", href: "#pricing" },
    { label: "Pelatih", href: "#trainers" },
    { label: "Kontak", href: "#contact" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled ? "rgba(8,8,8,0.96)" : "transparent",
      borderBottom: scrolled ? "1px solid #222" : "1px solid transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 0 0p", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        <a href="#hero" style={{ textDecoration: "none", marginLeft: "-110px", marginTop: "20px" }}>
          <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 250, objectFit: "contain" }} />
        </a>

        {/* Desktop */}
        <div style={{ display: "flex", gap: 2 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} style={{
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.875rem",
              color: "#999", textDecoration: "none", padding: "6px 14px",
              borderRadius: 4, transition: "color 0.2s",
            }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "#999"}
            >{l.label}</a>
          ))}
        </div>

        <a href="#contact" style={{
          background: "#fff", color: "#080808",
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem",
          padding: "9px 22px", textDecoration: "none",
          transition: "opacity 0.2s",
        }}
        onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
        onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          Daftar
        </a>
      </div>
    </nav>
  );
}
