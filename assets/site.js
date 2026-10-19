const sections = [...document.querySelectorAll('.panel')];
const nav = [...document.querySelectorAll('.page-nav a')];
window.__landingSection = 'hero';
const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const id = entry.target.id;
    window.__landingSection = id;
    document.dispatchEvent(new CustomEvent('landing:sectionchange', { detail: id }));
    nav.forEach((link) => link.setAttribute('aria-current', String(link.hash === '#' + id)));
  }
}, { rootMargin: '-20% 0px -79% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

