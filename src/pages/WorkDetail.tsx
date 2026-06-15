import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getPerformance, type WorkDetail as WD, type GalleryImg } from "@/lib/data";

export default function WorkDetail({ locale, basePath="/works" }: { locale:string; basePath?:string }) {
  const { slug } = useParams<{ slug:string }>();
  const [work, setWork] = useState<WD|null>(null);
  const [lb, setLb] = useState<number|null>(null);
  const [dragLimit, setDragLimit] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) getPerformance(slug, locale as "ru"|"en").then(setWork);
  }, [slug, locale]);

  useEffect(() => {
    const update = () => {
      if (!stripRef.current || !wrapRef.current) return;
      setDragLimit(Math.max(0, stripRef.current.scrollWidth - wrapRef.current.offsetWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [work]);

  if (!work) return (
    <div style={{ height:"100svh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="eyebrow">Загрузка…</span>
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

  return (
    <div>
      {/* Cover fullbleed */}
      <div style={{ position:"relative", height:"75svh", overflow:"hidden" }}>
        {work.coverUrl && (
          <img src={work.coverUrl} alt={work.title}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.85) 100%)" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"clamp(2rem,5vw,4rem)" }}>
          <p className="eyebrow" style={{ marginBottom:"0.75rem" }}>
            {work.theatre}{work.year ? ` · ${work.year}` : ""}
          </p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,7vw,6rem)", fontWeight:300, lineHeight:0.92, color:"var(--text-1)" }}>
            {work.title}
          </h1>
          {work.shortDescription && (
            <p style={{ marginTop:"1rem", color:"var(--text-2)", fontSize:"0.9375rem", maxWidth:600, lineHeight:1.7 }}>
              {work.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"4rem 2rem 2rem", display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:"4rem", alignItems:"start" }}>
        {/* Main description */}
        <div>
          <Link to={basePath} style={{ fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.5rem", marginBottom:"3rem" }}>
            ← Назад
          </Link>
          {work.fullDescription && (
            <div style={{ color:"var(--text-2)", lineHeight:1.85, fontSize:"0.9375rem", marginBottom:"3rem" }}>
              <PortableText value={work.fullDescription as Parameters<typeof PortableText>[0]["value"]}/>
            </div>
          )}
          {work.children.length > 0 && (
            <div style={{ marginTop:"3rem" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Выпуски</p>
              {work.children.map(c => (
                <Link key={c.slug} to={`${basePath}/${c.slug}`}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"0.75rem 0", borderBottom:"1px solid rgba(240,240,240,0.05)", textDecoration:"none", opacity:0.6, transition:"opacity 200ms" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity="1"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity="0.6"}
                >
                  <span style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--text-1)" }}>{c.title}</span>
                  <span style={{ fontSize:"0.7rem", color:"var(--text-3)" }}>{c.year}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Credits sidebar */}
        {credits.length > 0 && (
          <div style={{ position:"sticky", top:"7rem" }}>
            {credits.map(([label, val]) => (
              <div key={label} style={{ marginBottom:"1.5rem" }}>
                <p className="eyebrow" style={{ marginBottom:"0.3rem" }}>{label}</p>
                <p style={{ color:"var(--text-1)", fontSize:"0.875rem", lineHeight:1.6 }}>{val}</p>
              </div>
            ))}
            {work.creditsExtra && (
              <p style={{ color:"var(--text-2)", fontSize:"0.8rem", lineHeight:1.6, marginTop:"2rem", paddingTop:"2rem", borderTop:"1px solid rgba(240,240,240,0.06)" }}>
                {work.creditsExtra}
              </p>
            )}
            {work.videos.map(v => (
              <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer"
                style={{ display:"block", marginTop:"2rem", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--accent)", textDecoration:"none" }}>
                ▶ {v.label || "Смотреть видео"}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main gallery — full-width drag strip */}
      {work.gallery.length > 0 && (
        <GalleryStrip
          images={work.gallery}
          stripRef={stripRef}
          wrapRef={wrapRef}
          dragLimit={dragLimit}
          onOpen={setLb}
          label="Галерея"
        />
      )}

      {/* Content blocks: alternating textBlock / galleryBlock */}
      {work.content.map((block, idx) => {
        if (block.kind === "text") {
          return (
            <div key={idx} style={{ maxWidth:1200, margin:"0 auto", padding:"4rem 2rem" }}>
              <div style={{ maxWidth:720, color:"var(--text-2)", lineHeight:1.9, fontSize:"0.9375rem" }}>
                {block.body && (
                  <PortableText value={block.body as Parameters<typeof PortableText>[0]["value"]}/>
                )}
              </div>
            </div>
          );
        }
        if (block.kind === "gallery" && block.images.length > 0) {
          return (
            <ContentGalleryStrip key={idx} images={block.images} onOpen={i => {
              // offset into main lightbox array: main gallery length + previous content galleries
              const prevGalleryImgs = work.content.slice(0, idx)
                .filter(b => b.kind === "gallery")
                .reduce((acc, b) => acc + (b.kind === "gallery" ? b.images.length : 0), 0);
              setLb(work.gallery.length + prevGalleryImgs + i);
            }}/>
          );
        }
        return null;
      })}

      {/* Lightbox — spans main gallery + all content galleries */}
      <AnimatePresence>
        {lb !== null && (() => {
          const allImgs = [
            ...work.gallery,
            ...work.content.flatMap(b => b.kind === "gallery" ? b.images : []),
          ];
          const cur = allImgs[lb];
          if (!cur) return null;
          return (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.96)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
              onClick={() => setLb(null)}
            >
              {cur.url && (
                <img src={cur.url} alt={cur.alt}
                  style={{ maxHeight:"90vh", maxWidth:"90vw", objectFit:"contain" }}
                  onClick={e => e.stopPropagation()}/>
              )}
              <button style={{ position:"absolute", left:"1.5rem", background:"none", border:"1px solid rgba(240,240,240,0.15)", color:"var(--text-1)", cursor:"pointer", padding:"0.75rem 1.25rem", fontSize:"1.2rem" }}
                onClick={e => { e.stopPropagation(); setLb(i => i !== null ? (i > 0 ? i-1 : allImgs.length-1) : 0); }}>←</button>
              <button style={{ position:"absolute", right:"1.5rem", background:"none", border:"1px solid rgba(240,240,240,0.15)", color:"var(--text-1)", cursor:"pointer", padding:"0.75rem 1.25rem", fontSize:"1.2rem" }}
                onClick={e => { e.stopPropagation(); setLb(i => i !== null ? (i < allImgs.length-1 ? i+1 : 0) : 0); }}>→</button>
              <button style={{ position:"absolute", top:"1.5rem", right:"1.5rem", background:"none", border:"none", color:"var(--text-2)", cursor:"pointer", fontSize:"1.5rem" }}
                onClick={() => setLb(null)}>✕</button>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

/* ── Shared drag-strip gallery ── */
function GalleryStrip({
  images, stripRef, wrapRef, dragLimit, onOpen, label,
}: {
  images: GalleryImg[];
  stripRef: React.RefObject<HTMLDivElement | null>;
  wrapRef: React.RefObject<HTMLDivElement | null>;
  dragLimit: number;
  onOpen: (i:number) => void;
  label?: string;
}) {
  return (
    <div style={{ marginTop:"4rem", overflow:"hidden" }}>
      {label && <p className="eyebrow" style={{ padding:"0 2rem", marginBottom:"1.5rem" }}>{label}</p>}
      <div ref={wrapRef} style={{ overflow:"hidden", cursor:"grab", userSelect:"none" }}>
        <motion.div
          ref={stripRef}
          drag="x"
          dragConstraints={{ right:0, left: -dragLimit }}
          dragElastic={0.05}
          style={{ display:"flex", gap:2 }}
          whileDrag={{ cursor:"grabbing" }}
        >
          {images.map((g, i) => g.url && (
            <div
              key={i}
              style={{ flexShrink:0, width:"clamp(280px,30vw,480px)", height:"70vh", overflow:"hidden", position:"relative" }}
              onClick={() => onOpen(i)}
            >
              <img src={g.url} alt={g.alt}
                style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 600ms var(--ease-expo)", pointerEvents:"none" }}
                className="gal-img"/>
              {g.caption && (
                <p style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0.75rem 1rem", background:"rgba(8,8,8,0.65)", fontSize:"0.7rem", color:"var(--text-2)", letterSpacing:"0.05em" }}>
                  {g.caption}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      </div>
      <style>{`.gal-img:hover{transform:scale(1.04)}`}</style>
    </div>
  );
}

function ContentGalleryStrip({ images, onOpen }: { images:GalleryImg[]; onOpen:(i:number)=>void }) {
  const [dragLimit, setDragLimit] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (!stripRef.current || !wrapRef.current) return;
      setDragLimit(Math.max(0, stripRef.current.scrollWidth - wrapRef.current.offsetWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [images]);

  return (
    <GalleryStrip
      images={images}
      stripRef={stripRef}
      wrapRef={wrapRef as React.RefObject<HTMLDivElement | null>}
      dragLimit={dragLimit}
      onOpen={onOpen}
    />
  );
}
