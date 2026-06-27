import { type SchemaTypeDefinition } from "sanity";

import { home } from "./home";
import { performance } from "./performance";
import { playbillEntry } from "./playbillEntry";
import { pressItem } from "./pressItem";
import { bio } from "./bio";
import { contacts } from "./contacts";
import { siteSettings } from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [home, performance, playbillEntry, pressItem, bio, contacts, siteSettings],
};
