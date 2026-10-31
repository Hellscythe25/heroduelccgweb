/**
 * Transformación pura del ContentDatabase.json del juego al formato de
 * src/data/heroes.json (ADR-005).
 *
 * Copia, no interpreta: nombres, vida, pasivas y habilidades salen tal cual del
 * juego. Lo único que hace es partir la pasiva "Nombre: texto" en sus dos
 * campos. Si el juego cambia ese formato, falla en vez de adivinar.
 */

/** Parte "Filo Implacable: los ataques..." en nombre y texto. */
export function splitPassive(raw, context) {
  const separator = raw.indexOf(': ');
  if (separator <= 0) {
    throw new Error(`${context}: la pasiva no sigue el formato "Nombre: texto": ${raw}`);
  }
  return { name: raw.slice(0, separator).trim(), text: raw.slice(separator + 2).trim() };
}

function localized(es, en, context) {
  if (!es || !en) {
    throw new Error(`${context}: falta el texto en español o en inglés.`);
  }
  return { es, en };
}

/** Devuelve la lista de héroes en el orden del juego. */
export function heroesFromContentDatabase(db) {
  if (!Array.isArray(db?.heroes)) {
    throw new Error('ContentDatabase sin la lista "heroes".');
  }

  const campaigns = Array.isArray(db.campaigns) ? db.campaigns : [];

  return db.heroes.map((hero) => {
    const context = `héroe "${hero.id}"`;
    const passiveEs = splitPassive(hero.passiveEs, context);
    const passiveEn = splitPassive(hero.passiveEn, context);
    const campaign = campaigns.find((entry) => entry.heroId === hero.id);

    return {
      id: hero.id,
      name: localized(hero.nameEs, hero.nameEn, context),
      life: hero.startingHealth,
      passive: {
        name: localized(passiveEs.name, passiveEn.name, context),
        text: localized(passiveEs.text, passiveEn.text, context),
      },
      actives: (hero.abilities ?? []).map((ability) => ({
        id: ability.id,
        name: localized(ability.nameEs, ability.nameEn, `${context}, habilidad "${ability.id}"`),
        text: localized(ability.descEs, ability.descEn, `${context}, habilidad "${ability.id}"`),
        cost: ability.cost,
      })),
      ...(campaign
        ? { campaign: { name: localized(campaign.nameEs, campaign.nameEn, `${context}, campaña`) } }
        : {}),
    };
  });
}
