import { defineType, defineField } from "sanity";

/** Press Item (Пресса / Награда) — section 4 */
export const pressItem = defineType({
  name: "pressItem",
  title: "Пресса / Награда",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Тип",
      type: "string",
      options: {
        list: [
          { title: "Рецензия", value: "review" },
          { title: "Интервью", value: "interview" },
          { title: "Награда", value: "award" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title_ru",
      title: "Заголовок (RU)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title_en",
      title: "Заголовок (EN)",
      type: "string",
    }),
    defineField({
      name: "source",
      title: "Источник",
      type: "string",
      description: "Издание / организация.",
    }),
    defineField({
      name: "date",
      title: "Дата",
      type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
    }),
    defineField({
      name: "excerpt_ru",
      title: "Цитата / фрагмент (RU)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "excerpt_en",
      title: "Цитата / фрагмент (EN)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "external_link",
      title: "Внешняя ссылка",
      type: "url",
    }),
    defineField({
      name: "related_performance",
      title: "Связанный спектакль",
      type: "reference",
      to: [{ type: "performance" }],
      weak: true,
      description: "Опционально.",
    }),
  ],
  orderings: [
    {
      title: "Дата (по убыванию)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title_ru", subtitle: "source", type: "type" },
    prepare({ title, subtitle, type }) {
      const labels: Record<string, string> = {
        review: "Рецензия",
        interview: "Интервью",
        award: "Награда",
      };
      return { title, subtitle: [labels[type], subtitle].filter(Boolean).join(" — ") };
    },
  },
});
