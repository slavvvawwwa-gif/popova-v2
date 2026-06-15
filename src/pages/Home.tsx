import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getFeatured, type WorkCard } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

function WorkItem({ w, i }: { w: WorkCard; i: number }) {
  const path = w.kind==="project"?"/projects":w.kind==="lab"?"/lab":"/works";
  return (
    <motion.div
      initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-80px" }}
      transition={{ duration:0.8, delay: i*0.1, ease:[0.16,1,0.3,1] }}
    >
      <Link to={`${path}/${w.slug}`} style={{ display:"block", textDecoration:"none", position:"relative", overflow:"hidden", aspectRatio: i%3===0?"4/3":"2/3" }}>
        <div style={{ position:"absolute", inset:0, background:"var(--surface)" }}>
          {w.coverUrl && <img src={w.coverUrl} alt={w.title} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 700ms var(--ease-expo)" }} className="cover-img" />}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 60%)" }} />
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1.5rem" }}>
          <p className="eyebrow" style={{ marginBottom:"0.5rem" }}>{w.theatre} · {w.year}</p>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.2rem,2.5vw,2rem)", fontWeight:300, color:"var(--text-1)", lineHeight:1.05 }}>{w.title}</h2>
        </div>
        <div style={{ position:"absolute", left:0, top:0, width:2, height:"100%", background:"var(--accent)", transform:"scaleY(0)", transformOrigin:"bottom", transition:"transform 400ms var(--ease-soft)" }} className="accent-bar" />
      </Link>
      <style>{`.cover-img:hover{transform:scale(1.04)} a:hover .accent-bar{transform:scaleY(1)}`}</style>
    </motion.div>
  );
}

export default function Home({ locale }: { locale: string }) {
  const [featured, setFeatured] = useState<WorkCard[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    getFeatured(locale as "ru"|"en").then(setFeatured);
  }, [locale]);

  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(titleRef.current, { opacity:0, y:60 }, { opacity:1, y:0, duration:1.2, ease:"expo.out", delay:0.3 });
  }, []);

  // Parallax on hero
  useEffect(() => {
    if (!heroRef.current) return;
    const tl = gsap.to(heroRef.current, {
      y: "-20%", ease:"none",
      scrollTrigger: { trigger: heroRef.current, start:"top top", end:"bottom top", scrub:true },
    });
    return () => { tl.scrollTrigger?.kill(); };
  }, []);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} style={{ position:"relative", height:"100svh", display:"flex", alignItems:"center", overflow:"hidden" }}>
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        {/* Gradient overlay */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 60% 50%, rgba(214,48,60,0.04) 0%, transparent 70%)" }} />

        <div style={{ position:"relative", zIndex:1, padding:"0 2rem", maxWidth:1200, margin:"0 auto", width:"100%" }}>
          <motion.p className="eyebrow" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}>
            Театральный режиссёр
          </motion.p>
          <h1
            ref={titleRef}
            style={{ fontFamily:"var(--serif)", fontSize:"clamp(3.5rem,10vw,9rem)", fontWeight:300, lineHeight:0.9, letterSpacing:"-0.02em", color:"var(--text-1)", marginTop:"1rem", marginBottom:"2rem", opacity:0 }}
          >
            Варвара<br/><em style={{ color:"var(--text-2)", fontStyle:"italic" }}>Попова</em>
          </h1>
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.6 }}
            style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}
          >
            <Link to="/works" style={{ display:"inline-flex", alignItems:"center", gap:"0.75rem", textDecoration:"none", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-1)", borderBottom:"1px solid var(--accent)", paddingBottom:"3px" }}>
              Спектакли
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1"/></svg>
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          style={{ position:"absolute", bottom:"2.5rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}
        >
          <span className="eyebrow">Scroll</span>
          <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }} style={{ width:1, height:40, background:"linear-gradient(to bottom, var(--accent), transparent)" }} />
        </motion.div>
      </section>

      {/* Featured grid */}
      {featured.length > 0 && (
        <section style={{ padding:"8rem 2rem", maxWidth:1400, margin:"0 auto", width:"100%" }}>
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            style={{ display:"flex", alignItems:"center", gap:"2rem", marginBottom:"4rem" }}
          >
            <span className="eyebrow">Избранное</span>
            <div style={{ flex:1, height:1, background:"rgba(240,240,240,0.06)" }} />
          </motion.div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(min(300px,100%),1fr))", gap:"2px" }}>
            {featured.map((w, i) => <WorkItem key={w.slug} w={w} i={i} />)}
          </div>
        </section>
      )}
    </>
  );
}
