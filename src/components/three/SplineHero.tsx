import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface Props {
  url: string;
  style?: React.CSSProperties;
}

export default function SplineHero({ url, style }: Props) {
  return (
    <Suspense fallback={null}>
      <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", ...style }}>
        <Spline
          scene={url}
          style={{ width:"100%", height:"100%", opacity:0.75 }}
        />
      </div>
    </Suspense>
  );
}
