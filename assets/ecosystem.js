(() => {
  const section = document.getElementById('ecosystem');
  const universe = document.getElementById('eco-universe');
  const core = document.getElementById('eco-core');
  const wires = document.getElementById('eco-connections');
  const detail = document.getElementById('eco-detail');
  const moduleButtons = [...section.querySelectorAll('[data-eco-module]')];
  const tabButtons = [...section.querySelectorAll('[data-eco-view]')];
  const pause = document.getElementById('eco-pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const ns = 'http://www.w3.org/2000/svg';
  const modules = {
    dashboard: {
      icon: 'chart', index: '00', title: 'Видите изменения. Принимаете решения.',
      copy: 'Продажи, допродажи, качество работы и динамика по точкам и сотрудникам. Показатели обновляются по мере поступления и обработки данных.',
    },
    ai: {
      icon: 'ai', index: '01', title: 'Больше контекста для каждого решения.',
      copy: 'Анализируем разговоры и видео, связываем общение с чеками. Видно, что сотрудник предложил, что купил клиент и где стоит разобраться подробнее.',
    },
    devices: {
      icon: 'devices', index: '02', title: 'Из торгового зала — в единую картину бизнеса.',
      copy: 'Приложения для смартфона и ПК, кассовые данные и камеры собирают сигналы с точек. Личный кабинет объединяет результаты для руководителя.',
    },
    integrations: {
      icon: 'connect', index: '03', title: 'Ваши инструменты работают вместе.',
      copy: 'Подключаем кассовые системы, в том числе iiko и r_keeper, связываем продажи с аналитикой. API и уведомления в Telegram дополняют привычные процессы.',
    },
    mcp: {
      icon: 'mcp', index: '04', title: 'Подключите к бизнесу своего ИИ-агента.',
      copy: 'Через MCP ваши агенты могут читать аналитические данные и документацию, проверять настройки и работать с анализом. Доступ и действия ограничены выданными правами.',
    },
    learning: {
      icon: 'learn', index: '05', title: 'Инструменты приносят пользу, когда ими умеют пользоваться.',
      copy: 'Обучаем работе с 4sell: помогаем руководителям понимать показатели, а сотрудникам — освоить инструменты и применять их в ежедневной работе.',
    },
    support: {
      icon: 'support', index: '06', title: 'За платформой стоит команда.',
      copy: 'Поможем с подключением, ответим на вопросы и разберёмся в рабочих ситуациях. Продолжаем поддерживать вас, когда появляются новые задачи.',
    },
  };
  // All values below are illustrative demo data, never a connected client's metrics.
  const views = {
    sales: {
      labels: ['Выручка сегодня', 'Средний чек', 'Допродажи'],
      base: [450000, 3000, 45000], increment: [3000, 0, 300], units: ['₸', '₸', '₸'],
      chart: 'Выручка в течение дня', description: 'Демонстрация: накопленная выручка за день',
      event: 'Новая продажа → обновление показателей',
      points: [90, 87, 78, 75, 64, 61, 48, 45, 33, 30, 19, 12],
    },
    team: {
      labels: ['Бонусы команды', 'Сотрудников', 'Допродаж'],
      base: [4500, 24, 42], increment: [30, 0, 1], units: ['₸', '', ''],
      chart: 'Бонусы в течение дня', description: 'Демонстрация: накопленные бонусы команды за день',
      event: 'Допродажа в чеке → бонус сотруднику',
      points: [93, 92, 86, 85, 74, 69, 57, 55, 40, 27, 22, 12],
    },
    quality: {
      labels: ['Качество общения', 'Разговоров', 'Скрипт соблюдён'],
      base: [86, 128, 91], increment: [0, 1, 0], units: ['%', '', '%'],
      chart: 'Качество общения в течение дня', description: 'Демонстрация: оценка качества разговоров в течение дня',
      event: 'Разговор разобран → оценка на дашборде',
      points: [65, 56, 58, 35, 42, 31, 37, 19, 24, 15, 20, 15],
    },
  };
  const kpis = ['primary', 'secondary', 'third'].map((name) => ({
    label: document.getElementById(`eco-kpi-${name}-label`),
    value: document.getElementById(`eco-kpi-${name}`),
  }));
  let selectedModule = 'dashboard';
  let currentView = 'sales';
  let demoStep = 0;
  let shownValues = [...views.sales.base];
  let sectionVisible = false;
  let dashboardVisible = false;
  let paused = false;
  let coreHovered = false;
  let coreFocused = false;
  let tickTimer = 0;
  let counterFrame = 0;
  let layoutFrame = 0;
  const pointerBackground = window.createLandingPointerBackground(
    section, document.getElementById('eco-pointer-canvas'), canAnimate,
  );

  function canAnimate() {
    return sectionVisible && !document.hidden && !paused && !motion.matches;
  }

  function highlight(key) {
    wires.querySelectorAll('[data-eco-wire]').forEach((wire) => {
      wire.classList.toggle('is-highlighted', wire.dataset.ecoWire === key);
    });
  }

  function selectModule(key) {
    const data = modules[key];
    selectedModule = key;
    moduleButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.ecoModule === key)));
    document.getElementById('eco-detail-icon').setAttribute('href', `#eco-icon-${data.icon}`);
    document.getElementById('eco-detail-title').textContent = data.title;
    document.getElementById('eco-detail-copy').textContent = data.copy;
    document.getElementById('eco-detail-index').textContent = `${data.index} / 06`;
    detail.dataset.module = key;
    highlight(key);
    if (mobile.matches) detail.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'nearest' });
  }

  moduleButtons.forEach((button) => {
    button.addEventListener('click', () => selectModule(button.dataset.ecoModule));
    button.addEventListener('pointerenter', () => highlight(button.dataset.ecoModule));
    button.addEventListener('pointerleave', () => highlight(selectedModule));
    button.addEventListener('focus', () => highlight(button.dataset.ecoModule));
    button.addEventListener('blur', () => highlight(selectedModule));
  });

  function drawConnections() {
    const bounds = universe.getBoundingClientRect();
    const center = core.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    wires.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const end = { x: center.left - bounds.left + center.width / 2, y: center.top - bounds.top + center.height / 2 - 15 };
    for (const [index, slot] of [...universe.querySelectorAll('.eco-module-slot')].entries()) {
      const key = slot.querySelector('[data-eco-module]').dataset.ecoModule;
      const box = slot.getBoundingClientRect();
      const start = { x: box.left - bounds.left + box.width / 2, y: box.top - bounds.top + box.height / 2 };
      const bend = (start.x + end.x) / 2;
      const path = mobile.matches
        ? `M${start.x},${start.y} C${start.x},${end.y} ${end.x},${start.y} ${end.x},${end.y}`
        : `M${start.x},${start.y} C${bend},${start.y} ${bend},${end.y} ${end.x},${end.y}`;
      let group = wires.querySelector(`[data-eco-wire="${key}"]`);
      if (!group) {
        group = document.createElementNS(ns, 'g');
        group.classList.add('eco-wire');
        group.dataset.ecoWire = key;
        for (const className of ['eco-link', 'eco-link-flow']) {
          const line = document.createElementNS(ns, 'path');
          line.classList.add(className);
          line.setAttribute('pathLength', '100');
          line.style.animationDelay = `${index * -.8}s`;
          group.append(line);
        }
        wires.append(group);
      }
      group.querySelectorAll('path').forEach((line) => line.setAttribute('d', path));
    }
    highlight(selectedModule);
  }

  function scheduleLayout() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(drawConnections);
  }
  new ResizeObserver(scheduleLayout).observe(universe);
  document.fonts.ready.then(scheduleLayout);

  function targetValues() {
    const view = views[currentView];
    return view.base.map((base, index) => base + demoStep * view.increment[index]);
  }

  function paintNumbers(values) {
    shownValues = values;
    kpis.forEach((kpi, index) => {
      const amount = document.createTextNode(number.format(values[index]));
      const unit = document.createElement('small');
      unit.textContent = views[currentView].units[index];
      kpi.value.replaceChildren(amount, document.createTextNode(' '), unit);
    });
  }

  function drawChart() {
    const points = views[currentView].points.map((y, index, list) => ({ x: 2 + index / (list.length - 1) * 436, y }));
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1];
      const next = points[i];
      const middle = (previous.x + next.x) / 2;
      path += ` C${middle},${previous.y} ${middle},${next.y} ${next.x},${next.y}`;
    }
    document.getElementById('eco-chart-line').setAttribute('d', path);
    document.getElementById('eco-chart-area').setAttribute('d', path + ' L438,104 L2,104Z');
    document.getElementById('eco-chart-end').setAttribute('cy', points.at(-1).y);
  }

  function finishCounters() {
    cancelAnimationFrame(counterFrame);
    counterFrame = 0;
    paintNumbers(targetValues());
    document.getElementById('eco-chart-reveal').setAttribute('width', '440');
  }

  function renderView(reveal = false) {
    cancelAnimationFrame(counterFrame);
    const view = views[currentView];
    kpis.forEach((kpi, index) => { kpi.label.textContent = view.labels[index]; });
    document.getElementById('eco-chart-label').textContent = view.chart;
    document.getElementById('eco-chart-title').textContent = view.description;
    document.getElementById('eco-dash-event').textContent = view.event;
    drawChart();
    const target = targetValues();
    if (!canAnimate() || !dashboardVisible) { finishCounters(); return; }
    const from = reveal ? target.map(() => 0) : [...shownValues];
    const started = performance.now();
    const duration = reveal ? 950 : 600;
    const clip = document.getElementById('eco-chart-reveal');
    paintNumbers(from);
    clip.setAttribute('width', reveal ? '0' : '440');
    function tick(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      paintNumbers(target.map((value, index) => from[index] + (value - from[index]) * eased));
      if (reveal) clip.setAttribute('width', String(440 * eased));
      if (progress < 1) counterFrame = requestAnimationFrame(tick);
      else finishCounters();
    }
    counterFrame = requestAnimationFrame(tick);
  }

  function scheduleDemo() {
    clearTimeout(tickTimer);
    if (!canAnimate() || !dashboardVisible || coreHovered || coreFocused) return;
    tickTimer = setTimeout(() => {
      demoStep += 1;
      renderView();
      scheduleDemo();
    }, 4800);
  }

  function selectView(button) {
    currentView = button.dataset.ecoView;
    tabButtons.forEach((tab) => {
      const selected = tab === button;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.getElementById('eco-dash-panel').setAttribute('aria-labelledby', button.id);
    document.getElementById('eco-announcement').textContent = `Демонстрационный дашборд: ${button.textContent}.`;
    renderView(true);
    scheduleDemo();
  }
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectView(button));
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
      else if (event.key === 'ArrowLeft') next = (index + tabButtons.length - 1) % tabButtons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabButtons.length - 1;
      else return;
      event.preventDefault();
      tabButtons[next].focus();
      selectView(tabButtons[next]);
    });
  });

  function updateActivity() {
    section.classList.toggle('is-dormant', !sectionVisible || document.hidden);
    section.classList.toggle('is-paused', paused);
    if (!canAnimate()) {
      finishCounters();
      pointerBackground.reset();
    }
    scheduleDemo();
  }

  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Продолжить анимацию экосистемы' : 'Приостановить анимацию экосистемы');
    pause.querySelector('span').textContent = paused ? 'Продолжить движение' : 'Остановить движение';
    pause.querySelector('path').setAttribute('d', paused ? 'm9 5 10 7-10 7Z' : 'M9 6v12M15 6v12');
    updateActivity();
  });
  core.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') { coreHovered = true; scheduleDemo(); } });
  core.addEventListener('pointerleave', () => { coreHovered = false; scheduleDemo(); });
  core.addEventListener('focusin', () => { coreFocused = true; scheduleDemo(); });
  core.addEventListener('focusout', (event) => { coreFocused = core.contains(event.relatedTarget); scheduleDemo(); });

  new IntersectionObserver(([entry]) => {
    sectionVisible = entry.isIntersecting;
    updateActivity();
  }).observe(section);
  new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting && entry.intersectionRatio >= .25;
    if (visible === dashboardVisible) return;
    dashboardVisible = visible;
    if (visible) renderView(true);
    else finishCounters();
    scheduleDemo();
  }, { threshold: [0, .25] }).observe(core);
  document.addEventListener('visibilitychange', updateActivity);
  motion.addEventListener('change', updateActivity);
  renderView();
})();
