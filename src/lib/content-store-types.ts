export type CMSProduct = {
  slug: string;
  name: string;
  image: string | null;
  category: string;
  short: string | null;
  description: string | null;
  category_label: string | null;
  application_area: string | null;
  pack: string | null;
  coverage: string | null;
  surface: string | null;
  color: string | null;
  features: string[] | null;
  applications: {
    exterior?: string[];
    interior?: string[];
    [key: string]: string[] | undefined;
  } | null;
  gallery: string[];
  video_url: string | null;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  pdf: string | null;
  shades_image: string | null;
  application_list: string[] | null;
  sort_order: number;
};

export type CMSBlog = {
  slug: string;
  title: string;
  image: string | null;
  excerpt: string | null;
  sections: { heading: string; body?: string; list?: string[] }[];
  author: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
};
