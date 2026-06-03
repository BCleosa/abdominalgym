import { useState, useEffect, useRef } from "react";

const photos = [
  { src: "/gym1.jpg", caption: "Area Latihan Utama" },
  { src: "/gym2.jpg", caption: "Peralatan Lengkap" },
  { src: "/gym3.jpg", caption: "Zona Kardio" },
  { src: "/gym4.jpg", caption: "Free Weights Area" },
  { src: "/gym5.jpg", caption: "Suasana Gym" },
  { src: "/gym6.jpg", caption: "Fasilitas Modern" },
];

export default function GallerySection() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [animDir, setAnimDir] = useState(null); // "left" | "right"
  const timerRef = useRef(null);

  const goTo = (index, dir) => {
    setAnimDir(dir);
    setTimeout(() => {
      setCurrent((index + photos.length) % photos.length);
      setAnimDir(null);
    }, 300);
  };

  const prev = () => goTo(current - 1, "right");
  const next = () => goTo(current + 1, "left");

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(() => next(), 4000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  // Touch / drag support
  const handleDragStart = (e) => {
    setDragging(true);
    setDragStart(e.touches ? e.touches[0].clientX : e.clientX);
  };
  const handleDragEnd = (e) => {
    if (!dragging) return;
    const end = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart - end;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setDragging(false);
  };

  const prevIdx = (current - 1 + photos.length) % photos.length;
  const nextIdx = (current + 1) % photos.length;

  return (
    <section
      id="gallery"
      style={{
        background: "#080808",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", marginBottom: 52 }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: "#555",
          textTransform: "uppercase",
          marginBottom: 12,
        }}>Galeri</p>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 800,
          color: "#f0ede8",
          lineHeight: 1.1,
          margin: 0,
        }}>
          See Where<br />
          <span style={{ color: "rgba(240,237,232,0.35)", fontStyle: "italic" }}>You Train</span>
        </h2>
      </div>

      {/* Carousel */}
      <div
        style={{ position: "relative", userSelect: "none", cursor: dragging ? "grabbing" : "grab" }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Main slide */}
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "0 80px",
          position: "relative",
        }}>

          <div
            onClick={prev}
            style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              width: 64, height: 200,
              backgroundImage: `url(${photos[prevIdx].src})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.25,
              cursor: "pointer",
              transition: "opacity 0.3s",
              borderRadius: 4,
            }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.45"}
            onMouseOut={e => e.currentTarget.style.opacity = "0.25"}
          />
          <div
            onClick={next}
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              width: 64, height: 200,
              backgroundImage: `url(${photos[nextIdx].src})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.25,
              cursor: "pointer",
              transition: "opacity 0.3s",
              borderRadius: 4,
            }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.45"}
            onMouseOut={e => e.currentTarget.style.opacity = "0.25"}
          />

          <div style={{
            aspectRatio: "16/9",
            overflow: "hidden",
            borderRadius: 6,
            position: "relative",
          }}>
            <img
              key={current}
              src={photos[current].src}
              alt={photos[current].caption}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                animation: animDir
                  ? `slideOut${animDir === "left" ? "Left" : "Right"} 0.3s ease forwards`
                  : "slideIn 0.35s ease forwards",
              }}
            />

            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
              padding: "40px 24px 20px",
            }}>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: "rgba(240,237,232,0.85)",
                letterSpacing: "0.05em",
              }}>{photos[current].caption}</span>
            </div>
          </div>
        </div>

        <button
          onClick={prev}
          style={{
            position: "absolute", left: "calc(50% - 450px + 8px)", top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", borderRadius: 0,
            fontSize: "1.1rem",
            transition: "background 0.2s",
            zIndex: 2,
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        >←</button>
        <button
          onClick={next}
          style={{
            position: "absolute", right: "calc(50% - 450px + 8px)", top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", borderRadius: 0,
            fontSize: "1.1rem",
            transition: "background 0.2s",
            zIndex: 2,
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        >→</button>
      </div>

      {/* Dots */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 8,
        marginTop: 28,
      }}>
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "left" : "right")}
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              background: i === current ? "#f0ede8" : "#333",
              border: "none", cursor: "pointer",
              borderRadius: 3,
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* CSS keyframes injected */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(40px); }
        }
      `}</style>
    </section>
  );
}
