import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useLenis } from "@/hooks/useLenis";
import { useCursor } from "@/hooks/useCursor";
import { scrollToTop } from "@/hooks/useLenis";
import Nav from "@/components/ui/Nav";
import ShaderBackground from "@/components/ShaderBackground";
import Grain from "@/components/ui/Grain";
import { getSiteTheme } from "@/lib/data";

// Lazy-load Studio — keeps 6 MB Sanity bundle out of the main chunk
const StudioPage = lazy(() => import("@/pages/StudioPage"));

// Lazy-load all pages — parallel fetching, smaller initial bundle
const Home      = lazy(() => import("@/pages/Home"));
const Works     = lazy(() => import("@/pages/Works"));
const About     = lazy(() => import("@/pages/About"));
const Contacts  = lazy(() => import("@/pages/Contacts"));
const WorkDetail = lazy(() => import("@/pages/WorkDetail"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { scrollToTop(); }, [pathname]);
  return null;
}

function applyTheme(hue: number) {
  const root = document.documentElement;
  const t = `hsl(${hue}`;
  const s = (l: string, sat: string) => `${t},${sat},${l})`;
  root.style.setProperty("--bg",       s("3.5%",  "28%"));
  root.style.setProperty("--surface",  s("5.5%",  "18%"));
  root.style.setProperty("--accent",   s("52%",   "68%"));
  root.style.setProperty("--accent-2", `hsl(${hue + 22},50%,40%)`);
  const tw = Math.round(hue * 0.08 + 26);
  root.style.setProperty("--text-1",   `hsl(${tw},38%,94%)`);
  root.style.setProperty("--text-2",   `hsla(${tw},28%,90%,0.50)`);
  root.style.setProperty("--text-3",   `hsla(${tw},20%,86%,0.22)`);
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0,        transition: { duration: 0.15 } },
} as const;

function AnimatedRoutes({ locale }: { locale: string }) {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="page-wrap"
      >
        <Routes location={location}>
          <Route path="/"               element={<Home locale={locale} />} />
          <Route path="/about"          element={<About locale={locale} />} />
          <Route path="/works"          element={<Works locale={locale} kind="performance" />} />
          <Route path="/works/:slug"    element={<WorkDetail locale={locale} basePath="/works" />} />
          <Route path="/projects"       element={<Works locale={locale} kind="project" />} />
          <Route path="/projects/:slug" element={<WorkDetail locale={locale} basePath="/projects" />} />
          <Route path="/lab"            element={<Works locale={locale} kind="lab" />} />
          <Route path="/lab/:slug"      element={<WorkDetail locale={locale} basePath="/lab" />} />
          <Route path="/contacts"       element={<Contacts />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
    </>
  );
}

function AppInner() {
  const [locale, setLocale] = useState("ru");
  const [hue, setHue] = useState(() => {
    const stored = localStorage.getItem("siteHue");
    const h = stored ? Number(stored) : 45;
    applyTheme(h);
    return h;
  });
  useLenis();
  useCursor();

  useEffect(() => {
    getSiteTheme().then(t => {
      if (t) {
        applyTheme(t.hue);
        setHue(t.hue);
        localStorage.setItem("siteHue", String(t.hue));
      }
    });
  }, []);

  const handleLocale = (l: string) => { setLocale(l); i18n.changeLanguage(l); };

  return (
    <div style={{ minHeight: "100svh" }}>
      {/* Global WebGL shader — fixed, every page */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <ShaderBackground hue={hue} />
      </div>

      {/* Fixed bottom-of-viewport gradient — fades shader into bg on scroll */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "28vh", background: "linear-gradient(to bottom, transparent, var(--bg))", pointerEvents: "none", zIndex: 2 }} />

      {/* Film grain */}
      <Grain />

      {/* Custom cursor */}
      <div id="cursor" />
      <div id="cursor-ring" />

      <Nav locale={locale} setLocale={handleLocale} />

      <main style={{ position: "relative", zIndex: 1 }}>
        <Suspense fallback={null}>
          <AnimatedRoutes locale={locale} />
        </Suspense>
      </main>

      <footer style={{
        position: "relative", zIndex: 1,
        padding: "2.5rem clamp(1.5rem,3vw,2.5rem)",
        borderTop: "1px solid rgba(245,240,229,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
      }}>
        <span style={{ color: "var(--text-3)", fontSize: "0.6rem", letterSpacing: "0.12em", fontFamily: "var(--serif)", fontStyle: "italic" }}>
          Варвара Попова
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ width: 1, height: 12, background: "var(--accent)", opacity: 0.35 }} />
          <span style={{ color: "var(--text-3)", fontSize: "0.55rem", letterSpacing: "0.14em" }}>
            © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Routes>
          <Route path="/studio/*" element={<StudioPage />} />
          <Route path="/*" element={<AppInner />} />
        </Routes>
      </BrowserRouter>
    </I18nextProvider>
  );
}
