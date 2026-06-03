export default function Footer({ onAdmin, onTrainer }) {
  return (
    <footer style={{ background: "#080808", borderTop: "1px solid #111", padding: "20px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "#333", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
          © 2024 Abdominal Gym Kudus
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="https://instagram.com/abdominalgym" target="_blank" rel="noopener"
            style={{ color: "#444", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#aaa"}
            onMouseOut={e => e.currentTarget.style.color = "#444"}
          >@abdominalgym</a>
          <a href="https://wa.me/6282324720045" target="_blank" rel="noopener"
            style={{ color: "#444", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#aaa"}
            onMouseOut={e => e.currentTarget.style.color = "#444"}
          >+62 823 2472 0045</a>
        </div>
      </div>
    </footer>
  );
}