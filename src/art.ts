/**
 * Ilustraciones del juego publicadas en la web (scripts/import-game-art.mjs).
 *
 * Son arte provisional del juego: el dueño decidió mostrarlas el 2026-10-31, y
 * el pie del sitio avisa de que pueden cambiar antes del lanzamiento.
 *
 * Un héroe sin retrato no rompe nada: las páginas caen a su emblema
 * geométrico (HeroEmblem). Así un héroe nuevo puede publicarse antes que su arte.
 */
import type { ImageMetadata } from 'astro';
import duel from '~/assets/art/scenes/duel.jpg';
import board from '~/assets/art/scenes/board.jpg';
import campaign from '~/assets/art/scenes/campaign.jpg';
import emblem from '~/assets/art/brand/emblem.png';
import instant from '~/assets/art/cards/instant.jpg';
import weapon from '~/assets/art/cards/weapon.jpg';
import armor from '~/assets/art/cards/armor.jpg';
import trinket from '~/assets/art/cards/trinket.jpg';
import coins from '~/assets/art/currency/coins.png';
import essence from '~/assets/art/currency/essence.png';
import gems from '~/assets/art/currency/gems.png';

type ImageModule = { default: ImageMetadata };

function byFileName(modules: Record<string, ImageModule>): Record<string, ImageMetadata> {
  return Object.fromEntries(
    Object.entries(modules).map(([path, module]) => [path.split('/').pop()!.replace(/\.\w+$/, ''), module.default]),
  );
}

const portraits = byFileName(import.meta.glob<ImageModule>('./assets/art/heroes/*.jpg', { eager: true }));
const arenas = byFileName(import.meta.glob<ImageModule>('./assets/art/arenas/*.jpg', { eager: true }));

export function heroPortrait(heroId: string): ImageMetadata | undefined {
  return portraits[heroId];
}

export function heroArena(heroId: string): ImageMetadata | undefined {
  return arenas[heroId];
}

export const scenes = { duel, board, campaign };

export const brandEmblem = emblem;

/** Una ilustración por tipo de carta, en el orden de gameCopy.collection.types. */
export const cardTypeArt = [instant, weapon, armor, trinket];

/** Iconos de las monedas, en el orden de gameCopy.currencies.items. */
export const currencyIcons = [coins, essence, gems];
