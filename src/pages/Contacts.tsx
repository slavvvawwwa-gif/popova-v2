import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getContacts, type ContactsData } from "@/lib/data";

const LINKS: { key: keyof ContactsData; label: string; href: (v: string) => string }[] = [
  { key: "email",    label: "Email",    href: v => `mailto:${v}` },
  { key: "telegram", label: "Telegram", href: v => v.startsWith("http") ? v : `https://t.me/${v.replace(/^@/, "")}` },
  { key: "vk",       label: "ВКонтакте", href: v => v.startsWith("http") ? v : `https://vk.com/${v}` },
  { key: "max",      label: "MAX",      href: v => v.startsWith("http") ? v : `https://max.ru/${v.replace(/^@/, "")}` },
];

export default function Contacts() {
  const [data, setData] = useState<ContactsData>({ email: null, telegram: null, vk: null, max: null });

  useEffect(() => { getContacts().then(setData); }, []);

  const filled = LINKS.filter(l => !!data[l.key]);

  return (
    <div style={{
      maxWidth: 900, margin: "0 auto", padding: "8rem 2rem 6rem",
      minHeight: "80svh", display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: "1rem" }}>
        Контакты
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,7vw,6rem)", fontWeight: 300, lineHeight: 0.92, marginBottom: "4rem" }}
      >
        Свяжитесь<br /><em style={{ color: "var(--text-2)" }}>со мной</em>
      </motion.h1>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        {filled.map(({ key, label, href }) => {
          const val = data[key] as string;
          return (
            <a key={key} href={href(val)} target={key === "email" ? "_self" : "_blank"} rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", textDecoration: "none", width: "fit-content" }}
              onMouseEnter={e => { e.currentTarget.querySelectorAll<HTMLElement>("span").forEach((s, i) => { s.style.color = i === 0 ? "var(--text-1)" : "var(--accent)"; }); }}
              onMouseLeave={e => { e.currentTarget.querySelectorAll<HTMLElement>("span").forEach((s, i) => { s.style.color = i === 0 ? "var(--text-2)" : "var(--text-1)"; }); }}
            >
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-2)", transition: "color 0.2s", minWidth: "5rem" }}>
                {label}
              </span>
              <span style={{ fontSize: "clamp(0.95rem,2vw,1.2rem)", color: "var(--text-1)", transition: "color 0.2s" }}>
                {val}
              </span>
            </a>
          );
        })}
      </motion.div>
    </div>
  );
}
