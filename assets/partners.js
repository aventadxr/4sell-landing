(() => {
  const section = document.getElementById('clients');
  const universe = document.getElementById('partners-universe');
  const core = document.getElementById('partners-core');
  const buttons = [...universe.querySelectorAll('[data-partner]')];
  const review = document.getElementById('partner-review');
  const reviewLogo = document.getElementById('partner-review-logo');
  const pauseButton = document.getElementById('partners-pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  // Fictional drafts for this mockup, explicitly labeled beside every review.
  // Client names were checked against production; no client quotes were retrieved.
  const partners = {
    yuzhny: { name: 'ЮЖНый', category: 'Сеть супермаркетов', featured: true,
      quote: 'Для сети важно видеть не только итоговые цифры, но и то, что за ними стоит. Так проще обсуждать с командой конкретные действия для каждого магазина.' },
    hani: { name: 'HANI', category: 'Кофейни и кондитерские',
      quote: 'Когда допродажа становится видимой, о ней легче говорить с командой. Сотрудникам понятнее, как их внимание к гостю связано с результатом.' },
    coffeehub: { name: 'Coffee-Hub', category: 'Кофейни',
      quote: 'В ежедневной работе хочется быстрее замечать удачные предложения. Разговор, чек и результат в одной картине помогают понять, какой опыт стоит повторить.' },
    olymp: { name: 'OLYMP', category: 'Медицинские лаборатории',
      quote: 'Качество начинается с разговора. Важно видеть, как общаются с клиентами, и разбирать с командой конкретные ситуации, а не только общие оценки.' },
    costa: { name: 'Costa Coffee', category: 'Сеть кофеен',
      quote: 'За каждой чашкой — разговор с гостем. Когда лучше понимаешь эти разговоры, легче находить темы для обучения и поддерживать единый подход к сервису.' },
    qazaq: { name: 'Qazaq Oil', category: 'Сеть автозаправочных станций',
      quote: 'В большой сети важна общая картина и внимание к каждой точке. Удобно, когда руководитель может быстро перейти от показателя к конкретной ситуации.' },
    salemchik: { name: 'SalemChick', category: 'Рестораны быстрого питания',
      quote: 'Хочется, чтобы команда видела смысл в каждом дополнительном предложении. Прозрачные результаты и понятная мотивация делают эту работу ближе к людям.' },
    biopharma: { name: 'Biopharma', category: 'Фармацевтика',
      quote: 'Нам важно, чтобы консультация была внимательной и полезной. Разбор конкретных разговоров помогает находить, что поддержать и чему уделить внимание в обучении.' },
  };
  let selected = 0;
  let paused = false;
  let visible = false;
  const field = createNeuralField();

  function select(index, focus = false, scroll = false) {
    selected = (index + buttons.length) % buttons.length;
    const button = buttons[selected];
    const partner = partners[button.dataset.partner];
    buttons.forEach((item, i) => {
      item.setAttribute('aria-selected', String(i === selected));
      item.tabIndex = i === selected ? 0 : -1;
    });
    reviewLogo.src = button.querySelector('img').getAttribute('src');
    reviewLogo.alt = partner.name;
    document.getElementById('partner-review-category').textContent = partner.category;
    document.getElementById('partner-review-quote').textContent = partner.quote;
    const badge = document.getElementById('partner-review-badge');
    badge.textContent = partner.featured ? 'Крупнейший партнёр 4sell' : 'Партнёр 4sell';
    badge.dataset.featured = String(Boolean(partner.featured));
    document.getElementById('partner-review-count').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(buttons.length).padStart(2, '0')}`;
    review.setAttribute('aria-labelledby', button.id);
    field.setActive(selected);
    if (!motion.matches && !paused) {
      const text = document.getElementById('partner-review-text');
      text.getAnimations().forEach((animation) => animation.cancel());
      text.animate([{ opacity: .35, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
    }
    if (focus) button.focus();
    if (scroll && matchMedia('(max-width: 600px)').matches) review.scrollIntoView({ block: 'nearest', behavior: motion.matches ? 'instant' : 'smooth' });
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => select(index, false, true));
    button.addEventListener('pointerenter', () => field.highlight(index));
    button.addEventListener('pointerleave', () => field.highlight(null));
    button.addEventListener('focus', () => field.highlight(index));
    button.addEventListener('blur', () => field.highlight(null));
    button.addEventListener('keydown', (event) => {
      const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (event.key in moves) { event.preventDefault(); select(index + moves[event.key], true); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); select(event.key === 'Home' ? 0 : buttons.length - 1, true); }
    });
  });
  document.getElementById('partner-prev').addEventListener('click', () => select(selected - 1));
  document.getElementById('partner-next').addEventListener('click', () => select(selected + 1));

  function updateActivity() {
    section.classList.toggle('is-dormant', !visible || document.hidden);
    section.classList.toggle('is-paused', paused);
    field.updateActivity();
  }
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Продолжить движение нейронной сети' : 'Приостановить движение нейронной сети');
    pauseButton.querySelector('span').textContent = paused ? 'Продолжить движение' : 'Остановить движение';
    pauseButton.querySelector('path').setAttribute('d', paused ? 'm9 5 10 7-10 7Z' : 'M9 6v12M15 6v12');
    updateActivity();
  });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateActivity(); }).observe(section);
  document.addEventListener('visibilitychange', updateActivity);
  motion.addEventListener('change', updateActivity);

  function createNeuralField() {
    const canvas = document.getElementById('partners-canvas');
    const context = canvas.getContext('2d');
    if (!context) return { setActive() {}, highlight() {}, updateActivity() {} };
    let width = 0;
    let height = 0;
    let routes = [];
    let points = [];
    let edges = [];
    let stars = [];
    let active = 0;
    let hovered = null;
    let fieldVisible = false;
    let frame = 0;
    let layoutFrame = 0;
    let previousTime = 0;
    let phase = 0;
    let cursor = null;
    let pointerStrength = 0;
    let ripples = [];
    const colors = ['174, 217, 174', '182, 189, 230', '228, 232, 173'];
    const glows = colors.map((color) => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = 64;
      const brush = sprite.getContext('2d');
      const light = brush.createRadialGradient(32, 32, 0, 32, 32, 32);
      light.addColorStop(0, `rgba(${color}, .9)`);
      light.addColorStop(.12, `rgba(${color}, .55)`);
      light.addColorStop(.35, `rgba(${color}, .12)`);
      light.addColorStop(1, `rgba(${color}, 0)`);
      brush.fillStyle = light;
      brush.fillRect(0, 0, 64, 64);
      return sprite;
    });

    function canRun() {
      return visible && fieldVisible && !paused && !motion.matches && !document.hidden;
    }
    function curve(route, t) {
      const u = 1 - t;
      return {
        x: u ** 3 * route.a.x + 3 * u * u * t * route.b.x + 3 * u * t * t * route.c.x + t ** 3 * route.d.x,
        y: u ** 3 * route.a.y + 3 * u * u * t * route.b.y + 3 * u * t * t * route.c.y + t ** 3 * route.d.y,
      };
    }

    function rebuild() {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      width = bounds.width;
      height = bounds.height;
      const scale = Math.min(devicePixelRatio || 1, 1.5, 2400 / width, 1400 / height);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const box = core.getBoundingClientRect();
      const center = { x: box.left - bounds.left + box.width / 2, y: box.top - bounds.top + box.height / 2 };
      let seed = 472;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const jitter = (amount) => (random() + random() + random() - 1.5) * amount;
      points = []; routes = []; edges = []; stars = [];
      function addPoint(x, y, branch, knot = false) {
        points.push({ baseX: x, baseY: y, x, y, branch, knot, phase: random() * Math.PI * 2, radius: knot ? 1.6 + random() : .35 + random() * 1.1, alpha: .25 + random() * .5, influence: 0 });
      }
      buttons.forEach((button, index) => {
        const target = button.getBoundingClientRect();
        const end = { x: target.left - bounds.left + target.width / 2, y: target.top - bounds.top + target.height / 2 };
        const dx = end.x - center.x;
        const dy = end.y - center.y;
        const distance = Math.hypot(dx, dy);
        const normal = { x: -dy / distance, y: dx / distance };
        const bend = (index % 2 ? -1 : 1) * distance * .17;
        const route = {
          a: center, b: { x: center.x + dx * .28 + normal.x * bend, y: center.y + dy * .28 + normal.y * bend },
          c: { x: center.x + dx * .72 - normal.x * bend * .5, y: center.y + dy * .72 - normal.y * bend * .5 }, d: end,
        };
        routes.push(route);
        const samples = width < 650 ? 29 : 48;
        for (let i = 0; i <= samples; i++) {
          const at = curve(route, i / samples);
          addPoint(at.x + jitter(19), at.y + jitter(19), index, i % 9 === 4);
          if (i % 2 === 0) addPoint(at.x + jitter(42), at.y + jitter(42), index);
        }
        // Small clusters and dendrites make the network organic, rather than a radial chart.
        const knot = curve(route, .62);
        for (let i = 0; i < (width < 650 ? 14 : 24); i++) addPoint(knot.x + jitter(53), knot.y + jitter(53), index, i === 0);
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 1; i <= (width < 650 ? 7 : 10); i++) {
            const length = i * (width < 650 ? 4 : 7);
            addPoint(knot.x + normal.x * length * side + jitter(9), knot.y + normal.y * length * side + jitter(9), index);
          }
        }
      });
      const maxDistance = width < 650 ? 37 : 66;
      const seen = new Set();
      // Spatial buckets keep the denser field inexpensive to rebuild on resize.
      const buckets = new Map();
      points.forEach((point, i) => {
        const key = Math.floor(point.x / maxDistance) + ':' + Math.floor(point.y / maxDistance);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(i);
      });
      points.forEach((point, i) => {
        const column = Math.floor(point.x / maxDistance);
        const row = Math.floor(point.y / maxDistance);
        const nearby = [];
        for (let x = column - 1; x <= column + 1; x++) {
          for (let y = row - 1; y <= row + 1; y++) {
            for (const j of buckets.get(x + ':' + y) || []) {
              if (j === i) continue;
              const other = points[j];
              const distance = Math.hypot(point.x - other.x, point.y - other.y);
              if (distance > 4 && distance < maxDistance) nearby.push({ j, distance });
            }
          }
        }
        const neighbors = nearby.sort((a, b) => a.distance - b.distance).slice(0, point.knot ? 7 : 4);
        neighbors.forEach(({ j, distance }) => {
          const key = `${Math.min(i, j)}:${Math.max(i, j)}`;
          if (!seen.has(key)) { seen.add(key); edges.push({ a: i, b: j, alpha: .08 + (1 - distance / maxDistance) * .17 }); }
        });
      });
      for (let i = 0; i < (width < 650 ? 55 : 115); i++) {
        stars.push({ x: random() * width, y: random() * height, size: .25 + random() * .65, alpha: .1 + random() * .3, phase: random() * 6 });
      }
      cursor = null;
      pointerStrength = 0;
      ripples = [];
      draw(0);
      schedule();
    }

    function draw(delta) {
      context.clearRect(0, 0, width, height);
      const highlighted = hovered === null ? active : hovered;
      const attraction = 1 - Math.exp(-8 * delta);
      pointerStrength += ((cursor ? 1 : 0) - pointerStrength) * (delta ? attraction : 1);
      for (const star of stars) {
        context.fillStyle = `rgba(184, 202, 186, ${star.alpha * (.7 + Math.sin(phase * .5 + star.phase) * .3)})`;
        context.fillRect(star.x, star.y, star.size, star.size);
      }
      for (const ripple of ripples) ripple.age += delta;
      ripples = ripples.filter((ripple) => ripple.age < 1.1);
      for (const point of points) {
        const drift = motion.matches ? 0 : 1;
        let x = point.baseX + Math.sin(phase * .55 + point.phase) * 3 * drift;
        let y = point.baseY + Math.cos(phase * .42 + point.phase) * 3.6 * drift;
        point.influence = 0;
        if (cursor && pointerStrength > .01) {
          const dx = cursor.x - x;
          const dy = cursor.y - y;
          const distance = Math.hypot(dx, dy);
          const pull = Math.max(0, 1 - distance / 155) * pointerStrength;
          x += dx * pull * .22;
          y += dy * pull * .22;
          point.influence = pull;
        }
        for (const ripple of ripples) {
          const distance = Math.hypot(x - ripple.x, y - ripple.y);
          point.influence = Math.max(point.influence, Math.max(0, 1 - Math.abs(distance - ripple.age * 230) / 24) * (1 - ripple.age / 1.1));
        }
        point.x += (x - point.x) * (delta ? attraction : 1);
        point.y += (y - point.y) * (delta ? attraction : 1);
      }
      routes.forEach((route, index) => {
        const selected = index === highlighted;
        const tint = selected ? 2 : index < 4 ? 0 : 1;
        context.beginPath();
        context.moveTo(route.a.x, route.a.y);
        context.bezierCurveTo(route.b.x, route.b.y, route.c.x, route.c.y, route.d.x, route.d.y);
        context.lineWidth = selected ? 1.2 : .65;
        context.strokeStyle = `rgba(${colors[tint]}, ${selected ? .32 : .1})`;
        context.stroke();
        const knot = curve(route, .62);
        context.globalAlpha = selected ? .22 : .1;
        context.drawImage(glows[tint], knot.x - 65, knot.y - 65, 130, 130);
        context.globalAlpha = 1;
        const progress = (phase * .13 + index * .137) % 1;
        const signal = curve(route, progress);
        const pulseAlpha = Math.sin(progress * Math.PI) * (selected ? .85 : .3);
        context.globalAlpha = pulseAlpha;
        context.drawImage(glows[tint], signal.x - 13, signal.y - 13, 26, 26);
        context.globalAlpha = 1;
      });
      for (const edge of edges) {
        const a = points[edge.a];
        const b = points[edge.b];
        const selected = a.branch === highlighted && b.branch === highlighted;
        const influence = Math.max(a.influence, b.influence);
        const color = selected ? colors[2] : a.branch < 4 ? colors[0] : colors[1];
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.lineWidth = .55 + influence * .45;
        context.strokeStyle = `rgba(${color}, ${Math.min(.7, edge.alpha * (selected ? 1.7 : 1) + influence * .38)})`;
        context.stroke();
      }
      for (const point of points) {
        const selected = point.branch === highlighted;
        const tint = selected ? 2 : point.branch < 4 ? 0 : 1;
        const opacity = Math.min(1, point.alpha * (selected ? 1.2 : .8) + point.influence * .7);
        const radius = point.radius + point.influence * 1.5;
        if (point.knot || point.influence > .45) {
          const size = radius * (point.knot ? 13 : 8);
          context.globalAlpha = opacity * .65;
          context.drawImage(glows[tint], point.x - size / 2, point.y - size / 2, size, size);
          context.globalAlpha = 1;
        }
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${colors[tint]}, ${opacity})`;
        context.fill();
      }
      if (cursor && pointerStrength > .01) {
        context.globalAlpha = pointerStrength * .12;
        context.drawImage(glows[1], cursor.x - 125, cursor.y - 125, 250, 250);
        context.globalAlpha = 1;
        context.beginPath();
        context.ellipse(cursor.x, cursor.y, 29, 12, -.45, phase * .6, phase * .6 + Math.PI * 1.65);
        context.strokeStyle = `rgba(208, 226, 190, ${pointerStrength * .3})`;
        context.lineWidth = .7;
        context.stroke();
      }
    }

    function tick(now) {
      frame = 0;
      if (!canRun()) return;
      // Cap the active scene at 30 fps; the graph is built only on layout changes.
      if (now - previousTime >= 32) {
        const delta = Math.min(.05, (now - previousTime) / 1000);
        previousTime = now;
        phase += delta;
        draw(delta);
      }
      frame = requestAnimationFrame(tick);
    }
    function schedule() {
      if (!canRun() || frame) return;
      previousTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
    function updateActivity() {
      if (!canRun()) {
        cancelAnimationFrame(frame);
        frame = 0;
        cursor = null;
        pointerStrength = 0;
        ripples = [];
        draw(0);
      } else schedule();
    }
    function position(event) {
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    }
    universe.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || !pointer.matches || !canRun()) return;
      cursor = position(event);
    }, { passive: true });
    universe.addEventListener('pointerleave', () => { cursor = null; });
    universe.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !pointer.matches || !canRun() || event.target.closest('button, a')) return;
      const at = position(event);
      if (ripples.length >= 3) ripples.shift();
      ripples.push({ ...at, age: 0 });
    });
    pointer.addEventListener('change', () => { cursor = null; });
    window.addEventListener('scroll', () => { cursor = null; }, { passive: true });
    function scheduleLayout() {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(rebuild);
    }
    new ResizeObserver(scheduleLayout).observe(universe);
    document.fonts.ready.then(scheduleLayout);
    new IntersectionObserver(([entry]) => { fieldVisible = entry.isIntersecting; updateActivity(); }).observe(universe);
    return {
      setActive(index) { active = index; hovered = null; if (!canRun()) draw(0); },
      highlight(index) { hovered = index; if (!canRun()) draw(0); },
      updateActivity,
    };
  }
})();
