const FRAMES = [
  { top:"9%",  left:"8%",  right:"8%",  bottom:"9%",  color:"rgba(212,175,55,0.10)", dur:"9s",  delay:"0s",   ry: 8,  rx: 2,   ty:-8  },
  { top:"14%", left:"14%", right:"14%", bottom:"14%", color:"rgba(184,115,51,0.14)", dur:"11s", delay:"-3s",  ry:-10, rx: 2.5, ty:-10 },
  { top:"5%",  left:"5%",  right:"38%", bottom:"5%",  color:"rgba(212,175,55,0.09)", dur:"13s", delay:"-6s",  ry: 12, rx: 1.5, ty:-12 },
  { top:"5%",  left:"40%", right:"5%",  bottom:"5%",  color:"rgba(184,115,51,0.08)", dur:"10s", delay:"-2s",  ry:-9,  rx: 3,   ty:-6  },
  { top:"2%",  left:"3%",  right:"3%",  bottom:"2%",  color:"rgba(212,175,55,0.05)", dur:"15s", delay:"-7s",  ry: 5,  rx: 1,   ty:-4  },
];

const DOTS = Array.from({ length: 24 }, (_, i) => ({
  left:  `${4 + (i * 17 % 92)}%`,
  top:   `${4 + (i * 23 % 92)}%`,
  dur:   `${5 + (i % 5) * 2}s`,
  delay: `-${(i * 0.8) % 7}s`,
  phase: i % 5,
}));

const KF = `
@keyframes hf0{0%,100%{transform:perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0)}50%{transform:perspective(1200px) rotateY(8deg) rotateX(2deg) translateY(-8px)}}
@keyframes hf1{0%,100%{transform:perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0)}50%{transform:perspective(1200px) rotateY(-10deg) rotateX(2.5deg) translateY(-10px)}}
@keyframes hf2{0%,100%{transform:perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0)}50%{transform:perspective(1200px) rotateY(12deg) rotateX(1.5deg) translateY(-12px)}}
@keyframes hf3{0%,100%{transform:perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0)}50%{transform:perspective(1200px) rotateY(-9deg) rotateX(3deg) translateY(-6px)}}
@keyframes hf4{0%,100%{transform:perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0)}50%{transform:perspective(1200px) rotateY(5deg) rotateX(1deg) translateY(-4px)}}
@keyframes dp0{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.3)}}
@keyframes dp1{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.2)}}
@keyframes dp2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.4)}}
@keyframes dp3{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.1)}}
@keyframes dp4{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.3)}}
`;

export default function CSSHeroFrames() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{KF}</style>

      {FRAMES.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          top: f.top, left: f.left, right: f.right, bottom: f.bottom,
          border: `1px solid ${f.color}`,
          animation: `hf${i} ${f.dur} ease-in-out ${f.delay} infinite`,
        }} />
      ))}

      {DOTS.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          left: d.left, top: d.top,
          width: 2, height: 2,
          borderRadius: "50%",
          background: "rgba(212,175,55,0.28)",
          animation: `dp${d.phase} ${d.dur} ease-in-out ${d.delay} infinite`,
        }} />
      ))}
    </div>
  );
}
