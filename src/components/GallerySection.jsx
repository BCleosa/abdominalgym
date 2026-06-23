import { useState, useEffect, useRef, useCallback } from "react";

// Foto carousel suasana gym (landscape)
const carouselPhotos = [
  { src: "/gym1.jpg", caption: "Suasana Gym" },
  { src: "/gym2.jpg", caption: "Pintu Masuk" },
  { src: "/gym3.jpg", caption: "Lantai 1" },
  { src: "/gym4.jpg", caption: "Lantai 2" },
  { src: "/gym5.jpg", caption: "Lantai 3" },
  { src: "/gym6.jpg", caption: "Parkiran Mobil" },
  { src: "/gym7.jpg", caption: "Parkiran Motor" },
];

// Foto alat per lantai (portrait 3:4)
const floorPhotos = {
  "Lantai 1": [
    { src: "/gallery/lt1-1.jpg", caption: "Alat Lantai 1" },
    { src: "/gallery/lt1-2.jpg", caption: "Alat Lantai 1" },
    { src: "/gallery/lt1-3.jpg", caption: "Alat Lantai 1" },
    { src: "/gallery/lt1-4.jpg", caption: "Alat Lantai 1" },
    { src: "/gallery/lt1-5.jpg", caption: "Alat Lantai 1" },
  ],
  "Lantai 2": [
    { src: "/gallery/lt2-1.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-2.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-3.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-4.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-5.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-6.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-7.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-8.jpg", caption: "Alat Lantai 2" },
    { src: "/gallery/lt2-9.jpg", caption: "Alat Lantai 2" },
  ],
  "Lantai 3": [
    { src: "/gallery/lt3-1.jpg", caption: "Alat Lantai 3" },
    { src: "/gallery/lt3-2.jpg", caption: "Alat Lantai 3" },
    { src: "/gallery/lt3-3.jpg", caption: "Alat Lantai 3" },
    { src: "/gallery/lt3-4.jpg", caption: "Alat Lantai 3" },
    { src: "/gallery/lt3-5.jpg", caption: "Alat Lantai 3" },
  ],
};

export default function GallerySection() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeFloor, setActiveFloor] = useState("Lantai 1");
  const [lightbox, setLightbox] = useState(null);
  const timerRef = useRef(null);

  const photos = carouselPhotos;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % photos.length), [photos.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + photos.length) % photos.length), [photos.length]);

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
    <section id="gallery" style={{ background: "transparent", padding: isMobile ? "40px 0 30px" : "50px 0 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>

        {/* Heading */}
        <div style={{ marginBottom: isMobile ? 20 : 28 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>
            Fasilitas
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1, margin: 0 }}>
            Explore Our Training Floors<br />
          </h2>
        </div>

        <div style={{ position: "relative", userSelect: "none", marginBottom: 48 }}>
          <div
            style={{ width: "100%", aspectRatio: isMobile ? "4/3" : "16/7", overflow: "hidden", background: "#111", cursor: dragging ? "grabbing" : "grab", position: "relative" }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown} onMouseUp={onMouseUp}
            onMouseLeave={() => setDragging(false)}
          >
            {photos.map((p, i) => (
              <img key={i} src={p.src} alt={p.caption} draggable={false}
                style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: i === current ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: "none" }}
              />
            ))}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(to top, rgba(10,10,10,0.85), transparent)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 14, left: 18, color: "#aaa", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", pointerEvents: "none" }}>
              {photos[current].caption}
            </div>
          </div>

          {!isMobile && (
            <>
              <button onClick={handlePrev} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(15,15,15,0.85)", border: "1px solid #2a2a2a", color: "#aaa", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", transition: "all 0.2s", zIndex: 2 }}
                onMouseOver={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(15,15,15,0.85)"; e.currentTarget.style.color = "#aaa"; }}
              >←</button>
              <button onClick={handleNext} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(15,15,15,0.85)", border: "1px solid #2a2a2a", color: "#aaa", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", transition: "all 0.2s", zIndex: 2 }}
                onMouseOver={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(15,15,15,0.85)"; e.currentTarget.style.color = "#aaa"; }}
              >→</button>
            </>
          )}

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
            {photos.map((_, i) => (
              <button key={i} onClick={() => handleDot(i)}
                style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? "#f0ede8" : "#333", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }}
              />
            ))}
          </div>

          {isMobile && (
            <p style={{ textAlign: "center", color: "#444", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 10 }}>
              Geser untuk lihat lebih
            </p>
          )}
        </div>

        <div>
          {/* Subheading */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>
              Peralatan Gym
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1 }}>
              Alat Per Lantai
            </h3>
          </div>

          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #2a2a2a", marginBottom: 20, overflowX: "auto" }}>
            {Object.keys(floorPhotos).map(floor => (
              <button key={floor} onClick={() => setActiveFloor(floor)}
                style={{
                  background: "none", border: "none",
                  borderBottom: activeFloor === floor ? "2px solid #f0ede8" : "2px solid transparent",
                  padding: "9px 22px", marginBottom: -1,
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem",
                  color: activeFloor === floor ? "#f0ede8" : "#555",
                  cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
              >{floor}</button>
            ))}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 10 }}>
            {floorPhotos[activeFloor].map((photo, i) => (
              <div key={i} onClick={() => setLightbox({ photos: floorPhotos[activeFloor], index: i })}
                style={{ aspectRatio: "3/4", overflow: "hidden", cursor: "pointer", background: "#1a1a1a", position: "relative" }}
                onMouseOver={e => { const img = e.currentTarget.querySelector("img"); if (img) img.style.transform = "scale(1.05)"; }}
                onMouseOut={e => { const img = e.currentTarget.querySelector("img"); if (img) img.style.transform = "scale(1)"; }}
              >
                <img src={photo.src} alt={photo.caption}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", display: "block" }}
                  onError={e => e.target.style.display = "none"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <img src={lightbox.photos[lightbox.index].src} alt=""
            style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain" }}
            onClick={e => e.stopPropagation()}
          />
          {/* Prev / Next lightbox */}
          <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + l.photos.length) % l.photos.length })); }}
            style={{ position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid #333", color: "#fff", width: 44, height: 44, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >←</button>
          <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % l.photos.length })); }}
            style={{ position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.6)", border: "1px solid #333", color: "#fff", width: 44, height: 44, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >→</button>
          <button onClick={() => setLightbox(null)}
            style={{ position: "fixed", top: 16, right: 16, background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}
          >✕</button>
        </div>
      )}
    </section>
  );
}