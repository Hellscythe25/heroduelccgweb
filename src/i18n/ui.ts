/**
 * Diccionario de interfaz y utilidades de i18n.
 *
 * i18n desde el commit 1 (docs/DEPLOY.md §11.5): retrofitearlo cuesta 5-10× más.
 *
 * Regla del glosario: los nombres propios del juego (héroes, cartas, mecánicas)
 * NO se traducen sin una decisión explícita registrada. El agente `localizador`
 * es el dueño de esa regla.
 */

export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'es';
export const locales = Object.keys(languages) as Lang[];

/** Etiqueta BCP-47 por idioma, para `<html lang>` y hreflang. */
export const localeTags: Record<Lang, string> = {
  es: 'es-ES',
  en: 'en-US',
};

/**
 * Slugs públicos por idioma. Las URLs son contenido, no código: el visitante
 * hispanohablante ve /es/noticias/ y el anglófono /en/news/.
 * Esta tabla es la fuente única para navegación y hreflang.
 */
export const routes = {
  home: { es: '', en: '' },
  news: { es: 'noticias', en: 'news' },
  blog: { es: 'blog', en: 'blog' },
  heroes: { es: 'heroes', en: 'heroes' },
  cards: { es: 'cartas', en: 'cards' },
  deckbuilder: { es: 'deckbuilder', en: 'deckbuilder' },
  presskit: { es: 'prensa', en: 'presskit' },
} as const;

export type RouteKey = keyof typeof routes;

export const ui = {
  es: {
    'site.name': 'Hero Duel',
    'site.tagline': 'Duelos de héroes, cartas y decisiones',
    'site.description':
      'Hero Duel es un juego de cartas coleccionables en desarrollo. Sigue la beta, lee el devlog y construye tus mazos.',
    'nav.skipToContent': 'Saltar al contenido',
    'nav.home': 'Inicio',
    'nav.news': 'Noticias',
    'nav.blog': 'Devlog',
    'nav.heroes': 'Héroes',
    'nav.cards': 'Cartas',
    'nav.deckbuilder': 'Deckbuilder',
    'nav.presskit': 'Prensa',
    'nav.language': 'Idioma',
    'home.badge': 'En beta',
    'home.title': 'Hero Duel',
    // Afirmación deliberadamente mínima: nombre, género y estado. Todo lo demás
    // (mecánicas, plataformas, fechas) necesita confirmación del estudio antes
    // de publicarse. Ver docs/MEMORIA.md.
    'home.subtitle': 'Un juego de cartas coleccionables en desarrollo.',
    'home.cta.steam': 'Añadir a deseados en Steam',
    'home.cta.discord': 'Únete al Discord',
    'home.cta.itch': 'Verlo en itch.io',
    'home.building.title': 'Estamos construyendo esto',
    'home.building.body':
      'El sitio crece a la vez que el juego. Pronto habrá devlog, compendio de cartas y constructor de mazos.',
    'press.title': 'Kit de prensa',
    'press.intro':
      'Todo lo necesario para escribir sobre Hero Duel. Los materiales pueden usarse libremente en cobertura editorial y vídeos.',
    'press.draft.title': 'Kit de prensa incompleto',
    'press.draft.body':
      'Esta página está en borrador: no aparece en el menú, no se indexa y no debería compartirse todavía. Falta esto:',
    'press.draft.field': 'Campo',
    'press.draft.why': 'Por qué hace falta',
    'press.draft.howto':
      'Los campos se rellenan en src/press.ts. En cuanto no falte ninguno, la página se publica sola.',
    'press.factsheet': 'Ficha técnica',
    'press.studio': 'Estudio',
    'press.founded': 'Fundado en',
    'press.location': 'Ubicación',
    'press.release': 'Lanzamiento',
    'press.platforms': 'Plataformas',
    'press.price': 'Precio',
    'press.modes': 'Modos de juego',
    'press.languages': 'Idiomas del juego',
    'press.engine': 'Motor',
    'press.short': 'Descripción breve',
    'press.long': 'Descripción extendida',
    'press.assets': 'Materiales',
    'press.logos': 'Logotipos',
    'press.screenshots': 'Capturas',
    'press.trailer': 'Tráiler',
    'press.zip': 'Descargar todo el material',
    'press.contact': 'Contacto',
    'footer.rights': 'Todos los derechos reservados.',
    // Sin número de fase: es jerga interna y se queda obsoleta sin que nadie lo note.
    'footer.phase': 'Sitio en construcción',
    '404.title': 'Esta carta no está en el mazo',
    '404.body': 'La página que buscas no existe o cambió de sitio.',
    '404.back': 'Volver al inicio',
  },
  en: {
    'site.name': 'Hero Duel',
    'site.tagline': 'Heroes, cards, and the calls you make',
    'site.description':
      'Hero Duel is a collectible card game in development. Follow the beta, read the devlog, and build your decks.',
    'nav.skipToContent': 'Skip to content',
    'nav.home': 'Home',
    'nav.news': 'News',
    'nav.blog': 'Devlog',
    'nav.heroes': 'Heroes',
    'nav.cards': 'Cards',
    'nav.deckbuilder': 'Deckbuilder',
    'nav.presskit': 'Press kit',
    'nav.language': 'Language',
    'home.badge': 'In beta',
    'home.title': 'Hero Duel',
    'home.subtitle': 'A collectible card game in development.',
    'home.cta.steam': 'Wishlist on Steam',
    'home.cta.discord': 'Join the Discord',
    'home.cta.itch': 'View on itch.io',
    'home.building.title': 'We are building this',
    'home.building.body':
      'The site grows alongside the game. A devlog, a card compendium and a deckbuilder are on the way.',
    'press.title': 'Press kit',
    'press.intro':
      'Everything you need to write about Hero Duel. These materials may be used freely in editorial coverage and videos.',
    'press.draft.title': 'Press kit incomplete',
    'press.draft.body':
      'This page is a draft: it is not in the menu, it is not indexed, and it should not be shared yet. Missing:',
    'press.draft.field': 'Field',
    'press.draft.why': 'Why it is needed',
    'press.draft.howto':
      'Fields are filled in src/press.ts. Once none are missing, the page publishes itself.',
    'press.factsheet': 'Fact sheet',
    'press.studio': 'Studio',
    'press.founded': 'Founded',
    'press.location': 'Based in',
    'press.release': 'Release',
    'press.platforms': 'Platforms',
    'press.price': 'Price',
    'press.modes': 'Game modes',
    'press.languages': 'Game languages',
    'press.engine': 'Engine',
    'press.short': 'Short description',
    'press.long': 'Long description',
    'press.assets': 'Assets',
    'press.logos': 'Logos',
    'press.screenshots': 'Screenshots',
    'press.trailer': 'Trailer',
    'press.zip': 'Download all assets',
    'press.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    'footer.phase': 'Site under construction',
    '404.title': 'That card is not in the deck',
    '404.body': 'The page you are looking for does not exist or has moved.',
    '404.back': 'Back to home',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['es'];

/** Extrae el idioma del primer segmento de la URL. Cae al idioma por defecto. */
export function getLangFromUrl(url: URL): Lang {
  const segment = url.pathname.split('/')[1];
  return locales.includes(segment as Lang) ? (segment as Lang) : defaultLang;
}

/**
 * Devuelve un traductor para el idioma dado. Si falta una clave cae al español,
 * que es el idioma canónico: preferimos una cadena en el idioma equivocado a un
 * hueco vacío en producción. El agente `localizador` audita la deriva.
 */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Construye una ruta absoluta y localizada, con barra final (trailingSlash: 'always'). */
export function localizedPath(lang: Lang, key: RouteKey): string {
  const slug = routes[key][lang];
  return slug === '' ? `/${lang}/` : `/${lang}/${slug}/`;
}

/** Equivalentes en todos los idiomas de una misma página, para hreflang. */
export function alternates(key: RouteKey): { lang: Lang; path: string }[] {
  return locales.map((lang) => ({ lang, path: localizedPath(lang, key) }));
}
