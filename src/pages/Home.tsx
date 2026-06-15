import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getFeatured, type WorkCard } from "@/lib/data";
import CharReveal from "@/components/ui/CharReveal";

const BENTO = [
  { c: "col-span-8", r: "row-span-2" },
  { c: "col-span-4", r: "row-span-2" },
  { c: "col-span-4", r: "row-span-1" },
  { c: "col-span-4", r: "row-span-1" },
  { c: "col-span-4", r: "row-span-1" },
];
const spanFor = (i: number) => BENTO[i % 5];

function FeaturedCard({ w, i }: { w: WorkCard; i: number }) {
  const path = w.kind === "project" ? "/projects" : w.kind === "lab" ? "/lab" : "/works";
  const span = spanFor(i);
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 30 });
  const sry = useSpring(ry, { stiffness: 200, damping: 30 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rx.set(y * 10);
    ry.set(-x * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      className={`${span.c} ${span.r}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (i % 5) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 800 }}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry, width: "100%", height: "100%" }}>
        <Link to={`${path}/${w.slug}`} style={{ display: "block", textDecoration: "none", position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
          <div style={{ position: "absolute", inset: 0, background: "var(--surface)" }}>
            {w.coverUrl && (
              <img src={w.coverUrl} alt={w.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 800ms var(--ease-expo)" }}
                className="feat-img"/>
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.1) 55%, transparent 100%)" }}/>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem" }}>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: "0.5rem" }}>
              {w.theatre} · {w.year}
            </p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem,2.2vw,1.8rem)", fontWeight: 300, lineHeight: 1.05, color: "var(--text-1)" }}>
              {w.title}
            </h2>
            {w.shortDescription && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-2)", lineHeight: 1.5, marginTop: "0.4rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {w.shortDescription}
              </p>
            )}
          </div>
          {/* Red reveal bar */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 2, height: "100%", background: "var(--accent)", transform: "scaleY(0)", transformOrigin: "bottom", transition: "transform 400ms var(--ease-soft)" }} className="feat-bar"/>
          {/* Corner arrow */}
          <div style={{ position: "absolute", top: "1rem", right: "1rem", opacity: 0, transition: "opacity 300ms", fontSize: "0.6rem", letterSpacing: "0.15em", color: "var(--text-2)" }} className="feat-arrow">↗</div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function Home({ locale }: { locale: string }) {
  const [featured, setFeatured] = useState<WorkCard[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => { getFeatured(locale as "ru"|"en").then(setFeatured); }, [locale]);

  const onMouseMove = (e: React.MouseEvent) => {
    const r = heroRef.current!.getBoundingClientRect();
    mouseX.set((e.clientX - r.left - r.width / 2) / r.width * 30);
    mouseY.set((e.clientY - r.top - r.height / 2) / r.height * 20);
  };

  const firstName = "Варвара";
  const lastName = "Попова";

  return (
    <>
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        onMouseMove={onMouseMove}
        style={{ position: "relative", height: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
      >
        {/* Spotlight glow following mouse — subtle */}
        <motion.div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(214,48,60,0.07) 0%, transparent 70%)",
            x: smX, y: smY,
          }}
        />

        {/* Eyebrow */}
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, letterSpacing: "0.35em" }}
          animate={{ opacity: 1, letterSpacing: "0.22em" }}
          transition={{ duration: 1.2, delay: 0.1 }}
          style={{ marginBottom: "3rem", position: "relative", zIndex: 1 }}
        >
          Театральный режиссёр
        </motion.p>

        {/* Main title */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", lineHeight: 0.85, userSelect: "none" }}>
          <motion.div style={{ x: smX, y: smY, display: "block" }}>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 300, letterSpacing: "-0.02em", margin: 0 }}>
              <span style={{ display: "block", fontSize: "clamp(5rem,14vw,13rem)", color: "var(--text-1)" }}>
                <CharReveal text={firstName} delay={0.3} stagger={0.045}/>
              </span>
              <motion.span
                style={{ display: "block", fontSize: "clamp(4rem,11vw,10rem)", color: "rgba(240,240,240,0.35)", fontStyle: "italic", x: smX, y: smY }}
              >
                <CharReveal text={lastName} delay={0.55} stagger={0.04}/>
              </motion.span>
            </h1>
          </motion.div>
        </div>

        {/* Animated divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "clamp(120px,20vw,200px)", height: 1, background: "var(--accent)", margin: "3rem auto", transformOrigin: "left", position: "relative", zIndex: 1 }}
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          style={{ display: "flex", gap: "3rem", alignItems: "center", position: "relative", zIndex: 1 }}
        >
          <Link to="/works" style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-1)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.75rem", paddingBottom: 3, borderBottom: "1px solid var(--accent)" }}>
            Спектакли
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
              <path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </Link>
          <Link to="/about" style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-2)", textDecoration: "none" }}>
            Обо мне
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}
        >
          <span className="eyebrow" style={{ fontSize: "0.5rem" }}>Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ width: 1, height: 36, background: "linear-gradient(to bottom, var(--accent), transparent)" }}
          />
        </motion.div>

        {/* Large bg year — decorative */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2, delay: 1.5 }}
          style={{
            position: "absolute", right: "-0.05em", bottom: "-0.15em",
            fontFamily: "var(--serif)", fontSize: "clamp(12rem,28vw,28rem)",
            fontWeight: 300, color: "var(--text-1)", lineHeight: 1,
            pointerEvents: "none", userSelect: "none", zIndex: 0,
          }}
        >
          {new Date().getFullYear()}
        </motion.span>
      </section>

      {/* ── Featured bento ── */}
      {featured.length > 0 && (
        <section style={{ padding: "8rem clamp(1.5rem,3vw,2rem)", maxWidth: 1500, margin: "0 auto", width: "100%" }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "3rem" }}
          >
            <span className="eyebrow">Избранное</span>
            <div style={{ flex: 1, height: 1, background: "rgba(240,240,240,0.06)" }}/>
          </motion.div>
          <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gridAutoRows: "clamp(120px,12vw,200px)", gridAutoFlow: "dense", gap: 2 }}>
            {featured.map((w, i) => <FeaturedCard key={w.slug} w={w} i={i}/>)}
          </div>
        </section>
      )}

      <style>{`
        .feat-img:hover { transform: scale(1.06); }
        a:hover .feat-bar { transform: scaleY(1) !important; }
        a:hover .feat-arrow { opacity: 1 !important; }
        @media(max-width:599px) {
          .feat-grid { grid-template-columns: 1fr !important; grid-auto-rows: 64vw !important; }
          .feat-grid > * { grid-column: 1/-1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </>
  );
}
