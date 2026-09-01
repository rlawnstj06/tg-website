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
    { key: 'hero-title',   label: '큰 제목',   type: 'textarea', hint: '줄바꿈 가능' },
    { key: 'hero-tagline', label: '슬로건',    type: 'text' },
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
  { group: '메인 · 연락 유도', fields: [
    { key: 'contact-title',    label: '제목',   type: 'text' },
    { key: 'contact-text',     label: '문구',   type: 'textarea' },
    { key: 'contact-location', label: '위치',   type: 'text' },
  ]},
  { group: '연락처 페이지', fields: [
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
    { key: 'pf-hero-title', label: '제목',    type: 'text' },
    { key: 'pf-hero-desc',  label: '설명',    type: 'textarea' },
    { key: 'pf-cta-title',  label: 'CTA 제목', type: 'text' },
    { key: 'pf-cta-text',   label: 'CTA 문구', type: 'textarea' },
  ]},
];
