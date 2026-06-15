import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface Props {
  url: string;
}

export default function SplineHero({ url }: Props) {
  return (
    <Suspense fallback={null}>
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        {/* Spline canvas — desaturated, darkened, hue shifted toward red */}
        <div style={{
          position:"absolute", inset:0,
          filter:"saturate(0.25) brightness(0.55) hue-rotate(-20deg)",
        }}>
          <Spline scene={url} style={{ width:"100%", height:"100%" }}/>
        </div>

        {/* Dark base so background doesn't bleed through */}
        <div style={{
          position:"absolute", inset:0,
          background:"var(--bg)",
          opacity:0.35,
          mixBlendMode:"multiply",
        }}/>

        {/* Subtle red accent glow — left side, matches hero text position */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 55% 70% at 15% 55%, rgba(214,48,60,0.18) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>

        {/* Bottom fade to page background */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:"35%",
          background:"linear-gradient(to bottom, transparent, var(--bg))",
        }}/>
      </div>
    </Suspense>
  );
}
