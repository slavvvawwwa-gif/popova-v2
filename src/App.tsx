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

const ease = [0.76, 0, 0.24, 1] as const;

// Clip-path curtain: new page wipes in from top
const pageVariants = {
  initial: { clipPath: "inset(0 0 100% 0)", opacity: 1 },
  enter:   { clipPath: "inset(0 0 0% 0)",   opacity: 1, transition: { duration: 0.65, ease } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
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
        style={{ willChange: "clip-path, opacity" }}
      >
        <Routes location={location}>
          <Route path="/"             element={<Home locale={locale}/>}/>
          <Route path="/about"        element={<About locale={locale}/>}/>
          <Route path="/works"        element={<Works locale={locale} kind="performance"/>}/>
          <Route path="/works/:slug"  element={<WorkDetail locale={locale} basePath="/works"/>}/>
          <Route path="/projects"     element={<Works locale={locale} kind="project"/>}/>
          <Route path="/projects/:slug" element={<WorkDetail locale={locale} basePath="/projects"/>}/>
          <Route path="/lab"          element={<Works locale={locale} kind="lab"/>}/>
          <Route path="/lab/:slug"    element={<WorkDetail locale={locale} basePath="/lab"/>}/>
          <Route path="/contacts"     element={<Contacts/>}/>
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
      {/* Global WebGL shader — fixed, all pages */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <ShaderBackground/>
      </div>

      {/* Film grain overlay */}
      <Grain/>

      <div id="cursor"/>
      <div id="cursor-ring"/>

      <Nav locale={locale} setLocale={handleLocale}/>

      <main style={{ position: "relative", zIndex: 1 }}>
        <Suspense fallback={null}>
          <AnimatedRoutes locale={locale}/>
        </Suspense>
      </main>

      <footer style={{
        position: "relative", zIndex: 1,
        textAlign: "center", padding: "3rem 0",
        borderTop: "1px solid rgba(240,240,240,0.04)",
        color: "var(--text-3)", fontSize: "0.65rem", letterSpacing: "0.12em",
      }}>
        © {new Date().getFullYear()} Варвара Попова
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
