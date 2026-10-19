(() => {
  const hero = document.getElementById('hero');
  const experience = document.getElementById('ai-experience');
  const buttons = [...experience.querySelectorAll('[data-signal-button]')];
  const panels = [...experience.querySelectorAll('[data-demo-panel]')];
  const steps = [...experience.querySelectorAll('[data-scene-step]')];
  const insight = document.getElementById('insight-text');
  const announcement = document.getElementById('scene-announcement');
  const pause = document.getElementById('scene-pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const examples = {
    voice: 'Предложение найдено. Можно разобрать с командой.',
    video: 'Зона внимания найдена. Команда знает, что проверить.',
    sales: 'Предложение стало покупкой. Результат виден.',
  };
  let active = 0;
  let paused = motion.matches;
  let visible = false;
  let hovered = false;
  let focused = false;
  let timer;
  const pointerBackground = window.createLandingPointerBackground(
    hero, document.getElementById('hero-pointer-canvas'),
    () => !paused && visible && !motion.matches && !document.hidden,
  );

  function schedule() {
    clearTimeout(timer);
    if (paused || !visible || hovered || focused || document.hidden || motion.matches) return;
    timer = setTimeout(() => select((active + 1) % buttons.length), 6000);
  }
  function select(index, manual = false) {
    active = (index + buttons.length) % buttons.length;
    const signal = buttons[active].dataset.signalButton;
    experience.dataset.signal = signal;
    insight.textContent = examples[signal];
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    panels.forEach(panel => {
      panel.getAnimations({ subtree: false }).forEach(animation => animation.cancel());
      panel.hidden = panel.dataset.demoPanel !== signal;
      if (!panel.hidden && !motion.matches && !paused) {
        panel.animate([
          { opacity: 0, transform: 'translateY(9px)', filter: 'blur(2px)' },
          { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
        ], { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    });
    steps.forEach(step => step.classList.toggle('is-active', step.dataset.sceneStep === signal));
    if (manual) announcement.textContent = panels[active].querySelector('.hero-demo-title').textContent + ' ' + examples[signal];
    schedule();
  }
  function updateMotion() {
    const dormant = !visible || document.hidden;
    if (paused || motion.matches || dormant) {
      pointerBackground.reset();
      experience.style.removeProperty('--robot-x');
      experience.style.removeProperty('--robot-y');
    }
    hero.classList.toggle('is-offscreen', dormant);
    experience.classList.toggle('is-paused', paused || motion.matches || dormant);
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Продолжить анимацию' : 'Приостановить анимацию');
    pause.querySelector('path').setAttribute('d', paused ? 'm9 6 9 6-9 6Z' : 'M9 6v12M15 6v12');
    pause.hidden = motion.matches;
    schedule();
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index, true));
    button.addEventListener('keydown', event => {
      const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(event.key in moves) && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + moves[event.key] + 3) % 3;
      select(next, true);
      buttons[next].focus({ preventScroll: true });
    });
  });
  pause.addEventListener('click', () => { paused = !paused; updateMotion(); });
  experience.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    schedule();
  });
  experience.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    experience.style.removeProperty('--robot-x');
    experience.style.removeProperty('--robot-y');
    schedule();
  });
  experience.addEventListener('focusin', () => { focused = document.activeElement.matches(':focus-visible'); schedule(); });
  experience.addEventListener('focusout', event => {
    focused = experience.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible');
    schedule();
  });
  experience.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || paused || motion.matches || !pointer.matches || !visible) return;
    const bounds = experience.getBoundingClientRect();
    experience.style.setProperty('--robot-x', ((event.clientX - bounds.left) / bounds.width - .5) * 12 + 'px');
    experience.style.setProperty('--robot-y', ((event.clientY - bounds.top) / bounds.height - .5) * 9 + 'px');
  }, { passive: true });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  }).observe(hero);
  document.addEventListener('visibilitychange', updateMotion);
  motion.addEventListener('change', () => { paused = motion.matches; updateMotion(); });
  updateMotion();
})();
