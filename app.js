/**
 * PIXER Producciones (Córdoba) — Lógica de Sub-Módulos por Categoría y Conversión
 * Implementa patrones nativos recomendados por modern-web-guidance (tabs, html, performance)
 */

const PIXER_CONFIG = {
  // Número de WhatsApp configurable del estudio (formato internacional sin +)
  whatsappNumber: '5493510000000',
  // Configuración rápida de Barra Superior Promocional (Estilo Black Friday / Medios de Pago)
  promoBarEnabled: true
};

function buildWhatsAppUrl(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${PIXER_CONFIG.whatsappNumber}?text=${encoded}`;
}

/* ==========================================================================
   1. SISTEMA DE SUB-MÓDULOS POR CATEGORÍA (TABS + CUADRADITOS + UNTIL-FOUND)
   ========================================================================== */
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const categorySquares = Array.from(document.querySelectorAll('.category-square'));

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

// Eventos en pestañas del tablist
for (const tab of tabs) {
  tab.addEventListener('click', () => {
    selectCategoryTab(tab);
  });

  // Fallback de teclado para navegadores sin soporte nativo de focusgroup
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

// Sincronización con búsqueda interna del navegador (hidden="until-found" + beforematch)
for (const panel of panels) {
  panel.addEventListener('beforematch', () => {
    const associatedTab = document.getElementById(panel.getAttribute('aria-labelledby'));
    if (associatedTab) {
      selectCategoryTab(associatedTab);
    }
  });
}

// Eventos en los "Cuadraditos" de Categoría (Estilo ND Fotografía)
for (const square of categorySquares) {
  square.addEventListener('click', () => {
    const targetTab = document.getElementById(square.dataset.targetTab);
    selectCategoryTab(targetTab, { scrollToModule: true });
  });
}

// Enlaces del footer que saltan a una categoría específica
for (const link of document.querySelectorAll('[data-jump-tab]')) {
  link.addEventListener('click', (event) => {
    const targetTab = document.getElementById(link.dataset.jumpTab);
    if (targetTab) {
      event.preventDefault();
      selectCategoryTab(targetTab, { scrollToModule: true });
    }
  });
}

/* ==========================================================================
   2. WIDGET INTERACTIVO DE WHATSAPP Y CTAs CONTEXTUALES
   ========================================================================== */
const waPanel = document.getElementById('wa-interactive-panel');
const waFabToggle = document.getElementById('wa-fab-toggle');
const waPanelClose = document.getElementById('wa-panel-close');

function toggleWaPanel(forceState) {
  if (!waPanel || !waFabToggle) return;
  const shouldOpen = typeof forceState === 'boolean' ? forceState : waPanel.hidden;
  waPanel.hidden = !shouldOpen;
  waFabToggle.setAttribute('aria-expanded', String(shouldOpen));
}

waFabToggle?.addEventListener('click', () => toggleWaPanel());
waPanelClose?.addEventListener('click', () => toggleWaPanel(false));

// Botones de toda la página que abren el widget o redirigen con contexto
for (const btn of document.querySelectorAll('.js-open-wa-widget')) {
  btn.addEventListener('click', () => {
    toggleWaPanel(true);
  });
}

// Opciones rápidas dentro del asistente de WhatsApp
for (const optBtn of document.querySelectorAll('.js-wa-direct')) {
  optBtn.addEventListener('click', () => {
    const msg = optBtn.dataset.msg || 'Hola PIXER Producciones! Quiero hacer una consulta.';
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
  });
}

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
      else if (ctx.includes('Modelaje')) eventTypeSelect.value = 'Book de Modelaje / Personal';
      else if (ctx.includes('Infantil')) eventTypeSelect.value = 'Infantil / Cumpleaños';
      else if (ctx.includes('Producto')) eventTypeSelect.value = 'Foto Producto / Comercial';
      else if (ctx.includes('Presupuesto')) eventTypeSelect.value = 'Mejorar un presupuesto';
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
    `Me gustaría coordinar: ${pref} para consultar por ${eventType} (${city}) y conocer cómo trabajan.`;

  meetingDialog?.close('confirm');
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
});

/* ==========================================================================
   4. VISOR LIGHTBOX NATIVO <dialog> PARA FOTOGRAFÍAS CURADAS
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

// Fallback de cierre al hacer clic en el backdrop para navegadores sin closedby="any"
for (const dlg of [meetingDialog, lightboxDialog]) {
  dlg?.addEventListener('click', (event) => {
    if (event.target === dlg) {
      dlg.close('backdrop');
    }
  });
}
