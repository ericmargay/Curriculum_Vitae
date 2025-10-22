// Dark mode toggle with persistence & system preference
(function () {
  const btnToggle = document.querySelector('.btn-toggle');
  const body = document.body;
  const STORAGE_KEY = 'em-resume-theme';

  function apply(theme) {
    body.classList.remove('light', 'dark');
    body.classList.add(theme);
    if (btnToggle) {
      btnToggle.innerHTML = theme === 'dark' ? '<i class="far fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // initial theme: saved → system → light
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved || (prefersDark ? 'dark' : 'light'));

  // click + keyboard
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      apply(body.classList.contains('dark') ? 'light' : 'dark');
    });
    btnToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btnToggle.click(); }
    });
  }
})();