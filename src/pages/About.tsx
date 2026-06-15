import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getBio, type BioData } from "@/lib/data";

/* ── Photo gallery with strict prev/next navigation ── */
function PhotoGallery({ photos }: { photos: { url: string | null; alt: string }[] }) {
  const [idx, setIdx]   = useState(0);
  const [dir, setDir]   = useState(1); // 1 = forward, -1 = backward

  if (!photos.length) return null;

  const prev = () => { setDir(-1); setIdx(i => (i > 0 ? i - 1 : photos.length - 1)); };
  const next = () => { setDir(1);  setIdx(i => (i < photos.length - 1 ? i + 1 : 0)); };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "var(--surface)" }}>
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div
          key={idx}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", inset: 0 }}
        >
          {photos[idx].url && (
            <img
              src={photos[idx].url!}
              alt={photos[idx].alt}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation overlays */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Предыдущее фото"
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "40%", background: "none", border: "none", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: "1rem" }}
            className="gal-nav-btn"
          >
            <span className="gal-nav-arrow" style={{ fontSize: "1.2rem", color: "var(--text-1)", opacity: 0, transition: "opacity 200ms" }}>←</span>
          </button>
          <button
            onClick={next}
            aria-label="Следующее фото"
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", background: "none", border: "none", cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "1rem" }}
            className="gal-nav-btn"
          >
            <span className="gal-nav-arrow" style={{ fontSize: "1.2rem", color: "var(--text-1)", opacity: 0, transition: "opacity 200ms" }}>→</span>
          </button>
          <div style={{ position: "absolute", bottom: "1rem", right: "1rem", background: "rgba(7,5,10,0.65)", color: "var(--text-2)", fontSize: "0.52rem", letterSpacing: "0.15em", padding: "0.3rem 0.6rem", zIndex: 11 }}>
            {idx + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Single list of bio entries ── */
function BioList({ items }: { items: { period: string; description: string }[] }) {
  return (
    <>
      {items.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          style={{ display: "grid", gridTemplateColumns: "100px minmax(0,1fr)", gap: "1.5rem", padding: "0.9rem 0", borderBottom: "1px solid rgba(245,240,229,0.045)" }}
        >
          <span style={{ fontFamily: "var(--serif)", color: "var(--text-3)", fontSize: "0.88rem" }}>{e.period}</span>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.75 }}>{e.description}</p>
        </motion.div>
      ))}
    </>
  );
}

export default function About({ locale }: { locale: string }) {
  const [bio, setBio] = useState<BioData | null>(null);

  useEffect(() => { getBio(locale as "ru" | "en").then(setBio); }, [locale]);

  if (!bio) return (
    <div style={{ height: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="eyebrow" style={{ color: "var(--accent)", opacity: 0.5 }}>Загрузка…</span>
    </div>
  );

  const stackPhotos = [
    ...(bio.photoUrl ? [{ url: bio.photoUrl, alt: bio.name }] : []),
    ...bio.gallery,
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "7rem clamp(1.5rem,3vw,2.5rem) 5rem" }}>

      {/* ── Row 1: photo + bio text ── */}
      <div className="about-top" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "5rem", alignItems: "start", marginBottom: "6rem" }}>

        {/* Photo gallery */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <div style={{ position: "sticky", top: "7rem" }}>
            <PhotoGallery photos={stackPhotos} />
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {bio.cvRu && (
                <a href={bio.cvRu} download style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", display: "flex", gap: "0.5rem", alignItems: "center", transition: "color 200ms" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
                >
                  ↓ Скачать CV (RU)
                </a>
              )}
              {bio.cvEn && (
                <a href={bio.cvEn} download style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", display: "flex", gap: "0.5rem", alignItems: "center", transition: "color 200ms" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
                >
                  ↓ Download CV (EN)
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bio text */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <div style={{ width: 1, height: 40, background: "var(--accent)", opacity: 0.5, marginBottom: "1.5rem" }}/>
          <p className="eyebrow" style={{ marginBottom: "1rem", color: "var(--accent)", opacity: 0.55 }}>Биография</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,5.5vw,5rem)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
            {bio.name.split(" ")[0]}<br/>
            <em style={{ color: "var(--text-2)" }}>{bio.name.split(" ").slice(1).join(" ")}</em>
          </h1>
          {bio.role && (
            <p className="eyebrow" style={{ color: "var(--accent)", opacity: 0.6, marginBottom: "2rem" }}>{bio.role}</p>
          )}
          <div style={{ color: "var(--text-2)", lineHeight: 1.85, fontSize: "0.9375rem" }}>
            {bio.text ? <PortableText value={bio.text as Parameters<typeof PortableText>[0]["value"]} /> : null}
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Festivals + Education side by side ── */}
      {(bio.festivals.length > 0 || bio.education.length > 0) && (
        <div className="about-mid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginBottom: "5rem" }}>
          {bio.festivals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem", color: "var(--accent)", opacity: 0.55 }}>Фестивали и проекты</p>
              <BioList items={bio.festivals} />
            </motion.div>
          )}
          {bio.education.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
              <p className="eyebrow" style={{ marginBottom: "1.5rem", color: "var(--accent)", opacity: 0.55 }}>Образование</p>
              <BioList items={bio.education} />
            </motion.div>
          )}
        </div>
      )}

      {/* ── Row 3: Благодарственные письма — centered ── */}
      {bio.thankYouLetters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: 760, margin: "0 auto" }}
        >
          <div style={{ height: 1, background: "rgba(245,240,229,0.06)", marginBottom: "3rem" }}/>
          <p className="eyebrow" style={{ marginBottom: "2rem", color: "var(--accent)", opacity: 0.55, textAlign: "center" }}>Благодарственные письма</p>
          {bio.thankYouLetters.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              style={{ padding: "1.2rem 0", borderBottom: "1px solid rgba(245,240,229,0.045)" }}
            >
              <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: l.from ? "0.5rem" : 0 }}>
                {l.description}
              </p>
              {l.from && (
                <p style={{ color: "var(--text-3)", fontSize: "0.7rem", letterSpacing: "0.08em", fontStyle: "italic" }}>
                  — {l.from}{l.period ? `, ${l.period}` : ""}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <style>{`
        .gal-nav-btn:hover .gal-nav-arrow { opacity: 0.8 !important; }
        @media(max-width:767px) {
          .about-top { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .about-mid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
