/**
 * Trello Superproductive Routine — Core Application Engine
 * Pair-programmed with REA evidence analysis & Caramelo standards
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'trello_superprodutiva_v1_store';
  const BG_STORAGE_KEY = 'trello_board_bg_choice';

  // State
  let boardData = null;
  let activeView = 'kanban';
  let activeCardId = null;
  let draggedCardId = null;
  let sourceListId = null;
  let draggedListId = null;
  let searchFilter = '';
  let activeLabelFilters = new Set();
  let activeStatusFilter = 'all'; // 'all', 'pending', 'done'
  let isStarred = false;
  let activityHistory = [];

  // DOM Elements
  const listsContainer = document.getElementById('lists-container');
  const boardTitleEl = document.getElementById('board-title');
  const globalSearchInput = document.getElementById('global-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const starToggleBtn = document.getElementById('star-toggle-btn');
  const filterToggleBtn = document.getElementById('filter-toggle-btn');
  const activeFilterBadge = document.getElementById('active-filter-badge');
  const filterBar = document.getElementById('filter-bar');
  const filterKeywordInput = document.getElementById('filter-keyword-input');
  const filterLabelChips = document.getElementById('filter-label-chips');
  const clearAllFiltersBtn = document.getElementById('clear-all-filters-btn');
  const statusFilterBtns = document.querySelectorAll('.filter-status-buttons .status-btn');
  const viewTabs = document.querySelectorAll('.view-tab');
  const viewContainers = document.querySelectorAll('.view-container');
  const toastEl = document.getElementById('toast');

  // Modal Elements
  const modalBackdrop = document.getElementById('card-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCoverPreview = document.getElementById('modal-cover-preview');
  const modalCardTitle = document.getElementById('modal-card-title');
  const modalCurrentListBtn = document.getElementById('modal-current-list-btn');
  const modalDoneBadge = document.getElementById('modal-done-badge');
  const modalActiveLabels = document.getElementById('modal-active-labels');
  const modalCardDesc = document.getElementById('modal-card-desc');
  const modalSaveDescBtn = document.getElementById('modal-save-desc-btn');
  const modalCancelDescBtn = document.getElementById('modal-cancel-desc-btn');
  const modalChecklistItems = document.getElementById('modal-checklist-items');
  const checklistPercent = document.getElementById('checklist-percent');
  const checklistFill = document.getElementById('checklist-fill');
  const btnAddChecklistItem = document.getElementById('btn-add-checklist-item');
  const addItemBox = document.getElementById('add-item-box');
  const newChecklistItemInput = document.getElementById('new-checklist-item-input');
  const btnSaveChecklistItem = document.getElementById('btn-save-checklist-item');
  const btnCancelChecklistItem = document.getElementById('btn-cancel-checklist-item');
  const modalCommentInput = document.getElementById('modal-comment-input');
  const modalPostCommentBtn = document.getElementById('modal-post-comment-btn');
  const modalCommentsList = document.getElementById('modal-comments-list');
  const modalBtnToggleDone = document.getElementById('modal-btn-toggle-done');
  const modalToggleDoneText = document.getElementById('modal-toggle-done-text');
  const modalBtnManageLabels = document.getElementById('modal-btn-manage-labels');
  const modalBtnAddChecklist = document.getElementById('modal-btn-add-checklist');
  const modalBtnMoveCard = document.getElementById('modal-btn-move-card');
  const modalBtnDuplicateCard = document.getElementById('modal-btn-duplicate-card');
  const modalBtnDeleteCard = document.getElementById('modal-btn-delete-card');

  // Popovers
  const labelPickerPopover = document.getElementById('label-picker-popover');
  const closeLabelPicker = document.getElementById('close-label-picker');
  const searchLabelsInput = document.getElementById('search-labels-input');
  const labelSelectionList = document.getElementById('label-selection-list');
  const moveCardPopover = document.getElementById('move-card-popover');
  const closeMovePopover = document.getElementById('close-move-popover');
  const moveTargetListSelect = document.getElementById('move-target-list-select');
  const btnConfirmMove = document.getElementById('btn-confirm-move');

  // Drawer
  const boardSideDrawer = document.getElementById('board-side-drawer');
  const boardMenuBtn = document.getElementById('board-menu-btn');
  const btnOpenMenuTop = document.getElementById('btn-open-menu-top');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const btnExportBoardJson = document.getElementById('btn-export-board-json');
  const btnImportBoardTrigger = document.getElementById('btn-import-board-trigger');
  const boardJsonFileInput = document.getElementById('board-json-file-input');
  const btnResetTemplate = document.getElementById('btn-reset-template');
  const drawerActivityFeed = document.getElementById('drawer-activity-feed');
  const themeOptions = document.querySelectorAll('.theme-option');

  // Add list
  const btnOpenAddList = document.getElementById('btn-open-add-list');
  const addListForm = document.getElementById('add-list-form');
  const newListTitle = document.getElementById('new-list-title');
  const btnConfirmAddList = document.getElementById('btn-confirm-add-list');
  const btnCancelAddList = document.getElementById('btn-cancel-add-list');

  // Table & Agenda Elements
  const tableBody = document.getElementById('table-body');
  const tableSearchInput = document.getElementById('table-search-input');
  const tableStats = document.getElementById('table-stats');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const agendaGridContainer = document.getElementById('agenda-grid-container');
  const agendaLegend = document.getElementById('agenda-legend');

  // Label Color Palette Map
  const LABEL_COLORS = {
    'orange': '#ff9f1a',
    'blue': '#0079bf',
    'pink': '#ff78cb',
    'yellow': '#f2d600',
    'purple': '#9b59b6',
    'green': '#61bd4f',
    'red': '#eb5a46',
    'sky': '#25BFFF',
    'violet': '#7657FF'
  };

  // Helper: show toast
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.style.display = 'block';
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.style.display = 'none';
    }, 3200);
  }

  // Log activity
  function logActivity(text) {
    const entry = {
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    activityHistory.unshift(entry);
    if (activityHistory.length > 30) activityHistory.pop();
    renderActivityFeed();
  }

  function renderActivityFeed() {
    if (!drawerActivityFeed) return;
    drawerActivityFeed.innerHTML = activityHistory.map(item => `
      <div class="activity-item">
        <p>${escapeHtml(item.text)}</p>
        <span class="activity-item-time">${item.time}</span>
      </div>
    `).join('');
  }

  // Load / Save State
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        boardData = JSON.parse(stored);
      } else {
        boardData = JSON.parse(JSON.stringify(INITIAL_BOARD_DATA));
      }
    } catch (e) {
      console.error('Failed to load board data from localStorage, using initial:', e);
      boardData = JSON.parse(JSON.stringify(INITIAL_BOARD_DATA));
    }

    // Apply saved background
    const savedBg = localStorage.getItem(BG_STORAGE_KEY);
    if (savedBg) {
      applyBackground(savedBg);
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boardData));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  function applyBackground(bgValue) {
    if (bgValue.startsWith('url') || bgValue.endsWith('.png') || bgValue.endsWith('.jpg')) {
      const url = bgValue.startsWith('url') ? bgValue : `url('${bgValue}')`;
      document.body.style.backgroundImage = url;
      document.body.style.backgroundColor = 'var(--caramelo-ink)';
    } else {
      document.body.style.backgroundImage = 'none';
      document.body.style.background = bgValue;
    }
    localStorage.setItem(BG_STORAGE_KEY, bgValue);

    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.bg === bgValue);
    });
  }

  // Utility: escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // Find Card and its List
  function findCardAndList(cardId) {
    for (const list of boardData.lists) {
      const card = list.cards.find(c => c.id === cardId);
      if (card) return { card, list };
    }
    return { card: null, list: null };
  }

  // Get label color hex
  function getLabelColor(colorName) {
    return LABEL_COLORS[colorName] || '#5e6c84';
  }

  // Card filter matcher
  function matchesFilter(card) {
    // If card is a column banner (name === '.'), don't filter out in kanban
    if (card.name === '.') return true;

    // Search filter
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const nameMatch = card.name.toLowerCase().includes(q);
      const descMatch = (card.desc || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }

    // Status filter
    if (activeStatusFilter === 'done' && !card.dueComplete) return false;
    if (activeStatusFilter === 'pending' && card.dueComplete) return false;

    // Label filters
    if (activeLabelFilters.size > 0) {
      const cardLabelNames = (card.labels || []).map(l => l.name || l.color);
      let hasMatch = false;
      for (const req of activeLabelFilters) {
        if (cardLabelNames.includes(req)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) return false;
    }

    return true;
  }

  // ==========================================================================
  // RENDER: Kanban View
  // ==========================================================================
  function renderKanban() {
    if (!listsContainer) return;
    listsContainer.innerHTML = '';

    boardData.lists.forEach(list => {
      const listEl = document.createElement('div');
      listEl.className = 'trello-list';
      listEl.dataset.listId = list.id;

      // Filtered cards
      const visibleCards = list.cards.filter(matchesFilter);
      const normalCardsCount = list.cards.filter(c => c.name !== '.').length;

      // List Header
      const headerEl = document.createElement('div');
      headerEl.className = 'list-header';
      headerEl.innerHTML = `
        <div class="list-title-box">
          <span class="list-title" contenteditable="true" spellcheck="false">${escapeHtml(list.name)}</span>
          <span class="list-card-count" title="${normalCardsCount} cartões">${normalCardsCount}</span>
        </div>
        <button class="list-menu-btn" title="Opções da lista" data-list-id="${list.id}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      `;

      // Header title edit event
      const titleSpan = headerEl.querySelector('.list-title');
      titleSpan.addEventListener('blur', () => {
        const newTitle = titleSpan.textContent.trim();
        if (newTitle && newTitle !== list.name) {
          list.name = newTitle;
          saveData();
          logActivity(`Lista renomeada para "${newTitle}"`);
        }
      });
      titleSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          titleSpan.blur();
        }
      });

      // List menu action
      headerEl.querySelector('.list-menu-btn').addEventListener('click', () => {
        showListContextMenu(list);
      });

      listEl.appendChild(headerEl);

      // List Banner (if present and not already displayed as card cover)
      if (list.banner) {
        const bannerEl = document.createElement('div');
        bannerEl.className = 'list-banner-card';
        bannerEl.innerHTML = `<img src="${list.banner}" alt="${escapeHtml(list.name)}" class="list-banner-img" />`;
        listEl.appendChild(bannerEl);
      }

      // Cards Container
      const cardsEl = document.createElement('div');
      cardsEl.className = 'list-cards';
      cardsEl.dataset.listId = list.id;

      // Enable Drag and Drop on list
      setupListDropZone(cardsEl, list.id);

      // Render Cards
      visibleCards.forEach(card => {
        // Skip '.' banner cards since we display the banner on top
        if (card.name === '.') return;

        const cardEl = renderCardElement(card, list.id);
        cardsEl.appendChild(cardEl);
      });

      listEl.appendChild(cardsEl);

      // List Footer (Add Card)
      const footerEl = document.createElement('div');
      footerEl.className = 'list-footer';
      footerEl.innerHTML = `
        <button class="btn-open-add-card">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Adicionar um cartão
        </button>
        <div class="add-card-form" style="display: none;">
          <textarea placeholder="Insira o título deste cartão..." rows="2"></textarea>
          <div class="form-actions">
            <button class="btn-confirm-add btn-save-card">Adicionar cartão</button>
            <button class="btn-cancel btn-close-add-card">&times;</button>
          </div>
        </div>
      `;

      const btnOpenAdd = footerEl.querySelector('.btn-open-add-card');
      const addForm = footerEl.querySelector('.add-card-form');
      const textarea = footerEl.querySelector('textarea');
      const btnSave = footerEl.querySelector('.btn-save-card');
      const btnClose = footerEl.querySelector('.btn-close-add-card');

      btnOpenAdd.addEventListener('click', () => {
        btnOpenAdd.style.display = 'none';
        addForm.style.display = 'flex';
        textarea.value = '';
        textarea.focus();
      });

      const handleAddCard = () => {
        const title = textarea.value.trim();
        if (title) {
          const newCard = {
            id: 'card_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: title,
            desc: '',
            labels: [],
            pos: (list.cards.length + 1) * 65536,
            dueComplete: false,
            checklists: [],
            comments: []
          };
          list.cards.push(newCard);
          saveData();
          logActivity(`Cartão "${title}" adicionado em ${list.name}`);
          renderKanban();
          showToast(`Cartão adicionado em ${list.name}!`);
        } else {
          addForm.style.display = 'none';
          btnOpenAdd.style.display = 'flex';
        }
      };

      btnSave.addEventListener('click', handleAddCard);
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleAddCard();
        } else if (e.key === 'Escape') {
          addForm.style.display = 'none';
          btnOpenAdd.style.display = 'flex';
        }
      });
      btnClose.addEventListener('click', () => {
        addForm.style.display = 'none';
        btnOpenAdd.style.display = 'flex';
      });

      listEl.appendChild(footerEl);
      listsContainer.appendChild(listEl);
    });
  }

  // Render single Card element
  function renderCardElement(card, listId) {
    const cardEl = document.createElement('div');
    cardEl.className = 'trello-card' + (card.dueComplete ? ' is-done' : '');
    cardEl.draggable = true;
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.listId = listId;

    // Labels
    let labelsHtml = '';
    if (card.labels && card.labels.length > 0) {
      labelsHtml = `<div class="card-labels">` +
        card.labels.map(lb => {
          const name = lb.name || lb.color || 'Etiqueta';
          const bg = getLabelColor(lb.color);
          return `<span class="card-label-badge" style="background-color: ${bg};">${escapeHtml(name)}</span>`;
        }).join('') + `</div>`;
    }

    // Badges (description, checklists, due)
    const hasDesc = card.desc && card.desc.trim().length > 0;
    const checklists = card.checklists || [];
    let totalItems = 0;
    let completedItems = 0;
    checklists.forEach(ch => {
      (ch.items || []).forEach(it => {
        totalItems++;
        if (it.done) completedItems++;
      });
    });

    let badgesHtml = '';
    if (hasDesc || totalItems > 0 || card.dueComplete) {
      badgesHtml = '<div class="card-badges">';
      if (card.dueComplete) {
        badgesHtml += `<span class="card-badge due-done" title="Concluído">✓ Concluído</span>`;
      }
      if (hasDesc) {
        badgesHtml += `<span class="card-badge" title="Este cartão tem uma descrição."><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></span>`;
      }
      if (totalItems > 0) {
        const isAllDone = completedItems === totalItems;
        badgesHtml += `<span class="card-badge ${isAllDone ? 'due-done' : ''}" title="Itens do checklist"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> ${completedItems}/${totalItems}</span>`;
      }
      badgesHtml += '</div>';
    }

    cardEl.innerHTML = `
      ${labelsHtml}
      <div class="card-title">${escapeHtml(card.name)}</div>
      ${badgesHtml}
    `;

    // Click opens modal
    cardEl.addEventListener('click', (e) => {
      if (cardEl.classList.contains('dragging')) return;
      openCardModal(card.id);
    });

    // Drag handlers
    cardEl.addEventListener('dragstart', (e) => {
      draggedCardId = card.id;
      sourceListId = listId;
      cardEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id);
    });

    cardEl.addEventListener('dragend', () => {
      cardEl.classList.remove('dragging');
      draggedCardId = null;
      sourceListId = null;
      document.querySelectorAll('.card-placeholder').forEach(p => p.remove());
      document.querySelectorAll('.trello-list').forEach(l => l.classList.remove('drag-over'));
    });

    return cardEl;
  }

  // Setup List Drag & Drop Zone
  function setupListDropZone(cardsContainer, listId) {
    cardsContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const parentList = cardsContainer.closest('.trello-list');
      if (parentList) parentList.classList.add('drag-over');

      // Compute placeholder placement
      const afterElement = getDragAfterElement(cardsContainer, e.clientY);
      let placeholder = cardsContainer.querySelector('.card-placeholder');
      if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'card-placeholder';
      }

      if (afterElement == null) {
        cardsContainer.appendChild(placeholder);
      } else {
        cardsContainer.insertBefore(placeholder, afterElement);
      }
    });

    cardsContainer.addEventListener('dragleave', (e) => {
      if (!cardsContainer.contains(e.relatedTarget)) {
        const parentList = cardsContainer.closest('.trello-list');
        if (parentList) parentList.classList.remove('drag-over');
      }
    });

    cardsContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const parentList = cardsContainer.closest('.trello-list');
      if (parentList) parentList.classList.remove('drag-over');

      if (!draggedCardId || !sourceListId) return;

      const { card, list: srcList } = findCardAndList(draggedCardId);
      const destList = boardData.lists.find(l => l.id === listId);

      if (!card || !srcList || !destList) return;

      // Remove from source list
      const srcIndex = srcList.cards.findIndex(c => c.id === card.id);
      if (srcIndex > -1) srcList.cards.splice(srcIndex, 1);

      // Determine new index from placeholder
      const placeholder = cardsContainer.querySelector('.card-placeholder');
      let targetIndex = destList.cards.length;

      if (placeholder) {
        const children = Array.from(cardsContainer.children).filter(el => !el.classList.contains('card-placeholder') && !el.classList.contains('dragging'));
        const pIndex = Array.from(cardsContainer.children).indexOf(placeholder);
        targetIndex = Math.min(pIndex, destList.cards.length);
        placeholder.remove();
      }

      // Insert card into destination list
      destList.cards.splice(targetIndex, 0, card);

      // Reassign positions
      destList.cards.forEach((c, idx) => {
        c.pos = (idx + 1) * 65536;
      });

      saveData();
      logActivity(`Cartão "${card.name}" movido para ${destList.name}`);
      renderKanban();
      showToast(`Cartão movido para ${destList.name}!`);
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.trello-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // List Context Menu / Options
  function showListContextMenu(list) {
    const action = prompt(
      `Opções para "${list.name}":\n\n1. Renomear lista\n2. Mover todas as tarefas para Concluído\n3. Limpar tarefas concluídas\n4. Excluir lista\n\nDigite o número da opção desejada:`,
      "1"
    );

    if (action === "1") {
      const newName = prompt("Novo nome da lista:", list.name);
      if (newName && newName.trim()) {
        list.name = newName.trim();
        saveData();
        renderKanban();
        showToast("Lista renomeada com sucesso!");
      }
    } else if (action === "2") {
      list.cards.forEach(c => c.dueComplete = true);
      saveData();
      renderKanban();
      showToast(`Todas as tarefas de ${list.name} foram marcadas como concluídas!`);
    } else if (action === "3") {
      list.cards = list.cards.filter(c => !c.dueComplete || c.name === '.');
      saveData();
      renderKanban();
      showToast(`Tarefas concluídas removidas de ${list.name}!`);
    } else if (action === "4") {
      if (confirm(`Tem certeza que deseja excluir a lista "${list.name}" e todas as suas tarefas?`)) {
        boardData.lists = boardData.lists.filter(l => l.id !== list.id);
        saveData();
        renderKanban();
        showToast(`Lista "${list.name}" excluída.`);
      }
    }
  }

  // ==========================================================================
  // CARD DETAILS MODAL
  // ==========================================================================
  function openCardModal(cardId) {
    const { card, list } = findCardAndList(cardId);
    if (!card) return;

    activeCardId = card.id;

    // Modal Title
    modalCardTitle.value = card.name;
    modalCardTitle.style.height = 'auto';
    setTimeout(() => {
      modalCardTitle.style.height = (modalCardTitle.scrollHeight || 30) + 'px';
    }, 0);
    modalCurrentListBtn.textContent = list.name;

    // Done Status Badge
    modalDoneBadge.style.display = card.dueComplete ? 'inline-block' : 'none';
    modalToggleDoneText.textContent = card.dueComplete ? 'Desmarcar Concluído' : 'Marcar como Concluído';

    // Banner / Cover preview
    if (card.coverImage || (card.name === '.' && list.banner)) {
      modalCoverPreview.style.display = 'block';
      modalCoverPreview.innerHTML = `<img src="${card.coverImage || list.banner}" alt="Capa" />`;
    } else {
      modalCoverPreview.style.display = 'none';
      modalCoverPreview.innerHTML = '';
    }

    // Active Labels
    renderModalLabels(card);

    // Description
    modalCardDesc.value = card.desc || '';

    // Checklists
    if (!card.checklists) card.checklists = [];
    renderModalChecklists(card);

    // Comments
    if (!card.comments) card.comments = [];
    renderModalComments(card);

    // Show Backdrop
    modalBackdrop.style.display = 'flex';
  }

  function closeCardModal() {
    modalBackdrop.style.display = 'none';
    activeCardId = null;
    labelPickerPopover.style.display = 'none';
    moveCardPopover.style.display = 'none';
    addItemBox.style.display = 'none';
  }

  function renderModalLabels(card) {
    if (!card.labels || card.labels.length === 0) {
      modalActiveLabels.innerHTML = '<span style="font-size: 12px; color: var(--trello-text-sub);">Nenhuma etiqueta selecionada</span>';
      return;
    }

    modalActiveLabels.innerHTML = card.labels.map(lb => {
      const bg = getLabelColor(lb.color);
      const name = lb.name || lb.color;
      return `<span class="modal-active-label-badge" style="background-color: ${bg};">${escapeHtml(name)}</span>`;
    }).join('');
  }

  function renderModalChecklists(card) {
    let allItems = [];
    card.checklists.forEach(ch => {
      if (ch.items) allItems.push(...ch.items);
    });

    if (allItems.length === 0) {
      modalChecklistItems.innerHTML = '<p style="font-size: 12px; color: var(--trello-text-sub);">Nenhum item na lista ainda.</p>';
      checklistPercent.textContent = '0%';
      checklistFill.style.width = '0%';
      return;
    }

    const doneCount = allItems.filter(it => it.done).length;
    const percent = Math.round((doneCount / allItems.length) * 100);
    checklistPercent.textContent = percent + '%';
    checklistFill.style.width = percent + '%';
    checklistFill.style.background = percent === 100 ? 'var(--caramelo-green)' : 'var(--caramelo-orange)';

    modalChecklistItems.innerHTML = allItems.map((item, idx) => `
      <div class="checklist-item ${item.done ? 'done' : ''}" data-item-idx="${idx}">
        <input type="checkbox" ${item.done ? 'checked' : ''} class="item-checkbox" />
        <span style="flex: 1; font-size: 13px;">${escapeHtml(item.text)}</span>
        <button class="btn-cancel btn-del-item" title="Excluir item" style="width:24px;height:24px;font-size:16px;">&times;</button>
      </div>
    `).join('');

    // Events
    modalChecklistItems.querySelectorAll('.checklist-item').forEach(el => {
      const idx = parseInt(el.dataset.itemIdx, 10);
      const checkbox = el.querySelector('.item-checkbox');
      const delBtn = el.querySelector('.btn-del-item');

      checkbox.addEventListener('change', () => {
        allItems[idx].done = checkbox.checked;
        saveData();
        renderModalChecklists(card);
        renderKanban();
      });

      delBtn.addEventListener('click', () => {
        allItems.splice(idx, 1);
        card.checklists[0].items = allItems;
        saveData();
        renderModalChecklists(card);
        renderKanban();
      });
    });
  }

  function renderModalComments(card) {
    if (!card.comments || card.comments.length === 0) {
      modalCommentsList.innerHTML = '<p style="font-size: 12px; color: var(--trello-text-sub);">Sem comentários ainda.</p>';
      return;
    }

    modalCommentsList.innerHTML = card.comments.map(c => `
      <div class="comment-bubble">
        <div class="comment-time">${c.time}</div>
        <p>${escapeHtml(c.text)}</p>
      </div>
    `).join('');
  }

  // Save Modal Changes
  modalCardTitle.addEventListener('input', () => {
    modalCardTitle.style.height = 'auto';
    modalCardTitle.style.height = modalCardTitle.scrollHeight + 'px';
  });

  modalCardTitle.addEventListener('blur', () => {
    if (!activeCardId) return;
    const { card } = findCardAndList(activeCardId);
    if (!card) return;
    const newName = modalCardTitle.value.trim();
    if (newName && newName !== card.name) {
      card.name = newName;
      saveData();
      renderKanban();
      logActivity(`Cartão atualizado para "${newName}"`);
    }
  });

  modalSaveDescBtn.addEventListener('click', () => {
    if (!activeCardId) return;
    const { card } = findCardAndList(activeCardId);
    if (!card) return;
    card.desc = modalCardDesc.value;
    saveData();
    renderKanban();
    showToast("Descrição atualizada!");
  });

  modalCancelDescBtn.addEventListener('click', () => {
    if (!activeCardId) return;
    const { card } = findCardAndList(activeCardId);
    if (!card) return;
    modalCardDesc.value = card.desc || '';
  });

  // Toggle Done
  modalBtnToggleDone.addEventListener('click', () => {
    if (!activeCardId) return;
    const { card } = findCardAndList(activeCardId);
    if (!card) return;

    card.dueComplete = !card.dueComplete;
    saveData();
    modalDoneBadge.style.display = card.dueComplete ? 'inline-block' : 'none';
    modalToggleDoneText.textContent = card.dueComplete ? 'Desmarcar Concluído' : 'Marcar como Concluído';
    renderKanban();
    showToast(card.dueComplete ? 'Tarefa concluída! ✓' : 'Tarefa marcada como pendente.');
  });

  // Duplicate Card
  modalBtnDuplicateCard.addEventListener('click', () => {
    if (!activeCardId) return;
    const { card, list } = findCardAndList(activeCardId);
    if (!card || !list) return;

    const copy = JSON.parse(JSON.stringify(card));
    copy.id = 'card_' + Date.now() + Math.random().toString(36).substr(2, 4);
    copy.name = copy.name + ' (Cópia)';
    copy.pos = (list.cards.length + 1) * 65536;

    list.cards.push(copy);
    saveData();
    renderKanban();
    closeCardModal();
    showToast('Cartão duplicado com sucesso!');
  });

  // Delete Card
  modalBtnDeleteCard.addEventListener('click', () => {
    if (!activeCardId) return;
    const { card, list } = findCardAndList(activeCardId);
    if (!card || !list) return;

    if (confirm(`Deseja realmente excluir o cartão "${card.name}"?`)) {
      list.cards = list.cards.filter(c => c.id !== card.id);
      saveData();
      renderKanban();
      closeCardModal();
      showToast('Cartão excluído.');
    }
  });

  // Add Checklist item in modal
  btnAddChecklistItem.addEventListener('click', () => {
    addItemBox.style.display = 'block';
    newChecklistItemInput.value = '';
    newChecklistItemInput.focus();
  });

  btnSaveChecklistItem.addEventListener('click', () => {
    const text = newChecklistItemInput.value.trim();
    if (!text || !activeCardId) return;

    const { card } = findCardAndList(activeCardId);
    if (!card) return;

    if (!card.checklists || card.checklists.length === 0) {
      card.checklists = [{ id: 'chk_1', name: 'Checklist', items: [] }];
    }
    card.checklists[0].items.push({ text, done: false });

    saveData();
    renderModalChecklists(card);
    renderKanban();
    newChecklistItemInput.value = '';
    addItemBox.style.display = 'none';
  });

  btnCancelChecklistItem.addEventListener('click', () => {
    addItemBox.style.display = 'none';
  });

  // Post Comment in modal
  modalPostCommentBtn.addEventListener('click', () => {
    const text = modalCommentInput.value.trim();
    if (!text || !activeCardId) return;

    const { card } = findCardAndList(activeCardId);
    if (!card) return;

    if (!card.comments) card.comments = [];
    card.comments.unshift({
      text,
      time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    });

    saveData();
    renderModalComments(card);
    modalCommentInput.value = '';
    showToast("Comentário registrado!");
  });

  // Label Picker Popover
  modalBtnManageLabels.addEventListener('click', (e) => {
    const rect = modalBtnManageLabels.getBoundingClientRect();
    labelPickerPopover.style.top = `${rect.bottom + 6}px`;
    labelPickerPopover.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
    labelPickerPopover.style.display = 'block';
    renderLabelPickerList();
  });

  closeLabelPicker.addEventListener('click', () => {
    labelPickerPopover.style.display = 'none';
  });

  function renderLabelPickerList() {
    if (!activeCardId) return;
    const { card } = findCardAndList(activeCardId);
    if (!card) return;

    const query = searchLabelsInput.value.toLowerCase();
    const allLabels = boardData.labels || [];
    const cardLabelIds = (card.labels || []).map(l => l.id || l.name);

    labelSelectionList.innerHTML = allLabels
      .filter(lb => !query || (lb.name && lb.name.toLowerCase().includes(query)))
      .map(lb => {
        const isChecked = cardLabelIds.includes(lb.id) || (card.labels || []).some(cl => cl.name === lb.name);
        const bg = getLabelColor(lb.color);
        return `
          <div class="label-pick-row" data-label-id="${lb.id}">
            <input type="checkbox" ${isChecked ? 'checked' : ''} class="label-toggle-check" />
            <div class="label-pick-color" style="background-color: ${bg};">
              <span>${escapeHtml(lb.name || lb.color)}</span>
              ${isChecked ? '<span>✓</span>' : ''}
            </div>
          </div>
        `;
      }).join('');

    labelSelectionList.querySelectorAll('.label-pick-row').forEach(row => {
      const labelId = row.dataset.labelId;
      const targetLabel = allLabels.find(l => l.id === labelId);
      const toggle = () => {
        if (!card.labels) card.labels = [];
        const existingIdx = card.labels.findIndex(l => l.id === labelId || l.name === targetLabel.name);
        if (existingIdx > -1) {
          card.labels.splice(existingIdx, 1);
        } else {
          card.labels.push({
            id: targetLabel.id,
            name: targetLabel.name,
            color: targetLabel.color
          });
        }
        saveData();
        renderLabelPickerList();
        renderModalLabels(card);
        renderKanban();
      };

      row.querySelector('.label-toggle-check').addEventListener('change', toggle);
      row.querySelector('.label-pick-color').addEventListener('click', toggle);
    });
  }

  searchLabelsInput.addEventListener('input', renderLabelPickerList);

  // Move Card Popover
  modalBtnMoveCard.addEventListener('click', () => {
    if (!activeCardId) return;
    const { card, list } = findCardAndList(activeCardId);
    if (!card) return;

    const rect = modalBtnMoveCard.getBoundingClientRect();
    moveCardPopover.style.top = `${rect.bottom + 6}px`;
    moveCardPopover.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
    moveCardPopover.style.display = 'block';

    moveTargetListSelect.innerHTML = boardData.lists.map(l => `
      <option value="${l.id}" ${l.id === list.id ? 'selected' : ''}>${escapeHtml(l.name)}</option>
    `).join('');
  });

  closeMovePopover.addEventListener('click', () => {
    moveCardPopover.style.display = 'none';
  });

  btnConfirmMove.addEventListener('click', () => {
    if (!activeCardId) return;
    const targetListId = moveTargetListSelect.value;
    const { card, list: srcList } = findCardAndList(activeCardId);
    const destList = boardData.lists.find(l => l.id === targetListId);

    if (card && srcList && destList && srcList.id !== destList.id) {
      srcList.cards = srcList.cards.filter(c => c.id !== card.id);
      destList.cards.push(card);
      card.pos = (destList.cards.length + 1) * 65536;
      saveData();
      renderKanban();
      modalCurrentListBtn.textContent = destList.name;
      moveCardPopover.style.display = 'none';
      showToast(`Cartão movido para ${destList.name}!`);
    }
  });

  modalCloseBtn.addEventListener('click', closeCardModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeCardModal();
  });

  // ==========================================================================
  // RENDER: Agenda Semanal / Timeline Grid View
  // ==========================================================================
  function renderAgenda() {
    if (!agendaGridContainer) return;

    // Define standard hours from 06:00 to 22:00
    const timeSlots = [
      '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
      '09:00', '09:30', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '17:30', '18:00',
      '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
      '21:30', '22:00'
    ];

    // Filter day lists
    const dayLists = boardData.lists.filter(l => l.name !== 'IMPORTANTE');

    // Populate Legend
    if (agendaLegend) {
      agendaLegend.innerHTML = (boardData.labels || []).map(lb => {
        const bg = getLabelColor(lb.color);
        return `<span class="card-label-badge" style="background-color: ${bg};">${escapeHtml(lb.name || lb.color)}</span>`;
      }).join('');
    }

    let tableHtml = `<table class="agenda-grid-table"><thead><tr><th class="time-col-header">Horário</th>`;
    dayLists.forEach(l => {
      tableHtml += `<th>${escapeHtml(l.name)}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    timeSlots.forEach(time => {
      tableHtml += `<tr><td class="time-cell">${time}</td>`;

      dayLists.forEach(list => {
        // Find cards matching this time slot approx
        const cardsForSlot = list.cards.filter(c => {
          if (c.name === '.') return false;
          if (!matchesFilter(c)) return false;
          const cleanName = c.name.toLowerCase();
          // Extract time prefix: "06h", "06:30", "08h", etc.
          const slotHour = time.split(':')[0];
          const slotMin = time.split(':')[1];

          if (slotMin === '00') {
            const pattern = new RegExp(`^0?${parseInt(slotHour, 10)}h(?!:)`);
            return pattern.test(cleanName) || cleanName.startsWith(time);
          } else {
            return cleanName.startsWith(time) || cleanName.startsWith(`0${parseInt(slotHour, 10)}:${slotMin}`);
          }
        });

        tableHtml += `<td>`;
        cardsForSlot.forEach(card => {
          const firstLabel = (card.labels && card.labels[0]) ? card.labels[0] : null;
          const borderColor = firstLabel ? getLabelColor(firstLabel.color) : 'var(--caramelo-orange)';
          tableHtml += `
            <div class="agenda-card-slot" data-card-id="${card.id}" style="border-left-color: ${borderColor};">
              ${escapeHtml(card.name)}
            </div>
          `;
        });
        tableHtml += `</td>`;
      });

      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;
    agendaGridContainer.innerHTML = tableHtml;

    // Attach click to open modal
    agendaGridContainer.querySelectorAll('.agenda-card-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        openCardModal(slot.dataset.cardId);
      });
    });
  }

  // ==========================================================================
  // RENDER: Table View
  // ==========================================================================
  function renderTable() {
    if (!tableBody) return;

    let allTasks = [];
    boardData.lists.forEach(l => {
      l.cards.forEach(c => {
        if (c.name !== '.' && matchesFilter(c)) {
          allTasks.push({ card: c, list: l });
        }
      });
    });

    if (tableStats) {
      tableStats.textContent = `Mostrando ${allTasks.length} de ${allTasks.length} blocos de rotina`;
    }

    tableBody.innerHTML = allTasks.map(({ card, list }) => {
      const labelsHtml = (card.labels || []).map(lb => {
        const bg = getLabelColor(lb.color);
        return `<span class="card-label-badge" style="background-color: ${bg}; font-size: 10px;">${escapeHtml(lb.name || lb.color)}</span>`;
      }).join(' ');

      return `
        <tr data-card-id="${card.id}">
          <td><input type="checkbox" ${card.dueComplete ? 'checked' : ''} class="table-done-check" /></td>
          <td class="table-task-name">${escapeHtml(card.name)}</td>
          <td><span class="table-list-badge">${escapeHtml(list.name)}</span></td>
          <td>${labelsHtml || '—'}</td>
          <td>
            <span class="table-status-tag ${card.dueComplete ? 'done' : 'pending'}">
              ${card.dueComplete ? '✓ Concluído' : 'Pendente'}
            </span>
          </td>
          <td>
            <button class="btn-cancel table-del-btn" title="Excluir">&times;</button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('tr').forEach(tr => {
      const cardId = tr.dataset.cardId;
      const { card, list } = findCardAndList(cardId);
      if (!card) return;

      tr.querySelector('.table-task-name').addEventListener('click', () => openCardModal(cardId));

      tr.querySelector('.table-done-check').addEventListener('change', (e) => {
        card.dueComplete = e.target.checked;
        saveData();
        renderTable();
        renderKanban();
      });

      tr.querySelector('.table-del-btn').addEventListener('click', () => {
        if (confirm(`Excluir "${card.name}"?`)) {
          list.cards = list.cards.filter(c => c.id !== card.id);
          saveData();
          renderTable();
          renderKanban();
          showToast('Tarefa excluída.');
        }
      });
    });
  }

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    let csv = 'ID,Tarefa,Lista/Dia,Etiquetas,Status\n';
    boardData.lists.forEach(l => {
      l.cards.forEach(c => {
        if (c.name === '.') return;
        const labels = (c.labels || []).map(lb => lb.name || lb.color).join('; ');
        const status = c.dueComplete ? 'Concluido' : 'Pendente';
        csv += `"${c.id}","${c.name.replace(/"/g, '""')}","${l.name}","${labels}","${status}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotina_superprodutiva_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exportado com sucesso!");
  });

  // ==========================================================================
  // RENDER: Analytics View
  // ==========================================================================
  function renderAnalytics() {
    let totalCards = 0;
    let keyCards = 0;
    let careCards = 0;
    let leisureCards = 0;
    let basicNeedsCards = 0;

    const dayCounts = {};

    boardData.lists.forEach(l => {
      if (l.name !== 'IMPORTANTE') dayCounts[l.name] = 0;

      l.cards.forEach(c => {
        if (c.name === '.') return;
        totalCards++;
        if (l.name !== 'IMPORTANTE') dayCounts[l.name] = (dayCounts[l.name] || 0) + 1;

        const labelNames = (c.labels || []).map(lb => (lb.name || '').toLowerCase());
        if (labelNames.includes('atividade-chave')) keyCards++;
        else if (labelNames.includes('autocuidado')) careCards++;
        else if (labelNames.includes('lazer')) leisureCards++;
        else if (labelNames.includes('necessidades básicas') || labelNames.includes('necessidades basicas')) basicNeedsCards++;
      });
    });

    document.getElementById('stat-total-cards').textContent = totalCards;
    document.getElementById('stat-key-cards').textContent = keyCards;
    document.getElementById('stat-care-cards').textContent = careCards;
    document.getElementById('stat-leisure-cards').textContent = leisureCards;

    // Progress Bars
    const categories = [
      { name: 'Atividades-Chave (Trabalho Estratégico)', count: keyCards, color: 'var(--caramelo-sky)' },
      { name: 'Autocuidado (Exercício, Saúde, Mente)', count: careCards, color: 'var(--caramelo-yellow)' },
      { name: 'Lazer e Descanso', count: leisureCards, color: 'var(--caramelo-violet)' },
      { name: 'Necessidades Básicas (Sono, Banho, Refeições)', count: basicNeedsCards, color: 'var(--caramelo-orange)' },
    ];

    const barsContainer = document.getElementById('category-progress-bars');
    if (barsContainer) {
      barsContainer.innerHTML = categories.map(cat => {
        const pct = totalCards > 0 ? Math.round((cat.count / totalCards) * 100) : 0;
        return `
          <div class="progress-bar-row">
            <div class="progress-bar-label">
              <span>${cat.name}</span>
              <span>${cat.count} blocos (${pct}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Day Breakdown Bars
    const dayBreakdownContainer = document.getElementById('day-breakdown-container');
    if (dayBreakdownContainer) {
      const maxCount = Math.max(...Object.values(dayCounts), 1);
      dayBreakdownContainer.innerHTML = Object.entries(dayCounts).map(([day, count]) => {
        const pct = Math.round((count / maxCount) * 100);
        return `
          <div class="day-bar-row">
            <span class="day-bar-name">${escapeHtml(day)}</span>
            <div class="day-bar-track">
              <div class="day-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="day-bar-count">${count}</span>
          </div>
        `;
      }).join('');
    }
  }

  // ==========================================================================
  // VIEW SWITCHER
  // ==========================================================================
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      activeView = view;

      viewTabs.forEach(t => t.classList.toggle('active', t === tab));
      viewContainers.forEach(c => {
        c.classList.toggle('active', c.id === `view-${view}`);
      });

      if (view === 'kanban') renderKanban();
      else if (view === 'agenda') renderAgenda();
      else if (view === 'table') renderTable();
      else if (view === 'analytics') renderAnalytics();
    });
  });

  // ==========================================================================
  // SEARCH & FILTERS
  // ==========================================================================
  function updateFilterBadge() {
    let count = 0;
    if (searchFilter) count++;
    if (activeLabelFilters.size > 0) count += activeLabelFilters.size;
    if (activeStatusFilter !== 'all') count++;

    if (count > 0) {
      activeFilterBadge.textContent = count;
      activeFilterBadge.style.display = 'inline-block';
    } else {
      activeFilterBadge.style.display = 'none';
    }
  }

  function applyFilters() {
    updateFilterBadge();
    if (activeView === 'kanban') renderKanban();
    else if (activeView === 'agenda') renderAgenda();
    else if (activeView === 'table') renderTable();
  }

  globalSearchInput.addEventListener('input', (e) => {
    searchFilter = e.target.value.trim();
    clearSearchBtn.style.display = searchFilter ? 'block' : 'none';
    applyFilters();
  });

  clearSearchBtn.addEventListener('click', () => {
    globalSearchInput.value = '';
    searchFilter = '';
    clearSearchBtn.style.display = 'none';
    applyFilters();
  });

  filterToggleBtn.addEventListener('click', () => {
    const isVisible = filterBar.style.display === 'block';
    filterBar.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) renderFilterChips();
  });

  function renderFilterChips() {
    if (!filterLabelChips) return;
    const labels = boardData.labels || [];
    filterLabelChips.innerHTML = labels.map(lb => {
      const name = lb.name || lb.color;
      const bg = getLabelColor(lb.color);
      const isSelected = activeLabelFilters.has(name);
      return `
        <button class="filter-chip ${isSelected ? 'active' : ''}" style="background-color: ${bg};" data-label-name="${escapeHtml(name)}">
          ${escapeHtml(name)}
        </button>
      `;
    }).join('');

    filterLabelChips.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.labelName;
        if (activeLabelFilters.has(name)) {
          activeLabelFilters.delete(name);
        } else {
          activeLabelFilters.add(name);
        }
        btn.classList.toggle('active', activeLabelFilters.has(name));
        applyFilters();
      });
    });
  }

  filterKeywordInput.addEventListener('input', (e) => {
    searchFilter = e.target.value.trim();
    globalSearchInput.value = searchFilter;
    clearSearchBtn.style.display = searchFilter ? 'block' : 'none';
    applyFilters();
  });

  statusFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = btn.dataset.status;
      applyFilters();
    });
  });

  clearAllFiltersBtn.addEventListener('click', () => {
    searchFilter = '';
    globalSearchInput.value = '';
    clearSearchBtn.style.display = 'none';
    filterKeywordInput.value = '';
    activeLabelFilters.clear();
    activeStatusFilter = 'all';
    statusFilterBtns.forEach(b => b.classList.toggle('active', b.dataset.status === 'all'));
    renderFilterChips();
    applyFilters();
    showToast("Filtros limpos!");
  });

  // Board Title Editing
  boardTitleEl.addEventListener('blur', () => {
    const newName = boardTitleEl.textContent.trim();
    if (newName && newName !== boardData.name) {
      boardData.name = newName;
      saveData();
      logActivity(`Nome do quadro alterado para "${newName}"`);
      showToast("Título do quadro atualizado!");
    }
  });

  // Star Favorite Toggle
  starToggleBtn.addEventListener('click', () => {
    isStarred = !isStarred;
    starToggleBtn.classList.toggle('active', isStarred);
    showToast(isStarred ? 'Quadro adicionado aos favoritos ⭐' : 'Removido dos favoritos.');
  });

  // Add List Form
  btnOpenAddList.addEventListener('click', () => {
    btnOpenAddList.style.display = 'none';
    addListForm.style.display = 'flex';
    newListTitle.value = '';
    newListTitle.focus();
  });

  const handleAddList = () => {
    const title = newListTitle.value.trim();
    if (title) {
      const newList = {
        id: 'list_' + Date.now(),
        name: title,
        pos: (boardData.lists.length + 1) * 65536,
        banner: null,
        cards: []
      };
      boardData.lists.push(newList);
      saveData();
      logActivity(`Nova lista criada: "${title}"`);
      renderKanban();
      addListForm.style.display = 'none';
      btnOpenAddList.style.display = 'flex';
      showToast(`Lista "${title}" criada com sucesso!`);
    } else {
      addListForm.style.display = 'none';
      btnOpenAddList.style.display = 'flex';
    }
  };

  btnConfirmAddList.addEventListener('click', handleAddList);
  newListTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddList();
    } else if (e.key === 'Escape') {
      addListForm.style.display = 'none';
      btnOpenAddList.style.display = 'flex';
    }
  });
  btnCancelAddList.addEventListener('click', () => {
    addListForm.style.display = 'none';
    btnOpenAddList.style.display = 'flex';
  });

  // Drawer Menu
  const toggleDrawer = () => {
    boardSideDrawer.classList.toggle('open');
  };
  boardMenuBtn.addEventListener('click', toggleDrawer);
  btnOpenMenuTop.addEventListener('click', toggleDrawer);
  drawerCloseBtn.addEventListener('click', toggleDrawer);

  // Background Theme Switcher
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const bg = opt.dataset.bg;
      applyBackground(bg);
      showToast("Tema de fundo atualizado!");
    });
  });

  // Export JSON
  btnExportBoardJson.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boardData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trello_rotina_superprodutiva_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Quadro exportado como JSON!");
  });

  // Import JSON
  btnImportBoardTrigger.addEventListener('click', () => {
    boardJsonFileInput.click();
  });

  boardJsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && imported.lists) {
          boardData = imported;
          saveData();
          renderKanban();
          boardTitleEl.textContent = boardData.name || 'Template de Rotina Superprodutiva';
          showToast("Quadro importado com sucesso!");
        } else {
          alert("Arquivo JSON inválido para formato Trello.");
        }
      } catch (err) {
        alert("Erro ao ler arquivo JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Reset Template to Canonical
  btnResetTemplate.addEventListener('click', () => {
    if (confirm("Restaurar o quadro para o estado original canônico do Template de Rotina Superprodutiva? Todas as alterações manuais serão resetadas.")) {
      localStorage.removeItem(STORAGE_KEY);
      boardData = JSON.parse(JSON.stringify(INITIAL_BOARD_DATA));
      saveData();
      boardTitleEl.textContent = boardData.name;
      renderKanban();
      showToast("Template original restaurado!");
    }
  });

  // Initial Boot
  function init() {
    loadData();
    boardTitleEl.textContent = boardData.name;
    renderKanban();
    logActivity('Quadro "Template de Rotina Superprodutiva" carregado');
  }

  init();
})();
