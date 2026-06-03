import { useState } from "react";

const scheduleData = {
  Senin: [
    { time: "07:00 - 09:00", name: "Morning Workout", trainer: "Tyo", room: "Area Utama", level: "All Level", slots: 10 },
    { time: "15:00 - 17:00", name: "Strength Training", trainer: "Tyo", room: "Area Beban", level: "Intermediate", slots: 6 },
    { time: "17:00 - 19:00", name: "Fat Loss Program", trainer: "Elia", room: "Area Cardio", level: "All Level", slots: 8 },
  ],
  Selasa: [
    { time: "07:00 - 09:00", name: "Morning Workout", trainer: "Indah", room: "Area Utama", level: "All Level", slots: 10 },
    { time: "15:00 - 17:00", name: "Cardio & Endurance", trainer: "Indah", room: "Area Cardio", level: "Beginner", slots: 8 },
    { time: "17:00 - 19:00", name: "Body Toning", trainer: "Elia", room: "Area Utama", level: "All Level", slots: 7 },
  ],
  Rabu: [
    { time: "07:00 - 09:00", name: "Morning Workout", trainer: "Tyo", room: "Area Utama", level: "All Level", slots: 10 },
    { time: "15:00 - 17:00", name: "Full Body Workout", trainer: "Tyo", room: "Area Beban", level: "Intermediate", slots: 5 },
    { time: "17:00 - 19:00", name: "Flexibility Training", trainer: "Indah", room: "Area Yoga", level: "All Level", slots: 9 },
  ],
  Kamis: [
    { time: "07:00 - 09:00", name: "Morning Workout", trainer: "Elia", room: "Area Utama", level: "All Level", slots: 10 },
    { time: "15:00 - 17:00", name: "Lower Body Blast", trainer: "Tyo", room: "Area Beban", level: "Intermediate", slots: 6 },
    { time: "17:00 - 19:00", name: "Fat Loss Program", trainer: "Elia", room: "Area Cardio", level: "All Level", slots: 8 },
  ],
  Jumat: [
    { time: "07:00 - 09:00", name: "Morning Workout", trainer: "Indah", room: "Area Utama", level: "All Level", slots: 10 },
    { time: "15:00 - 17:00", name: "Upper Body Focus", trainer: "Tyo", room: "Area Beban", level: "Intermediate", slots: 4 },
    { time: "17:00 - 19:00", name: "Body Toning", trainer: "Indah", room: "Area Utama", level: "All Level", slots: 7 },
  ],
  Sabtu: [
    { time: "07:00 - 10:00", name: "Weekend Warrior", trainer: "Tyo", room: "Area Utama", level: "All Level", slots: 15 },
    { time: "10:00 - 12:00", name: "Group Training", trainer: "Elia", room: "Area Utama", level: "Beginner", slots: 12 },
    { time: "15:00 - 17:00", name: "Cardio Blast", trainer: "Indah", room: "Area Cardio", level: "All Level", slots: 10 },
  ],
  Minggu: [
    { time: "07:00 - 10:00", name: "Sunday Active", trainer: "Tyo", room: "Area Utama", level: "All Level", slots: 15 },
    { time: "15:00 - 17:00", name: "Recovery & Stretch", trainer: "Indah", room: "Area Yoga", level: "All Level", slots: 12 },
  ],
};

const levelColors = {
  "All Level": { bg: "#1a2a3a", text: "#5ba3d9" },
  "Beginner": { bg: "#1a3a1a", text: "#4caf50" },
  "Intermediate": { bg: "#3a2a1a", text: "#ff9800" },
};

export default function Schedule() {
  const days = Object.keys(scheduleData);
  const today = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][new Date().getDay()];
  const [activeDay, setActiveDay] = useState(days.includes(today) ? today : "Senin");

  return (
    <section id="schedule" style={{ background: "var(--dark)", padding: "100px 0", position: "relative" }}>
      <div className="h-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="section-eyebrow">Program Latihan</div>
            <h2 className="section-title">Jadwal<br /><em>Mingguan</em></h2>
          </div>
          <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: "14px 20px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: 4 }}>Jam Operasional</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--white)", letterSpacing: "-0.01em" }}>07:00 – 22:00 WIB</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gray-mid)", marginTop: 2 }}>Buka setiap hari</div>
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid var(--gray-dark)", overflowX: "auto" }}>
          {days.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              style={{
                background: "none", border: "none",
                borderBottom: activeDay === day ? "2px solid var(--white)" : "2px solid transparent",
                padding: "10px 20px", marginBottom: -1,
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.82rem",
                color: activeDay === day ? "var(--white)" : "var(--gray-mid)",
                cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
              {day}
              {day === today && <span style={{ marginLeft: 6, background: "var(--accent)", color: "var(--black)", fontSize: "0.55rem", padding: "2px 6px", borderRadius: "20px", fontFamily: "var(--font-mono)" }}>HARI INI</span>}
            </button>
          ))}
        </div>

        {/* Schedule rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scheduleData[activeDay].map((cls, i) => {
            const lc = levelColors[cls.level] || levelColors["All Level"];
            const trainerColors = { "Tyo": "#5ba3d9", "Elia": "#f48fb1", "Indah": "#a5d6a7" };
            return (
              <div key={i} style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", transition: "border-color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = "var(--gray)"}
                onMouseOut={e => e.currentTarget.style.borderColor = "var(--gray-dark)"}
              >
                <div style={{ minWidth: 130 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--white)" }}>{cls.time}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray-mid)", marginTop: 2 }}>{cls.room}</div>
                </div>
                <div style={{ width: 2, height: 36, background: "var(--accent)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--white)" }}>{cls.name}</span>
                    <span style={{ background: lc.bg, color: lc.text, fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "20px" }}>{cls.level}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", color: trainerColors[cls.trainer] || "var(--gray-mid)" }}>
                    Pelatih: <strong>{cls.trainer}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: cls.slots <= 3 ? "#f44336" : "var(--accent)" }}>{cls.slots}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray-mid)" }}>Slot</div>
                  </div>
                  <a href="#contact" className="btn btn-primary" style={{ textDecoration: "none", fontSize: "0.72rem", padding: "9px 16px" }}>Daftar</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
