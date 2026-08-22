import { createServerFn } from "@tanstack/react-start";
import type { CMSProduct, CMSBlog } from "./content-store-types";

// Same value as the admin gate in src/routes/admin.tsx.
// The password is already visible in the client bundle; matching it server-side
// is no weaker than the existing gate and requires no additional secret setup.
const ADMIN_TOKEN = "Hir@2026";

function checkToken(token: unknown) {
  if (typeof token !== "string" || token !== ADMIN_TOKEN) throw new Error("Unauthorized");
}

/**
 * Logs the real cause server-side and rethrows a message that is safe to show
 * in the browser, so a Postgres/network failure never leaks internals.
 */
function fail(scope: string, error: unknown): never {
  console.error(`[cms:${scope}]`, error);
  const message = error instanceof Error ? error.message : String(error);
  if (message === "Unauthorized") throw new Error("Unauthorized");
  throw new Error(`${scope} failed. Please try again.`);
}

function requireSlug(slug: unknown, scope: string): string {
  if (typeof slug !== "string" || !slug.trim()) throw new Error(`${scope}: a valid slug is required.`);
  return slug.trim();
}

function rowToProduct(r: Record<string, unknown>): CMSProduct {
  return {
    slug: r.slug as string,
    name: r.name as string,
    image: (r.image as string | null) ?? null,
    category: r.category as string,
    short: (r.short as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    category_label: (r.category_label as string | null) ?? null,
    application_area: (r.application_area as string | null) ?? null,
    pack: (r.pack as string | null) ?? null,
    coverage: (r.coverage as string | null) ?? null,
    surface: (r.surface as string | null) ?? null,
    color: (r.color as string | null) ?? null,
    features: (r.features as string[] | null) ?? null,
    applications: (r.applications as CMSProduct["applications"]) ?? null,
    gallery: Array.isArray(r.gallery) ? (r.gallery as string[]) : [],
    video_url: (r.video_url as string | null) ?? null,
    published: Boolean(r.published),
    seo_title: (r.seo_title as string | null) ?? null,
    seo_description: (r.seo_description as string | null) ?? null,
    pdf: (r.pdf as string | null) ?? null,
    shades_image: (r.shades_image as string | null) ?? null,
    application_list: (r.application_list as string[] | null) ?? null,
    sort_order: Number(r.sort_order) || 0,
  };
}

function rowToBlog(r: Record<string, unknown>): CMSBlog {
  return {
    slug: r.slug as string,
    title: r.title as string,
    image: (r.image as string | null) ?? null,
    excerpt: (r.excerpt as string | null) ?? null,
    sections: Array.isArray(r.sections) ? (r.sections as CMSBlog["sections"]) : [],
    author: (r.author as string | null) ?? null,
    category: (r.category as string | null) ?? null,
    published: Boolean(r.published),
    published_at: (r.published_at as string | null) ?? null,
    seo_title: (r.seo_title as string | null) ?? null,
    seo_description: (r.seo_description as string | null) ?? null,
    sort_order: Number(r.sort_order) || 0,
  };
}

// -------- Public reads (published only) --------

export const listPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getPublicProducts } = await import("@/lib/db/index.server");
    const products = await getPublicProducts();
    return products.map(rowToProduct);
  } catch (error) {
    fail("Database request", error);
  }
});

export const listPublicBlogs = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getPublicBlogs } = await import("@/lib/db/index.server");
    const blogs = await getPublicBlogs();
    return blogs.map(rowToBlog);
  } catch (error) {
    fail("Database request", error);
  }
});

// -------- Admin reads (all rows incl. drafts) --------

export const adminListProducts = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { getProducts } = await import("@/lib/db/index.server");
      const products = await getProducts();
      return products.map(rowToProduct);
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminListBlogs = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { getBlogs } = await import("@/lib/db/index.server");
      const blogs = await getBlogs();
      return blogs.map(rowToBlog);
    } catch (error) {
      fail("Database request", error);
    }
  });

// -------- Admin writes --------

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; product: CMSProduct; originalSlug?: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { getProductBySlug, createProduct, updateProduct, deleteProduct } = await import("@/lib/db/index.server");
      const p = data.product;
      requireSlug(p?.slug, "Save product");
      if (!p.name?.trim()) throw new Error("Save product: a name is required.");
      
      const productData = {
        slug: p.slug,
        name: p.name,
        image: p.image,
        category: p.category,
        short: p.short,
        description: p.description,
        category_label: p.category_label,
        application_area: p.application_area,
        pack: p.pack,
        coverage: p.coverage,
        surface: p.surface,
        color: p.color,
        features: p.features,
        applications: p.applications,
        gallery: p.gallery ?? [],
        video_url: p.video_url,
        published: p.published,
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        pdf: p.pdf,
        shades_image: p.shades_image,
        application_list: p.application_list,
        sort_order: p.sort_order,
      };
      
      console.log('[adminSaveProduct] Saving product:', {
        slug: p.slug,
        originalSlug: data.originalSlug,
        category: p.category,
        isSlugChange: data.originalSlug && data.originalSlug !== p.slug,
        isEdit: !!data.originalSlug
      });
      
      // Handle slug change - delete old, create new
      if (data.originalSlug && data.originalSlug !== p.slug) {
        console.log('[adminSaveProduct] Slug changed from', data.originalSlug, 'to', p.slug);
        await deleteProduct(data.originalSlug);
        await createProduct(productData);
      } else if (data.originalSlug) {
        // Editing existing product (slug unchanged)
        console.log('[adminSaveProduct] Updating existing product');
        await updateProduct(p.slug, productData);
      } else {
        // Creating new product
        console.log('[adminSaveProduct] Creating new product');
        await createProduct(productData);
      }
      
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; slug: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { deleteProduct } = await import("@/lib/db/index.server");
      const slug = requireSlug(data.slug, "Delete product");
      await deleteProduct(slug);
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminSaveBlog = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; blog: CMSBlog; originalSlug?: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { getBlogBySlug, createBlog, updateBlog, deleteBlog } = await import("@/lib/db/index.server");
      const b = data.blog;
      requireSlug(b?.slug, "Save blog");
      if (!b.title?.trim()) throw new Error("Save blog: a title is required.");
      
      // If slug changed, delete old blog first
      if (data.originalSlug && data.originalSlug !== b.slug) {
        await deleteBlog(data.originalSlug);
      }
      
      const blogData = {
        slug: b.slug, title: b.title, image: b.image, excerpt: b.excerpt,
        sections: b.sections, author: b.author, category: b.category,
        published: b.published, published_at: b.published_at,
        seo_title: b.seo_title, seo_description: b.seo_description,
        sort_order: b.sort_order,
      };
      
      // Check if blog exists (and wasn't just deleted)
      const existing = data.originalSlug === b.slug ? await getBlogBySlug(b.slug) : null;
      if (existing) {
        await updateBlog(b.slug, blogData);
      } else {
        await createBlog(blogData);
      }
      
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminDeleteBlog = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; slug: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { deleteBlog } = await import("@/lib/db/index.server");
      const slug = requireSlug(data.slug, "Delete blog");
      await deleteBlog(slug);
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });

// -------- Site settings (catalogue etc.) --------

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSiteSettings } = await import("@/lib/db/index.server");
    return await getSiteSettings();
  } catch (error) {
    fail("Database request", error);
  }
});

export const adminSaveSetting = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; key: string; value: string | null }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    if (!data.key?.trim()) throw new Error("Save setting: a key is required.");
    try {
      const { upsertSiteSetting } = await import("@/lib/db/index.server");
      await upsertSiteSetting(data.key.trim(), data.value ?? '');
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });

// -------- PDF upload (stored privately, served via /api/public/pdf/*) --------

export const adminUploadPdf = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; filename: string; dataUrl: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    const base64 = data.dataUrl.split(",")[1] ?? "";
    if (!base64) throw new Error("Upload failed: the file could not be read.");
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    
    try {
      const { uploadFile } = await import("@/lib/storage/index.server");
      const url = await uploadFile("product-pdfs", data.filename || "document.pdf", bytes);
      return { url };
    } catch (error: any) {
      if (error?.statusCode) {
        throw new Error(error.message);
      }
      fail("Upload", error);
    }
  });

// -------- Newsletter Subscriptions --------

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; userAgent?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const trimmedEmail = data.email.trim();
      
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        throw new Error("Please enter a valid email address");
      }
      
      const { subscribeNewsletter } = await import("@/lib/db/index.server");
      await subscribeNewsletter({
        email: trimmedEmail.toLowerCase(),
        ipAddress: null,
        userAgent: data.userAgent ?? null,
      });
      
      return { ok: true };
    } catch (error: any) {
      console.error("[subscribeToNewsletter] Error:", error.code, error.message);
      // If duplicate email, show friendly message
      if (error?.code === 'ER_DUP_ENTRY' || error?.message?.includes('Duplicate')) {
        throw new Error("This email is already subscribed.");
      }
      if (error.message === "Please enter a valid email address") {
        throw error;
      }
      fail("Newsletter subscription", error);
    }
  });

export const adminListNewsletterSubscribers = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { getNewsletterSubscribers } = await import("@/lib/db/index.server");
      return await getNewsletterSubscribers();
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminDeleteNewsletterSubscriber = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: number }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { deleteNewsletterSubscriber } = await import("@/lib/db/index.server");
      await deleteNewsletterSubscriber(data.id);
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });

// -------- Legal Pages --------

export interface LegalPageContent {
  sections: Array<{
    heading: string;
    content: string | string[];
  }>;
}

export interface LegalPage {
  id: string;
  title: string;
  content: LegalPageContent;
  last_updated: string;
  updated_by: string | null;
}

export const getLegalPage = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const { getLegalPage: getPage, initializeLegalPages } = await import("@/lib/db/index.server");
      
      // Initialize tables and default content if needed
      await initializeLegalPages();
      
      const page = await getPage(data.id);
      if (!page) {
        throw new Error(`Legal page '${data.id}' not found`);
      }
      
      return {
        id: page.id,
        title: page.title,
        content: page.content,
        last_updated: page.last_updated,
        updated_by: page.updated_by,
      } as LegalPage;
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminGetLegalPage = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { getLegalPage: getPage, initializeLegalPages } = await import("@/lib/db/index.server");
      
      // Initialize tables and default content if needed
      await initializeLegalPages();
      
      const page = await getPage(data.id);
      if (!page) {
        throw new Error(`Legal page '${data.id}' not found`);
      }
      
      return {
        id: page.id,
        title: page.title,
        content: page.content,
        last_updated: page.last_updated,
        updated_by: page.updated_by,
      } as LegalPage;
    } catch (error) {
      fail("Database request", error);
    }
  });

export const adminSaveLegalPage = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; title: string; content: LegalPageContent; updated_by: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    try {
      const { updateLegalPage } = await import("@/lib/db/index.server");
      
      if (!data.id || (data.id !== 'terms' && data.id !== 'privacy')) {
        throw new Error("Invalid legal page ID. Must be 'terms' or 'privacy'.");
      }
      
      if (!data.title?.trim()) {
        throw new Error("Title is required.");
      }
      
      if (!data.content?.sections || !Array.isArray(data.content.sections)) {
        throw new Error("Content sections are required.");
      }
      
      await updateLegalPage(data.id, {
        title: data.title,
        content: data.content,
        updated_by: data.updated_by || 'admin',
      });
      
      return { ok: true };
    } catch (error) {
      fail("Database request", error);
    }
  });
