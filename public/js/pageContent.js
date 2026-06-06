let pageBlocks = [];

async function loadPageContent(page) {
  try {
    const res = await fetch('/api/page-content/' + page, { credentials: 'same-origin' });
    if (!res.ok) return;
    const data = await res.json();
    pageBlocks = data.blocks || [];
    pageBlocks.forEach(renderBlock);
  } catch (e) {}
}

function renderBlock(block) {
  const el = document.querySelector('[data-block="' + block.section + '"]');
  if (!el) return;
  const c = block.content || {};
  renderers[block.section] ? renderers[block.section](el, block) : el.innerHTML = '<p style="color:var(--text-secondary)">' + (block.title || '') + '</p>';
  if (window.currentUser?.roleId === 1) addAdminTools(el, block);
}

function addAdminTools(el, block) {
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:6px;justify-content:flex-end;margin-bottom:8px;';
  bar.innerHTML = '<button class="btn btn-sm" style="background:var(--bg-secondary);border:1px solid var(--border);padding:2px 10px;font-size:0.8rem;" onclick="openBlockEdit(' + block.id + ')" title="Редактировать">✏️</button><button class="btn btn-sm" style="background:var(--bg-secondary);border:1px solid var(--border);padding:2px 10px;font-size:0.8rem;color:var(--danger);" onclick="deleteBlock(' + block.id + ')" title="Удалить">🗑️</button>';
  el.parentNode.insertBefore(bar, el);
}

const renderers = {
  hero(el, b) {
    const c = b.content;
    el.innerHTML = '<section class="hero"><h1>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p><div class="hero-actions"><a href="' + esc(c.primaryCta?.url || '#') + '" class="btn btn-primary btn-lg">' + esc(c.primaryCta?.text || '') + '</a><a href="' + esc(c.secondaryCta?.url || '#') + '" class="btn btn-outline btn-lg">' + esc(c.secondaryCta?.text || '') + '</a></div></section>';
  },
  audience_cards(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title animate-on-scroll">' + esc(c.title) + '</h2><p class="section-subtitle">' + esc(c.subtitle) + '</p><div class="grid grid-4">' + (c.cards || []).map(card => '<div class="card audience-card"><div class="card-icon">' + card.icon + '</div><h3>' + esc(card.heading) + '</h3><p>' + esc(card.text) + '</p></div>').join('') + '</div>';
  },
  popular_methods(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title animate-on-scroll">' + esc(c.title) + '</h2><p class="section-subtitle">' + esc(c.subtitle) + '</p><div class="grid grid-6">' + (c.methods || []).map(m => '<div class="card" style="text-align:center;cursor:pointer;" onclick="window.location.href=\'' + esc(m.link) + '\'"><div class="card-icon">' + m.emoji + '</div><h3>' + esc(m.name) + '</h3><p>' + esc(m.desc) + '</p><div style="margin-top:8px;"><a href="' + esc(m.link) + '" class="btn btn-sm btn-outline">Подробнее</a></div></div>').join('') + '</div>';
  },
  statistics(el, b) {
    const c = b.content;
    el.innerHTML = '<div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:32px;text-align:center;">' + (c.stats || []).map(s => '<div><div class="stat-number">' + esc(s.number) + '</div><p style="color:var(--text-secondary);">' + esc(s.label) + '</p></div>').join('') + '</div>';
  },
  why_procrastinate(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div class="grid grid-3" style="margin-top:24px;">' + (c.cards || []).map(card => '<div class="card" style="text-align:center;"><div class="card-icon">' + card.icon + '</div><h3>' + esc(card.title) + '</h3><p>' + esc(card.desc) + '</p></div>').join('') + '</div>';
  },
  techniques(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><p class="section-subtitle">' + esc(c.subtitle) + '</p><div class="grid grid-2">' + (c.cards || []).map((card, i) => '<div class="card"' + (i === c.cards.length - 1 ? ' style="grid-column:1/-1;"' : '') + '><div class="card-icon">' + card.icon + '</div><h3>' + esc(card.name) + '</h3><p>' + esc(card.desc) + '</p></div>').join('') + '</div>';
  },
  tools_table(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div class="table-wrapper"><table><thead><tr>' + (c.headers || []).map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + (c.rows || []).map(r => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.blocks || '') + '</td><td>' + esc(r.price || '') + '</td><td>' + esc(r.audience || '') + '</td></tr>').join('') + '</tbody></table></div>';
  },
  checklist(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><p class="section-subtitle">' + esc(c.subtitle || '') + '</p><div style="max-width:500px;margin:0 auto;">' + (c.items || []).map((item, i) => '<div class="checklist-item"><input type="checkbox" class="procrast-check"> ' + esc((i + 1) + '. ' + item) + '</div>').join('') + '</div>';
  },
  science(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div class="grid grid-3" style="margin-top:24px;">' + (c.cards || []).map(card => '<div class="card" style="text-align:center;"><div class="card-icon">' + card.icon + '</div><h3>' + esc(card.title) + '</h3><p>' + esc(card.desc) + '</p></div>').join('') + '</div>' + (c.cite ? '<p style="text-align:center;margin-top:20px;color:var(--text-secondary);font-size:0.9rem;">' + esc(c.cite) + '</p>' : '');
  },
  popular_habits(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><p class="section-subtitle">' + esc(c.subtitle) + '</p><div class="grid grid-2">' + (c.habits || []).map(h => '<div class="card"><div class="card-icon">' + h.emoji + '</div><h3>' + esc(h.name) + '</h3><p>' + esc(h.desc) + '</p></div>').join('') + '</div>';
  },
  comparison_table(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div class="table-wrapper"><table><thead><tr>' + (c.headers || []).map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + (c.rows || []).map(r => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.platforms || '') + '</td><td>' + esc(r.game || '') + '</td><td>' + esc(r.stats || '') + '</td><td>' + esc(r.free || '') + '</td></tr>').join('') + '</tbody></table></div>';
  },
  bad_habits(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div class="split-layout">' + (c.cards || []).map((card, i) => '<div' + (i === (c.cards || []).length - 1 ? ' style="grid-column:1/-1;"' : '') + '><div class="card"><div class="card-icon">' + card.icon + '</div><h3>' + esc(card.title) + '</h3><p>' + esc(card.desc) + '</p>' + (card.example ? '<p style="margin-top:8px;color:var(--text-secondary);"><strong>Пример:</strong> ' + esc(card.example) + '</p>' : '') + '</div></div>').join('') + '</div>';
  },
  mission(el, b) {
    const c = b.content;
    el.innerHTML = '<div class="split-layout"><div><h2 style="margin-bottom:16px;">' + esc(c.title) + '</h2><p style="color:var(--text-secondary);margin-bottom:12px;">' + esc(c.text) + '</p><p style="color:var(--text-secondary);margin-bottom:12px;">Наш сайт создан, чтобы помочь вам:</p><ul style="color:var(--text-secondary);padding-left:20px;line-height:2;">' + (c.bullets || []).map(b => '<li>' + esc(b) + '</li>').join('') + '</ul></div><div><h2 style="margin-bottom:16px;">Актуальность</h2><p style="color:var(--text-secondary);margin-bottom:12px;">По данным исследований:</p><ul style="color:var(--text-secondary);padding-left:20px;line-height:2;">' + (c.relevanceBullets || []).map(b => '<li>' + esc(b) + '</li>').join('') + '</ul></div></div>';
  },
  author(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div style="max-width:500px;margin:24px auto 0;text-align:center;"><div style="width:100px;height:100px;border-radius:50%;background:var(--accent);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#fff;font-weight:700;">' + esc(c.avatarLetter || '') + '</div><h3>' + esc(c.name) + '</h3><p style="color:var(--text-secondary);margin-top:4px;">' + esc(c.course) + '</p><p style="color:var(--text-secondary);">' + esc(c.diploma) + '</p></div>';
  },
  sources(el, b) {
    const c = b.content;
    el.innerHTML = '<h2 class="section-title">' + esc(c.title) + '</h2><div style="max-width:600px;margin:24px auto 0;"><ol style="color:var(--text-secondary);line-height:2;">' + (c.items || []).map(item => '<li>' + esc(item) + '</li>').join('') + '</ol></div>';
  }
};

function esc(s) { if (s == null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

window.openBlockEdit = async function(id) {
  const block = pageBlocks.find(b => b.id === id);
  if (!block) return;
  const json = JSON.stringify(block.content, null, 2);
  const html = '<div class="modal"><button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">&times;</button><h2>' + (block.title || '') + '</h2><div class="form-group"><label>Заголовок</label><input type="text" id="blockEditTitle" class="form-input" value="' + esc(block.title || '') + '"></div><div class="form-group"><label>Данные (JSON)</label><textarea id="blockEditContent" class="form-input" rows="15" style="font-family:monospace;font-size:0.85rem;">' + esc(json) + '</textarea></div><button class="btn btn-primary" onclick="saveBlockEdit(' + id + ')">Сохранить</button></div>';
  const overlay = document.createElement('div'); overlay.className = 'modal-overlay active'; overlay.innerHTML = html;
  overlay.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
  document.body.appendChild(overlay);
};

window.saveBlockEdit = async function(id) {
  const title = document.getElementById('blockEditTitle').value;
  const content = JSON.parse(document.getElementById('blockEditContent').value || '{}');
  const res = await fetch('/api/page-content/' + pageBlocks.find(b => b.id === id).page + '/' + id, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }), credentials: 'same-origin'
  });
  if (!res.ok) { showToast('Ошибка сохранения', 'error'); return; }
  document.querySelector('.modal-overlay.active')?.remove();
  showToast('✅ Сохранено', 'success');
  location.reload();
};

window.deleteBlock = async function(id) {
  if (!confirm('Удалить этот блок?')) return;
  const block = pageBlocks.find(b => b.id === id);
  await fetch('/api/page-content/' + block.page + '/' + id, { method: 'DELETE', credentials: 'same-origin' });
  showToast('🗑️ Блок удалён', 'info');
  location.reload();
};
