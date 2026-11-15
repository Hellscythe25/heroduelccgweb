/**
 * Utilidades de la página de novedades por versión (src/content/changelog/).
 *
 * Las versiones del juego son SemVer sin sufijos ("0.8.0"). Se ordenan por
 * número y no como texto: como texto, "0.10.0" quedaría antes que "0.9.0".
 */

/** Compara dos versiones "x.y.z". Negativo si `a` es anterior a `b`. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Ancla estable de una versión dentro de la página: "0.8.0" → "v0-8-0". */
export function versionAnchor(version: string): string {
  return `v${version.replaceAll('.', '-')}`;
}
