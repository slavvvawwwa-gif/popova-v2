import { defineType, defineField } from "sanity";

/** Home page hero (singleton) — editable content of the landing screen. */
export const home = defineType({
  name: "home",
  title: "Главная",
  type: "document",
  fields: [
    defineField({
      name: "hero_label_ru",
      title: "Надпись над именем (RU)",
      type: "string",
      description: "Напр. «Театральный режиссёр».",
    }),
    defineField({
      name: "hero_label_en",
      title: "Надпись над именем (EN)",
      type: "string",
    }),
    defineField({
      name: "hero_name_ru",
      title: "Имя (RU)",
      type: "string",
      description: "Крупный заголовок главной.",
    }),
    defineField({
      name: "hero_name_en",
      title: "Имя (EN)",
      type: "string",
    }),
    defineField({
      name: "hero_tagline_ru",
      title: "Подзаголовок (RU)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "hero_tagline_en",
      title: "Подзаголовок (EN)",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Главная" }),
  },
});
