import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getContacts } from "@/lib/data";

interface SocialLink {
  platform: string;
  url: string;
  handle?: string;
}

interface ContactsData {
  email: string;
  social_links: SocialLink[];
}

export default function Contacts() {
  const [data, setData] = useState<ContactsData | null>(null);

  useEffect(() => {
    getContacts().then(d => {
      if (d) setData(d as ContactsData);
    });
  }, []);

  const links = (data?.social_links ?? []).filter(s => s.platform && s.url);

  return (
    <div style={{
      maxWidth: 900,
      margin: "0 auto",
      padding: "8rem 2rem 6rem",
      minHeight: "80svh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}>
      <motion.p
        className="eyebrow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: "1rem" }}
      >
        Контакты
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(2.5rem,7vw,6rem)",
          fontWeight: 300,
          lineHeight: 0.92,
          marginBottom: "4rem",
        }}
      >
        Свяжитесь<br />
        <em style={{ color: "var(--text-2)" }}>со мной</em>
      </motion.h1>

      {data?.email && (
        <motion.a
          href={`mailto:${data.email}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "clamp(1rem,2.5vw,1.5rem)",
            color: "var(--text-1)",
            textDecoration: "none",
            borderBottom: "1px solid var(--accent)",
            paddingBottom: 4,
            width: "fit-content",
            marginBottom: "3rem",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-1)")}
        >
          {data.email}
        </motion.a>
      )}

      {links.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {links.map(s => (
            <a
              key={s.platform + s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", textDecoration: "none", width: "fit-content" }}
              onMouseEnter={e => {
                e.currentTarget.querySelectorAll<HTMLElement>("span").forEach((n, i) => {
                  n.style.color = i === 0 ? "var(--text-1)" : "var(--accent)";
                });
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelectorAll<HTMLElement>("span").forEach(n => {
                  n.style.color = "var(--text-2)";
                });
              }}
            >
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-2)", transition: "color 0.2s" }}>
                {s.platform}
              </span>
              {s.handle && (
                <span style={{ fontSize: "0.85rem", color: "var(--text-2)", transition: "color 0.2s" }}>
                  {s.handle}
                </span>
              )}
            </a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
