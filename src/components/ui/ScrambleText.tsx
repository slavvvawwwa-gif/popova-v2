import { useEffect, useRef, useState } from "react";

let twCssInjected = false;

/** Typewriter effect — characters appear one by one with a blinking underline
 *  cursor under the current character. Triggers on scroll into view. */
export default function ScrambleText({
  text, className, style, delay = 0,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const [typed, setTyped]  = useState(0);
  const ref      = useRef<HTMLSpanElement>(null);
  const started  = useRef(false);
  const runIdRef = useRef(0);

  // Inject blink keyframe CSS once per page
  useEffect(() => {
    if (twCssInjected) return;
    twCssInjected = true;
    const s = document.createElement("style");
    s.textContent =
      "@keyframes tw-blink{0%,100%{opacity:1}50%{opacity:0}}" +
      ".tw-cursor{animation:tw-blink 0.65s step-end infinite}";
    document.head.appendChild(s);
  }, []);

  // Reset when text prop changes (e.g. locale switch)
  useEffect(() => {
    runIdRef.current++;
    setTyped(0);
    started.current = false;
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const id = runIdRef.current;
      let i = 0;
      const step = () => {
        if (runIdRef.current !== id) return; // cancelled by text change
        i++;
        setTyped(i);
        if (i < text.length) setTimeout(step, 75);
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

  const isDone = typed >= text.length;

  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            opacity: i < typed ? 1 : 0,
            position: "relative",
          }}
        >
          {ch}
          {/* Blinking underline under the most recently typed character */}
          {i === typed - 1 && !isDone && (
            <span
              className="tw-cursor"
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "1.5px",
                background: "currentColor",
                display: "block",
              }}
            />
          )}
        </span>
      ))}
    </span>
  );
}
