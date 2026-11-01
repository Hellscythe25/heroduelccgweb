/**
 * Configuración del sitio que no es contenido traducible ni datos del juego.
 *
 * Fuente única de los enlaces externos. Toda la landing existe para empujar a
 * tres acciones — wishlist, Discord y prensa — así que estas URLs son lo más
 * parecido que tiene el sitio a un objetivo de negocio.
 *
 * Un enlace vacío NO es un placeholder: es una ausencia declarada. Los
 * componentes omiten el CTA correspondiente en vez de renderizar un enlace
 * roto, que es peor que no tener el botón. En cuanto exista la URL, se rellena
 * aquí y aparece en los dos idiomas a la vez.
 */

export interface ExternalLinks {
  /** Página del juego en Steam, para wishlist. */
  steam: string;
  /** Invitación permanente de Discord. Las que caducan a los 7 días no sirven. */
  discord: string;
  /** Página en itch.io. */
  itch: string;
}

export const externalLinks: ExternalLinks = {
  steam: '',
  discord: '',
  itch: '',
};

/**
 * Estudio que desarrolla el juego, acreditado en el pie con su logo oficial
 * (kit de marca de Wildcat Games). Inca Games lo publica.
 */
export const developer = {
  name: 'Wildcat Games',
  url: 'https://wildcatgames.net/',
};

/** Correo de contacto para prensa. Vacío hasta que exista uno del dominio. */
export const pressContact = '';

/** `true` si el enlace está definido y es utilizable. */
export function hasLink(url: string): boolean {
  return url.trim().length > 0;
}

/** Enlaces definidos, en orden de prioridad para los CTA de la landing. */
export function activeLinks(): { key: keyof ExternalLinks; url: string }[] {
  const order: (keyof ExternalLinks)[] = ['steam', 'discord', 'itch'];
  return order
    .filter((key) => hasLink(externalLinks[key]))
    .map((key) => ({ key, url: externalLinks[key] }));
}
