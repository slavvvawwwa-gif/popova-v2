export default function Grain() {
  return (
    <>
      <svg style={{ display: "none" }}>
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.06,
        filter: "url(#grain-filter)",
        mixBlendMode: "overlay",
      }} />
    </>
  );
}
