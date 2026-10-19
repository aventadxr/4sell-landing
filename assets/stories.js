(() => {
  const section = document.getElementById('stories');
  if (!section) return;

  const stage = document.getElementById('story-layout');
  const chapters = document.getElementById('story-progress');
  const toggle = document.getElementById('story-toggle');
  const playbackLabel = document.getElementById('story-playback-label');
  const counter = document.getElementById('story-counter');
  const announcement = document.getElementById('story-announcement');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 9000;

  const stories = [
    {
      id: 'coffee', label: 'Кофейни', category: 'Кофейни · работа на кассе',
      title: 'Хороший разговор. Больше в чеке.',
      description: 'Даже одной кофейне нужен понятный рост. 4sell связывает разговор на кассе с покупкой: видно, что предложил бариста и что выбрал гость.',
      benefits: ['Допродажи и качество общения — в одной картине', 'Бонусы помогают команде видеть смысл в результате'],
      proofLabel: 'С нами в этой сфере',
      logos: [['hani.svg', 'HANI'], ['coffeehub.svg', 'Coffee-Hub']],
      image: 'assets/story-cafe.webp', sceneLabel: 'Речь связана с чеком', sceneDetail: 'Касса / 01', scene: 'coffee'
    },
    {
      id: 'retail', label: 'Супермаркеты', category: 'Супермаркеты · кассы и торговый зал',
      title: 'Весь магазин. В поле зрения.',
      description: 'На кассах — разговоры и чеки. В торговом зале — видеоаналитика. Собираем сигналы вместе, чтобы руководитель видел, где команде нужна помощь.',
      benefits: ['Продажи, обслуживание и ситуации в зале', 'Видеосценарии проверяем на пилоте в вашем магазине'],
      proofLabel: 'С нами в этой сфере',
      logos: [['yuzhny.png', 'Южный', true]],
      image: 'assets/story-retail.webp', sceneLabel: 'Сигнал становится задачей', sceneDetail: 'Торговый зал', scene: 'retail'
    },
    {
      id: 'fuel', label: 'АЗС', category: 'АЗС · магазин и кафе',
      title: 'Заехал за топливом. Остался на кофе.',
      description: 'У заправки больше возможностей, чем продажа топлива. Помогаем команде предлагать кофе, перекус и товары в дорогу — и видеть результат в чеках.',
      benefits: ['Анализ предложений на кассе и покупок', 'Понятная картина по сменам и станциям'],
      proofLabel: 'С нами в этой сфере',
      logos: [['qazaq-oil.svg', 'Qazaq Oil', true]],
      sceneLabel: 'Топливо. Магазин. Кофе.', sceneDetail: 'Одна станция — много задач', scene: 'fuel'
    },
    {
      id: 'pharmacy', label: 'Аптеки', category: 'Аптеки · качество обслуживания',
      title: 'Внимание к деталям. В каждом диалоге.',
      description: 'Помогаем разбирать общение с покупателем: услышали ли запрос, понятно ли ответили, соблюли ли стандарт обслуживания. Конкретные примеры для развития команды.',
      benefits: ['Речь и чек дают контекст каждой ситуации', 'Единые стандарты сервиса во всей сети'],
      proofLabel: 'С нами в этой сфере',
      logos: [['biopharma_logo.svg', 'Biopharma', true]],
      image: 'assets/story-pharmacy.webp', sceneLabel: 'Качество можно разобрать', sceneDetail: 'Обслуживание', scene: 'pharmacy'
    },
    {
      id: 'calls', label: 'Колл-центры', category: 'Колл-центры · входящие и исходящие',
      title: 'Слышать клиента. Даже в тысяче звонков.',
      description: '4sell помогает находить важное в разговорах: запросы клиентов, соблюдение сценария и упущенные возможности. Руководитель видит, что стоит разобрать с командой.',
      benefits: ['Анализ диалогов и качества работы операторов', 'Живые примеры для обратной связи и обучения'],
      proofLabel: 'В центре внимания', proof: 'Разговор. Качество. Результат.',
      sceneLabel: 'Диалог становится понятнее', sceneDetail: 'Анализ речи', scene: 'calls'
    },
    {
      id: 'live', label: 'Реалтайм', category: 'Живые дашборды · для руководителя',
      title: 'Бизнес движется. Вы это видите.',
      description: 'Следите за продажами, допродажами и работой команды в одном окне. От общей картины сети до конкретной точки — по мере поступления и обработки данных.',
      benefits: ['Показатели бизнеса без ожидания ежемесячного отчёта', 'Можно вовремя заметить изменения и обсудить их'],
      proofLabel: 'Вся картина', proof: 'Точка. Смена. Сотрудник.',
      sceneLabel: 'Показатели обновляются', sceneDetail: 'По мере обработки данных', scene: 'live'
    },
    {
      id: 'weekly', label: 'Разборы', category: 'Каждую неделю · для каждого клиента',
      title: 'Цифры — на экран. План — в работу.',
      description: 'Каждую неделю разбираем результаты вместе с вами. Показываем, что изменилось, где есть возможности и на чём команде стоит сосредоточиться дальше.',
      benefits: ['Разбираем реальные ситуации вашего бизнеса', 'Договариваемся о следующих шагах и проверяем их'],
      proofLabel: 'Рядом с вами', proof: 'Команда 4sell. Каждую неделю.',
      sceneLabel: 'Встреча с вашей командой', sceneDetail: 'Еженедельный разбор', scene: 'weekly'
    },
    {
      id: 'apps', label: 'Приложения', category: 'Приложения · для каждой роли',
      title: 'Каждому — свой удобный инструмент.',
      description: 'Сотруднику — результаты и бонусы под рукой. Руководителю — аналитика и управление. Приложения для смартфона и компьютера работают как части одной системы.',
      benefits: ['Инструменты на кассе, в офисе и в дороге', 'Рабочие места, устройства и веб-кабинет связаны'],
      proofLabel: 'Одна экосистема', proof: 'Смартфон. Компьютер. Касса.',
      sceneLabel: 'Команда остаётся на связи', sceneDetail: 'Приложения 4sell', scene: 'apps'
    },
    {
      id: 'pilot', label: 'Пилот', category: 'Первый шаг · проверяем на практике',
      title: 'Начнём с пилота. На вашем бизнесе.',
      description: 'Выбираем задачу и согласуем, как оценить результат. Подключаем 4sell на выбранных точках, знакомим команду с инструментами и вместе смотрим, что получилось.',
      benefits: ['Понятные цели и критерии до старта', 'Решение о внедрении — по результатам пилота'],
      proofLabel: 'Ваш первый шаг', proof: 'Проверить. Понять. Решить.',
      sceneLabel: 'Проверяем в ваших условиях', sceneDetail: 'Вместе с вашей командой', scene: 'pilot'
    },
    {
      id: 'scale', label: 'Внедрение', category: 'Масштабирование · от точки до сети',
      title: 'Получилось на точке? Подключаем сеть.',
      description: 'После пилота планируем полноценное внедрение: подключения, обучение, запуск новых точек. Продолжаем поддерживать команду и разбирать результаты вместе.',
      benefits: ['План запуска под ваш масштаб и процессы', 'Обучение, поддержка и регулярные разборы'],
      proofLabel: 'Масштаб — ваш', proof: 'От одной кофейни до большой сети.',
      sceneLabel: 'Одна система для всей сети', sceneDetail: 'Растём вместе', scene: 'scale'
    }
  ];

  const wave = () => '<div class="scene-wave">' +
    [9, 16, 11, 24, 18, 10, 21, 28, 13, 22, 17, 8, 19, 26, 14, 21, 11, 17]
      .map((height, i) => '<i style="--bar:' + height + 'px;--delay:-' + (i * .13) + 's"></i>').join('') + '</div>';
  const chart = () => '<svg class="scene-chart" viewBox="0 0 420 110" preserveAspectRatio="none"><path class="scene-chart-grid" d="M0 20h420M0 55h420M0 90h420"/><path d="M0 100C35 100 39 82 70 86S108 70 140 72S175 54 210 59S250 35 280 39S321 24 350 27S390 7 420 6V110H0Z" fill="#c2e79b0b"/><path class="scene-chart-line" d="M0 100C35 100 39 82 70 86S108 70 140 72S175 54 210 59S250 35 280 39S321 24 350 27S390 7 420 6"/><circle cx="420" cy="6" r="3" fill="#e2f5bc"/></svg>';
  const receipt = () => '<div class="scene-card scene-receipt"><div class="scene-card-label">ЧЕК #0042 <b>Покупка</b></div><div class="scene-receipt-line"><span>Капучино</span><b>1 400 ₸</b></div><div class="scene-receipt-line scene-receipt-added"><span>+ Круассан</span><b>900 ₸</b></div><div class="scene-receipt-total"><span>Итого</span><strong>2 300 ₸</strong></div></div>';
  const scenes = {
    coffee: () => '<div class="scene-card scene-listen"><div class="scene-card-label">АНАЛИЗ ДИАЛОГА <b>● Речь</b></div><strong>«К вашему кофе<br>свежий круассан?»</strong>' + wave() + '</div>' + receipt() + '<div class="scene-toast">✓ Предложение стало покупкой</div>',
    retail: () => '<div class="scene-zone scene-zone-shelf"><span>01 / Товарная полка</span></div><div class="scene-zone scene-zone-queue"><span>02 / Кассовая зона</span></div><div class="scene-card scene-retail-card"><div class="scene-card-label">ВИДЕО + ПРОДАЖИ <b>● Сигнал</b></div><strong>Проверить выкладку</strong><div class="scene-mini-flow"><span>Камера</span><i></i><span>4sell</span><i></i><span>Команда</span></div></div>',
    fuel: () => '<svg class="scene-station" viewBox="0 0 620 400"><ellipse cx="295" cy="314" rx="230" ry="42" fill="#06191066"/><path d="m72 279 238-102 238 112-237 102Z" fill="#496044" stroke="#89a56b55"/><path d="m115 257 155-65 136 65-153 68Z" fill="#253f2a" stroke="#aec28733"/><path d="M126 124v146l17 8V132m230-13v147l17-8V110" fill="#b1c1a0"/><path d="m78 118 203-85 172 80-203 88Z" fill="#e0e7cb" stroke="#f0f3e0"/><path d="m78 118 172 83v17L78 136Z" fill="#91a96f"/><path d="m250 201 203-88v18l-203 87Z" fill="#f2dba1"/><path d="m336 225 104-44 99 46v73l-103 44-100-47Z" fill="#b6c29b"/><path d="m336 225 100 48 103-46" fill="none" stroke="#e6edce"/><path d="M436 273v71" stroke="#70875a"/><path d="m352 246 57 27v37l-57-27Z" fill="#304f39"/><path d="m453 280 67-28v37l-67 29Z" fill="#324d35"/><path d="m329 224 111-49 107 49-111 49Z" fill="#e4e6cb"/><path d="m174 229 28-12 22 11v63l-28 12-22-10Z" fill="#dce3bf"/><path d="m174 229 22 11 28-12M196 240v63" stroke="#95aa7c" fill="none"/><path d="m178 241 12 6v17l-12-6Z" fill="#2e4a35"/><path d="M224 243q20 9 15 32t-15-3" stroke="#152c20" stroke-width="5" fill="none"/><path d="m256 264 28-12 22 11v63l-28 12-22-10Z" fill="#dce3bf"/><path d="m256 264 22 11 28-12M278 275v63" stroke="#95aa7c" fill="none"/><path d="m260 276 12 6v17l-12-6Z" fill="#2e4a35"/><path d="M306 278q20 9 15 32t-15-3" stroke="#152c20" stroke-width="5" fill="none"/><circle class="station-pulse" cx="379" cy="252" r="5" fill="#e6f5ae"/><path d="m90 318 85 40m253-8 71-30" stroke="#bfd29577" stroke-width="2" stroke-dasharray="15 8"/></svg><div class="scene-card scene-fuel-card"><div class="scene-card-label">МАГАЗИН НА АЗС <b>● В работе</b></div><strong>Кофе в дорогу?</strong><div class="scene-mini-flow"><span>Предложили</span><i></i><span>Купили</span></div></div>',
    pharmacy: () => '<div class="scene-card scene-quality"><div class="scene-card-label">СТАНДАРТ ОБСЛУЖИВАНИЯ <b>Разбор</b></div><div class="scene-quality-row"><span>Уточнили запрос</span><i>✓</i></div><div class="scene-quality-row"><span>Ответили на вопросы</span><i>✓</i></div><div class="scene-quality-row"><span>Объяснили понятно</span><i>✓</i></div></div>',
    calls: () => '<div class="scene-calls"><div class="scene-call-top"><div class="scene-headset"><svg viewBox="0 0 32 32"><path d="M5 18v-4a11 11 0 0 1 22 0v8a5 5 0 0 1-5 5h-4M5 15h4v9H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Zm22 0h-4v9h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2Z"/></svg></div><div><strong>Каждый диалог — в фокусе</strong><small>Входящий звонок / пример анализа</small></div>' + wave() + '</div><div class="scene-transcript"><div class="scene-transcript-line"><span>Клиент</span><p>Хочу узнать о подключении.</p></div><div class="scene-transcript-line"><span>Оператор</span><p><mark>Расскажите о вашей задаче.</mark><br>Подберём подходящий вариант.</p></div></div><div class="scene-call-tags"><span>✓ Запрос уточнён</span><span>✓ Следующий шаг</span><span>Разбор диалога</span></div></div>',
    live: () => '<div class="scene-dashboard"><div class="scene-dash-heading"><span>Обзор бизнеса</span><small>Все точки · Сегодня</small></div><div class="scene-kpis"><div><small>Выручка</small><strong><span data-live-revenue>450 000</span><i> ₸</i></strong></div><div><small>Средний чек</small><strong>3 000<i> ₸</i></strong></div><div><small>Чеки</small><strong data-live-checks>150</strong></div></div>' + chart() + '<div class="scene-chart-labels"><span>09:00</span><span>12:00</span><span>15:00</span><span>Сейчас</span></div><div class="scene-dash-live"><i class="case-status-dot"></i><span data-live-note>Новая продажа — обновляем картину</span></div></div>',
    weekly: () => '<div class="scene-report"><div class="scene-report-header"><span>4sell / ВАША КОМАНДА</span><span>За неделю</span></div><h4>Итоги недели</h4><div class="scene-report-bars">' + [35, 48, 42, 63, 56, 78, 95].map((n, i) => '<i style="--bar:' + n + '%;--delay:' + i * .09 + 's"></i>').join('') + '</div></div><div class="scene-card scene-weekly-action"><div class="scene-card-label">СЛЕДУЮЩАЯ НЕДЕЛЯ <b>Вместе</b></div><strong>Фокус: предложение к заказу</strong><p>Разобрать примеры на встрече<br>и обсудить подход с командой.</p></div>',
    apps: () => '<div class="scene-app-desktop"><div class="scene-app-screen"><span>4sell / Кабинет руководителя</span><div class="scene-app-stats"><span>Команда<b>На связи</b></span><span>Продажи<b>В фокусе</b></span></div>' + chart() + '</div></div><div class="scene-phone"><small>4sell / Сотрудник</small><strong>Хорошая смена!</strong><div class="scene-phone-bonus">Ваши бонусы<b>+2 400 ₸</b></div><div class="scene-phone-task"><b>Мой результат</b><br>Всё под рукой.</div></div>',
    pilot: () => '<div class="scene-pilot-orbit"></div><div class="scene-pilot-core"><svg viewBox="0 0 40 40"><path d="M9 33V13l11-6 11 6v20H9Zm0-13h22M16 33V23h8v10M15 14h1m8 0h1"/></svg><span>Ваша точка</span></div><div class="scene-pilot-step" data-step="1"><b>01</b>Выбираем задачу</div><div class="scene-pilot-step" data-step="2"><b>02</b>Подключаем 4sell</div><div class="scene-pilot-step" data-step="3"><b>03</b>Смотрим результат</div>',
    scale: () => {
      const positions = [[87, 58], [412, 58], [50, 174], [450, 174], [135, 282], [365, 282]];
      const lines = positions.map(([x, y]) => '<path class="scene-network-line" d="M250 170Q' + x + ' 170 ' + x + ' ' + y + '"/><path class="scene-network-flow" d="M250 170Q' + x + ' 170 ' + x + ' ' + y + '"/>').join('');
      const nodes = positions.map(([x, y]) => '<g transform="translate(' + (x - 23) + ' ' + (y - 25) + ')"><rect class="scene-network-node" width="46" height="50" rx="10"/><path d="M11 20h24v20H11Zm-2 0 6-10h16l6 10Z" fill="none" stroke="#b9d894" stroke-width="1.3"/><path class="scene-network-window" d="M15 25h5v6h-5Zm11 0h5v6h-5Zm-5 10h5v5h-5Z"/></g>').join('');
      return '<svg class="scene-network" viewBox="0 0 500 340">' + lines + nodes + '</svg><div class="scene-scale-core"><img src="assets/logo-4sell-white.svg" alt=""></div><div class="scene-scale-tag"><strong>Ваш бизнес растёт.</strong>4sell растёт вместе с ним.</div>';
    }
  };

  const pad = value => String(value).padStart(2, '0');
  const proofMarkup = story => '<div class="case-proof"><span>' + story.proofLabel + '</span>' +
    (story.logos ? '<div class="case-client-logos">' + story.logos.map(([file, name, wide]) => '<img src="assets/clients/' + file + '" alt="' + name + '"' + (wide ? ' class="case-logo-wide"' : '') + '>').join('') + '</div>' : '<strong>' + story.proof + '</strong>') + '</div>';
  function createSlide(story, index) {
    const slide = document.createElement('article');
    slide.className = 'case-slide';
    slide.dataset.case = story.id;
    slide.setAttribute('aria-label', (index + 1) + ' из ' + stories.length + ': ' + story.label);
    slide.innerHTML = '<div class="case-visual" aria-hidden="true">' +
      (story.image ? '<img class="case-photo" src="' + story.image + '" alt="" decoding="async">' : '') +
      '<div class="case-scene-head"><span><img src="assets/logo-4sell-white.svg" alt=""> / В РАБОТЕ</span><span class="case-demo">ДЕМО-СЦЕНА</span></div>' +
      scenes[story.scene]() +
      '<div class="case-scene-caption"><span><i class="case-status-dot"></i>' + story.sceneLabel + '</span><span>' + story.sceneDetail + '</span></div></div>' +
      '<div class="case-copy"><div class="case-category">' + story.category + '</div><h3>' + story.title + '</h3><p class="case-description">' + story.description +
      '</p><ul class="case-benefits">' + story.benefits.map(item => '<li>' + item + '</li>').join('') + '</ul>' + proofMarkup(story) + '</div>';
    return slide;
  }

  const tabs = stories.map((story, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'case-tab-' + index;
    button.className = 'cases-chapter';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'story-layout');
    button.setAttribute('aria-label', (index + 1) + '. ' + story.label);
    button.innerHTML = '<span class="cases-chapter-track" aria-hidden="true"><i></i></span>';
    chapters.append(button);
    return button;
  });

  let index = 0;
  let elapsed = 0;
  let frame = 0;
  let lastTick = 0;
  let lastPaint = 0;
  let visible = false;
  let manualPause = motion.matches;
  let hovered = false;
  let focused = false;
  let activeSlide;
  let transitionCleanup = 0;
  let liveStep = 0;
  let touchStart = null;
  let imagesPreloaded = false;

  function showStory(next, { direction = 1, animate = true, announce = false } = {}) {
    index = (next + stories.length) % stories.length;
    elapsed = 0;
    liveStep = 0;
    clearTimeout(transitionCleanup);
    stage.querySelectorAll('.is-leaving').forEach(slide => slide.remove());
    const previous = activeSlide;
    activeSlide = createSlide(stories[index], index);
    stage.style.setProperty('--case-shift', (direction * 35) + 'px');
    if (previous && animate && !motion.matches) {
      previous.classList.remove('is-entering');
      previous.classList.add('is-leaving');
      previous.setAttribute('aria-hidden', 'true');
      previous.inert = true;
      activeSlide.classList.add('is-entering');
      transitionCleanup = setTimeout(() => {
        previous.remove();
        activeSlide.classList.remove('is-entering');
      }, 950);
    } else if (previous) {
      previous.remove();
    }
    stage.append(activeSlide);
    stage.setAttribute('aria-labelledby', tabs[index].id);
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      tab.style.setProperty('--fill', i < index ? '1' : '0');
    });
    counter.innerHTML = pad(index + 1) + ' <span>/ ' + pad(stories.length) + '</span>';
    if (announce) announcement.textContent = (index + 1) + ' из ' + stories.length + '. ' + stories[index].label + '. ' + stories[index].title;
    syncPlayback();
  }

  const canPlay = () => visible && !document.hidden && !manualPause && !hovered && !focused;
  function updateDemo() {
    if (stories[index].id !== 'live') return;
    const step = Math.floor(elapsed / 2200);
    if (step === liveStep) return;
    liveStep = step;
    activeSlide.querySelector('[data-live-revenue]').textContent = (450000 + step * 3000).toLocaleString('ru-RU');
    activeSlide.querySelector('[data-live-checks]').textContent = String(150 + step);
    activeSlide.querySelector('[data-live-note]').textContent = 'Новый чек · +3 000 ₸ · показатели обновлены';
  }
  function tick(now) {
    frame = 0;
    if (!canPlay()) return;
    if (lastTick) elapsed += Math.min(now - lastTick, 100);
    lastTick = now;
    if (elapsed >= duration) showStory(index + 1);
    if (now - lastPaint > 32) {
      tabs[index].style.setProperty('--fill', Math.min(1, elapsed / duration).toFixed(4));
      updateDemo();
      lastPaint = now;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function syncPlayback() {
    const active = canPlay();
    section.classList.toggle('is-dormant', !visible || document.hidden);
    section.classList.toggle('is-paused', !active);
    toggle.setAttribute('aria-pressed', String(manualPause));
    toggle.setAttribute('aria-label', manualPause ? 'Включить автоплей историй' : 'Приостановить истории');
    toggle.querySelector('svg').innerHTML = manualPause ? '<path d="m9 6 9 6-9 6Z"/>' : '<path d="M9 6v12M15 6v12"/>';
    playbackLabel.textContent = manualPause ? 'Включить автоплей' : hovered || focused ? 'Пауза при чтении' : 'Автоплей · 9 сек';
    if (active && !frame) {
      lastTick = 0;
      frame = requestAnimationFrame(tick);
    } else if (!active && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showStory(i, { direction: i >= index ? 1 : -1, announce: true }));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % stories.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + stories.length) % stories.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = stories.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      showStory(next, { direction: next >= index ? 1 : -1, announce: true });
      tabs[next].focus({ preventScroll: true });
    });
  });
  document.getElementById('story-prev').addEventListener('click', () => showStory(index - 1, { direction: -1, announce: true }));
  document.getElementById('story-next').addEventListener('click', () => showStory(index + 1, { announce: true }));
  toggle.addEventListener('click', () => {
    manualPause = !manualPause;
    syncPlayback();
  });
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      showStory(index + direction, { direction, announce: true });
    }
  });
  stage.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    syncPlayback();
  });
  stage.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    syncPlayback();
  });
  section.addEventListener('focusin', () => {
    focused = document.activeElement.matches(':focus-visible');
    syncPlayback();
  });
  section.addEventListener('focusout', event => {
    focused = section.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible');
    syncPlayback();
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    touchStart = { x: event.clientX, y: event.clientY, time: performance.now() };
  });
  stage.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5 && performance.now() - touchStart.time < 1000) {
      const direction = dx < 0 ? 1 : -1;
      showStory(index + direction, { direction, announce: true });
    }
    touchStart = null;
  });
  stage.addEventListener('pointercancel', () => { touchStart = null; });
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', () => {
    if (motion.matches) {
      manualPause = true;
      clearTimeout(transitionCleanup);
      stage.querySelectorAll('.is-leaving').forEach(slide => slide.remove());
      activeSlide.classList.remove('is-entering');
    }
    syncPlayback();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !imagesPreloaded) {
      imagesPreloaded = true;
      // Prepare the next photo scenes before the first automatic transition.
      stories.filter(story => story.image).forEach(story => {
        const image = new Image();
        image.src = story.image;
        image.decode().catch(() => {});
      });
    }
    syncPlayback();
  }, { threshold: 0, rootMargin: '-18% 0px -18% 0px' }).observe(stage);

  showStory(0, { animate: false });
})();
