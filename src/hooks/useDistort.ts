import { useEffect, useRef } from "react";

const NS = "http://www.w3.org/2000/svg";

function svgEl<T extends SVGElement>(tag: string, attrs: Record<string, string>): T {
  const e = document.createElementNS(NS, tag) as T;
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/** Attaches a per-element SVG displacement filter that animates on hover. */
export function useDistort<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const img = container.querySelector("img");
    if (!img) return;

    const id = `dq${Math.random().toString(36).slice(2, 7)}`;

    const svg = svgEl<SVGSVGElement>("svg", {
      style: "position:absolute;width:0;height:0;pointer-events:none",
    });
    const defs   = svgEl<SVGDefsElement>("defs", {});
    const filter = svgEl<SVGFilterElement>("filter", {
      id, x: "-10%", y: "-10%", width: "120%", height: "120%",
    });
    const turb = svgEl<SVGFETurbulenceElement>("feTurbulence", {
      type: "fractalNoise", baseFrequency: "0.013",
      numOctaves: "3", seed: "7", result: "noise",
    });
    const disp = svgEl<SVGFEDisplacementMapElement>("feDisplacementMap", {
      in: "SourceGraphic", in2: "noise", scale: "0",
      xChannelSelector: "R", yChannelSelector: "G",
    });

    filter.append(turb, disp);
    defs.append(filter);
    svg.append(defs);
    document.body.append(svg);

    let raf = 0, cur = 0, tgt = 0;

    const tick = () => {
      cur += (tgt - cur) * 0.11;
      disp.setAttribute("scale", cur.toFixed(1));
      if (Math.abs(tgt - cur) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else if (tgt === 0) {
        cur = 0;
        disp.setAttribute("scale", "0");
        img.style.filter = "";
      }
    };

    const enter = () => {
      tgt = 20;
      img.style.filter = `url(#${id})`;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      tgt = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    container.addEventListener("mouseenter", enter);
    container.addEventListener("mouseleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mouseenter", enter);
      container.removeEventListener("mouseleave", leave);
      svg.remove();
    };
  }, []);

  return ref;
}
