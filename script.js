// Dark mode + Global experience view + Category collapsibles with persistence + PDF export
(function () {
  const body = document.body;
  const btnTheme = document.querySelector('.btn-toggle');
  const btnView = document.querySelector('.btn-expview');
  const btnPDF  = document.getElementById('btn-pdf');

  const THEME_KEY = 'em-resume-theme';
  const VIEW_KEY  = 'em-resume-expview'; // 'short' | 'long'
  const CAT_PREFIX = 'em-cat-';

  // Theme
  function applyTheme(theme) {
    body.classList.remove('light', 'dark');
    body.classList.add(theme);
    if (btnTheme) {
      btnTheme.innerHTML = theme === 'dark'
        ? '<i class="far fa-sun" aria-hidden="true"></i>'
        : '<i class="fas fa-moon" aria-hidden="true"></i>';
    }
    localStorage.setItem(THEME_KEY, theme);
  }
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  if (btnTheme) btnTheme.addEventListener('click', () => applyTheme(body.classList.contains('dark') ? 'light' : 'dark'));

  // View (Short / Long)
  function applyView(view) {
    body.classList.remove('expview-short', 'expview-long');
    body.classList.add(view === 'long' ? 'expview-long' : 'expview-short');
    if (btnView) {
      btnView.setAttribute('aria-pressed', view === 'long' ? 'true' : 'false');
      btnView.innerHTML = '<i class="fas fa-list" aria-hidden="true"></i><span>' + (view === 'long' ? 'Long' : 'Short') + '</span>';
    }
    localStorage.setItem(VIEW_KEY, view);
  }
  applyView(localStorage.getItem(VIEW_KEY) || 'short');
  if (btnView) btnView.addEventListener('click', () => applyView(body.classList.contains('expview-long') ? 'short' : 'long'));

  // Category accordions persistence
  document.querySelectorAll('.category').forEach((cat, idx) => {
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

  // PDF export (client-side)
  async function generatePDF() {
    if (typeof html2pdf === 'undefined') {
      alert('PDF library failed to load. Please refresh and try again.');
      return;
    }

    const page = document.querySelector('.page');
    if (!page) return;

    body.classList.add('pdf-export');
    await new Promise((r) => setTimeout(r, 60));

    const opt = {
      margin: [8, 8, 10, 8],
      filename: 'Eric_Margay_CV.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
      // Clone to avoid capturing floating buttons
      const clone = page.cloneNode(true);

      // Remove FAB actions from clone
      const actions = clone.querySelector('.header__actions');
      if (actions) actions.remove();

      // Inject PDF-only web CV link under phone
      const contact = clone.querySelector('.header__contact');
      if (contact) {
        const phoneField = Array.from(contact.querySelectorAll('.header__contact-field'))
          .find((d) => (d.textContent || '').toLowerCase().includes('phone'));
        const webField = document.createElement('div');
        webField.className = 'header__contact-field pdf-only-webline';
        webField.innerHTML =
          '<span class="header__contact-label">CV version web: </span>' +
          '<a href="https://ericmargay.github.io/DevResumeCV/" class="header__contact-value">https://ericmargay.github.io/DevResumeCV/</a>';
        if (phoneField) phoneField.insertAdjacentElement('afterend', webField);
        else contact.appendChild(webField);
      }

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.appendChild(clone);
      document.body.appendChild(holder);

      await html2pdf().set(opt).from(clone).save();
      holder.remove();
    } catch (err) {
      console.error(err);
      alert('Could not generate PDF. Try again.');
    } finally {
      body.classList.remove('pdf-export');
    }
  }

  if (btnPDF) btnPDF.addEventListener('click', generatePDF);
})();
