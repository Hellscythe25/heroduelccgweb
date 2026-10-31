/**
 * Importa los héroes del juego a src/data/ (ADR-005).
 *
 *   node scripts/import-game-data.mjs <ruta a ContentDatabase.json> <versión del juego>
 *
 * La versión es la del build del juego del que sale el archivo (bundleVersion
 * de Unity, ej. 0.6.0). Se escribe en DATA_VERSION y en los dos JSON, para que
 * el gate de coherencia (`npm run data:validate`) siga comparando las tres.
 *
 * Las cartas no se importan todavía: el compendio es una fase posterior y
 * cards.json se queda vacío, solo con la versión al día.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { heroesFromContentDatabase } from './lib/game-data.mjs';

const [source, version] = process.argv.slice(2);

if (!source || !version) {
  console.error('Uso: node scripts/import-game-data.mjs <ContentDatabase.json> <versión, ej. 0.6.0>');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`La versión debe ser SemVer del build del juego (ej. 0.6.0), no "${version}".`);
  process.exit(1);
}

const db = JSON.parse(await readFile(source, 'utf8'));
const heroes = heroesFromContentDatabase(db);

const heroesPath = new URL('../src/data/heroes.json', import.meta.url);
const cardsPath = new URL('../src/data/cards.json', import.meta.url);
const versionPath = new URL('../src/data/DATA_VERSION', import.meta.url);

const heroesFile = JSON.parse(await readFile(heroesPath, 'utf8'));
const cardsFile = JSON.parse(await readFile(cardsPath, 'utf8'));

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

await writeFile(heroesPath, json({ dataVersion: version, deckRules: heroesFile.deckRules, heroes }));
await writeFile(cardsPath, json({ ...cardsFile, dataVersion: version }));
await writeFile(versionPath, `${version}\n`);

console.log(`  import-game-data: ${heroes.length} héroes, versión ${version}`);
