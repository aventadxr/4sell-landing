(() => {
  const header = document.getElementById('site-header');
  const navigation = document.getElementById('header-navigation');
  const nav = header.querySelector('.header-nav');
  const links = [...nav.querySelectorAll('a')];
  const highlight = header.querySelector('.header-nav-highlight');
  const toggle = header.querySelector('.header-menu-toggle');
  const cta = header.querySelector('.header-cta');
  const compact = matchMedia('(max-width: 980px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active;
  let preview;
  let open = false;

  function moveHighlight(link) {
    nav.classList.toggle('has-highlight', Boolean(link));
    links.forEach(item => item.classList.toggle('is-highlighted', item === link));
    if (!link || compact.matches) return;
    highlight.style.width = link.offsetWidth + 'px';
    highlight.style.transform = `translateX(${link.offsetLeft}px)`;
  }

  function setActive(id) {
    active = links.find(link => link.hash === '#' + id);
    [...links, cta].forEach(link => {
      if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    moveHighlight(preview || active);
  }

  function setMenu(next, restoreFocus = false) {
    open = compact.matches && next;
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    navigation.inert = compact.matches && !open;
    if (compact.matches && !open) navigation.setAttribute('aria-hidden', 'true');
    else navigation.removeAttribute('aria-hidden');
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  links.forEach(link => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      preview = link;
      moveHighlight(link);
    });
    link.addEventListener('focus', () => { preview = link; moveHighlight(link); });
  });
  nav.addEventListener('pointerleave', () => {
    preview = links.find(link => link === document.activeElement && link.matches(':focus-visible'));
    moveHighlight(preview || active);
  });
  nav.addEventListener('focusout', event => {
    if (nav.contains(event.relatedTarget)) return;
    preview = undefined;
    moveHighlight(active);
  });
  toggle.addEventListener('click', () => {
    setMenu(!open);
    if (open) links[0].focus({ preventScroll: true });
  });
  header.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) setMenu(false);
  });
  header.addEventListener('focusout', event => {
    if (open && !header.contains(event.relatedTarget)) setMenu(false);
  });
  document.addEventListener('pointerdown', event => {
    if (open && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setMenu(false, true); }
  });

  const canvas = document.getElementById('header-mesh');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let vertices = [];
  let triangles = [];
  let frame = 0;
  const cursor = { x: 0, y: 0, strength: 0 };
  const target = { x: 0, y: 0, strength: 0 };
  const random = seed => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  function drawMesh() {
    ctx.clearRect(0, 0, width, height);
    const wash = ctx.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, '#8fb76900');
    wash.addColorStop(1, '#83aa5b18');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    const points = vertices.map(point => {
      const dx = point.x - cursor.x;
      const dy = point.y - cursor.y;
      const distance = Math.hypot(dx, dy);
      const influence = Math.exp(-distance / 100) * cursor.strength;
      return { x: point.x + dx / Math.max(1, distance) * influence * 8,
        y: point.y + dy / Math.max(1, distance) * influence * 6 };
    });
    triangles.forEach((triangle, index) => {
      const [a, b, c] = triangle.map(i => points[i]);
      const x = (a.x + b.x + c.x) / 3;
      const y = (a.y + b.y + c.y) / 3;
      const light = Math.max(0, 1 - Math.hypot(x - cursor.x, y - cursor.y) / 180) * cursor.strength;
      const facet = random(index + 9);
      const opacity = .025 + facet * .13 + light * .17;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(${138 + Math.round(facet * 55)}, ${177 + Math.round(facet * 40)}, ${102 + Math.round(facet * 25)}, ${opacity})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(201, 231, 161, ${.07 + facet * .065 + light * .22})`;
      ctx.lineWidth = .6;
      ctx.stroke();
    });
  }

  function animateMesh() {
    frame = 0;
    cursor.x += (target.x - cursor.x) * .16;
    cursor.y += (target.y - cursor.y) * .16;
    cursor.strength += (target.strength - cursor.strength) * .12;
    const moving = Math.abs(target.x - cursor.x) + Math.abs(target.y - cursor.y) > .2;
    const changing = Math.abs(target.strength - cursor.strength) > .002;
    if (!moving && !changing) Object.assign(cursor, target);
    drawMesh();
    if (moving || changing) frame = requestAnimationFrame(animateMesh);
  }
  function requestMeshFrame() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(animateMesh);
  }
  function resetMesh() {
    target.strength = 0;
    if (document.hidden || motion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      cursor.strength = 0;
      drawMesh();
    } else requestMeshFrame();
  }
  function resizeMesh() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cellWidth = 34;
    const cellHeight = 24;
    const columns = Math.ceil(width / cellWidth) + 2;
    const rows = Math.ceil(height / cellHeight) + 2;
    vertices = [];
    triangles = [];
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const seed = row * (columns + 1) + col;
        vertices.push({ x: col * cellWidth - cellWidth + (row % 2) * cellWidth / 2 + (random(seed) - .5) * 13,
          y: row * cellHeight - cellHeight + (random(seed + 171) - .5) * 12 });
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const a = row * (columns + 1) + col;
        const b = a + 1;
        const c = a + columns + 1;
        const d = c + 1;
        if (row % 2) triangles.push([a, b, c], [b, d, c]);
        else triangles.push([a, b, d], [a, d, c]);
      }
    }
    drawMesh();
  }
  header.addEventListener('pointermove', event => {
    if (motion.matches || event.pointerType !== 'mouse') return;
    const bounds = canvas.getBoundingClientRect();
    target.x = event.clientX - bounds.left;
    target.y = event.clientY - bounds.top;
    target.strength = target.x > -80 ? 1 : 0;
    requestMeshFrame();
  }, { passive: true });
  header.addEventListener('pointerleave', resetMesh);
  motion.addEventListener('change', resetMesh);
  document.addEventListener('visibilitychange', resetMesh);
  new ResizeObserver(resizeMesh).observe(header);
  resizeMesh();
  compact.addEventListener('change', () => {
    const wasFocused = navigation.contains(document.activeElement);
    setMenu(false, compact.matches && wasFocused);
    preview = undefined;
    moveHighlight(active);
  });
  new ResizeObserver(() => moveHighlight(preview || active)).observe(nav);
  document.addEventListener('landing:sectionchange', event => setActive(event.detail));
  document.fonts.ready.then(() => moveHighlight(preview || active));
  setMenu(false);
  setActive(window.__landingSection || 'hero');
})();
