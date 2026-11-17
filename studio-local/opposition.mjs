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


/**
 * STUDIO-CREATE-004 — aperçu MJ, jamais une tentative engagée.
 *
 * Les dés physiques et le bouton de lancer fournissent les mêmes cinq d6.
 * Le contrôleur Studio conserve la session INDEX et demande séparément
 * l'autorisation du MJ, la dépense, l'application et la sauvegarde.
 * Aucun champ \`approved\` ni \`effects\` reçu avec une fiche ne traverse
 * cette passerelle : seul INDEX peut les homologuer avant M03.
 */
export function previewIndexedOpposition(roll, card, indexSession, selections = {}) {
  if (!indexSession || typeof indexSession.resolve !== 'function') {
    throw new TypeError('Session INDEX du MJ requise pour la prévisualisation');
  }
  if (!roll || !Array.isArray(roll.dice) || roll.dice.length !== 5 ||
      !roll.dice.every(die => Number.isSafeInteger(die) && die >= 1 && die <= 6)) {
    throw new RangeError('Le jet de table exige exactement cinq dés à six faces');
  }
  if (!['melee', 'tir', 'magie', 'mental'].includes(roll.impactMode)) {
    throw new RangeError('Mode d’opposition inconnu');
  }
  if (roll.feasible !== undefined && typeof roll.feasible !== 'boolean') {
    throw new TypeError('Faisabilité MJ doit être un booléen');
  }
  const { dice, rawStat, masteryRank, situation, level, threshold,
    impactMode, baseDamage, penetration } = roll;
  const { attackerId, defenderId = null, attackRefs = [], defenseRefs = [],
    intensityRef = null, intensityTier, heroicChoice = null } = selections;
  const action = {
    natural: dice.reduce((sum, die) => sum + die, 0),
    rawStat, masteryRank, situation, level,
    difficulty: threshold, kind: resistanceFor(impactMode), mode: impactMode,
    defender: toDefense(card), feasible: roll.feasible !== false,
    baseDamage, penetration,
  };
  const preview = indexSession.resolve({
    action, attackerId, defenderId, attackRefs, defenseRefs,
    intensityRef, intensityTier, heroicChoice,
  });
  return Object.freeze({ status: 'preview', ...preview });
}
