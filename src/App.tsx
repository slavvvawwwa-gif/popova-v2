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

const easeArr: [number,number,number,number] = [0.16,1,0.3,1];
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeArr } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
} as const;

function AnimatedRoutes({ locale }: { locale: string }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home locale={locale} />} />
          <Route path="/works" element={<Works locale={locale} kind="performance" />} />
          <Route path="/works/:slug" element={<WorkDetail locale={locale} basePath="/works" />} />
          <Route path="/projects" element={<Works locale={locale} kind="project" />} />
          <Route path="/projects/:slug" element={<WorkDetail locale={locale} basePath="/projects" />} />
          <Route path="/lab" element={<Works locale={locale} kind="lab" />} />
          <Route path="/lab/:slug" element={<WorkDetail locale={locale} basePath="/lab" />} />
          <Route path="/about" element={<About locale={locale} />} />
          <Route path="/contacts" element={<Contacts />} />
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
      <div id="cursor" />
      <div id="cursor-ring" />
      <Nav locale={locale} setLocale={handleLocale} />
      <main>
        <Suspense fallback={null}>
          <AnimatedRoutes locale={locale} />
        </Suspense>
      </main>
      <footer style={{ textAlign:"center", padding:"3rem 0", borderTop:"1px solid rgba(240,240,240,0.05)", color:"var(--text-3)", fontSize:"0.7rem", letterSpacing:"0.1em" }}>
        © {new Date().getFullYear()} Варвара Попова
      </footer>
    </>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </I18nextProvider>
  );
}
