import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getFeatured, type WorkCard } from "@/lib/data";
import CharReveal from "@/components/ui/CharReveal";
import ThreeHero from "@/components/three/ThreeHero";

/* ── Liquid-fill letter (В / П): fills gold from bottom on hover ── */
function LiquidLetter({
  char, delay, baseColor,
}: { char: string; delay: number; baseColor: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.span
      initial={{ opacity: 0, y: "0.6em" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",
        whiteSpace: "pre",
        cursor: "default",
        // Gradient: gold occupies bottom half, base-color occupies top half
        // background-size 200% tall → slide position to reveal gold from bottom
        background: `linear-gradient(to top, var(--accent) 50%, ${baseColor} 50%)`,
        backgroundSize: "100% 200%",
        backgroundPosition: hovered ? "0% 100%" : "0% 0%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        transition: "background-position 1.75s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {char}
    </motion.span>
  );
}

/* ── Bento card sizes for featured grid ── */
const BENTO = [
  { cols: 2, rows: 2 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
];
const bentoFor = (i: number) => BENTO[i % 5];

function FeaturedCard({ w, i }: { w: WorkCard; i: number }) {
  const path  = w.kind === "project" ? "/projects" : w.kind === "lab" ? "/lab" : "/works";
  const bento = bentoFor(i);
  const ref   = useRef<HTMLDivElement>(null);
  const rx    = useMotionValue(0);
  const ry    = useMotionValue(0);
  const srx   = useSpring(rx, { stiffness: 180, damping: 28 });
  const sry   = useSpring(ry, { stiffness: 180, damping: 28 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    rx.set(((e.clientY - r.top)  / r.height - 0.5) * 12);
    ry.set(-((e.clientX - r.left) / r.width  - 0.5) * 12);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (i % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        perspective: 900,
        gridColumn: `span ${bento.cols}`,
        gridRow:    `span ${bento.rows}`,
      }}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry, width: "100%", height: "100%" }}>
        <Link
          to={`${path}/${w.slug}`}
          style={{ display: "block", textDecoration: "none", position: "relative", overflow: "hidden", width: "100%", height: "100%", background: "var(--surface)" }}
          className="feat-link"
        >
          {w.coverUrl && (
            <img
              src={w.coverUrl} alt={w.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              className="feat-img"
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, transparent 30%, rgba(7,5,10,0.97) 100%)" }}/>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem 1.75rem" }}>
            <p className="eyebrow" style={{ marginBottom: "0.6rem", color: "var(--accent)", opacity: 0.65 }}>
              {w.theatre} · {w.year}
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem,2.4vw,1.9rem)", fontWeight: 300, lineHeight: 1.05, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              {w.title}
            </h2>
            {w.shortDescription && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-2)", lineHeight: 1.6, marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {w.shortDescription}
              </p>
            )}
          </div>
          {/* Gold corner */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)", transition: "width 380ms var(--ease-soft), height 380ms var(--ease-soft)" }} className="feat-corner"/>
          {/* Arrow */}
          <div style={{ position: "absolute", top: "1.2rem", right: "1.2rem", opacity: 0, transition: "opacity 300ms", fontSize: "0.9rem", color: "var(--accent)" }} className="feat-arrow">↗</div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function Home({ locale }: { locale: string }) {
  const [featured, setFeatured] = useState<WorkCard[]>([]);
  const heroRef   = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const mouseX    = useMotionValue(0);
  const mouseY    = useMotionValue(0);
  const smX       = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const smY       = useSpring(mouseY, { stiffness: 40, damping: 18 });

  useEffect(() => { getFeatured(locale as "ru"|"en").then(setFeatured); }, [locale]);

  const onMouseMove = (e: React.MouseEvent) => {
    const r = heroRef.current!.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width  * 40;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height * 25;
    mouseX.set(dx); mouseY.set(dy);
    mouseXRef.current = dx; mouseYRef.current = dy;
  };

  return (
    <>
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        onMouseMove={onMouseMove}
        style={{ position: "relative", height: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
      >
        <ThreeHero mouseX={mouseXRef} mouseY={mouseYRef} />

        {/* Mouse-track glow */}
        <motion.div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(212,175,55,0.055) 0%, transparent 70%)",
          x: smX, y: smY,
        }}/>

        {/* Eyebrow */}
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, letterSpacing: "0.38em" }}
          animate={{ opacity: 1, letterSpacing: "0.24em" }}
          transition={{ duration: 1.4, delay: 0.1 }}
          style={{ marginBottom: "3.5rem", position: "relative", zIndex: 2, color: "var(--accent)", opacity: 0.6 }}
        >
          Театральный режиссёр
        </motion.p>

        {/* Main title — В and П get liquid fill effect */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", lineHeight: 0.82, userSelect: "none" }}>
          <motion.div style={{ x: smX, y: smY, display: "block" }}>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, letterSpacing: "-0.03em", margin: 0 }}>
              <span style={{ display: "block", fontSize: "clamp(5.5rem,15vw,14rem)", color: "var(--text-1)" }}>
                <LiquidLetter char="В" delay={0.3} baseColor="var(--text-1)" />
                <CharReveal text="арвара" delay={0.3 + 0.05} stagger={0.05} />
              </span>
              <span style={{ display: "block", fontSize: "clamp(4.5rem,12vw,11rem)", color: "rgba(245,240,229,0.28)", fontStyle: "italic" }}>
                <LiquidLetter char="П" delay={0.6} baseColor="rgba(245,240,229,0.28)" />
                <CharReveal text="опова" delay={0.6 + 0.045} stagger={0.045} style={{ color: "rgba(245,240,229,0.28)", fontStyle: "italic" }} />
              </span>
            </h1>
          </motion.div>
        </div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "clamp(80px,14vw,160px)", height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)", margin: "3rem auto", transformOrigin: "center", position: "relative", zIndex: 2 }}
        />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          style={{ display: "flex", gap: "3.5rem", alignItems: "center", position: "relative", zIndex: 2 }}
        >
          <Link to="/works" style={{ fontSize: "0.58rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-1)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.85rem", paddingBottom: 4, borderBottom: "1px solid var(--accent)" }}>
            Спектакли
            <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
              <path d="M0 4.5h16M12 1.5l4 3-4 3" stroke="currentColor" strokeWidth="0.9"/>
            </svg>
          </Link>
          <Link to="/about" style={{ fontSize: "0.58rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", transition: "color 300ms" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
          >
            Обо мне
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 2 }}
        >
          <span className="eyebrow" style={{ fontSize: "0.48rem", color: "var(--text-3)" }}>scroll</span>
          <motion.div
            animate={{ scaleY: [1, 0.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
            style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--accent), transparent)", transformOrigin: "top" }}
          />
        </motion.div>

        {/* Decorative year */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.025 }}
          transition={{ duration: 2.5, delay: 1.8 }}
          style={{ position: "absolute", right: "-0.04em", bottom: "-0.12em", fontFamily: "var(--serif)", fontSize: "clamp(12rem,26vw,26rem)", fontWeight: 300, color: "var(--text-1)", lineHeight: 1, pointerEvents: "none", userSelect: "none", zIndex: 1 }}
        >
          {new Date().getFullYear()}
        </motion.span>

      </section>

      {/* ── Featured works ── */}
      {featured.length > 0 && (
        <section className="feat-section" style={{ padding: "4rem clamp(1.5rem,3vw,2.5rem) 5rem", maxWidth: 1600, margin: "0 auto", width: "100%" }}>
          <motion.div
            className="feat-header"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2.5rem" }}
          >
            <div style={{ width: 1, height: 40, background: "var(--accent)", opacity: 0.55 }}/>
            <span className="eyebrow" style={{ color: "var(--accent)", opacity: 0.65 }}>Избранное</span>
            <div style={{ flex: 1, height: 1, background: "rgba(245,240,229,0.05)" }}/>
          </motion.div>

          <div
            className="feat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridAutoRows: "min(280px, 22vw)",
              gap: 3,
            }}
          >
            {featured.map((w, i) => <FeaturedCard key={w.slug} w={w} i={i} />)}
          </div>

          <motion.div
            className="feat-more"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: "right", marginTop: "1.5rem" }}
          >
            <Link to="/works"
              style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", borderBottom: "1px solid rgba(245,240,229,0.10)", paddingBottom: 3, transition: "color 300ms, border-color 300ms" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,240,229,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,240,229,0.10)"; }}
            >
              Все работы →
            </Link>
          </motion.div>
        </section>
      )}

      <style>{`
        .feat-img { transition: transform 900ms var(--ease-expo); position: absolute; inset: 0; }
        .feat-link:hover .feat-img { transform: scale(1.07); }
        .feat-link:hover .feat-corner { width: 32px !important; height: 32px !important; }
        .feat-link:hover .feat-arrow { opacity: 1 !important; }
        @media(max-width:699px) {
          .feat-section { padding-left: 0 !important; padding-right: 0 !important; }
          .feat-header  { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .feat-more    { padding-right: 1.25rem !important; }
          .feat-grid { grid-template-columns: 1fr !important; grid-auto-rows: 68vw !important; gap: 0 !important; }
          .feat-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </>
  );
}
