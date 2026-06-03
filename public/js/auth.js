let currentUser = null;

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

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('[name="email"]').value;
    const password = loginForm.querySelector('[name="password"]').value;
    const errorEl = loginForm.querySelector('.error-text');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok) { errorEl.textContent = data.error; return; }
      currentUser = data.user;
      closeModal('authModal');
      updateUserUI();
      showToast('Вы вошли как ' + data.user.name, 'success');
      syncFromServer();
    } catch (err) {
      errorEl.textContent = 'Ошибка соединения с сервером';
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = registerForm.querySelector('[name="name"]').value;
    const email = registerForm.querySelector('[name="email"]').value;
    const password = registerForm.querySelector('[name="password"]').value;
    const confirm = registerForm.querySelector('[name="confirm"]')?.value || '';
    const errorEl = registerForm.querySelector('.error-text');
    if (password !== confirm) { errorEl.textContent = 'Пароли не совпадают'; return; }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok) { errorEl.textContent = data.error; return; }
      currentUser = data.user;
      closeModal('authModal');
      updateUserUI();
      showToast('Регистрация успешна!', 'success');
      syncFromServer();
    } catch (err) {
      errorEl.textContent = 'Ошибка соединения с сервером';
    }
  });

  checkAuth();
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
