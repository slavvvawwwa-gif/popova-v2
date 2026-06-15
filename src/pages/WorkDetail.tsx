import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { getPerformance, type WorkDetail as WD } from "@/lib/data";

export default function WorkDetail({ locale, basePath="/works" }: { locale:string; basePath?:string }) {
  const { slug } = useParams<{ slug:string }>();
  const [work, setWork] = useState<WD|null>(null);
  const [lb, setLb] = useState<number|null>(null);

  useEffect(() => {
    if (slug) getPerformance(slug, locale as "ru"|"en").then(setWork);
  }, [slug, locale]);

  if (!work) return <div style={{ height:"100svh", display:"flex", alignItems:"center", justifyContent:"center" }}><span className="eyebrow">Загрузка…</span></div>;

  const credits = [
    ["Режиссёр",work.role],["Драматург",work.playwright],["Художник",work.artist],
    ["Композитор",work.composer],["Хореограф",work.choreographer],["Перформеры",work.performers],
  ].filter(([,v])=>v);

  return (
    <div>
      {/* Cover */}
      <div style={{ position:"relative", height:"70svh", overflow:"hidden" }}>
        {work.coverUrl && <img src={work.coverUrl} alt={work.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.8) 100%)" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"3rem 2rem" }}>
          <p className="eyebrow" style={{ marginBottom:"0.75rem" }}>{work.theatre} · {work.year}</p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,6vw,5rem)", fontWeight:300, lineHeight:0.95, color:"var(--text-1)" }}>{work.title}</h1>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"4rem 2rem 6rem", display:"grid", gridTemplateColumns:"minmax(0,2fr) minmax(0,1fr)", gap:"4rem", alignItems:"start" }}>
        {/* Main */}
        <div>
          <Link to={basePath} style={{ fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"0.5rem", marginBottom:"3rem" }}>
            ← Назад
          </Link>
          {work.fullDescription && (
            <div style={{ color:"var(--text-2)", lineHeight:1.85, fontSize:"0.9375rem", marginBottom:"3rem" }}>
              <PortableText value={work.fullDescription as Parameters<typeof PortableText>[0]["value"]} />
            </div>
          )}
          {/* Gallery */}
          {work.gallery.length>0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:2, marginBottom:"3rem" }}>
              {work.gallery.map((g,i) => g.url && (
                <div key={i} style={{ aspectRatio:"3/4", overflow:"hidden", cursor:"pointer" }} onClick={()=>setLb(i)}>
                  <img src={g.url} alt={g.alt} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 500ms var(--ease-expo)" }} className="hover-scale" />
                </div>
              ))}
            </div>
          )}
          {/* Children */}
          {work.children.length>0 && (
            <div style={{ marginTop:"3rem" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Выпуски</p>
              {work.children.map(c => (
                <Link key={c.slug} to={`${basePath}/${c.slug}`} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"0.75rem 0", borderBottom:"1px solid rgba(240,240,240,0.05)", textDecoration:"none", transition:"opacity 200ms", opacity:0.6 }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="0.6"}
                >
                  <span style={{ fontFamily:"var(--serif)", fontSize:"1.1rem", color:"var(--text-1)" }}>{c.title}</span>
                  <span style={{ fontSize:"0.7rem", color:"var(--text-3)" }}>{c.year}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Credits */}
        <div style={{ position:"sticky", top:"7rem" }}>
          {credits.map(([label,val]) => (
            <div key={label} style={{ marginBottom:"1.5rem" }}>
              <p className="eyebrow" style={{ marginBottom:"0.3rem" }}>{label}</p>
              <p style={{ color:"var(--text-1)", fontSize:"0.875rem" }}>{val}</p>
            </div>
          ))}
          {work.creditsExtra && <p style={{ color:"var(--text-2)", fontSize:"0.8rem", lineHeight:1.6, marginTop:"2rem" }}>{work.creditsExtra}</p>}
          {work.videos.map(v => (
            <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer" style={{ display:"block", marginTop:"2rem", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--accent)", textDecoration:"none" }}>
              ▶ {v.label || "Смотреть видео"}
            </a>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lb!==null && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}
            onClick={()=>setLb(null)}
          >
            {work.gallery[lb]?.url && <img src={work.gallery[lb].url!} alt="" style={{ maxHeight:"90vh", maxWidth:"90vw", objectFit:"contain" }} onClick={e=>e.stopPropagation()} />}
            <button style={{ position:"absolute", left:"1.5rem", background:"none", border:"1px solid rgba(240,240,240,0.15)", color:"var(--text-1)", cursor:"pointer", padding:"0.75rem 1rem", fontSize:"1rem" }} onClick={e=>{e.stopPropagation();setLb(i=>(i!==null&&i>0)?i-1:work.gallery.length-1)}}>←</button>
            <button style={{ position:"absolute", right:"1.5rem", background:"none", border:"1px solid rgba(240,240,240,0.15)", color:"var(--text-1)", cursor:"pointer", padding:"0.75rem 1rem", fontSize:"1rem" }} onClick={e=>{e.stopPropagation();setLb(i=>(i!==null&&i<work.gallery.length-1)?i+1:0)}}>→</button>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.hover-scale:hover{transform:scale(1.07)}`}</style>
    </div>
  );
}
