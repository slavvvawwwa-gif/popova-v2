import { Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useLenis } from "@/hooks/useLenis";
import { useCursor } from "@/hooks/useCursor";
import Nav from "@/components/ui/Nav";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import About from "@/pages/About";
import Contacts from "@/pages/Contacts";
import WorkDetail from "@/pages/WorkDetail";
import ShaderBackground from "@/components/ShaderBackground";
import Grain from "@/components/ui/Grain";

// Theatre curtain: page scales up from below with a clip reveal
const pageVariants = {
  initial: {
    opacity: 0,
    clipPath: "inset(0 0 100% 0)",
  },
  enter: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.75, ease: [0.76, 0, 0.24, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.22 },
  },
} as const;

function AnimatedRoutes({ locale }: { locale: string }) {
  const location = useLocation();
  return (
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
          <Route path="/"               element={<Home locale={locale}/>}/>
          <Route path="/about"          element={<About locale={locale}/>}/>
          <Route path="/works"          element={<Works locale={locale} kind="performance"/>}/>
          <Route path="/works/:slug"    element={<WorkDetail locale={locale} basePath="/works"/>}/>
          <Route path="/projects"       element={<Works locale={locale} kind="project"/>}/>
          <Route path="/projects/:slug" element={<WorkDetail locale={locale} basePath="/projects"/>}/>
          <Route path="/lab"            element={<Works locale={locale} kind="lab"/>}/>
          <Route path="/lab/:slug"      element={<WorkDetail locale={locale} basePath="/lab"/>}/>
          <Route path="/contacts"       element={<Contacts/>}/>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppInner() {
  const [locale, setLocale] = useState("ru");
  useLenis();
  useCursor();

  const handleLocale = (l: string) => { setLocale(l); i18n.changeLanguage(l); };

  return (
    <>
      {/* Global WebGL shader — fixed, every page */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <ShaderBackground/>
      </div>

      {/* Film grain */}
      <Grain/>

      {/* Custom cursor dots */}
      <div id="cursor"/>
      <div id="cursor-ring"/>

      <Nav locale={locale} setLocale={handleLocale}/>

      <main style={{ position:"relative", zIndex:1 }}>
        <Suspense fallback={null}>
          <AnimatedRoutes locale={locale}/>
        </Suspense>
      </main>

      <footer style={{
        position:"relative", zIndex:1,
        padding:"3.5rem clamp(1.5rem,3vw,2.5rem)",
        borderTop:"1px solid rgba(245,240,229,0.045)",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:"1rem",
      }}>
        <span style={{ color:"var(--text-3)", fontSize:"0.6rem", letterSpacing:"0.12em", fontFamily:"var(--serif)", fontStyle:"italic" }}>
          Варвара Попова
        </span>
        <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
          <div style={{ width:1, height:12, background:"var(--accent)", opacity:0.4 }}/>
          <span style={{ color:"var(--text-3)", fontSize:"0.55rem", letterSpacing:"0.14em" }}>
            © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AppInner/>
      </BrowserRouter>
    </I18nextProvider>
  );
}
