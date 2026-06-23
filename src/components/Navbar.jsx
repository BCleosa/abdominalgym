import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const links = [
    { label: "Beranda", href: "#hero" },
    { label: "Harga", href: "#pricing" },
    { label: "Pelatih", href: "#trainers" },
    { label: "Kontak", href: "#contact" },
    { label: "Membership", href: "#/member", isPortal: true },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled || open ? "rgba(30,30,30,0.92)" : "transparent",
      borderBottom: scrolled ? "1px solid #222" : "1px solid transparent",
      backdropFilter: scrolled || open ? "blur(14px)" : "none",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <a href="#hero" style={{ textDecoration: "none", marginLeft: "-110px", marginTop: "20px" }}>
          <img src="/logogym.png" alt="Abdominal Gym" style={{ height: 200, objectFit: "contain" }} />
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 2 }}>
            {links.map(l => l.isPortal ? (
              <a key={l.label} href={l.href}
                onClick={e => { e.preventDefault(); window.location.hash = l.href; window.location.reload(); }}
                style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.875rem", color: "#999", textDecoration: "none", padding: "6px 14px", borderRadius: 4, transition: "color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "#999"}
              >{l.label}</a>
            ) : (
              <a key={l.label} href={l.href} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.875rem", color: "#999", textDecoration: "none", padding: "6px 14px", borderRadius: 4, transition: "color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "#999"}
              >{l.label}</a>
            ))}
          </div>
        )}

        {/* Desktop CTA */}
        {!isMobile && (
          <a href="#contact" style={{
            background: "#fff", color: "#080808",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.8rem",
            padding: "9px 22px", textDecoration: "none", transition: "opacity 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >Daftar</a>
        )}

        {/* Hamburger */}
        {isMobile && (
          <button onClick={() => setOpen(!open)} style={{
            display: "flex", flexDirection: "column", gap: 5,
            background: "none", border: "none", cursor: "pointer", padding: 8,
          }}>
            <span style={{ display: "block", width: 24, height: 2, background: "#fff", transition: "all 0.3s", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ display: "block", width: 24, height: 2, background: "#fff", transition: "all 0.3s", opacity: open ? 0 : 1 }} />
            <span style={{ display: "block", width: 24, height: 2, background: "#fff", transition: "all 0.3s", transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {open && isMobile && (
        <div style={{ background: "rgba(30,30,30,0.92)", borderTop: "1px solid #1a1a1a", padding: "12px 24px 20px" }}>
          {links.map(l => l.isPortal ? (
            <a key={l.label} href={l.href}
              onClick={e => { e.preventDefault(); setOpen(false); window.location.hash = l.href; window.location.reload(); }}
              style={{ display: "block", padding: "14px 0", borderBottom: "1px solid #151515", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "1rem", color: "#f0ede8", textDecoration: "none" }}>
              {l.label}
            </a>
          ) : (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ display: "block", padding: "14px 0", borderBottom: "1px solid #151515", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "1rem", color: "#f0ede8", textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} style={{
            display: "block", marginTop: 16,
            background: "#fff", color: "#080808",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem",
            padding: "12px", textAlign: "center", textDecoration: "none",
          }}>Daftar Sekarang</a>
        </div>
      )}
    </nav>
  );
}