/**
 * Contrato de datos del juego — dueño: agente `curador-datos-juego`.
 *
 * Cartas y héroes son CANON DEL JUEGO (docs/DEPLOY.md §5). La web los consume;
 * no los edita, no los completa, no los corrige. Si el esquema falla, el build
 * se rompe: no existe la opcion de degradar con elegancia, porque una web que
 * muestra números distintos a los del juego destruye la confianza en el
 * deckbuilder y en el compendio al mismo tiempo.
 *
 * Estado: este contrato es PROPUESTO mientras no exista el pipeline de
 * exportación desde Unity (docs/MEMORIA.md, ABIERTO). Cuando exista, se ajusta
 * al artefacto real en un único PR revisable.
 */
import { z } from 'zod';

/** Toda cadena visible al público existe en los dos idiomas. Sin excepciones. */
export const LocalizedTextSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
});

export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

/** SemVer del parche del juego, ej. "0.8.3". "0.0.0" = todavía sin vincular. */
export const DataVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'DATA_VERSION debe ser SemVer del parche, ej. 0.8.3.');

export const RaritySchema = z.enum(['common', 'rare', 'epic', 'legendary']);
export const CardTypeSchema = z.enum(['unit', 'spell', 'artifact']);

export const CardSchema = z
  .object({
    /** Id numerico estable. Es lo que viaja dentro del deck code: nunca se reutiliza. */
    id: z.number().int().positive(),
    /** Slug estable para la URL de la ficha. */
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug es kebab-case en minusculas.'),
    name: LocalizedTextSchema,
    text: LocalizedTextSchema,
    type: CardTypeSchema,
    rarity: RaritySchema,
    cost: z.number().int().min(0),
    /** Presente solo en unidades. */
    stats: z
      .object({
        attack: z.number().int().min(0),
        health: z.number().int().min(1),
      })
      .optional(),
    /** Si está presente, la carta solo puede ir en mazos de ese héroe. */
    heroId: z.number().int().positive().optional(),
    keywords: z.array(z.string()).default([]),
    /** Ruta del arte relativa a src/assets/. Ausente = arte pendiente. */
    art: z.string().optional(),
  })
  .strict();

export type Card = z.infer<typeof CardSchema>;

/**
 * Reglas de construcción de mazos. Viven en los datos, NO en el componente
 * (docs/DEPLOY.md §7): si balance cambia una regla, el deckbuilder la hereda
 * sin tocar código.
 */
export const DeckRulesSchema = z
  .object({
    deckSize: z.number().int().positive(),
    /** Copias máximas por carta, según rareza. */
    maxCopiesByRarity: z.record(RaritySchema, z.number().int().positive()),
    /** Coste máximo permitido, si el formato lo limita. */
    maxCost: z.number().int().positive().optional(),
  })
  .strict();

export type DeckRules = z.infer<typeof DeckRulesSchema>;

export const HeroSchema = z
  .object({
    id: z.number().int().positive(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug es kebab-case en minusculas.'),
    name: LocalizedTextSchema,
    passive: z.object({ name: LocalizedTextSchema, text: LocalizedTextSchema }),
    actives: z
      .array(
        z.object({
          name: LocalizedTextSchema,
          text: LocalizedTextSchema,
          cost: z.number().int().min(0),
        }),
      )
      .default([]),
    /** Sobrescribe las reglas globales solo para mazos de este héroe. */
    deckRulesOverride: DeckRulesSchema.partial().optional(),
    art: z.string().optional(),
  })
  .strict();

export type Hero = z.infer<typeof HeroSchema>;

export const CardsFileSchema = z
  .object({
    dataVersion: DataVersionSchema,
    cards: z.array(CardSchema),
  })
  .strict();

export const HeroesFileSchema = z
  .object({
    dataVersion: DataVersionSchema,
    /**
     * `null` significa "el juego todavía no exporta las reglas de construcción".
     * No se rellena con valores plausibles: el tamaño de mazo y los límites de
     * copias son balance, y esta web no inventa balance. En cuanto haya heroes
     * cargados, checkGameDataConsistency() exige reglas reales.
     */
    deckRules: DeckRulesSchema.nullable(),
    heroes: z.array(HeroSchema),
  })
  .strict();

export type CardsFile = z.infer<typeof CardsFileSchema>;
export type HeroesFile = z.infer<typeof HeroesFileSchema>;

export interface DataIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

/**
 * Comprobaciones que un esquema por archivo no puede hacer: unicidad,
 * referencias cruzadas y coherencia de versión entre archivos.
 *
 * REPORTA, no corrige. Una inconsistencia en el canon es un problema del build
 * del juego, y arreglarla aquí la escondería.
 */
export function checkGameDataConsistency(
  cardsFile: CardsFile,
  heroesFile: HeroesFile,
  declaredVersion: string,
): DataIssue[] {
  const issues: DataIssue[] = [];

  const versions = new Set([cardsFile.dataVersion, heroesFile.dataVersion, declaredVersion]);
  if (versions.size > 1) {
    issues.push({
      severity: 'error',
      code: 'version-mismatch',
      message: `DATA_VERSION (${declaredVersion}), cards.json (${cardsFile.dataVersion}) y heroes.json (${heroesFile.dataVersion}) no coinciden.`,
    });
  }

  const seenCardIds = new Set<number>();
  const seenCardSlugs = new Set<string>();
  for (const card of cardsFile.cards) {
    if (seenCardIds.has(card.id)) {
      issues.push({
        severity: 'error',
        code: 'duplicate-card-id',
        message: `Id de carta duplicado: ${card.id}. Los ids viajan en el deck code y deben ser únicos.`,
      });
    }
    seenCardIds.add(card.id);

    if (seenCardSlugs.has(card.slug)) {
      issues.push({
        severity: 'error',
        code: 'duplicate-card-slug',
        message: `Slug de carta duplicado: ${card.slug}.`,
      });
    }
    seenCardSlugs.add(card.slug);

    if (card.type === 'unit' && !card.stats) {
      issues.push({
        severity: 'error',
        code: 'unit-without-stats',
        message: `La unidad ${card.slug} (${card.id}) no trae stats. Campo ausente = build roto, no se estima.`,
      });
    }

    if (!card.art) {
      issues.push({
        severity: 'warning',
        code: 'missing-art',
        message: `La carta ${card.slug} (${card.id}) no tiene arte asignado.`,
      });
    }
  }

  const heroIds = new Set(heroesFile.heroes.map((hero) => hero.id));
  for (const card of cardsFile.cards) {
    if (card.heroId !== undefined && !heroIds.has(card.heroId)) {
      issues.push({
        severity: 'error',
        code: 'unknown-hero-reference',
        message: `La carta ${card.slug} (${card.id}) referencia al héroe ${card.heroId}, que no existe en heroes.json.`,
      });
    }
  }

  const seenHeroIds = new Set<number>();
  for (const hero of heroesFile.heroes) {
    if (seenHeroIds.has(hero.id)) {
      issues.push({
        severity: 'error',
        code: 'duplicate-hero-id',
        message: `Id de héroe duplicado: ${hero.id}.`,
      });
    }
    seenHeroIds.add(hero.id);
  }

  if (heroesFile.heroes.length > 0 && heroesFile.deckRules === null) {
    issues.push({
      severity: 'error',
      code: 'missing-deck-rules',
      message:
        'Hay héroes cargados pero deckRules sigue en null. El deckbuilder no puede validar mazos sin reglas exportadas por el juego.',
    });
  }

  // Un catálogo con cartas pero sin parche declarado no es publicable: el
  // deckbuilder no podría avisar "este mazo es de un parche anterior".
  if (cardsFile.cards.length > 0 && declaredVersion === '0.0.0') {
    issues.push({
      severity: 'error',
      code: 'unversioned-catalog',
      message:
        'Hay cartas cargadas pero DATA_VERSION sigue en 0.0.0. Vincula el catálogo a un parche real del juego.',
    });
  }

  return issues;
}
