import { useEffect } from "react";

export function useCursor() {
  useEffect(() => {
    const dot = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;
    let rx = 0, ry = 0;
    const move = (e: MouseEvent) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
      rx += (e.clientX - rx) * 0.12;
      ry += (e.clientY - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
    };
    let frame: number;
    const loop = () => { frame = requestAnimationFrame(loop); };
    loop();
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(frame); };
  }, []);
}
