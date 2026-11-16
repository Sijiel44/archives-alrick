import { QUEST_KINDS, QUEST_STATES, questSteps, questState, questParents } from './quetes.mjs';
const el = (tag, text, className) => {
  const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node;
};
const button = (text, handler) => { const node = el('button', text, 'secondary'); node.type = 'button'; node.addEventListener('click', handler); return node; };
const labelled = (parent, title, control) => { const label = el('label', title); label.append(control); parent.append(label); return control; };
const input = (id, type = 'text') => { const node = el('input'); node.id = id; node.type = type; return node; };
const select = id => { const node = el('select'); node.id = id; return node; };
const options = (control, values, placeholder) => {
  const current = control.value; control.replaceChildren(...(placeholder ? [new Option(placeholder, '')] : []), ...values.map(([id, name]) => new Option(name, id)));
  if ([...control.options].some(option => option.value === current)) control.value = current;
};
const date = value => new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function createQuestUI({ getCampaign, entries, canWrite, save, navigate, openResource, openScene, createQuest, prepare }) {
  const host = document.getElementById('view-quests');
  const header = el('header', undefined, 'quest-heading');
  const title = el('h1', 'Quêtes et indices'); title.id = 'quests-title'; title.tabIndex = -1;
  header.append(el('p', 'Le fil de la séance · Privé MJ', 'eyebrow accent'), title,
    el('p', 'Reliez les indices à plusieurs scènes, gardez les objectifs en vue et consignez les décisions de la table.', 'muted'));
  const toolbar = el('div', undefined, 'actions');
  toolbar.append(button('Nouvel indice', () => edit(undefined, 'clue')), button('Nouvel objectif', () => edit(undefined, 'objective')), button('Créer une quête', createQuest));
  const filters = el('div', undefined, 'quest-filters');
  const query = labelled(filters, 'Rechercher', input('quests-search', 'search'));
  const parentFilter = labelled(filters, 'Quête, mission ou aventure', select('quests-parent'));
  const sceneFilter = labelled(filters, 'Scène', select('quests-scene'));
  const stateFilter = labelled(filters, 'Afficher', select('quests-state'));
  options(stateFilter, [['open', 'À suivre'], ['all', 'Tous les états'], ['resolved', 'Accomplis ou exploités'], ['abandoned', 'Écartés ou abandonnés']]);
  const summary = el('p', '', 'muted'); summary.id = 'quests-summary'; summary.setAttribute('role', 'status');
  const board = el('div', undefined, 'quest-board'); board.id = 'quests-board';
  host.append(header, toolbar, filters, summary, board);

  const dialog = el('dialog', undefined, 'quest-dialog'); dialog.id = 'quest-edit-dialog'; dialog.setAttribute('aria-labelledby', 'quest-edit-title');
  const form = el('form'); form.id = 'quest-edit-form';
  const heading = el('h2', 'Préparer un indice'); heading.id = 'quest-edit-title';
  const feedback = el('div', undefined, 'form-feedback'); feedback.hidden = true;
  const formError = el('p', '', 'form-error'); formError.setAttribute('role', 'alert'); feedback.append(formError);
  const name = input('quest-step-title'); name.required = true; name.maxLength = 160;
  const parent = select('quest-step-parent');
  const sceneChoices = el('fieldset'); sceneChoices.id = 'quest-step-scenes';
  const refSelect = select('quest-step-reference'), chosen = el('ul', undefined, 'quest-references'); chosen.id = 'quest-step-references';
  const refSection = el('fieldset'); refSection.append(el('legend', 'Fiches reliées · 12 maximum'));
  labelled(refSection, 'Choisir une fiche de cette campagne ou du catalogue', refSelect);
  const addRef = button('Relier la fiche', () => {
    const value = refSelect.value; if (!value || references.includes(value) || references.length >= 12) return;
    references.push(value); renderReferences();
  }); refSection.append(addRef, chosen);
  const notes = el('textarea'); notes.id = 'quest-step-notes'; notes.maxLength = 8000; notes.rows = 4;
  const playerText = el('textarea'); playerText.id = 'quest-step-player-text'; playerText.maxLength = 4000; playerText.rows = 3;
  const buttons = el('div', undefined, 'actions'); const commit = el('button', 'Enregistrer'); commit.type = 'submit';
  buttons.append(commit, button('Fermer', () => { if (!working) dialog.close(); }));
  form.append(heading, feedback); labelled(form, 'Titre privé du suivi', name); labelled(form, 'Rattacher à une quête · facultatif', parent);
  form.append(sceneChoices, refSection); labelled(form, 'Préparation et notes privées MJ', notes);
  labelled(form, 'Texte destiné aux joueurs · facultatif', playerText);
  form.append(el('p', 'Le titre et les notes restent privés. Seul le texte destiné aux joueurs pourra être choisi dans l’aperçu de projection.', 'muted'), buttons);
  dialog.append(form); document.body.append(dialog);

  const decision = el('dialog', undefined, 'quest-dialog'); decision.id = 'quest-decision-dialog'; decision.setAttribute('aria-labelledby', 'quest-decision-title');
  const decisionForm = el('form'); decisionForm.id = 'quest-decision-form';
  const decisionHeading = el('h2'); decisionHeading.id = 'quest-decision-title';
  const decisionFeedback = el('div', undefined, 'form-feedback'); decisionFeedback.hidden = true;
  const decisionError = el('p', '', 'form-error'); decisionError.setAttribute('role', 'alert'); decisionFeedback.append(decisionError);
  const nextState = select('quest-decision-state'), reason = el('textarea'); reason.id = 'quest-decision-note'; reason.required = true; reason.maxLength = 1000; reason.rows = 3;
  decisionForm.append(decisionHeading, decisionFeedback); labelled(decisionForm, 'Nouvel état', nextState); labelled(decisionForm, 'Décision de la table et contexte · privé MJ', reason);
  const decisionButtons = el('div', undefined, 'actions'); const record = el('button', 'Consigner la décision'); record.type = 'submit';
  decisionButtons.append(record, button('Fermer', () => { if (!working) decision.close(); }));
  decisionForm.append(el('p', 'Cette décision est conservée dans l’historique. Revenir à un état précédent crée une nouvelle décision. Rien n’est diffusé aux joueurs.', 'muted'), decisionButtons);
  decision.append(decisionForm); document.body.append(decision);
  let attempt, working = false, references = [], returnFocus, campaignId;
  const sourceEntries = () => entries().filter(entry => !entry.record || entry.campaignId === getCampaign()?.id);
  const keyFor = entry => `${entry.record ? 'campaign' : 'catalogue'}:${entry.id}`;
  function renderReferences() {
    const available = sourceEntries().filter(entry => entry.id !== attempt?.id);
    const lookup = new Map(available.map(entry => [keyFor(entry), entry]));
    options(refSelect, available.filter(entry => !references.includes(keyFor(entry))).map(entry => [keyFor(entry), entry.name]), 'Choisir…');
    addRef.disabled = references.length >= 12;
    chosen.replaceChildren(...references.map(key => {
      const li = el('li'), entry = lookup.get(key);
      li.append(el('span', entry?.name ?? `Référence indisponible · ${key.slice(key.indexOf(':') + 1)}`),
        button(`Retirer ${entry?.name ?? 'la référence'}`, () => { references = references.filter(value => value !== key); renderReferences(); })); return li;
    }));
  }
  function capture(id, kind) {
    const campaign = getCampaign(); returnFocus = document.activeElement;
    attempt = { campaignId: campaign.id, revision: campaign.revision, id, kind };
  }
  function edit(step, kind = 'clue') {
    if (!canWrite()) return;
    capture(step?.id ?? `quest-step-${crypto.randomUUID()}`, step?.kind ?? kind);
    form.reset(); feedback.hidden = true; heading.textContent = `${step ? 'Modifier' : 'Préparer'} ${attempt.kind === 'clue' ? 'un indice' : 'un objectif'}`;
    name.value = step?.title ?? ''; notes.value = step?.notes ?? ''; playerText.value = step?.playerText ?? '';
    options(parent, questParents(getCampaign()).map(entry => [entry.id, entry.name]), 'Sans quête'); parent.value = step?.questId ?? parentFilter.value;
    sceneChoices.replaceChildren(el('legend', 'Scènes possibles · plusieurs chemins, 20 maximum'));
    for (const scene of getCampaign().scenes) {
      const check = input(`quest-scene-${scene.id}`, 'checkbox'); check.name = 'sceneIds'; check.value = scene.id;
      check.checked = step ? step.sceneIds.includes(scene.id) : scene.id === sceneFilter.value;
      const label = el('label', undefined, 'check-label'); label.append(check, el('span', scene.title)); sceneChoices.append(label);
    }
    if (!getCampaign().scenes.length) sceneChoices.append(el('p', 'Ajoutez des scènes dans Préparer pour les relier ici.', 'muted'));
    references = (step?.references ?? []).map(ref => `${ref.scope}:${ref.id}`); renderReferences();
    dialog.showModal(); name.focus();
  }
  function decide(step) {
    if (!canWrite()) return; capture(step.id, step.kind); decisionForm.reset(); decisionFeedback.hidden = true;
    decisionHeading.textContent = `Décision · ${step.title}`;
    options(nextState, Object.entries(QUEST_STATES[step.kind]).filter(([state]) => state !== questState(step)));
    decision.showModal(); nextState.focus();
  }
  async function submit(event, isDecision) {
    event.preventDefault(); if (!attempt || working || !canWrite()) return;
    const campaign = getCampaign(), owner = isDecision ? decisionForm : form, error = isDecision ? decisionError : formError;
    const reject = message => { error.parentElement.hidden = false; error.textContent = message; };
    if (campaign.id !== attempt.campaignId || campaign.revision !== attempt.revision) return reject('La campagne a changé. Fermez puis rouvrez ce formulaire pour travailler sur sa version actuelle. Vos champs restent visibles.');
    const data = isDecision ? { id: attempt.id, state: nextState.value, note: reason.value.trim(), at: attempt.at ??= new Date().toISOString() }
      : { id: attempt.id, kind: attempt.kind, questId: parent.value || null, title: name.value.trim(), notes: notes.value, playerText: playerText.value,
        sceneIds: [...sceneChoices.querySelectorAll('input:checked')].map(check => check.value),
        references: references.map(key => ({ scope: key.slice(0, key.indexOf(':')), id: key.slice(key.indexOf(':') + 1) })) };
    if (!isDecision && (!data.title || data.sceneIds.length > 20)) return reject('Indiquez un titre et choisissez au plus vingt scènes.');
    if (isDecision && !data.note) return reject('Indiquez la décision de la table.');
    const type = isDecision ? 'record-quest-decision' : 'save-quest-step', signature = JSON.stringify({ type, data });
    if (signature !== attempt.signature) { attempt.signature = signature; attempt.command = { id: campaign.id, expectedRevision: attempt.revision, operationId: crypto.randomUUID(), type, data }; }
    working = true;
    try { await save(attempt.command, { form: owner, onSaved: () => (isDecision ? decision : dialog).close() }); }
    finally { working = false; }
  }
  form.addEventListener('submit', event => void submit(event, false)); decisionForm.addEventListener('submit', event => void submit(event, true));
  for (const modal of [dialog, decision]) {
    modal.addEventListener('cancel', event => { if (working) event.preventDefault(); });
    modal.addEventListener('close', () => {
      if (modal.open) return;
      attempt = undefined; queueMicrotask(() => (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : title).focus());
    });
  }
  function render() {
    const campaign = getCampaign();
    if (campaign?.id !== campaignId) { campaignId = campaign?.id; query.value = ''; parentFilter.value = ''; sceneFilter.value = ''; stateFilter.value = 'open'; }
    options(parentFilter, questParents(campaign).map(entry => [entry.id, entry.name]), 'Toutes les quêtes');
    options(sceneFilter, (campaign?.scenes ?? []).map(scene => [scene.id, scene.title]), 'Toutes les scènes');
    const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');
    const filtered = questSteps(campaign).filter(step => (!parentFilter.value || step.questId === parentFilter.value) &&
      (!sceneFilter.value || step.sceneIds.includes(sceneFilter.value)) && normalize(`${step.title} ${step.notes} ${step.playerText}`).includes(normalize(query.value)) &&
      (stateFilter.value === 'all' || stateFilter.value === 'open' ? stateFilter.value === 'all' || ['planned', 'revealed'].includes(questState(step)) : questState(step) === stateFilter.value));
    summary.textContent = `${filtered.length} élément(s) affiché(s) · ${questSteps(campaign).length} dans la campagne. Les décisions et préparations restent privées.`;
    const groups = new Map(); for (const step of filtered) { if (!groups.has(step.questId)) groups.set(step.questId, []); groups.get(step.questId).push(step); }
    board.replaceChildren(...[...groups].map(([parentId, steps]) => {
      const group = el('section', undefined, 'quest-group'), parent = questParents(campaign).find(entry => entry.id === parentId);
      const groupHeading = el('h2'); groupHeading.append(parent ? button(parent.name, () => openResource(parent.id)) : el('span', 'Pistes indépendantes'));
      group.append(groupHeading); const cards = el('div', undefined, 'quest-cards');
      for (const step of steps) {
        const card = el('article', undefined, 'quest-card'); card.dataset.stepId = step.id; card.dataset.state = questState(step);
        const heading = el('h3'); heading.append(button(step.title, () => openResource(step.id)));
        card.append(el('p', QUEST_KINDS[step.kind], 'eyebrow accent'), heading, el('span', QUEST_STATES[step.kind][questState(step)], 'badge'));
        const links = el('div', undefined, 'quest-scenes');
        for (const scene of campaign.scenes.filter(scene => step.sceneIds.includes(scene.id))) links.append(button(scene.title, () => openScene(scene.id)));
        if (!step.sceneIds.length) links.append(el('span', 'Aucune scène associée', 'muted'));
        card.append(links);
        const actions = el('div', undefined, 'actions');
        const modify = button('Modifier', () => edit(step)); modify.setAttribute('aria-label', `Modifier le suivi ${step.title}`);
        const decideButton = button('Consigner une décision', () => decide(step)); decideButton.setAttribute('aria-label', `Consigner une décision pour ${step.title}`);
        actions.append(modify, decideButton);
        if (step.playerText.trim()) actions.append(button('Préparer pour les joueurs', event => prepare(step, event.currentTarget)));
        card.append(actions);
        const history = el('details'); history.append(el('summary', `Historique · ${step.history.length} décision(s)`));
        const list = el('ol');
        for (const entry of [...step.history].reverse()) list.append(el('li', `${date(entry.at)} · ${QUEST_STATES[step.kind][entry.from]} → ${QUEST_STATES[step.kind][entry.to]} · ${entry.note}`));
        history.append(list); card.append(history); cards.append(card);
      }
      group.append(cards); return group;
    }));
    if (!filtered.length) board.append(el('p', questSteps(campaign).length ? 'Aucun résultat avec ces filtres.' : 'Commencez par un indice ou un objectif. Vous pourrez le relier à une quête et à plusieurs scènes.', 'quest-empty'));
    for (const control of toolbar.querySelectorAll('button')) control.disabled = !campaign;
  }
  for (const control of [query, parentFilter, sceneFilter, stateFilter]) control.addEventListener('input', render);
  return { render, edit, decide, open({ sceneId = '', questId = '' } = {}) {
    if (!getCampaign() || !canWrite()) return; render(); query.value = ''; sceneFilter.value = sceneId; parentFilter.value = questId; stateFilter.value = 'all'; navigate('quests'); render(); title.focus();
  } };
}
