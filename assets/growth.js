(() => {
  const results = document.getElementById('growth-results');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fields = {
    check: document.getElementById('growth-check'),
    transactions: document.getElementById('growth-transactions'),
    depth: document.getElementById('growth-depth'),
    uplift: document.getElementById('growth-uplift'),
    bonusRate: document.getElementById('growth-bonus-rate'),
    days: document.getElementById('growth-days'),
  };
  const defaults = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, Number(input.defaultValue)]));
  const counters = [...results.querySelectorAll('[data-growth-number]')];
  const presets = [...document.querySelectorAll('[data-growth-preset]')];
  const whole = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const factor = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
  const stateLabel = document.querySelector('#growth-calculation-state > span');
  const announcement = document.getElementById('growth-announcement');
  const dialog = document.getElementById('growth-method');
  const plot = document.getElementById('growth-plot');
  const tooltip = document.getElementById('growth-chart-tooltip');
  const marker = document.getElementById('growth-chart-marker');
  const beforeCurve = document.getElementById('growth-curve-before');
  const afterCurve = document.getElementById('growth-curve-after');
  const chartArea = document.getElementById('growth-chart-area');
  const chartDifference = document.getElementById('growth-chart-difference');
  const chartReveal = document.getElementById('growth-chart-reveal');
  let values = { ...defaults };
  let fractions = dailyFractions(values.days);
  let selectedDay = values.days;
  let tooltipVisible = false;
  let beforePoints = [];
  let afterPoints = [];
  let target = calculate(values);
  let displayed = baseline(target);
  let frame = 0;
  let visible = false;
  let pendingAnnouncement = false;

  // One model drives every counter: traffic and average price per item stay fixed.
  function calculate(input) {
    const multiplier = 1 + input.uplift / 100;
    const revenueBefore = input.check * input.transactions * input.days;
    const extra = revenueBefore * input.uplift / 100;
    return {
      checkBefore: input.check,
      checkAfter: input.check * multiplier,
      depthBefore: input.depth,
      depthAfter: input.depth * multiplier,
      revenueBefore,
      revenueAfter: revenueBefore + extra,
      ceiling: (revenueBefore + extra) * 1.12,
      extra,
      bonus: extra * input.bonusRate / 100,
      multiplier,
    };
  }

  function baseline(model) {
    return { ...model, checkAfter: model.checkBefore, depthAfter: model.depthBefore,
      revenueAfter: model.revenueBefore, extra: 0, bonus: 0, multiplier: 1 };
  }

  // Illustrative daily distribution, normalized to the exact calculated monthly total.
  // Both scenarios use the same distribution; no extra growth comes from the curve.
  function dailyFractions(days) {
    const week = [.68, .83, .98, 1.1, 1.4, 1.25, .76];
    const weights = Array.from({ length: days }, (_, day) => week[day % week.length]);
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const cumulative = [0];
    let sum = 0;
    weights.forEach((weight) => { sum += weight; cumulative.push(sum / total); });
    cumulative[days] = 1;
    return cumulative;
  }

  function curve(points) {
    const slopes = points.map((point, i) => {
      const previous = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      return (next.y - previous.y) / (next.x - previous.x);
    });
    let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1];
      const point = points[i];
      const third = (point.x - previous.x) / 3;
      path += ` C${(previous.x + third).toFixed(2)},${(previous.y + slopes[i - 1] * third).toFixed(2)} ${(point.x - third).toFixed(2)},${(point.y - slopes[i] * third).toFixed(2)} ${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    }
    return path;
  }

  function paintChart(model, reveal) {
    const ceiling = model.ceiling;
    const points = (total) => fractions.map((fraction, day) => ({
      x: 46 + day / values.days * 644,
      y: 122 - total * fraction / ceiling * 110,
    }));
    beforePoints = points(model.revenueBefore);
    afterPoints = points(model.revenueAfter);
    const before = curve(beforePoints);
    const after = curve(afterPoints);
    beforeCurve.setAttribute('d', before);
    afterCurve.setAttribute('d', after);
    chartArea.setAttribute('d', after + ' L690,122 L46,122 Z');
    chartDifference.setAttribute('d', after + ' ' + curve([...beforePoints].reverse()).replace(/^M/, 'L') + ' Z');
    chartReveal.setAttribute('width', 46 + 654 * reveal);
    document.getElementById('growth-axis-max').textContent = compact.format(ceiling);
    updateMarker();
  }

  function updateMarker() {
    tooltip.hidden = !tooltipVisible;
    marker.classList.toggle('is-visible', tooltipVisible);
    plot.setAttribute('aria-valuenow', selectedDay);
    const before = displayed.revenueBefore * fractions[selectedDay];
    const after = displayed.revenueAfter * fractions[selectedDay];
    plot.setAttribute('aria-valuetext', `День ${selectedDay}: сейчас ${whole.format(before)} тенге, с 4sell ${whole.format(after)} тенге`);
    if (!tooltipVisible || !beforePoints.length) return;
    const a = beforePoints[selectedDay];
    const b = afterPoints[selectedDay];
    document.getElementById('growth-chart-guide').setAttribute('d', `M${a.x},12V122`);
    for (const [id, point] of [['growth-chart-point-before', a], ['growth-chart-point-after', b]]) {
      const circle = document.getElementById(id);
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
    }
    document.getElementById('growth-tooltip-day').textContent = selectedDay ? `День ${selectedDay}` : 'Начало месяца';
    document.getElementById('growth-tooltip-before').textContent = whole.format(before) + ' ₸';
    document.getElementById('growth-tooltip-after').textContent = whole.format(after) + ' ₸';
    const left = b.x / 700 * plot.clientWidth - tooltip.offsetWidth / 2;
    tooltip.style.left = Math.max(0, Math.min(plot.clientWidth - tooltip.offsetWidth, left)) + 'px';
  }

  function readValues() {
    return Object.fromEntries(Object.entries(fields).map(([key, input]) => {
      const parsed = input.valueAsNumber;
      if (!Number.isFinite(parsed)) return [key, values[key]];
      const min = Number(input.min);
      const max = Number(input.max);
      const step = Number(input.step) || 1;
      const clamped = Math.min(max, Math.max(min, parsed));
      return [key, Number((min + Math.round((clamped - min) / step) * step).toFixed(2))];
    }));
  }

  function updateLabels() {
    const labels = {
      check: whole.format(values.check) + ' ₸',
      transactions: whole.format(values.transactions),
      depth: decimal.format(values.depth),
      uplift: '+' + values.uplift + '%',
    };
    for (const [key, text] of Object.entries(labels)) {
      const input = fields[key];
      document.getElementById(input.id + '-value').textContent = text;
      input.setAttribute('aria-valuetext', text);
      input.style.setProperty('--range-progress', (values[key] - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100 + '%');
    }
    presets.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.growthPreset) === values.uplift)));
    document.getElementById('growth-days-note').textContent = values.days;
    document.getElementById('growth-axis-middle').textContent = Math.floor(values.days / 2) + ' дн.';
    document.getElementById('growth-axis-end').textContent = values.days + ' дн.';
    plot.setAttribute('aria-valuemax', values.days);
    document.getElementById('growth-formula-before').textContent =
      `${whole.format(values.check)} ₸ × ${whole.format(values.transactions)} чеков × ${values.days} дн. = ${whole.format(target.revenueBefore)} ₸`;
    document.getElementById('growth-formula-extra').textContent =
      `${whole.format(target.revenueBefore)} ₸ × ${values.uplift}% = ${whole.format(target.extra)} ₸`;
    document.getElementById('growth-formula-bonus').textContent =
      `${whole.format(target.extra)} ₸ × ${values.bonusRate}% = ${whole.format(target.bonus)} ₸`;
  }

  function paint(model, reveal = 1) {
    displayed = model;
    for (const counter of counters) {
      const key = counter.dataset.growthNumber;
      if (key.startsWith('depth')) counter.textContent = decimal.format(model[key]);
      else if (key === 'extra') counter.textContent = '+' + whole.format(model[key]);
      else if (key.startsWith('revenue') || key === 'bonus') counter.textContent = whole.format(model[key]) + ' ₸';
      else counter.textContent = whole.format(model[key]);
    }
    document.getElementById('growth-multiplier').textContent = '×' + factor.format(model.multiplier);
    paintChart(model, reveal);
  }

  function setBusy(busy) {
    results.classList.toggle('is-calculating', busy);
    results.setAttribute('aria-busy', String(busy));
    stateLabel.textContent = busy ? 'Пересчитываем' : 'Расчёт готов';
  }

  function finish() {
    cancelAnimationFrame(frame);
    frame = 0;
    paint({ ...target });
    setBusy(false);
    if (pendingAnnouncement && visible && !document.hidden) {
      announcement.textContent = `Сценарий роста на ${values.uplift} процентов: дополнительная выручка ${whole.format(target.extra)} тенге, бонусы команде ${whole.format(target.bonus)} тенге за ${values.days} дней.`;
    }
    pendingAnnouncement = false;
  }

  function animate(replay = false) {
    cancelAnimationFrame(frame);
    if (motion.matches || document.hidden || !visible) { finish(); return; }
    const from = replay ? baseline(target) : { ...displayed };
    const destination = { ...target };
    const started = performance.now();
    const duration = replay ? 1150 : 650;
    paint(from, replay ? 0 : 1);
    setBusy(true);
    results.style.setProperty('--calculation-progress', 0);
    function tick(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      paint(Object.fromEntries(Object.entries(destination).map(([key, value]) => [key, from[key] + (value - from[key]) * eased])), replay ? eased : 1);
      results.style.setProperty('--calculation-progress', progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    }
    frame = requestAnimationFrame(tick);
  }

  function recalculate() {
    values = readValues();
    fractions = dailyFractions(values.days);
    selectedDay = Math.min(selectedDay, values.days);
    target = calculate(values);
    updateLabels();
    pendingAnnouncement = true;
    animate();
  }

  Object.values(fields).forEach((input) => {
    input.addEventListener('input', recalculate);
    if (input.type === 'number') {
      input.addEventListener('change', () => {
        const key = Object.keys(fields).find((name) => fields[name] === input);
        input.value = values[key];
      });
    }
  });
  presets.forEach((button) => button.addEventListener('click', () => {
    fields.uplift.value = button.dataset.growthPreset;
    recalculate();
  }));
  document.getElementById('growth-reset').addEventListener('click', () => {
    Object.entries(fields).forEach(([key, input]) => { input.value = defaults[key]; });
    recalculate();
  });
  document.getElementById('growth-replay').addEventListener('click', () => {
    pendingAnnouncement = true;
    animate(true);
  });

  function selectChartDay(event) {
    const bounds = plot.getBoundingClientRect();
    const fraction = ((event.clientX - bounds.left) / bounds.width * 700 - 46) / 644;
    selectedDay = Math.round(Math.max(0, Math.min(1, fraction)) * values.days);
    tooltipVisible = true;
    updateMarker();
  }
  plot.addEventListener('pointermove', (event) => { if (event.pointerType !== 'touch') selectChartDay(event); });
  plot.addEventListener('pointerdown', selectChartDay);
  plot.addEventListener('pointerleave', () => { tooltipVisible = document.activeElement === plot; updateMarker(); });
  plot.addEventListener('focus', () => { tooltipVisible = true; updateMarker(); });
  plot.addEventListener('blur', () => { tooltipVisible = false; updateMarker(); });
  plot.addEventListener('keydown', (event) => {
    const moves = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -7, PageUp: 7 };
    if (!(event.key in moves) && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    if (event.key === 'Home') selectedDay = 0;
    else if (event.key === 'End') selectedDay = values.days;
    else selectedDay = Math.max(0, Math.min(values.days, selectedDay + moves[event.key]));
    tooltipVisible = true;
    updateMarker();
  });

  document.getElementById('growth-method-open').addEventListener('click', () => dialog.showModal());
  document.getElementById('growth-method-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  updateLabels();
  paint(displayed);
  new IntersectionObserver(([entry]) => {
    const isVisible = entry.isIntersecting && entry.intersectionRatio >= .2;
    if (isVisible === visible) return;
    visible = isVisible;
    if (visible) animate(true);
    else finish();
  }, { threshold: [0, .2] }).observe(results);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  motion.addEventListener('change', () => { if (motion.matches) finish(); });
})();
