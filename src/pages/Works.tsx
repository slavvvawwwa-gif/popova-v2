import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getPerformances, type WorkCard } from "@/lib/data";

const YEAR_WIN = 5;

/* ── Floating image that follows cursor ── */
function FloatingPreview({ url, visible }: { url: string | null; visible: boolean }) {
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const sx = useSpring(mx, { stiffness: 220, damping: 28 });
  const sy = useSpring(my, { stiffness: 220, damping: 28 });

  useEffect(() => {
    const handler = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mx, my]);

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.88 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", left: 0, top: 0, zIndex: 100,
        width: 340, height: 440,
        x: sx, y: sy,
        translateX: "2rem", translateY: "-55%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {url && (
        <img src={url} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
      )}
      {/* Red edge accent */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--accent)" }}/>
    </motion.div>
  );
}

/* ── Archive row ── */
function ArchiveRow({ w, basePath, onHover, onLeave, index }: {
  w: WorkCard; basePath: string;
  onHover: (url: string | null) => void;
  onLeave: () => void;
  index: number;
}) {
  const lineRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`${basePath}/${w.slug}`}
        style={{ textDecoration: "none", display: "block", position: "relative" }}
        onMouseEnter={() => onHover(w.previewUrl ?? w.coverUrl)}
        onMouseLeave={onLeave}
        className="arc-row"
      >
        <div style={{ display: "grid", gridTemplateColumns: "5rem 1fr max-content", gap: "2rem", alignItems: "baseline", padding: "1.2rem 0", borderBottom: "1px solid rgba(240,240,240,0.05)" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "0.85rem", color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>{w.year}</span>
          <span style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.1rem,2.2vw,1.6rem)", fontWeight: 300, color: "var(--text-1)", lineHeight: 1.1, transition: "letter-spacing 400ms var(--ease-soft)" }} className="arc-title">
            {w.title}
          </span>
          <span style={{ fontSize: "0.65rem", color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{w.theatre}</span>
        </div>
        {/* Reveal line */}
        <div ref={lineRef} style={{ position: "absolute", bottom: 0, left: 0, height: 1, width: 0, background: "var(--accent)", transition: "width 350ms var(--ease-soft)" }} className="arc-line"/>
      </Link>
    </motion.div>
  );
}

/* ── Card for current repertoire ── */
function CurrentCard({ w, basePath, i }: { w: WorkCard; basePath: string; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`${basePath}/${w.slug}`} style={{ display: "block", textDecoration: "none", position: "relative", overflow: "hidden", aspectRatio: "3/4", background: "var(--surface)" }}>
        {w.coverUrl && (
          <img src={w.coverUrl} alt={w.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 700ms var(--ease-expo)" }}
            className="cur-img"/>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.92) 0%, transparent 55%)" }}/>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem" }}>
          <p className="eyebrow" style={{ marginBottom: "0.4rem" }}>{w.theatre} · {w.year}</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 300, color: "var(--text-1)", lineHeight: 1.05 }}>
            {w.title}
          </h2>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--accent)", transform: "scaleY(0)", transformOrigin: "bottom", transition: "transform 350ms var(--ease-soft)" }} className="cur-bar"/>
      </Link>
    </motion.div>
  );
}

function ArrowBtn({ dir, disabled, onClick }: { dir:"left"|"right"; disabled:boolean; onClick:()=>void }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ background:"none", border:"none", cursor:disabled?"default":"pointer", color:disabled?"rgba(240,240,240,0.14)":"var(--text-2)", padding:"0.2rem", transition:"color 200ms", display:"inline-flex" }}
      onMouseEnter={e=>{ if(!disabled)(e.currentTarget as HTMLElement).style.color="var(--accent)"; }}
      onMouseLeave={e=>{ if(!disabled)(e.currentTarget as HTMLElement).style.color="var(--text-2)"; }}
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ transform:dir==="left"?"rotate(180deg)":"none" }}>
        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    </button>
  );
}

export default function Works({ locale, kind = "performance" }: { locale: string; kind?: string }) {
  const [works, setWorks] = useState<WorkCard[]>([]);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hoverUrl, setHoverUrl] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    getPerformances(locale as "ru"|"en", kind).then(setWorks);
    setActiveYear(null); setPage(0);
  }, [locale, kind]);

  const years = [...new Set(works.map(w => w.year).filter((y): y is number => y != null))].sort((a, b) => b - a);
  const visible = years.slice(page * YEAR_WIN, page * YEAR_WIN + YEAR_WIN);

  const filtered = activeYear ? works.filter(w => w.year === activeYear) : works;
  const current = filtered.filter(w => w.status === "current");
  const archive = filtered.filter(w => w.status === "archive");
  const basePath = kind === "project" ? "/projects" : kind === "lab" ? "/lab" : "/works";
  const title = kind === "project" ? "Проекты" : kind === "lab" ? "Лаборатории" : "Спектакли";

  const handleHover = (url: string | null) => { setHoverUrl(url); setPreviewVisible(true); };
  const handleLeave = () => setPreviewVisible(false);

  return (
    <>
      <FloatingPreview url={hoverUrl} visible={previewVisible}/>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8rem 2rem 6rem" }}>
        {/* Header */}
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "1.5rem", marginBottom: "4rem" }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,6vw,5rem)", fontWeight: 300, color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            {title}
          </motion.h1>

          {/* Year filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}
          >
            <button onClick={() => setActiveYear(null)}
              style={{ background:"none", border:"none", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", cursor:"pointer", paddingBottom:2, borderBottom: activeYear===null ? "1px solid var(--accent)" : "1px solid transparent", color: activeYear===null ? "var(--text-1)" : "var(--text-2)", transition:"color 200ms" }}>
              Все
            </button>
            {years.length > YEAR_WIN && <ArrowBtn dir="left" disabled={page===0} onClick={() => setPage(p => p-1)}/>}
            {visible.map(y => (
              <button key={y} onClick={() => setActiveYear(y)}
                style={{ background:"none", border:"none", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", cursor:"pointer", paddingBottom:2, borderBottom: activeYear===y ? "1px solid var(--accent)" : "1px solid transparent", color: activeYear===y ? "var(--text-1)" : "var(--text-2)", transition:"color 200ms" }}>
                {y}
              </button>
            ))}
            {years.length > YEAR_WIN && <ArrowBtn dir="right" disabled={(page+1)*YEAR_WIN >= years.length} onClick={() => setPage(p => p+1)}/>}
          </motion.div>
        </header>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 1, background: "rgba(240,240,240,0.08)", marginBottom: "3rem", transformOrigin: "left" }}
        />

        {/* Current — card grid */}
        {current.length > 0 && (
          <section style={{ marginBottom: "6rem" }}>
            {kind === "performance" && (
              <p className="eyebrow" style={{ marginBottom: "2rem" }}>Текущий репертуар</p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(260px,100%),1fr))", gap: 2 }}>
              {current.map((w, i) => <CurrentCard key={w.slug} w={w} basePath={basePath} i={i}/>)}
            </div>
          </section>
        )}

        {/* Archive — editorial list */}
        {archive.length > 0 && (
          <section>
            {current.length > 0 && (
              <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Архив</p>
            )}
            {archive.map((w, i) => (
              <ArchiveRow key={w.slug} w={w} basePath={basePath} index={i} onHover={handleHover} onLeave={handleLeave}/>
            ))}
          </section>
        )}
      </div>

      <style>{`
        .cur-img:hover { transform: scale(1.05); }
        a:hover .cur-bar { transform: scaleY(1) !important; }
        .arc-row:hover .arc-title { letter-spacing: 0.04em; }
        .arc-row:hover .arc-line { width: 100% !important; }
      `}</style>
    </>
  );
}
