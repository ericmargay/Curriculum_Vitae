
// Dark mode + Global experience view + Category collapsibles with persistence
(function () {
  const body = document.body;
  const btnTheme = document.querySelector('.btn-toggle');
  const btnView = document.querySelector('.btn-expview');
  const THEME_KEY = 'em-resume-theme';
  const VIEW_KEY = 'em-resume-expview'; // 'short' | 'long'
  const CAT_PREFIX = 'em-cat-'; // persistence for categories

  // Theme
  function applyTheme(theme) {
    body.classList.remove('light', 'dark');
    body.classList.add(theme);
    if (btnTheme) {
      btnTheme.innerHTML = theme === 'dark' ? '<i class="far fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    }
    localStorage.setItem(THEME_KEY, theme);
  }
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  if (btnTheme) {
    btnTheme.addEventListener('click', () => applyTheme(body.classList.contains('dark') ? 'light' : 'dark'));
    btnTheme.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btnTheme.click(); } });
  }

  // Global experience view toggle
  function applyView(view) {
    body.classList.remove('expview-short', 'expview-long');
    body.classList.add(view === 'long' ? 'expview-long' : 'expview-short');
    if (btnView) {
      btnView.setAttribute('aria-pressed', view === 'long' ? 'true' : 'false');
      btnView.innerHTML = '<i class="fas fa-list" aria-hidden="true"></i><span>' + (view === 'long' ? 'Long' : 'Short') + '</span>';
    }
    localStorage.setItem(VIEW_KEY, view);
  }
  const savedView = localStorage.getItem(VIEW_KEY) || 'short';
  applyView(savedView);
  if (btnView) {
    btnView.addEventListener('click', () => applyView(body.classList.contains('expview-long') ? 'short' : 'long'));
    btnView.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btnView.click(); } });
  }

  // Category collapsibles with persistence
  const cats = document.querySelectorAll('.category');
  cats.forEach((cat, idx) => {
    const key = CAT_PREFIX + idx;
    const saved = localStorage.getItem(key);
    if (saved === 'open' || saved === 'closed') {
      cat.setAttribute('data-open', saved === 'open' ? 'true' : 'false');
      const t = cat.querySelector('.cat-toggle');
      if (t) t.setAttribute('aria-expanded', (saved === 'open').toString());
    }
    const toggle = cat.querySelector('.cat-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const open = cat.getAttribute('data-open') !== 'false';
      const next = open ? 'false' : 'true';
      cat.setAttribute('data-open', next);
      toggle.setAttribute('aria-expanded', (next === 'true').toString());
      localStorage.setItem(key, next === 'true' ? 'open' : 'closed');
    });
  });
})();
