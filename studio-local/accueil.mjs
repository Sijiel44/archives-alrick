const menu = document.getElementById('parcours-menu');

menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.hidePopover();
});
