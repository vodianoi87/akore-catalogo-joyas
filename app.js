const categoryHost = document.querySelector('#categories');
const grid = document.querySelector('#product-grid');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty-state');
const dialog = document.querySelector('#product-dialog');
let products = [];
let activeCategory = 'Todas';
let selectedVariant = null;

let dialogScrollPosition = 0;
let savedBodyStyles = null;

function lockDialogBackgroundScroll() {
  if (document.documentElement.classList.contains('product-dialog-open')) return;
  dialogScrollPosition = window.scrollY || window.pageYOffset;
  const bodyStyle = document.body.style;
  savedBodyStyles = {
    position: bodyStyle.position,
    top: bodyStyle.top,
    left: bodyStyle.left,
    right: bodyStyle.right,
    width: bodyStyle.width
  };
  document.documentElement.classList.add('product-dialog-open');
  bodyStyle.position = 'fixed';
  bodyStyle.top = '-' + dialogScrollPosition + 'px';
  bodyStyle.left = '0';
  bodyStyle.right = '0';
  bodyStyle.width = '100%';
}

function unlockDialogBackgroundScroll() {
  if (!savedBodyStyles) return;
  Object.assign(document.body.style, savedBodyStyles);
  document.documentElement.classList.remove('product-dialog-open');
  savedBodyStyles = null;
  window.scrollTo(0, dialogScrollPosition);
}

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
const formatPrice = value => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
const categories = ['Todas', 'Cadenas', 'Dijes', 'Medallas y dijes', 'Brazaletes', 'Anillos', 'Pulseras', 'Argollas'];

function renderCategories() {
  categoryHost.innerHTML = categories.map(category => `<button class="category-button${category === activeCategory ? ' active' : ''}" type="button" data-category="${category}" aria-pressed="${category === activeCategory}">${category}</button>`).join('');
  categoryHost.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    renderCategories();
    renderProducts();
  }));
}

function cardPrice(item) {
  const priced = item.variants.map(variant => variant.price).filter(Number.isFinite);
  if (!priced.length) return 'Consultar precio';
  const lowest = Math.min(...priced);
  return priced.length > 1 ? `Desde ${formatPrice(lowest)}` : formatPrice(lowest);
}

function renderProducts() {
  const query = normalize(search.value.trim());
  const filtered = products.filter(item => {
    const searchable = normalize([item.name, item.category, item.reference, `página ${item.page}`, item.page, ...item.features, ...item.variants.map(v => v.label)].join(' '));
    return (activeCategory === 'Todas' || item.category === activeCategory) && searchable.includes(query);
  });
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'joya' : 'joyas'}`;
  empty.hidden = filtered.length > 0;
  grid.innerHTML = filtered.map(item => `<article class="product-card" tabindex="0" role="button" aria-label="Ver ${item.name}, ${item.category}, página ${String(item.page).padStart(2,'0')}" data-id="${item.id}">
    <div class="product-image"><img src="${item.image}" alt="${item.name}, ${item.category}. Fotografía del producto, catálogo AKORE página ${item.page}" loading="lazy"><span class="page-label">AKORE · PÁG. ${String(item.page).padStart(2,'0')}</span><span class="card-action" aria-hidden="true">↗</span></div>
    <div class="product-meta"><div><h3>${item.name}</h3><p>${item.category} · Página ${String(item.page).padStart(2,'0')}</p></div><span class="price-note">${cardPrice(item)}</span></div>
  </article>`).join('');
  grid.querySelectorAll('.product-card').forEach(card => {
    const item = filtered.find(product => product.id === Number(card.dataset.id));
    card.addEventListener('click', () => openProduct(item));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(item); }
    });
  });
}

function updateWhatsApp(item) {
  const variant = selectedVariant ? `, variante ${selectedVariant.label}${selectedVariant.price ? ` (${formatPrice(selectedVariant.price)})` : ''}` : '';
  const message = `Hola AKORE, quiero consultar por ${item.name} de ${item.category}, página ${String(item.page).padStart(2,'0')}${variant}. ¿Me comparten disponibilidad y precio?`;
  document.querySelector('#dialog-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function renderVariants(item) {
  const host = document.querySelector('#variant-section');
  if (!item.variants.length) {
    host.innerHTML = '<span class="variant-heading">Precio</span><div class="price-callout">Consultar precio</div>';
    return;
  }
  host.innerHTML = `<span class="variant-heading">${item.variants.length > 1 ? 'Elige una variante' : 'Variante disponible en catálogo'}</span><div class="variant-options">${item.variants.map((variant, index) => `<button type="button" class="variant-option${selectedVariant === variant ? ' selected' : ''}" data-variant="${index}" aria-pressed="${selectedVariant === variant}"><span>${variant.label}</span><strong>${Number.isFinite(variant.price) ? formatPrice(variant.price) : 'Consultar precio'}</strong></button>`).join('')}</div>`;
  host.querySelectorAll('.variant-option').forEach(button => button.addEventListener('click', () => {
    selectedVariant = item.variants[Number(button.dataset.variant)];
    renderVariants(item);
    updateWhatsApp(item);
  }));
}

function openProduct(item) {
  selectedVariant = null;
  const main = document.querySelector('#dialog-image');
  main.src = item.image;
  main.alt = `${item.name}, ${item.category}, fotografía principal`;
  document.querySelector('#dialog-category').textContent = `${item.category} · CATÁLOGO PÁGINA ${String(item.page).padStart(2,'0')}`;
  document.querySelector('#dialog-title').textContent = item.name;
  document.querySelector('#dialog-reference').textContent = item.reference ? `Referencia: ${item.reference}` : `Código de producto no indicado · Localizador: página ${String(item.page).padStart(2,'0')}`;
  document.querySelector('#product-features').innerHTML = (item.features || []).map(feature => `<span class="feature-tag">${feature}</span>`).join('');
  const gallery = [...new Set(item.gallery)];
  const thumbs = document.querySelector('#gallery-thumbnails');
  const labels = item.galleryLabels || ['Fotografía principal del producto', 'Modelo usando la joya', 'Detalle del producto'];
  thumbs.innerHTML = gallery.length > 1 ? gallery.map((src,index) => `<button type="button" class="gallery-thumb${index === 0 ? ' active' : ''}" data-src="${src}" data-description="${labels[index] || `Fotografía ${index + 1} del producto`}" aria-label="Ver ${labels[index] || `fotografía ${index + 1}`} de ${item.name}" aria-pressed="${index === 0}"><img src="${src}" alt="" loading="lazy"></button>`).join('') : '';
  thumbs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    main.src = button.dataset.src;
    main.alt = `${item.name}, ${item.category}. ${button.dataset.description}.`;
    thumbs.querySelectorAll('button').forEach(thumb => { thumb.classList.toggle('active', thumb === button); thumb.setAttribute('aria-pressed', String(thumb === button)); });
  }));
  renderVariants(item);
  updateWhatsApp(item);
  lockDialogBackgroundScroll();
  dialog.showModal();
}

search.addEventListener('input', renderProducts);
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', unlockDialogBackgroundScroll);
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

if (Array.isArray(window.akoreCatalog)) {
  products = window.akoreCatalog;
  renderCategories();
  renderProducts();
} else {
    count.textContent = 'No se pudo cargar el catálogo';
    empty.textContent = 'No pudimos cargar las joyas en este momento. Recarga la página o escríbenos por WhatsApp.';
    empty.hidden = false;
}
