function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  if (toggle) toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
    if (window.currentUser) {
      fetch('/api/theme', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: next }),
        credentials: 'same-origin'
      }).catch(() => {});
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
}

document.addEventListener('DOMContentLoaded', initTheme);
