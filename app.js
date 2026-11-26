/**
 * PIXER Producciones (Córdoba) — Lógica de Módulos, Mini Cuadradito Pre-WhatsApp y Google Ads Routing
 */

const PIXER_CONFIG = {
  whatsappNumber: '5493510000000'
};

function buildWhatsAppUrl(message) {
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${PIXER_CONFIG.whatsappNumber}?text=${encoded}`;
}

/* ==========================================================================
   1. SISTEMA DE SUB-MÓDULOS POR CATEGORÍA + ROUTING PARA GOOGLE ADS
   ========================================================================== */
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const categorySquares = Array.from(document.querySelectorAll('.category-square'));
const waCustomInput = document.getElementById('wa-custom-input');
const waPanel = document.getElementById('wa-interactive-panel');
const waFabToggle = document.getElementById('wa-fab-toggle');

function setWaPresetMessage(text, { openCard = false } = {}) {
  if (waCustomInput && text) {
    waCustomInput.value = text;
  }
  if (openCard && waPanel && waFabToggle) {
    waPanel.hidden = false;
    waFabToggle.setAttribute('aria-expanded', 'true');
    waCustomInput?.focus();
  }
}

function selectCategoryTab(targetTab, { scrollToModule = false, moveFocus = false } = {}) {
  if (!targetTab) return;
  const targetPanelId = targetTab.dataset.panel;

  for (const tab of tabs) {
    const isSelected = tab === targetTab;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.toggleAttribute('focusgroupstart', isSelected);
  }

  for (const panel of panels) {
    const isSelected = panel.id === targetPanelId;
    if (isSelected) {
      panel.removeAttribute('hidden');
      panel.setAttribute('tabindex', '0');
    } else {
      panel.setAttribute('hidden', 'until-found');
      panel.removeAttribute('tabindex');
    }
  }

  for (const sq of categorySquares) {
    sq.classList.toggle('is-active', sq.dataset.targetTab === targetTab.id);
  }

  // Actualizar el mensaje del mini cuadradito pre-WhatsApp según la categoría activa
  if (targetTab.dataset.waText) {
    setWaPresetMessage(targetTab.dataset.waText);
  }

  try {
    targetTab.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
  } catch {
    targetTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  if (moveFocus) {
    targetTab.focus();
  }

  if (scrollToModule) {
    const moduleContainer = document.getElementById('modulo-detalle-categoria');
    moduleContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

for (const tab of tabs) {
  tab.addEventListener('click', () => {
    selectCategoryTab(tab);
  });

  tab.addEventListener('keydown', (event) => {
    const idx = tabs.indexOf(tab);
    let nextIdx = -1;
    if (event.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIdx = 0;
    if (event.key === 'End') nextIdx = tabs.length - 1;

    if (nextIdx !== -1) {
      event.preventDefault();
      selectCategoryTab(tabs[nextIdx], { moveFocus: true });
    }
  });
}

for (const panel of panels) {
  panel.addEventListener('beforematch', () => {
    const associatedTab = document.getElementById(panel.getAttribute('aria-labelledby'));
    if (associatedTab) {
      selectCategoryTab(associatedTab);
    }
  });
}

for (const square of categorySquares) {
  square.addEventListener('click', () => {
    const targetTab = document.getElementById(square.dataset.targetTab);
    selectCategoryTab(targetTab, { scrollToModule: true });
  });
}

for (const link of document.querySelectorAll('[data-jump-tab]')) {
  link.addEventListener('click', (event) => {
    const targetTab = document.getElementById(link.dataset.jumpTab);
    if (targetTab) {
      event.preventDefault();
      selectCategoryTab(targetTab, { scrollToModule: true });
    }
  });
}

// Soporte de parámetros URL para campañas de Google Ads (ej. ?modulo=15-anos o ?modulo=bodas)
const urlParams = new URLSearchParams(window.location.search);
const requestedModule = urlParams.get('modulo') || window.location.hash.replace('#', '');
const moduleMap = {
  '15-anos': 'tab-15',
  'bodas': 'tab-bodas',
  'egresados': 'tab-egresos',
  'modelaje': 'tab-modelaje',
  'infantil': 'tab-infantil',
  'producto': 'tab-producto'
};
if (requestedModule && moduleMap[requestedModule]) {
  const initialTab = document.getElementById(moduleMap[requestedModule]);
  if (initialTab) {
    selectCategoryTab(initialTab, { scrollToModule: true });
  }
}

/* ==========================================================================
   2. MINI CUADRADITO PRE-WHATSAPP
   ========================================================================== */
const waPanelClose = document.getElementById('wa-panel-close');
const waMiniForm = document.getElementById('wa-mini-form');
const waChips = Array.from(document.querySelectorAll('.wa-chip'));

function toggleWaPanel(forceState) {
  if (!waPanel || !waFabToggle) return;
  const shouldOpen = typeof forceState === 'boolean' ? forceState : waPanel.hidden;
  waPanel.hidden = !shouldOpen;
  waFabToggle.setAttribute('aria-expanded', String(shouldOpen));
}

waFabToggle?.addEventListener('click', () => toggleWaPanel());
waPanelClose?.addEventListener('click', () => toggleWaPanel(false));

for (const chip of waChips) {
  chip.addEventListener('click', () => {
    for (const c of waChips) c.classList.toggle('is-selected', c === chip);
    if (chip.dataset.chipMsg) {
      setWaPresetMessage(chip.dataset.chipMsg);
    }
  });
}

for (const btn of document.querySelectorAll('.js-open-wa-widget')) {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.waPreset || 'Hola! Quiero cotizar un presupuesto de 15 años en Córdoba.';
    setWaPresetMessage(preset, { openCard: true });
  });
}

waMiniForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const msg = waCustomInput?.value || 'Hola! Quiero cotizar un presupuesto de 15 años en Córdoba.';
  window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
});

/* ==========================================================================
   3. MODAL NATIVO <dialog> PARA AGENDAR REUNIÓN O LLAMADA
   ========================================================================== */
const meetingDialog = document.getElementById('meeting-dialog');
const meetingForm = document.getElementById('meeting-form');
const eventTypeSelect = document.getElementById('event-type');

for (const trigger of document.querySelectorAll('.js-open-meeting-modal')) {
  trigger.addEventListener('click', () => {
    const ctx = trigger.dataset.context || '';
    if (eventTypeSelect) {
      if (ctx.includes('15')) eventTypeSelect.value = '15 Años';
      else if (ctx.includes('Boda')) eventTypeSelect.value = 'Boda / Casamiento';
      else if (ctx.includes('Egresados')) eventTypeSelect.value = 'Egresados / Recibida';
      else if (ctx.includes('Book') || ctx.includes('Modelaje')) eventTypeSelect.value = 'Book de Modelaje / Personal';
      else if (ctx.includes('Infantil')) eventTypeSelect.value = 'Infantil / Cumpleaños';
      else if (ctx.includes('Producto')) eventTypeSelect.value = 'Foto Producto / Comercial';
      else if (ctx.includes('presupuesto')) eventTypeSelect.value = 'Mejorar un presupuesto';
    }
    meetingDialog?.showModal();
  });
}

meetingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(meetingForm);
  const name = formData.get('name') || '';
  const eventType = formData.get('eventType') || '';
  const city = formData.get('city') || 'Córdoba';
  const pref = formData.get('pref') || 'Llamada por WhatsApp';

  const message =
    `Hola PIXER Producciones! Soy ${name}. ` +
    `Quiero coordinar una ${pref} para consultar por ${eventType} (${city}).`;

  meetingDialog?.close('confirm');
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
});

/* ==========================================================================
   4. VISOR LIGHTBOX NATIVO <dialog>
   ========================================================================== */
const lightboxDialog = document.getElementById('lightbox-dialog');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

for (const photoTrigger of document.querySelectorAll('.js-open-lightbox')) {
  photoTrigger.addEventListener('click', () => {
    const src = photoTrigger.dataset.src;
    const caption = photoTrigger.dataset.caption || '';
    const innerImg = photoTrigger.querySelector('img');
    if (lightboxImg && src) {
      lightboxImg.src = src;
      lightboxImg.alt = innerImg?.alt || caption;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }
    lightboxDialog?.showModal();
  });
}

for (const dlg of [meetingDialog, lightboxDialog]) {
  dlg?.addEventListener('click', (event) => {
    if (event.target === dlg) {
      dlg.close('backdrop');
    }
  });
}
