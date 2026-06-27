import { defineType, defineField, defineArrayMember } from "sanity";

export const contacts = defineType({
  name: "contacts",
  title: "Контакты",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Электронная почта",
      type: "string",
    }),
    defineField({
      name: "social_links",
      title: "Ссылки",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          title: "Контакт",
          fields: [
            defineField({
              name: "platform",
              title: "Название",
              type: "string",
            }),
            defineField({
              name: "url",
              title: "Ссылка",
              type: "string",
            }),
            defineField({
              name: "handle",
              title: "Хэндл (необязательно)",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Контакты" }),
  },
});
