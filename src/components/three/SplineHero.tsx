import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface Props {
  url: string;
}

export default function SplineHero({ url }: Props) {
  return (
    <Suspense fallback={null}>
      {/* Скрываем HTML-оверлеи текста из Spline-сцены, оставляем только canvas */}
      <style>{`
        #spline-hero canvas ~ * { display: none !important; }
        #spline-hero canvas { display: block; }
      `}</style>

      <div id="spline-hero" style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        {/* Canvas сцены — немного осветлён, desaturate сохранён */}
        <div style={{
          position:"absolute", inset:0,
          filter:"saturate(0.2) brightness(0.75) hue-rotate(-10deg)",
        }}>
          <Spline scene={url} style={{ width:"100%", height:"100%" }}/>
        </div>

        {/* Затемняем верхнюю часть где текст сцены — убрать когда Spline-текст удалён */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"55%",
          background:"linear-gradient(to bottom, var(--bg) 30%, transparent 100%)",
        }}/>

        {/* Красный акцент-глоу слева (где имя) */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 55% 70% at 15% 60%, rgba(214,48,60,0.15) 0%, transparent 65%)",
        }}/>

        {/* Fade к низу страницы */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:"30%",
          background:"linear-gradient(to bottom, transparent, var(--bg))",
        }}/>
      </div>
    </Suspense>
  );
}
