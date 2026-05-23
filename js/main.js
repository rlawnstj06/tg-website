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
  const IMG_STORAGE_KEY = 'tggc_cms_images';

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
  const editableImages = document.querySelectorAll('[data-editable-img]');

  // Image edit popup elements
  const imgEditPopup = document.getElementById('imgEditPopup');
  const imgEditUrl = document.getElementById('imgEditUrl');
  const imgEditApply = document.getElementById('imgEditApply');
  const imgEditCancel = document.getElementById('imgEditCancel');
  let currentEditingImg = null;

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

  function loadSavedImages() {
    try {
      const saved = localStorage.getItem(IMG_STORAGE_KEY);
      if (!saved) return;
      const images = JSON.parse(saved);
      editableImages.forEach(img => {
        const key = img.dataset.editableImg;
        if (images[key] !== undefined) {
          img.src = images[key];
        }
      });
    } catch (e) {
      // silent fail
    }
  }

  function saveContent() {
    // Save text
    let content = {};
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) content = JSON.parse(existing);
    } catch (e) {}
    editableElements.forEach(el => {
      content[el.dataset.editable] = el.innerHTML;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));

    // Save images
    let images = {};
    try {
      const existingImgs = localStorage.getItem(IMG_STORAGE_KEY);
      if (existingImgs) images = JSON.parse(existingImgs);
    } catch (e) {}
    editableImages.forEach(img => {
      images[img.dataset.editableImg] = img.src;
    });
    localStorage.setItem(IMG_STORAGE_KEY, JSON.stringify(images));
  }

  // Image edit click handler
  function openImageEditor(img) {
    currentEditingImg = img;
    imgEditUrl.value = img.src;
    imgEditPopup.classList.add('active');
    setTimeout(() => {
      imgEditUrl.select();
      imgEditUrl.focus();
    }, 100);
  }

  function closeImageEditor() {
    imgEditPopup.classList.remove('active');
    imgEditUrl.value = '';
    currentEditingImg = null;
  }

  if (imgEditApply) {
    imgEditApply.addEventListener('click', () => {
      if (currentEditingImg && imgEditUrl.value.trim()) {
        currentEditingImg.src = imgEditUrl.value.trim();
        closeImageEditor();
      }
    });
  }

  if (imgEditCancel) {
    imgEditCancel.addEventListener('click', closeImageEditor);
  }

  if (imgEditPopup) {
    imgEditPopup.addEventListener('click', (e) => {
      if (e.target === imgEditPopup) closeImageEditor();
    });
  }

  if (imgEditUrl) {
    imgEditUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (currentEditingImg && imgEditUrl.value.trim()) {
          currentEditingImg.src = imgEditUrl.value.trim();
          closeImageEditor();
        }
      }
      if (e.key === 'Escape') closeImageEditor();
    });
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

    // Add edit overlay to images
    editableImages.forEach(img => {
      // Wrap image if not already wrapped
      if (!img.parentElement.classList.contains('img-edit-wrapper')) {
        const wrapper = img.parentElement;
        wrapper.style.position = 'relative';
      }

      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'img-edit-overlay';
      overlay.innerHTML = '<div class="img-edit-overlay__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>';
      img.parentElement.appendChild(overlay);
      img.parentElement.classList.add('img-edit-wrapper');

      // Click handler
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openImageEditor(img);
      };
      img._adminClickHandler = clickHandler;
      overlay._adminClickHandler = clickHandler;
      img.addEventListener('click', clickHandler);
      overlay.addEventListener('click', clickHandler);
    });
  }

  function exitAdminMode() {
    document.body.classList.remove('admin-mode');
    adminToolbar.classList.remove('active');
    closeImageEditor();

    editableElements.forEach(el => {
      el.contentEditable = 'false';
      el.classList.remove('editable');
    });

    // Remove image overlays
    editableImages.forEach(img => {
      const overlay = img.parentElement.querySelector('.img-edit-overlay');
      if (overlay) {
        overlay.removeEventListener('click', overlay._adminClickHandler);
        overlay.remove();
      }
      if (img._adminClickHandler) {
        img.removeEventListener('click', img._adminClickHandler);
        delete img._adminClickHandler;
      }
      img.parentElement.classList.remove('img-edit-wrapper');
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
  loadSavedImages();

});
