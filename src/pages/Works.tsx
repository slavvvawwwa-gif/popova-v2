import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPerformances, type WorkCard } from "@/lib/data";
import WorkMosaic from "@/components/WorkMosaic";
import ScrambleText from "@/components/ui/ScrambleText";
const YEAR_WIN = 5;

/* ── Click preview: fixed at click position ── */
function ClickPreview({ divRef, url, visible }: {
  divRef: React.RefObject<HTMLDivElement | null>;
  url: string | null;
  visible: boolean;
}) {
  return (
    <div
      ref={divRef}
      style={{
        position: "fixed", left: 0, top: 0,
        width: 200, height: 265,
        transform: "translateY(-50%)",
        zIndex: 200, pointerEvents: "none", overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {visible && url && (
          <motion.div
            key={url}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%", overflow: "hidden" }}
          >
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom, var(--accent), transparent)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Archive row: 1st click = preview, 2nd click = navigate, leave = dismiss ── */
function ArchiveRow({ w, index, active, onFirstClick, onSecondClick, onLeave }: {
  w: WorkCard; index: number;
  active: boolean;
  onFirstClick: (url: string | null, x: number, y: number) => void;
  onSecondClick: () => void;
  onLeave: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (active) {
      onSecondClick();
    } else {
      onFirstClick(w.previewUrl ?? w.coverUrl, e.clientX, e.clientY);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="arc-row"
        style={{ textDecoration: "none", display: "block", position: "relative", cursor: "pointer" }}
        onClick={handleClick}
        onMouseLeave={onLeave}
      >
        <div className="arc-inner" style={{ display: "grid", gridTemplateColumns: "4.5rem minmax(0, 1.4fr) minmax(0, 1fr)", gap: "2rem", alignItems: "baseline", padding: "0.9rem 0", borderBottom: `1px solid ${active ? "rgba(212,175,55,0.15)" : "rgba(245,240,229,0.04)"}` }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "0.82rem", color: "var(--text-3)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
            {w.year}
          </span>
          <span className="arc-title" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.05rem,2vw,1.5rem)", fontWeight: 300, color: active ? "var(--accent)" : "var(--text-1)", lineHeight: 1.2, transition: "color 300ms", minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>
            {w.title}
          </span>
          <span className="arc-theatre" style={{ fontSize: "0.72rem", color: "var(--text-2)", lineHeight: 1.6, overflowWrap: "anywhere", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
            {w.theatre}
          </span>
        </div>
      </div>
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
  const [activeSlug,     setActiveSlug]     = useState<string | null>(null);
  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPerformances(locale as "ru" | "en", kind).then(setWorks);
    setActiveYear(null); setPage(0); setActiveSlug(null); setPreviewVisible(false);
  }, [locale, kind]);

  // Dismiss preview on outside click (mobile tap elsewhere)
  useEffect(() => {
    if (!activeSlug) return;
    const dismiss = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".arc-row")) {
        setActiveSlug(null); setPreviewVisible(false);
      }
    };
    document.addEventListener("click", dismiss);
    return () => document.removeEventListener("click", dismiss);
  }, [activeSlug]);

  const handleFirstClick = (slug: string, url: string | null, x: number, y: number) => {
    if (previewRef.current) {
      previewRef.current.style.left = `${x + 24}px`;
      previewRef.current.style.top  = `${y}px`;
    }
    setPreviewUrl(url);
    setActiveSlug(slug);
    setPreviewVisible(true);
  };
  const handleSecondClick = (slug: string, basePath: string) => {
    window.location.assign(`${basePath}/${slug}`);
  };
  const handleLeave = () => { setActiveSlug(null); setPreviewVisible(false); };

  const years   = [...new Set(works.map(w => w.year).filter((y): y is number => y != null))].sort((a, b) => b - a);
  const visible  = years.slice(page * YEAR_WIN, page * YEAR_WIN + YEAR_WIN);
  const filtered = activeYear ? works.filter(w => w.year === activeYear) : works;
  const current  = filtered.filter(w => w.status === "current");
  const archive  = filtered.filter(w => w.status === "archive");
  const basePath = kind === "project" ? "/projects" : kind === "lab" ? "/lab" : "/works";
  const title    = kind === "project" ? "Проекты" : kind === "lab" ? "Лаборатории" : "Спектакли";

  return (
    <>
      {createPortal(<ClickPreview divRef={previewRef} url={previewUrl} visible={previewVisible} />, document.body)}

      <div className="works-outer" style={{ maxWidth: 1600, margin: "0 auto", padding: "5rem clamp(1.5rem,3vw,2.5rem) 3rem" }}>

        {/* Header */}
        <header className="works-header" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem", marginBottom: "2.5rem" }}>
          <div>
            <motion.div
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: 2, height: 36, background: "var(--accent)", opacity: 0.5, marginBottom: "1rem", transformOrigin: "top" }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 300, color: "var(--text-1)", letterSpacing: "-0.025em" }}
            >
              <ScrambleText text={title} />
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
          className="works-sep"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 1, background: "rgba(245,240,229,0.07)", marginBottom: "2rem", transformOrigin: "left" }}
        />

        {/* Current repertoire, in chronological reading order */}
        {current.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            {kind === "performance" && (
              <p className="eyebrow works-labels" style={{ marginBottom: "1.2rem", color: "var(--accent)", opacity: 0.9 }}>Текущий репертуар</p>
            )}
            <WorkMosaic works={current} />
          </section>
        )}

        {/* Archive */}
        {archive.length > 0 && (
          <section className="works-archive">
            {current.length > 0 && (
              <p className="eyebrow" style={{ marginBottom: "1.2rem", color: "var(--accent)", opacity: 0.9 }}>Архив</p>
            )}
            {archive.map((w, i) => (
              <ArchiveRow key={w.slug} w={w} index={i}
                active={activeSlug === w.slug}
                onFirstClick={(url, x, y) => handleFirstClick(w.slug, url, x, y)}
                onSecondClick={() => handleSecondClick(w.slug, basePath)}
                onLeave={handleLeave}
              />
            ))}
          </section>
        )}
      </div>

      <style>{`
        @media(max-width:699px) {
          .works-outer { padding-left: 0 !important; padding-right: 0 !important; }
          .works-header { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .works-sep { margin-left: 1.25rem !important; margin-right: 1.25rem !important; }
          .works-labels { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .works-archive { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .arc-inner { grid-template-columns: 3.5rem 1fr !important; gap: 1rem !important; }
          .arc-theatre { grid-column: 2; line-height: 1.6; }
        }
      `}</style>
    </>
  );
}
