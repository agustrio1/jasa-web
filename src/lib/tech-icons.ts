import {
  siPhp,
  siAlpinedotjs,
  siHtmx,
  siTailwindcss,
  siMysql,
  siAstro,
  siReact,
  siTypescript,
  siJavascript,
  siNodedotjs,
  siPostgresql,
  siWordpress,
  siBootstrap,
  siVuedotjs,
  siLaravel,
  siFirebase,
  siDrizzle,
  siNeon,
} from 'simple-icons';

const TECH_ICON_MAP: Record<string, { path: string; hex: string }> = {
  php: siPhp,
  'alpine js': siAlpinedotjs,
  alpinejs: siAlpinedotjs,
  htmx: siHtmx,
  tailwind: siTailwindcss,
  'tailwind css': siTailwindcss,
  mysql: siMysql,
  astro: siAstro,
  react: siReact,
  typescript: siTypescript,
  javascript: siJavascript,
  'node.js': siNodedotjs,
  nodejs: siNodedotjs,
  postgresql: siPostgresql,
  postgres: siPostgresql,
  wordpress: siWordpress,
  bootstrap: siBootstrap,
  vue: siVuedotjs,
  laravel: siLaravel,
  firebase: siFirebase,
  drizzle: siDrizzle,
  neon: siNeon,
};

export function getTechIcon(techName: string): string | null {
  const key = techName.trim().toLowerCase();
  return TECH_ICON_MAP[key]?.path ?? null;
}

export function getTechIconColor(techName: string): string | null {
  const key = techName.trim().toLowerCase();
  const icon = TECH_ICON_MAP[key];
  return icon ? `#${icon.hex}` : null;
}