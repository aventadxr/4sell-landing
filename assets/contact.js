(() => {
  const section = document.getElementById('contact');
  const stage = document.getElementById('contact-form-stage');
  const form = document.getElementById('contact-form');
  const fields = document.getElementById('contact-fields');
  const thanks = document.getElementById('contact-thanks');
  const thanksTitle = document.getElementById('contact-thanks-title');
  const announcement = document.getElementById('contact-announcement');
  const pauseButton = document.getElementById('contact-pause');
  const socials = [...section.querySelectorAll('.hello-social')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let visible = false;
  let paused = false;
  let state = 'idle';
  let revealTimer = 0;
  let finishTimer = 0;

  const pointerBackground = window.createLandingPointerBackground(
    section, document.getElementById('contact-pointer-canvas'),
    () => visible && !paused && !motion.matches && !document.hidden,
  );

  function updateActivity() {
    section.classList.toggle('is-dormant', !visible || document.hidden);
    section.classList.toggle('is-paused', paused || motion.matches);
    pauseButton.hidden = motion.matches;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Продолжить анимацию контактов' : 'Остановить анимацию контактов');
    pauseButton.querySelector('path').setAttribute('d', paused ? 'm9 6 9 6-9 6Z' : 'M9 6v12M15 6v12');
    pauseButton.querySelector('span').textContent = paused ? 'Продолжить движение' : 'Остановить движение';
    if (!visible || paused || motion.matches || document.hidden) {
      pointerBackground.reset();
      socials.forEach(link => {
        link.style.removeProperty('--object-x');
        link.style.removeProperty('--object-y');
      });
    }
  }

  socials.forEach(link => {
    link.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !pointer.matches || paused || !visible || motion.matches) return;
      const bounds = link.getBoundingClientRect();
      link.style.setProperty('--object-x', ((event.clientX - bounds.left) / bounds.width - .5) * 12 + 'deg');
      link.style.setProperty('--object-y', -((event.clientY - bounds.top) / bounds.height - .5) * 10 + 'deg');
    }, { passive: true });
    link.addEventListener('pointerleave', () => {
      link.style.removeProperty('--object-x');
      link.style.removeProperty('--object-y');
    });
  });
  pauseButton.addEventListener('click', () => { paused = !paused; updateActivity(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateActivity(); }).observe(section);
  document.addEventListener('visibilitychange', updateActivity);

  function revealThanks() {
    thanks.hidden = false;
    thanks.classList.add('is-entering');
  }
  function finishFold() {
    clearTimeout(revealTimer);
    clearTimeout(finishTimer);
    state = stage.dataset.state = 'sent';
    if (thanks.hidden) revealThanks();
    form.setAttribute('aria-hidden', 'true');
    stage.removeAttribute('aria-busy');
    announcement.textContent = 'Показан пример подтверждения. Это макет: заявка не отправлялась.';
    if (visible && !document.hidden) thanksTitle.focus({ preventScroll: true });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (state !== 'idle' || !form.reportValidity()) return;
    // Preview only, as requested: no request, navigation, persistence or analytics.
    state = stage.dataset.state = 'folding';
    stage.setAttribute('aria-busy', 'true');
    fields.disabled = true;
    form.inert = true;
    announcement.textContent = 'Складываем ваш бумажный самолётик.';
    if (motion.matches) {
      finishFold();
      return;
    }
    revealTimer = setTimeout(revealThanks, 1500);
    finishTimer = setTimeout(finishFold, 2450);
  });
  document.getElementById('contact-restart').addEventListener('click', () => {
    clearTimeout(revealTimer);
    clearTimeout(finishTimer);
    thanks.hidden = true;
    thanks.classList.remove('is-entering');
    form.removeAttribute('aria-hidden');
    form.inert = false;
    fields.disabled = false;
    form.reset();
    state = stage.dataset.state = 'idle';
    announcement.textContent = '';
    form.elements.name.focus({ preventScroll: true });
  });
  motion.addEventListener('change', () => {
    updateActivity();
    if (motion.matches && state === 'folding') finishFold();
  });
  updateActivity();
})();
