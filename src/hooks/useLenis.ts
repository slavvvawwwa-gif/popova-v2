import { useEffect } from "react";
import Lenis from "lenis";

let lenis: Lenis | null = null;

export function useLenis() {
  useEffect(() => {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(time: number) { lenis!.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => { lenis?.destroy(); lenis = null; };
  }, []);
  return lenis;
}
