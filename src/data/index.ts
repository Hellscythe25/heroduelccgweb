/**
 * Punto único de acceso a los datos del juego.
 *
 * Nadie importa cards.json ni heroes.json directamente: pasar siempre por aquí
 * garantiza que lo que llega a una página o al deckbuilder ya fue validado
 * contra el esquema. Si el esquema falla, esto lanza y el build muere.
 */
import cardsRaw from './cards.json';
import heroesRaw from './heroes.json';
import dataVersionRaw from './DATA_VERSION?raw';
import {
  CardsFileSchema,
  HeroesFileSchema,
  DataVersionSchema,
  checkGameDataConsistency,
  type Card,
  type CardsFile,
  type DataIssue,
  type Hero,
  type HeroesFile,
} from './schemas';

export const DATA_VERSION: string = DataVersionSchema.parse(dataVersionRaw.trim());

export const cardsFile: CardsFile = CardsFileSchema.parse(cardsRaw);
export const heroesFile: HeroesFile = HeroesFileSchema.parse(heroesRaw);

export const cards: Card[] = cardsFile.cards;
export const heroes: Hero[] = heroesFile.heroes;

export const dataIssues: DataIssue[] = checkGameDataConsistency(
  cardsFile,
  heroesFile,
  DATA_VERSION,
);

/** `true` cuando aún no hay catálogo vinculado a un parche del juego. */
export const hasGameData: boolean = cards.length > 0 && heroes.length > 0;

export function findCardById(id: number): Card | undefined {
  return cards.find((card) => card.id === id);
}

export function findHeroById(id: string): Hero | undefined {
  return heroes.find((hero) => hero.id === id);
}

export * from './schemas';
