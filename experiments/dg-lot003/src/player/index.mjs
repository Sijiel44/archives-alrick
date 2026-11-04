import {PLAYER_READY,PLAYER_SHOW,PLAYER_CLEAR,PLAYER_DTO_SCHEMA,STUDIO_ORIGIN,PLAYER_ORIGIN,
  checkedPlayerOrigins,validatePlayerDTO} from '../studio/projection.mjs';

const el = (doc,tag,text='') => {const node=doc.createElement(tag); node.textContent=text; return node;};

/** No stateful side effects at module import. Player never persists content. */
export function mountPlayer(root, options={}) {
  if (!root || typeof root.replaceChildren !== 'function') throw new TypeError('Racine DOM requise');
  const view=options.window ?? root.ownerDocument.defaultView;
  const doc=root.ownerDocument;
  const expectedStudio=options.studioOrigin ?? STUDIO_ORIGIN;
  const expectedPlayer=options.playerOrigin ?? PLAYER_ORIGIN;
  const channel=new URL(view.location.href).searchParams.get('channel') ?? '';
  const valid=checkedPlayerOrigins(expectedStudio, expectedPlayer) && view.location.origin === expectedPlayer &&
    /^[a-f0-9-]{20,80}$/i.test(channel) && !!view.opener;
  let content=null;
  const render=()=>{
    const main=el(doc,'main');main.setAttribute('aria-label','Projection joueur');
    const h=el(doc,'h1','Fenêtre joueur');main.append(h);
    if (!valid) {main.append(el(doc,'p','Projection désactivée : origine ou fenêtre MJ non vérifiée.'));root.replaceChildren(main);return;}
    if (!content) {main.append(el(doc,'p','Aucune information publique transmise.'));root.replaceChildren(main);return;}
    const scene=content.scene;
    if (scene.title)main.append(el(doc,'h2',scene.title));
    if (scene.description)main.append(el(doc,'p',scene.description));
    if (scene.visibleActors.length) {
      const label=el(doc,'h3','Participants visibles'); const list=el(doc,'ul');
      for(const actor of scene.visibleActors)list.append(el(doc,'li',actor.label));
      main.append(label,list);
    }
    if (!scene.title&&!scene.description&&!scene.visibleActors.length)main.append(el(doc,'p','Aucune information publique sélectionnée.'));
    root.replaceChildren(main);
  };
  const onMessage=(event)=>{
    if (!valid || event.origin !== expectedStudio || event.source !== view.opener) return;
    const message=event.data;
    if (!message || typeof message !== 'object' || Array.isArray(message) || message.channel !== channel) return;
    if(message.kind === PLAYER_CLEAR){content=null;render();return;}
    if(message.kind !== PLAYER_SHOW)return;
    const safe=validatePlayerDTO(message.projection);
    if (!safe || safe.schema !== PLAYER_DTO_SCHEMA) return;
    content=safe;render();
  };
  view.addEventListener('message',onMessage);
  const clear=()=>{content=null;render();};
  view.addEventListener('pagehide',clear);
  render();
  if (valid) view.opener.postMessage({kind:PLAYER_READY,channel},expectedStudio);
  return {dispose(){content=null;view.removeEventListener('message',onMessage);view.removeEventListener('pagehide',clear);root.replaceChildren();},
    getProjection(){return content ? validatePlayerDTO(content) : null;}, isAuthorized:valid};
}
