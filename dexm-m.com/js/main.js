// ---------- header solid on scroll ----------
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ---------- reveal on scroll ----------
const rvEls = document.querySelectorAll('.rv');
if (rvEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  rvEls.forEach(el => io.observe(el));
}

// ---------- contact modal ----------
(function () {
  const overlay = document.getElementById('contactModal');
  if (!overlay) return;

  const openTriggers = document.querySelectorAll('[data-open-contact]');
  const closeTriggers = overlay.querySelectorAll('[data-close-contact]');
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  function openModal(e) {
    if (e) e.preventDefault();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const firstField = form.querySelector('input');
    if (firstField) setTimeout(() => firstField.focus(), 100);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  openTriggers.forEach(btn => btn.addEventListener('click', openModal));
  closeTriggers.forEach(btn => btn.addEventListener('click', closeModal));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const tel = form.tel.value.trim();
      const message = form.message ? form.message.value.trim() : '';

      if (!name || !email || !tel) {
        status.textContent = 'Please fill in name, email and phone.';
        status.className = 'form-status error';
        return;
      }

      const recipient = 'info@dexm-m.com';
      const subject = 'Portfolio situation inquiry — DeXM Management website';
      const bodyLines = [
        'New inquiry from the DeXM Management website:',
        '',
        'Name: ' + name,
        'Email: ' + email,
        'Tel: ' + tel,
        '',
        'Message:',
        message || '(none provided)'
      ];
      const body = bodyLines.join('\n');
      const mailto = 'mailto:' + recipient +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      status.textContent = 'Opening your email client to send this to ' + recipient + '…';
      status.className = 'form-status success';

      window.location.href = mailto;
    });
  }
})();
