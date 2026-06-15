import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getPerformance, type WorkDetail as WD, type GalleryImg } from "@/lib/data";

/* ── Native-scroll gallery — always works, no JS measurement needed ── */
function ScrollGallery({ images, label, onOpen }: {
  images: GalleryImg[];
  label?: string;
  onOpen: (i: number) => void;
}) {
  if (!images.length) return null;
  return (
    <div style={{ marginTop:"4rem" }}>
      {label && <p className="eyebrow" style={{ padding:"0 clamp(1.5rem,3vw,2.5rem)", marginBottom:"1.5rem", color:"var(--accent)", opacity:0.65 }}>{label}</p>}

      <div className="gallery-scroll" style={{ padding:"0 clamp(1.5rem,3vw,2.5rem)" }}>
        {images.map((g, i) => g.url && (
          <div
            key={i}
            className="gallery-scroll-item"
            style={{ width:"clamp(240px,26vw,440px)", height:"65vh" }}
            onClick={() => onOpen(i)}
          >
            <img src={g.url} alt={g.alt ?? ""} draggable={false}/>
            {g.caption && (
              <p style={{
                position:"absolute", bottom:0, left:0, right:0,
                padding:"0.75rem 1rem",
                background:"linear-gradient(to top, rgba(7,5,10,0.80), transparent)",
                fontSize:"0.68rem", color:"var(--text-2)", letterSpacing:"0.05em",
                pointerEvents:"none",
              }}>
                {g.caption}
              </p>
            )}
            {/* Gold index dot */}
            <div style={{
              position:"absolute", top:"1rem", right:"1rem",
              width:6, height:6, borderRadius:"50%",
              background:"var(--accent)", opacity:0.5,
              pointerEvents:"none",
            }}/>
          </div>
        ))}
        {/* trailing spacer */}
        <div style={{ flexShrink:0, width:8 }}/>
      </div>

      {/* Scroll hint on first render */}
      <p className="eyebrow" style={{ textAlign:"right", padding:"0.75rem clamp(1.5rem,3vw,2.5rem) 0", fontSize:"0.48rem", opacity:0.3 }}>
        ← drag to scroll →
      </p>
    </div>
  );
}

export default function WorkDetail({ locale, basePath="/works" }: { locale:string; basePath?:string }) {
  const { slug } = useParams<{ slug:string }>();
  const [work, setWork] = useState<WD|null>(null);
  const [lb, setLb] = useState<number|null>(null);

  useEffect(() => {
    if (slug) getPerformance(slug, locale as "ru"|"en").then(setWork);
  }, [slug, locale]);

  if (!work) return (
    <div style={{ height:"100svh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="eyebrow" style={{ color:"var(--accent)", opacity:0.5 }}>Загрузка…</span>
    </div>
  );

  const credits: [string,string][] = ([
    ["Режиссёр", work.role],
    ["Драматург", work.playwright],
    ["Художник", work.artist],
    ["Художник по свету", work.lightingDesigner],
    ["Художник-постановщик", work.setDesigner],
    ["Композитор", work.composer],
    ["Хореограф", work.choreographer],
    ["Перформеры", work.performers],
  ] as [string,string][]).filter(([,v]) => Boolean(v));

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
      {/* ── Cover ── */}
      <div style={{ position:"relative", height:"80svh", overflow:"hidden" }}>
        {work.coverUrl && (
          <img src={work.coverUrl} alt={work.title}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(170deg, transparent 30%, rgba(7,5,10,0.96) 100%)" }}/>

        {/* Gold accent bar */}
        <motion.div
          initial={{ scaleY:0 }}
          animate={{ scaleY:1 }}
          transition={{ duration:1.2, delay:0.3, ease:[0.16,1,0.3,1] }}
          style={{ position:"absolute", left:0, bottom:0, top:0, width:2, background:"linear-gradient(to bottom, transparent, var(--accent))", transformOrigin:"bottom" }}
        />

        <motion.div
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.9, delay:0.2, ease:[0.16,1,0.3,1] }}
          style={{ position:"absolute", bottom:0, left:0, right:0, padding:"clamp(2rem,5vw,4.5rem)" }}
        >
          <p className="eyebrow" style={{ marginBottom:"1rem", color:"var(--accent)", opacity:0.65 }}>
            {work.theatre}{work.year ? ` · ${work.year}` : ""}
          </p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.5rem,7.5vw,7rem)", fontWeight:300, lineHeight:0.9, color:"var(--text-1)", letterSpacing:"-0.02em" }}>
            {work.title}
          </h1>
          {work.shortDescription && (
            <p style={{ marginTop:"1.2rem", color:"var(--text-2)", fontSize:"1rem", maxWidth:560, lineHeight:1.75 }}>
              {work.shortDescription}
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"5rem clamp(1.5rem,3vw,2.5rem) 2rem", display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:"5rem", alignItems:"start" }}>
        <div>
          <Link to={basePath} style={{ fontSize:"0.58rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-3)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.6rem", marginBottom:"3.5rem", transition:"color 300ms" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--accent)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--text-3)"}
          >
            ← Назад
          </Link>

          {work.fullDescription && (
            <motion.div
              initial={{ opacity:0, y:20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.8, delay:0.35 }}
              style={{ color:"var(--text-2)", lineHeight:1.9, fontSize:"1rem", marginBottom:"3rem" }}
            >
              <PortableText value={work.fullDescription as Parameters<typeof PortableText>[0]["value"]}/>
            </motion.div>
          )}

          {work.children.length > 0 && (
            <div style={{ marginTop:"3rem", paddingTop:"3rem", borderTop:"1px solid rgba(245,240,229,0.06)" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem", color:"var(--accent)", opacity:0.55 }}>Выпуски</p>
              {work.children.map(c => (
                <Link key={c.slug} to={`${basePath}/${c.slug}`}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"0.9rem 0", borderBottom:"1px solid rgba(245,240,229,0.04)", textDecoration:"none" }}
                  className="child-link"
                >
                  <span style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", color:"var(--text-1)", fontWeight:300 }}>{c.title}</span>
                  <span style={{ fontSize:"0.68rem", color:"var(--text-3)", letterSpacing:"0.06em" }}>{c.year}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Credits sidebar */}
        {credits.length > 0 && (
          <motion.div
            initial={{ opacity:0, x:20 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:0.8, delay:0.45 }}
            style={{ position:"sticky", top:"7rem" }}
          >
            {/* Gold side accent */}
            <div style={{ width:1, height:40, background:"var(--accent)", opacity:0.4, marginBottom:"2rem" }}/>

            {credits.map(([label, val]) => (
              <div key={label} style={{ marginBottom:"1.75rem" }}>
                <p className="eyebrow" style={{ marginBottom:"0.35rem", color:"var(--accent)", opacity:0.5 }}>{label}</p>
                <p style={{ color:"var(--text-1)", fontSize:"0.9rem", lineHeight:1.65, fontFamily:"var(--serif)", fontWeight:300 }}>{val}</p>
              </div>
            ))}

            {work.creditsExtra && (
              <p style={{ color:"var(--text-3)", fontSize:"0.8rem", lineHeight:1.65, marginTop:"2.5rem", paddingTop:"2.5rem", borderTop:"1px solid rgba(245,240,229,0.06)" }}>
                {work.creditsExtra}
              </p>
            )}

            {work.videos.map(v => (
              <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:"0.6rem", marginTop:"2.5rem", fontSize:"0.58rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--accent)", textDecoration:"none", opacity:0.75, transition:"opacity 200ms" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity="1"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity="0.75"}
              >
                ▶ {v.label || "Смотреть видео"}
              </a>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Main gallery (native scroll, always works) ── */}
      {work.gallery.length > 0 && (
        <ScrollGallery images={work.gallery} label="Галерея" onOpen={i => setLb(i)}/>
      )}

      {/* ── Content blocks ── */}
      {work.content.map((block, idx) => {
        if (block.kind === "text") {
          return (
            <div key={idx} style={{ maxWidth:1280, margin:"0 auto", padding:"4rem clamp(1.5rem,3vw,2.5rem)" }}>
              <div style={{ maxWidth:740, color:"var(--text-2)", lineHeight:1.9, fontSize:"1rem" }}>
                {block.body && (
                  <PortableText value={block.body as Parameters<typeof PortableText>[0]["value"]}/>
                )}
              </div>
            </div>
          );
        }
        if (block.kind === "gallery" && block.images.length > 0) {
          const offset = contentGalleryOffset(idx);
          return (
            <ScrollGallery key={idx} images={block.images} onOpen={i => setLb(offset + i)}/>
          );
        }
        return null;
      })}

      <div style={{ height:"6rem" }}/>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lb !== null && (() => {
          const cur = allImgs[lb];
          if (!cur) return null;
          const prev = () => setLb(i => i !== null ? (i > 0 ? i-1 : allImgs.length-1) : 0);
          const next = () => setLb(i => i !== null ? (i < allImgs.length-1 ? i+1 : 0) : 0);
          return (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.25 }}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.97)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
              onClick={() => setLb(null)}
            >
              <motion.img
                key={lb}
                initial={{ opacity:0, scale:0.95 }}
                animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0 }}
                transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
                src={cur.url ?? ""} alt={cur.alt}
                style={{ maxHeight:"88vh", maxWidth:"88vw", objectFit:"contain" }}
                onClick={e => e.stopPropagation()}
                draggable={false}
              />

              {/* Caption */}
              {cur.caption && (
                <p style={{ position:"absolute", bottom:"2.5rem", left:"50%", transform:"translateX(-50%)", fontSize:"0.7rem", color:"var(--text-3)", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
                  {cur.caption}
                </p>
              )}

              {/* Counter */}
              <p className="eyebrow" style={{ position:"absolute", top:"1.5rem", left:"50%", transform:"translateX(-50%)", fontSize:"0.5rem", color:"var(--text-3)" }}>
                {lb + 1} / {allImgs.length}
              </p>

              <button onClick={e => { e.stopPropagation(); prev(); }}
                style={{ position:"absolute", left:"1.5rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"1px solid rgba(245,240,229,0.10)", color:"var(--text-1)", cursor:"pointer", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"border-color 200ms" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="var(--accent)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="rgba(245,240,229,0.10)"}
              >←</button>

              <button onClick={e => { e.stopPropagation(); next(); }}
                style={{ position:"absolute", right:"1.5rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"1px solid rgba(245,240,229,0.10)", color:"var(--text-1)", cursor:"pointer", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"border-color 200ms" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor="var(--accent)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="rgba(245,240,229,0.10)"}
              >→</button>

              <button onClick={() => setLb(null)}
                style={{ position:"absolute", top:"1.5rem", right:"1.5rem", background:"none", border:"none", color:"var(--text-3)", cursor:"pointer", fontSize:"1.1rem", padding:"0.5rem", transition:"color 200ms" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="var(--text-1)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="var(--text-3)"}
              >✕</button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <style>{`
        .child-link { opacity:0.55; transition:opacity 200ms; }
        .child-link:hover { opacity:1; }
        @media(max-width:699px) {
          .body-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
