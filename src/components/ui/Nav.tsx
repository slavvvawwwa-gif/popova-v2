import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const links = [
  { to: "/about", key: "about" },
  { to: "/works", key: "works" },
  { to: "/projects", key: "projects" },
  { to: "/lab", key: "lab" },
  { to: "/contacts", key: "contacts" },
];

export default function Nav({ locale, setLocale }: { locale: string; setLocale: (l: string)=>void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"1.5rem 2rem",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"background 400ms, backdrop-filter 400ms",
      background: scrolled ? "rgba(8,8,8,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(240,240,240,0.05)" : "none",
    }}>
      <Link to="/" style={{ textDecoration:"none", fontFamily:"var(--serif)", fontSize:"1.1rem", fontWeight:300, color:"var(--text-1)", letterSpacing:"0.04em" }}>
        Варвара Попова
      </Link>

      <nav style={{ display:"flex", gap:"2rem", alignItems:"center" }} className="hidden md:flex">
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            textDecoration:"none", fontSize:"0.6rem", letterSpacing:"0.2em",
            textTransform:"uppercase", color: pathname.startsWith(l.to) ? "var(--text-1)" : "var(--text-2)",
            transition:"color 250ms", position:"relative",
          }}>
            {t(`nav.${l.key}`)}
            {pathname.startsWith(l.to) && (
              <motion.span layoutId="nav-underline" style={{ position:"absolute", bottom:-4, left:0, right:0, height:1, background:"var(--accent)" }} />
            )}
          </Link>
        ))}
        <button onClick={() => setLocale(locale==="ru"?"en":"ru")} style={{ background:"none", border:"1px solid rgba(240,240,240,0.15)", color:"var(--text-2)", fontSize:"0.55rem", letterSpacing:"0.18em", textTransform:"uppercase", padding:"0.3rem 0.6rem", cursor:"pointer", transition:"all 250ms" }}>
          {locale==="ru"?"EN":"RU"}
        </button>
      </nav>

      <button onClick={() => setOpen(o => !o)} className="md:hidden" style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", gap:5, padding:4 }}>
        {[0,1,2].map(i => (
          <motion.span key={i} animate={{ rotate: open&&i===0?45:open&&i===2?-45:0, y: open&&i===0?7:open&&i===2?-7:0, opacity: open&&i===1?0:1 }} style={{ display:"block", width:24, height:1, background:"var(--text-1)", transformOrigin:"center" }} />
        ))}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}
            style={{ position:"fixed", inset:0, background:"rgba(8,8,8,0.97)", display:"flex", flexDirection:"column", alignItems:"flex-end", justifyContent:"center", padding:"3rem 2rem", zIndex:-1 }}
          >
            {links.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}>
                <Link to={l.to} style={{ display:"block", fontFamily:"var(--serif)", fontSize:"clamp(2rem,8vw,4rem)", fontWeight:300, color:"var(--text-1)", textDecoration:"none", marginBottom:"1rem", textAlign:"right" }}>
                  {t(`nav.${l.key}`)}
                </Link>
              </motion.div>
            ))}
            <button onClick={() => setLocale(locale==="ru"?"en":"ru")} style={{ marginTop:"2rem", background:"none", border:"1px solid rgba(240,240,240,0.15)", color:"var(--text-2)", fontSize:"0.55rem", letterSpacing:"0.18em", textTransform:"uppercase", padding:"0.4rem 0.8rem", cursor:"pointer" }}>
              {locale==="ru"?"EN":"RU"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
