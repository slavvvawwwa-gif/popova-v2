import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getContacts } from "@/lib/data";

interface ContactsData { email: string; social_links: { platform:string; url:string; handle:string }[] }

export default function Contacts() {
  const [data, setData] = useState<ContactsData|null>(null);
  useEffect(() => { getContacts().then(d => { if (d) setData(d as ContactsData); }); }, []);

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"8rem 2rem 6rem", minHeight:"80svh", display:"flex", flexDirection:"column", justifyContent:"center" }}>
      <motion.p className="eyebrow" initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginBottom:"1rem" }}>Контакты</motion.p>
      <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
        style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.5rem,7vw,6rem)", fontWeight:300, lineHeight:0.92, marginBottom:"4rem" }}
      >
        Свяжитесь<br/><em style={{ color:"var(--text-2)" }}>со мной</em>
      </motion.h1>

      {data?.email && (
        <motion.a href={`mailto:${data.email}`} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          style={{ fontSize:"clamp(1rem,2.5vw,1.5rem)", color:"var(--text-1)", textDecoration:"none", borderBottom:"1px solid var(--accent)", paddingBottom:4, width:"fit-content", marginBottom:"3rem" }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--accent)"}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--text-1)"}
        >
          {data.email}
        </motion.a>
      )}

      {(data?.social_links ?? []).length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}>
          {(data?.social_links ?? []).map(s => (
            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-2)", textDecoration:"none" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--text-1)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--text-2)"}
            >
              {s.platform}
            </a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
