import { defineType, defineField } from "sanity";

export const contacts = defineType({
  name: "contacts",
  title: "Контакты",
  type: "document",
  fields: [
    defineField({ name: "email",    title: "Email",    type: "string" }),
    defineField({ name: "telegram", title: "Telegram", type: "string", description: "Ссылка или @handle" }),
    defineField({ name: "vk",       title: "ВКонтакте", type: "string", description: "Ссылка на профиль" }),
    defineField({ name: "max",      title: "MAX",      type: "string", description: "Ссылка или @handle" }),
  ],
  preview: {
    prepare: () => ({ title: "Контакты" }),
  },
});
