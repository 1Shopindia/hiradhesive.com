import type { TilePreset } from "../types";

// Procedural SVG tile textures — inline data URLs so no extra assets are shipped.
// Each texture is 512×512 seamlessly tileable.
function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const glossyWhite = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f4f4f2"/>
      <stop offset="100%" stop-color="#e6e6e2"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
</svg>`);

const matteWhite = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" fill="#eeece7"/>
  <rect width="512" height="512" fill="#f4f2ed" opacity="0.5"/>
</svg>`);

const italianMarble = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f2ea"/>
      <stop offset="100%" stop-color="#e2ddd0"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.82  0 0 0 0 0.75  0 0 0 0.35 0"/></filter>
  </defs>
  <rect width="512" height="512" fill="url(#b)"/>
  <rect width="512" height="512" filter="url(#n)"/>
  <path d="M-20 120 Q 130 90 260 160 T 540 200" stroke="#b8ac95" stroke-width="1.5" fill="none" opacity="0.7"/>
  <path d="M-20 340 Q 200 300 340 380 T 540 420" stroke="#a89c85" stroke-width="1" fill="none" opacity="0.6"/>
</svg>`);

const greyStone = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <filter id="s"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.56  0 0 0 0 0.58  0 0 0 0.7 0"/></filter>
  </defs>
  <rect width="512" height="512" fill="#8f9195"/>
  <rect width="512" height="512" filter="url(#s)" opacity="0.9"/>
</svg>`);

const blackMarble = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" fill="#141518"/>
  <path d="M0 100 Q 120 80 260 130 T 512 170" stroke="#7c7a72" stroke-width="1.2" fill="none" opacity="0.8"/>
  <path d="M0 300 Q 160 260 300 320 T 512 370" stroke="#5a5850" stroke-width="1" fill="none" opacity="0.7"/>
  <path d="M0 420 Q 200 400 320 440 T 512 460" stroke="#8a8878" stroke-width="0.8" fill="none" opacity="0.6"/>
</svg>`);

const woodFinish = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="w" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a87a52"/>
      <stop offset="50%" stop-color="#8f6540"/>
      <stop offset="100%" stop-color="#a87a52"/>
    </linearGradient>
    <filter id="wn"><feTurbulence type="turbulence" baseFrequency="0.02 0.6" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0.4 0"/></filter>
  </defs>
  <rect width="512" height="512" fill="url(#w)"/>
  <rect width="512" height="512" filter="url(#wn)"/>
</svg>`);

const travertine = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <filter id="t"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0.72  0 0 0 0 0.65  0 0 0 0 0.52  0 0 0 0.5 0"/></filter>
  </defs>
  <rect width="512" height="512" fill="#d8c9a8"/>
  <rect width="512" height="512" filter="url(#t)" opacity="0.9"/>
</svg>`);

const cement = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <filter id="c"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.63  0 0 0 0 0.62  0 0 0 0.35 0"/></filter>
  </defs>
  <rect width="512" height="512" fill="#a5a5a3"/>
  <rect width="512" height="512" filter="url(#c)"/>
</svg>`);

export const TILE_PRESETS: TilePreset[] = [
  {
    id: "white-glossy",
    name: "White Glossy",
    swatch: "#f6f5f1",
    textureUrl: glossyWhite,
    traits: { lightness: 0.96, warmth: 0.05, pattern: "solid", gloss: 0.9, maintenance: 0.5 },
  },
  {
    id: "white-matte",
    name: "White Matte",
    swatch: "#efede7",
    textureUrl: matteWhite,
    traits: { lightness: 0.93, warmth: 0.08, pattern: "solid", gloss: 0.15, maintenance: 0.8 },
  },
  {
    id: "italian-marble",
    name: "Italian Marble",
    swatch: "#ece7d9",
    textureUrl: italianMarble,
    traits: { lightness: 0.88, warmth: 0.12, pattern: "veined", gloss: 0.7, maintenance: 0.4 },
  },
  {
    id: "grey-stone",
    name: "Grey Stone",
    swatch: "#8a8c8f",
    textureUrl: greyStone,
    traits: { lightness: 0.55, warmth: -0.05, pattern: "stone", gloss: 0.25, maintenance: 0.85 },
  },
  {
    id: "black-marble",
    name: "Black Marble",
    swatch: "#1a1b1e",
    textureUrl: blackMarble,
    traits: { lightness: 0.12, warmth: -0.02, pattern: "veined", gloss: 0.85, maintenance: 0.3 },
  },
  {
    id: "wood-finish",
    name: "Wood Finish",
    swatch: "#95693f",
    textureUrl: woodFinish,
    traits: { lightness: 0.42, warmth: 0.6, pattern: "wood", gloss: 0.35, maintenance: 0.7 },
  },
  {
    id: "travertine",
    name: "Travertine",
    swatch: "#d5c5a0",
    textureUrl: travertine,
    traits: { lightness: 0.78, warmth: 0.35, pattern: "stone", gloss: 0.3, maintenance: 0.65 },
  },
  {
    id: "cement",
    name: "Cement",
    swatch: "#a3a3a2",
    textureUrl: cement,
    traits: { lightness: 0.63, warmth: 0.0, pattern: "grained", gloss: 0.2, maintenance: 0.9 },
  },
];

export function getTilePreset(id: string): TilePreset | undefined {
  return TILE_PRESETS.find((t) => t.id === id);
}
