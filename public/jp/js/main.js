// S.E.A.T.S Inc. Recruitment LP

document.addEventListener('DOMContentLoaded', function () {
  // ----- Mobile navigation -----
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.header-nav');

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  // Close the mobile menu after tapping a link
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });


  // ----- Scroll reveal (motion-safe, progressive enhancement) -----
  var reveals = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    // Only hide the elements once we know we can reveal them again.
    document.documentElement.classList.add('reveal-ready');

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    // threshold 0: very tall elements (the open positions card) could never reach a % threshold
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ----- Open position accordion (正社員採用について見る▼) -----
  var accordion = document.getElementById('position-accordion');
  var accToggle = document.querySelector('.position-toggle');
  var accClose = document.querySelector('.position-close');

  if (accordion && accToggle) {
    var accLabel = accToggle.querySelector('.position-toggle-label');

    var setAccordion = function (open) {
      accordion.classList.toggle('is-open', open);
      accToggle.setAttribute('aria-expanded', String(open));
      accLabel.textContent = open ? '正社員採用の詳細を閉じる' : '正社員採用について見る';
    };

    accToggle.addEventListener('click', function () {
      setAccordion(!accordion.classList.contains('is-open'));
    });

    // The bottom close button also brings the reader back up to the button.
    if (accClose) {
      accClose.addEventListener('click', function () {
        setAccordion(false);
        accToggle.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center'
        });
        accToggle.focus({ preventScroll: true });
      });
    }
  }


  // ----- Floating bonus button (FAB) -----
  // Links to https://seats-inc.com/jp/#contact. When the form is on this
  // same page, scroll to it smoothly instead of reloading the page.
  var fab = document.getElementById('fab-bonus');
  var contactSection = document.getElementById('contact');

  if (fab && contactSection) {
    fab.addEventListener('click', function (e) {
      e.preventDefault();
      contactSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      if (window.history && history.replaceState) {
        history.replaceState(null, '', '#contact');
      }
    });
  }


  // ----- Contact form -----
  // Posts to this site's own API, so submissions land in admin -> Messages like every other
  // contact channel, instead of a third-party dashboard (was Formspree).
  var LEAD_ENDPOINT = '/api/jp-lead/';

  var form = document.getElementById('contact-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var isEmpty = !field.value.trim();
      var isBadEmail = field.type === 'email' && field.value.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());

      field.classList.toggle('field-error', isEmpty || isBadEmail);
      if (isEmpty || isBadEmail) valid = false;
    });

    if (!valid) return;

    var submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    fetch(LEAD_ENDPOINT, {
      method: 'POST',
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Submission error: ' + res.status);
        // A dedicated URL (not an inline swap) so Google Ads/GA conversion tracking can count
        // completed submissions by pageview on this specific Thank You page.
        window.location.href = '/jp/thanks/';
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
        var note = form.querySelector('.form-note');
        note.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
        note.style.color = '#d43c3c';
      });
  });

  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('field-error') && e.target.value.trim()) {
      e.target.classList.remove('field-error');
    }
  });
});
