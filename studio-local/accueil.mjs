const menu = document.getElementById('parcours-menu');

menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.hidePopover();
});

for (const [anchor, details] of [['#joueurs-table', 'joueurs-accords'], ['#joueurs-essai', 'joueurs-des']]) {
  document.querySelector(`.public-route nav a[href="${anchor}"]`).addEventListener('click', () => {
    document.getElementById(details).open = true;
  });
}
