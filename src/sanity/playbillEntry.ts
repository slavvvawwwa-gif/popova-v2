import { defineType, defineField } from "sanity";

/** Playbill Entry (Афиша) — section 4. No ticket links per anti-patterns. */
export const playbillEntry = defineType({
  name: "playbillEntry",
  title: "Афиша — показ",
  type: "document",
  fields: [
    defineField({
      name: "performance",
      title: "Спектакль",
      type: "reference",
      to: [{ type: "performance" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Дата и время",
      type: "datetime",
      description: "Время опционально — если не важно, можно указать любое.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "venue",
      title: "Площадка / театр",
      type: "string",
    }),
    defineField({
      name: "city",
      title: "Город",
      type: "string",
    }),
    defineField({
      name: "note_ru",
      title: "Примечание (RU)",
      type: "string",
      description: "Напр. «Гастроли», «Премьера».",
    }),
    defineField({
      name: "note_en",
      title: "Примечание (EN)",
      type: "string",
    }),
  ],
  orderings: [
    {
      title: "Дата (по возрастанию)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "performance.title_ru", date: "date", subtitle: "venue" },
    prepare({ title, date, subtitle }) {
      const d = date ? new Date(date).toLocaleDateString("ru-RU") : "";
      return { title: title || "Показ", subtitle: [d, subtitle].filter(Boolean).join(" — ") };
    },
  },
});
