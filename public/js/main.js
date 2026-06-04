function initMicroStep() {
  const btn = document.getElementById('microStepBtn');
  const display = document.getElementById('microStepDisplay');
  const counter = document.getElementById('microStepCounter');
  if (!btn || !display) return;
  const actions = [
    'Закройте лишнюю вкладку в браузере',
    'Запишите 3 задачи на завтра',
    'Уберите телефон на 10 минут',
    'Выпейте стакан воды',
    'Сделайте 5 глубоких вдохов',
    'Откройте самый важный документ',
    'Напишите одну строчку отчёта',
    'Разомните шею и плечи',
    'Проветрите комнату',
    'Очистите рабочий стол',
    'Установите таймер на 5 минут',
    'Напишите одно сообщение, которое откладывали'
  ];
  function getWeekStart() {
    const d = new Date(); d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }
  function updateCounter() {
    const weekStart = getWeekStart();
    const key = 'microstep_' + weekStart;
    const count = parseInt(localStorage.getItem(key) || '0');
    if (counter) counter.textContent = count;
    return count;
  }
  function saveCounter(count) {
    const weekStart = getWeekStart();
    const key = 'microstep_' + weekStart;
    localStorage.setItem(key, count.toString());
    if (counter) counter.textContent = count;
    if (currentUser) {
      fetch('/api/micro-steps', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, weekStart }), credentials: 'same-origin'
      }).catch(() => {});
    }
  }
  function getSyncedCount() {
    try {
      const steps = JSON.parse(localStorage.getItem('synced_micro_steps') || '[]');
      const ws = getWeekStart();
      const found = steps.find(s => s.weekStart === ws);
      if (found) return found.count;
    } catch(e) {}
    return null;
  }
  btn.addEventListener('click', () => {
    const random = actions[Math.floor(Math.random() * actions.length)];
    display.textContent = random;
    display.classList.remove('pop');
    void display.offsetWidth;
    display.classList.add('pop');
    let count = updateCounter();
    count++;
    saveCounter(count);
  });
  let initialCount = getSyncedCount();
  if (initialCount === null) initialCount = updateCounter();
  else if (counter) counter.textContent = initialCount;
}

function initLoadCalculator() {
  const calc = document.getElementById('loadCalculator');
  if (!calc) return;
  const hoursInput = calc.querySelector('.hours-input');
  const tasksInput = calc.querySelector('.tasks-input');
  const result = calc.querySelector('.calc-result');
  function calculate() {
    const hours = parseFloat(hoursInput.value) || 0;
    const tasks = parseInt(tasksInput.value) || 0;
    if (!hours || !tasks) { result.innerHTML = ''; return; }
    const maxTasks = Math.floor(hours / 1.5);
    let advice = '';
    if (tasks > maxTasks) {
      advice = `<div style="color:var(--danger);font-weight:600;">⚠️ Вам стоит сократить до ${maxTasks} задач или использовать Time Blocking. При текущей загрузке качество выполнения пострадает.</div>`;
    } else if (tasks > maxTasks * 0.7) {
      advice = `<div style="color:var(--warning);font-weight:600;">⚡ Загрузка оптимальная, но близка к пределу. Рекомендуем не брать больше задач.</div>`;
    } else {
      advice = `<div style="color:var(--success);font-weight:600;">✅ У вас достаточно времени. Можно добавить ещё задач или уделить внимание глубокой работе.</div>`;
    }
    result.innerHTML = advice;
  }
  hoursInput.addEventListener('input', calculate);
  tasksInput.addEventListener('input', calculate);
}

function initAudienceCards() {
  document.querySelectorAll('.audience-card').forEach(card => {
    card.addEventListener('click', () => {
      const audience = card.dataset.audience;
      if (!audience) return;
      const pages = {
        student: '/habits',
        worker: '/methods',
        freelancer: '/antiprocrastination',
        parent: '/habits'
      };
      window.location.href = pages[audience] || '/methods';
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initMicroStep();
  initLoadCalculator();
  initAudienceCards();
  highlightCurrentPage();
  initScrollAnimations();
});

function highlightCurrentPage() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}
