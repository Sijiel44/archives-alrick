import {
  DEMO_CREATURES, LIBRARY_CATEGORIES, LIBRARY_ILLUSTRATIONS, LIBRARY_SHELVES, LIBRARY_SOURCES, LIBRARY_STATUSES,
  archiveReference, buildLibraryIndex, creatureReference, filterLibrary, inLibraryShelf, libraryReference,
  libraryIllustration, markerCopyProvenance, normalize, referenceSegments, searchTerms,
} from './bibliotheque.mjs';
import {
  ADVENTURE_SCENE_KEY, ADVENTURE_SOURCE_KEY, MAX_ADVENTURE_PACKAGE_BYTES, importedAdventure, readAdventurePackage,
  BESTIARY_PROFILE_KEY, BESTIARY_SCHEMA, CREATIONS_KEY, FRESQUE_LINKS_KEY, FRESQUE_MARKERS_KEY, FRESQUE_REFERENCE_KEY,
  LIBRARY_SOURCE_SCHEMAS, MARKER_KINDS, OPPOSITION_MODES, PJ_SOURCE_KEY, PLAY_ACTIONS_KEY, PLAY_STATS,
  SCENE_AMBIANCE_LIMIT, SCENE_AMBIANCES_KEY, SESSION_ARCHIVES_KEY,
  FRESQUE_LANE_KEY, FRESQUE_LANES_KEY, FRESQUE_LANE_LIMIT,
  INTERLUDES_KEY, INTERLUDE_KINDS,
  IMAGE_ORIGINS, validImageUrl,
  combatProfile, currentHitPoints, hitPointsAfterDamage, openStudioStore,
} from './store.mjs';
import { ADVENTURE_SCENE_LIMIT, CREATION_STATES, CREATION_TYPES, adventureMilestones } from './creations.mjs';
import { clearProjection, createPlayerProjection, createProjection, loadPresentationImage, openPlayerWindow, playerSheetPresentation, scenePresentation, showPresentation } from './projection.mjs';

const $ = (id) => document.getElementById(id);
const campaignViews = ['prepare', 'play', 'interludes', 'archive'];
const views = ['home', ...campaignViews, 'library', 'creations', 'workshop', 'universe', 'backups'];
const sessionDateFormat = new Intl.DateTimeFormat('fr', { dateStyle: 'long', timeZone: 'UTC' });
const actionDateFormat = new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' });
const libraryPageSize = 24;
const miniMapStep = 54;
const shelfCreationKind = { atlas: 'place', bestiaire: 'creature', objets: 'object', sorts: 'spell', actions: 'ability', aventures: 'quest' };
let store;
let campaign = null;
let campaigns = [];
let unreadableCampaignCount = 0;
let libraryEntries = [];
let libraryPage = 0;
let libraryShelf = '';
let resourceEntry;
let resourceTrail = [];
let lastCampaignId;
let selectedArchiveId;
let miniMapSceneId;
let view = 'home';
let busy = false;
let draft;
let createDraft;
let quickDraft;
let linkDraft;
let preview;
let previewRequest = 0;
let notifications;
let playerShare;
let playerWindow;
let playerWindowKind;
let playerWindowTimer;
let projectionReturnFocus;
let playRules;
let bestiaryRules;
let oppositionRules;
let pjRules;
let workshopDraft;
let workshopRead = 0;

function node(tag, content, className) {
  const element = document.createElement(tag);
  if (content !== undefined) element.textContent = content;
  if (className) element.className = className;
  return element;
}

function action(label, onClick, className = 'secondary', accessibleName) {
  const button = node('button', label, className);
  button.type = 'button';
  if (accessibleName) button.setAttribute('aria-label', accessibleName);
  button.addEventListener('click', onClick);
  return button;
}

function setStatus(text, state = '') {
  $('save-status').textContent = text;
  $('save-status').dataset.state = state;
}

function clearError() {
  $('app-error').hidden = true;
  $('refresh-campaign').hidden = true;
}

function showError(error, form) {
  const message = error.message || 'Une erreur empêche le Studio de poursuivre cette action.';
  setStatus('Action interrompue · vérifiez le message', 'error');
  if (form) {
    form.querySelector('.form-error').textContent = message;
    form.querySelector('.form-feedback').hidden = false;
    form.querySelector('.reload-draft').hidden = error.code !== 'conflict';
    return;
  }
  $('app-error-text').textContent = message;
  $('app-error').hidden = false;
  $('refresh-campaign').hidden = error.code !== 'conflict' || !campaign;
}

function remember(id) {
  lastCampaignId = id;
  try {
    localStorage.setItem('entre-rives:derniere-campagne', id);
  } catch {
    // La préférence de navigation est facultative.
  }
}

function activeScene() {
  return campaign?.scenes.find((scene) => scene.id === campaign.activeSceneId);
}

function actors() {
  return [
    ...campaign.characters.map((character) => ({ ...character, kind: 'PJ' })),
    ...campaign.creatures.map(creature => ({ ...creature, kind: creature[BESTIARY_PROFILE_KEY]?.card.kind === 'pnj' ? 'PNJ' : 'Créature' })),
  ];
}

function updateProjectionButtons() {
  $('show-projection').disabled = !$('share-title').checked && !$('share-description').checked;
}

function revokeProjection() {
  clearProjection($('projection'));
  const dialog = $('projection-dialog');
  const wasOpen = dialog.open;
  if (wasOpen) dialog.close();
  $('share-title').checked = false;
  $('share-description').checked = false;
  updateProjectionButtons();
  if (wasOpen && !document.hidden) (projectionReturnFocus ?? $('share-title')).focus();
  projectionReturnFocus = undefined;
  if ($('save-status').dataset.state === 'projection') setStatus('Projection retirée');
}

function navigate(next, moveFocus = true) {
  if (!campaign && campaignViews.includes(next)) return;
  if (view === 'play' && next !== 'play') revokeProjection();
  if (view !== next) revokePlayerShare();
  view = next;
  for (const section of views) {
    $(`view-${section}`).hidden = section !== next;
    const nav = $(`nav-${section}`);
    if (section === next) nav.setAttribute('aria-current', 'page');
    else nav.removeAttribute('aria-current');
  }
  if (next === 'library') renderLibrary();
  if (next === 'creations') renderCreationDirectory();
  if (next === 'workshop') renderWorkshop();
  if (next === 'universe') renderUniverse();
  if (moveFocus) $(next === 'library' && libraryShelf ? 'library-shelf-title' : `${next}-title`).focus();
}

function record(name, detail, controls = []) {
  const item = node('li');
  const text = node('div');
  text.append(node('p', name, 'record-name'));
  if (detail) text.append(node('p', detail, 'record-detail'));
  item.append(text);
  if (controls.length) {
    const buttons = node('div', undefined, 'actions');
    buttons.append(...controls);
    item.append(buttons);
  }
  return item;
}

function recentCampaign() {
  return campaigns.find((entry) => entry.id === lastCampaignId) || campaigns[0];
}

function resumeCampaign(entry) {
  return openCampaign(entry.id, entry.activeSceneId ? 'play' : 'prepare');
}

function orderedSessions(source) {
  return (source?.[SESSION_ARCHIVES_KEY] ?? []).toReversed().sort((a, b) => b.date.localeCompare(a.date));
}

function sceneTitle(source, id) {
  return source.scenes.find(scene => scene.id === id)?.title;
}

function formatSessionDate(date) {
  return sessionDateFormat.format(new Date(date + 'T00:00:00Z'));
}

function renderDashboard(entry) {
  $('campaign-dashboard').hidden = !entry;
  if (!entry) return;
  const last = orderedSessions(entry)[0];
  const characters = entry.characters;
  const group = characters.slice(0, 4).map(character => character.name).join(', ');
  $('dashboard-campaign').textContent = entry.name;
  $('dashboard-scene').textContent = sceneTitle(entry, entry.activeSceneId) || 'Aucune scène active';
  $('dashboard-group').textContent = characters.length > 4 ? `${group} et ${characters.length - 4} autre(s)` : group || 'Aucun PJ';
  $('dashboard-session').textContent = last ? `${last.title} · ${formatSessionDate(last.date)}` : 'Aucune archive';
  $('dashboard-next').hidden = !last?.nextSession.trim();
  $('dashboard-next-text').textContent = last?.nextSession ?? '';
}

async function loadCampaignInventory() {
  ({ campaigns, unreadableCount: unreadableCampaignCount } = await store.listRecoverable());
  $('campaign-recovery').hidden = unreadableCampaignCount === 0;
  const label = $('campaign-recovery-title');
  const message = unreadableCampaignCount === 1 ? '1 enregistrement de campagne est illisible.'
    : `${unreadableCampaignCount} enregistrements de campagne sont illisibles.`;
  if (label.textContent !== message) label.textContent = message;
}

function renderCampaigns() {
  const recent = recentCampaign();
  renderDashboard(recent);
  $('resume-campaign').hidden = !recent;
  $('resume-campaign').onclick = recent ? () => resumeCampaign(recent) : null;
  $('campaigns-empty').hidden = campaigns.length > 0;
  $('campaigns-empty').textContent = unreadableCampaignCount ? 'Aucune campagne lisible dans ce profil.'
    : 'Vos campagnes apparaîtront ici après leur première sauvegarde.';
  $('campaign-list').replaceChildren(...campaigns.map((entry) => record(
    entry.name,
    `${entry.style === 'one-shot' ? 'Partie courte' : 'Campagne libre'} · niveau ${entry.startingLevel} · ${entry.scenes.length} scène(s)`,
    [action('Ouvrir', () => openCampaign(entry.id), 'secondary', `Ouvrir ${entry.name}`)],
  )));
}

function renderPrepare() {
  $('prepare-description').textContent = campaign.description || campaign.name;
  $('guided-steps').hidden = campaign.style !== 'one-shot';
  for (const [kind, entries] of Object.entries({ characters: campaign.characters, creatures: campaign.creatures, scenes: campaign.scenes })) {
    $(`${kind}-empty`).hidden = entries.length > 0;
    $(`guide-${kind}`).dataset.complete = String(entries.length > 0);
  }
  $('import-pj').disabled = !pjRules;
  $('guide-pj').disabled = !pjRules;
  $('free-pj').disabled = !pjRules;
  $('character-list').replaceChildren(...campaign.characters.map(character => {
    const linked = character[PJ_SOURCE_KEY];
    const controls = [action('Modifier', () => editCharacter(character), 'secondary', `Modifier ${character.name}`)];
    if (linked) controls.unshift(action('Fiche 5d6', () => openCombatProfile(character.id), 'secondary', `Ouvrir le profil 5d6 de ${character.name}`));
    else controls.unshift(action('Voir la fiche', () => previewResource(campaignEntry(character.id)), 'secondary', `Voir la fiche de ${character.name}`));
    return record(character.name, `Niveau ${character.level}${linked ? ' · Fiche M02' : ''}${character.notes ? ' · Notes privées' : ''}`, controls);
  }));
  $('creature-list').replaceChildren(...campaign.creatures.map(creature => {
    const profile = creature[BESTIARY_PROFILE_KEY];
    const controls = [action('Adapter', () => editCreature(creature), 'secondary', `Adapter ${creature.name}`)];
    if (profile) controls.unshift(action('Fiche 5d6', () => openCombatProfile(creature.id), 'secondary', `Ouvrir le profil 5d6 de ${creature.name}`));
    const detail = profile ? profileCaption(profile.card)
      : `Référence ${creatureReference(creature.source)?.name || creature.source.id} · ${referenceVersion(creature.source.version)}`;
    return record(creature.name, detail, controls);
  }));
  renderFresque();
}

function sceneOptions(select, scenes) {
  const selected = select.value;
  select.replaceChildren(...scenes.map((scene) => {
    const option = node('option', scene.title);
    option.value = scene.id;
    return option;
  }));
  if (scenes.some((scene) => scene.id === selected)) select.value = selected;
}

function renderLinkTargets() {
  sceneOptions($('scene-link-to'), campaign.scenes.filter((scene) => scene.id !== $('scene-link-from').value));
}

function sceneCard(id) {
  return $('scene-list').querySelector(`[data-scene-id="${CSS.escape(id)}"]`);
}

function laneName(scene) {
  return campaign[FRESQUE_LANES_KEY]?.find(lane => lane.id === scene?.[FRESQUE_LANE_KEY])?.name ?? 'Sans couloir';
}

function matchesLane(scene, filter) {
  return !filter || (scene[FRESQUE_LANE_KEY] ?? '!sans') === filter;
}

function editFresqueLane(lane) {
  if (busy || !campaign) return;
  $('fresque-lane-heading').textContent = lane ? 'Renommer le couloir' : 'Créer un couloir';
  $('fresque-lane-name').value = lane?.name ?? '';
  beginEdit($('fresque-lane-form'), lane?.id, 'save-fresque-lane');
}

function renderFresqueLanes(scenes, lanes) {
  const filter = $('fresque-lane-filter');
  const selected = filter.value;
  filter.replaceChildren(new Option('Tous les couloirs', ''), new Option('Sans couloir', '!sans'),
    ...lanes.map(lane => new Option(lane.name, lane.id)));
  filter.value = lanes.length && [...filter.options].some(option => option.value === selected) ? selected : '';
  $('fresque-lane-filter-field').hidden = !lanes.length;
  $('add-fresque-lane').disabled = lanes.length >= FRESQUE_LANE_LIMIT;
  const counts = new Map();
  for (const scene of scenes) counts.set(scene[FRESQUE_LANE_KEY], (counts.get(scene[FRESQUE_LANE_KEY]) ?? 0) + 1);
  $('fresque-lane-list').replaceChildren(...lanes.map(lane => {
    const count = counts.get(lane.id) ?? 0;
    return record(lane.name, `${count} scène${count === 1 ? '' : 's'}`, [
      action('Renommer', () => editFresqueLane(lane), 'secondary', `Renommer le couloir ${lane.name}`),
      action('Supprimer', () => {
        if (busy || !window.confirm(`Supprimer « ${lane.name} » ? Ses scènes passeront dans « Sans couloir ».`)) return;
        quickCommand('remove-fresque-lane', lane.id, () => ({ id: lane.id }),
          () => $('fresque-lane-tools').querySelector('summary').focus());
      }, 'secondary', `Supprimer le couloir ${lane.name}`),
    ]);
  }));
  const visible = scenes.filter(scene => matchesLane(scene, filter.value)).length;
  $('fresque-lane-status').hidden = !filter.value;
  $('fresque-lane-status').textContent = `${visible} scène${visible === 1 ? '' : 's'} sur ${scenes.length}${matchesLane(activeScene() ?? {}, filter.value) ? '' : ' · Scène courante hors du filtre'}`;
  return filter.value;
}

function lanePicker(scene, lanes) {
  const select = node('select');
  select.dataset.lanePicker = '';
  select.setAttribute('aria-label', `Couloir de ${scene.title}`);
  select.append(new Option('Sans couloir', ''), ...lanes.map(lane => new Option(lane.name, lane.id)));
  select.value = scene[FRESQUE_LANE_KEY] ?? '';
  select.addEventListener('change', () => {
    const laneId = select.value || null;
    select.value = scene[FRESQUE_LANE_KEY] ?? '';
    quickCommand('set-scene-lane', `${scene.id}:${laneId}`, () => ({ sceneId: scene.id, laneId }), () => {
      const card = sceneCard(scene.id);
      (card?.hidden ? $('fresque-lane-filter') : card?.querySelector('[data-lane-picker]'))?.focus();
    });
  });
  const label = node('label', 'Couloir', 'scene-lane');
  label.append(select);
  return label;
}

function revealMiniMapMarker(focus = false) {
  const strip = $('fresque-map-scroll');
  const marker = $('fresque-map-markers').querySelector('[aria-pressed="true"]');
  if (!marker || !strip.clientWidth) return;
  const bounds = strip.getBoundingClientRect();
  const position = marker.getBoundingClientRect();
  if (position.left < bounds.left || position.right > bounds.right) {
    strip.scrollLeft += position.left - bounds.left - (bounds.width - position.width) / 2;
  }
  if (focus) marker.focus({ preventScroll: true });
}

function inspectMiniMapScene(id, focus = false) {
  const scenes = campaign?.scenes ?? [];
  const index = scenes.findIndex(scene => scene.id === id);
  if (index === -1) return;
  miniMapSceneId = id;
  $('fresque-map-select').value = id;
  const current = id === campaign.activeSceneId ? ' · Scène courante' : '';
  const lane = campaign[FRESQUE_LANES_KEY]?.length ? ` · ${laneName(scenes[index])}` : '';
  $('fresque-map-selected').textContent = `${index + 1}. ${scenes[index].title}${lane}${current}`;
  for (const marker of $('fresque-map-markers').querySelectorAll('button')) {
    const selected = marker.dataset.mapScene === id;
    marker.setAttribute('aria-pressed', String(selected));
    marker.tabIndex = selected ? 0 : -1;
  }

  const positions = new Map(scenes.map((scene, position) => [scene.id, position]));
  const links = (campaign[FRESQUE_LINKS_KEY] ?? []).filter(link => link.fromId === id || link.toId === id);
  const arcs = [];
  const rows = [];
  const drawn = new Set();
  for (const { fromId, toId, label } of links) {
    const from = positions.get(fromId);
    const to = positions.get(toId);
    const outgoing = fromId === id;
    const other = outgoing ? scenes[to] : scenes[from];
    const direction = outgoing ? 'Vers' : 'Depuis';
    const detail = [campaign[FRESQUE_LANES_KEY]?.length && laneName(other), label].filter(Boolean).join(' · ');
    rows.push(record(`${direction} ${other.title}`, detail, [
      action('Repérer', () => inspectMiniMapScene(other.id, true), 'secondary', `Repérer ${other.title}`),
    ]));
    const key = `${from}:${to}`;
    if (drawn.has(key)) continue;
    drawn.add(key);
    const start = (from + .5) * miniMapStep;
    const end = (to + .5) * miniMapStep;
    const lift = Math.min(34, 16 + 4 * Math.log2(Math.abs(to - from)));
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', `M ${start} 39 Q ${(start + end) / 2} ${39 - 2 * lift} ${end} 39`);
    arc.setAttribute('marker-end', 'url(#fresque-map-arrow)');
    arcs.push(arc);
  }
  $('fresque-map-arcs').replaceChildren(...arcs);
  $('fresque-map-branches').replaceChildren(...rows);
  $('fresque-map-empty').hidden = Boolean(rows.length);
  revealMiniMapMarker(focus);
}

function renderFresqueMap(scenes, links) {
  $('fresque-minimap').hidden = !scenes.length;
  const width = Math.max(1, scenes.length) * miniMapStep;
  $('fresque-map-track').style.inlineSize = `${width}px`;
  $('fresque-map-graph').setAttribute('viewBox', `0 0 ${width} 45`);
  $('fresque-map-rail').setAttribute('x2', String(width - miniMapStep / 2));
  $('fresque-map-count').textContent = `· ${scenes.length} scène${scenes.length === 1 ? '' : 's'}`;
  const linked = new Set(links.flatMap(link => [link.fromId, link.toId]));
  $('fresque-map-select').replaceChildren(...scenes.map((scene, index) => new Option(`${index + 1} · ${scene.title}`, scene.id)));
  $('fresque-map-markers').replaceChildren(...scenes.map((scene, index) => {
    const item = node('li');
    const marker = action(String(index + 1), () => inspectMiniMapScene(scene.id), 'secondary minimap-marker', `${index + 1}. ${scene.title}`);
    marker.dataset.mapScene = scene.id;
    marker.title = scene.title;
    if (scene.id === campaign.activeSceneId) marker.setAttribute('aria-current', 'true');
    if (linked.has(scene.id)) {
      marker.dataset.linked = '';
      marker.setAttribute('aria-description', 'Scène avec embranchement');
    }
    item.append(marker);
    return item;
  }));
  if (scenes.length) {
    inspectMiniMapScene(scenes.some(scene => scene.id === miniMapSceneId) ? miniMapSceneId : campaign.activeSceneId);
  } else {
    $('fresque-map-selected').textContent = '';
    $('fresque-map-arcs').replaceChildren();
    $('fresque-map-branches').replaceChildren();
  }
}

function moveScene(scene, direction) {
  return quickCommand('move-scene', `${scene.id}:${direction}`, () => ({ id: scene.id, direction }), () => {
    const position = campaign.scenes.findIndex((entry) => entry.id === scene.id) + 1;
    setStatus(`${scene.title} · position ${position} sur ${campaign.scenes.length}`, 'saved');
    const card = sceneCard(scene.id);
    (card.querySelector(`[data-direction="${direction}"]:enabled`) || card).focus();
  });
}

function removeSceneLink(link) {
  return quickCommand('remove-scene-link', link.id, () => ({ id: link.id }), () => {
    setStatus('Embranchement retiré', 'saved');
    sceneCard(link.fromId)?.focus();
  });
}

function removeMarker(marker) {
  if (busy || !window.confirm(`Supprimer le repère « ${marker.title} » de la campagne ?`)) return;
  return quickCommand('remove-fresque-marker', marker.id, () => ({ id: marker.id }), () => {
    setStatus('Repère supprimé', 'saved');
    $(view === 'play' ? 'play-add-marker' : 'add-marker').focus();
  });
}

function markerCard(marker) {
  const card = node('li', undefined, 'marker-card');
  card.dataset.markerId = marker.id;
  card.dataset.kind = marker.kind;
  const details = node('details');
  const heading = node('summary');
  heading.append(node('span', MARKER_KINDS[marker.kind], 'marker-type'), document.createTextNode(' '), node('strong', marker.title));
  const content = node('div', undefined, 'marker-content');
  if (marker.description) {
    const description = node('p', undefined, 'narrative');
    fillReferenceText(description, marker.description);
    content.append(description);
  }
  const provenance = marker[FRESQUE_REFERENCE_KEY];
  if (provenance) {
    const attribution = node('p', markerSourceLabel(provenance), 'muted');
    const source = archiveReference(provenance);
    if (source) attribution.append(' · ', referenceLink(source, 'Ouvrir la fiche source'));
    content.append(attribution);
  }
  const controls = node('div', undefined, 'actions');
  controls.append(
    action('Modifier', () => editMarker(marker), 'text-button', `Modifier le repère ${marker.title}`),
    action('Supprimer', () => removeMarker(marker), 'text-button', `Supprimer le repère ${marker.title}`),
  );
  content.append(controls);
  details.append(heading, content);
  card.append(details);
  return card;
}

function renderFresque() {
  const scenes = campaign.scenes;
  const lanes = campaign[FRESQUE_LANES_KEY] ?? [];
  const laneFilter = renderFresqueLanes(scenes, lanes);
  $('scene-list').toggleAttribute('data-lane-filtered', Boolean(laneFilter));
  const confirmed = new Set((campaign[SESSION_ARCHIVES_KEY] ?? []).flatMap(session => session.confirmedSceneIds));
  const allMarkers = campaign[FRESQUE_MARKERS_KEY] ?? [];
  if (!allMarkers.length) $('marker-filter').value = '';
  const markerFilter = $('marker-filter').value;
  const markers = markerFilter ? allMarkers.filter(marker => marker.kind === markerFilter) : allMarkers;
  const markersByScene = new Map();
  for (const marker of markers) {
    if (!markersByScene.has(marker.sceneId)) markersByScene.set(marker.sceneId, []);
    markersByScene.get(marker.sceneId).push(marker);
  }
  const reserve = markersByScene.get(null) ?? [];
  $('marker-reserve').hidden = reserve.length === 0;
  $('marker-reserve-list').replaceChildren(...reserve.map(markerCard));
  $('marker-filter').disabled = allMarkers.length === 0;
  $('marker-filter-status').textContent = markerFilter ? `${markers.length} repère(s) affiché(s)` : '';
  $('fresque-density').disabled = scenes.length === 0 || $('scene-list').classList.contains('fresque-list-mode');
  const branches = campaign[FRESQUE_LINKS_KEY] ?? [];
  renderFresqueMap(scenes, branches);
  const links = new Map();
  for (const link of branches) {
    if (!links.has(link.fromId)) links.set(link.fromId, []);
    links.get(link.fromId).push(link);
  }
  const titles = new Map(scenes.map((scene) => [scene.id, scene.title]));
  $('fresque-help').hidden = scenes.length === 0;
  $('toggle-scene-list').hidden = scenes.length === 0;
  $('scene-link-tools').hidden = scenes.length < 2;
  sceneOptions($('scene-link-from'), scenes);
  renderLinkTargets();
  $('scene-list').replaceChildren(...scenes.map((scene, index) => {
    const current = scene.id === campaign.activeSceneId;
    const card = node('li', undefined, 'scene-card');
    card.dataset.sceneId = scene.id;
    card.hidden = !matchesLane(scene, laneFilter);
    card.tabIndex = -1;
    if (current) card.setAttribute('aria-current', 'true');

    const heading = node('div', undefined, 'scene-card-heading');
    heading.append(node('p', `Scène ${index + 1}`, 'eyebrow accent'));
    if (current) heading.append(node('span', 'Scène courante', 'badge'));
    const state = confirmed.has(scene.id)
      ? node('span', 'Jouée et confirmée', 'badge scene-state confirmed')
      : node('span', 'Préparée', 'badge scene-state');
    card.append(heading, node('h3', scene.title), state, node('p',
      `${scene.participantIds.length} participant(s)${scene.privateNotes ? ' · Notes privées' : ''}`, 'record-detail'));

    const edit = action('Modifier', () => editScene(scene), 'edit-scene secondary', `Modifier ${scene.title}`);
    const play = action('Jouer', () => selectScene(scene.id, 'play'), 'select-scene secondary', `Jouer ${scene.title}`);
    const controls = node('div', undefined, 'actions');
    const moves = node('div', undefined, 'scene-moves');
    for (const [direction, label, glyph, edge] of [
      ['left', 'gauche', '←', index === 0],
      ['right', 'droite', '→', index === scenes.length - 1],
    ]) {
      const button = action(glyph, () => moveScene(scene, direction), 'secondary', `Déplacer ${scene.title} vers la ${label}`);
      button.dataset.direction = direction;
      button.disabled = edge || Boolean(laneFilter);
      moves.append(button);
    }
    controls.append(edit, play, moves);
    card.append(controls);
    if (lanes.length) card.append(lanePicker(scene, lanes));

    const ambianceCount = scene[SCENE_AMBIANCES_KEY]?.length ?? 0;
    const ambiances = node('details', undefined, 'scene-ambiances');
    ambiances.append(node('summary', ambianceCount ? `Carnet d’ambiances · ${ambianceCount}` : 'Carnet d’ambiances'),
      ...ambianceControls(scene));
    card.append(ambiances);

    const references = sceneAdventureReferences(scene);
    if (references.length) {
      const details = node('details');
      const list = node('ul', undefined, 'adventure-references');
      list.append(...references);
      details.append(node('summary', 'Fiches de préparation'), list);
      card.append(details);
    }

    const outgoing = links.get(scene.id);
    if (outgoing) {
      const list = node('ul', undefined, 'scene-links');
      list.setAttribute('aria-label', `Embranchements depuis ${scene.title}`);
      for (const link of outgoing) {
        const title = titles.get(link.toId);
        const remove = action('Retirer', () => removeSceneLink(link), 'text-button',
          `Retirer le lien de ${scene.title} vers ${title}${link.label ? ` · ${link.label}` : ''}`);
        remove.dataset.removeLink = link.id;
        const entry = node('li');
        entry.append(node('p', `Vers ${title}`, 'record-name'));
        if (link.label) entry.append(node('p', link.label, 'record-detail'));
        entry.append(remove);
        list.append(entry);
      }
      card.append(list);
    }
    const attached = markersByScene.get(scene.id);
    if (attached) {
      const list = node('ul', undefined, 'marker-list');
      list.setAttribute('aria-label', `Repères privés de ${scene.title}`);
      list.append(...attached.map(markerCard));
      card.append(list);
    }
    return card;
  }));
}

function renderCockpitSearch() {
  const query = normalize($('cockpit-search').value.trim());
  const terms = searchTerms(query);
  const results = $('cockpit-results');
  const status = $('cockpit-search-status');
  if (!campaign || !query) {
    results.replaceChildren();
    status.textContent = '';
    return;
  }
  const sceneResults = campaign.scenes
    .filter((scene) => normalize(`${scene.title} ${scene.description}`).includes(query))
    .map((scene) => record(scene.title, scene.id === campaign.activeSceneId ? 'Scène courante' : 'Scène', [
      action('Jouer', () => selectScene(scene.id), 'secondary', `Jouer ${scene.title}`),
    ]));
  const sources = libraryEntries.filter(entry => entry.campaignId === campaign.id || entry.origin === 'archives' || entry.origin === 'demo');
  const resourceResults = (terms.length ? filterLibrary(sources, terms) : []).map(entry => {
    const open = entry.linkedImage ? () => previewResource(entry)
      : entry.kind === 'character' && !entry.record?.[PJ_SOURCE_KEY] ? () => editCharacter(entry.record)
      : entry.kind === 'creature' && entry.record && !entry.creation && !entry.record[BESTIARY_PROFILE_KEY] ? () => editCreature(entry.record)
      : () => previewResource(entry);
    const label = entry.origin === 'demo' ? 'Voir la référence' : 'Ouvrir la fiche';
    return record(entry.name, libraryEntryLabel(entry), [
      action(label, open, 'secondary', `${label} de ${entry.name}`),
    ]);
  });
  const count = sceneResults.length + resourceResults.length;
  status.textContent = count ? `${count} résultat${count === 1 ? '' : 's'}` : 'Aucun résultat pour cette recherche.';
  results.replaceChildren(...sceneResults, ...resourceResults);
}

function oppositionTargets(scene = activeScene()) {
  return scene ? actors().filter(actor => combatProfile(actor) && scene.participantIds.includes(actor.id)) : [];
}

function hitPointsLabel(current, max) {
  return `${current} / ${max} PV${current === 0 ? ' · Hors de combat' : ''}`;
}

function renderPlay() {
  renderCockpitSearch();
  const scene = activeScene();
  $('quick-notes').disabled = !scene;
  $('quick-present').disabled = !scene;
  $('quick-ambiances').disabled = !scene;
  $('prepare-scene-share').disabled = !scene;
  $('open-play-action').disabled = !scene || !playRules;
  $('journal-add-action').disabled = !scene || !playRules;
  const canOppose = Boolean(playRules && oppositionRules && oppositionTargets(scene).length);
  $('open-play-opposition').disabled = !canOppose;
  $('play-opposition-hint').hidden = !scene || canOppose;
  $('play-opposition-hint').textContent = oppositionRules ? 'Rattachez un profil 5d6 à la scène pour résoudre une opposition.' : 'Le moteur M03 est indisponible.';
  $('play-empty').hidden = Boolean(scene);
  $('play-content').hidden = !scene;
  $('play-ambiances').replaceChildren(...(scene ? ambianceControls(scene, true) : []));
  const references = sceneAdventureReferences(scene);
  $('play-adventure').hidden = !references.length;
  $('play-adventure-references').replaceChildren(...references);
  renderPlayActions(scene);
  if (!scene) {
    $('current-scene-title').textContent = '';
    $('current-scene-description').textContent = '';
    $('current-private-notes').textContent = '';
    $('participant-list').replaceChildren();
    $('play-marker-list').replaceChildren();
    return;
  }
  $('current-scene-title').textContent = scene.title;
  fillReferenceText($('current-scene-description'), scene.description || 'Aucune description pour le moment.');
  fillReferenceText($('current-private-notes'), scene.privateNotes || 'Aucune note pour le moment.');
  const markers = (campaign[FRESQUE_MARKERS_KEY] ?? []).filter(marker => marker.sceneId === scene.id);
  $('play-markers-empty').hidden = markers.length > 0;
  $('play-marker-list').replaceChildren(...markers.map(markerCard));
  sceneOptions($('jump-scene'), campaign.scenes);
  $('jump-scene').value = scene.id;
  const branches = (campaign[FRESQUE_LINKS_KEY] ?? []).filter((link) => link.fromId === scene.id);
  const sceneTitles = new Map(campaign.scenes.map((entry) => [entry.id, entry.title]));
  $('play-branches').hidden = branches.length === 0;
  $('play-branch-list').replaceChildren(...branches.map((link) => {
    const title = sceneTitles.get(link.toId);
    return record(title, link.label, [action('Jouer', () => selectScene(link.toId), 'secondary', `Jouer ${title}`)]);
  }));
  const entries = actors().filter((entry) => scene.participantIds.includes(entry.id));
  $('participants-empty').hidden = entries.length > 0;
  $('participant-list').replaceChildren(...entries.map(entry => {
    const card = combatProfile(entry);
    const detail = card ? `${profileCaption(card)} · ${hitPointsLabel(currentHitPoints(campaign, entry), card.pvMax)}`
      : entry.kind === 'PJ' ? `PJ · niveau ${entry.level}` : 'Créature · variante de campagne';
    return record(entry.name, detail, [action('Ouvrir la fiche', () => openActor(entry), 'secondary', `Ouvrir la fiche de ${entry.name}`)]);
  }));
}

function describePlayDeclaration(roll, opposition = roll.ruleset === 'm03') {
  if (!opposition) return playRules.describeDeclaration(roll);
  const attack = `${OPPOSITION_MODES[roll.impactMode]} · niveau ${roll.level}`;
  const damage = roll.impactMode === 'mental' ? '' : ` · dégâts de base ${roll.baseDamage} · pénétration ${roll.penetration}`;
  return `${attack} · ${playRules.describeDeclaration(roll, 'difficulté de base')}${damage}`;
}

function renderPlayResolution(container, actionData, guide = false, preview) {
  const { roll, combat } = actionData;
  const opposition = actionData.mode === 'opposition';
  const target = opposition ? [...campaign.characters, ...campaign.creatures].find(actor => actor.id === roll.targetId) : undefined;
  const result = preview ?? (target && oppositionRules?.resolveOpposition(roll, combatProfile(target)));
  const outcome = opposition ? (result && oppositionRules.describeOppositionResult(result)) : playRules?.resolvePlayAction(actionData);
  container.dataset.state = outcome?.state || '';
  const parts = [node('p', outcome?.title ?? 'Résolution enregistrée', 'play-verdict')];
  if (opposition) parts.push(node('p', `Cible · ${combat.targetName}`, 'muted'));
  if (roll) {
    const dice = node('ol', undefined, 'rolled-dice');
    dice.setAttribute('aria-label', 'Faces des cinq dés');
    dice.append(...roll.dice.map(face => node('li', face)));
    parts.push(dice);
    if (result) {
      const source = roll.source === 'table' ? 'Dés saisis' : 'Jet du Studio';
      parts.push(node('p', `${source} · naturel ${result.natural} · total ${result.total} / seuil ${result.threshold}`));
      parts.push(node('p', `Impact brut ${result.grossDamage} · protection ${result.protection} · pénétration effective ${result.penetrated} · absorbés ${result.absorbed}`, 'muted'));
    } else if (outcome) parts.push(node('p', `${outcome.source} · ${outcome.balance}`), node('p', outcome.bonuses, 'muted'));
  }
  if (opposition) {
    parts.push(node('p', combat.damage ? `${combat.damage} PV de dégâts proposés` : 'Aucun dégât proposé'));
    if (!guide) {
      const applied = combat.hpBefore - combat.hpAfter;
      const detail = applied ? `${applied} PV retirés · ${combat.hpBefore} → ${combat.hpAfter} PV` : `PV inchangés · ${combat.hpBefore}`;
      parts.push(node('p', detail, 'profile-health'));
      if (target) parts.push(action('Ouvrir la fiche cible', () => openCombatProfile(target.id), 'secondary'));
    }
  }
  if (guide && outcome) parts.push(node('p', outcome.advice));
  container.replaceChildren(...parts);
}

function renderPlayActions(scene) {
  const entries = scene ? (campaign[PLAY_ACTIONS_KEY] ?? []).filter(entry => entry.sceneId === scene.id).reverse() : [];
  $('play-actions-empty').hidden = entries.length > 0;
  $('play-actions-list').replaceChildren(...entries.map(entry => {
    const card = node('li');
    const details = node('details');
    const summary = node('summary');
    const date = actionDateFormat.format(new Date(entry.recordedAt));
    summary.append(node('strong', entry.intent), node('span', [entry.mode === 'opposition' && 'M03', entry.actor, date].filter(Boolean).join(' · '), 'muted'));
    const content = node('div', undefined, 'play-journal-entry');
    content.append(node('p', 'Enjeu annoncé', 'eyebrow'), node('p', entry.stakes, 'narrative'));
    if (entry.roll && playRules) content.append(node('p', describePlayDeclaration(entry.roll), 'muted'));
    const resolution = node('div', undefined, 'play-resolution');
    renderPlayResolution(resolution, entry);
    content.append(resolution, node('p', 'Conséquence retenue', 'eyebrow'), node('p', entry.consequence, 'narrative'));
    details.append(summary, content);
    card.append(details);
    return card;
  }));
}

function selectedSession(sessions = orderedSessions(campaign)) {
  return sessions.find(session => session.id === selectedArchiveId) ?? sessions[0];
}

function interludeContext(entry) {
  const moment = entry.afterSceneId === null ? 'Entre deux séances' : `Après la scène « ${sceneTitle(campaign, entry.afterSceneId)} »`;
  return `${INTERLUDE_KINDS[entry.kind]} · ${moment}`;
}

function renderInterludes() {
  const entries = campaign?.[INTERLUDES_KEY] ?? [];
  const planned = entries.filter(entry => entry.result === null);
  const recorded = entries.toReversed().filter(entry => entry.result).sort((a, b) => b.result.date.localeCompare(a.result.date));
  $('interludes-empty').hidden = planned.length > 0;
  $('interlude-journal-empty').hidden = recorded.length > 0;
  $('interludes-planned').replaceChildren(...planned.map(entry => {
    const item = record(entry.title, interludeContext(entry), [
      action('Consigner', () => editInterludeResult(entry), '', `Consigner ${entry.title}`),
      action('Modifier', () => editInterlude(entry), 'secondary', `Modifier ${entry.title}`),
      action('Supprimer', () => removeInterlude(entry), 'text-button', `Supprimer ${entry.title}`),
    ]);
    if (entry.preparation) item.firstElementChild.append(node('p', entry.preparation, 'narrative'));
    return item;
  }));
  $('interlude-journal-list').replaceChildren(...recorded.map(entry => {
    const item = record(entry.title, `${formatSessionDate(entry.result.date)} · ${interludeContext(entry)}`, [
      action('Corriger le résultat', () => editInterludeResult(entry), 'secondary', `Corriger le résultat de ${entry.title}`),
    ]);
    item.firstElementChild.append(node('p', entry.result.notes, 'narrative'));
    if (entry.preparation) {
      const details = node('details');
      details.append(node('summary', 'Notes de préparation'), node('p', entry.preparation, 'narrative'));
      item.firstElementChild.append(details);
    }
    return item;
  }));
}

function renderArchive() {
  const sessions = orderedSessions(campaign);
  const selected = selectedSession(sessions);
  $('archives-empty').hidden = sessions.length > 0;
  $('archive-detail').hidden = !selected;
  $('archive-history').replaceChildren(...sessions.map(session => {
    const open = action('Ouvrir', () => {
      selectedArchiveId = session.id;
      renderArchive();
      $('archive-detail-title').focus();
    }, 'secondary', `Ouvrir la séance ${session.title}`);
    if (session.id === selected?.id) open.setAttribute('aria-current', 'true');
    return record(session.title, formatSessionDate(session.date), [open]);
  }));
  if (!selected) return;
  $('archive-date').textContent = formatSessionDate(selected.date);
  $('archive-detail-title').textContent = selected.title;
  $('archive-resume').textContent = `Point de reprise à la clôture · ${sceneTitle(campaign, selected.resumeSceneId) || 'Aucune scène'}`;
  $('archive-summary').textContent = selected.privateSummary || 'Aucun résumé privé.';
  $('archive-next').textContent = selected.nextSession || 'Aucun repère enregistré.';
  $('confirmed-empty').hidden = selected.confirmedSceneIds.length > 0;
  $('archive-confirmed').replaceChildren(...selected.confirmedSceneIds.map(id => node('li', sceneTitle(campaign, id))));
  const hasChronicle = Boolean(selected.chronicle.trim());
  const approved = selected.chronicleApproved;
  $('chronicle-state').textContent = approved ? 'Approuvée' : hasChronicle ? 'Brouillon à relire' : 'Chronique vide';
  $('chronicle-state').dataset.approved = String(approved);
  $('chronicle-preview').textContent = hasChronicle ? selected.chronicle : 'Ajoutez un texte dans cette archive.';
  $('approve-chronicle').hidden = approved;
  $('approve-chronicle').disabled = !hasChronicle;
  $('revoke-chronicle').hidden = !approved;
  $('copy-chronicle').disabled = !approved;
  $('download-chronicle').disabled = !approved;
}

function openActor(entry) {
  const resource = campaignEntry(entry.id);
  if (resource?.linkedImage || combatProfile(entry)) previewResource(resource);
  else if (entry.kind === 'PJ') editCharacter(entry);
  else editCreature(entry);
}

function openCombatProfile(id) {
  const entry = campaignEntry(id);
  if (combatProfile(entry?.record)) previewResource(entry);
}

function campaignEntry(id, campaignId = campaign?.id) {
  return libraryEntries.find(entry => entry.campaignId === campaignId && entry.id === id);
}

function resourceArt(entry, detail = false) {
  const art = node('figure', undefined, 'catalogue-art');
  if (entry.art?.map) art.classList.add('map-art');
  const remote = entry.art?.remote;
  if (remote) art.classList.add('remote-art');
  const fallback = node('span', entry.symbol ?? '◇', 'catalogue-art-fallback');
  fallback.setAttribute('aria-hidden', 'true');
  art.append(fallback);
  if (!entry.art) return art;

  const illustration = node('img', undefined, 'catalogue-illustration');
  illustration.alt = entry.art.alt;
  illustration.width = 900;
  illustration.height = 600;
  illustration.loading = detail ? 'eager' : 'lazy';
  illustration.decoding = 'async';
  if (remote) illustration.referrerPolicy = 'no-referrer';
  const hideIllustration = () => {
    illustration.hidden = true;
    if (remote && detail) {
      art.classList.add('image-unavailable');
      fallback.removeAttribute('aria-hidden');
      fallback.textContent = 'Image indisponible. Vérifiez le lien direct.';
    }
  };
  illustration.addEventListener('load', () => {
    illustration.decode().then(() => {
      art.classList.add('has-image');
      fallback.hidden = true;
    }, hideIllustration);
  }, { once: true });
  illustration.addEventListener('error', hideIllustration, { once: true });
  illustration.src = entry.art.src;
  art.append(illustration);
  return art;
}

function referenceVersion(version) {
  return /^[a-f0-9]{40}$/.test(String(version)) ? `révision ${version.slice(0, 8)}` : `v${version}`;
}

function plainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function referenceLink(entry, label = entry.name) {
  const link = node('a', label);
  link.href = `#fiche/${encodeURIComponent(entry.id)}`;
  link.addEventListener('click', event => {
    if (!plainClick(event)) return;
    event.preventDefault();
    previewResource(entry);
  });
  return link;
}

function campaignReference(key, campaignId = campaign?.id) {
  const id = key?.trim().toLowerCase();
  return libraryReference(key) ?? libraryEntries.find(entry => (entry.creation || (entry.kind === 'image' && entry.record)) &&
    entry.campaignId === campaignId && entry.id === id);
}

function fillReferenceText(container, content, campaignId = campaign?.id) {
  container.replaceChildren(...referenceSegments(content, key => campaignReference(key, campaignId)).map(({ text, entry }) => entry
    ? referenceLink(entry, text) : document.createTextNode(text)));
}

function scenePreparationEntries(scene) {
  const source = scene?.[ADVENTURE_SCENE_KEY];
  if (!source) return [];
  return [source.adventureId, ...source.referenceIds].map(id => campaignReference(id)).filter(Boolean);
}

function sceneAdventureReferences(scene) {
  return scenePreparationEntries(scene).map(entry => {
    const item = node('li');
    item.append(referenceLink(entry));
    return item;
  });
}

function libraryEntryLabel(entry) {
  const profile = entry.record?.[BESTIARY_PROFILE_KEY];
  const category = profile?.card.kind === 'pnj' ? 'PNJ'
    : entry.origin === 'demo' && entry.kind === 'creature' ? 'Créature fictive' : LIBRARY_CATEGORIES[entry.kind];
  const level = entry.kind === 'character' ? ` · niveau ${entry.level}` : '';
  return `${category}${level} · ${LIBRARY_SOURCES[entry.origin]}`;
}

function markerSourceLabel(provenance) {
  if (provenance.sourceSchema === LIBRARY_SOURCE_SCHEMAS.archives) {
    const source = archiveReference(provenance);
    const label = source ? `Provenance · Archives · ${source.name}` : 'Provenance déclarée · Archives';
    return `${label} · ${provenance.sourceId} · révision ${provenance.sourceVersion.slice(0, 8)}`;
  }
  const sourceCampaign = campaigns.find(entry => entry.id === provenance.sourceCampaignId);
  const source = sourceCampaign?.[FRESQUE_MARKERS_KEY]?.find(marker => marker.id === provenance.sourceId);
  const title = source && sourceCampaign.revision === provenance.sourceVersion ? ` · ${source.title}` : '';
  return `Provenance · ${sourceCampaign?.name ?? 'Campagne source absente de ce profil'} · révision ${provenance.sourceVersion}${title}`;
}

function libraryEntryContext(entry) {
  if (entry.origin === 'archives') return `${entry.group} · ${entry.id} · ${referenceVersion(entry.version)}`;
  if (entry.origin === 'demo') return `Référence illustrée · version ${entry.version}`;
  if (entry.creation) return `${entry.campaignName} · ${entry.group}`;
  if (Object.hasOwn(MARKER_KINDS, entry.kind)) return `${entry.campaignName} · ${entry.sceneTitle ?? 'Réserve de repères'}`;
  return entry.campaignName;
}

function previewResource(entry, remember = true) {
  if (!entry || busy) return;
  const dialog = $('resource-dialog');
  if (!dialog.open) resourceTrail = [];
  else if (remember && resourceEntry?.id !== entry.id) resourceTrail.push(resourceEntry);
  resourceEntry = entry;
  $('resource-previous').hidden = !resourceTrail.length;
  $('resource-kind').textContent = libraryEntryLabel(entry);
  $('resource-title').textContent = entry.name;
  $('resource-status').textContent = LIBRARY_STATUSES[entry.status];
  $('resource-status').dataset.status = entry.status;
  $('resource-context').textContent = libraryEntryContext(entry);
  const art = $('resource-art');
  art.replaceChildren(...(entry.art ? [resourceArt(entry, true)] : []));
  art.hidden = !entry.art;
  art.classList.toggle('resource-map', Boolean(entry.art?.map));
  const imageLink = $('resource-image-link');
  imageLink.hidden = !entry.art;
  if (entry.art) imageLink.href = entry.art.src;
  else imageLink.removeAttribute('href');
  const scope = entry.campaignId ?? campaign?.id;
  fillReferenceText($('resource-description'), entry.description || '', scope);
  $('resource-description').hidden = !entry.description;
  const details = $('resource-details');
  details.replaceChildren(...(entry.details ?? []).flatMap(([label, value]) => {
    const description = node('dd');
    fillReferenceText(description, value, scope);
    return [node('dt', label), description];
  }));
  details.hidden = !entry.details?.length;
  const privateNotes = entry.creation ? entry.record.notes : '';
  const notes = $('resource-creation-notes');
  notes.hidden = !privateNotes;
  notes.open = false;
  fillReferenceText($('resource-creation-notes-text'), privateNotes, scope);
  const profile = entry.record?.[BESTIARY_PROFILE_KEY];
  const pjSource = entry.record?.[PJ_SOURCE_KEY];
  const sheet = $('resource-profile');
  sheet.hidden = !profile && !pjSource;
  sheet.replaceChildren();
  if (profile) {
    const hp = entry.campaignId === campaign?.id ? currentHitPoints(campaign, entry.record) : undefined;
    sheet.append(bestiaryRules ? buildProfileSheet(profile, false, hp) : node('p', 'Moteur du Bestiaire indisponible.', 'muted'));
  }
  if (pjSource) {
    const hp = entry.campaignId === campaign?.id ? currentHitPoints(campaign, entry.record) : pjSource.pv;
    sheet.append(pjRules ? buildPJSheet(pjSource, hp) : node('p', 'Moteur M02 indisponible.', 'muted'));
  }
  const creatureSource = entry.kind === 'creature' ? entry.record?.source : undefined;
  const creatureOrigin = creatureReference(creatureSource);
  const markerOrigin = archiveReference(entry.provenance);
  const adventureSource = entry.record?.[ADVENTURE_SOURCE_KEY];
  const provenance = adventureSource ? adventureSourceLabel(adventureSource) : entry.provenance ? markerSourceLabel(entry.provenance) : creatureSource
    ? `Provenance · ${creatureOrigin?.name ?? creatureSource.id} · ${referenceVersion(creatureSource.version)}` : '';
  $('resource-provenance').textContent = provenance;
  $('resource-provenance').hidden = !provenance;
  const link = $('resource-source-link');
  const href = entry.href ?? markerOrigin?.href ?? creatureOrigin?.href;
  link.hidden = !href;
  if (href) link.href = href;
  else link.removeAttribute('href');

  const actions = [];
  const add = (label, onClick, disabled = false) => {
    const button = action(label, () => {
      dialog.close();
      onClick();
    });
    button.disabled = disabled;
    actions.push(button);
  };
  const illustration = libraryIllustration(entry);
  if (illustration) add('Préparer la projection de l’image', () => prepareImageShare(illustration));
  if (entry.kind === 'creature' && !entry.record) add('Copier dans la campagne', () => copyCreature(entry), !campaign);
  if (markerCopyProvenance(entry)) {
    add(entry.origin === 'archives' ? 'Créer une variante' : 'Copier comme repère',
      () => editMarker(undefined, view === 'play' ? activeScene()?.id : null, entry), !campaign);
  }
  if (entry.record && entry.campaignId === campaign?.id) {
    if (entry.kind === 'image') {
      add('Modifier le lien de l’image', () => editLinkedImage(entry.record));
      add('Retirer l’image', () => removeLinkedImage(entry));
    } else if (entry.creation) {
      add('Modifier la création', () => openCreation(entry.kind, entry.record));
      add('Ajouter comme repère', () => editMarker(undefined, view === 'play' ? activeScene()?.id : null, undefined, entry));
      if (entry.kind === 'adventure') {
        const first = campaign.scenes.find(scene => scene[ADVENTURE_SCENE_KEY]?.adventureId === entry.id);
        if (first) add('Voir les scènes dans la Fresque', () => focusSceneCard(first.id));
        else add('Préparer la Fresque', () => openAdventurePlan(entry));
      }
      if (bestiaryRules && ['npc', 'creature'].includes(entry.kind)) add('Préremplir un profil 5d6', () => prefillWorkshop(entry));
    } else if (entry.kind === 'character') add('Modifier le PJ', () => editCharacter(entry.record));
    else if (entry.kind === 'creature') add(profile?.card.kind === 'pnj' ? 'Modifier le PNJ' : 'Modifier la créature', () => editCreature(entry.record));
    else add('Modifier le repère', () => editMarker(entry.record));
    if (canIllustrate(entry)) {
      add(entry.linkedImage ? 'Modifier l’image liée' : 'Ajouter une image par lien', () => editLinkedImage(entry.linkedImage, entry));
    }
    if (pjSource) add('Préparer la fiche joueur', () => preparePlayerShare(entry.record.id));
    if ((profile || pjSource) && playRules && view === 'play' && activeScene()) {
      add('Préparer un jet 5d6', () => editPlayAction({ attacker: entry.record }));
      if (oppositionRules && activeScene().participantIds.includes(entry.record.id)) {
        add('Cibler en opposition', () => editPlayAction({ mode: 'opposition', targetId: entry.record.id }));
      }
    }
  } else if (entry.record) {
    add('Ouvrir la campagne source', () => openCampaign(entry.campaignId, 'library'));
  }
  if (entry.protocol) add('Ouvrir le protocole de jeu', () => $('play-protocol-dialog').showModal());
  $('resource-actions').replaceChildren(...actions);
  const related = [...new Set([...(entry.links ?? []), markerOrigin?.id, creatureOrigin?.id])]
    .map(key => campaignReference(key, scope)).filter(Boolean);
  if (entry.kind === 'image' && entry.record?.targetId) {
    const target = campaignEntry(entry.record.targetId, entry.campaignId);
    if (target) related.push(target);
  }
  $('resource-related').hidden = !related.length;
  $('resource-related-list').replaceChildren(...related.map(target => {
    const item = node('li');
    item.append(referenceLink(target));
    return item;
  }));
  $('resource-markdown').hidden = Boolean(entry.record && !entry.creation && entry.kind !== 'image');
  $('resource-shortcut').value = $('resource-markdown').hidden ? '' : `[[${entry.id}]]`;
  $('resource-shortcut-status').textContent = '';
  if (!dialog.open) dialog.showModal();
  else $('resource-title').focus();
  dialog.scrollTop = 0;
}

function shelfIcon(path) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  const line = document.createElementNS(namespace, 'path');
  line.setAttribute('d', path);
  icon.append(line);
  return icon;
}

function followShelf(event, shelf) {
  if (!plainClick(event)) return;
  event.preventDefault();
  if (!busy) openLibraryShelf(shelf);
}

function renderLibraryShelves() {
  $('library-shelves').replaceChildren(...Object.entries(LIBRARY_SHELVES).map(([id, shelf]) => {
    const link = node('a', undefined, 'library-shelf');
    link.href = `#rayon/${id}`;
    link.addEventListener('click', event => followShelf(event, id));
    const count = libraryEntries.filter(entry => inLibraryShelf(entry, id)).length;
    const meta = node('span', undefined, 'shelf-meta');
    meta.append(shelfIcon(shelf.icon), node('span', `${count} fiche${count === 1 ? '' : 's'}`, 'eyebrow'));
    link.append(meta, node('strong', shelf.name), node('span', shelf.detail, 'muted'));
    return link;
  }));
}

function renderCreationDirectory() {
  $('creations-context').textContent = campaign
    ? `Préparez des fiches privées pour ${campaign.name}. Retrouvez-les dans les rayons de la bibliothèque.`
    : 'Ouvrez une campagne pour commencer à créer des fiches.';
  const groups = new Map();
  for (const [kind, type] of Object.entries(CREATION_TYPES)) {
    if (!groups.has(type.area)) groups.set(type.area, []);
    const card = node('article', undefined, 'library-shelf creation-card');
    const button = action(`Créer · ${type.label}`, () => openCreation(kind), 'secondary');
    button.disabled = !campaign;
    card.append(shelfIcon(LIBRARY_SHELVES[type.shelf].icon), node('h3', type.label),
      node('p', type.detail, 'muted'), button);
    groups.get(type.area).push(card);
  }
  $('creations-directory').replaceChildren(...[...groups].map(([title, cards]) => {
    const section = node('section', undefined, 'creation-group');
    const grid = node('div', undefined, 'library-shelves');
    grid.append(...cards);
    section.append(node('h2', title), grid);
    return section;
  }));
}

function prefillWorkshop(entry) {
  navigate('workshop');
  setWorkshopMode(false);
  const form = $('workshop-create');
  form.elements.name.value = entry.name.slice(0, 100);
  form.elements.description.value = entry.description.slice(0, 1500);
  form.elements.kind.value = entry.kind === 'npc' ? 'pnj' : 'creature';
  form.dispatchEvent(new Event('input', { bubbles: true }));
  form.elements.name.focus();
}

function renderUniverse() {
  const groups = new Map();
  for (const entry of libraryEntries.filter(entry => entry.shelf === 'univers')) {
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group).push(entry);
  }
  $('universe-topics').replaceChildren(...Array.from(groups, ([group, entries]) => {
    const section = node('section');
    const cards = node('div', undefined, 'universe-grid');
    cards.append(...entries.map(entry => {
      const card = node('article', undefined, 'panel universe-card');
      const heading = node('h3');
      heading.append(referenceLink(entry));
      card.append(node('p', LIBRARY_STATUSES[entry.status], 'eyebrow accent'), heading, node('p', entry.description, 'muted'));
      return card;
    }));
    section.append(node('h2', group), cards);
    return section;
  }));
}

function profileCaption(card) {
  if (card.ruleset === 'm02') return `PJ · M02 · niveau ${card.level}`;
  return `${card.kind === 'pnj' ? 'PNJ' : 'Créature'} · M03 · niveau ${card.level}`;
}

function profileFact(label, value, bonus) {
  const cell = node('div');
  const detail = node('dd');
  detail.append(node('strong', value));
  if (bonus !== undefined) detail.append(node('span', ` +${bonus}`, 'profile-bonus'));
  cell.append(node('dt', label), detail);
  return cell;
}

function buildPJSheet(source, hp = source.pv) {
  const sheet = node('div', undefined, 'profile-sheet');
  const heading = node('div', undefined, 'profile-heading');
  heading.append(node('p', profileCaption(source), 'eyebrow accent'), node('p', hitPointsLabel(hp, source.pvMax), 'profile-health'));
  if (typeof source.profession === 'string' && source.profession.trim()) heading.append(node('p', source.profession, 'muted'));
  const resources = node('dl', undefined, 'profile-meters');
  resources.append(profileFact('Mana', `${source.mana} / ${source.manaMax}`), profileFact('Expérience', `${source.xp} XP`));
  const stats = node('dl', undefined, 'profile-stats');
  stats.append(...Object.entries(PLAY_STATS).map(([id, label]) =>
    profileFact(label, source.stats[id], pjRules.effectiveStat(source.stats[id]))));
  sheet.append(heading, resources, stats);
  if (oppositionRules) {
    const list = node('dl', undefined, 'profile-defense');
    for (const mode of ['melee', 'magie', 'mental']) {
      const { label, threshold, protection } = oppositionRules.describeDefense(mode, source);
      list.append(profileFact(`Résistance ${label}`, threshold));
      const detail = list.lastElementChild.querySelector('dd');
      detail.append(node('p', `Protection ${protection}`, 'muted'));
    }
    const details = node('details');
    details.append(node('summary', 'Résistances et protections'), list);
    sheet.append(details);
  }
  const ranks = Object.entries(source.masteries).filter(([, rank]) => rank > 0);
  if (ranks.length) {
    const details = node('details');
    const list = node('dl', undefined, 'profile-mastery-ranks');
    list.append(...ranks.map(([name, rank]) => profileFact(name, rank, pjRules.effectiveMastery(rank))));
    details.append(node('summary', 'Maîtrises'), list);
    sheet.append(details);
  }
  const abilities = source.development.abilities;
  const inventory = Array.isArray(source.inventory) ? source.inventory.filter(item => typeof item?.name === 'string' && item.name.trim()) : [];
  for (const [title, items, format] of [
    ['Capacités de la fiche', abilities, ability => `${ability.name} · rang ${ability.rank} · ${ability.approvedByGM ? 'Approbation dans la source' : 'À valider'}`],
    ['Inventaire source', inventory, item => `${item.name}${Number.isSafeInteger(item.quantity) && item.quantity > 0 ? ` × ${item.quantity}` : ''}`],
  ]) {
    if (!items.length) continue;
    const details = node('details');
    const list = node('ul', undefined, 'profile-inventory');
    list.append(...items.map(item => node('li', format(item))));
    details.append(node('summary', title), list);
    sheet.append(details);
  }
  const story = [
    ['Origines', source.lifeSummary],
    ['Transmission', pjRules.EDUCATION_PATHS.find(option => option.id === source.education)?.label],
    ['Lecture', pjRules.LITERACY_LEVELS.find(option => option.id === source.literacy)?.label],
    ['Histoire personnelle', source.backstory],
    ['Liens et mentors', source.connections],
    ['But', source.goal],
  ].filter(([, value]) => typeof value === 'string' && value.trim());
  if (story.length) {
    const details = node('details');
    details.append(node('summary', 'Parcours et récit'));
    for (const [label, value] of story) {
      details.append(node('p', label, 'eyebrow pj-guide-hint'), node('p', value, 'narrative'));
    }
    sheet.append(details);
  }
  return sheet;
}

function buildProfileSheet(profile, showIdentity = true, hp) {
  const { BESTIARY_LABELS: labels, profileView } = bestiaryRules;
  const data = profileView(profile);
  const sheet = node('div', undefined, 'profile-sheet');
  const heading = node('div', undefined, 'profile-heading');
  heading.append(node('p', profileCaption(data), 'eyebrow accent'));
  if (showIdentity) heading.append(node('h3', data.name));
  heading.append(node('p', `${labels[data.archetype]} · ${labels[data.role]} · ${profile.origin === 'imported' ? 'Source importée' : 'Profil composé dans le Studio'}`, 'muted'));
  if (data.profession) heading.append(node('p', data.profession, 'muted'));
  if (showIdentity && data.description) heading.append(node('p', data.description, 'narrative'));
  if (hp !== undefined) heading.append(node('p', hitPointsLabel(hp, data.pvMax), 'profile-health'));

  const resources = node('dl', undefined, 'profile-meters');
  resources.append(profileFact('PV maximum', data.pvMax), profileFact('Mana maximum', data.manaMax));
  const stats = node('dl', undefined, 'profile-stats');
  stats.append(...data.stats.map(stat => {
    const fact = profileFact(stat.title, stat.raw, stat.bonus);
    fact.dataset.stat = stat.id;
    return fact;
  }));
  const defenses = node('details');
  const values = node('dl', undefined, 'profile-defense');
  values.append(...data.defenses.map(defense => {
    const entry = node('div');
    entry.append(node('dt', labels[defense.kind]), node('dd', `Seuil ${defense.threshold}`), node('dd', `Absorption ${defense.absorption}`));
    return entry;
  }));
  defenses.append(node('summary', 'Résistances et absorptions'), values);
  const attack = node('details');
  const attackFacts = node('dl', undefined, 'profile-defense');
  attackFacts.append(profileFact('Dégâts de base', data.attack.baseDamage), profileFact('Pénétration', data.attack.penetration),
    profileFact('Bonus d’impact', `+${data.attack.impactBonus}`));
  attack.append(node('summary', 'Attaque de référence'), attackFacts);
  sheet.append(heading, resources, stats, defenses, attack);
  if (data.masteries.length) {
    const masteries = node('details');
    const ranks = node('dl', undefined, 'profile-mastery-ranks');
    ranks.append(...data.masteries.map(mastery => profileFact(mastery.name, mastery.rank, mastery.bonus)));
    masteries.append(node('summary', 'Maîtrises'), ranks);
    sheet.append(masteries);
  }
  if (data.abilities.length) {
    const abilities = node('details');
    const list = node('ul', undefined, 'profile-abilities');
    list.append(...data.abilities.map(ability => {
      const item = node('li');
      item.append(node('strong', ability.name), node('p', ability.description, 'narrative'));
      if (ability.limitations) item.append(node('p', ability.limitations, 'muted'));
      if (!ability.approvedByGM) item.append(node('p', 'Validation MJ requise', 'muted'));
      return item;
    }));
    abilities.append(node('summary', 'Capacités déclarées'), list);
    sheet.append(abilities);
  }
  if (profile.card.notes.trim()) {
    const notes = node('details');
    notes.append(node('summary', 'Notes source · Privé MJ'), node('p', profile.card.notes, 'narrative'));
    sheet.append(notes);
  }
  return sheet;
}

function renderWorkshop() {
  const profile = workshopDraft?.profile;
  $('workshop-empty').hidden = Boolean(profile);
  $('workshop-sheet').replaceChildren(...(profile ? [buildProfileSheet(profile)] : []));
  $('workshop-save').disabled = !campaign || !profile || Boolean(workshopDraft?.savedTo);
  if (workshopDraft?.savedTo) $('workshop-destination').textContent = `Profil ajouté · ${workshopDraft.savedTo}`;
  else $('workshop-destination').textContent = campaign ? `Destination · ${campaign.name}` : 'Ouvrez une campagne pour y ajouter le profil.';
}

function showWorkshopError(message = '') {
  $('workshop-error').textContent = message;
  $('workshop-error').hidden = !message;
}

function setWorkshopMode(importing) {
  const currentMode = $('workshop-mode-import').getAttribute('aria-pressed') === 'true';
  if (busy || currentMode === importing) return;
  workshopRead += 1;
  workshopDraft = undefined;
  $('workshop-create').hidden = importing;
  $('workshop-import').hidden = !importing;
  $('workshop-mode-create').setAttribute('aria-pressed', String(!importing));
  $('workshop-mode-import').setAttribute('aria-pressed', String(importing));
  $('workshop-file').value = '';
  showWorkshopError();
  renderWorkshop();
}

function previewWorkshopProfile(profile) {
  workshopDraft = { profile, instanceId: crypto.randomUUID() };
  showWorkshopError();
  renderWorkshop();
  if (view === 'workshop') $('workshop-preview-title').focus();
}

async function inspectWorkshopFile() {
  const request = ++workshopRead;
  if (!bestiaryRules || busy) return;
  const input = $('workshop-file');
  const file = input.files[0];
  workshopDraft = undefined;
  showWorkshopError();
  renderWorkshop();
  if (!file) return;
  try {
    if (file.size > bestiaryRules.MAX_PROFILE_BYTES) throw new Error('Ce profil dépasse 512 Kio.');
    const text = await file.text();
    if (request === workshopRead) previewWorkshopProfile(bestiaryRules.importProfile(text));
  } catch (error) {
    if (request !== workshopRead) return;
    input.value = '';
    showWorkshopError(error.message);
  }
}

function saveWorkshopProfile() {
  const attempt = workshopDraft;
  if (!campaign || busy || !attempt || attempt.savedTo) return;
  const { profile } = attempt;
  const { card } = profile;
  const command = commandFor(attempt, campaign.id, campaign.revision, 'save-bestiary-profile', {
    id: attempt.instanceId, name: card.name.trim(), description: card.description,
    source: { id: card.id, version: BESTIARY_SCHEMA }, profile,
  });
  return saveCommand(command, { onSaved: () => {
    attempt.savedTo = campaign.name;
    renderWorkshop();
    setStatus(`${card.name.trim()} · profil sauvegardé`, 'saved');
    $('workshop-preview-title').focus();
  } });
}

function setLibraryLayout(layout, persist = false) {
  const useList = layout === 'list';
  $('catalogue-list').dataset.layout = useList ? 'list' : 'cards';
  $('library-layout-list').setAttribute('aria-pressed', String(useList));
  $('library-layout-cards').setAttribute('aria-pressed', String(!useList));
  if (persist) {
    try { localStorage.setItem('entre-rives:affichage-bibliotheque', useList ? 'list' : 'cards'); } catch { /* préférence facultative */ }
  }
}

function openLibraryShelf(shelf = '', origin = '') {
  if (shelf && shelf !== 'tout' && !Object.hasOwn(LIBRARY_SHELVES, shelf)) return;
  libraryShelf = shelf;
  libraryPage = 0;
  for (const id of ['search', 'group', 'type', 'origin', 'status', 'level']) $(`catalogue-${id}`).value = '';
  $('catalogue-origin').value = origin;
  $('catalogue-filters').open = !matchMedia('(max-width: 37rem)').matches;
  navigate('library');
}

function refreshShelfGroups(entries) {
  const groups = libraryShelf && libraryShelf !== 'tout' ? [...new Set(entries.map(entry => entry.group))] : [];
  const select = $('catalogue-group');
  if (groups.length !== select.options.length - 1 || groups.some((group, index) => select.options[index + 1].value !== group)) {
    const previous = select.value;
    select.replaceChildren(select.options[0], ...groups.map(group => {
      const option = node('option', group);
      option.value = group;
      return option;
    }));
    select.value = groups.includes(previous) ? previous : '';
  }
  $('catalogue-group-field').hidden = groups.length < 2;
  $('catalogue-level-field').hidden = Boolean(libraryShelf && !['campagne', 'tout'].includes(libraryShelf));
}

function renderLibrary() {
  const query = $('catalogue-search').value.trim();
  const shelf = LIBRARY_SHELVES[libraryShelf];
  const browsing = Boolean(libraryShelf || query);
  $('view-library').setAttribute('aria-labelledby', libraryShelf ? 'library-shelf-title' : 'library-title');
  $('library-overview').hidden = Boolean(libraryShelf);
  $('library-shelf-header').hidden = !libraryShelf;
  $('library-universe').hidden = Boolean(libraryShelf);
  $('library-shelf-title').textContent = shelf?.name ?? 'Toutes les fiches';
  $('library-shelf-description').textContent = shelf?.detail ?? 'Références des Archives, démonstrations et fiches du MJ.';
  $('catalogue-search-label').textContent = shelf ? 'Chercher dans ce rayon' : 'Chercher dans toute la bibliothèque';
  $('atlas-quick-links').hidden = libraryShelf !== 'atlas';
  $('bestiary-quick-link').hidden = libraryShelf !== 'bestiaire';
  $('library-directory').hidden = browsing;
  $('catalogue-filters').hidden = !browsing;
  $('catalogue-context').hidden = !browsing;
  $('library-results').hidden = !browsing;
  $('library-add-marker').disabled = !campaign;
  $('library-add-marker').hidden = Boolean(libraryShelf && !['atlas', 'campagne', 'tout'].includes(libraryShelf));
  $('library-add-marker').textContent = libraryShelf === 'atlas' ? 'Créer un repère de lieu' : 'Créer un repère';
  $('library-add-image').hidden = libraryShelf !== 'imagerie';
  $('library-add-image').disabled = !campaign;
  $('library-import-adventure').hidden = libraryShelf !== 'aventures';
  $('library-import-adventure').disabled = !campaign;
  const suggested = CREATION_TYPES[shelfCreationKind[libraryShelf]];
  $('library-add-creation').textContent = libraryShelf === 'atlas' ? 'Créer un lieu'
    : suggested ? `Créer · ${suggested.label}` : 'Atelier de création';
  $('library-add-creation').disabled = Boolean(suggested && !campaign);
  if (!browsing) {
    $('catalogue-list').replaceChildren();
    renderLibraryShelves();
    return;
  }
  const scoped = libraryEntries.filter(entry => inLibraryShelf(entry, libraryShelf));
  refreshShelfGroups(scoped);
  const filters = {
    kind: $('catalogue-type').value, origin: $('catalogue-origin').value, level: $('catalogue-level').value,
    status: $('catalogue-status').value, group: $('catalogue-group').value,
  };
  const activeFilters = Object.values(filters).filter(Boolean).length;
  $('catalogue-filter-summary').textContent = activeFilters ? `Filtres de recherche · ${activeFilters}` : 'Filtres de recherche';
  const entries = filterLibrary(scoped, searchTerms(query), filters);
  const pages = Math.max(1, Math.ceil(entries.length / libraryPageSize));
  libraryPage = Math.min(Math.max(0, libraryPage), pages - 1);
  const start = libraryPage * libraryPageSize;
  const pageLabel = pages > 1 ? ` · page ${libraryPage + 1} sur ${pages}` : '';
  $('catalogue-pages').hidden = pages < 2;
  $('catalogue-previous').disabled = libraryPage === 0;
  $('catalogue-next').disabled = libraryPage === pages - 1;
  $('catalogue-context').textContent = libraryShelf === 'imagerie'
    ? (campaign ? `Les nouveaux liens d’images sont enregistrés dans ${campaign.name}.` : 'Ouvrez une campagne pour ajouter une image par lien.')
    : (campaign ? `Destination des copies · ${campaign.name}` : 'Ouvrez une campagne pour y copier une fiche ou créer un repère.');
  $('catalogue-count').textContent = `${entries.length} fiche${entries.length === 1 ? '' : 's'}${pageLabel}`;
  $('catalogue-empty').hidden = entries.length > 0;
  const copies = new Map();
  for (const creature of campaign?.creatures ?? []) {
    const { id } = creature.source;
    copies.set(id, (copies.get(id) ?? 0) + 1);
  }
  $('catalogue-list').replaceChildren(...entries.slice(start, start + libraryPageSize).map(entry => {
    const card = node('article', undefined, 'panel catalogue-card');
    card.dataset.origin = entry.origin;
    const controls = node('div', undefined, 'actions catalogue-actions');
    controls.append(action('Voir la fiche', () => previewResource(entry), 'secondary', `Voir la fiche de ${entry.name}`));
    if (entry.kind === 'creature' && !entry.record) {
      const copy = action('Copier dans la campagne', () => copyCreature(entry), 'secondary', `Copier ${entry.name} dans la campagne`);
      copy.disabled = !campaign;
      copy.dataset.copyCreature = entry.id;
      if (entry.id === DEMO_CREATURES[0].id) copy.id = 'copy-creature';
      controls.append(copy);
    }
    if (entry.art && (!entry.record || entry.art.remote)) card.append(resourceArt(entry));
    const copy = node('div', undefined, 'catalogue-card-copy');
    copy.append(node('p', libraryEntryLabel(entry), 'eyebrow accent'), node('h2', entry.name));
    if ((!entry.record || entry.creation) && entry.description) copy.append(node('p', entry.description));
    const context = libraryEntryContext(entry);
    const count = copies.get(entry.id) ?? 0;
    const status = node('span', LIBRARY_STATUSES[entry.status], 'badge library-status');
    status.dataset.status = entry.status;
    copy.append(status, node('p', entry.kind === 'creature' && !entry.record && campaign ? `${context} · ${count} copie(s) ici` : context, 'muted'), controls);
    card.append(copy);
    return card;
  }));
}

function render() {
  libraryEntries = buildLibraryIndex(campaigns);
  $('active-campaign').textContent = campaign?.name || 'Aucune campagne ouverte';
  for (const section of campaignViews) $(`nav-${section}`).disabled = !campaign;
  $('export-backup').disabled = !campaign;
  $('export-context').textContent = campaign ? `Campagne active · ${campaign.name}` : 'Ouvrez une campagne pour l’exporter.';
  renderCampaigns();
  if (view === 'library') renderLibrary();
  if (view === 'creations') renderCreationDirectory();
  if (view === 'workshop') renderWorkshop();
  if (campaign) renderPrepare();
  renderPlay();
  renderInterludes();
  renderArchive();
}

function setCampaign(next) {
  if (campaign?.revision !== next.revision || campaign?.id !== next.id) revokePlayerShare();
  if (campaign?.revision !== next.revision || campaign?.id !== next.id) linkDraft = undefined;
  if (campaign?.id !== next.id) {
    selectedArchiveId = undefined;
    $('cockpit-search').value = '';
    $('scene-link-form').reset();
    $('scene-link-tools').open = false;
    $('fresque-lane-tools').open = false;
    $('fresque-lane-filter').value = '';
    $('fresque-minimap').open = false;
    $('fresque-map-scroll').scrollLeft = 0;
    $('marker-filter').value = '';
  }
  if (campaign?.id !== next.id || campaign?.activeSceneId !== next.activeSceneId) {
    miniMapSceneId = next.activeSceneId;
    revokeProjection();
  }
  campaign = next;
  campaigns = [next, ...campaigns.filter((entry) => entry.id !== next.id)];
  remember(next.id);
  render();
}

function notifySave() {
  setStatus('Sauvegarde locale confirmée', 'saved');
  notifications?.postMessage('saved');
}

async function openCampaign(id, destination = 'prepare') {
  if (!store || busy) return;
  busy = true;
  clearError();
  try {
    const next = await store.get(id);
    if (!next) throw new Error('Cette campagne ne se trouve plus dans ce profil.');
    await loadCampaignInventory();
    revokeProjection();
    revokePlayerShare();
    setCampaign(next);
    navigate(destination);
    setStatus(`Campagne ouverte · révision ${next.revision}`, 'saved');
  } catch (error) {
    showError(error);
  } finally {
    busy = false;
  }
}

async function refreshCampaign() {
  if (campaign) await openCampaign(campaign.id, view);
}

function commandFor(attempt, id, revision, type, data) {
  const signature = JSON.stringify({ id, revision, type, data });
  if (attempt.signature !== signature) {
    attempt.signature = signature;
    attempt.command = { id, operationId: crypto.randomUUID(), expectedRevision: revision, type, data };
  }
  return attempt.command;
}

async function saveCommand(command, { form, onSaved } = {}) {
  if (!store || busy) return;
  busy = true;
  const controls = form ? Array.from(form.elements).filter(control => 'disabled' in control && !control.disabled) : [];
  const focused = document.activeElement;
  for (const control of controls) control.disabled = true;
  clearError();
  if (form?.closest('dialog')) form.querySelector('.form-feedback').hidden = true;
  setStatus('Sauvegarde en cours…');
  try {
    const next = await store.execute(command);
    setCampaign(next);
    notifySave();
    onSaved?.();
  } catch (error) {
    showError(error, form?.closest('dialog') ? form : null);
  } finally {
    busy = false;
    for (const control of controls) control.disabled = false;
    if (form?.contains(focused) && focused.getClientRects().length) focused.focus();
  }
}

function quickCommand(type, target, data, onSaved) {
  if (!campaign || busy) return;
  if (quickDraft?.type !== type || quickDraft.target !== target || quickDraft.id !== campaign.id) {
    quickDraft = { type, target, id: campaign.id, newId: crypto.randomUUID() };
  }
  const command = commandFor(quickDraft, campaign.id, campaign.revision, type, data(quickDraft.newId));
  return saveCommand(command, { onSaved: () => {
    quickDraft = undefined;
    onSaved?.();
  } });
}

function copyCreature(entry) {
  const description = entry.details?.map(([label, value]) => `${label} · ${value}`).join('\n\n') || entry.description;
  return quickCommand('copy-creature', entry.id, (id) => ({
    id, name: entry.name, description, source: { id: entry.id, version: entry.version },
  }), () => {
    setStatus(`${entry.name} · copie sauvegardée`, 'saved');
    const focus = view === 'play' ? $('cockpit-search')
      : $('catalogue-list').querySelector(`[data-copy-creature="${CSS.escape(entry.id)}"]`) ?? $('catalogue-search');
    focus.focus();
  });
}

async function selectScene(id, destination) {
  if (!campaign || busy) return;
  if (id === campaign.activeSceneId) {
    if (destination) navigate(destination);
    return;
  }
  revokeProjection();
  revokeSceneShare();
  await quickCommand('select-scene', id, () => ({ id }), () => {
    if (destination) navigate(destination);
    else $('jump-scene').focus();
  });
  if (activeScene()) $('jump-scene').value = activeScene().id;
}

function beginEdit(form, id, type, provenance) {
  draft = { id: id || crypto.randomUUID(), campaignId: campaign.id, revision: campaign.revision, type, dirty: false, provenance };
  form.querySelector('.form-feedback').hidden = true;
  form.closest('dialog').showModal();
}

function canIllustrate(entry) {
  return entry.record && (entry.creation || ['character', 'creature'].includes(entry.kind));
}

function editLinkedImage(image, target) {
  if (!campaign || busy) return;
  const form = $('linked-image-form');
  $('linked-image-heading').textContent = image ? 'Modifier l’image liée' : 'Ajouter une image par lien';
  form.elements.url.value = image?.url ?? '';
  form.elements.url.setCustomValidity('');
  form.elements.name.value = image?.name ?? (target ? `Illustration · ${target.name}`.slice(0, 160) : '');
  form.elements.name.setCustomValidity('');
  form.elements.alt.value = image?.alt ?? '';
  form.elements.origin.value = image?.origin ?? 'unknown';
  form.elements.credit.value = image?.credit ?? '';
  const targets = libraryEntries.filter(entry => entry.campaignId === campaign.id && canIllustrate(entry) &&
    (!entry.linkedImage || entry.linkedImage.id === image?.id));
  form.elements.targetId.replaceChildren(new Option('Image indépendante', ''),
    ...targets.map(entry => new Option(`${entry.name} · ${LIBRARY_CATEGORIES[entry.kind]}`, entry.id)));
  form.elements.targetId.value = image?.targetId ?? target?.id ?? '';
  beginEdit(form, image?.id ?? `image-link-${crypto.randomUUID()}`, 'save-linked-image');
}

function removeLinkedImage(entry) {
  if (busy) return;
  if (!window.confirm(`Retirer « ${entry.name} » de l’imagerie ?`)) {
    previewResource(entry);
    return;
  }
  return quickCommand('remove-linked-image', entry.id, () => ({ id: entry.id }), () => {
    $(view === 'library' && libraryShelf ? 'library-shelf-title' : `${view}-title`).focus();
  });
}

function ambianceControls(scene, playing = false) {
  const entries = scene[SCENE_AMBIANCES_KEY] ?? [];
  const add = action('Ajouter une ambiance', () => editAmbiance(scene));
  add.dataset.ambianceAdd = '';
  add.disabled = entries.length >= SCENE_AMBIANCE_LIMIT;
  if (!entries.length) return [add, node('p', 'Aucune ambiance préparée pour cette scène.', 'muted')];
  const list = node('ul', undefined, 'record-list ambiance-list');
  for (const entry of entries) {
    const controls = [];
    if (playing) controls.push(action('Préparer', event => prepareSceneShare(event, entry), 'secondary', `Préparer l’ambiance ${entry.name}`));
    controls.push(
      action('Modifier', () => editAmbiance(scene, entry), 'text-button', `Modifier l’ambiance ${entry.name}`),
      action('Supprimer', () => removeAmbiance(scene, entry), 'text-button', `Supprimer l’ambiance ${entry.name}`),
    );
    const image = LIBRARY_ILLUSTRATIONS.find(illustration => illustration.id === entry.imageId);
    const summary = [entry.title && 'Titre', entry.description && 'Texte',
      entry.imageId && (image?.name ?? 'Image indisponible')].filter(Boolean).join(' · ');
    const item = record(entry.name, summary, controls);
    item.dataset.ambianceId = entry.id;
    list.append(item);
  }
  return add.disabled ? [add, node('p', `Limite de ${SCENE_AMBIANCE_LIMIT} ambiances atteinte.`, 'muted'), list] : [add, list];
}

function ambianceFocus(sceneId, ambianceId) {
  const scope = view === 'play' ? $('play-ambiances') : sceneCard(sceneId)?.querySelector('.scene-ambiances');
  if (scope?.tagName === 'DETAILS') scope.open = true;
  const entry = ambianceId && scope?.querySelector(`[data-ambiance-id="${CSS.escape(ambianceId)}"] button`);
  return entry || scope?.querySelector('[data-ambiance-add]:enabled') || $(`${view}-title`);
}

function editAmbiance(scene, ambiance) {
  if (busy || !campaign) return;
  const form = $('ambiance-form');
  $('ambiance-heading').textContent = ambiance ? 'Modifier une ambiance' : 'Ajouter une ambiance';
  $('ambiance-context').textContent = `Scène · ${scene.title}`;
  form.elements.name.value = ambiance?.name ?? '';
  form.elements.title.value = ambiance?.title ?? '';
  form.elements.description.value = ambiance?.description ?? '';
  populateIllustrations(form.elements.imageId, LIBRARY_ILLUSTRATIONS, sceneIllustrations(scene), ambiance?.imageId);
  beginEdit(form, ambiance?.id, 'save-scene-ambiance');
  draft.ambianceSceneId = scene.id;
}

function removeAmbiance(scene, ambiance) {
  if (busy || !window.confirm(`Supprimer l’ambiance « ${ambiance.name} » de cette scène ?`)) return;
  return quickCommand('remove-scene-ambiance', `${scene.id}:${ambiance.id}`, () => ({
    sceneId: scene.id, id: ambiance.id,
  }), () => {
    setStatus('Ambiance supprimée', 'saved');
    ambianceFocus(scene.id).focus();
  });
}

function renderCreationFields(kind, details = {}) {
  $('creation-specific-fields').replaceChildren(...CREATION_TYPES[kind].fields.map(({ key, label, choices }) => {
    const group = node('div');
    const caption = node('label', label);
    const input = node(choices ? 'select' : 'textarea');
    input.id = caption.htmlFor = `creation-detail-${key}`;
    input.name = `detail-${key}`;
    if (choices) {
      input.required = key === 'scale';
      input.append(new Option(input.required ? 'Choisir…' : 'À préciser', ''), ...choices.map(choice => new Option(choice, choice)));
    } else {
      input.rows = kind === 'adventure' && key === 'scenes' ? 4 : 2;
      input.maxLength = 2000;
    }
    input.value = details[key] ?? '';
    group.append(caption, input);
    return group;
  }));
  $('creation-parent-field').hidden = $('creation-parent').disabled = kind !== 'place';
}

function readCreationDetails(kind, fields) {
  return Object.fromEntries(CREATION_TYPES[kind].fields.map(({ key }) => [key, fields.get(`detail-${key}`).trim()]));
}

function renderCreationLinks() {
  const select = $('creation-link-select');
  const links = draft.creationLinks;
  const items = libraryEntries.filter(entry => (!entry.record || (entry.creation && entry.campaignId === campaign.id)) &&
    entry.id !== draft.id && !links.includes(entry.id));
  const groups = new Map();
  for (const entry of items) {
    const title = entry.creation ? 'Créations de cette campagne' : LIBRARY_SHELVES[entry.shelf]?.name ?? 'Univers';
    if (!groups.has(title)) {
      const group = node('optgroup');
      group.label = title;
      groups.set(title, group);
    }
    groups.get(title).append(new Option(entry.name, entry.id));
  }
  select.replaceChildren(new Option('Choisir une fiche…', ''), ...groups.values());
  select.disabled = links.length >= 12 || !items.length;
  $('creation-add-link').disabled = true;
  $('creation-link-list').replaceChildren(...links.map(id => {
    const entry = campaignReference(id);
    const remove = action('Retirer', () => {
      draft.creationLinks = links.filter(link => link !== id);
      draft.dirty = true;
      renderCreationLinks();
      $('creation-link-select').focus();
    }, 'secondary', `Retirer le lien vers ${entry?.name ?? id}`);
    return record(entry?.name ?? id, entry ? libraryEntryLabel(entry) : 'Fiche indisponible', [remove]);
  }));
}

function openCreation(kind, existing) {
  if (!campaign || busy) return;
  const form = $('creation-form');
  form.reset();
  $('creation-name').setCustomValidity('');
  $('creation-title').textContent = existing ? 'Modifier une création' : 'Créer une fiche';
  const select = $('creation-kind');
  select.replaceChildren(...Object.entries(CREATION_TYPES).map(([id, type]) => new Option(type.label, id)));
  select.value = kind;
  select.disabled = Boolean(existing);
  const states = $('creation-state');
  states.replaceChildren(...Object.entries(CREATION_STATES).map(([id, label]) => new Option(label, id)));
  states.value = existing?.state ?? 'draft';
  form.elements.name.value = existing?.name ?? '';
  form.elements.description.value = existing?.description ?? '';
  form.elements.notes.value = existing?.notes ?? '';
  const parent = $('creation-parent');
  parent.replaceChildren(new Option('Aucun lieu parent', ''), ...(campaign[CREATIONS_KEY] ?? [])
    .filter(entry => entry.kind === 'place' && entry.id !== existing?.id)
    .map(entry => new Option(`${entry.name} · ${entry.details.scale}`, entry.id)));
  parent.value = existing?.parentId ?? '';
  $('creation-link-tools').open = Boolean(existing?.links.length);
  renderCreationFields(kind, existing?.details);
  beginEdit(form, existing?.id ?? `creation-${crypto.randomUUID()}`, 'save-creation');
  draft.creationLinks = [...(existing?.links ?? [])];
  draft.creationKind = kind;
  draft.creationDetails = new Map();
  renderCreationLinks();
}

function focusSceneCard(id) {
  navigate('prepare', false);
  let card = sceneCard(id);
  if (card?.hidden) {
    $('fresque-lane-filter').value = '';
    renderFresque();
    card = sceneCard(id);
  }
  if (card) {
    card.scrollIntoView({ block: 'nearest', inline: 'center' });
    card.focus({ preventScroll: true });
  } else $('prepare-title').focus();
  return card ?? $('prepare-title');
}

function adventureSourceLabel(source) {
  return `${source.reference} · version ${source.version}`;
}

function openAdventureImport() {
  if (!campaign || busy) return;
  const form = $('adventure-import-form');
  form.reset();
  $('adventure-import-context').textContent = `Campagne de destination · ${campaign.name}`;
  $('adventure-import-status').textContent = '';
  $('adventure-import-preview').hidden = true;
  $('adventure-import-submit').disabled = true;
  beginEdit(form, undefined, 'import-adventure');
}

function renderAdventureImport(bundle) {
  const cards = new Map(bundle.creations.map(entry => [entry.id, entry]));
  const titles = new Map(bundle.scenes.map(scene => [scene.id, scene.title]));
  const adventure = cards.get(bundle.adventureId);
  $('adventure-import-name').textContent = adventure.name;
  $('adventure-import-source').textContent = adventureSourceLabel(bundle.source);
  $('adventure-import-audience').textContent = adventure.details.audience;
  $('adventure-import-hook').textContent = adventure.description || adventure.details.hook;
  $('adventure-import-resume').textContent = campaign.activeSceneId ? 'Le point de reprise de la campagne sera conservé.'
    : 'La première scène de l’aventure deviendra le point de reprise.';

  const scenes = node('ol');
  scenes.append(...bundle.scenes.map(scene => {
    const item = node('li');
    item.append(node('strong', scene.title));
    if (scene.description) item.append(node('p', scene.description, 'narrative'));
    if (scene.privateNotes) item.append(node('p', `Notes MJ · ${scene.privateNotes}`, 'narrative'));
    if (scene.referenceIds.length) {
      item.append(node('p', `Fiches liées · ${scene.referenceIds.map(id => cards.get(id).name).join(' · ')}`, 'muted'));
    }
    return item;
  }));
  const preparation = $('adventure-import-preparation');
  preparation.replaceChildren(node('p', adventure.notes, 'narrative'), node('h4', 'Scènes'), scenes);
  if (bundle.links.length) {
    const links = node('ul');
    links.append(...bundle.links.map(({ fromId, toId, label }) =>
      node('li', `${titles.get(fromId)} → ${titles.get(toId)}${label ? ` · ${label}` : ''}`)));
    preparation.append(node('h4', 'Embranchements'), links);
  }
  if (adventure.details.outcomes) preparation.append(node('h4', 'Issues possibles'), node('p', adventure.details.outcomes, 'narrative'));
  preparation.closest('details').open = false;
  $('adventure-import-preview').hidden = false;
}

async function inspectAdventureImport() {
  const attempt = draft;
  if (attempt?.type !== 'import-adventure' || busy) return;
  const request = attempt.adventureRequest = Symbol();
  const file = $('adventure-import-file').files[0];
  const form = $('adventure-import-form');
  const status = $('adventure-import-status');
  attempt.adventureBundle = undefined;
  $('adventure-import-preview').hidden = true;
  $('adventure-import-submit').disabled = true;
  form.querySelector('.form-feedback').hidden = true;
  status.textContent = file ? 'Lecture du fichier…' : '';
  if (!file) return;
  try {
    if (file.size > MAX_ADVENTURE_PACKAGE_BYTES) throw new Error('Choisissez un fichier d’aventure de 512 Kio ou moins.');
    const text = await file.text();
    if (draft !== attempt || request !== attempt.adventureRequest) return;
    const bundle = readAdventurePackage(text);
    renderAdventureImport(bundle);
    if (importedAdventure(campaign, bundle.source.id)) {
      status.textContent = 'Cette aventure est déjà importée dans cette campagne.';
    } else {
      attempt.adventureBundle = bundle;
      $('adventure-import-submit').disabled = false;
      status.textContent = `Scènes · ${bundle.scenes.length} | Fiches liées · ${bundle.creations.length - 1} | Embranchements · ${bundle.links.length}`;
    }
    $('adventure-import-name').focus();
  } catch (error) {
    if (draft === attempt && request === attempt.adventureRequest) {
      status.textContent = '';
      showError(error, form);
    }
  }
}

function showAdventureReview(reviewing) {
  const input = $('adventure-plan-input');
  const review = $('adventure-plan-review-panel');
  input.hidden = input.disabled = reviewing;
  review.hidden = review.disabled = !reviewing;
  $('adventure-plan-form').querySelector('.form-feedback').hidden = true;
  $(reviewing ? 'adventure-plan-preview-title' : 'adventure-milestones').focus();
}

function openAdventurePlan(entry) {
  if (!campaign || busy) return;
  const form = $('adventure-plan-form');
  form.reset();
  $('adventure-plan-rows').replaceChildren();
  $('adventure-milestones').value = entry.record.details.scenes;
  $('adventure-plan-context').textContent = `${entry.name} · ${campaign.name}. Ajoutez jusqu’à ${ADVENTURE_SCENE_LIMIT} scènes à la fin de la Fresque.`;
  showAdventureReview(false);
  beginEdit(form, entry.id, 'plan-adventure');
  draft.adventureLinks = entry.record.links.map(id => campaignReference(id)).filter(Boolean);
  $('adventure-plan-link-hint').hidden = draft.adventureLinks.length > 0;
}

function adventurePlanRow({ title, privateNotes }, index, links) {
  const row = node('details', undefined, 'adventure-row');
  row.open = index === 0;
  const summary = node('summary', `${index + 1} · ${title || 'Titre à préciser'}`);
  const content = node('div', undefined, 'adventure-row-fields');
  for (const [key, label, value, max] of [
    ['title', 'Titre partageable', title, 160],
    ['description', 'Texte partageable', '', 8000],
    ['privateNotes', 'Notes privées du MJ', privateNotes, 8000],
  ]) {
    const control = node(key === 'title' ? 'input' : 'textarea');
    const caption = node('label', label);
    control.name = control.id = caption.htmlFor = `adventure-${key}-${index}`;
    control.value = value;
    control.maxLength = max;
    if (key === 'title') {
      control.required = true;
      control.addEventListener('input', () => {
        control.setCustomValidity('');
        summary.textContent = `${index + 1} · ${control.value.trim() || 'Titre à préciser'}`;
      });
    } else control.rows = 2;
    content.append(caption, control);
  }
  if (links.length) {
    const references = node('fieldset', undefined, 'checks');
    references.append(node('legend', 'Fiches à garder sous la main'));
    for (const entry of links) {
      const label = node('label');
      const choice = node('input');
      choice.type = 'checkbox';
      choice.name = `adventure-references-${index}`;
      choice.value = entry.id;
      label.append(choice, document.createTextNode(`${entry.name} · ${LIBRARY_CATEGORIES[entry.kind]}`));
      references.append(label);
    }
    content.append(references);
  }
  row.append(summary, content);
  return row;
}

function reviewAdventurePlan() {
  if (busy || !draft) return;
  const text = $('adventure-milestones').value;
  const scenes = adventureMilestones(text);
  if (!scenes.length || scenes.length > ADVENTURE_SCENE_LIMIT) {
    showError(new Error(`Saisissez entre 1 et ${ADVENTURE_SCENE_LIMIT} jalons, un par ligne.`), $('adventure-plan-form'));
    return;
  }
  if (draft.milestones !== text) {
    draft.milestones = text;
    draft.sceneIds = scenes.map(() => crypto.randomUUID());
    $('adventure-plan-rows').replaceChildren(...scenes.map((scene, index) => adventurePlanRow(scene, index, draft.adventureLinks)));
  }
  const total = scenes.length === 1 ? '1 scène' : `${scenes.length} scènes`;
  $('adventure-plan-preview-title').textContent = `${total} à préparer · ${campaign.activeSceneId ? 'Le point de reprise est conservé.' : 'La première scène devient le point de reprise.'}`;
  $('adventure-plan-add').textContent = `Ajouter ${total} à la Fresque`;
  showAdventureReview(true);
}

function adventurePlanData(fields, adventureId, attempt) {
  if ($('adventure-plan-review-panel').disabled || !attempt.sceneIds) return undefined;
  for (const [index] of attempt.sceneIds.entries()) {
    const control = $(`adventure-title-${index}`);
    const title = control.value.trim();
    if (!title || title.length > 160) {
      control.closest('details').open = true;
      control.setCustomValidity('Saisissez un titre de 1 à 160 caractères.');
      control.reportValidity();
      return undefined;
    }
  }
  const scenes = attempt.sceneIds.map((id, index) => ({
    id, title: fields.get(`adventure-title-${index}`).trim(),
    description: fields.get(`adventure-description-${index}`).trim(),
    privateNotes: fields.get(`adventure-privateNotes-${index}`).trim(),
    referenceIds: fields.getAll(`adventure-references-${index}`),
  }));
  return { adventureId, chain: fields.has('chain'), scenes };
}

function editCharacter(character) {
  if (!campaign || busy) return;
  const form = $('character-form');
  $('character-heading').textContent = character ? 'Modifier un PJ' : 'Ajouter un PJ';
  form.elements.name.value = character?.name || '';
  form.elements.level.value = character?.level ?? campaign.startingLevel;
  form.elements.level.readOnly = Boolean(character?.[PJ_SOURCE_KEY]);
  form.elements.notes.value = character?.notes || '';
  beginEdit(form, character?.id, 'save-character');
}

function guidedChoice(id, title, options, introduction = '') {
  const wrapper = node('div');
  const label = node('label', title);
  const select = node('select');
  const hint = node('p', introduction, 'muted pj-guide-hint');
  select.id = label.htmlFor = `pj-guide-${id}`;
  select.name = id;
  select.required = true;
  hint.id = `${select.id}-hint`;
  select.setAttribute('aria-describedby', hint.id);
  select.append(new Option('Choisir…', ''), ...options.map(option => new Option(option.label, option.id)));
  select.addEventListener('change', () => {
    const option = options.find(option => option.id === select.value);
    hint.textContent = option?.description ?? option?.help ?? introduction;
  });
  wrapper.append(label, select, hint);
  return wrapper;
}

function showGuidedReview(reviewing) {
  const choices = $('pj-guide-choices');
  choices.hidden = choices.disabled = reviewing;
  $('pj-guide-review-panel').hidden = !reviewing;
}

function showFreeReview(reviewing) {
  const choices = $('pj-free-choices');
  choices.hidden = choices.disabled = reviewing;
  $('pj-free-review-panel').hidden = !reviewing;
}

function pjNumberField(key, title, value, min, max) {
  const wrapper = node('div');
  const label = node('label', title);
  const input = node('input');
  input.id = label.htmlFor = `pj-free-${key}`;
  input.name = key;
  input.type = 'number';
  input.required = true;
  input.min = min;
  input.max = max;
  input.defaultValue = value;
  wrapper.append(label, input);
  return wrapper;
}

function openFreePJ() {
  if (!campaign || !pjRules || busy) return;
  const form = $('pj-free-form');
  form.reset();
  $('pj-free-name').setCustomValidity('');
  $('pj-free-level').value = campaign.startingLevel;
  $('pj-free-stats').replaceChildren(...Object.entries(PLAY_STATS).map(([stat, label]) => {
    const group = node('fieldset', undefined, 'protocol-step');
    const values = node('div', undefined, 'creation-fields pj-stat-pair');
    const initial = pjNumberField(`base-${stat}`, `${label} de départ`, 3, 1, 5);
    const target = pjNumberField(`final-${stat}`, `${label} finale`, 3, 1, Number.MAX_SAFE_INTEGER);
    const baseInput = initial.querySelector('input');
    const finalInput = target.querySelector('input');
    let previous = baseInput.value;
    baseInput.addEventListener('input', () => {
      if (!baseInput.validity.valid) return;
      if (finalInput.value === previous || finalInput.valueAsNumber < baseInput.valueAsNumber) finalInput.value = baseInput.value;
      previous = baseInput.value;
    });
    values.append(initial, target);
    group.append(node('legend', label), values);
    return group;
  }));
  $('pj-free-training').open = false;
  $('pj-free-story').open = false;
  $('pj-free-masteries').replaceChildren(...pjRules.FREE_PJ_MASTERIES.map(key =>
    pjNumberField(`mastery-${key}`, freeMasteryLabels[key] ?? key[0].toUpperCase() + key.slice(1), 0, 0, Number.MAX_SAFE_INTEGER)));
  $('pj-free-preview').replaceChildren();
  showFreeReview(false);
  updateFreeBudget(form);
  beginEdit(form, undefined, 'attach-pj-source');
}

const freeMasteryLabels = { negociation: 'Négociation', resistance_magique: 'Résistance magique', volonte: 'Volonté' };

function freePJBuild(fields) {
  const numbers = (prefix, keys) => Object.fromEntries(keys.map(key => [key, Number(fields.get(`${prefix}-${key}`) || NaN)]));
  const stats = Object.keys(PLAY_STATS);
  const masteries = numbers('mastery', pjRules.FREE_PJ_MASTERIES);
  return pjRules.buildFreePJ({
    level: Number(fields.get('level')), startingStats: numbers('base', stats), stats: numbers('final', stats),
    masteries: Object.fromEntries(Object.entries(masteries).filter(([, rank]) => rank !== 0)),
  });
}

function updateFreeBudget(form) {
  const status = $('pj-free-budget');
  try {
    const budget = pjRules.evaluatePJ(freePJBuild(new FormData(form)));
    status.textContent = `Budget M02 · ${budget.spent} / ${budget.budget} points.${budget.valid ? '' : ` ${budget.issues.join(' ')}`}`;
  } catch {
    status.textContent = 'Choisissez un niveau entre 1 et 25 pour calculer le budget M02.';
  }
}

function reviewFreePJ() {
  if (!draft || busy) return;
  const form = $('pj-free-form');
  const name = $('pj-free-name');
  name.setCustomValidity(name.value.trim() ? '' : 'Saisissez un nom pour le PJ.');
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  try {
    const { source, budget } = pjRules.createFreePJ(freePJBuild(fields), {
      id: `studio-pj-${draft.id}`, name: name.value.trim(), profession: fields.get('profession').trim(),
      backstory: fields.get('backstory').trim(), connections: fields.get('connections').trim(), goal: fields.get('goal').trim(),
    });
    $('pj-free-preview').replaceChildren(node('h3', source.name),
      node('p', `Budget M02 · ${budget.spent} / ${budget.budget} points · ${budget.remaining} en réserve`, 'muted'), buildPJSheet(source));
    draft.freeSource = source;
    draft.dirty = true;
    showFreeReview(true);
    form.querySelector('.form-feedback').hidden = true;
    $('pj-free-preview-title').focus();
  } catch (error) { showError(error, form); }
}

function openGuidedPJ() {
  if (!campaign || !pjRules || busy) return;
  const form = $('pj-guide-form');
  form.reset();
  $('pj-guide-name').setCustomValidity('');
  form.querySelector('.pj-guide-story').open = false;
  $('pj-guide-steps').replaceChildren(...pjRules.ORIGIN_STEPS.map(step =>
    guidedChoice(step.id, step.title, step.options, step.question)));
  $('pj-guide-training').replaceChildren(
    guidedChoice('education', 'Transmission et éducation', pjRules.EDUCATION_PATHS),
    guidedChoice('literacy', 'Lecture et écriture', pjRules.LITERACY_LEVELS),
  );
  $('pj-guide-preview').replaceChildren();
  $('pj-guide-level').textContent = campaign.startingLevel === 5
    ? 'Ce parcours prépare un aventurier de niveau 5 pour cette campagne.'
    : `La campagne propose le niveau ${campaign.startingLevel} au départ. Le parcours historique prépare un aventurier de niveau 5.`;
  showGuidedReview(false);
  beginEdit(form, undefined, 'attach-pj-source');
}

function reviewGuidedPJ() {
  if (!draft || busy) return;
  const form = $('pj-guide-form');
  const name = $('pj-guide-name');
  name.setCustomValidity(name.value.trim() ? '' : 'Saisissez un nom pour le PJ.');
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  try {
    const source = pjRules.createGuidedPJ({
      id: `studio-origines-${draft.id}`, name: name.value.trim(),
      choices: pjRules.ORIGIN_STEPS.map(step => fields.get(step.id)),
      education: fields.get('education'), literacy: fields.get('literacy'),
      backstory: fields.get('backstory').trim(), connections: fields.get('connections').trim(), goal: fields.get('goal').trim(),
    });
    const budget = pjRules.evaluatePJ(source);
    if (!budget.valid) throw new Error(budget.issues.join(' '));
    $('pj-guide-preview').replaceChildren(node('h3', source.name),
      node('p', `Budget M02 · ${budget.spent} / ${budget.budget} points`, 'muted'), buildPJSheet(source));
    draft.guidedSource = source;
    draft.dirty = true;
    showGuidedReview(true);
    form.querySelector('.form-feedback').hidden = true;
    $('pj-guide-preview-title').focus();
  } catch (error) { showError(error, form); }
}

function openPJImport() {
  if (!campaign || !pjRules || busy) return;
  const form = $('pj-import-form');
  form.reset();
  $('pj-import-status').textContent = '';
  $('pj-import-source').replaceChildren();
  $('pj-import-destination').replaceChildren(new Option('Créer un nouveau PJ', ''), ...campaign.characters
    .filter(character => !character[PJ_SOURCE_KEY])
    .map(character => new Option(`Rattacher à ${character.name}`, character.id)));
  beginEdit(form, undefined, 'attach-pj-source');
  renderPJImport();
}

function renderPJImport() {
  const source = draft?.pjSources?.[$('pj-import-source').value];
  $('pj-import-selection').hidden = !draft?.pjSources?.length;
  const preview = $('pj-import-preview');
  preview.replaceChildren();
  $('pj-import-submit').disabled = true;
  if (!source) return;
  const budget = pjRules.evaluatePJ(source);
  preview.append(node('h3', source.name), buildPJSheet(source),
    node('p', `Budget M02 · ${budget.spent} / ${budget.budget}`, 'muted'));
  if (!budget.valid) preview.append(node('p', budget.issues.join(' '), 'notice error'));
  $('pj-import-submit').disabled = !budget.valid;
}

async function inspectPJImport() {
  const attempt = draft;
  if (attempt?.type !== 'attach-pj-source' || busy) return;
  const request = attempt.pjRequest = Symbol();
  const file = $('pj-import-file').files[0];
  attempt.pjSources = [];
  $('pj-import-source').replaceChildren();
  renderPJImport();
  const status = $('pj-import-status');
  status.textContent = file ? 'Lecture de l’export…' : '';
  if (!file) return;
  try {
    if (file.size > pjRules.MAX_PJ_FILE_BYTES) throw new Error('Choisissez un export de 2 Mio ou moins.');
    const text = await file.text();
    if (draft !== attempt || request !== attempt.pjRequest) return;
    const { sheets, skipped } = pjRules.readPJExport(text);
    attempt.pjSources = sheets;
    const select = $('pj-import-source');
    select.replaceChildren(new Option('Choisir une fiche', ''), ...sheets.map((source, index) =>
      new Option(`${source.name} · niveau ${source.level} · ${source.id}`, String(index))));
    if (sheets.length === 1) select.value = '0';
    status.textContent = `${sheets.length} fiche(s) PJ M02 lisible(s)${skipped ? ` · ${skipped} autre(s) entrée(s) écartée(s)` : ''}`;
    renderPJImport();
  } catch (error) {
    if (draft === attempt && request === attempt.pjRequest) status.textContent = error.message;
  }
}

function editCreature(creature) {
  if (!campaign || busy) return;
  const form = $('creature-form');
  $('creature-heading').textContent = creature[BESTIARY_PROFILE_KEY]?.card.kind === 'pnj' ? 'Adapter le PNJ' : 'Adapter la créature';
  form.elements.name.value = creature.name;
  form.elements.description.value = creature.description;
  const reference = creatureReference(creature.source);
  $('creature-source').textContent = creature[BESTIARY_PROFILE_KEY] ? `Provenance · Profil M03 · ${creature.source.id}`
    : `Provenance · ${reference?.name || creature.source.id} · ${referenceVersion(creature.source.version)}`;
  const art = $('creature-art');
  const illustration = reference?.art ? resourceArt(reference) : null;
  art.hidden = !illustration;
  art.replaceChildren();
  if (illustration) art.append(illustration);
  beginEdit(form, creature.id, 'save-creature');
}

function editScene(scene, { improvised = false } = {}) {
  if (!campaign || busy) return;
  if (scene?.id === campaign.activeSceneId) {
    revokeProjection();
    revokeSceneShare();
  }
  const form = $('scene-form');
  $('scene-heading').textContent = improvised ? 'Improviser une scène' : scene ? 'Modifier une scène' : 'Créer une scène';
  form.elements.title.value = scene?.title || '';
  form.elements.description.value = scene?.description || '';
  form.elements.privateNotes.value = scene?.privateNotes || '';
  const first = !campaign.activeSceneId;
  const destination = $('improvise-destination');
  $('improvise-options').hidden = !improvised;
  $('improvise-first-scene').hidden = !first;
  destination.disabled = !improvised;
  destination.options[0].disabled = first;
  destination.value = first ? 'play' : 'reserve';
  const options = actors().map((entry) => {
    const label = node('label');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'participantIds';
    checkbox.value = entry.id;
    checkbox.checked = scene?.participantIds.includes(entry.id) || false;
    label.append(checkbox, document.createTextNode(`${entry.name} · ${entry.kind}`));
    return label;
  });
  $('scene-participant-options').replaceChildren(...(options.length ? options : [node('p', 'Les PJ et créatures de la campagne apparaîtront ici.', 'muted')]));
  beginEdit(form, scene?.id, improvised ? 'improvise-scene' : 'save-scene');
}

function editMarker(marker, sceneId = null, entry, creation) {
  if (!campaign || busy) return;
  const form = $('marker-form');
  const provenance = entry ? markerCopyProvenance(entry) : undefined;
  if (entry && !provenance) return;
  $('marker-heading').textContent = marker ? 'Modifier un repère' : provenance ? 'Créer une variante' : 'Ajouter un repère';
  form.elements.title.value = marker?.title ?? entry?.name ?? creation?.name ?? '';
  const defaultKind = view === 'library' && libraryShelf === 'atlas' ? 'place' : 'lead';
  form.elements.kind.value = marker?.kind || entry?.kind || (creation && (creation.kind === 'place' ? 'place' : 'lead')) ||
    (view === 'prepare' && $('marker-filter').value) || defaultKind;
  form.elements.kind.disabled = provenance?.sourceSchema === LIBRARY_SOURCE_SCHEMAS.archives;
  form.elements.description.value = creation ? `[[${creation.id}]]\n${creation.description}`.slice(0, 8000)
    : marker?.description ?? entry?.description ?? '';
  const source = provenance ?? marker?.[FRESQUE_REFERENCE_KEY];
  $('marker-provenance').textContent = source ? markerSourceLabel(source) : '';
  $('marker-provenance').hidden = !source;
  const select = form.elements.sceneId;
  sceneOptions(select, campaign.scenes);
  const reserve = node('option', 'Réserve de repères');
  reserve.value = '';
  select.prepend(reserve);
  select.value = (marker ? marker.sceneId : sceneId) ?? '';
  beginEdit(form, marker?.id, provenance ? 'copy-library-marker' : 'save-fresque-marker', provenance);
}

function hidePlayStep(id, hidden) {
  const fieldset = $(id);
  fieldset.hidden = hidden;
  fieldset.disabled = hidden;
}

function updatePlayCheckFields() {
  const mode = $('play-mode').value;
  const opposition = mode === 'opposition';
  hidePlayStep('play-check-fields', !opposition && mode !== 'check');
  hidePlayStep('play-opposition-fields', !opposition);
  $('play-action-heading').textContent = opposition ? 'Arbitrer une opposition' : 'Arbitrer une action';
  $('play-parameter-legend').textContent = opposition ? 'Valeurs brutes du jet · M03' : 'Paramètres de l’action simple · M01 en essai';
  $('play-threshold-label').textContent = opposition ? 'Difficulté de base' : 'Seuil annoncé';
  $('play-threshold').min = opposition ? '15' : '0';
  $('play-threshold').max = opposition ? '30' : String(Number.MAX_SAFE_INTEGER);
  if (opposition) updatePlayTarget();
}

function chosenOppositionTarget() {
  const id = $('play-target').value;
  return oppositionTargets().find(target => target.id === id);
}

function describeTarget(target, impactMode) {
  const { label, threshold, protection } = oppositionRules.describeDefense(impactMode, combatProfile(target));
  const impact = impactMode === 'mental' ? 'effet narratif' : `protection ${protection}`;
  return `Résistance ${label} ${threshold} · ${impact}`;
}

function updatePlayTarget() {
  const impactMode = $('play-impact-mode').value;
  hidePlayStep('play-impact-values', impactMode === 'mental');
  const target = chosenOppositionTarget();
  $('play-target-info').textContent = target && oppositionRules ? describeTarget(target, impactMode) : '';
}

function updatePlayDiceSource() {
  const manual = $('play-dice-source').value === 'table';
  hidePlayStep('play-manual-dice', !manual);
  $('play-resolve').textContent = manual ? 'Lire le résultat des dés' : 'Lancer les 5d6';
}

function showPlayDeclaration() {
  hidePlayStep('play-declaration', false);
  hidePlayStep('play-dice-step', true);
  hidePlayStep('play-consequence-step', true);
  $('play-locked').hidden = true;
  $('play-resolution').hidden = true;
  $('play-resolution').replaceChildren();
  $('play-impact-confirm').hidden = true;
  $('play-apply-damage').checked = false;
  $('play-apply-damage').disabled = true;
  $('play-record').textContent = 'Consigner dans le journal';
  updatePlayCheckFields();
  updatePlayDiceSource();
}

function editPlayAction({ attacker, mode = 'check', targetId = '' } = {}) {
  const scene = activeScene();
  if (!scene || !playRules || busy || view !== 'play') return;
  const targets = oppositionTargets(scene);
  const canOppose = Boolean(oppositionRules && targets.length);
  if (mode === 'opposition' && !canOppose) return;
  const form = $('play-action-form');
  form.reset();
  for (const id of ['play-intent', 'play-stakes', 'play-consequence']) $(id).setCustomValidity('');
  $('play-action-context').textContent = `Scène courante · ${scene.title}`;
  $('play-mode').querySelector('option[value="opposition"]').disabled = !canOppose;
  $('play-mode').value = mode;
  $('play-target').replaceChildren(new Option('Choisir une cible', ''), ...targets.map(target => new Option(
    `${target.name} · ${hitPointsLabel(currentHitPoints(campaign, target), combatProfile(target).pvMax)}`, target.id,
  )));
  $('play-target').value = targetId;
  const profile = combatProfile(attacker);
  $('play-attacker-level').value = profile?.level ?? campaign.startingLevel;
  if (profile?.ruleset === 'm03') {
    $('play-base-damage').value = profile.baseDamage;
    $('play-penetration').value = profile.penetration;
  }
  const hint = $('play-profile-hint');
  hint.hidden = !profile;
  const masterySelect = $('play-profile-mastery');
  masterySelect.replaceChildren(new Option('Saisir le rang', ''));
  $('play-profile-mastery-field').hidden = !profile;
  if (profile) {
    $('play-actor').value = attacker.name;
    $('play-raw-stat').value = profile.stats[$('play-stat').value];
    hint.textContent = `Valeurs de la fiche de ${attacker.name}`;
    masterySelect.append(...Object.entries(profile.masteries).map(([name, rank]) => new Option(`${name} · rang ${rank}`, name)));
  }
  showPlayDeclaration();
  beginEdit(form, undefined, 'record-play-action');
  draft.sceneId = scene.id;
  draft.attackerProfile = profile;
}

function trimmedPlayText(id) {
  const control = $(id);
  const value = control.value.trim();
  if (!value) {
    control.setCustomValidity('Saisissez un texte pour continuer.');
    control.reportValidity();
  }
  return value;
}

function finishPlayAction(roll) {
  draft.roll = roll;
  draft.recordedAt = new Date().toISOString();
  hidePlayStep('play-dice-step', true);
  $('play-consequence-legend').textContent = `${roll ? '3' : '2'} · Consigner la conséquence`;
  hidePlayStep('play-consequence-step', false);
  const resolution = $('play-resolution');
  let result;
  let combat;
  if (roll?.ruleset === 'm03') {
    const target = draft.target;
    result = oppositionRules.resolveOpposition(roll, combatProfile(target));
    const hpBefore = currentHitPoints(campaign, target);
    const canApply = result.damage > 0 && hpBefore > 0;
    combat = { targetName: target.name, damage: result.damage, hpBefore };
    $('play-impact-confirm').hidden = !canApply;
    $('play-apply-damage').disabled = !canApply;
    $('play-impact-change').textContent = `${target.name} · ${hpBefore} → ${hitPointsAfterDamage(hpBefore, result.damage)} PV`;
  }
  renderPlayResolution(resolution, { ...draft.declaration, roll, combat }, true, result);
  resolution.hidden = false;
  resolution.focus();
}

function lockPlayDeclaration() {
  if (draft?.type !== 'record-play-action' || busy || draft.declaration) return;
  const form = $('play-action-form');
  const intent = trimmedPlayText('play-intent');
  if (!intent) return;
  const stakes = trimmedPlayText('play-stakes');
  if (!stakes || !form.reportValidity()) return;
  const fields = new FormData(form);
  const mode = fields.get('mode');
  const target = mode === 'opposition' ? chosenOppositionTarget() : undefined;
  if (mode === 'opposition' && !target) return;
  const actor = fields.get('actor').trim();
  draft.declaration = { sceneId: draft.sceneId, actor, intent, stakes, mode };
  draft.dirty = true;
  const parameters = target || mode === 'check' ? {
    stat: fields.get('stat'), rawStat: Number(fields.get('rawStat')), masteryRank: Number(fields.get('masteryRank')),
    situation: Number(fields.get('situation')), threshold: Number(fields.get('threshold')),
  } : null;
  if (target) {
    Object.assign(parameters, {
      targetId: target.id, impactMode: fields.get('impactMode'), level: Number(fields.get('level')),
      baseDamage: Number(fields.get('baseDamage') ?? 6), penetration: Number(fields.get('penetration') ?? 0),
    });
    draft.type = 'record-opposition';
  }
  draft.target = target;
  draft.parameters = parameters;
  $('play-locked-intent').textContent = actor ? `${actor} · ${intent}` : intent;
  $('play-locked-stakes').textContent = stakes;
  $('play-locked-parameters').hidden = !parameters;
  $('play-locked-parameters').textContent = parameters ? describePlayDeclaration(parameters, Boolean(target)) : '';
  $('play-locked-target').hidden = !target;
  $('play-locked-target').textContent = target ? `${target.name} · ${describeTarget(target, parameters.impactMode)}` : '';
  hidePlayStep('play-declaration', true);
  $('play-locked').hidden = false;
  if (parameters) {
    hidePlayStep('play-dice-step', false);
    $('play-dice-source').focus();
  } else {
    finishPlayAction(null);
  }
}

function resolvePlayDice() {
  if (busy || !draft?.parameters || draft.recordedAt) return;
  const form = $('play-action-form');
  if (!form.reportValidity()) return;
  const source = $('play-dice-source').value;
  const dice = source === 'table'
    ? Array.from({ length: 5 }, (_, index) => form.elements[`die${index + 1}`].valueAsNumber)
    : playRules.studioDice();
  finishPlayAction({ ruleset: draft.type === 'record-opposition' ? 'm03' : 'm01', source, ...draft.parameters, dice });
}

function todayForForm() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map(part => String(part).padStart(2, '0')).join('-');
}

function editInterlude(entry) {
  if (!campaign || busy) return;
  const form = $('interlude-form');
  $('interlude-heading').textContent = entry ? 'Modifier un interlude' : 'Préparer un interlude';
  form.elements.title.value = entry?.title ?? '';
  form.elements.kind.value = entry?.kind ?? 'other';
  const when = form.elements.afterSceneId;
  sceneOptions(when, campaign.scenes.map(({ id, title }) => ({ id, title: `Après « ${title} »` })));
  const betweenSessions = node('option', 'Entre deux séances');
  betweenSessions.value = '';
  when.prepend(betweenSessions);
  when.value = entry?.afterSceneId ?? '';
  form.elements.preparation.value = entry?.preparation ?? '';
  beginEdit(form, entry?.id, 'save-interlude');
}

function editInterludeResult(entry) {
  if (!campaign || busy) return;
  const form = $('interlude-result-form');
  $('interlude-result-heading').textContent = entry.result ? 'Corriger un résultat' : 'Consigner un interlude';
  $('interlude-result-context').textContent = `${entry.title} · ${interludeContext(entry)}`;
  form.elements.date.value = entry.result?.date ?? todayForForm();
  form.elements.notes.value = entry.result?.notes ?? '';
  beginEdit(form, entry.id, 'record-interlude');
}

function removeInterlude(entry) {
  if (busy || !window.confirm(`Supprimer la préparation de « ${entry.title} » ?`)) return;
  return quickCommand('remove-interlude', entry.id, () => ({ id: entry.id }), () => $('add-interlude').focus());
}

function editSession(session) {
  if (!campaign || busy) return;
  const form = $('archive-form');
  $('archive-heading').textContent = session ? 'Modifier une archive' : 'Archiver une séance';
  form.elements.title.value = session?.title ?? '';
  form.elements.date.value = session?.date ?? todayForForm();
  const resumeSceneId = session ? session.resumeSceneId : campaign.activeSceneId;
  form.elements.resumeSceneId.value = resumeSceneId ?? '';
  $('session-resume').textContent = `Point de reprise · ${sceneTitle(campaign, resumeSceneId) || 'Aucune scène'}`;
  form.elements.privateSummary.value = session?.privateSummary ?? '';
  form.elements.nextSession.value = session?.nextSession ?? '';
  form.elements.chronicle.value = session?.chronicle ?? '';
  const confirmed = new Set(session?.confirmedSceneIds);
  const choices = campaign.scenes.map(scene => {
    const label = node('label');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'confirmedSceneIds';
    checkbox.value = scene.id;
    checkbox.checked = confirmed.has(scene.id);
    label.append(checkbox, document.createTextNode(scene.title));
    return label;
  });
  $('session-scene-options').replaceChildren(...(choices.length ? choices : [node('p', 'Aucune scène à confirmer.', 'muted')]));
  beginEdit(form, session?.id, 'save-session');
}

function attachEditor(form, buildData, fallbackFocus) {
  const dialog = form.closest('dialog');
  form.addEventListener('input', () => { if (draft) draft.dirty = true; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!draft || busy) return;
    const type = draft.type;
    const data = buildData(new FormData(form), draft.id, type, draft);
    if (!data) return;
    const command = commandFor(draft, draft.campaignId, draft.revision, type, data);
    saveCommand(command, { form, onSaved: () => {
      draft = undefined;
      dialog.close();
      fallbackFocus(type, data).focus();
    } });
  });
  form.querySelector('.cancel-edit').addEventListener('click', () => {
    if (busy) return;
    if (draft?.dirty && !window.confirm('Abandonner les modifications de ce brouillon ?')) return;
    draft = undefined;
    dialog.close();
  });
  dialog.addEventListener('cancel', (event) => {
    if (busy || (draft?.dirty && !window.confirm('Abandonner les modifications de ce brouillon ?'))) event.preventDefault();
    else draft = undefined;
  });
  form.querySelector('.reload-draft').addEventListener('click', async () => {
    if (busy) return;
    draft = undefined;
    dialog.close();
    await refreshCampaign();
  });
}

function downloadFile(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = node('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function setChronicleApproval(approved) {
  const session = selectedSession();
  if (!session) return;
  return quickCommand('set-chronicle-approval', `${session.id}:${approved}`,
    () => ({ id: session.id, approved }), () => {
      setStatus(approved ? 'Chronique approuvée' : 'Approbation retirée', 'saved');
      $(approved ? 'revoke-chronicle' : 'approve-chronicle').focus();
    });
}

async function shareApprovedChronicle(share) {
  if (!store || !campaign || busy) return;
  const selected = selectedSession();
  if (!selected?.chronicleApproved) return;
  busy = true;
  clearError();
  try {
    const current = await store.get(campaign.id);
    const saved = current?.[SESSION_ARCHIVES_KEY]?.find(session => session.id === selected.id);
    if (!saved?.chronicleApproved || saved.chronicle !== selected.chronicle) {
      throw Object.assign(new Error('La chronique ou son approbation a changé. Rechargez la campagne.'), { code: 'conflict' });
    }
    setStatus(await share(saved.chronicle));
  } catch (error) {
    showError(error);
  } finally {
    busy = false;
  }
}

async function exportBackup() {
  if (!store || !campaign || busy) return;
  busy = true;
  clearError();
  try {
    const backup = await store.exportBackup(campaign.id);
    const name = normalize(campaign.name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 55);
    downloadFile(backup, 'application/json', `entre-rives-${name || 'campagne'}.json`);
    setStatus('Téléchargement de la sauvegarde lancé', 'saved');
  } catch (error) {
    showError(error);
  } finally {
    busy = false;
  }
}

function displayPreview() {
  $('backup-preview').hidden = !preview;
  $('restore-backup').disabled = !preview || preview.conflict;
  if (!preview) return;
  $('backup-name').textContent = preview.name;
  const actions = preview.actions ? ` · ${preview.actions} action(s) consignée(s)` : '';
  const oppositions = preview.oppositions ? ` · ${preview.oppositions} opposition(s) M03` : '';
  const profiles = preview.profiles ? ` · ${preview.profiles} profil(s) M03` : '';
  const playerSheets = preview.playerSheets ? ` · ${preview.playerSheets} fiche(s) PJ M02` : '';
  const creations = preview.creations ? ` · ${preview.creations} création(s) MJ` : '';
  const ambiances = preview.ambiances ? ` · ${preview.ambiances} ambiance(s)` : '';
  const interludes = preview.interludes ? ` · ${preview.interludes} interlude(s)` : '';
  const images = preview.images ? ` · ${preview.images} image(s) par lien` : '';
  $('backup-summary').textContent = `Révision ${preview.revision} · ${preview.characters} PJ${playerSheets} · ${preview.creatures} créature(s) · ${preview.scenes} scène(s)${ambiances} · ${preview.sessions} séance(s) archivée(s)${interludes} · ${preview.markers} repère(s)${actions}${oppositions}${profiles}${creations}${images}`;
  $('backup-conflict').hidden = !preview.conflict;
}

async function inspectFile() {
  const request = ++previewRequest;
  preview = undefined;
  displayPreview();
  clearError();
  const file = $('backup-file').files[0];
  if (!file || !store) return;
  setStatus('Vérification du fichier…');
  try {
    if (file.size > 4 * 1024 * 1024) throw new Error('Ce fichier dépasse la taille maximale du pilote (4 Mio).');
    const inspected = await store.previewBackup(await file.text());
    if (request !== previewRequest) return;
    preview = inspected;
    displayPreview();
    setStatus(preview.conflict ? 'Campagne déjà présente dans ce profil' : 'Aperçu prêt · confirmez pour restaurer');
  } catch (error) {
    if (request === previewRequest) showError(error);
  }
}

async function restoreBackup() {
  if (!preview || preview.conflict || busy) return;
  busy = true;
  $('restore-backup').disabled = true;
  $('backup-file').disabled = true;
  clearError();
  setStatus('Restauration en cours…');
  try {
    const next = await store.restoreBackup(preview);
    setCampaign(next);
    preview = undefined;
    $('backup-file').value = '';
    notifySave();
    navigate('prepare');
    setStatus('Campagne restaurée et sauvegardée', 'saved');
  } catch (error) {
    showError(error);
    if (error.code === 'conflict') preview = { ...preview, conflict: true };
  } finally {
    busy = false;
    $('backup-file').disabled = false;
    displayPreview();
  }
}

for (const control of document.querySelectorAll('[data-view]')) {
  control.addEventListener('click', (event) => {
    event.preventDefault();
    if (busy) return;
    if (control.id === 'library-add-creation' && shelfCreationKind[libraryShelf]) openCreation(shelfCreationKind[libraryShelf]);
    else if (control.dataset.view === 'library') openLibraryShelf();
    else navigate(control.dataset.view);
  });
}
for (const control of document.querySelectorAll('[data-library-shelf]')) {
  control.addEventListener('click', event => followShelf(event, control.dataset.libraryShelf));
}
$('fresque-adventures').addEventListener('click', event => {
  if (!plainClick(event)) return;
  event.preventDefault();
  if (busy) return;
  openLibraryShelf('aventures', 'personal');
  $('catalogue-type').value = 'adventure';
  renderLibrary();
});
$('atlas-quick-links').append(
  referenceLink(libraryReference('carte-ensembles'), 'Voir le schéma général'),
  referenceLink(libraryReference('sept-grandes-cites-illustrees'), 'Les Sept Cités illustrées'),
);

for (const control of document.querySelectorAll('[data-dashboard-view]')) {
  control.addEventListener('click', () => {
    const recent = recentCampaign();
    if (recent) openCampaign(recent.id, control.dataset.dashboardView);
  });
}

$('create-campaign').addEventListener('submit', (event) => {
  event.preventDefault();
  if (busy) return;
  const form = event.currentTarget;
  const data = new FormData(form);
  createDraft ??= { id: crypto.randomUUID() };
  const command = commandFor(createDraft, createDraft.id, 0, 'create', {
    name: data.get('name').trim(), description: data.get('description'),
    style: data.get('style'), startingLevel: Number(data.get('startingLevel')),
  });
  saveCommand(command, { form, onSaved: () => {
    createDraft = undefined;
    form.reset();
    navigate('prepare');
  } });
});

$('add-character').addEventListener('click', () => editCharacter());
$('guide-pj').addEventListener('click', openGuidedPJ);
$('free-pj').addEventListener('click', openFreePJ);
$('pj-free-name').addEventListener('input', event => event.target.setCustomValidity(''));
$('pj-free-choices').addEventListener('input', () => updateFreeBudget($('pj-free-form')));
$('pj-free-training').addEventListener('invalid', () => { $('pj-free-training').open = true; }, true);
$('pj-free-review').addEventListener('click', reviewFreePJ);
$('pj-free-revise').addEventListener('click', () => {
  if (!draft || busy) return;
  draft.freeSource = undefined;
  showFreeReview(false);
  $('pj-free-review').focus();
});
$('pj-guide-name').addEventListener('input', event => event.target.setCustomValidity(''));
$('pj-guide-review').addEventListener('click', reviewGuidedPJ);
$('pj-guide-revise').addEventListener('click', () => {
  if (!draft || busy) return;
  draft.guidedSource = undefined;
  showGuidedReview(false);
  $('pj-guide-review').focus();
});
$('import-pj').addEventListener('click', openPJImport);
$('pj-import-file').addEventListener('change', inspectPJImport);
$('pj-import-source').addEventListener('change', renderPJImport);
$('add-scene').addEventListener('click', () => editScene());
$('add-marker').addEventListener('click', () => editMarker());
$('play-add-marker').addEventListener('click', () => editMarker(undefined, activeScene()?.id));
$('library-add-marker').addEventListener('click', () => editMarker());
$('library-add-image').addEventListener('click', () => editLinkedImage());
for (const id of ['import-adventure', 'library-import-adventure']) $(id).addEventListener('click', openAdventureImport);
$('adventure-import-file').addEventListener('change', inspectAdventureImport);
$('adventure-plan-review').addEventListener('click', reviewAdventurePlan);
$('adventure-plan-revise').addEventListener('click', () => { if (!busy) showAdventureReview(false); });
$('adventure-plan-rows').addEventListener('invalid', event => { event.target.closest('details').open = true; }, true);
$('creation-kind').addEventListener('change', event => {
  const fields = new FormData($('creation-form'));
  draft.creationDetails.set(draft.creationKind, readCreationDetails(draft.creationKind, fields));
  draft.creationKind = event.target.value;
  renderCreationFields(draft.creationKind, draft.creationDetails.get(draft.creationKind));
});
$('creation-name').addEventListener('input', event => event.target.setCustomValidity(''));
$('creation-link-select').addEventListener('change', event => { $('creation-add-link').disabled = !event.target.value; });
$('creation-add-link').addEventListener('click', () => {
  const id = $('creation-link-select').value;
  if (busy || !id || !draft || draft.creationLinks.length >= 12) return;
  draft.creationLinks.push(id);
  draft.dirty = true;
  renderCreationLinks();
  const list = $('creation-link-list');
  if ($('creation-link-select').disabled) list.lastElementChild.querySelector('button').focus();
  else $('creation-link-select').focus();
});
$('open-play-action').addEventListener('click', () => editPlayAction());
$('open-play-opposition').addEventListener('click', () => editPlayAction({ mode: 'opposition' }));
$('journal-add-action').addEventListener('click', () => editPlayAction());
for (const button of document.querySelectorAll('[data-play-protocol]')) {
  button.addEventListener('click', () => { if (!busy) $('play-protocol-dialog').showModal(); });
}
$('play-mode').addEventListener('change', updatePlayCheckFields);
$('play-target').addEventListener('change', updatePlayTarget);
$('play-impact-mode').addEventListener('change', updatePlayTarget);
$('play-apply-damage').addEventListener('change', event => {
  $('play-record').textContent = event.target.checked ? 'Consigner et appliquer les PV' : 'Consigner dans le journal';
});
$('play-stat').addEventListener('change', event => {
  if (draft?.attackerProfile) $('play-raw-stat').value = draft.attackerProfile.stats[event.target.value];
});
$('play-profile-mastery').addEventListener('change', event => {
  const card = draft?.attackerProfile;
  const name = event.target.value;
  if (card && Object.hasOwn(card.masteries, name)) $('play-mastery').value = card.masteries[name];
});
$('play-dice-source').addEventListener('change', updatePlayDiceSource);
$('play-lock').addEventListener('click', lockPlayDeclaration);
$('play-resolve').addEventListener('click', resolvePlayDice);
$('play-revise').addEventListener('click', () => {
  if (!draft?.declaration || busy || draft.recordedAt) return;
  draft.type = 'record-play-action';
  draft.declaration = undefined;
  draft.parameters = undefined;
  for (const die of $('play-manual-dice').querySelectorAll('input')) die.value = '';
  showPlayDeclaration();
  $('play-intent').focus();
});
for (const id of ['play-intent', 'play-stakes', 'play-consequence']) {
  const control = $(id);
  control.addEventListener('input', () => control.setCustomValidity(''));
}
for (const [value, label] of Object.entries(PLAY_STATS)) {
  const option = node('option', label);
  option.value = value;
  $('play-stat').append(option);
}
for (const [value, label] of Object.entries(OPPOSITION_MODES)) $('play-impact-mode').append(new Option(label, value));
$('marker-filter').addEventListener('change', renderFresque);
$('fresque-lane-filter').addEventListener('change', renderFresque);
$('add-fresque-lane').addEventListener('click', () => editFresqueLane());
$('fresque-density').addEventListener('change', (event) => {
  $('scene-list').dataset.density = event.currentTarget.value;
});
for (const [kind, label] of Object.entries(MARKER_KINDS)) {
  for (const select of [$('marker-filter'), $('marker-kind')]) {
    const option = node('option', label);
    option.value = kind;
    select.append(option);
  }
}
$('improvise-scene').addEventListener('click', () => editScene(undefined, { improvised: true }));
$('quick-search').addEventListener('click', () => $('cockpit-search').focus());
$('quick-notes').addEventListener('click', () => {
  const scene = activeScene();
  if (!scene || busy) return;
  editScene(scene);
  $('scene-private-notes').focus();
});
$('quick-present').addEventListener('click', prepareSceneShare);
$('quick-ambiances').addEventListener('click', () => $('play-ambiances-title').focus());
$('prepare-scene-share').addEventListener('click', prepareSceneShare);
$('ambiance-copy-scene').addEventListener('click', () => {
  const scene = campaign?.scenes.find(item => item.id === draft?.ambianceSceneId);
  if (busy || !scene) return;
  $('ambiance-title').value = scene.title;
  $('ambiance-description').value = scene.description;
  draft.dirty = true;
  $('ambiance-title').focus();
});
$('edit-current-scene').addEventListener('click', () => editScene(activeScene()));
$('add-interlude').addEventListener('click', () => editInterlude());
$('open-interlude-journal').addEventListener('click', () => {
  if (busy) return;
  navigate('archive', false);
  $('interlude-journal-title').focus();
});
$('add-session').addEventListener('click', () => editSession());
$('edit-session').addEventListener('click', () => editSession(selectedSession()));
$('approve-chronicle').addEventListener('click', () => setChronicleApproval(true));
$('revoke-chronicle').addEventListener('click', () => setChronicleApproval(false));
$('copy-chronicle').addEventListener('click', () => shareApprovedChronicle(async text => {
  try {
    await navigator.clipboard.writeText(text);
    return 'Chronique copiée';
  } catch {
    const preview = $('chronicle-preview');
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(preview);
    preview.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    return 'Texte sélectionné. Utilisez la commande Copier de votre appareil.';
  }
}));
$('download-chronicle').addEventListener('click', () => shareApprovedChronicle(text => {
  downloadFile(text, 'text/plain;charset=utf-8', 'chronique-entre-rives.txt');
  return 'Téléchargement de la chronique lancé';
}));
$('jump-scene').addEventListener('change', (event) => selectScene(event.target.value));
$('cockpit-search').addEventListener('input', renderCockpitSearch);
$('toggle-scene-list').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const listMode = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(listMode));
  $('scene-list').classList.toggle('fresque-list-mode', listMode);
  $('fresque-density').disabled = listMode;
});
$('fresque-minimap').addEventListener('toggle', () => revealMiniMapMarker());
$('fresque-map-select').addEventListener('change', event => inspectMiniMapScene(event.target.value));
$('fresque-map-current').addEventListener('click', () => inspectMiniMapScene(campaign?.activeSceneId));
$('fresque-map-jump').addEventListener('click', () => {
  if (miniMapSceneId) focusSceneCard(miniMapSceneId);
});
$('fresque-map-markers').addEventListener('keydown', event => {
  const markers = [...$('fresque-map-markers').querySelectorAll('button')];
  const index = markers.indexOf(event.target);
  if (index === -1) return;
  const destination = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: markers.length - 1 }[event.key];
  if (destination === undefined) return;
  event.preventDefault();
  const marker = markers[Math.max(0, Math.min(markers.length - 1, destination))];
  inspectMiniMapScene(marker.dataset.mapScene, true);
});
$('scene-link-from').addEventListener('change', renderLinkTargets);
$('scene-link-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!campaign || busy) return;
  const form = event.currentTarget;
  const fields = new FormData(form);
  const link = { fromId: fields.get('fromId'), toId: fields.get('toId'), label: fields.get('label').trim() };
  const key = JSON.stringify(link);
  if (linkDraft?.key !== key) linkDraft = { key, id: crypto.randomUUID() };
  const command = commandFor(linkDraft, campaign.id, campaign.revision, 'add-scene-link', { id: linkDraft.id, ...link });
  saveCommand(command, { form, onSaved: () => {
    linkDraft = undefined;
    $('scene-link-label').value = '';
    setStatus('Embranchement sauvegardé', 'saved');
  } });
});
function resetLibrarySearch() {
  libraryPage = 0;
  renderLibrary();
}

$('catalogue-search').addEventListener('input', resetLibrarySearch);
$('library-layout-cards').addEventListener('click', () => setLibraryLayout('cards', true));
$('library-layout-list').addEventListener('click', () => setLibraryLayout('list', true));
$('workshop-mode-create').addEventListener('click', () => setWorkshopMode(false));
$('workshop-mode-import').addEventListener('click', () => setWorkshopMode(true));
$('workshop-create').addEventListener('input', () => {
  if (busy) return;
  workshopDraft = undefined;
  showWorkshopError();
  renderWorkshop();
});
$('workshop-create').addEventListener('submit', event => {
  event.preventDefault();
  if (!bestiaryRules || busy) return;
  const fields = new FormData(event.currentTarget);
  try {
    previewWorkshopProfile(bestiaryRules.createProfile({
      name: fields.get('name').trim(), description: fields.get('description'), level: Number(fields.get('level')),
      archetype: fields.get('archetype'), kind: fields.get('kind'), role: fields.get('role'),
    }));
  } catch (error) {
    showWorkshopError(error.message);
  }
});
$('workshop-file').addEventListener('change', inspectWorkshopFile);
$('workshop-save').addEventListener('click', saveWorkshopProfile);
$('catalogue-group').addEventListener('change', resetLibrarySearch);
for (const [id, choices] of [
  ['catalogue-type', Object.entries(LIBRARY_CATEGORIES)],
  ['catalogue-origin', Object.entries(LIBRARY_SOURCES)],
  ['catalogue-status', Object.entries(LIBRARY_STATUSES)],
  ['catalogue-level', Array.from({ length: 25 }, (_, index) => [index + 1, `Niveau ${index + 1}`])],
]) {
  const select = $(id);
  for (const [value, label] of choices) {
    const option = node('option', label);
    option.value = value;
    select.append(option);
  }
  select.addEventListener('change', resetLibrarySearch);
}
$('resource-previous').addEventListener('click', () => {
  if (!busy && resourceTrail.length) previewResource(resourceTrail.pop(), false);
});
$('resource-copy-shortcut').addEventListener('click', async () => {
  const field = $('resource-shortcut');
  const value = field.value;
  try {
    await navigator.clipboard.writeText(value);
    if (field.value === value) $('resource-shortcut-status').textContent = 'Raccourci copié.';
  } catch {
    if (field.value !== value) return;
    field.focus();
    field.select();
    $('resource-shortcut-status').textContent = 'Raccourci sélectionné pour la copie.';
  }
});
for (const [id, direction] of [['catalogue-previous', -1], ['catalogue-next', 1]]) {
  $(id).addEventListener('click', () => {
    libraryPage += direction;
    renderLibrary();
    $('catalogue-count').focus();
  });
}
$('refresh-campaign').addEventListener('click', refreshCampaign);
$('export-backup').addEventListener('click', exportBackup);
$('backup-file').addEventListener('change', inspectFile);
$('restore-backup').addEventListener('click', restoreBackup);

attachEditor($('character-form'), (data, id) => ({
  id, name: data.get('name').trim(), level: Number(data.get('level')), notes: data.get('notes'),
}), () => $(view === 'library' ? 'catalogue-search' : view === 'play' ? 'play-title' : 'add-character'));
for (const [value, label] of Object.entries(IMAGE_ORIGINS)) $('linked-image-origin').append(new Option(label, value));
for (const id of ['linked-image-url', 'linked-image-name']) {
  $(id).addEventListener('input', event => event.currentTarget.setCustomValidity(''));
}
attachEditor($('linked-image-form'), (data, id) => {
  const url = data.get('url').trim();
  const name = data.get('name').trim();
  const hasValidUrl = validImageUrl(url);
  if (!hasValidUrl || !name) {
    const field = $(hasValidUrl ? 'linked-image-name' : 'linked-image-url');
    field.setCustomValidity(field.name === 'url' ? 'Saisissez un lien direct qui commence par https://.' : 'Saisissez un titre pour l’image.');
    field.reportValidity();
    return undefined;
  }
  return { id, url, name, targetId: data.get('targetId') || null, alt: data.get('alt').trim(),
    origin: data.get('origin'), credit: data.get('credit').trim() };
}, (_type, image) => {
  queueMicrotask(() => previewResource(campaignEntry(image.id)));
  return $(view === 'library' ? 'catalogue-search' : `${view}-title`);
});
attachEditor($('creation-form'), (fields, id, _type, attempt) => {
  const kind = attempt.creationKind;
  const name = fields.get('name').trim();
  if (!name) {
    $('creation-name').setCustomValidity('Saisissez un nom pour la fiche.');
    $('creation-name').reportValidity();
    return undefined;
  }
  return { id, kind, name, description: fields.get('description').trim(), notes: fields.get('notes').trim(),
    state: fields.get('state'), parentId: fields.get('parentId') || null, links: attempt.creationLinks,
    details: readCreationDetails(kind, fields) };
}, () => {
  setStatus('Création enregistrée dans la bibliothèque', 'saved');
  return $(view === 'library' ? 'catalogue-search' : `${view}-title`);
});
attachEditor($('adventure-import-form'), (_fields, _id, _type, attempt) =>
  attempt.adventureBundle && { bundle: attempt.adventureBundle }, (_type, { bundle }) => {
  setStatus('Aventure ajoutée à la Fresque', 'saved');
  return focusSceneCard(bundle.scenes[0].id);
});
attachEditor($('adventure-plan-form'), (fields, id, _type, attempt) => adventurePlanData(fields, id, attempt), (_type, data) => {
  navigate('prepare', false);
  const count = data.scenes.length;
  setStatus(count === 1 ? 'Scène ajoutée à la Fresque' : `${count} scènes ajoutées à la Fresque`, 'saved');
  return sceneCard(data.scenes[0].id) ?? $('prepare-title');
});
attachEditor($('pj-guide-form'), (_data, id, _type, attempt) =>
  attempt.guidedSource && { id, attach: false, source: attempt.guidedSource }, () => {
  setStatus('PJ créé par parcours de vie', 'saved');
  return $('guide-pj');
});
attachEditor($('pj-free-form'), (_data, id, _type, attempt) =>
  attempt.freeSource && { id, attach: false, source: attempt.freeSource }, () => {
  setStatus('PJ créé et vérifié avec le budget M02', 'saved');
  return $('free-pj');
});
attachEditor($('pj-import-form'), (data, id, _type, attempt) => {
  const source = attempt.pjSources?.[data.get('selection')];
  if (!source || !pjRules.evaluatePJ(source).valid) return undefined;
  const destination = data.get('destination');
  return { id: destination || id, attach: Boolean(destination), source };
}, () => {
  setStatus('Fiche PJ M02 importée', 'saved');
  return $('import-pj');
});
attachEditor($('play-action-form'), (fields, id, type, attempt) => {
  if (!attempt.recordedAt) return undefined;
  const consequence = trimmedPlayText('play-consequence');
  if (!consequence) return undefined;
  const action = { id, ...attempt.declaration, roll: attempt.roll, recordedAt: attempt.recordedAt, consequence };
  if (type === 'record-opposition') action.applyDamage = fields.has('applyDamage');
  return action;
}, (type, data) => {
  const status = type === 'record-opposition' ? (data.applyDamage ? 'Opposition consignée · PV mis à jour' : 'Opposition consignée · PV inchangés') : 'Action consignée dans le journal';
  setStatus(status, 'saved');
  return $('play-actions-list').querySelector('summary') ?? $('open-play-action');
});
attachEditor($('creature-form'), (data, id) => ({
  id, name: data.get('name').trim(), description: data.get('description'),
}), () => $(view === 'library' ? 'catalogue-search' : view === 'play' ? 'play-title' : 'prepare-title'));
attachEditor($('ambiance-form'), (fields, id, _type, attempt) => {
  const data = { sceneId: attempt.ambianceSceneId, id, name: fields.get('name').trim(),
    title: fields.get('title').trim(), description: fields.get('description').trim(), imageId: fields.get('imageId') || null };
  const form = $('ambiance-form');
  if (!data.name) showError(new Error('Donnez un nom privé à cette ambiance.'), form);
  else if (!data.title && !data.description && !data.imageId) showError(new Error('Ajoutez au moins un titre, un texte ou une image.'), form);
  else return data;
}, (_type, data) => {
  setStatus('Ambiance enregistrée', 'saved');
  return ambianceFocus(data.sceneId, data.id);
});
attachEditor($('fresque-lane-form'), (fields, id) => {
  const name = fields.get('name').trim();
  if (name) return { id, name };
  showError(new Error('Donnez un nom au couloir.'), $('fresque-lane-form'));
}, () => $('fresque-lane-tools').querySelector('summary'));
attachEditor($('scene-form'), (data, id, type) => {
  const scene = {
    id, title: data.get('title').trim(), description: data.get('description'),
    privateNotes: data.get('privateNotes'), participantIds: data.getAll('participantIds'),
  };
  if (type === 'improvise-scene') scene.activate = data.get('destination') === 'play';
  return scene;
}, (type, scene) => {
  if (type === 'improvise-scene') {
    const result = scene.id === campaign.activeSceneId ? 'scène courante' : 'scène gardée en réserve';
    setStatus(`${scene.title} · ${result}`, 'saved');
    return $('improvise-scene');
  }
  return $(view === 'play' ? 'edit-current-scene' : 'add-scene');
});
for (const [value, label] of Object.entries(INTERLUDE_KINDS)) {
  const option = node('option', label);
  option.value = value;
  $('interlude-kind').append(option);
}
attachEditor($('interlude-form'), (data, id) => ({
  id, title: data.get('title').trim(), kind: data.get('kind'),
  afterSceneId: data.get('afterSceneId') || null, preparation: data.get('preparation').trim(),
}), () => $('add-interlude'));
attachEditor($('interlude-result-form'), (data, id) => ({
  id, date: data.get('date'), notes: data.get('notes').trim(),
}), () => $(view === 'archive' ? 'interlude-journal-title' : 'open-interlude-journal'));
attachEditor($('archive-form'), (data, id) => ({
  id,
  title: data.get('title').trim(),
  date: data.get('date'),
  resumeSceneId: data.get('resumeSceneId') || null,
  confirmedSceneIds: data.getAll('confirmedSceneIds'),
  privateSummary: data.get('privateSummary'),
  nextSession: data.get('nextSession'),
  chronicle: data.get('chronicle'),
}), (_type, session) => {
  selectedArchiveId = session.id;
  renderArchive();
  return $('archive-detail-title');
});
attachEditor($('marker-form'), (data, id, type, activeDraft) => {
  const marker = {
    id, kind: data.get('kind') ?? $('marker-kind').value, title: data.get('title').trim(),
    description: data.get('description'), sceneId: data.get('sceneId') || null,
  };
  if (type === 'copy-library-marker') marker.provenance = activeDraft.provenance;
  return marker;
}, (type, marker) => {
  const filter = $('marker-filter');
  if (view === 'prepare' && filter.value && filter.value !== marker.kind) {
    filter.value = '';
    renderFresque();
  }
  setStatus(type === 'copy-library-marker' ? 'Variante créée' : 'Repère sauvegardé', 'saved');
  if (view === 'library') return $('catalogue-search');
  return $(`view-${view}`).querySelector(`[data-marker-id="${CSS.escape(marker.id)}"] summary`)
    ?? $(view === 'play' ? 'play-add-marker' : 'add-marker');
});

function updatePlayerWindowControls() {
  const showing = Boolean(playerWindowKind && playerWindow?.active());
  $('stop-player-window').hidden = $('player-share-live').hidden = !showing;
  $('open-player-window').textContent = showing ? 'Remplacer dans la fenêtre joueur' : 'Ouvrir une fenêtre joueur';
}

function stopPlayerWindow() {
  playerWindow?.close();
  playerWindow = undefined;
  playerWindowKind = undefined;
  clearInterval(playerWindowTimer);
  playerWindowTimer = undefined;
  updatePlayerWindowControls();
  if ($('save-status').dataset.state === 'player-window') setStatus('Fenêtre joueur retirée');
}

function closePlayerPreview() {
  playerShare = undefined;
  clearProjection($('player-share-preview'));
  if ($('player-share-dialog').open) $('player-share-dialog').close();
}

function revokePlayerShare() {
  closePlayerPreview();
  stopPlayerWindow();
}

function revokeSceneShare() {
  if (playerShare?.kind === 'scene') closePlayerPreview();
  if (playerWindowKind === 'scene') stopPlayerWindow();
}

function playerShareMessage(message = '') {
  const notice = $('player-share-message');
  notice.textContent = message;
  notice.hidden = !message;
}

function renderPlayerPreview() {
  if (!playerShare) return;
  const fields = new Set(new FormData($('player-share-form')).getAll('fields'));
  const choice = playerShare.imageChoice;
  const waiting = choice?.pending || choice?.error;
  playerShare.presentation = !waiting && (fields.size || choice?.image)
    ? playerShare.build(fields, choice?.image) : undefined;
  $('player-share-empty').hidden = Boolean(playerShare.presentation || waiting);
  $('player-share-image-status').hidden = !choice?.pending;
  $('open-player-window').disabled = $('show-player-here').disabled = !playerShare.presentation;
  playerShareMessage(choice?.error);
  const preview = $('player-share-preview');
  if (playerShare.presentation) showPresentation(preview, playerShare.presentation);
  else clearProjection(preview);
}

async function choosePresentationImage() {
  const prepared = playerShare;
  if (!prepared || busy) return;
  const id = $('player-share-image').value;
  const entry = prepared.illustrations.get(id);
  const choice = { pending: Boolean(entry), error: id && !entry ? 'L’image enregistrée est indisponible. Choisissez une autre image ou « Aucune image ».' : '' };
  prepared.imageChoice = choice;
  renderPlayerPreview();
  if (!entry) return;
  try {
    choice.image = await loadPresentationImage(entry.art);
  } catch {
    choice.error = 'Impossible de préparer cette image.';
  } finally {
    choice.pending = false;
    if (playerShare === prepared && prepared.imageChoice === choice) renderPlayerPreview();
  }
}

function populateIllustrations(select, images, related, initialImageId) {
  select.replaceChildren(new Option('Aucune image', ''));
  const linked = new Set(related);
  for (const [label, entries] of [
    ['Fiches de cette scène', images.filter(entry => linked.has(entry))],
    ['Cartes', images.filter(entry => !linked.has(entry) && entry.art.map)],
    ['Illustrations et portraits', images.filter(entry => !linked.has(entry) && !entry.art.map)],
  ]) {
    if (!entries.length) continue;
    const group = node('optgroup');
    group.label = label;
    group.append(...entries.map(entry => new Option(entry.name, entry.id)));
    select.append(group);
  }
  if (initialImageId && !images.some(entry => entry.id === initialImageId)) {
    select.append(new Option('Image indisponible dans le catalogue', initialImageId));
  }
  select.value = initialImageId ?? '';
}

function configurePresentationImages(prepared, related, initialImage, initialImageId) {
  const select = $('player-share-image');
  const images = prepared.kind === 'scene' ? LIBRARY_ILLUSTRATIONS : initialImage ? [initialImage] : [];
  prepared.illustrations = new Map(images.map(entry => [entry.id, entry]));
  populateIllustrations(select, images, related, initialImageId ?? initialImage?.id);
  select.disabled = $('player-share-image-field').hidden = !images.length;
}

function preparePresentation(kind, subject, build, { returnFocus, related = [], initialImage, initialImageId, ambianceFields } = {}) {
  updatePlayerWindowControls();
  const fieldsets = { scene: $('scene-share-fields'), sheet: $('player-share-fields') };
  const fieldset = fieldsets[kind];
  playerShare = { campaignId: campaign?.id, revision: campaign?.revision, kind, fieldset, build, returnFocus };
  $('player-share-form').reset();
  for (const option of Object.values(fieldsets)) option.hidden = option.disabled = option !== fieldset;
  if (kind === 'scene') {
    $('scene-share-title-label').textContent = ambianceFields ? 'Titre de l’ambiance' : 'Titre de la scène';
    $('scene-share-text-label').textContent = ambianceFields ? 'Texte de l’ambiance' : 'Texte de la scène';
    for (const input of fieldset.querySelectorAll('input')) {
      input.checked = ambianceFields?.includes(input.value) ?? false;
      input.disabled = Boolean(ambianceFields && !input.checked);
    }
  }
  configurePresentationImages(playerShare, related, initialImage, initialImageId);
  $('player-share-title').textContent = {
    scene: ambianceFields ? 'Préparer la projection de l’ambiance' : 'Préparer la projection de scène',
    sheet: 'Préparer la fiche joueur', image: 'Préparer la projection de l’image',
  }[kind];
  $('player-share-character').textContent = subject;
  $('player-share-empty').textContent = {
    scene: 'Cochez un champ ou choisissez une image pour voir l’aperçu.',
    sheet: 'Cochez un champ pour voir l’aperçu.',
    image: 'Choisissez une image pour voir l’aperçu.',
  }[kind];
  choosePresentationImage();
  $('player-share-dialog').showModal();
  $('player-share-dialog').scrollTop = 0;
}

function preparePlayerShare(id) {
  const character = campaign?.characters.find(actor => actor.id === id);
  if (!character?.[PJ_SOURCE_KEY] || busy) return;
  const hp = currentHitPoints(campaign, character);
  preparePresentation('sheet', `Fiche de ${character.name}`, fields =>
    playerSheetPresentation(createPlayerProjection(character, character[PJ_SOURCE_KEY], hp, fields)));
}

function sceneIllustrations(scene) {
  const readLinks = text => referenceSegments(text, key => campaignReference(key)).map(part => part.entry).filter(Boolean);
  const references = [
    ...scenePreparationEntries(scene),
    ...readLinks(scene.description),
    ...readLinks(scene.privateNotes),
    ...campaign.creatures.filter(entry => scene.participantIds.includes(entry.id)).map(entry => creatureReference(entry.source)),
  ];
  for (const marker of campaign[FRESQUE_MARKERS_KEY] ?? []) {
    if (marker.sceneId === scene.id) references.push(archiveReference(marker[FRESQUE_REFERENCE_KEY]), ...readLinks(marker.description));
  }
  return references.filter(Boolean).flatMap(entry => [entry, ...(entry.links ?? []).map(id => campaignReference(id))])
    .map(libraryIllustration).filter(Boolean);
}

function prepareSceneShare(event, ambiance) {
  const scene = activeScene();
  if (!scene || view !== 'play' || busy) return;
  const build = (fields, image) => scenePresentation(createProjection(ambiance ?? scene, {
    title: fields.has('title'), description: fields.has('description'),
  }), image);
  preparePresentation('scene', ambiance ? `Ambiance · ${ambiance.name}` : `Scène · ${scene.title}`, build, {
    returnFocus: event.currentTarget, related: sceneIllustrations(scene),
    initialImageId: ambiance?.imageId,
    ambianceFields: ambiance && [ambiance.title && 'title', ambiance.description.trim() && 'description'].filter(Boolean),
  });
}

function prepareImageShare(entry) {
  preparePresentation('image', entry.name, (_fields, image) => scenePresentation({}, image, 'Image de jeu'), { initialImage: entry });
}

async function presentPlayerContent(separate) {
  const prepared = playerShare;
  const presentation = prepared?.presentation;
  if (!presentation || busy) return;
  const isScene = prepared.kind === 'scene';
  const existing = separate && playerWindow?.active() ? playerWindow : undefined;
  let popup;
  if (separate) {
    try { popup = existing ?? openPlayerWindow(); }
    catch { /* Le navigateur peut refuser l’accès à une nouvelle fenêtre. */ }
    if (!popup) {
      playerShareMessage('La fenêtre a été bloquée par le navigateur. Vous pouvez montrer la sélection sur cet écran.');
      return;
    }
    if (!existing) {
      stopPlayerWindow();
      playerWindow = popup;
    }
  }
  busy = true;
  if (prepared.fieldset) prepared.fieldset.disabled = true;
  $('player-share-image').disabled = true;
  $('open-player-window').disabled = $('show-player-here').disabled = true;
  let shown = false;
  try {
    if (popup && !await popup.ready) {
      if (playerShare === prepared) playerShareMessage('La fenêtre joueur ne répond pas. Vous pouvez montrer la sélection sur cet écran.');
      return;
    }
    const current = prepared.campaignId ? await store.get(prepared.campaignId) : undefined;
    if (playerShare !== prepared) return;
    if (current?.revision !== prepared.revision) {
      stopPlayerWindow();
      playerShareMessage('La campagne a changé. Fermez cet aperçu et actualisez la campagne avant de présenter la sélection.');
      return;
    }
    if (!popup && document.hidden) return;
    if (popup) {
      shown = popup === playerWindow && popup.show(presentation);
      if (!shown) {
        playerShareMessage('La fenêtre joueur a été retirée ou fermée avant l’affichage.');
        return;
      }
      playerWindowKind = prepared.kind;
      const stop = $('stop-player-window');
      stop.textContent = { scene: 'Retirer la scène de la fenêtre joueur', sheet: 'Retirer la fiche joueur',
        image: 'Retirer l’image de la fenêtre joueur' }[prepared.kind];
      updatePlayerWindowControls();
      playerWindowTimer ??= setInterval(() => { if (!popup.active()) stopPlayerWindow(); }, 750);
      setStatus(existing ? 'Remplacement envoyé à la fenêtre joueur' : 'Fenêtre joueur ouverte', 'player-window');
    } else {
      stopPlayerWindow();
      projectionReturnFocus = prepared.returnFocus ?? $(`${view}-title`);
      showPresentation($('projection'), presentation);
      $('projection-dialog').showModal();
      setStatus(isScene ? 'Projection locale active' : prepared.kind === 'image' ? 'Image affichée' : 'Fiche joueur affichée', 'projection');
      shown = true;
    }
    closePlayerPreview();
  } catch (error) {
    if (playerShare === prepared) playerShareMessage(error.message);
  } finally {
    if (!shown && popup && !existing && popup === playerWindow) stopPlayerWindow();
    busy = false;
    if (playerShare === prepared) {
      if (prepared.fieldset) prepared.fieldset.disabled = false;
      $('player-share-image').disabled = !prepared.illustrations.size;
      $('open-player-window').disabled = $('show-player-here').disabled = false;
    }
  }
}

$('player-share-form').addEventListener('change', event => {
  if (event.target.id === 'player-share-image') choosePresentationImage();
  else renderPlayerPreview();
});
$('open-player-window').addEventListener('click', () => presentPlayerContent(true));
$('show-player-here').addEventListener('click', () => presentPlayerContent(false));
$('cancel-player-share').addEventListener('click', closePlayerPreview);
$('player-share-dialog').addEventListener('cancel', event => {
  event.preventDefault();
  closePlayerPreview();
});
$('stop-player-window').addEventListener('click', stopPlayerWindow);
$('withdraw-player-preview').addEventListener('click', () => {
  stopPlayerWindow();
  ($('open-player-window').disabled ? $('player-share-title') : $('open-player-window')).focus();
});

$('projection-fields').addEventListener('change', updateProjectionButtons);
$('show-projection').addEventListener('click', async () => {
  const scene = activeScene();
  if (!scene || view !== 'play' || busy) return;
  const fields = { title: $('share-title').checked, description: $('share-description').checked };
  if (!fields.title && !fields.description) return;

  busy = true;
  clearError();
  $('projection-fields').disabled = true;
  $('show-projection').disabled = true;
  try {
    const current = await store.get(campaign.id);
    if (current?.revision !== campaign.revision) {
      revokeProjection();
      const error = new Error('La campagne a changé dans un autre onglet. Rechargez-la avant de projeter.');
      error.code = 'conflict';
      showError(error);
    } else if (!document.hidden && (fields.title === $('share-title').checked) &&
        (fields.description === $('share-description').checked)) {
      stopPlayerWindow();
      showPresentation($('projection'), scenePresentation(createProjection(scene, fields)));
      $('projection-dialog').showModal();
      setStatus('Projection locale active', 'projection');
    }
  } catch (error) {
    revokeProjection();
    showError(error);
  } finally {
    busy = false;
    $('projection-fields').disabled = false;
    updateProjectionButtons();
  }
});
$('stop-projection').addEventListener('click', revokeProjection);
$('projection-dialog').addEventListener('cancel', (event) => {
  event.preventDefault();
  revokeProjection();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) revokeProjection(); });
window.addEventListener('pagehide', () => {
  revokeProjection();
  revokePlayerShare();
});
window.addEventListener('beforeunload', (event) => {
  if (draft?.dirty) event.preventDefault();
});

async function followDiscoveryEntry() {
  const entry = location.hash;
  const route = /^#(rayon|fiche)\/([a-z0-9-]+)$/i.exec(entry);
  if (route || entry === '#univers' || entry === '#atelier') {
    history.replaceState(history.state, '', location.pathname + location.search);
    if (entry === '#univers') navigate('universe');
    else if (entry === '#atelier') navigate('workshop');
    else if (route[1] === 'rayon') openLibraryShelf(route[2].toLowerCase());
    else {
      let reference = libraryReference(route[2]);
      if (!reference && route[2].toLowerCase().startsWith('creation-') && lastCampaignId) {
        await openCampaign(lastCampaignId, 'library');
        reference = campaignReference(route[2]);
      }
      if (reference?.shelf === 'univers') navigate('universe');
      else openLibraryShelf(reference?.shelf);
      if (reference) previewResource(reference);
    }
    return;
  }
  if (!['#reprendre', '#campagne', '#bibliotheque'].includes(entry)) return;
  history.replaceState(history.state, '', location.pathname + location.search);

  if (entry === '#bibliotheque') {
    openLibraryShelf('bestiaire', 'demo');
    return;
  }
  if (entry === '#reprendre') {
    const recent = recentCampaign();
    if (recent) return resumeCampaign(recent);
    if (unreadableCampaignCount) {
      setStatus('Aucune campagne lisible dans ce profil.');
      $('campaign-recovery').focus();
      return;
    }
    setStatus('Aucune campagne enregistrée dans ce profil.');
  }
  $('campaign-name').focus();
}

async function init() {
  try {
    try {
      lastCampaignId = localStorage.getItem('entre-rives:derniere-campagne');
      setLibraryLayout(localStorage.getItem('entre-rives:affichage-bibliotheque'));
    } catch { /* préférences facultatives */ }
    store = await openStudioStore();
    await loadCampaignInventory();
    const [playEngine, bestiaryEngine, oppositionEngine, pjEngine] = await Promise.allSettled([
      import('./protocole.mjs'), import('./atelier-bestiaire.mjs'), import('./opposition.mjs'), import('./pj-m02.mjs'),
    ]);
    playRules = playEngine.status === 'fulfilled' ? playEngine.value : undefined;
    bestiaryRules = bestiaryEngine.status === 'fulfilled' ? bestiaryEngine.value : undefined;
    oppositionRules = oppositionEngine.status === 'fulfilled' ? oppositionEngine.value : undefined;
    pjRules = pjEngine.status === 'fulfilled' ? pjEngine.value : undefined;
    $('play-engine-unavailable').hidden = Boolean(playRules);
    $('workshop-unavailable').hidden = Boolean(bestiaryRules);
    $('workshop-generate').disabled = !bestiaryRules;
    $('workshop-file').disabled = !bestiaryRules;
    if ('BroadcastChannel' in window) {
      notifications = new BroadcastChannel('entre-rives:notifications-studio');
      notifications.addEventListener('message', (event) => {
        if (event.data !== 'saved') return;
        revokeProjection();
        revokePlayerShare();
        setStatus('Une sauvegarde a été enregistrée dans un autre onglet');
      });
    }
    render();
    $('create-campaign-submit').disabled = false;
    $('backup-file').disabled = false;
    setStatus('Stockage local prêt');
    await followDiscoveryEntry();
  } catch (error) {
    showError(error);
  }
}

init();
