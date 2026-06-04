const searchData = [
  { title: 'Матрица Эйзенхауэра', desc: 'Метод приоритизации задач по срочности и важности', url: '/methods', tags: ['метод', 'эйзенхауэр', 'матрица', 'приоритеты'] },
  { title: 'Pomodoro', desc: 'Техника управления временем через интервалы работы и отдыха', url: '/methods', tags: ['метод', 'помидор', 'таймер', 'фокус'] },
  { title: 'GTD (Getting Things Done)', desc: 'Система продуктивности для организации задач', url: '/methods', tags: ['метод', 'gtd', 'задачи', 'организация'] },
  { title: 'Time Blocking', desc: 'Метод планирования времени блоками на конкретные задачи', url: '/methods', tags: ['метод', 'timeblocking', 'расписание'] },
  { title: 'Правило 80/20 (Парето)', desc: '20% усилий дают 80% результата', url: '/methods', tags: ['метод', 'парето', '80/20', 'приоритеты'] },
  { title: 'SMART', desc: 'Метод постановки конкретных и измеримых целей', url: '/methods', tags: ['метод', 'smart', 'цели', 'постановка'] },
  { title: 'CLEAR', desc: 'Современная альтернатива SMART для постановки целей', url: '/methods', tags: ['метод', 'clear', 'цели'] },
  { title: 'OKR', desc: 'Метод целеполагания Objectives and Key Results', url: '/methods', tags: ['метод', 'okr', 'цели', 'результаты'] },
  { title: 'Съешь лягушку', desc: 'Начинайте день с самой сложной задачи', url: '/antiprocrastination', tags: ['метод', 'лягушка', 'прокрастинация'] },
  { title: 'Правило 2 минут', desc: 'Если задача занимает меньше 2 минут — сделайте её сразу', url: '/antiprocrastination', tags: ['метод', '2минуты', 'быстро'] },
  { title: 'Habit Stacking', desc: 'Привязка новой привычки к существующей', url: '/habits', tags: ['привычка', 'habit', 'stacking'] },
  { title: 'Weekly Review', desc: 'Еженедельный обзор задач и целей', url: '/methods', tags: ['метод', 'обзор', 'weekly', 'review'] },
  { title: 'Deep Work', desc: 'Режим глубокой работы без отвлечений', url: '/methods', tags: ['метод', 'deepwork', 'фокус', 'концентрация'] },
  { title: 'Метод Айви Ли', desc: 'Ежедневное планирование 6 главных задач', url: '/methods', tags: ['метод', 'ivylee', 'план'] },
  { title: 'Kanban', desc: 'Визуальное управление задачами через доску', url: '/methods', tags: ['метод', 'kanban', 'доска', 'визуализация'] },
  { title: 'Утренняя рутина', desc: 'Набор привычек для продуктивного утра за 15 минут', url: '/habits', tags: ['привычка', 'утро', 'рутина'] },
  { title: 'Планирование дня с вечера', desc: 'Подготовка списка задач на следующий день', url: '/habits', tags: ['привычка', 'план', 'вечер'] },
  { title: 'Ежедневный обзор (Daily Review)', desc: 'Подведение итогов дня и планирование', url: '/habits', tags: ['привычка', 'обзор', 'daily'] },
  { title: 'Зарядка 5 минут', desc: 'Короткая утренняя зарядка для бодрости', url: '/habits', tags: ['привычка', 'зарядка', 'здоровье'] },
  { title: 'Трекер привычек', desc: 'Инструмент для отслеживания выполнения привычек', url: '/habits', tags: ['трекер', 'привычка', 'отслеживание'] },
  { title: 'Правило 5 секунд', desc: 'Техника Мел Роббинс для быстрого действия', url: '/antiprocrastination', tags: ['метод', '5секунд', 'действие'] },
  { title: 'Дофаминовая подзарядка', desc: 'Быстрые действия для поднятия настроения', url: '/tests', tags: ['дофамин', 'настроение', 'энергия'] },
  { title: 'Матрица Эйзенхауэра (интерактив)', desc: 'Распределите свои задачи по квадрантам', url: '/tests', tags: ['интерактив', 'матрица', 'задачи'] },
  { title: 'Трекер привычек на месяц', desc: 'Шаблон для отслеживания привычек в Excel', url: '/templates', tags: ['шаблон', 'трекер', 'excel'] },
  { title: 'Ежедневник Идеальный день', desc: 'Почасовая разбивка дня с приоритетами', url: '/templates', tags: ['шаблон', 'ежедневник', 'pdf'] },
  { title: 'Планер Идеальная неделя', desc: 'Шаблон для планирования недели', url: '/templates', tags: ['шаблон', 'неделя', 'планер'] },
  { title: 'Чек-лист Утренняя рутина', desc: 'Список дел для продуктивного утра', url: '/templates', tags: ['чеклист', 'утро', 'рутина'] },
  { title: 'Чек-лист Вечерний обзор', desc: 'Вечерняя рефлексия и планирование', url: '/templates', tags: ['чеклист', 'вечер', 'обзор'] },
  { title: 'SMART шаблон целей', desc: 'Форма для постановки целей по SMART', url: '/templates', tags: ['шаблон', 'smart', 'цели'] },
  { title: 'Actionable Item', desc: 'Конкретное действие, которое можно выполнить', url: '/glossary', tags: ['термин', 'actionable'] },
  { title: 'Batching', desc: 'Группировка однотипных задач для эффективности', url: '/glossary', tags: ['термин', 'batching', 'группировка'] },
  { title: 'Context Switching', desc: 'Переключение контекста между задачами', url: '/glossary', tags: ['термин', 'контекст', 'переключение'] },
  { title: 'Deadline Effect', desc: 'Эффект дедлайна — повышение продуктивности перед сроком', url: '/glossary', tags: ['термин', 'дедлайн', 'эффект'] },
  { title: 'Flow', desc: 'Состояние потока — полная вовлеченность в задачу', url: '/glossary', tags: ['термин', 'flow', 'поток'] },
  { title: 'Inbox Zero', desc: 'Подход к полной обработке входящих сообщений', url: '/glossary', tags: ['термин', 'inbox', 'почта'] },
  { title: 'Parkinson Law', desc: 'Работа заполняет всё отведённое на неё время', url: '/glossary', tags: ['термин', 'паркинсон', 'закон'] },
  { title: 'Second Brain', desc: 'Система внешнего хранения знаний и идей', url: '/glossary', tags: ['термин', 'secondbrain', 'знания'] },
  { title: 'Zeigarnik Effect', desc: 'Незавершённые задачи запоминаются лучше завершённых', url: '/glossary', tags: ['термин', 'зейгарник', 'эффект'] },
  { title: 'Прокрастинация', desc: 'Откладывание важных дел на потом', url: '/antiprocrastination', tags: ['прокрастинация', 'откладывание'] },
  { title: 'Привычка', desc: 'Автоматическое поведение, закреплённое повторением', url: '/habits', tags: ['привычка', 'автоматизм'] },
];

function initSearch() {
  const searchIcon = document.getElementById('searchIcon');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (!searchIcon || !searchOverlay) return;

  searchIcon.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput?.focus(), 100);
    searchInput.value = '';
    searchResults.innerHTML = '<p style="color:var(--text-secondary);padding:12px;">Начните вводить запрос...</p><div class="search-shortcut">Ctrl+K — быстрый поиск</div>';
  });

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) searchOverlay.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') searchOverlay.classList.remove('active');
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchOverlay.classList.toggle('active');
      if (searchOverlay.classList.contains('active')) {
        setTimeout(() => searchInput?.focus(), 100);
        searchInput.value = '';
        searchResults.innerHTML = '<p style="color:var(--text-secondary);padding:12px;">Начните вводить запрос...</p>';
      }
    }
  });

  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      searchResults.innerHTML = '<p style="color:var(--text-secondary);padding:12px;">Начните вводить запрос...</p>';
      return;
    }
    const results = searchData.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query))
    ).slice(0, 10);
    if (results.length === 0) {
      searchResults.innerHTML = '<p style="color:var(--text-secondary);padding:12px;">Ничего не найдено</p>';
      return;
    }
    searchResults.innerHTML = results.map(r =>
      `<a href="${r.url}" class="search-result-item" onclick="document.getElementById('searchOverlay').classList.remove('active')">
        <h4>${r.title}</h4>
        <p>${r.desc}</p>
      </a>`
    ).join('');
  });
}

document.addEventListener('DOMContentLoaded', initSearch);
