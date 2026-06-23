import { QRCodeSVG } from "qrcode.react";

const fmtTgl = (s) => {
  if (!s) return "-";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

export default function MemberIdCard({ id, nama, paket, tanggalAkhir }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #141414 0%, #0a0a0a 100%)",
      border: "1px solid #2a2a2a",
      maxWidth: 420,
      padding: "26px 26px 22px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #fff, #555)" }} />

      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
        Member Card
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "#f0ede8", marginBottom: 18, letterSpacing: "-0.01em" }}>
        ABDOMINAL GYM
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ background: "#fff", padding: 8, flexShrink: 0 }}>
          <QRCodeSVG value={id} size={92} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 3 }}>Nama</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "#f0ede8", marginBottom: 12, wordBreak: "break-word" }}>{nama}</div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 3 }}>Paket</div>
          <div style={{ fontSize: "0.85rem", color: "#ccc", marginBottom: 12 }}>{paket}</div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 3 }}>Berlaku s/d</div>
          <div style={{ fontSize: "0.85rem", color: "#ccc" }}>{fmtTgl(tanggalAkhir)}</div>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: "0.72rem", color: "#666", fontWeight: 300, lineHeight: 1.5, borderTop: "1px solid #1e1e1e", paddingTop: 14 }}>
        Tunjukkan QR ini ke admin/scanner saat check-in di gym.
      </p>
    </div>
  );
}
