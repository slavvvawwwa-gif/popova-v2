import { motion } from "framer-motion";

interface Props {
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function CharReveal({ text, delay = 0, stagger = 0.028, style, className }: Props) {
  return (
    <span className={className} style={{ display: "inline", ...style }} aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: "0.6em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
