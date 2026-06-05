import { useState, useEffect, useRef, useCallback } from "react";

const photos = [
  { src: "/gym1.jpg", caption: "Suasana Gym" },
  { src: "/gym2.jpg", caption: "Area Beban" },
  { src: "/gym3.jpg", caption: "Area Kardio" },
  { src: "/gym4.jpg", caption: "Alat Utama" },
  { src: "/gym5.jpg", caption: "Member Latihan" },
  { src: "/gym6.jpg", caption: "Pintu Masuk" },
];

export default function GallerySection() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % photos.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + photos.length) % photos.length), []);

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleDot = (i) => { setCurrent(i); resetTimer(); };

  // Touch/drag support
  const onTouchStart = (e) => { setStartX(e.touches[0].clientX); setDragging(true); };
  const onTouchEnd = (e) => {
    if (!dragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    setDragging(false);
  };
  const onMouseDown = (e) => { setStartX(e.clientX); setDragging(true); };
  const onMouseUp = (e) => {
    if (!dragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    setDragging(false);
  };

  return (
    <section
      id="gallery"
      style={{
        background: "#0a0a0a",
        padding: isMobile ? "40px 0 30px" : "50px 0 30px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {/* Heading */}
        <div style={{ marginBottom: isMobile ? 20 : 28 }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#555",
            marginBottom: 10,
          }}>
            Fasilitas
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
            letterSpacing: "-0.02em",
            color: "#f0ede8",
            lineHeight: 1,
            margin: 0,
          }}>
            See Where<br />
            <span style={{ color: "rgba(240,237,232,0.35)", fontStyle: "italic" }}>You Train.</span>
          </h2>
        </div>

        {/* Carousel */}
        <div style={{ position: "relative", userSelect: "none" }}>
          {/* Main image */}
          <div
            style={{
              width: "100%",
              aspectRatio: isMobile ? "4/3" : "16/7",
              overflow: "hidden",
              background: "#111",
              cursor: dragging ? "grabbing" : "grab",
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={() => setDragging(false)}
          >
            {photos.map((p, i) => (
              <img
                key={i}
                src={p.src}
                alt={p.caption}
                draggable={false}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  opacity: i === current ? 1 : 0,
                  transition: "opacity 0.6s ease",
                  pointerEvents: "none",
                }}
              />
            ))}
            {/* Gradient overlay bottom */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "35%",
              background: "linear-gradient(to top, rgba(10,10,10,0.85), transparent)",
              pointerEvents: "none",
            }} />
            {/* Caption */}
            <div style={{
              position: "absolute",
              bottom: 14, left: 18,
              color: "#aaa",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              pointerEvents: "none",
            }}>
              {photos[current].caption}
            </div>
          </div>

          {/* Arrow buttons — shown on desktop, hidden on mobile (swipe instead) */}
          {!isMobile && (
            <>
              <button
                onClick={handlePrev}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(15,15,15,0.85)",
                  border: "1px solid #2a2a2a",
                  color: "#aaa",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background 0.2s, color 0.2s",
                  zIndex: 2,
                }}
                onMouseOver={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(15,15,15,0.85)"; e.currentTarget.style.color = "#aaa"; }}
              >
                ←
              </button>
              <button
                onClick={handleNext}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(15,15,15,0.85)",
                  border: "1px solid #2a2a2a",
                  color: "#aaa",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background 0.2s, color 0.2s",
                  zIndex: 2,
                }}
                onMouseOver={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(15,15,15,0.85)"; e.currentTarget.style.color = "#aaa"; }}
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 16,
        }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? "#f0ede8" : "#333",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.3s, background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Mobile swipe hint */}
        {isMobile && (
          <p style={{
            textAlign: "center",
            color: "#444",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 10,
          }}>
            Geser untuk lihat lebih
          </p>
        )}
      </div>
    </section>
  );
}