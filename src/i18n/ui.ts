/**
 * Diccionario de interfaz y utilidades de i18n.
 *
 * i18n desde el commit 1 (docs/DEPLOY.md §11.5): retrofitearlo cuesta 5-10× más.
 *
 * Aquí viven las cadenas cortas de interfaz. Los textos largos de cada página
 * están en src/i18n/pages/, con la misma regla de paridad: un objeto por
 * idioma y TypeScript exige la misma forma en los dos.
 *
 * Regla del glosario: los nombres propios del juego (héroes, cartas, mecánicas)
 * NO se traducen sin una decisión explícita registrada. El agente `localizador`
 * es el dueño de esa regla. Los nombres en inglés de héroes y habilidades son
 * los del propio juego (ContentDatabase.json), no traducciones de esta web.
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
  game: { es: 'juego', en: 'game' },
  howToPlay: { es: 'como-se-juega', en: 'how-to-play' },
  heroes: { es: 'heroes', en: 'heroes' },
  news: { es: 'noticias', en: 'news' },
  // La colección se llama `blog`; de cara al público es el devlog.
  blog: { es: 'devlog', en: 'devlog' },
  cards: { es: 'cartas', en: 'cards' },
  deckbuilder: { es: 'deckbuilder', en: 'deckbuilder' },
  presskit: { es: 'prensa', en: 'presskit' },
  privacy: { es: 'privacidad', en: 'privacy' },
  terms: { es: 'terminos', en: 'terms' },
} as const;

export type RouteKey = keyof typeof routes;

export const ui = {
  es: {
    'site.name': 'Hero Duel CCG',
    'site.tagline': 'Duelos de héroes, cartas y decisiones',
    'site.description':
      'Hero Duel CCG es un juego de cartas coleccionables de duelos héroe contra héroe, en desarrollo para PC. Conoce a los héroes y cómo se juega un duelo.',
    'nav.skipToContent': 'Saltar al contenido',
    'nav.main': 'Principal',
    'nav.home': 'Inicio',
    'nav.game': 'El juego',
    'nav.howToPlay': 'Cómo se juega',
    'nav.news': 'Noticias',
    'nav.blog': 'Devlog',
    'nav.heroes': 'Héroes',
    'nav.cards': 'Cartas',
    'nav.deckbuilder': 'Deckbuilder',
    'nav.presskit': 'Prensa',
    'nav.language': 'Idioma',
    'nav.legal': 'Legal',
    'nav.privacy': 'Privacidad',
    'nav.terms': 'Términos',
    'home.badge': 'En desarrollo',
    'home.title': 'Hero Duel CCG',
    'home.subtitle':
      'Un duelo héroe contra héroe, sin tablero de criaturas: instantáneas, equipo y energía en lugar de maná. Tu héroe, tu mazo, un duelo.',
    'home.cta.game': 'Descubre el juego',
    'home.cta.howToPlay': 'Aprende a jugar',
    'home.cta.steam': 'Añadir a deseados en Steam',
    'home.cta.discord': 'Únete al Discord',
    'home.cta.itch': 'Verlo en itch.io',
    'hero.life': 'Vida',
    'hero.passive': 'Pasiva',
    'hero.abilities': 'Habilidades',
    'hero.cost': 'Coste',
    'hero.energy': 'de energía',
    'hero.campaign': 'Campaña',
    'hero.portrait': 'Ilustración de {name}',
    'devlog.title': 'Devlog',
    'devlog.intro':
      'Notas del equipo sobre cómo se hace Hero Duel CCG: diseño, decisiones y avances.',
    'devlog.empty': 'Todavía no hay entradas. La primera llegará pronto.',
    'devlog.published': 'Publicado el',
    'legal.updated': 'Última actualización',
    'legal.draft.title': 'Borrador pendiente de revisión legal',
    'legal.draft.body':
      'Este documento es un borrador y todavía no está en vigor. No es asesoramiento legal: debe revisarlo un profesional antes de publicarse. Los datos marcados como [PENDIENTE] faltan por confirmar.',
    'press.title': 'Kit de prensa',
    'press.intro':
      'Todo lo necesario para escribir sobre Hero Duel CCG. Los materiales pueden usarse libremente en cobertura editorial y vídeos.',
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
    'footer.art': 'Las ilustraciones son provisionales y pueden cambiar antes del lanzamiento.',
    'footer.developer': 'Desarrollado por',
    '404.title': 'Esta carta no está en el mazo',
    '404.body': 'La página que buscas no existe o cambió de sitio.',
    '404.back': 'Volver al inicio',
  },
  en: {
    'site.name': 'Hero Duel CCG',
    'site.tagline': 'Heroes, cards, and the calls you make',
    'site.description':
      'Hero Duel CCG is a hero-versus-hero collectible card game in development for PC. Meet the heroes and learn how a duel plays out.',
    'nav.skipToContent': 'Skip to content',
    'nav.main': 'Main',
    'nav.home': 'Home',
    'nav.game': 'The game',
    'nav.howToPlay': 'How to play',
    'nav.news': 'News',
    'nav.blog': 'Devlog',
    'nav.heroes': 'Heroes',
    'nav.cards': 'Cards',
    'nav.deckbuilder': 'Deckbuilder',
    'nav.presskit': 'Press kit',
    'nav.language': 'Language',
    'nav.legal': 'Legal information',
    'nav.privacy': 'Privacy',
    'nav.terms': 'Terms',
    'home.badge': 'In development',
    'home.title': 'Hero Duel CCG',
    'home.subtitle':
      'A hero-versus-hero duel with no creature board: instants, equipment and energy instead of mana. Your hero, your deck, one duel.',
    'home.cta.game': 'Discover the game',
    'home.cta.howToPlay': 'Learn to play',
    'home.cta.steam': 'Wishlist on Steam',
    'home.cta.discord': 'Join the Discord',
    'home.cta.itch': 'View on itch.io',
    'hero.life': 'Life',
    'hero.passive': 'Passive',
    'hero.abilities': 'Abilities',
    'hero.cost': 'Cost',
    'hero.energy': 'energy',
    'hero.campaign': 'Campaign',
    'hero.portrait': 'Illustration of {name}',
    'devlog.title': 'Devlog',
    'devlog.intro': 'Notes from the team on how Hero Duel CCG is made: design, decisions and progress.',
    'devlog.empty': 'No posts yet. The first one is coming soon.',
    'devlog.published': 'Published on',
    'legal.updated': 'Last updated',
    'legal.draft.title': 'Draft pending legal review',
    'legal.draft.body':
      'This document is a draft and is not yet in effect. It is not legal advice: a qualified professional must review it before it is published. Items marked [PENDING] are still to be confirmed.',
    'press.title': 'Press kit',
    'press.intro':
      'Everything you need to write about Hero Duel CCG. These materials may be used freely in editorial coverage and videos.',
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
    'footer.art': 'Illustrations are provisional and may change before launch.',
    'footer.developer': 'Developed by',
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
