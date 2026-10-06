import { recommendations } from '../../data/recommendations.js';
import { t, getLanguage } from '../i18n.js';

export async function renderRecommendationsPanel(panel, state, { onNavigate }) {
  const grid = panel.querySelector('#recommendations-grid');
  const searchInput = panel.querySelector('#rec-search');
  const filterBtns = panel.querySelectorAll('.rec-filter-btn');
  
  if (!grid) return;

  let currentFilter = 'all';
  let currentSearch = searchInput ? searchInput.value.toLowerCase() : '';

  // UI elements translation
  const helpSummary = panel.querySelector('.tab-help-accordion summary');
  const helpBox = panel.querySelector('.info-box');
  if (helpSummary) {
    helpSummary.innerHTML = `<i class="ti ti-info-circle"></i> ${t('common.tab_help_title')} <span style="font-size:0.75rem; font-weight:400; color:var(--text-muted); margin-left:auto">▾</span>`;
  }
  if (helpBox) {
    helpBox.innerHTML = t('tabHelp.recommendations');
  }
  if (searchInput) {
    searchInput.placeholder = t('recommendationsTab.search_placeholder');
  }

  // Filter buttons translation
  const FILTER_KEYS = {
    'all': 'filter_all',
    'Kuru Dönem / Geçiş': 'filter_dry',
    'Laktasyon Rasyonu': 'filter_lac',
    'Sağlık / Rumen': 'filter_health',
    'Barınak ve Refah': 'filter_housing',
    'Su Tüketimi': 'filter_water',
    'Buzağı ve Düve': 'filter_calf'
  };
  filterBtns.forEach(btn => {
    const fv = btn.dataset.filter;
    if (FILTER_KEYS[fv]) {
      btn.textContent = t('recommendationsTab.' + FILTER_KEYS[fv]);
    }
  });

  function renderCards() {
    grid.innerHTML = '';
    const isEn = getLanguage() === 'en';
    
    const filtered = recommendations.filter(rec => {
      const matchFilter = currentFilter === 'all' || rec.category === currentFilter;
      const recTitle = isEn && rec.titleEn ? rec.titleEn : rec.title;
      const recContent = isEn && rec.contentEn ? rec.contentEn : rec.content;
      const matchSearch = recTitle.toLowerCase().includes(currentSearch) || recContent.toLowerCase().includes(currentSearch);
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">${t('recommendationsTab.empty_state')}</div>`;
      return;
    }

    filtered.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      
      const CATEGORY_ICONS = {
        'Kuru Dönem / Geçiş': 'ti-calendar-time',
        'Laktasyon Rasyonu': 'ti-droplet',
        'Sağlık / Rumen': 'ti-shield',
        'Barınak ve Refah': 'ti-home',
        'Su Tüketimi': 'ti-cup',
        'Buzağı ve Düve': 'ti-arrow-up-right'
      };
      const catIcon = CATEGORY_ICONS[rec.category] || 'ti-bulb';
      
      const categoryText = isEn && rec.categoryEn ? rec.categoryEn.toUpperCase() : rec.category.toUpperCase();
      let badges = `<span class="rec-badge badge-cat"><i class="ti ${catIcon}"></i> ${categoryText}</span>`;
      
      if (rec.category.includes('Laktasyon')) badges += `<span class="rec-badge badge-blue"><i class="ti ti-droplet"></i> ${isEn ? 'LACTATION' : 'SÜT'}</span>`;
      if (rec.category.includes('Kuru')) badges += `<span class="rec-badge badge-orange"><i class="ti ti-activity"></i> ${isEn ? 'PREGNANT' : 'GEBE'}</span>`;
      if (rec.category.includes('Sağlık') || rec.category.includes('Rumen') || rec.category.includes('Tüketimi')) badges += `<span class="rec-badge badge-red">${isEn ? 'CRITICAL' : 'KRİTİK'}</span>`;
      
      let contentStr = isEn && rec.contentEn ? rec.contentEn : (rec.content || '');
      const recTitle = isEn && rec.titleEn ? rec.titleEn : rec.title;
      
      let desc = contentStr;
      let tip = isEn ? 'Please pay special attention to this parameter.' : 'Lütfen bu parametreye özellikle dikkat edin.';
      
      // Find the last dot-space that is followed by a capital letter
      const match = contentStr.match(/^(.*\S)\.\s+([A-ZĞÜŞİÖÇ].*)$/);
      if (match) {
        desc = match[1] + '.';
        tip = match[2];
      }

      card.innerHTML = `
        <div class="rec-badges">
          ${badges}
        </div>
        <h3 class="rec-title">${recTitle}</h3>
        
        <div class="rec-desc">
          ${desc}
        </div>

        <div class="rec-tip-box">
          <div class="rec-tip-header">
            <i class="ti ti-bulb"></i> ${t('recommendationsTab.tip_header')}
          </div>
          <div class="rec-tip-content">
            ${tip}
          </div>
        </div>
        
        <div class="rec-footer">
          <span class="rec-source"><i class="ti ti-book"></i> ${rec.scientificSource}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    const actionBtns = grid.querySelectorAll('.rec-action');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target && typeof onNavigate === 'function') {
          onNavigate(target);
        }
      });
    });
  }

  // İlk render'da event listener'ları bağla
  if (!panel.dataset.initialized) {
    if (filterBtns) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          filterBtns.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          
          // Re-evaluate isEn and re-render correctly
          const newFilter = e.target.dataset.filter;
          if (panel.dataset.initialized) {
            // Let the panel re-render handle it if we want to ensure latest scope, 
            // but actually we can just dispatch an event or let the current renderCards 
            // handle it. Since we moved isEn inside renderCards, the old renderCards 
            // closure will still use the dynamic getLanguage().
          }
          currentFilter = newFilter;
          renderCards();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderCards();
      });
    }
    
    // Instead of using dataset.initialized flag which causes stale closures,
    // let's clone nodes or remove old listeners.
    // Actually, just leaving it as dataset.initialized is fine NOW
    // because getLanguage() is evaluated inside renderCards().
    
    panel.dataset.initialized = 'true';
  } else {
    const activeBtn = panel.querySelector('.rec-filter-btn.active');
    if (activeBtn) currentFilter = activeBtn.dataset.filter;
    if (searchInput) currentSearch = searchInput.value.toLowerCase();
  }

  renderCards();
}
