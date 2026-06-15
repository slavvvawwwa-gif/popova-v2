import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const links = [
  { to: "/about",    key: "about"    },
  { to: "/works",    key: "works"    },
  { to: "/projects", key: "projects" },
  { to: "/lab",      key: "lab"      },
  { to: "/contacts", key: "contacts" },
];

export default function Nav({ locale, setLocale }: { locale: string; setLocale: (l: string) => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  // Issue #8: JS-based responsive avoids inline-style vs Tailwind conflicts
  const [mobile, setMobile]     = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "1.4rem clamp(1.5rem,3vw,2.5rem)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "background 400ms, backdrop-filter 400ms",
      background:     scrolled ? "rgba(7,5,10,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom:   scrolled ? "1px solid rgba(245,240,229,0.04)" : "none",
    }}>
      <Link to="/" style={{ textDecoration: "none", fontFamily: "var(--serif)", fontSize: "1.05rem", fontWeight: 300, color: "var(--text-1)", letterSpacing: "0.05em" }}>
        Варвара Попова
      </Link>

      {/* Desktop nav */}
      {!mobile && (
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={{
                textDecoration: "none", fontSize: "0.7rem", letterSpacing: "0.16em",
                textTransform: "uppercase", position: "relative",
                color: pathname.startsWith(l.to) ? "var(--text-1)" : "var(--text-3)",
                transition: "color 250ms",
              }}
              onMouseEnter={e => { if (!pathname.startsWith(l.to)) (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
              onMouseLeave={e => { if (!pathname.startsWith(l.to)) (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
            >
              {t(`nav.${l.key}`)}
              {pathname.startsWith(l.to) && (
                <motion.span layoutId="nav-underline" style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 1, background: "var(--accent)" }} />
              )}
            </Link>
          ))}
          <button
            onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
            style={{ background: "none", border: "1px solid rgba(245,240,229,0.14)", color: "var(--text-3)", fontSize: "0.52rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "0.3rem 0.6rem", cursor: "pointer", transition: "all 250ms" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,240,229,0.14)"; }}
          >
            {locale === "ru" ? "EN" : "RU"}
          </button>
        </nav>
      )}

      {/* Mobile burger button */}
      {mobile && (
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Меню"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 6, zIndex: 200, position: "relative" }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{
                rotate:  open && i === 0 ? 45 : open && i === 2 ? -45 : 0,
                y:       open && i === 0 ? 7  : open && i === 2 ? -7  : 0,
                opacity: open && i === 1 ? 0  : 1,
              }}
              transition={{ duration: 0.28 }}
              style={{ display: "block", width: 22, height: 1, background: "var(--text-1)", transformOrigin: "center" }}
            />
          ))}
        </button>
      )}

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobile && open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(7,5,10,0.97)",
              display: "flex", flexDirection: "column",
              alignItems: "flex-end", justifyContent: "center",
              padding: "3rem clamp(1.5rem,6vw,3rem)",
              zIndex: 150,
            }}
          >
            {links.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <Link
                  to={l.to}
                  style={{ display: "block", fontFamily: "var(--serif)", fontSize: "clamp(2rem,9vw,4.5rem)", fontWeight: 300, color: pathname.startsWith(l.to) ? "var(--accent)" : "var(--text-1)", textDecoration: "none", marginBottom: "1rem", textAlign: "right" }}
                >
                  {t(`nav.${l.key}`)}
                </Link>
              </motion.div>
            ))}
            <button
              onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
              style={{ marginTop: "2rem", background: "none", border: "1px solid rgba(245,240,229,0.15)", color: "var(--text-3)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "0.4rem 0.8rem", cursor: "pointer" }}
            >
              {locale === "ru" ? "EN" : "RU"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
