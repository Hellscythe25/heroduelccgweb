/**
 * Estado de los documentos legales (Privacidad y Términos).
 *
 * Mientras un documento esté en `draft`, su página se genera para poder
 * revisarla, pero va con `noindex`, fuera del sitemap, sin enlace en el pie y
 * con un aviso visible de borrador. Pasar a `published` es una decisión del
 * dueño tras la revisión legal: no la toma ningún agente (docs/MEMORIA.md).
 *
 * Vive en un .ts y no en el frontmatter porque astro.config.mjs lo necesita
 * para el sitemap, y la configuración no puede leer las Content Collections.
 */
export type LegalDoc = 'privacy' | 'terms';

export const legalDocs: LegalDoc[] = ['privacy', 'terms'];

export const legalStatus: Record<LegalDoc, 'draft' | 'published'> = {
  privacy: 'draft',
  terms: 'draft',
};

export function isLegalPublished(doc: LegalDoc): boolean {
  return legalStatus[doc] === 'published';
}
