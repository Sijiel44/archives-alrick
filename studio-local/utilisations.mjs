import { QUESTS_KEY } from './quetes.mjs';

// Le résolveur fourni connaît les alias Markdown, sans consulter d’autre campagne.
export function resourceUsages(campaign, targetId, referencesIn = () => []) {
  if (!campaign) return [];
  const found = new Map();
  const add = (kind, id, label, reason) => {
    const key = `${kind}:${id}`, row = found.get(key) ?? { kind, id, label, reasons: [] };
    if (!row.reasons.includes(reason)) row.reasons.push(reason);
    found.set(key, row);
  };
  const mentions = value => typeof value === 'string' && referencesIn(value).includes(targetId);
  for (const scene of campaign.scenes) {
    if (scene.participantIds.includes(targetId)) add('scene', scene.id, scene.title, 'Participant');
    const source = scene.entreRivesAdventureSceneV11;
    if (source?.adventureId === targetId || source?.referenceIds.includes(targetId)) add('scene', scene.id, scene.title, 'Fiche de préparation');
    if (mentions(scene.description) || mentions(scene.privateNotes)) add('scene', scene.id, scene.title, 'Lien Markdown');
  }
  for (const marker of campaign.entreRivesFresqueMarkersV4 ?? []) {
    if (marker.id === targetId && marker.sceneId) {
      const scene = campaign.scenes.find(item => item.id === marker.sceneId);
      if (scene) add('scene', scene.id, scene.title, 'Repère de scène');
    }
    if (marker.id !== targetId && (mentions(marker.description) || marker.entreRivesFresqueReferenceV5?.sourceId === targetId)) {
      add('resource', marker.id, marker.title, 'Repère lié');
    }
  }
  for (const creation of campaign.entreRivesCreationsV10 ?? []) {
    if (creation.id === targetId) continue;
    if (creation.parentId === targetId || creation.links.includes(targetId)) add('resource', creation.id, creation.name, 'Fiche liée');
    if ([creation.description, creation.notes, ...Object.values(creation.details)].some(mentions)) add('resource', creation.id, creation.name, 'Lien Markdown');
  }
  for (const step of campaign[QUESTS_KEY] ?? []) {
    if (step.id === targetId) {
      for (const scene of campaign.scenes.filter(scene => step.sceneIds.includes(scene.id))) add('scene', scene.id, scene.title, 'Chemin de découverte');
    } else if (step.questId === targetId || step.references.some(ref => ref.id === targetId) || mentions(step.notes) || mentions(step.playerText)) {
      add('resource', step.id, step.title, step.kind === 'clue' ? 'Indice suivi' : 'Objectif suivi');
    }
  }
  for (const image of campaign.entreRivesLinkedImagesV15 ?? []) if (image.targetId === targetId) add('resource', image.id, image.name, 'Illustration');
  for (const actor of [...campaign.characters, ...campaign.creatures]) {
    if (actor.id !== targetId && (actor.source?.id === targetId || mentions(actor.notes) || mentions(actor.description))) add('resource', actor.id, actor.name, 'Fiche de campagne');
  }
  return [...found.values()];
}
