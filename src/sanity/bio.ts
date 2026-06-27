import { defineType, defineField, defineArrayMember } from "sanity";

// Entry with a date range (e.g. "2022–2023") + bilingual description.
const periodEntry = () =>
  defineArrayMember({
    type: "object",
    fields: [
      defineField({ name: "period", title: "Период (напр. 2022–2023)", type: "string" }),
      defineField({ name: "description_ru", title: "Описание (RU)", type: "text", rows: 2 }),
      defineField({ name: "description_en", title: "Описание (EN)", type: "text", rows: 2 }),
    ],
    preview: { select: { title: "period", subtitle: "description_ru" } },
  });

/** Bio (singleton) — section 4 */
export const bio = defineType({
  name: "bio",
  title: "Биография",
  type: "document",
  fields: [
    defineField({
      name: "name_ru",
      title: "Имя (RU)",
      type: "string",
    }),
    defineField({
      name: "name_en",
      title: "Имя (EN)",
      type: "string",
    }),
    defineField({
      name: "role_ru",
      title: "Роль / профессия (RU)",
      type: "string",
      initialValue: "Театральный режиссёр",
    }),
    defineField({
      name: "role_en",
      title: "Роль / профессия (EN)",
      type: "string",
    }),
    defineField({
      name: "photo",
      title: "Главное фото (верх стопки)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Галерея фотографий",
      type: "array",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt-текст", type: "string" })],
        }),
      ],
      description: "Открывается из «стопки» при нажатии на главное фото. Можно загрузить сразу несколько фото.",
    }),
    defineField({
      name: "bio_text_ru",
      title: "Биография (RU)",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "bio_text_en",
      title: "Биография (EN)",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "festivals",
      title: "Участие в других фестивалях, проектах, лабораториях",
      type: "array",
      of: [periodEntry()],
    }),
    defineField({
      name: "education",
      title: "Дополнительное образование",
      type: "array",
      of: [periodEntry()],
    }),
    defineField({
      name: "letters",
      title: "Благодарственные письма",
      type: "array",
      of: [periodEntry()],
    }),
    defineField({
      name: "cv_file_ru",
      title: "CV — PDF (RU)",
      type: "file",
      options: { accept: ".pdf" },
    }),
    defineField({
      name: "cv_file_en",
      title: "CV — PDF (EN)",
      type: "file",
      options: { accept: ".pdf" },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Биография" }),
  },
});
