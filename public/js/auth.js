let currentUser = null;

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
    const orig = btn.textContent;
    btn.dataset.origText = orig;
    btn.innerHTML = '<span class="spinner"></span>' + orig;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.textContent = btn.dataset.origText || btn.textContent;
  }
}

function initAuth() {
  const loginBtn = document.getElementById('loginBtn');
  const authModal = document.getElementById('authModal');
  const modalClose = authModal?.querySelector('.modal-close');
  const tabs = authModal?.querySelectorAll('.auth-tab');
  const forms = authModal?.querySelectorAll('.auth-form');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginBtn) loginBtn.addEventListener('click', () => openModal('authModal'));

  if (modalClose) modalClose.addEventListener('click', () => closeModal('authModal'));

  tabs?.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    forms.forEach(f => f.classList.remove('active'));
    document.getElementById(tab.dataset.form)?.classList.add('active');
  }));

  initForgotPassword(loginForm);

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    const email = loginForm.querySelector('[name="email"]').value;
    const password = loginForm.querySelector('[name="password"]').value;
    const errorEl = loginForm.querySelector('.error-text');
    errorEl.textContent = '';
    setLoading(btn, true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), credentials: 'same-origin'
      });
      const data = await res.json();
      setLoading(btn, false);
      if (!res.ok) { errorEl.textContent = data.error; return; }
      currentUser = data.user;
      closeModal('authModal');
      updateUserUI();
      showToast('Вы вошли как ' + data.user.name, 'success');
      syncFromServer();
    } catch (err) {
      setLoading(btn, false);
      errorEl.textContent = 'Ошибка соединения с сервером';
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type="submit"]');
    const name = registerForm.querySelector('[name="name"]').value;
    const email = registerForm.querySelector('[name="email"]').value;
    const password = registerForm.querySelector('[name="password"]').value;
    const confirm = registerForm.querySelector('[name="confirm"]')?.value || '';
    const errorEl = registerForm.querySelector('.error-text');
    if (password !== confirm) { errorEl.textContent = 'Пароли не совпадают'; return; }
    errorEl.textContent = '';
    setLoading(btn, true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), credentials: 'same-origin'
      });
      const data = await res.json();
      setLoading(btn, false);
      if (!res.ok) { errorEl.textContent = data.error; return; }
      currentUser = data.user;
      closeModal('authModal');
      updateUserUI();
      showToast('Регистрация успешна!', 'success');
      syncFromServer();
    } catch (err) {
      setLoading(btn, false);
      errorEl.textContent = 'Ошибка соединения с сервером';
    }
  });

  checkAuth();
}

function initForgotPassword(loginForm) {
  if (!loginForm) return;
  if (document.getElementById('forgotContainer')) return;

  const container = document.createElement('div');
  container.id = 'forgotContainer';
  container.style.cssText = 'text-align:center;margin-top:10px;';

  const forgotLink = document.createElement('a');
  forgotLink.href = '#';
  forgotLink.textContent = 'Забыли пароль?';
  forgotLink.style.cssText = 'font-size:0.85rem;color:var(--text-secondary);';
  container.appendChild(forgotLink);

  const forgotForm = document.createElement('div');
  forgotForm.id = 'forgotForm';
  forgotForm.style.display = 'none';
  forgotForm.style.marginTop = '10px';

  const step1 = document.createElement('div');
  step1.id = 'forgotStep1';
  step1.innerHTML = '<div class="form-group"><label>Ваш email</label><input type="email" id="forgotEmail" class="form-input" placeholder="example@mail.ru" required></div><div class="error-text" id="forgotError"></div><button type="button" class="btn btn-primary" id="forgotSendBtn" style="width:100%;">Получить код</button>';
  forgotForm.appendChild(step1);

  const step2 = document.createElement('div');
  step2.id = 'forgotStep2';
  step2.style.display = 'none';
  step2.innerHTML = '<div class="form-group"><label>Код из письма</label><input type="text" id="forgotToken" class="form-input" placeholder="Введите код" required></div><div class="form-group"><label>Новый пароль</label><input type="password" id="forgotNewPassword" class="form-input" placeholder="Не менее 4 символов" minlength="4" required></div><button type="button" class="btn btn-primary" id="forgotResetBtn" style="width:100%;">Сбросить пароль</button>';
  forgotForm.appendChild(step2);

  const backLink = document.createElement('div');
  backLink.style.marginTop = '8px';
  backLink.innerHTML = '<a href="#" id="forgotBack" style="font-size:0.85rem;color:var(--text-secondary);">← Вернуться ко входу</a>';
  forgotForm.appendChild(backLink);

  container.appendChild(forgotForm);
  loginForm.appendChild(container);

  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.querySelector('button[type="submit"]').style.display = 'none';
    document.querySelectorAll('.auth-tab').forEach(t => t.style.display = 'none');
    forgotLink.style.display = 'none';
    forgotForm.style.display = 'block';
    step1.style.display = 'block';
    step2.style.display = 'none';
  });

  document.getElementById('forgotBack')?.addEventListener('click', (e) => {
    e.preventDefault();
    forgotForm.style.display = 'none';
    forgotLink.style.display = '';
    loginForm.querySelector('button[type="submit"]').style.display = '';
    document.querySelectorAll('.auth-tab').forEach(t => t.style.display = '');
  });

  document.getElementById('forgotSendBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('forgotEmail').value;
    const errorEl = document.getElementById('forgotError');
    const btn = document.getElementById('forgotSendBtn');
    if (!email) { errorEl.textContent = 'Введите email'; return; }
    errorEl.textContent = '';
    setLoading(btn, true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), credentials: 'same-origin'
      });
      const data = await res.json();
      setLoading(btn, false);
      if (!res.ok) { errorEl.textContent = data.error; return; }
      if (data.token) {
        showToast('Ваш код: ' + data.token + ' (демо-режим)', 'info');
      }
      step1.style.display = 'none';
      step2.style.display = 'block';
      document.getElementById('forgotToken').dataset.email = email;
    } catch (err) {
      setLoading(btn, false);
      errorEl.textContent = 'Ошибка соединения';
    }
  });

  document.getElementById('forgotResetBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('forgotToken').dataset.email;
    const token = document.getElementById('forgotToken').value;
    const newPassword = document.getElementById('forgotNewPassword').value;
    const errorEl = document.getElementById('forgotError');
    const btn = document.getElementById('forgotResetBtn');
    if (!token || !newPassword) { errorEl.textContent = 'Заполните все поля'; return; }
    if (newPassword.length < 4) { errorEl.textContent = 'Пароль должен быть не менее 4 символов'; return; }
    errorEl.textContent = '';
    setLoading(btn, true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }), credentials: 'same-origin'
      });
      const data = await res.json();
      setLoading(btn, false);
      if (!res.ok) { errorEl.textContent = data.error; return; }
      showToast('Пароль изменён! Теперь войдите с новым паролем.', 'success');
      document.getElementById('forgotBack')?.click();
    } catch (err) {
      setLoading(btn, false);
      errorEl.textContent = 'Ошибка соединения';
    }
  });
}

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.user) {
      currentUser = data.user;
      updateUserUI();
      syncFromServer();
    }
  } catch (err) {}
}

function updateUserUI() {
  const loginBtn = document.getElementById('loginBtn');
  const userMenu = document.getElementById('userMenu');
  if (currentUser && userMenu) {
    if (loginBtn) loginBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userMenu.querySelector('.user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
    userMenu.querySelector('.user-name').textContent = currentUser.name;

  } else if (loginBtn) {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

function syncFromServer() {
  if (!currentUser) return;
  fetch('/api/sync', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data.theme) {
        applyTheme(data.theme);
        localStorage.setItem('theme', data.theme);
      }
      localStorage.setItem('synced_habits', JSON.stringify(data.habits || []));
      localStorage.setItem('synced_favorites', JSON.stringify((data.favorites || []).map(f => f.term)));
      localStorage.setItem('synced_tests', JSON.stringify(data.testResults || []));
      localStorage.setItem('synced_micro_steps', JSON.stringify(data.microSteps || []));
      window.dispatchEvent(new CustomEvent('synced'));
    })
    .catch(() => {});
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function showToast(msg, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', initAuth);
