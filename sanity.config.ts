import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";

import { schema } from "./src/sanity";
import { structure } from "./src/sanity/structure";
import { deleteWithContent } from "./src/sanity/actions/deleteWithContent";

export default defineConfig({
  basePath: "/studio",
  projectId: "mq82kdu0",
  dataset: "production",
  auth: {
    providers: [
      {
        name: "google",
        title: "Google",
        url: "https://api.sanity.io/v2021-10-01/auth/login/google",
        logo: "/static/google-logo.svg",
      },
    ],
    redirectOnSingle: true,
  },
  schema: {
    types: schema.types,
    templates: (prev) => [
      ...prev,
      { id: "new-performance", title: "Спектакль", schemaType: "performance", value: { kind: "performance" } },
      { id: "new-project",     title: "Проект",    schemaType: "performance", value: { kind: "project" } },
      { id: "new-lab",         title: "Лаборатория", schemaType: "performance", value: { kind: "lab" } },
    ],
  },
  document: {
    actions: (prev, { schemaType }) =>
      schemaType === "performance" ? [...prev, deleteWithContent] : prev,
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: "2024-10-01" }),
    colorInput(),
  ],
});
