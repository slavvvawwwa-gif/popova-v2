import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getPerformance, type WorkDetail as WD, type GalleryImg } from "@/lib/data";

/* ── Issue #5: bento grid gallery — all images shown, no off-screen scroll ── */
const BENTO = [
  { cols: 2, rows: 2 },
  { cols: 1, rows: 2 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 1 },
];
const bentoFor = (i: number) => BENTO[i % 5];

function BentoGallery({ images, label, onOpen }: {
  images: GalleryImg[];
  label?: string;
  onOpen: (i: number) => void;
}) {
  if (!images.length) return null;
  return (
    <div style={{ padding: "3rem clamp(1.5rem,3vw,2.5rem) 0" }}>
      {label && (
        <p className="eyebrow" style={{ marginBottom: "1.5rem", color: "var(--accent)", opacity: 0.6 }}>{label}</p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "min(240px, 18vw)",
          gap: 3,
        }}
        className="gal-bento"
      >
        {images.map((g, i) => g.url && (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 5) * 0.06 }}
            style={{
              gridColumn: `span ${bentoFor(i).cols}`,
              gridRow:    `span ${bentoFor(i).rows}`,
              position: "relative", overflow: "hidden",
              cursor: "pointer", background: "var(--surface)",
            }}
            onClick={() => onOpen(i)}
            className="gal-item"
          >
            <img
              src={g.url} alt={g.alt ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 700ms var(--ease-expo)" }}
              className="gal-img"
            />
            {g.caption && (
              <p style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.65rem 0.9rem", background: "linear-gradient(to top, rgba(7,5,10,0.75), transparent)", fontSize: "0.66rem", color: "var(--text-2)", letterSpacing: "0.05em", pointerEvents: "none" }}>
                {g.caption}
              </p>
            )}
            <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)", transition: "width 350ms var(--ease-soft), height 350ms var(--ease-soft)", pointerEvents: "none" }} className="gal-corner" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function WorkDetail({ locale, basePath = "/works" }: { locale: string; basePath?: string }) {
  const { slug } = useParams<{ slug: string }>();
  const [work, setWork] = useState<WD | null>(null);
  const [lb, setLb]     = useState<number | null>(null);

  useEffect(() => {
    if (slug) getPerformance(slug, locale as "ru" | "en").then(setWork);
  }, [slug, locale]);

  if (!work) return (
    <div style={{ height: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="eyebrow" style={{ color: "var(--accent)", opacity: 0.5 }}>Загрузка…</span>
    </div>
  );

  const credits: [string, string][] = ([
    ["Режиссёр", work.role],
    ["Драматург", work.playwright],
    ["Художник", work.artist],
    ["Художник по свету", work.lightingDesigner],
    ["Художник-постановщик", work.setDesigner],
    ["Композитор", work.composer],
    ["Хореограф", work.choreographer],
    ["Перформеры", work.performers],
  ] as [string, string][]).filter(([, v]) => Boolean(v));

  const allImgs: GalleryImg[] = [
    ...work.gallery,
    ...work.content.flatMap(b => b.kind === "gallery" ? b.images : []),
  ];

  const contentGalleryOffset = (idx: number) =>
    work.gallery.length +
    work.content.slice(0, idx)
      .filter(b => b.kind === "gallery")
      .reduce((acc, b) => acc + (b.kind === "gallery" ? b.images.length : 0), 0);

  return (
    <div>
      {/* Cover */}
      <div style={{ position: "relative", height: "80svh", overflow: "hidden" }}>
        {work.coverUrl && (
          <img src={work.coverUrl} alt={work.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, transparent 30%, rgba(7,5,10,0.96) 100%)" }} />
        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", left: 0, bottom: 0, top: 0, width: 2, background: "linear-gradient(to bottom, transparent, var(--accent))", transformOrigin: "bottom" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(2rem,5vw,4.5rem)" }}
        >
          <p className="eyebrow" style={{ marginBottom: "1rem", color: "var(--accent)", opacity: 0.65 }}>
            {work.theatre}{work.year ? ` · ${work.year}` : ""}
          </p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,7.5vw,7rem)", fontWeight: 300, lineHeight: 0.9, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            {work.title}
          </h1>
          {work.shortDescription && (
            <p style={{ marginTop: "1.2rem", color: "var(--text-2)", fontSize: "1rem", maxWidth: 560, lineHeight: 1.75 }}>
              {work.shortDescription}
            </p>
          )}
        </motion.div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "4rem clamp(1.5rem,3vw,2.5rem) 2rem", display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: "5rem", alignItems: "start" }} className="detail-body">
        <div>
          <Link to={basePath}
            style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.6rem", marginBottom: "3rem", transition: "color 300ms" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
          >
            ← Назад
          </Link>

          {work.fullDescription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              style={{ color: "var(--text-2)", lineHeight: 1.9, fontSize: "1rem", marginBottom: "3rem" }}
            >
              <PortableText value={work.fullDescription as Parameters<typeof PortableText>[0]["value"]} />
            </motion.div>
          )}

          {work.children.length > 0 && (
            <div style={{ marginTop: "3rem", paddingTop: "3rem", borderTop: "1px solid rgba(245,240,229,0.06)" }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem", color: "var(--accent)", opacity: 0.55 }}>Выпуски</p>
              {work.children.map(c => (
                <Link key={c.slug} to={`${basePath}/${c.slug}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.9rem 0", borderBottom: "1px solid rgba(245,240,229,0.04)", textDecoration: "none", opacity: 0.55, transition: "opacity 200ms" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.55"}
                >
                  <span style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "var(--text-1)", fontWeight: 300 }}>{c.title}</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-3)", letterSpacing: "0.06em" }}>{c.year}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {credits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            style={{ position: "sticky", top: "7rem" }}
          >
            <div style={{ width: 1, height: 36, background: "var(--accent)", opacity: 0.4, marginBottom: "2rem" }} />
            {credits.map(([label, val]) => (
              <div key={label} style={{ marginBottom: "1.75rem" }}>
                <p className="eyebrow" style={{ marginBottom: "0.35rem", color: "var(--accent)", opacity: 0.5 }}>{label}</p>
                <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.65, fontFamily: "var(--serif)", fontWeight: 300 }}>{val}</p>
              </div>
            ))}
            {work.creditsExtra && (
              <p style={{ color: "var(--text-3)", fontSize: "0.8rem", lineHeight: 1.65, marginTop: "2.5rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(245,240,229,0.06)" }}>
                {work.creditsExtra}
              </p>
            )}
            {work.videos.map(v => (
              <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", marginTop: "2rem", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none", opacity: 0.7, transition: "opacity 200ms" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.7"}
              >
                ▶ {v.label || "Смотреть видео"}
              </a>
            ))}
          </motion.div>
        )}
      </div>

      {/* Main gallery bento */}
      {work.gallery.length > 0 && (
        <BentoGallery images={work.gallery} label="Галерея" onOpen={i => setLb(i)} />
      )}

      {/* Content blocks */}
      {work.content.map((block, idx) => {
        if (block.kind === "text") {
          return (
            <div key={idx} style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem clamp(1.5rem,3vw,2.5rem)" }}>
              <div style={{ maxWidth: 740, color: "var(--text-2)", lineHeight: 1.9, fontSize: "1rem" }}>
                {block.body && <PortableText value={block.body as Parameters<typeof PortableText>[0]["value"]} />}
              </div>
            </div>
          );
        }
        if (block.kind === "gallery" && block.images.length > 0) {
          const offset = contentGalleryOffset(idx);
          return <BentoGallery key={idx} images={block.images} onOpen={i => setLb(offset + i)} />;
        }
        return null;
      })}

      <div style={{ height: "5rem" }} />

      {/* Lightbox */}
      <AnimatePresence>
        {lb !== null && (() => {
          const cur = allImgs[lb];
          if (!cur) return null;
          const prev = () => setLb(i => i !== null ? (i > 0 ? i - 1 : allImgs.length - 1) : 0);
          const next = () => setLb(i => i !== null ? (i < allImgs.length - 1 ? i + 1 : 0) : 0);
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => setLb(null)}
            >
              <motion.img
                key={lb}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                src={cur.url ?? ""} alt={cur.alt}
                style={{ maxHeight: "88vh", maxWidth: "88vw", objectFit: "contain" }}
                onClick={e => e.stopPropagation()}
                draggable={false}
              />
              {cur.caption && (
                <p style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {cur.caption}
                </p>
              )}
              <p className="eyebrow" style={{ position: "absolute", top: "1.5rem", left: "50%", transform: "translateX(-50%)", fontSize: "0.5rem", color: "var(--text-3)" }}>
                {lb + 1} / {allImgs.length}
              </p>
              {[{ side: "left", fn: prev, label: "←" }, { side: "right", fn: next, label: "→" }].map(({ side, fn, label }) => (
                <button key={side} onClick={e => { e.stopPropagation(); fn(); }}
                  style={{ position: "absolute", [side]: "1.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "1px solid rgba(245,240,229,0.10)", color: "var(--text-1)", cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", transition: "border-color 200ms" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,240,229,0.10)"}
                >
                  {label}
                </button>
              ))}
              <button onClick={() => setLb(null)}
                style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "1.1rem", padding: "0.5rem", transition: "color 200ms" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-1)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
              >✕</button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <style>{`
        .gal-img { transition: transform 700ms var(--ease-expo); }
        .gal-item:hover .gal-img { transform: scale(1.05); }
        .gal-item:hover .gal-corner { width: 24px !important; height: 24px !important; }
        @media(max-width:699px) {
          .gal-bento { grid-template-columns: 1fr 1fr !important; grid-auto-rows: 44vw !important; }
          .gal-bento > * { grid-column: span 1 !important; grid-row: span 1 !important; }
          .detail-body { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
