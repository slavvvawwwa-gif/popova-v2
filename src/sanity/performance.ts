import { defineType, defineField, defineArrayMember } from "sanity";

/** Performance (Спектакль) — section 4 of the brief */
export const performance = defineType({
  name: "performance",
  title: "Спектакль",
  type: "document",
  fields: [
    defineField({
      name: "title_ru",
      title: "Название (RU)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title_en",
      title: "Название (EN)",
      type: "string",
      description: "Если пусто — на сайте используется RU (fallback).",
    }),
    defineField({
      name: "kind",
      title: "Раздел",
      type: "string",
      options: {
        list: [
          { title: "Спектакль", value: "performance" },
          { title: "Проект", value: "project" },
          { title: "Лаборатория", value: "lab" },
        ],
        layout: "radio",
      },
      initialValue: "performance",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL (slug)",
      type: "slug",
      options: { source: "title_ru", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "parent",
      title: "Родительский проект / лаборатория",
      type: "reference",
      to: [{ type: "performance" }],
      weak: true,
      options: { filter: 'kind == "project" || kind == "lab"' },
      description:
        "Заполните, если это выпуск/часть проекта или лаборатории. Тогда он откроется внутри родителя.",
    }),
    defineField({
      name: "theatre",
      title: "Локация (RU)",
      type: "string",
      description: "Театр / площадка / место.",
    }),
    defineField({
      name: "theatre_en",
      title: "Локация (EN)",
      type: "string",
      description: "Если пусто — на EN-версии используется RU.",
    }),
    defineField({
      name: "year",
      title: "Год",
      type: "number",
      validation: (r) => r.min(1900).max(2100),
    }),
    defineField({
      name: "premiere",
      title: "Премьера",
      type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
    }),
    defineField({
      name: "role",
      title: "Режиссёр-постановщик",
      type: "string",
    }),
    // ── Кредиты (все опциональные) ──────────────────────────────
    defineField({ name: "playwright", title: "Драматург", type: "string" }),
    defineField({ name: "artist", title: "Художник", type: "string" }),
    defineField({ name: "lighting_designer", title: "Художник по свету", type: "string" }),
    defineField({ name: "set_designer", title: "Художник-постановщик", type: "string" }),
    defineField({ name: "composer", title: "Композитор", type: "string" }),
    defineField({ name: "choreographer", title: "Хореограф", type: "string" }),
    defineField({
      name: "performers",
      title: "Перформеры",
      type: "string",
      description: "Преим. для проектов.",
    }),
    defineField({
      name: "credits_extra_ru",
      title: "Дополнительно (RU)",
      type: "text",
      rows: 2,
      description: "Любая доп. информация в кредитах.",
    }),
    defineField({
      name: "credits_extra_en",
      title: "Дополнительно (EN)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "tags",
      title: "Жанр / теги (RU)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: "Первый тег показывается как жанр.",
    }),
    defineField({
      name: "genre_en",
      title: "Жанр (EN)",
      type: "string",
      description: "Если пусто — на EN-версии используется первый тег.",
    }),
    defineField({
      name: "status",
      title: "Статус",
      type: "string",
      options: {
        list: [
          { title: "Текущий репертуар", value: "current" },
          { title: "Архив", value: "archive" },
        ],
        layout: "radio",
      },
      initialValue: "current",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      title: "На главной (избранное)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "short_description_ru",
      title: "Краткое описание (RU)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "short_description_en",
      title: "Краткое описание (EN)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "full_description_ru",
      title: "Полное описание (RU)",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "full_description_en",
      title: "Полное описание (EN)",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "cover_image",
      title: "Обложка",
      type: "image",
      options: { hotspot: true },
      description: "Кадрирование задаётся точкой фокуса (hotspot).",
    }),
    defineField({
      name: "preview_image",
      title: "Превью при наведении (вертикальное)",
      type: "image",
      options: { hotspot: true },
      description: "Показывается при наведении в архиве. Если пусто — берётся обложка.",
    }),
    defineField({
      name: "gallery",
      title: "Галерея",
      type: "array",
      options: { layout: "grid" },
      description: "Можно перетащить или выбрать сразу несколько фото.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt-текст", type: "string" }),
            defineField({ name: "caption_ru", title: "Подпись (RU)", type: "string" }),
            defineField({ name: "caption_en", title: "Подпись (EN)", type: "string" }),
          ],
        }),
      ],
    }),
    // Free-form sequence of text + gallery blocks (mainly for projects / labs)
    defineField({
      name: "content",
      title: "Доп. блоки: текст / галерея (для проектов и лабораторий)",
      description: "Произвольная последовательность текстовых блоков и галерей, идущих друг за другом.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "textBlock",
          title: "Текстовый блок",
          fields: [
            defineField({ name: "body_ru", title: "Текст (RU)", type: "array", of: [defineArrayMember({ type: "block" })] }),
            defineField({ name: "body_en", title: "Текст (EN)", type: "array", of: [defineArrayMember({ type: "block" })] }),
          ],
          preview: { prepare: () => ({ title: "Текстовый блок" }) },
        }),
        defineArrayMember({
          type: "object",
          name: "galleryBlock",
          title: "Галерея",
          fields: [
            defineField({
              name: "images",
              title: "Фотографии",
              type: "array",
              options: { layout: "grid" },
              description: "Можно перетащить или выбрать сразу несколько фото.",
              of: [
                defineArrayMember({
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({ name: "alt", title: "Alt-текст", type: "string" }),
                    defineField({ name: "caption_ru", title: "Подпись (RU)", type: "string" }),
                    defineField({ name: "caption_en", title: "Подпись (EN)", type: "string" }),
                  ],
                }),
              ],
            }),
          ],
          preview: {
            select: { n: "images" },
            prepare: ({ n }) => ({ title: "Галерея", subtitle: `${(n as unknown[] | undefined)?.length ?? 0} фото` }),
          },
        }),
      ],
    }),
    defineField({
      name: "video_links",
      title: "Видео (YouTube / Vimeo)",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "url",
              title: "Ссылка",
              type: "url",
              validation: (r) => r.required(),
            }),
            defineField({ name: "label", title: "Подпись", type: "string" }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Год (по убыванию)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title_ru", subtitle: "theatre", media: "cover_image" },
  },
});
