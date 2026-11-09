import { effectiveMastery, effectiveStat, resolveProgressionAction } from './moteur/atelier5d6-progression.js';
import { naturalCategory, rollFiveDice } from './moteur/atelier5d6-probabilities.js';
import { PLAY_STATS } from './store.mjs';

const signed = value => value < 0 ? `−${Math.abs(value)}` : `+${value}`;

export function studioDice() {
  return rollFiveDice(Math.random);
}

export function describeDeclaration(roll, thresholdLabel = 'seuil') {
  const { stat, rawStat, masteryRank, situation, threshold } = roll;
  return `${PLAY_STATS[stat]} ${rawStat} · maîtrise ${masteryRank} · situation ${signed(situation)} · ${thresholdLabel} ${threshold}`;
}

function verdict(result, threshold) {
  if (result.naturalFailure) {
    if (naturalCategory(result.natural) === 'echec_exceptionnel') {
      return { title: 'Échec critique exceptionnel', state: 'failure', advice: 'Le MJ choisit entre −2 aux trois prochains jets du groupe et +2 aux actions ennemies pendant trois tours.' };
    }
    return { title: 'Échec critique mineur', state: 'failure', advice: 'Le MJ retient une complication ciblée.' };
  }
  if (result.criticalApplied) {
    if (naturalCategory(result.natural) === 'succes_exceptionnel_potentiel') {
      return { title: 'Succès exceptionnel', state: 'success', advice: 'Le MJ choisit entre +2 aux jets de l’équipe pendant trois tours et une récompense durable adaptée à la scène.' };
    }
    return { title: 'Réussite critique', state: 'success', advice: 'Le MJ décrit un effet renforcé dans les limites de l’action.' };
  }
  if (result.success) return { title: 'Réussite', state: 'success', advice: 'Appliquez la conséquence annoncée dans les limites des moyens du personnage.' };
  if (threshold - result.total <= 2) {
    return { title: 'Échec de justesse', state: 'mixed', advice: 'Le MJ peut retenir un progrès assorti d’un coût, si la fiction le permet.' };
  }
  return { title: 'Échec', state: 'failure', advice: 'Retenez une conséquence cohérente avec l’enjeu annoncé.' };
}

export function resolvePlayAction(action) {
  if (action.mode === 'certain') {
    return { title: 'Action certaine · sans jet', state: 'success', advice: 'Consignez ce qui se produit dans la scène.' };
  }
  if (action.mode === 'blocked') {
    return { title: 'Action impossible · sans jet', state: 'mixed', advice: 'Consignez l’obstacle ou le préalable. Le joueur peut annoncer une autre approche.' };
  }
  const { roll } = action;
  const natural = roll.dice.reduce((sum, die) => sum + die, 0);
  const result = resolveProgressionAction({ ...roll, natural, feasible: true });
  return {
    ...verdict(result, roll.threshold),
    source: roll.source === 'table' ? 'Dés saisis' : 'Jet du Studio',
    balance: `Naturel ${natural} · total ${result.total} / seuil ${roll.threshold}`,
    bonuses: `Caractéristique ${signed(effectiveStat(roll.rawStat))} · maîtrise ${signed(effectiveMastery(roll.masteryRank))} · situation ${signed(roll.situation)}`,
  };
}
