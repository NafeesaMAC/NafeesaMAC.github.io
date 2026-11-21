// Scroll effects. All content is already in the HTML (for search engines and ATS tools);
// this only changes how it appears.
// 1. Sections below the first screen fade in as they scroll into view.
// 2. On touch screens (no hover), the Work card in the middle of the screen is highlighted.
// 3. In-page links (e.g. "See my work") show their target straight away, so they land exactly on it.
// 4. Buttons and menu pills press in visibly when tapped on touch screens.
// 5. The sticky header's height is measured so in-page links land just below it.
// 6. On phones the menu collapses behind a "Menu" button that expands it into a vertical list.
(() => {
  // Sticky header: keep --header-h equal to its real height, so in-page links land just below it.
  const header = document.querySelector('.site-header');
  const setHeight = () => header && document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  if (header) {
    setHeight();
    if ('ResizeObserver' in window) new ResizeObserver(setHeight).observe(header);
  }

  // Phones: the menu collapses behind a "Menu" button with an arrow. Without JavaScript the
  // menu simply stays visible (the collapsing only starts once .nav-ready is added here).
  const toggle = header && header.querySelector('.nav-toggle');
  if (toggle) {
    header.classList.add('nav-ready');
    const setOpen = (open) => {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      setHeight(); // update right away so in-page links land below the (now shorter) header
    };
    setOpen(false);
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));
    header.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { setOpen(false); toggle.focus(); }
    });
  }

  // Touch screens: show a visible press on buttons and menu pills. iOS only applies :active
  // when a touch listener exists; the class keeps the press visible briefly after the tap.
  document.addEventListener('touchstart', (event) => {
    const el = event.target.closest('.button, .site-header nav a');
    if (!el) return;
    el.classList.add('is-pressed');
    const release = () => setTimeout(() => el.classList.remove('is-pressed'), 180);
    el.addEventListener('touchend', release, { once: true });
    el.addEventListener('touchcancel', release, { once: true });
  }, { passive: true });

  if (!('IntersectionObserver' in window)) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. Touch screens: highlight the card nearest the middle of the screen (colour only when motion is reduced).
  if (window.matchMedia('(hover: none)').matches) {
    const cardObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-active', entry.isIntersecting);
    }, { rootMargin: '-38% 0px -38% 0px' });
    document.querySelectorAll('.card').forEach((card) => cardObserver.observe(card));
  }

  if (reduceMotion) return;

  // 1. Fade sections in.
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });

  for (const section of document.querySelectorAll('main section:not(.hero)')) {
    if (section.getBoundingClientRect().top < window.innerHeight) continue; // already visible
    section.classList.add('reveal');
    observer.observe(section);
  }

  // 3. Show the target of an in-page link at once, so the page lands exactly on its heading.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || link.pathname !== window.location.pathname) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (target) target.classList.add('is-visible');
  });
})();
