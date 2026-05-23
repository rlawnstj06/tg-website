document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation Toggle ──────────────────
  const navToggle = document.getElementById('navToggle');
  const menuOverlay = document.getElementById('menuOverlay');
  const navLinks = document.querySelectorAll('[data-nav]');

  function toggleMenu() {
    navToggle.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
  }

  navToggle.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuOverlay.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // ── Navbar Scroll Effect ───────────────
  const nav = document.getElementById('nav');
  const isPortfolioPage = nav.classList.contains('nav--portfolio');

  if (!isPortfolioPage) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  // ── Scroll Reveal ──────────────────────
  const revealElements = document.querySelectorAll(
    '.section__header, .about__top, .about__story, .about__image, .team__member, ' +
    '.services__header, .services__item, .portfolio__section-title, .portfolio__item, ' +
    '.contact__info, .contact__form-wrapper, ' +
    '.pf-hero__content, .pf-section__title, .pf-card, .pf-cta__inner'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Portfolio Filter ───────────────────
  const filterBtns = document.querySelectorAll('.portfolio__filter-btn');
  const commercialSection = document.getElementById('portfolio-commercial');
  const residentialSection = document.getElementById('portfolio-residential');
  const projectCount = document.getElementById('projectCount');

  function updateProjectCount() {
    if (!projectCount) return;
    let count = 0;
    if (commercialSection && !commercialSection.classList.contains('hidden')) {
      count += commercialSection.querySelectorAll('.pf-card, .portfolio__item').length;
    }
    if (residentialSection && !residentialSection.classList.contains('hidden')) {
      count += residentialSection.querySelectorAll('.pf-card, .portfolio__item').length;
    }
    projectCount.textContent = count + ' Project' + (count !== 1 ? 's' : '');
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      if (filter === 'all') {
        if (commercialSection) commercialSection.classList.remove('hidden');
        if (residentialSection) residentialSection.classList.remove('hidden');
      } else if (filter === 'commercial') {
        if (commercialSection) commercialSection.classList.remove('hidden');
        if (residentialSection) residentialSection.classList.add('hidden');
      } else if (filter === 'residential') {
        if (commercialSection) commercialSection.classList.add('hidden');
        if (residentialSection) residentialSection.classList.remove('hidden');
      }

      updateProjectCount();
    });
  });

  // ── Quote Form ─────────────────────────
  const quoteForm = document.getElementById('quoteForm');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = quoteForm.querySelector('.form__submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Thank You!';
      submitBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.pointerEvents = '';
        quoteForm.reset();
      }, 3000);
    });
  }

  // ── Smooth Scroll for Anchor Links ─────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ── CMS / Admin System ─────────────────
  const ADMIN_PASSWORD = 'tggc2026';
  const STORAGE_KEY = 'tggc_cms_content';

  const adminTrigger = document.getElementById('adminTrigger');
  const adminModal = document.getElementById('adminModal');
  const adminModalClose = document.getElementById('adminModalClose');
  const adminPassword = document.getElementById('adminPassword');
  const adminError = document.getElementById('adminError');
  const adminSubmit = document.getElementById('adminSubmit');
  const adminToolbar = document.getElementById('adminToolbar');
  const adminSave = document.getElementById('adminSave');
  const adminExit = document.getElementById('adminExit');

  const editableElements = document.querySelectorAll('[data-editable]');

  function loadSavedContent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const content = JSON.parse(saved);
      editableElements.forEach(el => {
        const key = el.dataset.editable;
        if (content[key] !== undefined) {
          el.innerHTML = content[key];
        }
      });
    } catch (e) {
      // silent fail
    }
  }

  function saveContent() {
    let content = {};
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) content = JSON.parse(existing);
    } catch (e) {}
    editableElements.forEach(el => {
      content[el.dataset.editable] = el.innerHTML;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }

  function enterAdminMode() {
    document.body.classList.add('admin-mode');
    adminToolbar.classList.add('active');
    adminModal.classList.remove('active');
    adminPassword.value = '';
    adminError.textContent = '';

    editableElements.forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('editable');
    });
  }

  function exitAdminMode() {
    document.body.classList.remove('admin-mode');
    adminToolbar.classList.remove('active');

    editableElements.forEach(el => {
      el.contentEditable = 'false';
      el.classList.remove('editable');
    });
  }

  adminTrigger.addEventListener('click', () => {
    adminModal.classList.add('active');
    setTimeout(() => adminPassword.focus(), 100);
  });

  adminModalClose.addEventListener('click', () => {
    adminModal.classList.remove('active');
    adminPassword.value = '';
    adminError.textContent = '';
  });

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      adminModal.classList.remove('active');
      adminPassword.value = '';
      adminError.textContent = '';
    }
  });

  function attemptLogin() {
    if (adminPassword.value === ADMIN_PASSWORD) {
      enterAdminMode();
    } else {
      adminError.textContent = 'Incorrect password.';
      adminPassword.value = '';
      adminPassword.focus();
    }
  }

  adminSubmit.addEventListener('click', attemptLogin);
  adminPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });

  adminSave.addEventListener('click', () => {
    saveContent();
    const btn = adminSave;
    const original = btn.textContent;
    btn.textContent = 'Saved!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  });

  adminExit.addEventListener('click', exitAdminMode);

  loadSavedContent();

});
