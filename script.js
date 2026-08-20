/* Eric Margay — Resume / CV
   Progressive enhancement only: the page is fully readable with JS disabled. */

(function () {
    'use strict';

    var root = document.documentElement;

    /* ---------------------------------------------------------------
       Theme — explicit choice wins, otherwise the OS preference does.
       The initial value is applied by the inline script in <head>.
       --------------------------------------------------------------- */

    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function isDark() {
        var stored = root.getAttribute('data-theme');
        if (stored === 'dark') return true;
        if (stored === 'light') return false;
        return systemDark.matches;
    }

    var themeToggle = document.getElementById('theme-toggle');

    function syncThemeButton() {
        if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isDark()));
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = isDark() ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('cv-theme', next); } catch (e) { }
            syncThemeButton();
        });
    }

    // Follow the OS while the visitor has not made an explicit choice.
    var onSystemChange = function () {
        if (!root.getAttribute('data-theme')) syncThemeButton();
    };
    if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);
    else if (systemDark.addListener) systemDark.addListener(onSystemChange);

    syncThemeButton();

    /* ---------------------------------------------------------------
       Language — CSS hides the inactive tree, so this only flips a flag.
       --------------------------------------------------------------- */

    var langButtons = document.querySelectorAll('[data-set-lang]');

    function setLang(lang) {
        root.setAttribute('data-lang', lang);
        root.lang = lang;
        try { localStorage.setItem('cv-lang', lang); } catch (e) { }

        Array.prototype.forEach.call(langButtons, function (btn) {
            btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === lang));
        });

        // Each CV variant owns its copy and metadata while sharing this behavior.
        // The fallback keeps older/standalone pages working without data attributes.
        document.title = root.getAttribute('data-title-' + lang) || (lang === 'es'
            ? 'Eric Margay — Ingeniero de Machine Learning y Datos'
            : 'Eric Margay — Machine Learning & Python Data Engineer');
    }

    Array.prototype.forEach.call(langButtons, function (btn) {
        btn.addEventListener('click', function () {
            setLang(btn.getAttribute('data-set-lang'));
        });
    });

    setLang(root.getAttribute('data-lang') === 'es' ? 'es' : 'en');

    /* ---------------------------------------------------------------
       Print / Save as PDF
       --------------------------------------------------------------- */

    ['print-btn', 'print-btn-top', 'fab-print'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', function () { window.print(); });
    });

    // The "more detail" blocks are deliberately web-only: the print stylesheet
    // hides them so the PDF keeps its Harvard-length 4–6 bullets per role.

    /* ---------------------------------------------------------------
       Scroll reveal
       --------------------------------------------------------------- */

    var revealTargets = document.querySelectorAll(
        '.section__title, .section__note, .entry, .card'
    );

    function revealAll() {
        Array.prototype.forEach.call(revealTargets, function (el) {
            el.classList.add('is-revealed');
        });
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
        revealAll();
    } else {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-revealed');
                obs.unobserve(e.target); // Reveal once, never re-hide.
            });
        }, {
            // Fires slightly before the element reaches the viewport edge so
            // the motion reads as easing in rather than popping.
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.08
        });

        Array.prototype.forEach.call(revealTargets, function (el) {
            revealObserver.observe(el);
        });

        // Anything already on screen at load reveals immediately.
        requestAnimationFrame(function () {
            Array.prototype.forEach.call(revealTargets, function (el) {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('is-revealed');
                    revealObserver.unobserve(el);
                }
            });
        });
    }

    // Printing must never capture a half-played animation.
    window.addEventListener('beforeprint', revealAll);
    var printQuery = window.matchMedia('print');
    if (printQuery.addEventListener) {
        printQuery.addEventListener('change', function (e) {
            if (e.matches) revealAll();
        });
    }

    /* ---------------------------------------------------------------
       Reading progress + active section in the nav
       --------------------------------------------------------------- */

    var bar = document.getElementById('progress-bar');
    var navLinks = document.querySelectorAll('#section-nav a');
    var mainCol = document.querySelector('.layout__main');
    var layout = document.querySelector('.layout');
    var sidebar = document.querySelector('.layout__aside');
    var sections = [];

    Array.prototype.forEach.call(navLinks, function (link) {
        var target = document.getElementById(link.getAttribute('href').slice(1));
        // Only spy on the scrolling column. The sidebar is sticky, so its
        // sections have no stable document position to compare against —
        // those links stay plain jump links.
        if (target && mainCol && mainCol.contains(target)) {
            sections.push({ link: link, target: target });
        }
    });

    var ticking = false;

    function update() {
        ticking = false;

        if (bar) {
            var scrollable = document.documentElement.scrollHeight - window.innerHeight;
            var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
        }

        // The desktop sidebar has its own hidden overflow so it can remain
        // sticky. Tie that overflow to the main page journey: when the layout
        // reaches its end, the final sidebar content is guaranteed to be in
        // view as well. Manual scrolling inside the sidebar still works until
        // the document itself moves again.
        if (layout && sidebar && window.innerWidth >= 1000) {
            var sidebarRange = sidebar.scrollHeight - sidebar.clientHeight;

            if (sidebarRange > 0) {
                var stickyOffset = (parseFloat(getComputedStyle(root).getPropertyValue('--topbar-height')) || 60) + 24;
                var layoutTop = layout.getBoundingClientRect().top + window.scrollY;
                var journeyStart = Math.max(0, layoutTop - stickyOffset);
                var journeyEnd = Math.max(journeyStart + 1, layoutTop + layout.offsetHeight - window.innerHeight);
                var journey = (window.scrollY - journeyStart) / (journeyEnd - journeyStart);
                var clampedJourney = Math.min(1, Math.max(0, journey));

                sidebar.scrollTop = clampedJourney * sidebarRange;
            }
        }

        if (!sections.length) return;

        // The last section whose top has passed the sticky bar is the current one.
        var offset = (parseFloat(getComputedStyle(root).getPropertyValue('--topbar-height')) || 60) + 24;
        var current = null;

        sections.forEach(function (s) {
            if (s.target.getBoundingClientRect().top <= offset) current = s;
        });

        // Snap to the final section once the page is scrolled to the bottom.
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1];
        }

        sections.forEach(function (s) {
            var active = s === current;
            s.link.classList.toggle('is-active', active);
            if (active) s.link.setAttribute('aria-current', 'true');
            else s.link.removeAttribute('aria-current');
        });
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

})();
