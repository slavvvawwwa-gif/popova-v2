import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPerformances, type WorkCard } from "@/lib/data";

const YEAR_WIN = 5;

function ArrowBtn({ dir, disabled, onClick }: { dir:"left"|"right"; disabled:boolean; onClick:()=>void }) {
  return (
    <button onClick={disabled?undefined:onClick} disabled={disabled} style={{ background:"none", border:"none", cursor:disabled?"default":"pointer", color:disabled?"rgba(240,240,240,0.16)":"var(--text-2)", padding:"0.2rem", transition:"color 200ms", display:"inline-flex" }}
      onMouseEnter={e => { if(!disabled)(e.currentTarget as HTMLElement).style.color="var(--accent)"; }}
      onMouseLeave={e => { if(!disabled)(e.currentTarget as HTMLElement).style.color="var(--text-2)"; }}
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ transform:dir==="left"?"rotate(180deg)":"none" }}>
        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    </button>
  );
}

export default function Works({ locale, kind="performance" }: { locale:string; kind?:string }) {
  const [works, setWorks] = useState<WorkCard[]>([]);
  const [activeYear, setActiveYear] = useState<number|null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getPerformances(locale as "ru"|"en", kind).then(setWorks);
    setActiveYear(null); setPage(0);
  }, [locale, kind]);

  const years = [...new Set(works.map(w=>w.year).filter((y):y is number => y!=null))].sort((a,b)=>b-a);
  const visible = years.slice(page*YEAR_WIN, page*YEAR_WIN+YEAR_WIN);
  const hasOlder = (page+1)*YEAR_WIN < years.length;
  const hasNewer = page>0;

  const filtered = activeYear ? works.filter(w=>w.year===activeYear) : works;
  const current = filtered.filter(w=>w.status==="current");
  const archive = filtered.filter(w=>w.status==="archive");
  const basePath = kind==="project"?"/projects":kind==="lab"?"/lab":"/works";

  const title = kind==="project"?"Проекты":kind==="lab"?"Лаборатории":"Спектакли";

  return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"8rem 2rem 6rem" }}>
      <header style={{ display:"flex", flexWrap:"wrap", alignItems:"baseline", justifyContent:"space-between", gap:"1.5rem", marginBottom:"3rem", borderBottom:"1px solid rgba(240,240,240,0.06)", paddingBottom:"2rem" }}>
        <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
          style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,5vw,4rem)", fontWeight:300, color:"var(--text-1)" }}>{title}</motion.h1>

        <div style={{ display:"flex", gap:"1rem", alignItems:"center", flexWrap:"wrap" }}>
          {["Все", null].map((_, idx) => idx===0 && (
            <button key="all" onClick={()=>setActiveYear(null)} style={{ background:"none", border:"none", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:activeYear===null?"var(--text-1)":"var(--text-2)", cursor:"pointer", borderBottom:activeYear===null?"1px solid var(--accent)":"1px solid transparent", paddingBottom:2 }}>
              Все
            </button>
          ))}
          {years.length>YEAR_WIN && <ArrowBtn dir="left" disabled={!hasNewer} onClick={()=>setPage(p=>p-1)} />}
          {visible.map(y => (
            <button key={y} onClick={()=>setActiveYear(y)} style={{ background:"none", border:"none", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:activeYear===y?"var(--text-1)":"var(--text-2)", cursor:"pointer", borderBottom:activeYear===y?"1px solid var(--accent)":"1px solid transparent", paddingBottom:2 }}>
              {y}
            </button>
          ))}
          {years.length>YEAR_WIN && <ArrowBtn dir="right" disabled={!hasOlder} onClick={()=>setPage(p=>p+1)} />}
        </div>
      </header>

      {/* Current grid */}
      {current.length>0 && (
        <section style={{ marginBottom:"6rem" }}>
          {kind==="performance" && <p className="eyebrow" style={{ marginBottom:"2rem" }}>Текущий репертуар</p>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(280px,100%),1fr))", gap:2 }}>
            {current.map((w,i) => (
              <motion.div key={w.slug} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.7, delay:i*0.06, ease:[0.16,1,0.3,1] }}>
                <Link to={`${basePath}/${w.slug}`} style={{ display:"block", textDecoration:"none", position:"relative", overflow:"hidden", aspectRatio:"3/4", background:"var(--surface)" }}>
                  {w.coverUrl && <img src={w.coverUrl} alt={w.title} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 600ms var(--ease-expo)" }} className="hover-scale" />}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 55%)" }} />
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1.25rem" }}>
                    <p className="eyebrow" style={{ marginBottom:"0.4rem" }}>{w.theatre} · {w.year}</p>
                    <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", fontWeight:300, color:"var(--text-1)", lineHeight:1.05 }}>{w.title}</h2>
                  </div>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:"var(--accent)", transform:"scaleY(0)", transformOrigin:"bottom", transition:"transform 350ms var(--ease-soft)" }} className="accent-line" />
                </Link>
              </motion.div>
            ))}
          </div>
          <style>{`.hover-scale:hover{transform:scale(1.05)} a:hover .accent-line{transform:scaleY(1)}`}</style>
        </section>
      )}

      {/* Archive list */}
      {archive.length>0 && (
        <section>
          <p className="eyebrow" style={{ marginBottom:"1.5rem" }}>Архив</p>
          {archive.map((w,i) => (
            <motion.div key={w.slug} initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.03 }}>
              <Link to={`${basePath}/${w.slug}`} style={{ textDecoration:"none", display:"grid", gridTemplateColumns:"80px 1fr 160px", gap:"1.5rem", alignItems:"center", padding:"1rem 0", borderBottom:"1px solid rgba(240,240,240,0.04)", transition:"opacity 200ms" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="0.5"}
                className="archive-row"
              >
                <span style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:"var(--text-2)" }}>{w.year}</span>
                <span style={{ fontFamily:"var(--serif)", fontSize:"clamp(1rem,1.8vw,1.3rem)", fontWeight:300, color:"var(--text-1)" }}>{w.title}</span>
                <span style={{ fontSize:"0.7rem", color:"var(--text-3)", letterSpacing:"0.04em" }}>{w.theatre}</span>
              </Link>
            </motion.div>
          ))}
        </section>
      )}
    </div>
  );
}
