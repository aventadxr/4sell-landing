window.createLandingPointerBackground = (section, canvas, isActive) => {
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const context = canvas.getContext('2d');
  if (!context) return { reset() {} };

  const particles = [];
  const maxParticles = 64;
  let frame = 0;
  let width = 0;
  let height = 0;
  let previousTime = 0;
  let lastMovement = 0;
  let cursor = null;
  let trail = null;
  let glow = null;

  function enabled() {
    return pointer.matches && isActive();
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    particles.length = 0;
    cursor = trail = glow = null;
    context.clearRect(0, 0, width, height);
  }

  function position(event) {
    const bounds = section.getBoundingClientRect();
    if (width !== bounds.width || height !== bounds.height) {
      width = bounds.width;
      height = bounds.height;
      // Limit the backing bitmap on high-density and very large displays.
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, 2560 / width, 1600 / height);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
    }
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function emit(x, y, dx = 0, dy = 0, burst = false) {
    if (particles.length >= maxParticles) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = (burst ? 45 : 18) + Math.random() * 48;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed - dx * .25,
      vy: Math.sin(angle) * speed - dy * .25 - 12,
      size: 5 + Math.random() * (burst ? 16 : 12),
      sides: [3, 3, 4, 6][Math.floor(Math.random() * 4)],
      rotation: angle,
      spin: (Math.random() - .5) * 1.8,
      age: 0,
      life: 1 + Math.random() * .9,
    });
  }

  function wake() {
    if (frame) return;
    previousTime = performance.now();
    frame = requestAnimationFrame(draw);
  }

  function draw(now) {
    frame = 0;
    if (!enabled()) { reset(); return; }
    const delta = Math.min((now - previousTime) / 1000, .04);
    previousTime = now;
    context.clearRect(0, 0, width, height);

    if (cursor && trail) {
      const dx = cursor.x - trail.x;
      const dy = cursor.y - trail.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= 12) {
        const count = Math.min(6, Math.floor(distance / 12));
        for (let i = 1; i <= count; i++) {
          emit(trail.x + dx * i / count, trail.y + dy * i / count,
            dx / distance * 45, dy / distance * 45);
        }
        trail = { ...cursor };
      }
    }

    const activity = Math.max(0, 1 - (now - lastMovement) / 1100);
    if (glow && cursor && activity > 0) {
      const ease = 1 - Math.exp(-12 * delta);
      glow.x += (cursor.x - glow.x) * ease;
      glow.y += (cursor.y - glow.y) * ease;
      const light = context.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 185);
      light.addColorStop(0, `rgba(206, 248, 121, ${.12 * activity})`);
      light.addColorStop(.35, `rgba(160, 211, 101, ${.055 * activity})`);
      light.addColorStop(1, 'rgba(160, 211, 101, 0)');
      context.fillStyle = light;
      context.fillRect(glow.x - 185, glow.y - 185, 370, 370);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      particle.age += delta;
      if (particle.age >= particle.life) { particles.splice(i, 1); continue; }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= Math.exp(-1.1 * delta);
      particle.vy *= Math.exp(-1.1 * delta);
      particle.rotation += particle.spin * delta;
      const remaining = 1 - particle.age / particle.life;
      const opacity = Math.min(1, particle.age * 12) * remaining * remaining;
      const radius = particle.size * (.7 + .3 * remaining);

      const neighbor = particles[i - 1];
      if (neighbor && Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y) < 75) {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(neighbor.x, neighbor.y);
        context.strokeStyle = `rgba(198, 236, 141, ${opacity * .13})`;
        context.lineWidth = .6;
        context.stroke();
      }

      context.beginPath();
      for (let vertex = 0; vertex < particle.sides; vertex++) {
        const angle = particle.rotation + vertex * Math.PI * 2 / particle.sides;
        const x = particle.x + Math.cos(angle) * radius;
        const y = particle.y + Math.sin(angle) * radius;
        if (vertex === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.fillStyle = `rgba(196, 237, 130, ${opacity * .055})`;
      context.strokeStyle = `rgba(211, 248, 158, ${opacity * .65})`;
      context.lineWidth = .9;
      context.fill();
      context.stroke();
    }

    // Stop the loop entirely once the trail has faded; pointer movement wakes it.
    if (particles.length || activity > 0) frame = requestAnimationFrame(draw);
  }

  section.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !enabled()) return;
    cursor = position(event);
    lastMovement = performance.now();
    if (!trail) { trail = { ...cursor }; glow = { ...cursor }; }
    wake();
  }, { passive: true });
  section.addEventListener('pointerleave', () => { cursor = trail = null; });
  section.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !enabled()) return;
    if (event.target.closest('a, button, input, select, textarea')) return;
    cursor = position(event);
    trail = { ...cursor };
    glow = { ...cursor };
    lastMovement = performance.now();
    for (let i = 0; i < 12; i++) emit(cursor.x, cursor.y, 0, 0, true);
    wake();
  });
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('scroll', reset, { passive: true });
  pointer.addEventListener('change', reset);
  return { reset };
};
