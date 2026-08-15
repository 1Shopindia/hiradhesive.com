/**
 * Central SEO configuration and helpers.
 * Primary canonical domain — the site is also served from hirgroup.in but
 * all canonical + og:url point to hiradhesive.com to avoid duplicate content.
 */
export const SITE_URL = "https://hiradhesive.com";
export const SITE_URL_ALT = "https://hirgroup.in";
export const SITE_NAME = "HIR Industries";
export const SITE_TAGLINE = "Your Building Master";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;
export const TWITTER_HANDLE = "@hirindia";

export const BRAND = {
  legalName: "HIR Industries",
  founded: "1972",
  phone: "+91 9904821334",
  phoneTollFree: "1800 572 2779",
  email: "info@hirgroup.in",
  streetAddress: "C/O Gauri Ceramics Compound, Opp. Sahkari Jin, On National Highway Road-8",
  addressLocality: "Himatnagar",
  addressRegion: "Gujarat",
  postalCode: "383001",
  addressCountry: "IN",
  latitude: 23.5988,
  longitude: 72.9636,
  areaServed: [
    "IN", "AE", "SA", "QA", "KW", "OM", "BH", "US", "CA", "GB",
    "AU", "ZA", "SG", "MY", "NP", "BD", "LK",
  ],
  social: [
    "https://www.facebook.com/hir.india",
    "https://www.instagram.com/hir.india",
    "https://www.linkedin.com/in/hir-your-building-master-5a96511b1/",
    "https://www.youtube.com/@HIRindustries",
  ],
};

export function absUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build canonical + alternate hreflang link tags for a route path. */
export function canonicalLinks(path: string) {
  const abs = absUrl(path);
  return [
    { rel: "canonical", href: abs },
    { rel: "alternate", hrefLang: "en", href: abs },
    { rel: "alternate", hrefLang: "x-default", href: abs },
  ];
}

type MetaOpts = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "product" | "profile";
  keywords?: string[];
  robotsNoindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
};

/** Trim to a max length on a word boundary, without a dangling ellipsis mid-word. */
export function clamp(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\-–—\s]+$/, "")}…`;
}

export const MAX_TITLE = 60;
export const MAX_DESCRIPTION = 155;

export function buildMeta(o: MetaOpts) {
  const url = absUrl(o.path);
  const image = absUrl(o.image || DEFAULT_OG_IMAGE);
  const title = clamp(o.title, MAX_TITLE);
  const description = clamp(o.description, MAX_DESCRIPTION);

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    ...(o.keywords && o.keywords.length ? [{ name: "keywords", content: o.keywords.join(", ") }] : []),
    ...(o.robotsNoindex ? [{ name: "robots", content: "noindex, nofollow" }] : [{ name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }]),
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: o.type ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: title },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: title },
  ];

  if (o.publishedTime) meta.push({ property: "article:published_time", content: o.publishedTime });
  if (o.modifiedTime) meta.push({ property: "article:modified_time", content: o.modifiedTime });
  if (o.author) meta.push({ name: "author", content: o.author });
  return meta;
}

/* ------------------------------------------------------------------ */
/* JSON-LD builders                                                   */
/* ------------------------------------------------------------------ */

export function jsonLdScript(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: BRAND.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/hir-logo.png`,
    foundingDate: BRAND.founded,
    sameAs: [SITE_URL_ALT, ...BRAND.social],
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: BRAND.phoneTollFree,
      contactType: "customer service",
      email: BRAND.email,
      areaServed: BRAND.areaServed,
      availableLanguage: ["English", "Hindi", "Gujarati"],
    }],
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.streetAddress,
      addressLocality: BRAND.addressLocality,
      addressRegion: BRAND.addressRegion,
      postalCode: BRAND.postalCode,
      addressCountry: BRAND.addressCountry,
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Manufacturer",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    telephone: BRAND.phoneTollFree,
    email: BRAND.email,
    image: `${SITE_URL}/images/hir-logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.streetAddress,
      addressLocality: BRAND.addressLocality,
      addressRegion: BRAND.addressRegion,
      postalCode: BRAND.postalCode,
      addressCountry: BRAND.addressCountry,
    },
    geo: { "@type": "GeoCoordinates", latitude: BRAND.latitude, longitude: BRAND.longitude },
    areaServed: BRAND.areaServed.map(c => ({ "@type": "Country", identifier: c })),
    sameAs: BRAND.social,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: "Manufacturer of tile adhesives, epoxy grouts, waterproofing and construction chemicals.",
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

type ProductForSchema = {
  slug: string;
  name: string;
  image: string | null;
  category: string;
  short: string | null;
  description: string | null;
  
  features: string[] | null;
};

export function productSchema(p: ProductForSchema, video?: { name: string; youtubeId: string } | null) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${p.slug}#product`,
    name: p.name,
    description: p.description || p.short || `${p.name} — a premium ${p.category} product by HIR Industries.`,
    sku: p.slug.toUpperCase(),
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    category: p.category,
    image: p.image ? absUrl(p.image) : DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/products/${p.slug}`,
  };
  if (video?.youtubeId) {
    schema.subjectOf = {
      "@type": "VideoObject",
      name: `${p.name} — how to use`,
      description: `Application video for ${p.name}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
      contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
      uploadDate: "2024-01-01",
    };
  }
  return schema;
}



export function articleSchema(b: {
  slug: string; title: string; excerpt: string | null;
  image: string | null; author: string | null; published_at: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blogs/${b.slug}#article`,
    headline: b.title,
    description: b.excerpt || b.title,
    image: b.image ? [absUrl(b.image)] : [DEFAULT_OG_IMAGE],
    ...(b.published_at ? { datePublished: b.published_at, dateModified: b.published_at } : {}),

    author: { "@type": "Organization", name: b.author || SITE_NAME },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blogs/${b.slug}` },
    inLanguage: "en",
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* Standard product FAQs used on every product page for AI-search readiness */
export function productFaqs(name: string, category: string, coverage: string | null, pack: string | null) {
  return [
    {
      q: `What is ${name}?`,
      a: `${name} is a premium ${category.toLowerCase()} product manufactured by HIR, engineered with German-American-Japanese technology for professional-grade construction and finishing work.`,
    },
    {
      q: `How much coverage does ${name} provide?`,
      a: coverage
        ? `${name} provides a coverage of approximately ${coverage} per pack.`
        : `Coverage depends on surface preparation, application thickness and substrate. Refer to the product datasheet or contact HIR technical support for accurate estimates.`,
    },
    {
      q: `What pack sizes is ${name} available in?`,
      a: pack ? `${name} is available in ${pack}.` : `Contact HIR for the currently stocked pack sizes.`,
    },
    {
      q: `Is ${name} suitable for interior and exterior applications?`,
      a: `Yes, most HIR ${category.toLowerCase()} products are designed for both interior and exterior use. Verify the specific application area on the product page before use.`,
    },
    {
      q: `Where can I buy ${name}?`,
      a: `You can enquire directly through the HIR contact page. HIR ships across India and to distributors in the Middle East, USA, UK, Australia, South Africa and South-East Asia.`,
    },
  ];
}

/** Collection / category listing schema — helps Google understand product lists. */
export function itemListSchema(items: { name: string; path: string; image?: string | null }[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absUrl(it.path),
      ...(it.image ? { image: absUrl(it.image) } : {}),
    })),
  };
}

/** HowTo schema for application / installation guides. */
export function howToSchema(o: {
  name: string;
  description: string;
  path: string;
  image?: string | null;
  steps: { name: string; text: string }[];
  totalTime?: string;
  supply?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: o.name,
    description: o.description,
    image: absUrl(o.image || DEFAULT_OG_IMAGE),
    ...(o.totalTime ? { totalTime: o.totalTime } : {}),
    ...(o.supply?.length ? { supply: o.supply.map(s => ({ "@type": "HowToSupply", name: s })) } : {}),
    step: o.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${absUrl(o.path)}#step-${i + 1}`,
    })),
  };
}
