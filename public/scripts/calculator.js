const PRICING = {
  types: {
    // New & Requested Categories
    job_marketplace: { name: "Job Marketplace / Portal", price_etb: 77000, price_usd: 2500, desc: "User profiles, CV uploads, job posting board, and search filters." },
    mobile_app: { name: "Mobile App (iOS & Android)", price_etb: 120000, price_usd: 4500, desc: "Cross-platform mobile app published to App Store & Play Store." },
    saas_mvp: { name: "SaaS / Web App MVP", price_etb: 150000, price_usd: 5500, desc: "Complex logic, user authentication, dashboard, and database design." },
    elearning: { name: "E-Learning Platform", price_etb: 145000, price_usd: 3500, desc: "LMS, student dashboards, and video course hosting." },
    ngo: { name: "NGO / Non-Profit", price_etb: 35000, price_usd: 950, desc: "Donation integration, storytelling layout, and event calendar." },
    church: { name: "Religious / Church", price_etb: 30000, price_usd: 850, desc: "Sermon archives, event calendars, and online giving." },
    real_estate: { name: "Real Estate Listing", price_etb: 65000, price_usd: 1900, desc: "Property gallery, map integration, and agent profiles." },
    
    // Original Categories
    ecommerce: { name: "E-Commerce Store", price_etb: 110000, price_usd: 2800, desc: "Full online shop with payment gateways and inventory." },
    corporate: { name: "Corporate / Business", price_etb: 55000, price_usd: 1200, desc: "Professional presence for established companies." },
    hotel: { name: "Hotel & Hospitality", price_etb: 75000, price_usd: 1800, desc: "Booking integrations and luxury gallery focus." },
    hospital: { name: "Medical / Hospital", price_etb: 95000, price_usd: 2400, desc: "Appointment systems and doctor profiles." },
    portfolio: { name: "Personal Portfolio", price_etb: 25000, price_usd: 650, desc: "Perfect for creatives showcasing work." }
  },
  features: [
    { id: 'seo', name: 'Advanced SEO Setup', price_etb: 15000, price_usd: 400 },
    { id: 'cms', name: 'Custom CMS (Admin Panel)', price_etb: 20000, price_usd: 600 },
    { id: 'analytics', name: 'Adv. Analytics & Pixel', price_etb: 8000, price_usd: 250 },
    { id: 'multilang', name: 'Multi-Language (Amh/Eng)', price_etb: 12000, price_usd: 500 },
    { id: 'chat', name: 'Live Chat Integration', price_etb: 20000, price_usd: 450 }, // Updated to 20k
    { id: 'copy', name: 'Pro Copywriting', price_etb: 18000, price_usd: 550 },
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
  selectedFeatures: new Set(),
  total: 0
};

function $(id) { return document.getElementById(id); }

function formatCurrency(num) {
  if (state.region === 'ethiopia') return num.toLocaleString() + ' ETB';
  return '$' + num.toLocaleString();
}

async function detectRegion() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data && data.country_code === 'ET') {
      state.region = 'ethiopia';
      state.currency = 'ETB';
    }
  } catch (e) { console.log("Region detection failed, defaulting to Global."); }
}

function renderTypes() {
  const select = $('project-type');
  if (!select) return;
  Object.entries(PRICING.types).forEach(([key, val]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = val.name;
    select.appendChild(opt);
  });
}

function renderFeatures() {
  const grid = $('features-grid');
  if (!grid) return;
  grid.innerHTML = '';

  PRICING.features.forEach(feat => {
    const card = document.createElement('div');
    card.id = `feat-${feat.id}`;
    card.className = 'feature-card cursor-pointer border-2 border-gray-200 p-4 rounded-xl transition-all hover:border-[#f5bd02] bg-white';
    
    const priceTag = state.region === 'ethiopia' ? feat.price_etb : feat.price_usd;
    
    card.innerHTML = `
      <div class="flex justify-between items-center pointer-events-none">
        <div>
          <h4 class="font-bold text-sm uppercase">${feat.name}</h4>
          <span class="text-xs text-gray-500">+${formatCurrency(priceTag)}</span>
        </div>
        <div class="feat-indicator w-5 h-5 border-2 border-gray-300 rounded-full"></div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (state.selectedFeatures.has(feat.id)) {
        state.selectedFeatures.delete(feat.id);
        card.classList.remove('selected');
      } else {
        state.selectedFeatures.add(feat.id);
        card.classList.add('selected');
      }
      updateCalculation();
    });
    grid.appendChild(card);
  });
}

function updateCalculation() {
  let base = 0, pages = 0, addons = 0;

  if (state.selectedType) {
    const t = PRICING.types[state.selectedType];
    base = state.region === 'ethiopia' ? t.price_etb : t.price_usd;
    $('included-list').textContent = t.desc;
    $('included-box').classList.remove('hidden');
    
    // Timeline logic
    const longProjects = ['mobile_app', 'saas_mvp', 'elearning', 'job_marketplace'];
    $('timeline-display').textContent = longProjects.includes(state.selectedType) ? 'Timeline: 6-10 Weeks' : 'Timeline: 2-4 Weeks';
  }

  pages = state.extraPages * (state.region === 'ethiopia' ? PRICING.page_cost.etb : PRICING.page_cost.usd);

  state.selectedFeatures.forEach(id => {
    const f = PRICING.features.find(x => x.id === id);
    addons += state.region === 'ethiopia' ? f.price_etb : f.price_usd;
  });

  state.total = base + pages + addons;

  $('summary-base').textContent = base > 0 ? formatCurrency(base) : '-';
  $('summary-pages').textContent = pages > 0 ? formatCurrency(pages) : '-';
  $('summary-addons').textContent = addons > 0 ? formatCurrency(addons) : '-';
  $('total-price').textContent = formatCurrency(state.total);
}

function handleSocialClicks() {
  const getSummary = () => {
    const typeName = state.selectedType ? PRICING.types[state.selectedType].name : "Custom Project";
    return `Hi Helm, I just used your Project Estimator.
Project: ${typeName}
Total Estimate: ${formatCurrency(state.total)}
I'd like to discuss the next steps!`;
  };

  $('whatsapp-btn')?.addEventListener('click', () => {
    const url = `https://wa.me/+251977240817?text=${encodeURIComponent(getSummary())}`; // Change to your actual number
    window.open(url, '_blank');
  });

  $('telegram-btn')?.addEventListener('click', () => {
    const url = `https://t.me/alpha_valley?text=${encodeURIComponent(getSummary())}`; // Change to your actual username
    window.open(url, '_blank');
  });
}

async function init() {
  await detectRegion();
  $('location-badge').textContent = state.region === 'ethiopia' ? 'Ethiopia (ETB)' : 'International (USD)';
  renderTypes();
  renderFeatures();
  handleSocialClicks();

  $('project-type').addEventListener('change', (e) => {
    state.selectedType = e.target.value;
    updateCalculation();
  });

  $('page-slider').addEventListener('input', (e) => {
    state.extraPages = parseInt(e.target.value);
    $('page-count-display').textContent = state.extraPages === 0 ? 'Standard Only' : `+${state.extraPages} Extra Pages`;
    updateCalculation();
  });
}

document.addEventListener('DOMContentLoaded', init);