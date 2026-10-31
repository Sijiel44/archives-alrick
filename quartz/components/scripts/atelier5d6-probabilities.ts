/**
 * Probabilités exactes du prototype 5d6 : aucun accès au DOM, aucune simulation.
 *
 * Source de vérité : cinq dés indépendants de six faces, toutes les 6^5 issues
 * équiprobables. Les naturels 5, 6 et 7 sont des échecs obligatoires dans
 * l'Atelier, même lorsque la somme bonifiée atteint la difficulté.
 *
 * Note : un naturel 27–30 ne franchit PAS automatiquement une résistance.
 * La faisabilité narrative et la pénétration sont arbitrées ailleurs.
 */
export const DICE_COUNT = 5
export const DIE_FACES = 6
export const TOTAL_OUTCOMES = DIE_FACES ** DICE_COUNT
export const MIN_SUM = DICE_COUNT
export const MAX_SUM = DICE_COUNT * DIE_FACES

export type NaturalCategory =
  | "echec_exceptionnel"
  | "echec_mineur"
  | "ordinaire"
  | "reussite_critique_potentielle"
  | "succes_exceptionnel_potentiel"

/** Distribution exacte calculée par convolution discrète, 5..30 inclus. */
const counts = (() => {
  let previous = [1]
  for (let die = 0; die < DICE_COUNT; die++) {
    const next = Array<number>(previous.length + DIE_FACES).fill(0)
    for (let sum = 0; sum < previous.length; sum++) {
      for (let face = 1; face <= DIE_FACES; face++) {
        next[sum + face] += previous[sum]
      }
    }
    previous = next
  }
  return Object.freeze(previous)
})()

export function sumOccurrences(sum: number): number {
  return Number.isInteger(sum) && sum >= MIN_SUM && sum <= MAX_SUM
    ? counts[sum]
    : 0
}

export function naturalCategory(sum: number): NaturalCategory {
  if (!Number.isInteger(sum) || sum < MIN_SUM || sum > MAX_SUM) {
    throw new RangeError("Le naturel 5d6 doit être entier entre 5 et 30.")
  }
  if (sum === 5) return "echec_exceptionnel"
  if (sum <= 7) return "echec_mineur"
  if (sum === 30) return "succes_exceptionnel_potentiel"
  if (sum >= 27) return "reussite_critique_potentielle"
  return "ordinaire"
}

/** Réussites numériques hors naturels 5–7 ; ne modélise pas l'effet du geste. */
export function countSuccessfulRolls(threshold: number, bonus: number): number {
  if (!Number.isFinite(threshold) || !Number.isFinite(bonus)) {
    throw new TypeError("Seuil et bonus doivent être finis.")
  }
  let successful = 0
  for (let sum = 8; sum <= MAX_SUM; sum++) {
    if (sum + bonus >= threshold) successful += counts[sum]
  }
  return successful
}

export function probabilitySuccess(threshold: number, bonus: number): number {
  return countSuccessfulRolls(threshold, bonus) / TOTAL_OUTCOMES
}

/**
 * Injection explicite de l'aléa : reproductible avec un générateur contrôlé.
 * Ce lancer n'est PAS encore branché à l'interface historique de l'Atelier.
 */
export function rollFiveDice(randomUnit: () => number): number[] {
  const dice: number[] = []
  for (let i = 0; i < DICE_COUNT; i++) {
    const value = randomUnit()
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("Le générateur doit retourner un nombre dans [0, 1[.")
    }
    dice.push(1 + Math.floor(value * DIE_FACES))
  }
  return dice
}
