import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getPerformances, type WorkCard } from "@/lib/data";

const YEAR_WIN = 5;

/* ── Bento sizes for current-repertoire grid — mirrors Home Featured ── */
const BENTO = [
  { cols: 2, rows: 2 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
];
const bentoFor = (i: number) => BENTO[i % 5];

/* ── Issue #4: reduced floating preview size ── */
function FloatingPreview({ url, visible }: { url: string | null; visible: boolean }) {
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const sx = useSpring(mx, { stiffness: 200, damping: 26 });
  const sy = useSpring(my, { stiffness: 200, damping: 26 });

  useEffect(() => {
    const h = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mx, my]);

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.84 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", left: 0, top: 0, zIndex: 100,
        width: 200, height: 260,
        x: sx, y: sy,
        translateX: "2rem", translateY: "-55%",
        pointerEvents: "none", overflow: "hidden",
      }}
    >
      {url && <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, var(--accent), transparent)" }} />
    </motion.div>
  );
}

/* ── Archive row — Issue #4: dimmer gold, smoother underline ── */
function ArchiveRow({ w, basePath, onHover, onLeave, index }: {
  w: WorkCard; basePath: string;
  onHover: (url: string | null) => void;
  onLeave: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`${basePath}/${w.slug}`}
        style={{ textDecoration: "none", display: "block", position: "relative" }}
        onMouseEnter={() => onHover(w.previewUrl ?? w.coverUrl)}
        onMouseLeave={onLeave}
        className="arc-row"
      >
        <div style={{ display: "grid", gridTemplateColumns: "4.5rem 1fr max-content", gap: "2rem", alignItems: "baseline", padding: "1rem 0", borderBottom: "1px solid rgba(245,240,229,0.04)" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "0.82rem", color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
            {w.year}
          </span>
          <span className="arc-title" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.05rem,2vw,1.5rem)", fontWeight: 300, color: "var(--text-1)", lineHeight: 1.1, transition: "letter-spacing 600ms var(--ease-soft), color 400ms" }}>
            {w.title}
          </span>
          <span style={{ fontSize: "0.6rem", color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {w.theatre}
          </span>
        </div>
        {/* Subtle dimmed gold sweep — smoother timing */}
        <div className="arc-line" style={{ position: "absolute", bottom: 0, left: 0, height: 1, width: 0, background: "rgba(212,175,55,0.45)", transition: "width 550ms var(--ease-soft)" }} />
      </Link>
    </motion.div>
  );
}

/* ── Current-repertoire card — bento grid with 3D tilt ── */
function CurrentCard({ w, basePath, i }: { w: WorkCard; basePath: string; i: number }) {
  const bento = bentoFor(i);
  const ref   = useRef<HTMLDivElement>(null);
  const rx    = useMotionValue(0);
  const ry    = useMotionValue(0);
  const srx   = useSpring(rx, { stiffness: 180, damping: 28 });
  const sry   = useSpring(ry, { stiffness: 180, damping: 28 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay: (i % 5) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={e => {
        const r = ref.current!.getBoundingClientRect();
        rx.set(((e.clientY - r.top)  / r.height - 0.5) * 10);
        ry.set(-((e.clientX - r.left) / r.width  - 0.5) * 10);
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ perspective: 900, gridColumn: `span ${bento.cols}`, gridRow: `span ${bento.rows}` }}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry, width: "100%", height: "100%" }}>
        <Link
          to={`${basePath}/${w.slug}`}
          style={{ display: "block", textDecoration: "none", position: "relative", overflow: "hidden", width: "100%", height: "100%", background: "var(--surface)" }}
          className="cur-card"
        >
          {w.coverUrl && (
            <img src={w.coverUrl} alt={w.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 750ms var(--ease-expo)" }}
              className="cur-img"
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, transparent 35%, rgba(7,5,10,0.97) 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.4rem 1.6rem" }}>
            <p className="eyebrow" style={{ marginBottom: "0.45rem", color: "var(--accent)", opacity: 0.6 }}>
              {w.theatre} · {w.year}
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem,2vw,1.5rem)", fontWeight: 300, color: "var(--text-1)", lineHeight: 1.05 }}>
              {w.title}
            </h2>
            {w.shortDescription && (
              <p style={{ fontSize: "0.7rem", color: "var(--text-2)", lineHeight: 1.6, marginTop: "0.4rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {w.shortDescription}
              </p>
            )}
          </div>
          <div className="cur-corner" style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)", transition: "width 380ms var(--ease-soft), height 380ms var(--ease-soft)" }} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function ArrowBtn({ dir, disabled, onClick }: { dir: "left" | "right"; disabled: boolean; onClick: () => void }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ background: "none", border: "none", cursor: disabled ? "default" : "pointer", color: disabled ? "rgba(245,240,229,0.12)" : "var(--text-3)", padding: "0.2rem", transition: "color 200ms", display: "inline-flex" }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    </button>
  );
}

export default function Works({ locale, kind = "performance" }: { locale: string; kind?: string }) {
  const [works, setWorks]           = useState<WorkCard[]>([]);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [page, setPage]             = useState(0);
  const [hoverUrl, setHoverUrl]     = useState<string | null>(null);
  const [previewOn, setPreviewOn]   = useState(false);

  useEffect(() => {
    getPerformances(locale as "ru" | "en", kind).then(setWorks);
    setActiveYear(null); setPage(0);
  }, [locale, kind]);

  const years   = [...new Set(works.map(w => w.year).filter((y): y is number => y != null))].sort((a, b) => b - a);
  const visible  = years.slice(page * YEAR_WIN, page * YEAR_WIN + YEAR_WIN);
  const filtered = activeYear ? works.filter(w => w.year === activeYear) : works;
  const current  = filtered.filter(w => w.status === "current");
  const archive  = filtered.filter(w => w.status === "archive");
  const basePath = kind === "project" ? "/projects" : kind === "lab" ? "/lab" : "/works";
  const title    = kind === "project" ? "Проекты" : kind === "lab" ? "Лаборатории" : "Спектакли";

  return (
    <>
      <FloatingPreview url={hoverUrl} visible={previewOn} />

      {/* Issue #7: reduced padding */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem clamp(1.5rem,3vw,2.5rem) 4rem" }}>

        {/* Header */}
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem", marginBottom: "3rem" }}>
          <div>
            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: 2, height: 40, background: "var(--accent)", opacity: 0.5, marginBottom: "1.2rem", transformOrigin: "top" }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 300, color: "var(--text-1)", letterSpacing: "-0.025em" }}
            >
              {title}
            </motion.h1>
          </div>

          {/* Year filter */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", paddingBottom: "0.25rem" }}
          >
            <button onClick={() => setActiveYear(null)}
              style={{ background: "none", border: "none", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", paddingBottom: 3, borderBottom: activeYear === null ? "1px solid var(--accent)" : "1px solid transparent", color: activeYear === null ? "var(--text-1)" : "var(--text-3)", transition: "color 200ms" }}>
              Все
            </button>
            {years.length > YEAR_WIN && <ArrowBtn dir="left" disabled={page === 0} onClick={() => setPage(p => p - 1)} />}
            {visible.map(y => (
              <button key={y} onClick={() => setActiveYear(y)}
                style={{ background: "none", border: "none", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", paddingBottom: 3, borderBottom: activeYear === y ? "1px solid var(--accent)" : "1px solid transparent", color: activeYear === y ? "var(--text-1)" : "var(--text-3)", transition: "color 200ms" }}>
                {y}
              </button>
            ))}
            {years.length > YEAR_WIN && <ArrowBtn dir="right" disabled={(page + 1) * YEAR_WIN >= years.length} onClick={() => setPage(p => p + 1)} />}
          </motion.div>
        </header>

        {/* Separator */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 1, background: "rgba(245,240,229,0.07)", marginBottom: "2.5rem", transformOrigin: "left" }}
        />

        {/* Current — bento grid, same padding as Featured */}
        {current.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            {kind === "performance" && (
              <p className="eyebrow" style={{ marginBottom: "1.5rem", color: "var(--accent)", opacity: 0.5 }}>Текущий репертуар</p>
            )}
            <div
              className="works-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridAutoRows: "min(260px, 20vw)",
                gap: 3,
              }}
            >
              {current.map((w, i) => <CurrentCard key={w.slug} w={w} basePath={basePath} i={i} />)}
            </div>
          </section>
        )}

        {/* Archive — editorial list */}
        {archive.length > 0 && (
          <section>
            {current.length > 0 && (
              <p className="eyebrow" style={{ marginBottom: "1.5rem", color: "var(--accent)", opacity: 0.5 }}>Архив</p>
            )}
            {archive.map((w, i) => (
              <ArchiveRow key={w.slug} w={w} basePath={basePath} index={i}
                onHover={url => { setHoverUrl(url); setPreviewOn(true); }}
                onLeave={() => setPreviewOn(false)}
              />
            ))}
          </section>
        )}
      </div>

      <style>{`
        .cur-img { transition: transform 750ms var(--ease-expo); }
        .cur-card:hover .cur-img { transform: scale(1.06); }
        .cur-card:hover .cur-corner { width: 28px !important; height: 28px !important; }
        .arc-row:hover .arc-title { letter-spacing: 0.025em !important; color: rgba(212,175,55,0.7) !important; }
        .arc-row:hover .arc-line { width: 100% !important; }
        @media(max-width:699px) {
          .works-grid { grid-template-columns: 1fr !important; grid-auto-rows: 66vw !important; }
          .works-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </>
  );
}
