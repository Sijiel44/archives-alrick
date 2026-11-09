import { toDefense } from './moteur/atelier5d6-bestiary-workshop.js';
import { effectiveProtectionM03, resistanceScoreM03, resolveCombatM03 } from './moteur/atelier5d6-combat-m03.js';

const resistanceFor = mode => mode === 'melee' || mode === 'tir' ? 'physique' : mode;
const resistanceLabels = { physique: 'physique', magie: 'magique', mental: 'mentale' };

export function describeDefense(mode, card) {
  const defender = toDefense(card);
  const kind = resistanceFor(mode);
  return { label: resistanceLabels[kind], threshold: resistanceScoreM03(defender, kind), protection: effectiveProtectionM03(defender, kind) };
}

export function resolveOpposition(roll, card) {
  const { dice, rawStat, masteryRank, situation, level, threshold, impactMode, baseDamage, penetration } = roll;
  return resolveCombatM03({
    natural: dice.reduce((sum, die) => sum + die, 0), rawStat, masteryRank, situation, level,
    difficulty: threshold, kind: resistanceFor(impactMode), mode: impactMode,
    defender: toDefense(card), feasible: true, baseDamage, penetration,
  });
}

export function describeOppositionResult(result) {
  if (result.criticalFailure) return { title: 'Échec critique', state: 'failure', advice: 'Retenez la complication dans le journal de la scène.' };
  if (result.effectProposed) return { title: 'Influence mentale réussie', state: 'success', advice: 'Le MJ décide de l’effet narratif.' };
  if (result.glancing) return { title: 'Contact sans blessure', state: 'mixed', advice: 'Décrivez le contact dans la scène.' };
  if (result.success) {
    return { title: result.damage ? 'Résistance franchie' : 'Impact absorbé', state: 'success', advice: 'Consignez la conséquence dans le journal de la scène.' };
  }
  const advice = result.reaction === 'riposte_possible' ? 'Une riposte peut être annoncée comme action distincte.' : 'Le MJ peut décider d’une réaction défensive.';
  return { title: 'Résistance tenue', state: 'failure', advice };
}
