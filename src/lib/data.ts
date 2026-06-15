import { client, urlFor } from "./sanity";

type Locale = "ru" | "en";

const pick = (r: Record<string,unknown>, base: string, locale: Locale): string =>
  ((locale === "en" ? (r[`${base}_en`] as string) : "") || (r[`${base}_ru`] as string) || "") as string;

const enOr = (r: Record<string,unknown>, base: string, locale: Locale): string =>
  ((locale === "en" ? (r[`${base}_en`] as string) : "") || (r[base] as string) || "") as string;

function asArr<T>(v: unknown): T[] { return Array.isArray(v) ? (v as T[]) : []; }

export interface WorkCard {
  slug: string; title: string; theatre: string; year: number|null;
  genre: string; status: string; featured: boolean; kind: string;
  coverUrl: string|null; previewUrl: string|null; shortDescription: string; premiere: string;
}

export interface GalleryImg { url: string|null; alt: string; caption: string; }

export type ContentBlock =
  | { kind: "text"; body: unknown[]|null }
  | { kind: "gallery"; images: GalleryImg[] };

const CARD = `"slug":slug.current,title_ru,title_en,theatre,theatre_en,year,premiere,kind,tags,genre_en,status,featured,short_description_ru,short_description_en,cover_image,preview_image`;

function mapCard(r: Record<string,unknown>, locale: Locale): WorkCard {
  const tags = (r.tags as string[]|undefined) ?? [];
  return {
    slug: (r.slug as string) ?? "",
    title: pick(r, "title", locale),
    theatre: enOr(r, "theatre", locale),
    year: (r.year as number) ?? null,
    genre: ((locale==="en" ? r.genre_en as string : "") || tags[0]) ?? "",
    status: (r.status as string) ?? "archive",
    featured: Boolean(r.featured),
    kind: (r.kind as string) ?? "performance",
    premiere: (r.premiere as string) ?? "",
    shortDescription: pick(r, "short_description", locale),
    coverUrl: urlFor(r.cover_image)?.width(1400).quality(88).url() ?? null,
    previewUrl: urlFor(r.preview_image || r.cover_image)?.width(900).quality(85).url() ?? null,
  };
}

function mapGallery(arr: unknown, locale: Locale): GalleryImg[] {
  return asArr<Record<string,unknown>>(arr).map(g => ({
    url: urlFor(g)?.width(1600).quality(88).url() ?? null,
    alt: (g.alt as string) ?? "",
    caption: pick(g, "caption", locale),
  }));
}

export async function getFeatured(locale: Locale = "ru"): Promise<WorkCard[]> {
  const rows = await client.fetch<Record<string,unknown>[]>(
    `*[_type=="performance"&&featured==true&&!defined(parent)]{${CARD}}`
  );
  return rows.map(r => mapCard(r, locale));
}

export async function getPerformances(locale: Locale = "ru", kind = "performance"): Promise<WorkCard[]> {
  const rows = await client.fetch<Record<string,unknown>[]>(
    `*[_type=="performance"&&kind==$kind&&!defined(parent)]|order(year desc){${CARD}}`,
    { kind }
  );
  return rows.map(r => mapCard(r, locale));
}

export interface WorkDetail extends WorkCard {
  fullDescription: unknown[]|null;
  gallery: GalleryImg[];
  content: ContentBlock[];
  role: string; playwright: string; artist: string; composer: string;
  choreographer: string; performers: string;
  lightingDesigner: string; setDesigner: string;
  creditsExtra: string;
  children: WorkCard[];
  parentSlug: string|null; parentKind: string|null;
  videos: { url:string; label:string }[];
}

export async function getPerformance(slug: string, locale: Locale = "ru"): Promise<WorkDetail|null> {
  const r = await client.fetch<Record<string,unknown>|null>(`
    *[_type=="performance"&&slug.current==$slug][0]{
      ${CARD},
      full_description_ru, full_description_en,
      role, playwright, artist, lighting_designer, set_designer,
      composer, choreographer, performers,
      credits_extra_ru, credits_extra_en,
      "parentSlug": parent->slug.current,
      "parentKind": parent->kind,
      gallery[]{ asset, alt, caption_ru, caption_en },
      content[]{
        _type,
        body_ru, body_en,
        images[]{ asset, alt, caption_ru, caption_en }
      },
      "children": *[_type=="performance"&&parent._ref==^._id]|order(year desc){${CARD}},
      video_links[]{ url, label }
    }`, { slug }
  );
  if (!r) return null;

  const content: ContentBlock[] = asArr<Record<string,unknown>>(r.content).map(b => {
    if (b._type === "textBlock") {
      const body = locale === "en"
        ? (b.body_en as unknown[]|null) ?? (b.body_ru as unknown[]|null)
        : (b.body_ru as unknown[]|null);
      return { kind: "text" as const, body };
    }
    return { kind: "gallery" as const, images: mapGallery(b.images, locale) };
  });

  return {
    ...mapCard(r, locale),
    fullDescription: locale === "en"
      ? (r.full_description_en as unknown[]|null) ?? (r.full_description_ru as unknown[]|null)
      : (r.full_description_ru as unknown[]|null),
    gallery: mapGallery(r.gallery, locale),
    content,
    role: (r.role as string) ?? "",
    playwright: (r.playwright as string) ?? "",
    artist: (r.artist as string) ?? "",
    lightingDesigner: (r.lighting_designer as string) ?? "",
    setDesigner: (r.set_designer as string) ?? "",
    composer: (r.composer as string) ?? "",
    choreographer: (r.choreographer as string) ?? "",
    performers: (r.performers as string) ?? "",
    creditsExtra: pick(r, "credits_extra", locale),
    parentSlug: (r.parentSlug as string) ?? null,
    parentKind: (r.parentKind as string) ?? null,
    children: asArr<Record<string,unknown>>(r.children).map(c => mapCard(c, locale)),
    videos: asArr<{url:string;label:string}>(r.video_links).filter(v => Boolean(v?.url)),
  };
}

export interface BioData {
  name: string; role: string; photoUrl: string|null;
  gallery: { url:string|null; alt:string }[];
  text: unknown[]|null;
  festivals: { period:string; description:string }[];
  education: { period:string; description:string }[];
  cvRu: string|null; cvEn: string|null;
}

export async function getBio(locale: Locale = "ru"): Promise<BioData|null> {
  const r = await client.fetch<Record<string,unknown>|null>(
    `*[_type=="bio"][0]{name_ru,name_en,role_ru,role_en,photo,gallery[]{asset,alt},bio_text_ru,bio_text_en,festivals[]{period,description_ru,description_en},education[]{period,description_ru,description_en},"cvRu":cv_file_ru.asset->url,"cvEn":cv_file_en.asset->url}`
  );
  if (!r) return null;
  const mapP = (arr: unknown) => asArr<Record<string,unknown>>(arr).map(e => ({ period: (e.period as string) ?? "", description: pick(e, "description", locale) }));
  return {
    name: pick(r,"name",locale),
    role: pick(r,"role",locale),
    photoUrl: urlFor(r.photo)?.width(1100).quality(90).url() ?? null,
    gallery: asArr<Record<string,unknown>>(r.gallery).map(g => ({ url: urlFor(g)?.width(1600).quality(88).url() ?? null, alt: (g.alt as string) ?? "" })),
    text: locale==="en" ? (r.bio_text_en as unknown[]|null) ?? (r.bio_text_ru as unknown[]|null) : (r.bio_text_ru as unknown[]|null),
    festivals: mapP(r.festivals),
    education: mapP(r.education),
    cvRu: (r.cvRu as string) ?? null,
    cvEn: (r.cvEn as string) ?? null,
  };
}

export async function getContacts() {
  return client.fetch<{email:string;social_links:{platform:string;url:string;handle:string}[]}|null>(
    `*[_type=="contacts"][0]{email,social_links[]{platform,url,handle}}`
  );
}
