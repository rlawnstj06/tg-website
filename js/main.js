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
      count += commercialSection.querySelectorAll('.pf-card').length;
    }
    if (residentialSection && !residentialSection.classList.contains('hidden')) {
      count += residentialSection.querySelectorAll('.pf-card').length;
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


  // ══════════════════════════════════════════
  //  PROJECT DATA SYSTEM
  // ══════════════════════════════════════════

  const PROJECTS_KEY = 'tggc_projects';

  const DEFAULT_PROJECTS = {
    'pf-c1': { title: 'Office Renovation', category: 'commercial', tag: 'Commercial', desc: 'Complete interior build-out for a modern office space in downtown Vancouver. Full demolition, framing, electrical, HVAC, and premium finishes.', detail: 'This comprehensive office renovation project transformed a dated commercial space into a modern, open-concept workplace. The project included complete demolition of existing interiors, new framing and drywall, upgraded electrical systems with smart lighting controls, HVAC modernization, and premium finishes throughout.\n\nThe design features a mix of open workstations, private offices, and collaborative meeting spaces, all connected by a central lounge area. Materials include polished concrete floors, custom millwork, glass partitions, and acoustic ceiling panels.', mainImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'], location: 'Downtown Vancouver, BC', size: '3,200 sq ft', duration: '4 months', year: '2025' },
    'pf-c2': { title: 'Retail Storefront', category: 'commercial', tag: 'Commercial', desc: 'Custom retail space design and construction with branded interior finishes and display systems.', detail: 'A complete retail build-out for a high-end fashion brand, featuring custom millwork display systems, specialty lighting design, and a carefully curated customer journey from entrance to checkout.\n\nThe space incorporates warm wood tones, brushed brass fixtures, and a minimalist aesthetic that lets the merchandise take center stage. Premium materials and expert craftsmanship create an inviting shopping experience.', mainImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'], location: 'Gastown, Vancouver, BC', size: '1,800 sq ft', duration: '3 months', year: '2025' },
    'pf-c3': { title: 'Restaurant Build-Out', category: 'commercial', tag: 'Commercial', desc: 'Full-scale restaurant construction including commercial kitchen, dining area, and bar.', detail: 'A full-scale restaurant build-out that included commercial kitchen installation, dining room design, bar construction, and outdoor patio development. Every element was carefully planned to optimize workflow and create an exceptional dining atmosphere.\n\nThe project featured custom concrete countertops, reclaimed wood accent walls, industrial-style lighting, and a state-of-the-art ventilation system. The result is a warm, inviting space that seats 85 guests.', mainImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80'], location: 'Kitsilano, Vancouver, BC', size: '2,800 sq ft', duration: '5 months', year: '2024' },
    'pf-c4': { title: 'Warehouse Conversion', category: 'commercial', tag: 'Commercial', desc: 'Industrial warehouse transformed into a mixed-use commercial space with modern amenities.', detail: 'This ambitious project converted a 1960s industrial warehouse into a vibrant mixed-use commercial space. The renovation preserved the building\'s original character — exposed brick walls, timber beams, and concrete floors — while introducing modern mechanical, electrical, and plumbing systems.\n\nThe space now houses retail on the ground floor with creative office suites above, connected by a restored steel staircase and a new glass-enclosed elevator.', mainImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'], location: 'East Vancouver, BC', size: '8,500 sq ft', duration: '8 months', year: '2024' },
    'pf-c5': { title: 'Medical Clinic', category: 'commercial', tag: 'Commercial', desc: 'Healthcare facility build-out with specialized plumbing, electrical, and accessibility compliance throughout.', detail: 'A specialized healthcare facility build-out designed to meet stringent medical industry standards. The project included specialized plumbing for medical gas systems, enhanced electrical for diagnostic equipment, and full accessibility compliance throughout.\n\nThe clinic features 12 examination rooms, a minor procedure suite, reception and waiting areas, and staff facilities. Antimicrobial surfaces, medical-grade ventilation, and sound-dampening construction ensure patient comfort and safety.', mainImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1551190822-a9ce113ac100?auto=format&fit=crop&w=800&q=80'], location: 'West Vancouver, BC', size: '4,100 sq ft', duration: '6 months', year: '2025' },
    'pf-c6': { title: 'Co-Working Space', category: 'commercial', tag: 'Commercial', desc: 'Open-concept co-working environment with private offices, meeting rooms, and lounge areas.', detail: 'A modern co-working space designed to foster collaboration and productivity. The open floor plan includes hot desks, dedicated desks, private offices, phone booths, and bookable meeting rooms of various sizes.\n\nThe design emphasizes natural light, biophilic elements, and flexible furniture systems. A central kitchen and lounge area serves as the social hub, with high-end coffee equipment and comfortable seating.', mainImage: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'], location: 'Mount Pleasant, Vancouver, BC', size: '5,600 sq ft', duration: '4 months', year: '2025' },
    'pf-r1': { title: 'Modern Home Build', category: 'residential', tag: 'Residential', desc: 'Custom new home construction with contemporary design, premium finishes, and smart home integration.', detail: 'A stunning custom new home build featuring clean contemporary lines, floor-to-ceiling windows, and an open-concept living space that seamlessly connects indoor and outdoor areas.\n\nThe home includes smart home automation throughout, radiant floor heating, a chef\'s kitchen with premium appliances, and a spa-inspired master suite. Exterior features include a flat roof design, cedar and stone cladding, and professionally landscaped grounds.', mainImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80'], location: 'North Vancouver, BC', size: '3,800 sq ft', duration: '10 months', year: '2025' },
    'pf-r2': { title: 'Kitchen Renovation', category: 'residential', tag: 'Residential', desc: 'Complete kitchen remodel with custom cabinetry, quartz countertops, designer lighting, and modern appliances.', detail: 'A complete kitchen transformation that opened up the space by removing a load-bearing wall (with proper structural support) to create an expansive open-concept kitchen and dining area.\n\nFeatures include custom shaker-style cabinetry in a two-tone finish, waterfall quartz countertops, a large island with seating, under-cabinet LED lighting, and a professional-grade appliance package. The herringbone tile backsplash and brass hardware add warmth and character.', mainImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'], location: 'Burnaby, BC', size: '450 sq ft', duration: '6 weeks', year: '2025' },
    'pf-r3': { title: 'Bathroom Remodel', category: 'residential', tag: 'Residential', desc: 'Luxury bathroom renovation featuring custom tile, frameless glass, and spa-like finishes.', detail: 'A luxury master bathroom renovation that transformed a dated space into a spa-like retreat. The design centers around a freestanding soaker tub, a spacious walk-in shower with frameless glass, and a floating double vanity.\n\nMaterials include large-format porcelain tile, heated floors, a rain showerhead with body jets, and custom LED mirror lighting. Every detail was carefully considered to balance aesthetics with functionality.', mainImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80'], location: 'Vancouver, BC', size: '120 sq ft', duration: '4 weeks', year: '2024' },
    'pf-r4': { title: 'Basement Suite', category: 'residential', tag: 'Residential', desc: 'Full basement development with separate entrance, kitchen, bathroom, and living space.', detail: 'A full basement development that created a self-contained legal suite with its own separate entrance. The project included excavation to increase ceiling height, new foundation waterproofing, and a complete build-out with bedroom, bathroom, kitchen, and living area.\n\nThe suite features engineered hardwood floors, in-suite laundry, energy-efficient windows, and a modern kitchen with quartz countertops and stainless steel appliances.', mainImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80'], location: 'East Vancouver, BC', size: '750 sq ft', duration: '3 months', year: '2024' },
    'pf-r5': { title: 'Deck & Outdoor Living', category: 'residential', tag: 'Residential', desc: 'Custom cedar deck with integrated lighting, pergola, and outdoor entertaining space.', detail: 'A custom outdoor living space featuring a multi-level western red cedar deck with integrated LED step lighting, a pergola with retractable shade canopy, and a built-in BBQ station with granite countertops.\n\nThe deck connects seamlessly to the interior living space through new sliding glass doors. Landscaping includes native plantings, a stone pathway, and a fire pit gathering area. The space is designed for year-round enjoyment.', mainImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'], location: 'West Vancouver, BC', size: '600 sq ft', duration: '5 weeks', year: '2025' },
    'pf-r6': { title: 'Home Addition', category: 'residential', tag: 'Residential', desc: 'Second-storey addition seamlessly integrated with existing structure and design.', detail: 'A second-storey addition that added 1,200 sq ft of living space to an existing single-storey home. The addition includes a master suite with walk-in closet and ensuite, two additional bedrooms, and a family bathroom.\n\nStructural engineering ensured the existing foundation and walls could support the new level. The exterior was fully refinished to create a cohesive design, with new siding, windows, and roofing throughout.', mainImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'], location: 'Coquitlam, BC', size: '1,200 sq ft', duration: '5 months', year: '2024' },
    'pf-r7': { title: 'Whole Home Renovation', category: 'residential', tag: 'Residential', desc: 'Full interior gut renovation including layout changes, new mechanical systems, and premium finishes.', detail: 'A complete interior gut renovation of a 1970s split-level home. Every surface, system, and fixture was replaced to bring the home into the modern era while respecting its mid-century character.\n\nThe project included new plumbing and electrical throughout, layout modifications to open up the main living area, a complete kitchen and bathroom overhaul, new hardwood flooring, and modern lighting design. The result is a bright, functional home with clean lines and warm materials.', mainImage: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'], location: 'New Westminster, BC', size: '2,100 sq ft', duration: '6 months', year: '2025' },
    'pf-r8': { title: 'Exterior Renovation', category: 'residential', tag: 'Residential', desc: 'Complete exterior upgrade including new siding, roofing, windows, and landscaping.', detail: 'A dramatic exterior transformation that gave this 1990s home a fresh, modern look. The project included removal of old vinyl siding, installation of fiber cement board-and-batten siding, new architectural shingle roofing, and energy-efficient triple-pane windows.\n\nAdditional work included new soffit and fascia, upgraded exterior lighting, a redesigned front entry with a covered porch, and comprehensive landscaping with a new driveway, walkways, and garden beds.', mainImage: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80', gallery: ['https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'], location: 'Surrey, BC', size: '2,400 sq ft exterior', duration: '2 months', year: '2024' }
  };

  function getProjects() {
    let projects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
    try {
      const saved = localStorage.getItem(PROJECTS_KEY);
      if (saved) {
        const custom = JSON.parse(saved);
        Object.assign(projects, custom);
      }
    } catch (e) {}
    return projects;
  }

  function getCustomProjects() {
    try {
      const saved = localStorage.getItem(PROJECTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  }

  function saveCustomProject(id, data) {
    const custom = getCustomProjects();
    custom[id] = data;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(custom));
  }

  function deleteCustomProject(id) {
    const custom = getCustomProjects();
    delete custom[id];
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(custom));
  }


  // ══════════════════════════════════════════
  //  PROJECT DETAIL PAGE
  // ══════════════════════════════════════════

  const projectDetail = document.getElementById('projectDetail');

  if (projectDetail) {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const projects = getProjects();
    const project = projects[projectId];

    if (project) {
      // Update page title
      document.title = project.title + ' — TG General Contracting Ltd.';

      // Fill in content
      document.getElementById('pjHeroImg').src = project.mainImage;
      document.getElementById('pjHeroImg').alt = project.title;
      document.getElementById('pjTag').textContent = project.tag;
      document.getElementById('pjTitle').textContent = project.title;

      // Description with paragraphs
      const descEl = document.getElementById('pjDesc');
      const paragraphs = (project.detail || project.desc).split('\n\n');
      descEl.innerHTML = paragraphs.map(p => '<p>' + p.trim() + '</p>').join('');

      // Specs
      const specs = [
        { id: 'pjLocation', elId: 'specLocation', val: project.location },
        { id: 'pjSize', elId: 'specSize', val: project.size },
        { id: 'pjDuration', elId: 'specDuration', val: project.duration },
        { id: 'pjYear', elId: 'specYear', val: project.year }
      ];

      specs.forEach(s => {
        const valEl = document.getElementById(s.id);
        const wrapEl = document.getElementById(s.elId);
        if (s.val) {
          valEl.textContent = s.val;
        } else if (wrapEl) {
          wrapEl.style.display = 'none';
        }
      });

      // Gallery
      const galleryEl = document.getElementById('pjGallery');
      const images = project.gallery || [project.mainImage];
      images.forEach((url, i) => {
        const item = document.createElement('div');
        item.className = 'pj-gallery__item' + (i === 0 ? ' pj-gallery__item--large' : '');
        item.innerHTML = '<img src="' + url + '" alt="' + project.title + ' - Image ' + (i + 1) + '" loading="lazy">';
        galleryEl.appendChild(item);
      });

    } else {
      // Project not found
      projectDetail.innerHTML = '<div class="container" style="padding:200px 40px 100px;text-align:center;"><h1 style="font-family:var(--font-heading);font-size:2rem;color:var(--color-white);margin-bottom:16px;">Project Not Found</h1><p style="color:var(--color-text-muted);margin-bottom:32px;">The project you\'re looking for doesn\'t exist.</p><a href="portfolio.html" class="hero__cta">Back to Portfolio</a></div>';
    }
  }


  // ══════════════════════════════════════════
  //  PORTFOLIO PAGE — RENDER CUSTOM PROJECTS
  // ══════════════════════════════════════════

  const commercialGrid = document.getElementById('commercialGrid');
  const residentialGrid = document.getElementById('residentialGrid');

  if (commercialGrid && residentialGrid) {
    const custom = getCustomProjects();
    Object.keys(custom).forEach(id => {
      // Skip default projects (they're already in HTML)
      if (DEFAULT_PROJECTS[id]) return;
      const p = custom[id];
      const card = createProjectCard(id, p);
      if (p.category === 'commercial') {
        commercialGrid.appendChild(card);
      } else {
        residentialGrid.appendChild(card);
      }
    });
    updateProjectCount();
  }

  function createProjectCard(id, p) {
    const a = document.createElement('a');
    a.href = 'project.html?id=' + id;
    a.className = 'pf-card';
    a.dataset.category = p.category;
    a.dataset.projectId = id;
    a.innerHTML =
      '<div class="pf-card__image"><img src="' + p.mainImage + '" alt="' + p.title + '" loading="lazy"></div>' +
      '<div class="pf-card__overlay"><span class="pf-card__tag">' + p.tag + '</span>' +
      '<h3 class="pf-card__title">' + p.title + '</h3>' +
      '<p class="pf-card__desc">' + p.desc + '</p></div>';

    // Reveal animation
    a.classList.add('reveal');
    setTimeout(() => revealObserver.observe(a), 50);

    return a;
  }


  // ══════════════════════════════════════════
  //  ADD PROJECT (Admin)
  // ══════════════════════════════════════════

  const addProjectModal = document.getElementById('addProjectModal');
  const addProjectClose = document.getElementById('addProjectClose');
  const addProjectBtn = document.getElementById('adminAddProject');
  const apSubmit = document.getElementById('apSubmit');
  const apCancel = document.getElementById('apCancel');

  function openAddProject() {
    if (addProjectModal) addProjectModal.classList.add('active');
  }

  function closeAddProject() {
    if (addProjectModal) {
      addProjectModal.classList.remove('active');
      // Clear form
      ['apTitle','apDesc','apDetail','apMainImg','apGallery','apLocation','apSize','apDuration','apYear'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const cat = document.getElementById('apCategory');
      if (cat) cat.value = 'commercial';
    }
  }

  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', openAddProject);
  }
  if (addProjectClose) {
    addProjectClose.addEventListener('click', closeAddProject);
  }
  if (apCancel) {
    apCancel.addEventListener('click', closeAddProject);
  }
  if (addProjectModal) {
    addProjectModal.addEventListener('click', (e) => {
      if (e.target === addProjectModal) closeAddProject();
    });
  }

  if (apSubmit) {
    apSubmit.addEventListener('click', () => {
      const title = document.getElementById('apTitle').value.trim();
      const category = document.getElementById('apCategory').value;
      const desc = document.getElementById('apDesc').value.trim();
      const detail = document.getElementById('apDetail').value.trim();
      const mainImage = document.getElementById('apMainImg').value.trim();
      const galleryText = document.getElementById('apGallery').value.trim();
      const location = document.getElementById('apLocation').value.trim();
      const size = document.getElementById('apSize').value.trim();
      const duration = document.getElementById('apDuration').value.trim();
      const year = document.getElementById('apYear').value.trim();

      if (!title || !desc || !mainImage) {
        alert('Please fill in the required fields: Title, Description, and Main Image URL.');
        return;
      }

      const gallery = galleryText ? galleryText.split('\n').map(s => s.trim()).filter(s => s) : [mainImage];
      if (!gallery.includes(mainImage)) gallery.unshift(mainImage);

      const id = 'pf-custom-' + Date.now();
      const projectData = {
        title, category, tag: category === 'commercial' ? 'Commercial' : 'Residential',
        desc, detail: detail || desc, mainImage, gallery,
        location, size, duration, year
      };

      saveCustomProject(id, projectData);

      // Add card to grid
      const grid = category === 'commercial' ? commercialGrid : residentialGrid;
      if (grid) {
        const card = createProjectCard(id, projectData);
        grid.appendChild(card);
        updateProjectCount();
      }

      closeAddProject();

      // Flash save feedback
      const btn = document.getElementById('adminSave');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Project Added!';
        setTimeout(() => { btn.textContent = original; }, 2000);
      }
    });
  }


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
    } catch (e) {}
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
    } catch (e) {}
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

  function openImageEditor(img) {
    currentEditingImg = img;
    imgEditUrl.value = img.src;
    imgEditPopup.classList.add('active');
    setTimeout(() => { imgEditUrl.select(); imgEditUrl.focus(); }, 100);
  }

  function closeImageEditor() {
    if (imgEditPopup) imgEditPopup.classList.remove('active');
    if (imgEditUrl) imgEditUrl.value = '';
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
  if (imgEditCancel) imgEditCancel.addEventListener('click', closeImageEditor);
  if (imgEditPopup) {
    imgEditPopup.addEventListener('click', (e) => { if (e.target === imgEditPopup) closeImageEditor(); });
  }
  if (imgEditUrl) {
    imgEditUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentEditingImg && imgEditUrl.value.trim()) {
        currentEditingImg.src = imgEditUrl.value.trim();
        closeImageEditor();
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

    // Show "Add Project" button on portfolio page
    if (addProjectBtn) addProjectBtn.style.display = '';

    // Add edit overlay to images
    editableImages.forEach(img => {
      if (!img.parentElement.classList.contains('img-edit-wrapper')) {
        img.parentElement.style.position = 'relative';
      }
      const overlay = document.createElement('div');
      overlay.className = 'img-edit-overlay';
      overlay.innerHTML = '<div class="img-edit-overlay__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>';
      img.parentElement.appendChild(overlay);
      img.parentElement.classList.add('img-edit-wrapper');

      const clickHandler = (e) => { e.preventDefault(); e.stopPropagation(); openImageEditor(img); };
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
    closeAddProject();

    if (addProjectBtn) addProjectBtn.style.display = 'none';

    editableElements.forEach(el => {
      el.contentEditable = 'false';
      el.classList.remove('editable');
    });

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

  if (adminTrigger) {
    adminTrigger.addEventListener('click', () => {
      adminModal.classList.add('active');
      setTimeout(() => adminPassword.focus(), 100);
    });
  }

  if (adminModalClose) {
    adminModalClose.addEventListener('click', () => {
      adminModal.classList.remove('active');
      adminPassword.value = '';
      adminError.textContent = '';
    });
  }

  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.classList.remove('active');
        adminPassword.value = '';
        adminError.textContent = '';
      }
    });
  }

  function attemptLogin() {
    if (adminPassword.value === ADMIN_PASSWORD) {
      enterAdminMode();
    } else {
      adminError.textContent = 'Incorrect password.';
      adminPassword.value = '';
      adminPassword.focus();
    }
  }

  if (adminSubmit) adminSubmit.addEventListener('click', attemptLogin);
  if (adminPassword) {
    adminPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });
  }

  if (adminSave) {
    adminSave.addEventListener('click', () => {
      saveContent();
      const btn = adminSave;
      const original = btn.textContent;
      btn.textContent = 'Saved!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  }

  if (adminExit) adminExit.addEventListener('click', exitAdminMode);

  loadSavedContent();
  loadSavedImages();

});
