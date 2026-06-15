import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getFeatured, type WorkCard } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const BENTO = [{c:"col-span-8",r:"row-span-2"},{c:"col-span-4",r:"row-span-2"},{c:"col-span-4",r:"row-span-1"},{c:"col-span-4",r:"row-span-1"},{c:"col-span-4",r:"row-span-1"}];
const spanFor = (i:number) => BENTO[i%5];

function FeaturedCard({ w, i }: { w:WorkCard; i:number }) {
  const path = w.kind==="project"?"/projects":w.kind==="lab"?"/lab":"/works";
  const span = spanFor(i);
  return (
    <motion.div
      className={`${span.c} ${span.r}`}
      initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-60px" }}
      transition={{ duration:0.7, delay:(i%5)*0.08, ease:[0.16,1,0.3,1] }}
    >
      <Link to={`${path}/${w.slug}`} style={{ display:"block", textDecoration:"none", position:"relative", overflow:"hidden", width:"100%", height:"100%" }}>
        <div style={{ position:"absolute", inset:0, background:"var(--surface)" }}>
          {w.coverUrl && <img src={w.coverUrl} alt={w.title} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 700ms var(--ease-expo)" }} className="feat-img"/>}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.1) 60%, transparent 100%)" }}/>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1.25rem" }}>
          <p style={{ fontSize:"0.55rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-2)", marginBottom:"0.4rem" }}>{w.theatre} · {w.year}</p>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1rem,2.2vw,1.8rem)", fontWeight:300, lineHeight:1.05, color:"var(--text-1)", marginBottom: w.shortDescription?"0.4rem":"0" }}>{w.title}</h2>
          {w.shortDescription && <p style={{ fontSize:"0.75rem", color:"var(--text-2)", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{w.shortDescription}</p>}
        </div>
        <div style={{ position:"absolute", left:0, top:0, width:2, height:"100%", background:"var(--accent)", transform:"scaleY(0)", transformOrigin:"bottom", transition:"transform 350ms var(--ease-soft)" }} className="feat-bar"/>
      </Link>
    </motion.div>
  );
}

export default function Home({ locale }: { locale:string }) {
  const [featured, setFeatured] = useState<WorkCard[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef({ current: 0 });

  useEffect(() => { getFeatured(locale as "ru"|"en").then(setFeatured); }, [locale]);

  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(titleRef.current.querySelectorAll(".line"),
      { opacity:0, y:60 }, { opacity:1, y:0, duration:1.2, stagger:0.15, ease:"expo.out", delay:0.2 }
    );
  }, []);

  useEffect(() => {
    const onScroll = () => { scrollRef.current.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Hero */}
      <section style={{ position:"relative", height:"100svh", display:"flex", alignItems:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 20% 50%, rgba(214,48,60,0.06) 0%, transparent 70%)" }} aria-hidden="true"/>

        <div style={{ position:"relative", zIndex:1, padding:"0 clamp(1.5rem,5vw,4rem)", maxWidth:1300, margin:"0 auto", width:"100%" }}>
          <motion.p className="eyebrow" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.8 }} style={{ marginBottom:"1.5rem" }}>
            Театральный режиссёр
          </motion.p>
          <h1 ref={titleRef} style={{ fontFamily:"var(--serif)", fontSize:"clamp(4rem,12vw,10rem)", fontWeight:300, lineHeight:0.88, letterSpacing:"-0.025em", color:"var(--text-1)" }}>
            <span className="line" style={{ display:"block", opacity:0 }}>Варвара</span>
            <span className="line" style={{ display:"block", opacity:0, fontStyle:"italic", color:"var(--text-2)" }}>Попова</span>
          </h1>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.9 }} style={{ marginTop:"3rem", display:"flex", gap:"2rem", flexWrap:"wrap", alignItems:"center" }}>
            <Link to="/works" style={{ display:"inline-flex", alignItems:"center", gap:"0.75rem", textDecoration:"none", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-1)", paddingBottom:"3px", borderBottom:"1px solid var(--accent)" }}>
              Спектакли <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M0 4h14M10 1l4 3-4 3" stroke="currentColor" strokeWidth="1"/></svg>
            </Link>
            <Link to="/about" style={{ fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none" }}>Обо мне</Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.8 }}
          style={{ position:"absolute", bottom:"2.5rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}
        >
          <span className="eyebrow">Scroll</span>
          <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:1.5, ease:"easeInOut" }} style={{ width:1, height:40, background:"linear-gradient(to bottom,var(--accent),transparent)" }}/>
        </motion.div>
      </section>

      {/* Featured bento grid */}
      {featured.length > 0 && (
        <section style={{ padding:"8rem clamp(1.5rem,3vw,2rem)", maxWidth:1500, margin:"0 auto", width:"100%" }}>
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} style={{ display:"flex", alignItems:"center", gap:"2rem", marginBottom:"3rem" }}>
            <span className="eyebrow">Избранное</span>
            <div style={{ flex:1, height:1, background:"rgba(240,240,240,0.06)" }}/>
          </motion.div>
          <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(12,1fr)", gridAutoRows:"clamp(120px,12vw,200px)", gridAutoFlow:"dense", gap:2 }}>
            {featured.map((w,i)=><FeaturedCard key={w.slug} w={w} i={i}/>)}
          </div>
        </section>
      )}
      <style>{`
        .feat-img:hover{transform:scale(1.04)}
        a:hover .feat-bar{transform:scaleY(1)!important}
        @media(max-width:599px){
          .feat-grid{grid-template-columns:1fr!important;grid-auto-rows:64vw!important}
          .feat-grid>*{grid-column:1/-1!important;grid-row:span 1!important}
        }
      `}</style>
    </>
  );
}
