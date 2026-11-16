/** Separate player-only entry. No import of MJ/storage/catalog/creator modules. */
export function mountIntegratedPlayer({owners,doc}){
 if(location.origin!=='http://127.0.0.1:4174')throw Error('Origine joueur incorrecte');
 if(!owners.player||typeof owners.player.mountPlayer!=='function')throw Error('Module STUDIO joueur absent');
 return owners.player.mountPlayer(doc.getElementById('player-root'),{
  window,studioOrigin:'http://127.0.0.1:4173',playerOrigin:'http://127.0.0.1:4174'
 });
}
