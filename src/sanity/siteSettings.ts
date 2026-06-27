import { defineType, defineField } from "sanity";

/** Site-wide settings (singleton) */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Настройки сайта",
  type: "document",
  fields: [
    defineField({
      name: "themeColor",
      title: "Цвет палитры сайта",
      type: "color",
      description:
        "Выберите базовый цвет. Вся палитра сайта (фон, акцент, текст) строится вокруг его оттенка. " +
        "Рекомендуемые значения: золотой (#D4AF37), медный (#B87333), терракот (#C0533A), лиловый (#7B4FA6).",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "background_svg",
      title: "Фоновое изображение (вектор / SVG)",
      type: "file",
      options: { accept: "image/svg+xml,.svg,image/png,image/*" },
      description:
        "Накладывается поверх фона. Лучше всего — векторный SVG.",
    }),
    defineField({
      name: "background_opacity",
      title: "Прозрачность фона (%)",
      type: "number",
      initialValue: 100,
      validation: (r) => r.min(0).max(100),
      description: "0 — изображение невидимо, 100 — полностью непрозрачно.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Настройки сайта" }),
  },
});
