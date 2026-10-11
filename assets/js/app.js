'use strict';

const themeButtons = document.querySelectorAll('[data-set-theme]');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)));
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#241f19' : '#f7f3e8';
  try { localStorage.setItem('ananas-theme', theme); } catch (_) { /* Le site fonctionne aussi sans stockage local. */ }
}
setTheme(document.documentElement.dataset.theme);
themeButtons.forEach(button => button.addEventListener('click', () => setTheme(button.dataset.setTheme)));

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
}
menuButton.addEventListener('click', () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Fermer le menu' : 'Ouvrir le menu');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 1050) closeMenu(); });

const subjects = {
  methodologie: { title: 'Méthodologie', icon: 'book', select: 'Méthodologie', description: 'Trouver des repères pour organiser ton travail et apprendre avec plus d’autonomie.', topics: ['Préparer un planning réaliste', 'Structurer tes révisions et tes supports', 'Essayer des outils puis ajuster ta méthode'] },
  histoire: { title: 'Histoire-Géographie', icon: 'globe', select: 'Histoire-Géographie', description: 'Comprendre les notions, faire des liens et apprendre à expliquer ce que tu sais.', topics: ['Reprendre les notions et les repères clés', 'Travailler la méthode à partir de tes cours', 'Organiser et formuler tes idées'] },
  francais: { title: 'Français', icon: 'quill', select: 'Français', description: 'Prendre le temps de comprendre un texte et de construire une expression claire.', topics: ['Revenir sur les notions vues en cours', 'Travailler la compréhension et la rédaction', 'Préparer un devoir avec une méthode adaptée'] },
  philosophie: { title: 'Philosophie', icon: 'column', select: 'Philosophie', description: 'Clarifier les notions et apprendre à développer un raisonnement qui tient ensemble.', topics: ['Comprendre une question et définir les termes', 'Organiser les arguments', 'Travailler la méthode et les exemples'] },
  mathematiques: { title: 'Mathématiques', icon: 'compass', select: 'Mathématiques', description: 'Reprendre les étapes d’un raisonnement pour comprendre ce que tu fais et pourquoi.', topics: ['Éclaircir les notions du cours', 'Décomposer un exercice pas à pas', 'Repérer les difficultés et s’entraîner'] },
  langues: { title: 'Langues', icon: 'languages', select: 'Langues — anglais', description: 'Anglais, espagnol et latin : on choisit la langue et les points à travailler ensemble.', topics: ['Revoir le vocabulaire et les notions du cours', 'Travailler la compréhension et la formulation', 'Construire des supports de révision adaptés'] }
};
const subjectDialog = document.querySelector('#subject-dialog');
let activeSubject = null;
document.querySelectorAll('[data-subject]').forEach(button => {
  button.addEventListener('click', () => {
    activeSubject = subjects[button.dataset.subject];
    document.querySelector('#subject-dialog-title').textContent = activeSubject.title;
    document.querySelector('#subject-description').textContent = activeSubject.description;
    document.querySelector('.dialog-subject-icon use').setAttribute('href', `#i-${activeSubject.icon}`);
    const topics = document.querySelector('#subject-topics');
    topics.replaceChildren(...activeSubject.topics.map(text => {
      const item = document.createElement('li'); item.textContent = text; return item;
    }));
    subjectDialog.showModal();
  });
});
document.querySelector('#subject-contact').addEventListener('click', () => {
  if (activeSubject) document.querySelector('#subject').value = activeSubject.select;
  subjectDialog.close();
});
document.querySelectorAll('[data-offer]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#offer').value = link.dataset.offer;
}));

const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelectorAll('[data-open-privacy]').forEach(button => button.addEventListener('click', () => privacyDialog.showModal()));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
});

const emailAddress = String(window.ANANAS_CONFIG?.contactEmail || '').trim();
const hasContactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
const submitButton = document.querySelector('#contact-submit');
if (hasContactEmail) {
  submitButton.firstChild.textContent = 'Préparer mon e-mail';
  document.querySelector('#form-instructions').textContent = 'Ta messagerie s’ouvrira avec ton message. Tu pourras le relire avant de l’envoyer.';
}

const messageDialog = document.querySelector('#message-dialog');
const preparedMessage = document.querySelector('#prepared-message');
const contactForm = document.querySelector('#contact-form');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const message = String(data.get('message') || '').trim();
  if (!name || !message) {
    const field = !name ? document.querySelector('#name') : document.querySelector('#message');
    field.setCustomValidity('Écris quelques mots pour continuer.'); field.reportValidity();
    field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
    return;
  }
  const offerSelect = document.querySelector('#offer');
  const offer = offerSelect.options[offerSelect.selectedIndex].text;
  const body = `Bonjour Anaïs,\n\nJe m’appelle ${name} et je souhaite échanger avec toi.\n\nNiveau : ${data.get('level') || 'À préciser ensemble'}\nMatière : ${data.get('subject') || 'À définir ensemble'}\nDemande : ${offer}\nMon e-mail : ${String(data.get('email')).trim()}\n\n${message}\n\nÀ bientôt,\n${name}`;
  preparedMessage.value = body;
  document.querySelector('#copy-status').textContent = '';
  if (hasContactEmail) {
    window.location.href = `mailto:${encodeURIComponent(emailAddress)}?subject=${encodeURIComponent('Une demande de cours — ' + name)}&body=${encodeURIComponent(body)}`;
    document.querySelector('#message-dialog-title').textContent = 'Ton e-mail est prêt.';
    messageDialog.querySelector('p:not(.eyebrow):not(.copy-status)').textContent = 'Relis-le dans ta messagerie avant de l’envoyer. Tu peux aussi copier le message ci-dessous.';
  }
  messageDialog.showModal();
});
document.querySelector('#copy-message').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(preparedMessage.value);
    status.textContent = 'Message copié. Tu peux maintenant le partager avec Anaïs.';
  } catch (_) {
    preparedMessage.focus(); preparedMessage.select();
    status.textContent = 'Le message est sélectionné. Utilise « Copier » ou le raccourci ⌘C / Ctrl+C.';
  }
});

if ('IntersectionObserver' in window) {
  const navigation = [...document.querySelectorAll('.desktop-nav a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navigation.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main>section[id]').forEach(section => observer.observe(section));
}
