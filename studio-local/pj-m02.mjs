import { draftFromLifePath, evaluateSheet, M02_SCHEMA, newDevelopment } from './moteur/atelier5d6-m02.js';
import { EDUCATION_PATHS, LITERACY_LEVELS, ORIGIN_MASTERIES, ORIGIN_STEPS } from './moteur/atelier5d6-origins.js';
import { baseHealth } from './moteur/atelier5d6-bestiary.js';
import { effectiveStat, effectiveMastery, experienceRequired } from './moteur/atelier5d6-progression.js';
import { checkJSON, validPJSource } from './store.mjs';

export const MAX_PJ_FILE_BYTES = 2 * 1024 * 1024;
export { effectiveStat, effectiveMastery };
export { EDUCATION_PATHS, LITERACY_LEVELS, ORIGIN_STEPS };
export const FREE_PJ_MASTERIES = [...ORIGIN_MASTERIES, 'esquive', 'parade', 'resistance_magique', 'volonte'];

function pjSource(sheet, identity) {
  const pvMax = baseHealth(sheet.level);
  // Convention de départ du parcours M02 de l’Atelier historique.
  const manaMax = (sheet.masteries.magie ?? 0) + (sheet.masteries.runes ?? 0) >= 2 ? pvMax : 0;
  const defenses = { physique: 0, magie: 0, mental: 0 };
  return {
    ...sheet, ...identity, kind: 'pj', ruleset: 'm02',
    pv: pvMax, pvMax, mana: manaMax, manaMax, resistanceBonus: defenses,
    protection: { ...defenses }, equipmentGrades: { ...defenses }, inventory: [],
  };
}

export function createGuidedPJ({ id, name, choices, education, literacy, backstory, connections, goal }) {
  if (!EDUCATION_PATHS.some(option => option.id === education) || !LITERACY_LEVELS.some(option => option.id === literacy)) {
    throw new Error('Choisissez un mode de transmission et un niveau de lecture.');
  }
  const { sheet, summary, profession, lifeSteps } = draftFromLifePath(choices);
  const source = pjSource(sheet, {
    id, name, profession, lifeSteps, lifeSummary: summary,
    education, literacy, backstory, connections, goal, sourceTitle: 'Parcours de vie M02 du Studio',
  });
  if (!validPJSource(source)) throw new Error('Vérifiez le nom et les choix de parcours.');
  return source;
}

export function buildFreePJ({ level, startingStats, stats, masteries }) {
  return { level, stats, masteries, xp: experienceRequired(level), development: { ...newDevelopment(), startingStats } };
}

export function createFreePJ(sheet, { id, name, profession, backstory, connections, goal }) {
  const budget = evaluateSheet(sheet);
  if (!budget.valid) throw new Error(budget.issues.join(' '));
  const source = pjSource(sheet, { id, name, profession, backstory, connections, goal, sourceTitle: 'Création libre M02 du Studio' });
  if (!validPJSource(source)) throw new Error('Vérifiez le nom et les caractéristiques du PJ.');
  return { source, budget };
}

export function readPJExport(text) {
  let archive;
  try { archive = JSON.parse(text); }
  catch { throw new Error('Le fichier doit contenir du JSON valide.'); }
  checkJSON(archive);
  if (archive?.schema !== M02_SCHEMA || !Array.isArray(archive.sheets) || archive.sheets.length > 60) {
    throw new Error('Choisissez un export de fiches alrick.sheets.v3 de l’Atelier historique.');
  }
  const sheets = archive.sheets.filter(validPJSource);
  if (!sheets.length) throw new Error('Cet export ne contient aucune fiche PJ M02 complète et lisible.');
  return { sheets, skipped: archive.sheets.length - sheets.length };
}

export { evaluateSheet as evaluatePJ };
