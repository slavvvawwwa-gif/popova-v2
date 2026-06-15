import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PortableText } from "@portabletext/react";
import { getBio, type BioData } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function About({ locale }: { locale: string }) {
  const [bio, setBio] = useState<BioData|null>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getBio(locale as "ru"|"en").then(setBio); }, [locale]);

  useEffect(() => {
    if (!photoRef.current) return;
    gsap.to(photoRef.current, {
      y: "15%", ease:"none",
      scrollTrigger: { trigger: photoRef.current, start:"top bottom", end:"bottom top", scrub:true },
    });
  }, [bio]);

  if (!bio) return <div style={{ height:"100svh", display:"flex", alignItems:"center", justifyContent:"center" }}><span className="eyebrow">Загрузка…</span></div>;

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"8rem 2rem 6rem" }}>
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:"6rem", alignItems:"start" }}>

        {/* Photo */}
        <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:1, ease:[0.16,1,0.3,1] }}>
          <div ref={photoRef} style={{ position:"sticky", top:"8rem", overflow:"hidden" }}>
            {bio.photoUrl
              ? <img src={bio.photoUrl} alt={bio.name} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover" }} />
              : <div style={{ width:"100%", aspectRatio:"3/4", background:"var(--surface)" }} />
            }
            <div style={{ marginTop:"2rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {bio.cvRu && <a href={bio.cvRu} download style={{ fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none", display:"flex", gap:"0.5rem", alignItems:"center" }}>↓ Скачать CV (RU)</a>}
              {bio.cvEn && <a href={bio.cvEn} download style={{ fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none", display:"flex", gap:"0.5rem", alignItems:"center" }}>↓ Download CV (EN)</a>}
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:1, delay:0.2, ease:[0.16,1,0.3,1] }}>
          <p className="eyebrow" style={{ marginBottom:"1rem" }}>Биография</p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:300, lineHeight:0.92, letterSpacing:"-0.02em", marginBottom:"1.5rem" }}>
            {bio.name.split(" ")[0]}<br/><em style={{ color:"var(--text-2)" }}>{bio.name.split(" ").slice(1).join(" ")}</em>
          </h1>
          {bio.role && <p className="eyebrow" style={{ color:"var(--accent)", marginBottom:"2rem" }}>{bio.role}</p>}
          <div style={{ color:"var(--text-2)", lineHeight:1.8, fontSize:"0.9375rem" }}>
            {bio.text ? <PortableText value={bio.text as Parameters<typeof PortableText>[0]["value"]} /> : null}
          </div>

          {bio.festivals.length>0 && (
            <div style={{ marginTop:"4rem" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Фестивали и проекты</p>
              {bio.festivals.map((e,i) => (
                <motion.div key={i} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.05 }}
                  style={{ display:"grid", gridTemplateColumns:"100px minmax(0,1fr)", gap:"1.5rem", padding:"1rem 0", borderBottom:"1px solid rgba(240,240,240,0.05)" }}
                >
                  <span style={{ fontFamily:"var(--serif)", color:"var(--text-3)", fontSize:"0.9rem" }}>{e.period}</span>
                  <p style={{ color:"var(--text-2)", fontSize:"0.875rem", lineHeight:1.7 }}>{e.description}</p>
                </motion.div>
              ))}
            </div>
          )}
          {bio.education.length>0 && (
            <div style={{ marginTop:"3rem" }}>
              <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Образование</p>
              {bio.education.map((e,i) => (
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
