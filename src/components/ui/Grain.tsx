import { useEffect, useRef } from "react";

// Issue #6: z-index 0 keeps grain between shader (z:0) and content (z:1) — no overlay on photos/text
export default function Grain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const S = 256;
    c.width = c.height = S;

    let raf = 0, last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 110) return; // ~9fps — subtle, less flicker perception
      last = t;
      const d = ctx.createImageData(S, S);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d.data[i] = d.data[i+1] = d.data[i+2] = v;
        d.data[i+3] = 255;
      }
      ctx.putImageData(d, 0, 0);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.022,
        pointerEvents: "none",
        zIndex: 0,
        mixBlendMode: "overlay",
      }}
    />
  );
}
