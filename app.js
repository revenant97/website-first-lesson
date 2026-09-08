const products = [
  { id: 1, name: 'Architect Coat', type: 'outer', category: 'women', price: 1890, color: 'Bone', tone: '#d9d1c3', material: 'Double wool', atlas: 0 },
  { id: 2, name: 'Silk Column', type: 'top', category: 'women', price: 740, color: 'Ink', tone: '#20211e', material: 'Washed silk', atlas: 1 },
  { id: 3, name: 'Fluid Trouser', type: 'bottom', category: 'women', price: 890, color: 'Olive', tone: '#66705a', material: 'Wool twill', atlas: 2 },
  { id: 4, name: 'Sculpted Mule', type: 'shoe', category: 'women', price: 680, color: 'Oxide', tone: '#8a4938', material: 'Calf leather', atlas: 3 },
  { id: 5, name: 'Drape Jacket', type: 'outer', category: 'men', price: 1640, color: 'Charcoal', tone: '#373934', material: 'Brushed wool', atlas: 5 },
  { id: 6, name: 'Merino Veil', type: 'top', category: 'men', price: 560, color: 'Moss', tone: '#626a52', material: 'Fine merino', atlas: 6 },
  { id: 7, name: 'Pleated Volume', type: 'bottom', category: 'men', price: 920, color: 'Graphite', tone: '#4b4d49', material: 'Wool gabardine', atlas: 7 },
  { id: 8, name: 'Folded Loafer', type: 'shoe', category: 'men', price: 760, color: 'Black', tone: '#171816', material: 'Calf leather', atlas: 8 },
  { id: 9, name: 'Orb Bag', type: 'accessory', category: 'unisex', price: 1250, color: 'Verdigris', tone: '#526b62', material: 'Patinated leather', atlas: 4 },
  { id: 10, name: 'Silver Line', type: 'accessory', category: 'unisex', price: 430, color: 'Silver', tone: '#aaa9a4', material: 'Recycled silver', atlas: 9 },
];

const images = {
  women: { hero: 'assets/hero-women.jpg', look: 'assets/look-women.jpg', alt: 'Editorial portrait in a sculptural black and ivory tailored look' },
  men: { hero: 'assets/hero-men.jpg', look: 'assets/look-men.jpg', alt: 'Editorial portrait in a relaxed charcoal tailored look' },
};

const defaultLooks = {
  women: { outer: 1, top: 2, bottom: 3, shoe: 4, accessory: 9 },
  men: { outer: 5, top: 6, bottom: 7, shoe: 8, accessory: 10 },
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const getProduct = id => products.find(item => item.id === Number(id));
const atlasStyle = item => `--x:${(item.atlas % 5) * 25}%;--y:${item.atlas < 5 ? 0 : 100}%`;

let gender = 'women';
let mode = 'model';
let filter = 'current';
let look = { ...defaultLooks.women };
let lastFocused = null;
let toastTimer;
let cart = [];

try {
  const saved = JSON.parse(localStorage.getItem('maison-assemble-cart') || '[]');
  cart = saved.filter(id => getProduct(id));
} catch (_) {
  cart = [];
}

function selectedProducts() {
  return Object.values(look).map(getProduct).filter(Boolean);
}

function saveCart() {
  try { localStorage.setItem('maison-assemble-cart', JSON.stringify(cart)); } catch (_) {}
  $('#bagCount').textContent = cart.length;
}

function renderCanvas() {
  const selected = selectedProducts();
  const code = gender === 'women' ? 'W–01' : 'M–01';
  $('#lookCode').textContent = `Look ${code}`;

  if (mode === 'model') {
    $('#canvas').innerHTML = `
      <div class="model-stage">
        <img src="${images[gender].look}" alt="Selected ${gender === 'women' ? 'womenswear' : 'menswear'} composition on model">
        <p class="look-tag">Look ${code}</p>
        <div class="look-pieces" aria-hidden="true">${selected.map(item => `<span class="atlas" style="${atlasStyle(item)}"></span>`).join('')}</div>
        <div class="texture-card"><span class="texture-orb"></span><div><small>Material palette</small><strong>${gender === 'women' ? 'Wool · silk · leather' : 'Wool · merino · leather'}</strong></div></div>
        <div class="swatches" aria-hidden="true">${selected.map(item => `<span style="background:${item.tone}"></span>`).join('')}</div>
      </div>`;
  } else {
    $('#canvas').innerHTML = `<div class="flat-lay">${selected.map(item => `
      <article class="piece"><span class="atlas" style="${atlasStyle(item)}"></span><p>${item.name}<small>${item.color}</small></p></article>`).join('')}</div>`;
  }
}

function renderSelector() {
  const types = ['outer', 'top', 'bottom', 'shoe', 'accessory'];
  $('#wearLabel').textContent = gender === 'women' ? 'Womenswear' : 'Menswear';
  $('#selectorRows').innerHTML = types.map((type, index) => {
    const item = getProduct(look[type]);
    return `<button class="selector-row interactive" type="button" data-cycle="${type}" aria-label="Change ${type}, currently ${item.name}">
      <span class="number">0${index + 1}</span>
      <div><small>${type}</small><strong>${item.name}</strong><span>${item.color} · ${item.material}</span></div>
      <span class="dot" style="background:${item.tone}"></span>
    </button>`;
  }).join('');

  const total = selectedProducts().reduce((sum, item) => sum + item.price, 0);
  $('#lookTotal').textContent = money(total);
}

function visibleProducts() {
  if (filter === 'all') return products;
  return products.filter(item => item.category === gender || item.category === 'unisex');
}

function renderProducts() {
  const list = visibleProducts();
  $('#productGrid').innerHTML = list.map((item, index) => `
    <article class="product-card in-view">
      <button class="product-image interactive" type="button" data-product="${item.id}" aria-label="Try ${item.name} in the look">
        <span class="atlas" style="${atlasStyle(item)}"></span>
        <span class="product-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="material-label">${item.material}</span>
        <span class="quick-action">Try in look <i>↗</i></span>
      </button>
      <div class="product-info"><div><h3>${item.name}</h3><p>${item.color} / ${item.category}</p></div><strong>${money(item.price)}</strong></div>
    </article>`).join('');
  bindInteractiveElements();
  bindCardTilt();
}

function renderAll() {
  renderCanvas();
  renderSelector();
  renderProducts();
  saveCart();
}

function changeGender(nextGender) {
  if (nextGender === gender) return;
  gender = nextGender;
  look = { ...defaultLooks[gender] };
  const heroImage = $('#heroImg');
  heroImage.classList.add('switching');
  setTimeout(() => {
    heroImage.src = images[gender].hero;
    heroImage.alt = images[gender].alt;
    heroImage.onload = () => heroImage.classList.remove('switching');
  }, 180);
  $$('[data-gender]').forEach(button => {
    const active = button.dataset.gender === gender;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active);
  });
  renderAll();
}

function cyclePiece(type) {
  const candidates = products.filter(item => item.type === type && (item.category === gender || item.category === 'unisex'));
  if (candidates.length < 2) {
    showToast(`${getProduct(look[type]).name} is the edition's only ${type}`);
    return;
  }
  const currentIndex = candidates.findIndex(item => item.id === look[type]);
  look[type] = candidates[(currentIndex + 1) % candidates.length].id;
  renderCanvas();
  renderSelector();
}

function tryProduct(id) {
  const item = getProduct(id);
  if (!item) return;
  look[item.type] = item.id;
  if (item.category !== 'unisex' && item.category !== gender) {
    gender = item.category;
    $('#heroImg').src = images[gender].hero;
    $('#heroImg').alt = images[gender].alt;
    $$('[data-gender]').forEach(button => {
      const active = button.dataset.gender === gender;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active);
    });
  }
  renderCanvas();
  renderSelector();
  showToast(`${item.name} added to the look`);
  $('#atelier').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function addCompleteLook() {
  cart = [...new Set([...cart, ...Object.values(look)])];
  saveCart();
  showToast('Complete look added to your bag');
  openBag();
}

function showToast(message) {
  const toast = $('#toast');
  $('span', toast).textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function openBag() {
  lastFocused = document.activeElement;
  $('#overlay').classList.add('open');
  $('#overlay').setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  showBag();
  setTimeout(() => $('#closeBag').focus(), 120);
}

function closeBag() {
  $('#overlay').classList.remove('open');
  $('#overlay').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
  if (lastFocused) lastFocused.focus();
}

function showBag() {
  const body = $('#drawerBody');
  $('#drawerTitle').textContent = 'Shopping bag';
  if (!cart.length) {
    body.innerHTML = `<div class="empty"><span class="empty-mark">MA</span><h3>Your bag is waiting</h3><p>Begin with a composition in the atelier, or discover an individual object.</p><button class="primary-button interactive" id="returnAtelier" type="button"><span>Return to atelier</span><i>↙</i></button></div>`;
    $('#returnAtelier').addEventListener('click', () => { closeBag(); $('#atelier').scrollIntoView({ behavior: 'smooth' }); });
    return;
  }

  const total = cart.reduce((sum, id) => sum + getProduct(id).price, 0);
  body.innerHTML = `<div class="bag-items">${cart.map(id => {
    const item = getProduct(id);
    return `<article><span class="bag-thumb atlas" style="${atlasStyle(item)}"></span><div class="bag-copy"><strong>${item.name}</strong><small>${item.color} · ${item.material}</small><button class="remove interactive" type="button" data-remove="${id}">Remove</button></div><b class="bag-price">${money(item.price)}</b></article>`;
  }).join('')}</div><div class="bag-summary"><p><span>Subtotal</span><strong>${money(total)}</strong></p><small>Complimentary insured delivery and returns included. Availability is confirmed by a private client advisor.</small><button class="primary-button interactive" id="checkoutBtn" type="button"><span>Continue to request</span><i>→</i></button></div>`;

  $$('[data-remove]', body).forEach(button => button.addEventListener('click', () => {
    cart = cart.filter(id => id !== Number(button.dataset.remove));
    saveCart();
    showBag();
  }));
  $('#checkoutBtn').addEventListener('click', () => showCheckout(total));
  bindInteractiveElements();
}

function showCheckout(total) {
  $('#drawerTitle').textContent = 'Private request';
  $('#drawerBody').innerHTML = `<form class="checkout" id="checkoutForm">
    <label>Email<input required type="email" autocomplete="email" placeholder="you@example.com"></label>
    <div class="form-split"><label>First name<input required autocomplete="given-name"></label><label>Last name<input required autocomplete="family-name"></label></div>
    <label>Preferred appointment<select><option>Online consultation</option><option>Paris atelier</option><option>Stockholm showroom</option></select></label>
    <div class="payment-note"><span>◇</span><p><strong>No payment is taken.</strong><br>A client advisor confirms availability and contacts you within one business day.</p></div>
    <button class="primary-button interactive" type="submit"><span>Send request — ${money(total)}</span><i>→</i></button>
  </form>`;

  $('#checkoutForm').addEventListener('submit', event => {
    event.preventDefault();
    $('#drawerBody').innerHTML = `<div class="success"><span class="success-mark">✓</span><h3>Request received</h3><p>This is a demonstration checkout. In a live store, your advisor would now confirm the collection and delivery.</p><button class="primary-button interactive" id="continueBtn" type="button"><span>Continue exploring</span><i>→</i></button></div>`;
    $('#continueBtn').addEventListener('click', () => { cart = []; saveCart(); closeBag(); });
  });
  bindInteractiveElements();
}

function toggleMenu(force) {
  const menu = $('#mobileMenu');
  const button = $('#menuToggle');
  const open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  button.classList.toggle('active', open);
  button.setAttribute('aria-expanded', open);
  button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.setAttribute('aria-hidden', !open);
  document.body.classList.toggle('menu-open', open);
}

function bindInteractiveElements() {
  const cursor = $('.cursor');
  $$('.interactive').forEach(element => {
    if (element.dataset.cursorBound) return;
    element.dataset.cursorBound = 'true';
    element.addEventListener('mouseenter', () => cursor.classList.add('active'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });

  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.magnetic').forEach(element => {
    if (element.dataset.magneticBound) return;
    element.dataset.magneticBound = 'true';
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .16;
      const y = (event.clientY - rect.top - rect.height / 2) * .2;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}

function bindCardTilt() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.product-image').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 3;
      const rotateX = ((event.clientY - rect.top) / rect.height - .5) * -3;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

function setupScrollEffects() {
  const header = $('#siteHeader');
  const progress = $('#pageProgress');
  const heroImage = $('#heroImg');
  let previousY = scrollY;
  let ticking = false;

  const update = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 45);
    header.classList.toggle('hidden-header', y > previousY && y > innerHeight * .75 && !document.body.classList.contains('menu-open'));
    if (y < innerHeight) heroImage.style.transform = `translateY(${(-5 + y * .012)}%) scale(${1 + y * .000025})`;
    previousY = y;
    ticking = false;
  };

  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

function setupReveals() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal, .product-card').forEach(item => item.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .13, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal, .product-card').forEach(item => observer.observe(item));
}

function setupCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = $('.cursor');
  addEventListener('pointermove', event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add('visible');
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
}

$('#genderSwitch').addEventListener('click', event => {
  const button = event.target.closest('[data-gender]');
  if (button) changeGender(button.dataset.gender);
});

$$('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  $$('[data-mode]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', active);
  });
  renderCanvas();
}));

$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  $$('[data-filter]').forEach(item => item.classList.toggle('active', item === button));
  renderProducts();
}));

$('#selectorRows').addEventListener('click', event => {
  const button = event.target.closest('[data-cycle]');
  if (button) cyclePiece(button.dataset.cycle);
});

$('#productGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-product]');
  if (button) tryProduct(button.dataset.product);
});

$('#addLook').addEventListener('click', addCompleteLook);
$('#bagBtn').addEventListener('click', openBag);
$('#closeBag').addEventListener('click', closeBag);
$('#overlay').addEventListener('mousedown', event => { if (event.target === event.currentTarget) closeBag(); });
$('#menuToggle').addEventListener('click', () => toggleMenu());
$$('#mobileMenu a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));

$$('.material-row').forEach(button => button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') === 'true';
  $$('.material-row').forEach(item => {
    item.classList.remove('active');
    item.setAttribute('aria-expanded', 'false');
    $('i', item).textContent = '+';
    item.nextElementSibling.classList.remove('open');
  });
  if (!open) {
    button.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    $('i', button).textContent = '−';
    button.nextElementSibling.classList.add('open');
  }
}));

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if ($('#overlay').classList.contains('open')) closeBag();
  if ($('#mobileMenu').classList.contains('open')) toggleMenu(false);
});

renderAll();
setupReveals();
setupScrollEffects();
setupCursor();
bindInteractiveElements();
