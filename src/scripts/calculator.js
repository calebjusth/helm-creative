// Calculator logic moved to standalone module (plain JS, browser-compatible)
const PRICING = {
  types: {
    portfolio: { name: "Personal Portfolio", price_etb: 25000, price_usd: 650, desc: "Perfect for creatives showcasing work." },
    corporate: { name: "Corporate / Business", price_etb: 55000, price_usd: 1200, desc: "Professional presence for companies." },
    hotel: { name: "Hotel & Hospitality", price_etb: 75000, price_usd: 1800, desc: "Booking integrations and gallery focus." },
    cafe: { name: "Cafe & Restaurant", price_etb: 40000, price_usd: 950, desc: "Menu focused with reservation links." },
    ecommerce: { name: "E-Commerce Store", price_etb: 110000, price_usd: 2800, desc: "Full online shop with payment gateways." },
    elearning: { name: "E-Learning Platform", price_etb: 145000, price_usd: 3500, desc: "LMS, student dashboards, and video." },
    news: { name: "News & Media", price_etb: 85000, price_usd: 2200, desc: "High traffic CMS with ad placements." },
    hospital: { name: "Medical / Hospital", price_etb: 95000, price_usd: 2400, desc: "Appointment systems and doctor profiles." }
  },
  features: [
    { id: 'seo', name: 'Advanced SEO Setup', price_etb: 15000, price_usd: 400 },
    { id: 'cms', name: 'Custom CMS (Content)', price_etb: 20000, price_usd: 600 },
    { id: 'analytics', name: 'Adv. Analytics & Pixel', price_etb: 8000, price_usd: 250 },
    { id: 'multilang', name: 'Multi-Language (Amh/Eng)', price_etb: 12000, price_usd: 500 },
    { id: 'chat', name: 'Live Chat Integration', price_etb: 5000, price_usd: 150 },
    { id: 'copy', name: 'Pro Copywriting', price_etb: 18000, price_usd: 550 },
    { id: 'logo', name: 'Logo & Branding Kit', price_etb: 15000, price_usd: 450 },
    { id: 'maintenance', name: '1 Year Maintenance', price_etb: 30000, price_usd: 1000 }
  ],
  page_cost: { etb: 2000, usd: 100 }
};

const state = {
  region: 'global',
  currency: 'USD',
  symbol: '$',
  selectedType: '',
  extraPages: 0,
  selectedFeatures: new Set()
};

function $(id) { return document.getElementById(id); }

function safeText(el, txt) { if (el) el.textContent = txt; }

function formatNumber(num) {
  return num.toLocaleString();
}

function formatCurrency(num) {
  if (state.region === 'ethiopia') return formatNumber(num) + ' ETB';
  return '$' + formatNumber(num);
}

async function detectRegion() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('no-location');
    const data = await res.json();
    if (data && data.country_code === 'ET') {
      state.region = 'ethiopia';
      state.currency = 'ETB';
      state.symbol = 'Br ';
    }
  } catch (e) {
    // fallback stays global
  }
}

function renderTypes() {
  const select = $('project-type');
  if (!select) return;
  // clear existing (leave placeholder)
  const existing = Array.from(select.querySelectorAll('option[value]'));
  existing.forEach(o => o.remove());

  Object.entries(PRICING.types).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.name;
    select.appendChild(opt);
  });
}

function renderFeatures() {
  const grid = $('features-grid');
  const loc = $('location-display');
  if (loc) loc.textContent = state.region === 'ethiopia' ? 'Ethiopia (Local Rates)' : 'International (Global Rates)';
  if (!grid) return;
  grid.innerHTML = '';

  PRICING.features.forEach(feat => {
    const label = document.createElement('label');
    label.className = 'cursor-pointer group relative';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = feat.id;
    input.className = 'peer sr-only feature-checkbox';
    input.addEventListener('change', (e) => {
      if (input.checked) state.selectedFeatures.add(feat.id);
      else state.selectedFeatures.delete(feat.id);
      updateCalculation();
    });

    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 p-4 transition-all duration-300 hover:shadow-md h-full flex flex-col justify-between';

    const top = document.createElement('div');
    top.className = 'flex justify-between items-start mb-2';
    const title = document.createElement('span');
    title.className = 'font-pangram-bold text-sm uppercase';
    title.textContent = feat.name;
    const dot = document.createElement('div');
    dot.className = 'w-4 h-4 rounded-full border border-gray-300';

    top.appendChild(title);
    top.appendChild(dot);

    const price = document.createElement('span');
    price.className = 'text-xs text-gray-400 font-pangram';
    price.textContent = state.region === 'ethiopia' ? `${formatNumber(feat.price_etb)} ETB` : `$${formatNumber(feat.price_usd)}`;

    card.appendChild(top);
    card.appendChild(price);

    label.appendChild(input);
    label.appendChild(card);
    grid.appendChild(label);
  });
}

function updateCalculation() {
  const sumBase = $('summary-base');
  const sumPages = $('summary-pages');
  const sumAddons = $('summary-addons');
  const totalPrice = $('total-price');
  const timeline = $('timeline-display');
  const bookBtn = $('book-btn');
  const typeDesc = $('type-description');
  
  let basePrice = 0, pagesPrice = 0, addonsPrice = 0;

  if (state.selectedType && PRICING.types[state.selectedType]) {
    const typeData = PRICING.types[state.selectedType];
    basePrice = state.region === 'ethiopia' ? typeData.price_etb : typeData.price_usd;
    if (typeDesc) typeDesc.textContent = typeData.desc;
    if (['ecommerce', 'elearning', 'hotel'].includes(state.selectedType)) {
      if (timeline) timeline.textContent = '4-6 Weeks';
    } else {
      if (timeline) timeline.textContent = '2-3 Weeks';
    }
  } else {
    if (typeDesc) typeDesc.textContent = 'Select a type to see details.';
  }

  const costPerPage = state.region === 'ethiopia' ? PRICING.page_cost.etb : PRICING.page_cost.usd;
  pagesPrice = state.extraPages * costPerPage;

  state.selectedFeatures.forEach(id => {
    const feat = PRICING.features.find(f => f.id === id);
    if (feat) addonsPrice += state.region === 'ethiopia' ? feat.price_etb : feat.price_usd;
  });

  const total = basePrice + pagesPrice + addonsPrice;

  safeText(sumBase, basePrice > 0 ? formatCurrency(basePrice) : '-');
  safeText(sumPages, pagesPrice > 0 ? formatCurrency(pagesPrice) : '-');
  safeText(sumAddons, addonsPrice > 0 ? formatCurrency(addonsPrice) : '-');
  safeText(totalPrice, total > 0 ? formatCurrency(total) : formatCurrency(0));
  if (bookBtn) bookBtn.textContent = `Book for ${formatCurrency(total)}`;
}

function attachControls() {
  const select = $('project-type');
  const slider = $('page-slider');
  const pageDisplay = $('page-count-display');
  const loader = $('currency-loader');
  const content = $('calculator-content');

  if (select) {
    select.addEventListener('change', (e) => {
      state.selectedType = select.value;
      updateCalculation();
    });
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      state.extraPages = parseInt(slider.value || '0', 10);
      if (pageDisplay) pageDisplay.textContent = state.extraPages === 0 ? 'Standard Only' : `+${state.extraPages} Extra Pages`;
      updateCalculation();
    });
  }

  // hide loader
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; if (content) content.style.opacity = '1'; }, 500);
  }
}

async function init() {
  await detectRegion();
  renderTypes();
  renderFeatures();
  attachControls();
  updateCalculation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
