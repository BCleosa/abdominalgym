import { initialMembers, initialTrainers, initialSchedules, initialAttendances, initialFinances } from "../../data/initialData";

export default function DashboardPage() {
  const members = JSON.parse(localStorage.getItem("gym_members") || JSON.stringify(initialMembers));
  const trainers = JSON.parse(localStorage.getItem("gym_trainers") || JSON.stringify(initialTrainers));
  const schedules = JSON.parse(localStorage.getItem("gym_schedules") || JSON.stringify(initialSchedules));
  const finances = JSON.parse(localStorage.getItem("gym_finances") || JSON.stringify(initialFinances));

  const activeMembers = members.filter(m => m.status === "active").length;
  const totalIncome = finances.filter(f => f.type === "pemasukan").reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter(f => f.type === "pengeluaran").reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;

  const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const stats = [
    { label: "Total Member", value: members.length, sub: `${activeMembers} aktif`, icon: "👥", color: "#5ba3d9" },
    { label: "Pelatih Aktif", value: trainers.filter(t => t.status === "active").length, sub: `${trainers.length} terdaftar`, icon: "💪", color: "var(--accent)" },
    { label: "Kelas Tersedia", value: schedules.length, sub: "kelas per minggu", icon: "📅", color: "#9c27b0" },
    { label: "Saldo Bersih", value: fmt(balance), sub: `Pemasukan: ${fmt(totalIncome)}`, icon: "💰", color: balance >= 0 ? "#4caf50" : "#f44336" },
  ];

  const recentFinances = finances.slice(0, 5);

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: stat.color }} />
            <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>{stat.icon}</div>
            <div style={{ fontFamily: "var(--font-condensed)", fontWeight: 800, fontSize: "1.5rem", color: "var(--white)", letterSpacing: "0.02em", lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: "var(--font-condensed)", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-mid)", marginTop: 6 }}>{stat.label}</div>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.725rem", color: stat.color, marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Recent Transactions */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "24px" }}>
          <div style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white)", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--gray-dark)" }}>
            Transaksi Terbaru
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentFinances.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--gray-dark)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.85rem", color: "var(--white)", fontWeight: 600 }}>{f.description}</div>
                  <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.7rem", color: "var(--gray-mid)", marginTop: 2 }}>{f.category} · {f.date}</div>
                </div>
                <div style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.9rem", color: f.type === "pemasukan" ? "#4caf50" : "#f44336", marginLeft: 16 }}>
                  {f.type === "pemasukan" ? "+" : "-"}{fmt(f.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Member by package */}
          <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white)", marginBottom: 16 }}>
              Member per Paket
            </div>
            {["Basic", "Premium", "VIP"].map(pkg => {
              const count = members.filter(m => m.package === pkg).length;
              const pct = Math.round((count / members.length) * 100);
              return (
                <div key={pkg} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "var(--gray-light)" }}>{pkg}</span>
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "var(--accent)" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 4, background: "var(--gray-dark)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Finance Summary */}
          <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--white)", marginBottom: 16 }}>
              Ringkasan Keuangan
            </div>
            {[
              { label: "Total Pemasukan", value: fmt(totalIncome), color: "#4caf50" },
              { label: "Total Pengeluaran", value: fmt(totalExpense), color: "#f44336" },
              { label: "Saldo Bersih", value: fmt(balance), color: balance >= 0 ? "var(--accent)" : "#f44336" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--gray-dark)" : "none" }}>
                <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "var(--gray-mid)" }}>{row.label}</span>
                <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.875rem", color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
