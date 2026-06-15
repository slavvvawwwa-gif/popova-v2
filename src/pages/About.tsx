import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getBio, type BioData } from "@/lib/data";

function PhotoStack({ photos }: { photos: { url: string|null; alt: string }[] }) {
  const [active, setActive] = useState(0);

  if (!photos.length) return null;

  // Stack rotations for up to 5 cards behind the active one
  const rotations = [0, -4, 3.5, -2.5, 4.5];

  return (
    <div style={{ position:"relative", width:"100%", aspectRatio:"3/4" }}>
      {/* Background cards */}
      {photos.map((p, i) => {
        if (!p.url) return null;
        const order = ((i - active) % photos.length + photos.length) % photos.length;
        if (order === 0) return null; // rendered separately on top
        const rot = rotations[Math.min(order, rotations.length - 1)];
        return (
          <div key={i} style={{
            position:"absolute", inset:0,
            transform:`rotate(${rot}deg) scale(${1 - order * 0.02})`,
            transformOrigin:"bottom center",
            zIndex: photos.length - order,
            transition:"transform 0.5s var(--ease-expo)",
          }}>
            <img src={p.url} alt={p.alt}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          </div>
        );
      })}

      {/* Active (top) card */}
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity:0, scale:0.97, rotate:-2 }}
          animate={{ opacity:1, scale:1, rotate:0 }}
          exit={{ opacity:0, scale:0.96 }}
          transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
          style={{ position:"absolute", inset:0, zIndex:photos.length + 1, cursor:"pointer" }}
          onClick={() => setActive(a => (a + 1) % photos.length)}
        >
          {photos[active].url && (
            <img src={photos[active].url!} alt={photos[active].alt}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          )}
          {photos.length > 1 && (
            <div style={{
              position:"absolute", bottom:"1rem", right:"1rem",
              background:"rgba(8,8,8,0.7)", color:"var(--text-2)",
              fontSize:"0.55rem", letterSpacing:"0.15em",
              padding:"0.35rem 0.65rem",
            }}>
              {active + 1} / {photos.length}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function About({ locale }: { locale: string }) {
  const [bio, setBio] = useState<BioData|null>(null);

  useEffect(() => { getBio(locale as "ru"|"en").then(setBio); }, [locale]);

  if (!bio) return (
    <div style={{ height:"100svh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="eyebrow">Загрузка…</span>
    </div>
  );

  // Main photo + gallery combined into one stack
  const stackPhotos = [
    ...(bio.photoUrl ? [{ url: bio.photoUrl, alt: bio.name }] : []),
    ...bio.gallery,
  ];

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"8rem 2rem 6rem" }}>
      <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:"6rem", alignItems:"start" }}>

        {/* Photo stack */}
        <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:1, ease:[0.16,1,0.3,1] }}>
          <div style={{ position:"sticky", top:"8rem" }}>
            <PhotoStack photos={stackPhotos}/>
            <div style={{ marginTop:"2rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {bio.cvRu && (
                <a href={bio.cvRu} download style={{ fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none", display:"flex", gap:"0.5rem", alignItems:"center" }}>
                  ↓ Скачать CV (RU)
                </a>
              )}
              {bio.cvEn && (
                <a href={bio.cvEn} download style={{ fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none", display:"flex", gap:"0.5rem", alignItems:"center" }}>
                  ↓ Download CV (EN)
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bio text */}
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.2, ease:[0.16,1,0.3,1] }}>
          <p className="eyebrow" style={{ marginBottom:"1rem" }}>Биография</p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:300, lineHeight:0.92, letterSpacing:"-0.02em", marginBottom:"1.5rem" }}>
            {bio.name.split(" ")[0]}<br/>
            <em style={{ color:"var(--text-2)" }}>{bio.name.split(" ").slice(1).join(" ")}</em>
          </h1>
          {bio.role && (
            <p className="eyebrow" style={{ color:"var(--accent)", marginBottom:"2rem" }}>{bio.role}</p>
          )}
          <div style={{ color:"var(--text-2)", lineHeight:1.8, fontSize:"0.9375rem" }}>
            {bio.text ? <PortableText value={bio.text as Parameters<typeof PortableText>[0]["value"]}/> : null}
          </div>

          {bio.festivals.length > 0 && (
            <div style={{ marginTop:"4rem" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Фестивали и проекты</p>
              {bio.festivals.map((e, i) => (
                <motion.div key={i}
                  initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
                  transition={{ duration:0.5, delay:i * 0.05 }}
                  style={{ display:"grid", gridTemplateColumns:"100px minmax(0,1fr)", gap:"1.5rem", padding:"1rem 0", borderBottom:"1px solid rgba(240,240,240,0.05)" }}
                >
                  <span style={{ fontFamily:"var(--serif)", color:"var(--text-3)", fontSize:"0.9rem" }}>{e.period}</span>
                  <p style={{ color:"var(--text-2)", fontSize:"0.875rem", lineHeight:1.7 }}>{e.description}</p>
                </motion.div>
              ))}
            </div>
          )}

          {bio.education.length > 0 && (
            <div style={{ marginTop:"3rem" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Образование</p>
              {bio.education.map((e, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"100px minmax(0,1fr)", gap:"1.5rem", padding:"1rem 0", borderBottom:"1px solid rgba(240,240,240,0.05)" }}>
                  <span style={{ fontFamily:"var(--serif)", color:"var(--text-3)", fontSize:"0.9rem" }}>{e.period}</span>
                  <p style={{ color:"var(--text-2)", fontSize:"0.875rem", lineHeight:1.7 }}>{e.description}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`@media(max-width:767px){.about-grid{grid-template-columns:minmax(0,1fr)!important}}`}</style>
    </div>
  );
}
