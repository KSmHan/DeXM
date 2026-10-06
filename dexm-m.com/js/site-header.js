// Site header for standalone tool pages: burger menu + Tools dropdown (mirrors js/main.js)
(function () {
  const header = document.getElementById('dxh');
  if (!header) return;
  const toggle = header.querySelector('.dxh-toggle');
  const dd = header.querySelector('.dxh-dd');
  const ddBtn = dd && dd.querySelector('.dxh-dd-toggle');

  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  function setDd(open) {
    if (!dd) return;
    dd.classList.toggle('open', open);
    ddBtn.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!header.classList.contains('nav-open')); });
  if (ddBtn) ddBtn.addEventListener('click', (e) => { e.stopPropagation(); setDd(!dd.classList.contains('open')); });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) setOpen(false);
    if (dd && !dd.contains(e.target)) setDd(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); setDd(false); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
  // Back/forward cache restores the page as it was left, menus included
  window.addEventListener('pageshow', () => { setOpen(false); setDd(false); });

  // Highlight the current page in the menu
  const here = location.pathname.replace(/\.html$/, '');
  header.querySelectorAll('.dxh-nav a').forEach(a => {
    if (a.pathname === here) { a.classList.add('active'); if (dd && dd.contains(a)) ddBtn.classList.add('active'); }
  });
})();
