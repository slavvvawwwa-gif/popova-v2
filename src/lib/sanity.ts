import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "mq82kdu0",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: false,
});

const builder = imageUrlBuilder(client);
export const urlFor = (source: unknown) =>
  builder.image(source as Parameters<typeof builder.image>[0]).auto("format").fit("max");
