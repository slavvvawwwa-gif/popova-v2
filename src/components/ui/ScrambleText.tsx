import { useEffect, useRef, useState } from "react";

const CHARS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩабвгдежзиклмнопрстуфхцчшщABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&";

export default function ScrambleText({
  text, className, style, delay = 0,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const [out, setOut] = useState(text);
  const ref  = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    done.current = false;
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (done.current) return;
      done.current = true;
      let frame = 0;
      const FRAMES = 22;
      const step = () => {
        frame++;
        const progress = frame / FRAMES;
        setOut(
          text.split("").map((ch, i) => {
            if (ch === " ") return " ";
            return i / text.length < progress
              ? ch
              : CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        if (frame < FRAMES) setTimeout(step, 35);
        else setOut(text);
      };
      setTimeout(step, delay);
    };

    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) run(); },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, delay]);

  return (
    <span ref={ref} className={className} style={style}>
      {out}
    </span>
  );
}
