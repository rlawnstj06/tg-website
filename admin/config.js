/* ============================================================
   TG General Contracting — Admin config
   Public values only (anon/publishable key is browser-safe).
   ============================================================ */
window.TG_CONFIG = {
  SUPABASE_URL: 'https://riyatnyffsjyxmpsnzmr.supabase.co',
  SUPABASE_KEY: 'sb_publishable_BiamQN3rxMdnUT-Y58hFIA_p6jqHVZo',
  FUNCTIONS_URL: 'https://riyatnyffsjyxmpsnzmr.supabase.co/functions/v1',
  BUCKET_MEDIA: 'site-media',       // private — job-site records
  BUCKET_IMAGES: 'website-images',  // public — website images
};

/* Curated, human-labelled website text fields (map to data-editable keys). */
window.TG_CONTENT_FIELDS = [
  { group: '메인 · 상단 (Hero)', fields: [
    { key: 'hero-title',     label: '큰 제목',   type: 'textarea', hint: '줄바꿈 가능' },
    { key: 'hero-tagline',   label: '슬로건',    type: 'text' },
    { key: 'projects-title', label: '"Our Projects" 배너 제목', type: 'text' },
  ]},
  { group: '메인 · 회사 소개', fields: [
    { key: 'about-title',  label: '소제목',    type: 'text' },
    { key: 'about-lead',   label: '요약 문장', type: 'textarea' },
    { key: 'about-text-1', label: '본문 1',    type: 'textarea' },
    { key: 'about-text-2', label: '본문 2',    type: 'textarea' },
  ]},
  { group: '메인 · 팀', fields: [
    { key: 'team-1-name', label: '팀원 1 이름', type: 'text' },
    { key: 'team-1-role', label: '팀원 1 직책', type: 'text' },
    { key: 'team-2-name', label: '팀원 2 이름', type: 'text' },
    { key: 'team-2-role', label: '팀원 2 직책', type: 'text' },
    { key: 'team-3-name', label: '팀원 3 이름', type: 'text' },
    { key: 'team-3-role', label: '팀원 3 직책', type: 'text' },
    { key: 'team-4-name', label: '팀원 4 이름', type: 'text' },
    { key: 'team-4-role', label: '팀원 4 직책', type: 'text' },
  ]},
  { group: '메인 · 서비스 (What We Do)', fields: [
    { key: 'services-title', label: '섹션 제목', type: 'text' },
    { key: 'services-intro', label: '섹션 설명', type: 'textarea' },
    { key: 'svc-1',  label: '서비스 1 이름 (Inspection)',   type: 'text' },     { key: 'svc-1-d',  label: '서비스 1 설명',  type: 'textarea' },
    { key: 'svc-2',  label: '서비스 2 이름 (Design)',       type: 'text' },     { key: 'svc-2-d',  label: '서비스 2 설명',  type: 'textarea' },
    { key: 'svc-3',  label: '서비스 3 이름 (Permits)',      type: 'text' },     { key: 'svc-3-d',  label: '서비스 3 설명',  type: 'textarea' },
    { key: 'svc-4',  label: '서비스 4 이름 (Framing)',      type: 'text' },     { key: 'svc-4-d',  label: '서비스 4 설명',  type: 'textarea' },
    { key: 'svc-5',  label: '서비스 5 이름 (Plumbing)',     type: 'text' },     { key: 'svc-5-d',  label: '서비스 5 설명',  type: 'textarea' },
    { key: 'svc-6',  label: '서비스 6 이름 (Electrical)',   type: 'text' },     { key: 'svc-6-d',  label: '서비스 6 설명',  type: 'textarea' },
    { key: 'svc-7',  label: '서비스 7 이름 (Flooring)',     type: 'text' },     { key: 'svc-7-d',  label: '서비스 7 설명',  type: 'textarea' },
    { key: 'svc-8',  label: '서비스 8 이름 (Tile)',         type: 'text' },     { key: 'svc-8-d',  label: '서비스 8 설명',  type: 'textarea' },
    { key: 'svc-9',  label: '서비스 9 이름 (Drywall)',      type: 'text' },     { key: 'svc-9-d',  label: '서비스 9 설명',  type: 'textarea' },
    { key: 'svc-10', label: '서비스 10 이름 (Millwork)',    type: 'text' },     { key: 'svc-10-d', label: '서비스 10 설명', type: 'textarea' },
    { key: 'svc-11', label: '서비스 11 이름 (Cabinetry)',   type: 'text' },     { key: 'svc-11-d', label: '서비스 11 설명', type: 'textarea' },
    { key: 'svc-12', label: '서비스 12 이름 (Painting)',    type: 'text' },     { key: 'svc-12-d', label: '서비스 12 설명', type: 'textarea' },
    { key: 'svc-13', label: '서비스 13 이름 (Concrete)',    type: 'text' },     { key: 'svc-13-d', label: '서비스 13 설명', type: 'textarea' },
    { key: 'svc-14', label: '서비스 14 이름 (Deck)',        type: 'text' },     { key: 'svc-14-d', label: '서비스 14 설명', type: 'textarea' },
    { key: 'svc-15', label: '서비스 15 이름 (Exterior)',    type: 'text' },     { key: 'svc-15-d', label: '서비스 15 설명', type: 'textarea' },
    { key: 'svc-16', label: '서비스 16 이름 (Glass)',       type: 'text' },     { key: 'svc-16-d', label: '서비스 16 설명', type: 'textarea' },
    { key: 'svc-17', label: '서비스 17 이름 (Cleanup)',     type: 'text' },     { key: 'svc-17-d', label: '서비스 17 설명', type: 'textarea' },
    { key: 'svc-18', label: '서비스 18 이름 (Maintenance)', type: 'text' },     { key: 'svc-18-d', label: '서비스 18 설명', type: 'textarea' },
  ]},
  { group: '메인 · 연락 유도', fields: [
    { key: 'contact-title',    label: '제목',   type: 'text' },
    { key: 'contact-text',     label: '문구',   type: 'textarea' },
    { key: 'contact-location', label: '위치',   type: 'text' },
  ]},
  { group: '연락처 페이지', fields: [
    { key: 'ct-label',      label: '작은 라벨', type: 'text' },
    { key: 'ct-hero-title', label: '제목',     type: 'text' },
    { key: 'ct-hero-desc',  label: '설명',     type: 'textarea' },
    { key: 'ct-address',    label: '주소',     type: 'text' },
    { key: 'ct-hours-1',    label: '영업시간 1', type: 'text' },
    { key: 'ct-hours-2',    label: '영업시간 2', type: 'text' },
    { key: 'ct-hours-3',    label: '영업시간 3', type: 'text' },
    { key: 'ct-form-title', label: '폼 제목',  type: 'text' },
    { key: 'ct-form-desc',  label: '폼 설명',  type: 'textarea' },
  ]},
  { group: '포트폴리오 페이지', fields: [
    { key: 'pf-label',      label: '작은 라벨', type: 'text' },
    { key: 'pf-hero-title', label: '제목',    type: 'text' },
    { key: 'pf-hero-desc',  label: '설명',    type: 'textarea' },
    { key: 'pf-cta-title',  label: 'CTA 제목', type: 'text' },
    { key: 'pf-cta-text',   label: 'CTA 문구', type: 'textarea' },
  ]},
];

/* Editable site images (map to data-editable-img keys). `default` shows the
   built-in image as the thumbnail until the owner replaces it. */
window.TG_IMAGE_FIELDS = [
  { group: '메인 페이지 사진', fields: [
    { key: 'contact-img', label: '연락처 섹션 사진 ("Ready to Build" 옆)',
      default: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80' },
    { key: 'projects-banner-img', label: '"Our Projects" 배너 배경',
      default: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80' },
  ]},
  { group: '팀 / 사장님 · 직원 사진', fields: [
    { key: 'team-1-photo', label: '팀원 1 사진 (Ben Lee · Founder)', round: true },
    { key: 'team-2-photo', label: '팀원 2 사진 (Stanley Park · Project Manager)', round: true },
    { key: 'team-3-photo', label: '팀원 3 사진 (Reese Platt · General Contractor)', round: true },
    { key: 'team-4-photo', label: '팀원 4 사진 (Jamie Kokot · Construction Engineer)', round: true },
  ]},
];
