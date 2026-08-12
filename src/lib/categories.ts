import { categories } from "./site-data";
import catTiles from "@/assets/cat-tiles.jpg";
import catWall from "@/assets/cat-wall.jpg";
import catGrout from "@/assets/cat-grout.jpg";
import catWaterproof from "@/assets/cat-waterproof.jpg";
import catTools from "@/assets/cat-tools.jpg";

export type CategoryKey = (typeof categories)[number];

export type CategoryInfo = {
  key: CategoryKey;
  title: string;
  tagline: string;
  description: string;
  image: string;
  photo: string;
};

export const categoryInfo: Record<CategoryKey, CategoryInfo> = {
  "Tiles & Stone Solutions": {
    key: "Tiles & Stone Solutions",
    title: "Tiles & Stone Solutions",
    tagline: "Bond every tile, marble & stone with confidence",
    description:
      "High-performance tile adhesives engineered with German–American–Japanese technology. From standard ceramic to large-format vitrified and heavy stone, our C2T to C2TES2 grade adhesives deliver superior bonding, long open time and zero-shrinkage for interior and exterior applications.",
    image: "/images/product/HIR-ALPHA.png",
    photo: catTiles,
  },
  "Wall Solutions": {
    title: "Wall Solutions",
    key: "Wall Solutions",
    tagline: "Smoother, stronger, whiter walls",
    description:
      "A complete wall care range — block jointers, wall putty and white cement — that gives your walls a smooth, glossy, crack-free finish while reducing paint consumption and improving overall masonry strength.",
    image: "/images/product/Wall-putty.png",
    photo: catWall,
  },
  "Grouts & Sealants": {
    title: "Grouts & Sealants",
    key: "Grouts & Sealants",
    tagline: "Rich colours, stainless finish, lasting joints",
    description:
      "Premium tile grouts, epoxy grouts, sparkle & rock series and high-performance sealants. UV resistant, acid & alkaline proof, food-grade certified — designed for a perfect finish and long life across residential and commercial projects.",
    image: "/images/product/Epoxy.png",
    photo: catGrout,
  },
  "Waterproofing": {
    title: "Waterproofing",
    key: "Waterproofing",
    tagline: "Complete protection from water, damp & heat",
    description:
      "End-to-end waterproofing systems — admixtures, primers, elastomeric membranes, crack fillers and heat-reflective coats — for terraces, bathrooms, exterior walls and water tanks. Trusted to stop leakage at the source.",
    image: "/images/product/Super Coat.png",
    photo: catWaterproof,
  },
  "Tools & Accessories": {
    title: "Tools & Accessories",
    key: "Tools & Accessories",
    tagline: "Professional tools for a professional finish",
    description:
      "Notched trowels, tile spacers and levelling pliers — the essential accessories that make tile installation faster, cleaner and dimensionally perfect.",
    image: "/images/product/TROWEL.png",
    photo: catTools,
  },
};

export const categoryList = categories.map(c => categoryInfo[c]);

