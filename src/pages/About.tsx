import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getBio, type BioData } from "@/lib/data";

/* ── PhotoStack: visual card stack + strict prev/next nav ── */
function PhotoStack({ photos }: { photos: { url: string | null; alt: string }[] }) {
  // Single combined state — eliminates any possibility of split-update batching bugs
  const [nav, setNav] = useState({ active: 0, dir: 1 });
  const lockRef = useRef(false);

  if (!photos.length) return null;

  const { active, dir } = nav;
  const n = photos.length;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (lockRef.current || n <= 1) return;
    lockRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const d = (e.clientX - rect.left) < rect.width * 0.45 ? -1 : 1;
    setNav(s => {
      const next = d > 0
        ? (s.active < n - 1 ? s.active + 1 : 0)
        : (s.active > 0 ? s.active - 1 : n - 1);
      return { active: next, dir: d };
    });
    setTimeout(() => { lockRef.current = false; }, 400);
  };

  // Index of the card one step ahead — shown as the "peek" behind the active card
  const behindIdx = (active + 1) % n;

  return (
    <div
      onClick={n > 1 ? handleClick : undefined}
      style={{ position: "relative", width: "100%", aspectRatio: "3/4", cursor: n > 1 ? "pointer" : "default" }}
    >
      {/* Single background card — always the next one in the deck */}
      {photos[behindIdx]?.url && (
        <div style={{
          position: "absolute", inset: 0,
          transform: "rotate(-4deg) scale(0.982)",
          transformOrigin: "bottom center",
          zIndex: 1,
          pointerEvents: "none",
        }}>
          <img src={photos[behindIdx].url!} alt={photos[behindIdx].alt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* Active card — key change causes unmount+remount → enter animation fires, no exit needed */}
      <motion.div
        key={active}
        initial={{ opacity: 0, x: dir > 0 ? "8%" : "-8%" }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}
      >
        {photos[active]?.url && (
          <img src={photos[active].url!} alt={photos[active].alt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </motion.div>

      {/* Counter */}
      {n > 1 && (
        <div style={{ position: "absolute", bottom: "1rem", right: "1rem", background: "rgba(7,5,10,0.65)", color: "var(--text-2)", fontSize: "0.52rem", letterSpacing: "0.15em", padding: "0.3rem 0.6rem", zIndex: 3, pointerEvents: "none" }}>
          {active + 1} / {n}
        </div>
      )}
    </div>
  );
}

function BioList({ items }: { items: { period: string; description: string }[] }) {
  return (
    <>
      {items.map((e, i) => (
        <motion.div key={i}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr)", gap: "1.2rem", padding: "0.8rem 0", borderBottom: "1px solid rgba(245,240,229,0.04)" }}
        >
          <span style={{ fontFamily: "var(--serif)", color: "var(--text-3)", fontSize: "0.85rem" }}>{e.period}</span>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.72 }}>{e.description}</p>
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
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "6rem clamp(1.5rem,3vw,2.5rem) 4rem" }}>

      {/* ── Row 1: photo stack + bio text ── */}
      <div className="about-top" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "4rem", alignItems: "start", marginBottom: "4rem" }}>

        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <div style={{ position: "sticky", top: "7rem" }}>
            <PhotoStack photos={stackPhotos} />
            <div style={{ marginTop: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {bio.cvRu && (
                <a href={bio.cvRu} download className="cv-link"
                  style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", display: "flex", gap: "0.5rem", alignItems: "center", transition: "color 200ms" }}>
                  ↓ Скачать CV (RU)
                </a>
              )}
              {bio.cvEn && (
                <a href={bio.cvEn} download className="cv-link"
                  style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-3)", textDecoration: "none", display: "flex", gap: "0.5rem", alignItems: "center", transition: "color 200ms" }}>
                  ↓ Download CV (EN)
                </a>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <div style={{ width: 1, height: 36, background: "var(--accent)", opacity: 0.45, marginBottom: "1.2rem" }} />
          <p className="eyebrow" style={{ marginBottom: "0.9rem", color: "var(--accent)", opacity: 0.5 }}>Биография</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem,5vw,4.5rem)", fontWeight: 300, lineHeight: 0.92, letterSpacing: "-0.02em", marginBottom: "1.2rem" }}>
            {bio.name.split(" ")[0]}<br/>
            <em style={{ color: "var(--text-2)" }}>{bio.name.split(" ").slice(1).join(" ")}</em>
          </h1>
          {bio.role && (
            <p className="eyebrow" style={{ color: "var(--accent)", opacity: 0.55, marginBottom: "1.6rem" }}>{bio.role}</p>
          )}
          <div style={{ color: "var(--text-2)", lineHeight: 1.82, fontSize: "0.9375rem" }}>
            {bio.text ? <PortableText value={bio.text as Parameters<typeof PortableText>[0]["value"]} /> : null}
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Festivals + Education side by side ── */}
      {(bio.festivals.length > 0 || bio.education.length > 0) && (
        <div className="about-mid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", marginBottom: "3.5rem" }}>
          {bio.festivals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
              <p className="eyebrow" style={{ marginBottom: "1.2rem", color: "var(--accent)", opacity: 0.5 }}>Участие в других фестивалях, проектах, лабораториях</p>
              <BioList items={bio.festivals} />
            </motion.div>
          )}
          {bio.education.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.08 }}>
              <p className="eyebrow" style={{ marginBottom: "1.2rem", color: "var(--accent)", opacity: 0.5 }}>Дополнительное образование</p>
              <BioList items={bio.education} />
            </motion.div>
          )}
        </div>
      )}

      {/* ── Row 3: Благодарственные письма — centered ── */}
      {bio.thankYouLetters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          style={{ maxWidth: 680, margin: "0 auto" }}
        >
          <div style={{ height: 1, background: "rgba(245,240,229,0.06)", marginBottom: "2.5rem" }} />
          <p className="eyebrow" style={{ marginBottom: "1.8rem", color: "var(--accent)", opacity: 0.5, textAlign: "center" }}>
            Благодарственные письма
          </p>
          {bio.thankYouLetters.map((l, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              style={{ padding: "1rem 0", borderBottom: "1px solid rgba(245,240,229,0.04)" }}
            >
              <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: l.period ? "0.4rem" : 0 }}>
                {l.description}
              </p>
              {l.period && (
                <p style={{ color: "var(--text-3)", fontSize: "0.68rem", letterSpacing: "0.07em", fontStyle: "italic" }}>
                  {l.period}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <style>{`
        .cv-link:hover { color: var(--accent) !important; }
        @media(max-width:767px) {
          .about-top { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .about-mid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
