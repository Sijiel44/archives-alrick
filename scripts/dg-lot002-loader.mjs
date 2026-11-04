export async function resolve(specifier,context,nextResolve){
  if(specifier.startsWith('./')&&context.parentURL?.endsWith('.ts')){
    const candidate=specifier.endsWith('.js')?specifier.slice(0,-3)+'.ts':specifier.endsWith('.ts')?specifier:specifier+'.ts';
    return nextResolve(new URL(candidate,context.parentURL).href,context);
  }
  return nextResolve(specifier,context);
}
