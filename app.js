'use strict';
const SERVER_IP = 'Gran.minerent.io';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const toast = document.querySelector('.toast');
let toastTimer;
function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(SERVER_IP);
      notify('IP скопирован. До встречи по ту сторону Грани.');
    } catch {
      const text = button.querySelector('.ip-text');
      const range = document.createRange();
      range.selectNodeContents(text);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      text.classList.add('manual-ip');
      notify('Адрес выделен: скопируй его вручную — ' + SERVER_IP);
    }
  });
});
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
function closeMenu(restoreFocus = false) {
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Открыть меню');
  if (restoreFocus) menuButton.focus();
}
function animateIn(element) {
  if (reducedMotion.matches || !element.animate) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate([{opacity:.2,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.22,.7,.2,1)'});
}
menuButton.addEventListener('click', () => {
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open ? 'Закрыть меню' : 'Открыть меню');
  if (open) animateIn(mobileMenu);
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click',() => closeMenu()));
document.addEventListener('click',event => { if (!mobileMenu.hidden && !event.target.closest('.header')) closeMenu(); });
document.addEventListener('keydown',event => { if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true); });
window.matchMedia('(min-width: 701px)').addEventListener('change',event => { if (event.matches) closeMenu(); });
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle',() => { if (detail.open) animateIn(detail.querySelector('p')); }));
const photos = [
  {src:'assets/world-hall.webp',alt:'Каменный зал с витринами и свечами',caption:'Внутри мира · Из Discord сообщества'},
  {src:'assets/world-depth.webp',alt:'Персонаж над глубокой освещённой шахтой',caption:'Один шаг до падения · Из Discord сообщества'}
];
const viewer = document.querySelector('#photo-viewer');
let activePhoto = 0;
let photoTrigger;
let closeTimer;
function showPhoto(index) {
  activePhoto = (index + photos.length) % photos.length;
  const photo = photos[activePhoto];
  document.querySelector('#viewer-image').src = photo.src;
  document.querySelector('#viewer-image').alt = photo.alt;
  document.querySelector('#viewer-caption').textContent = photo.caption + ' · ' + (activePhoto + 1) + ' / ' + photos.length;
  if (viewer.open) animateIn(viewer.querySelector('figure'));
}
function closeViewer() {
  if (!viewer.open || viewer.classList.contains('closing')) return;
  if (reducedMotion.matches) { viewer.close(); return; }
  viewer.classList.add('closing');
  closeTimer = setTimeout(() => viewer.close(),180);
}
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click',() => {
  photoTrigger = button;
  clearTimeout(closeTimer);
  viewer.classList.remove('closing');
  showPhoto(Number(button.dataset.photo));
  viewer.showModal();
}));
document.querySelector('.viewer-close').addEventListener('click',closeViewer);
document.querySelector('.viewer-prev').addEventListener('click',() => showPhoto(activePhoto - 1));
document.querySelector('.viewer-next').addEventListener('click',() => showPhoto(activePhoto + 1));
viewer.addEventListener('click',event => { if (event.target === viewer) closeViewer(); });
viewer.addEventListener('cancel',event => { event.preventDefault(); closeViewer(); });
viewer.addEventListener('keydown',event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(activePhoto - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(activePhoto + 1); }
});
viewer.addEventListener('close',() => {
  clearTimeout(closeTimer);
  viewer.classList.remove('closing');
  if (photoTrigger) photoTrigger.focus({preventScroll:true});
});
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const targets = document.querySelectorAll('.section-heading, .world-intro, .world-features article, .lore-art, .lore-copy, .gallery, .map-link, .rules-intro, .rule-list, .join-steps article, .faq-list, .community-inner');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }),{threshold:.08});
  targets.forEach(target => { target.classList.add('reveal'); observer.observe(target); });
  document.documentElement.classList.add('motion-ready');
  reducedMotion.addEventListener('change',event => { if (event.matches) { observer.disconnect(); document.documentElement.classList.remove('motion-ready'); } });
}
