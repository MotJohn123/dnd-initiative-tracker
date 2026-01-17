// =====================================================
// D&D Encounter Manager - Main Application
// =====================================================

// State Management
const state = {
    encounters: [],
    currentEncounter: null,
    parsedCreatures: [],
    editingNpcIndex: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initEventListeners();
    renderEncountersList();
});

// =====================================================
// Storage Functions
// =====================================================
function loadFromStorage() {
    const saved = localStorage.getItem('dnd_encounters');
    if (saved) {
        state.encounters = JSON.parse(saved);
    }
}

function saveToStorage() {
    localStorage.setItem('dnd_encounters', JSON.stringify(state.encounters));
}

// =====================================================
// Event Listeners
// =====================================================
function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Create Encounter
    document.getElementById('create-encounter-btn').addEventListener('click', () => {
        openModal('create-encounter-modal');
    });

    document.getElementById('confirm-create-encounter').addEventListener('click', createEncounter);

    // Back to encounters
    document.getElementById('back-to-encounters').addEventListener('click', () => {
        state.currentEncounter = null;
        switchView('encounters');
    });

    // Add NPC
    document.getElementById('add-npc-btn').addEventListener('click', () => {
        state.editingNpcIndex = null;
        resetNpcForm();
        document.getElementById('npc-modal-title').textContent = 'Add NPC';
        openModal('npc-modal');
    });

    // Delete Encounter
    document.getElementById('delete-encounter-btn').addEventListener('click', deleteCurrentEncounter);

    // Confirm NPC
    document.getElementById('confirm-npc').addEventListener('click', saveNpc);

    // Confirm Rename
    document.getElementById('confirm-rename').addEventListener('click', confirmRename);

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Form tabs
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchFormTab(tabName);
        });
    });

    // Spellcaster checkbox
    document.getElementById('npc-is-spellcaster').addEventListener('change', (e) => {
        document.getElementById('spellcasting-options').classList.toggle('hidden', !e.target.checked);
    });

    // Legendary checkboxes
    document.getElementById('npc-has-legendary').addEventListener('change', (e) => {
        document.getElementById('legendary-options').classList.toggle('hidden', !e.target.checked);
    });

    document.getElementById('npc-has-legendary-resistance').addEventListener('change', (e) => {
        document.getElementById('legendary-resistance-options').classList.toggle('hidden', !e.target.checked);
    });

    // Dynamic list buttons
    document.getElementById('add-recharge-ability').addEventListener('click', () => {
        addDynamicListItem('recharge-abilities-list', 'recharge');
    });

    document.getElementById('add-limited-ability').addEventListener('click', () => {
        addDynamicListItem('limited-abilities-list', 'limited');
    });

    // CSV Import
    document.getElementById('parse-csv-btn').addEventListener('click', parseCSV);
    document.getElementById('clear-csv-btn').addEventListener('click', clearCSVImport);
    
    // File upload
    const fileInput = document.getElementById('csv-file-input');
    const uploadBtn = document.getElementById('upload-csv-btn');
    const fileUploadArea = document.querySelector('.file-upload-area');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleCSVFile(file);
        }
    });
    
    // Drag and drop support
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });
    
    fileUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
            handleCSVFile(file);
        } else {
            showToast('Please drop a CSV or TXT file', 'error');
        }
    });
}

// =====================================================
// View Management
// =====================================================
function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.getElementById(`${viewName}-view`).classList.add('active');

    // Render appropriate content
    if (viewName === 'encounters') {
        renderEncountersList();
    }
}

function switchFormTab(tabName) {
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.form-tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tab === tabName);
    });
}

// =====================================================
// Modal Management
// =====================================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// =====================================================
// Encounters Management
// =====================================================
function createEncounter() {
    const name = document.getElementById('encounter-name').value.trim();
    const description = document.getElementById('encounter-description').value.trim();

    if (!name) {
        showToast('Please enter an encounter name', 'error');
        return;
    }

    const encounter = {
        id: Date.now().toString(),
        name,
        description,
        npcs: [],
        createdAt: new Date().toISOString()
    };

    state.encounters.push(encounter);
    saveToStorage();
    closeAllModals();
    renderEncountersList();
    showToast('Encounter created!', 'success');

    // Reset form
    document.getElementById('encounter-name').value = '';
    document.getElementById('encounter-description').value = '';
}

function renderEncountersList() {
    const container = document.getElementById('encounters-list');

    if (state.encounters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-scroll"></i>
                <h3>No Encounters Yet</h3>
                <p>Create your first encounter to get started!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.encounters.map(enc => `
        <div class="encounter-card" data-id="${enc.id}">
            <h3>${escapeHtml(enc.name)}</h3>
            <p>${escapeHtml(enc.description) || 'No description'}</p>
            <div class="meta">
                <span><i class="fas fa-users"></i> ${enc.npcs.length} NPCs</span>
                <span>${formatDate(enc.createdAt)}</span>
            </div>
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.encounter-card').forEach(card => {
        card.addEventListener('click', () => {
            openEncounter(card.dataset.id);
        });
    });
}

function openEncounter(encounterId) {
    const encounter = state.encounters.find(e => e.id === encounterId);
    if (!encounter) return;

    state.currentEncounter = encounter;
    document.getElementById('encounter-title').textContent = encounter.name;

    // Hide nav, show encounter view
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById('encounter-view').classList.add('active');

    renderNpcs();
}

function deleteCurrentEncounter() {
    if (!state.currentEncounter) return;

    if (!confirm(`Are you sure you want to delete "${state.currentEncounter.name}"?`)) {
        return;
    }

    state.encounters = state.encounters.filter(e => e.id !== state.currentEncounter.id);
    state.currentEncounter = null;
    saveToStorage();
    switchView('encounters');
    showToast('Encounter deleted', 'success');
}

// =====================================================
// NPC Management
// =====================================================
function resetNpcForm() {
    // Reset all form fields
    document.getElementById('npc-name').value = '';
    document.getElementById('npc-copies').value = '1';
    document.getElementById('npc-hp').value = '';
    document.getElementById('npc-ac').value = '';
    document.getElementById('npc-size').value = 'Medium';
    document.getElementById('npc-type').value = '';
    document.getElementById('npc-cr').value = '';
    document.getElementById('npc-speed').value = '';
    document.getElementById('npc-str').value = '10';
    document.getElementById('npc-dex').value = '10';
    document.getElementById('npc-con').value = '10';
    document.getElementById('npc-int').value = '10';
    document.getElementById('npc-wis').value = '10';
    document.getElementById('npc-cha').value = '10';
    document.getElementById('npc-senses').value = '';
    document.getElementById('npc-saving-throws').value = '';
    document.getElementById('npc-skills').value = '';
    document.getElementById('npc-resistances').value = '';
    document.getElementById('npc-immunities').value = '';
    document.getElementById('npc-condition-immunities').value = '';
    document.getElementById('npc-traits').value = '';
    document.getElementById('npc-actions').value = '';
    document.getElementById('npc-bonus-actions').value = '';
    document.getElementById('npc-reactions').value = '';
    document.getElementById('npc-is-spellcaster').checked = false;
    document.getElementById('spellcasting-options').classList.add('hidden');
    document.getElementById('npc-spell-dc').value = '13';
    document.getElementById('npc-spell-attack').value = '5';
    document.getElementById('npc-spells').value = '';
    
    for (let i = 1; i <= 9; i++) {
        document.getElementById(`spell-slot-${i}`).value = '0';
    }

    document.getElementById('npc-has-legendary').checked = false;
    document.getElementById('legendary-options').classList.add('hidden');
    document.getElementById('npc-legendary-actions-count').value = '3';
    document.getElementById('npc-legendary-actions').value = '';
    document.getElementById('npc-has-legendary-resistance').checked = false;
    document.getElementById('legendary-resistance-options').classList.add('hidden');
    document.getElementById('npc-legendary-resistance-count').value = '3';
    document.getElementById('npc-lair-actions').value = '';

    // Clear dynamic lists
    document.getElementById('recharge-abilities-list').innerHTML = '';
    document.getElementById('limited-abilities-list').innerHTML = '';

    // Reset to first tab
    switchFormTab('basic');
}

function saveNpc() {
    const name = document.getElementById('npc-name').value.trim();
    const hpText = document.getElementById('npc-hp').value.trim();
    const acText = document.getElementById('npc-ac').value.trim();

    if (!name || !hpText || !acText) {
        showToast('Please fill in required fields (Name, HP, AC)', 'error');
        return;
    }

    // Parse HP
    const hpMatch = hpText.match(/^(\d+)/);
    const maxHp = hpMatch ? parseInt(hpMatch[1]) : 0;

    if (maxHp <= 0) {
        showToast('Invalid HP value', 'error');
        return;
    }

    // Parse AC
    const acMatch = acText.match(/^(\d+)/);
    const ac = acMatch ? parseInt(acMatch[1]) : 10;

    // Get spell slots
    const spellSlots = {};
    for (let i = 1; i <= 9; i++) {
        const value = parseInt(document.getElementById(`spell-slot-${i}`).value) || 0;
        if (value > 0) {
            spellSlots[i] = value;
        }
    }

    // Get recharge abilities
    const rechargeAbilities = [];
    document.querySelectorAll('#recharge-abilities-list .dynamic-list-item').forEach(item => {
        const nameInput = item.querySelector('input[name="ability-name"]');
        const rechargeInput = item.querySelector('input[name="recharge-on"]');
        if (nameInput && nameInput.value.trim()) {
            rechargeAbilities.push({
                name: nameInput.value.trim(),
                rechargeOn: parseInt(rechargeInput?.value) || 5
            });
        }
    });

    // Get limited use abilities
    const limitedAbilities = [];
    document.querySelectorAll('#limited-abilities-list .dynamic-list-item').forEach(item => {
        const nameInput = item.querySelector('input[name="ability-name"]');
        const usesInput = item.querySelector('input[name="max-uses"]');
        if (nameInput && nameInput.value.trim()) {
            limitedAbilities.push({
                name: nameInput.value.trim(),
                maxUses: parseInt(usesInput?.value) || 1
            });
        }
    });

    // Build NPC template
    const npcTemplate = {
        baseName: name,
        maxHp,
        hpFormula: hpText,
        ac,
        acText,
        size: document.getElementById('npc-size').value,
        type: document.getElementById('npc-type').value,
        cr: document.getElementById('npc-cr').value,
        speed: document.getElementById('npc-speed').value,
        stats: {
            str: parseInt(document.getElementById('npc-str').value) || 10,
            dex: parseInt(document.getElementById('npc-dex').value) || 10,
            con: parseInt(document.getElementById('npc-con').value) || 10,
            int: parseInt(document.getElementById('npc-int').value) || 10,
            wis: parseInt(document.getElementById('npc-wis').value) || 10,
            cha: parseInt(document.getElementById('npc-cha').value) || 10
        },
        senses: document.getElementById('npc-senses').value,
        savingThrows: document.getElementById('npc-saving-throws').value,
        skills: document.getElementById('npc-skills').value,
        resistances: document.getElementById('npc-resistances').value,
        immunities: document.getElementById('npc-immunities').value,
        conditionImmunities: document.getElementById('npc-condition-immunities').value,
        traits: document.getElementById('npc-traits').value,
        actions: document.getElementById('npc-actions').value,
        bonusActions: document.getElementById('npc-bonus-actions').value,
        reactions: document.getElementById('npc-reactions').value,
        isSpellcaster: document.getElementById('npc-is-spellcaster').checked,
        spellDc: parseInt(document.getElementById('npc-spell-dc').value) || 13,
        spellAttack: parseInt(document.getElementById('npc-spell-attack').value) || 5,
        spellSlots,
        spells: document.getElementById('npc-spells').value,
        hasLegendary: document.getElementById('npc-has-legendary').checked,
        legendaryActionsCount: parseInt(document.getElementById('npc-legendary-actions-count').value) || 3,
        legendaryActions: document.getElementById('npc-legendary-actions').value,
        hasLegendaryResistance: document.getElementById('npc-has-legendary-resistance').checked,
        legendaryResistanceCount: parseInt(document.getElementById('npc-legendary-resistance-count').value) || 3,
        lairActions: document.getElementById('npc-lair-actions').value,
        rechargeAbilities,
        limitedAbilities
    };

    // Create copies
    const copies = parseInt(document.getElementById('npc-copies').value) || 1;

    for (let i = 0; i < copies; i++) {
        const npc = createNpcInstance(npcTemplate, i + 1, copies);
        state.currentEncounter.npcs.push(npc);
    }

    saveToStorage();
    closeAllModals();
    renderNpcs();
    showToast(`Added ${copies} ${name}${copies > 1 ? 's' : ''}`, 'success');
}

function createNpcInstance(template, copyNum, totalCopies) {
    // Create spell slot state
    const spellSlotsState = {};
    for (const [level, max] of Object.entries(template.spellSlots)) {
        spellSlotsState[level] = { max, current: max };
    }

    // Create recharge abilities state
    const rechargeState = template.rechargeAbilities.map(ability => ({
        ...ability,
        available: true
    }));

    // Create limited abilities state
    const limitedState = template.limitedAbilities.map(ability => ({
        ...ability,
        currentUses: ability.maxUses
    }));

    return {
        id: Date.now().toString() + '-' + copyNum,
        ...template,
        displayName: totalCopies > 1 ? `${template.baseName} #${copyNum}` : template.baseName,
        currentHp: template.maxHp,
        tempHp: 0,
        spellSlotsState,
        rechargeState,
        limitedState,
        legendaryActionsRemaining: template.legendaryActionsCount,
        legendaryResistanceRemaining: template.legendaryResistanceCount
    };
}

function renderNpcs() {
    const container = document.getElementById('npcs-container');
    const npcs = state.currentEncounter?.npcs || [];

    if (npcs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <h3>No NPCs Yet</h3>
                <p>Add NPCs to this encounter to start tracking!</p>
            </div>
        `;
        return;
    }

    // Group NPCs by base name
    const groups = [];
    const groupMap = new Map();
    
    npcs.forEach((npc, index) => {
        const baseName = npc.baseName || npc.name;
        if (!groupMap.has(baseName)) {
            const group = { baseName, template: npc, instances: [] };
            groupMap.set(baseName, group);
            groups.push(group);
        }
        groupMap.get(baseName).instances.push({ npc, index });
    });

    // Render grouped table
    container.innerHTML = `
        <table class="npc-table">
            <thead>
                <tr>
                    <th class="col-name">Name</th>
                    <th class="col-type">Type</th>
                    <th class="col-ac">AC</th>
                    <th class="col-hp">HP</th>
                    <th class="col-trackers">Trackers</th>
                    <th class="col-actions"></th>
                </tr>
            </thead>
            <tbody>
                ${groups.map(group => renderNpcGroup(group)).join('')}
            </tbody>
        </table>
    `;

    attachNpcEventListeners();
}

function renderNpcGroup(group) {
    const { template, instances } = group;
    const isMultiple = instances.length > 1;
    
    // Render group header row for multi-instance groups
    let html = '';
    
    if (isMultiple) {
        html += `
            <tr class="group-header-row">
                <td colspan="6">
                    <div class="group-header">
                        <span class="group-name">${escapeHtml(template.baseName || template.name)}</span>
                        <span class="group-info">${template.size} ${template.type}</span>
                        <span class="group-count">×${instances.length}</span>
                        <button class="btn-icon btn-tracker" onclick="sendToTracker(${instances[0].index})" title="Send to Initiative Tracker"><i class="fas fa-crosshairs"></i></button>
                        <button class="btn-icon" onclick="duplicateNpc(${instances[0].index})" title="Add Copy"><i class="fas fa-plus"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    // Render each instance
    instances.forEach(({ npc, index }) => {
        html += renderNpcTableRow(npc, index, isMultiple);
    });
    
    return html;
}

function renderNpcTableRow(npc, index, isGrouped = false) {
    const hpPercent = Math.max(0, (npc.currentHp / npc.maxHp) * 100);
    const hpClass = hpPercent > 50 ? 'high' : hpPercent > 25 ? 'medium' : 'low';
    const isDead = npc.currentHp <= 0;

    return `
        <tr class="npc-row ${isDead ? 'dead' : ''} ${isGrouped ? 'grouped' : ''}" data-index="${index}">
            <td class="col-name">
                <span class="npc-name" onclick="startInlineRename(${index}, this)">${escapeHtml(npc.displayName)}</span>
            </td>
            <td class="col-type">
                ${isGrouped ? '' : `<span class="npc-type-info">${npc.size} ${npc.type}</span>`}
            </td>
            <td class="col-ac">
                ${isGrouped ? '' : `<span class="ac-value">${npc.ac}</span>`}
            </td>
            <td class="col-hp">
                <div class="hp-cell">
                    <div class="hp-bar-mini">
                        <div class="hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                        <span class="hp-text">${npc.currentHp}/${npc.maxHp}${npc.tempHp > 0 ? ` <span class="temp-hp">+${npc.tempHp}</span>` : ''}</span>
                    </div>
                    <div class="hp-buttons">
                        <button onclick="adjustHp(${index}, -5)">-5</button>
                        <button onclick="adjustHp(${index}, -1)">-1</button>
                        <input type="text" placeholder="±" onkeypress="handleHpInput(event, ${index})">
                        <button onclick="adjustHp(${index}, 1)">+1</button>
                        <button onclick="adjustHp(${index}, 5)">+5</button>
                        <input type="text" class="temp-hp-input" placeholder="THP" value="${npc.tempHp || ''}" onchange="setTempHp(${index}, this.value)" onclick="event.stopPropagation()">
                    </div>
                </div>
            </td>
            <td class="col-trackers">
                ${renderCompactTrackers(npc, index)}
            </td>
            <td class="col-actions">
                <button class="btn-icon btn-tracker" onclick="sendToTracker(${index})" title="Send to Initiative Tracker"><i class="fas fa-crosshairs"></i></button>
                <button class="btn-icon" onclick="showFullStats(${index})" title="View Stats"><i class="fas fa-book"></i></button>
                ${isGrouped ? '' : `<button class="btn-icon" onclick="duplicateNpc(${index})" title="Copy"><i class="fas fa-copy"></i></button>`}
                <button class="btn-icon btn-danger" onclick="deleteNpc(${index})" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
}

function renderCompactTrackers(npc, index) {
    let html = '';
    
    // Legendary Resistance
    if (npc.hasLegendaryResistance) {
        html += `<span class="tracker-inline" title="Legendary Resistance">
            <b>LR:</b>
            ${Array(npc.legendaryResistanceCount).fill(0).map((_, i) => `
                <span class="pip ${i >= npc.legendaryResistanceRemaining ? 'used' : ''}"
                     onclick="toggleLegendaryResistance(${index}, ${i})"></span>
            `).join('')}
        </span>`;
    }
    
    // Legendary Actions
    if (npc.hasLegendary) {
        html += `<span class="tracker-inline" title="Legendary Actions">
            <b>LA:</b>
            ${Array(npc.legendaryActionsCount).fill(0).map((_, i) => `
                <span class="pip leg ${i >= npc.legendaryActionsRemaining ? 'used' : ''}"
                     onclick="toggleLegendaryAction(${index}, ${i})"></span>
            `).join('')}
            <button class="btn-refill" onclick="refillLegendaryActions(${index})">↺</button>
        </span>`;
    }
    
    // Spell Slots
    if (npc.isSpellcaster && Object.keys(npc.spellSlotsState).length > 0) {
        html += `<span class="tracker-inline spell-slots" title="Spell Slots">
            <b>🔮</b>
            ${Object.entries(npc.spellSlotsState).map(([level, data]) => `
                <span class="slot-group">
                    <small>${level}:</small>${Array(data.max).fill(0).map((_, i) => `<span class="pip spell ${i >= data.current ? 'used' : ''}" onclick="toggleSpellSlot(${index}, ${level}, ${i})"></span>`).join('')}
                </span>
            `).join('')}
        </span>`;
    }
    
    // Recharge Abilities
    if (npc.rechargeState && npc.rechargeState.length > 0) {
        html += `<span class="tracker-inline">
            ${npc.rechargeState.map((ability, i) => `
                <button class="btn-recharge ${ability.available ? 'on' : 'off'}"
                        onclick="toggleRechargeAbility(${index}, ${i})" 
                        title="${escapeHtml(ability.name)} (${ability.rechargeOn}-6)">
                    ${ability.available ? '✓' : '✗'}
                </button>
            `).join('')}
        </span>`;
    }
    
    // Limited Use
    if (npc.limitedState && npc.limitedState.length > 0) {
        html += `<span class="tracker-inline">
            ${npc.limitedState.map((ability, i) => `
                <span class="limited-group" title="${escapeHtml(ability.name)}">
                    ${Array(ability.maxUses).fill(0).map((_, j) => `<span class="pip ${j >= ability.currentUses ? 'used' : ''}" onclick="toggleLimitedAbility(${index}, ${i}, ${j})"></span>`).join('')}
                </span>
            `).join('')}
        </span>`;
    }
    
    return html || '<span class="no-trackers">—</span>';
}

// Keep for backwards compatibility with single card view
function renderNpcCard(npc, index) {
    const hpPercent = Math.max(0, (npc.currentHp / npc.maxHp) * 100);
    const hpClass = hpPercent > 50 ? 'high' : hpPercent > 25 ? 'medium' : 'low';
    const isDead = npc.currentHp <= 0;

    return `
        <div class="npc-card ${isDead ? 'dead' : ''}" data-index="${index}">
            <div class="npc-card-header">
                <h3 onclick="showFullStats(${index})">
                    ${escapeHtml(npc.displayName)}
                    <span class="npc-type">${npc.size} ${npc.type}</span>
                </h3>
                <div class="npc-header-actions">
                    <button onclick="renameNpc(${index})" title="Rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="duplicateNpc(${index})" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="deleteNpc(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="npc-card-body">
                <!-- HP Section -->
                <div class="hp-section">
                    <div class="hp-bar-container">
                        <div class="hp-bar ${hpClass}" style="width: ${hpPercent}%"></div>
                        <span class="hp-text">${npc.currentHp} / ${npc.maxHp}</span>
                    </div>
                    <div class="hp-controls">
                        <button class="hp-btn minus" onclick="adjustHp(${index}, -1)">−</button>
                        <input type="text" placeholder="+10 or -5" onkeypress="handleHpInput(event, ${index})">
                        <button class="hp-btn plus" onclick="adjustHp(${index}, 1)">+</button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="quick-stat">
                        <i class="fas fa-shield-alt"></i>
                        <span>AC ${npc.ac}</span>
                    </div>
                    ${npc.cr ? `<div class="quick-stat"><i class="fas fa-skull"></i><span>CR ${npc.cr}</span></div>` : ''}
                    ${npc.speed ? `<div class="quick-stat"><i class="fas fa-running"></i><span>${npc.speed}</span></div>` : ''}
                </div>

                <!-- Stats Row -->
                <div class="stats-row-display">
                    ${renderStatItem('STR', npc.stats.str)}
                    ${renderStatItem('DEX', npc.stats.dex)}
                    ${renderStatItem('CON', npc.stats.con)}
                    ${renderStatItem('INT', npc.stats.int)}
                    ${renderStatItem('WIS', npc.stats.wis)}
                    ${renderStatItem('CHA', npc.stats.cha)}
                </div>

                <!-- Trackers Section -->
                ${renderTrackers(npc, index)}
            </div>
        </div>
    `;
}

function renderStatItem(label, value) {
    const mod = Math.floor((value - 10) / 2);
    const modStr = mod >= 0 ? `+${mod}` : mod.toString();
    return `
        <div class="stat-item">
            <div class="label">${label}</div>
            <div class="value">${value} (${modStr})</div>
        </div>
    `;
}

function renderTrackers(npc, index) {
    let html = '';

    // Spell Slots
    if (npc.isSpellcaster && Object.keys(npc.spellSlotsState).length > 0) {
        html += `
            <div class="trackers-section">
                <div class="tracker-group">
                    <h4><i class="fas fa-magic"></i> Spell Slots</h4>
                    <div class="spell-slots-tracker">
                        ${Object.entries(npc.spellSlotsState).map(([level, data]) => `
                            <div class="spell-slot-level">
                                <span class="level-label">${getOrdinal(level)}</span>
                                <div class="slot-pips">
                                    ${Array(data.max).fill(0).map((_, i) => `
                                        <div class="slot-pip ${i >= data.current ? 'used' : ''}"
                                             onclick="toggleSpellSlot(${index}, ${level}, ${i})"></div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Legendary Resistance
    if (npc.hasLegendaryResistance) {
        html += `
            <div class="trackers-section">
                <div class="tracker-group">
                    <h4><i class="fas fa-fist-raised"></i> Legendary Resistance</h4>
                    <div class="legendary-tracker">
                        <span class="tracker-label">Uses Remaining</span>
                        <div class="legendary-controls">
                            <div class="legendary-pips">
                                ${Array(npc.legendaryResistanceCount).fill(0).map((_, i) => `
                                    <div class="legendary-pip ${i >= npc.legendaryResistanceRemaining ? 'used' : ''}"
                                         onclick="toggleLegendaryResistance(${index}, ${i})">
                                        <i class="fas fa-star"></i>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Legendary Actions
    if (npc.hasLegendary) {
        html += `
            <div class="trackers-section">
                <div class="tracker-group">
                    <h4><i class="fas fa-crown"></i> Legendary Actions</h4>
                    <div class="legendary-tracker">
                        <span class="tracker-label">Actions Remaining</span>
                        <div class="legendary-controls">
                            <div class="legendary-pips">
                                ${Array(npc.legendaryActionsCount).fill(0).map((_, i) => `
                                    <div class="legendary-pip ${i >= npc.legendaryActionsRemaining ? 'used' : ''}"
                                         onclick="toggleLegendaryAction(${index}, ${i})">
                                        <i class="fas fa-bolt"></i>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="refill-btn" onclick="refillLegendaryActions(${index})">
                                <i class="fas fa-redo"></i> Refill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Recharge Abilities
    if (npc.rechargeState && npc.rechargeState.length > 0) {
        html += `
            <div class="trackers-section">
                <div class="tracker-group">
                    <h4><i class="fas fa-sync-alt"></i> Recharge Abilities</h4>
                    <div class="recharge-abilities-tracker">
                        ${npc.rechargeState.map((ability, i) => `
                            <div class="recharge-ability">
                                <span class="ability-name">${escapeHtml(ability.name)} (${ability.rechargeOn}-6)</span>
                                <button class="recharge-toggle ${ability.available ? 'available' : 'used'}"
                                        onclick="toggleRechargeAbility(${index}, ${i})">
                                    ${ability.available ? 'Available' : 'Used'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Limited Use Abilities
    if (npc.limitedState && npc.limitedState.length > 0) {
        html += `
            <div class="trackers-section">
                <div class="tracker-group">
                    <h4><i class="fas fa-hourglass-half"></i> Limited Use Abilities</h4>
                    <div class="limited-abilities-tracker">
                        ${npc.limitedState.map((ability, i) => `
                            <div class="limited-ability">
                                <span class="ability-name">${escapeHtml(ability.name)}</span>
                                <div class="ability-pips">
                                    ${Array(ability.maxUses).fill(0).map((_, j) => `
                                        <div class="ability-pip ${j >= ability.currentUses ? 'used' : ''}"
                                             onclick="toggleLimitedAbility(${index}, ${i}, ${j})"></div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

function attachNpcEventListeners() {
    // HP input handlers are attached inline
}

// =====================================================
// NPC Actions
// =====================================================
window.adjustHp = function(index, amount) {
    const npc = state.currentEncounter.npcs[index];
    
    // If taking damage (negative amount), temp HP absorbs it first
    if (amount < 0 && npc.tempHp > 0) {
        const damage = Math.abs(amount);
        if (npc.tempHp >= damage) {
            npc.tempHp -= damage;
            saveToStorage();
            renderNpcs();
            return;
        } else {
            const remainingDamage = damage - npc.tempHp;
            npc.tempHp = 0;
            npc.currentHp = Math.max(0, npc.currentHp - remainingDamage);
            saveToStorage();
            renderNpcs();
            return;
        }
    }
    
    npc.currentHp = Math.max(0, Math.min(npc.maxHp, npc.currentHp + amount));
    saveToStorage();
    renderNpcs();
};

window.setTempHp = function(index, value) {
    const npc = state.currentEncounter.npcs[index];
    const tempHp = parseInt(value) || 0;
    npc.tempHp = Math.max(0, tempHp);
    saveToStorage();
    renderNpcs();
};

window.handleHpInput = function(event, index) {
    if (event.key === 'Enter') {
        const input = event.target;
        const value = input.value.trim();
        const npc = state.currentEncounter.npcs[index];

        if (value.startsWith('+')) {
            const amount = parseInt(value.substring(1));
            if (!isNaN(amount)) {
                npc.currentHp = Math.min(npc.maxHp, npc.currentHp + amount);
            }
        } else if (value.startsWith('-')) {
            const damage = parseInt(value.substring(1));
            if (!isNaN(damage)) {
                // Temp HP absorbs damage first
                if (npc.tempHp > 0) {
                    if (npc.tempHp >= damage) {
                        npc.tempHp -= damage;
                    } else {
                        const remainingDamage = damage - npc.tempHp;
                        npc.tempHp = 0;
                        npc.currentHp = Math.max(0, npc.currentHp - remainingDamage);
                    }
                } else {
                    npc.currentHp = Math.max(0, npc.currentHp - damage);
                }
            }
        } else {
            const amount = parseInt(value);
            if (!isNaN(amount)) {
                npc.currentHp = Math.max(0, Math.min(npc.maxHp, amount));
            }
        }

        input.value = '';
        saveToStorage();
        renderNpcs();
    }
};

window.toggleSpellSlot = function(npcIndex, level, slotIndex) {
    const npc = state.currentEncounter.npcs[npcIndex];
    const slots = npc.spellSlotsState[level];
    
    // If clicking on an available slot, use it
    // If clicking on a used slot, restore it
    if (slotIndex < slots.current) {
        slots.current = slotIndex;
    } else {
        slots.current = slotIndex + 1;
    }
    
    saveToStorage();
    renderNpcs();
};

window.toggleLegendaryResistance = function(npcIndex, pipIndex) {
    const npc = state.currentEncounter.npcs[npcIndex];
    
    if (pipIndex < npc.legendaryResistanceRemaining) {
        npc.legendaryResistanceRemaining = pipIndex;
    } else {
        npc.legendaryResistanceRemaining = pipIndex + 1;
    }
    
    saveToStorage();
    renderNpcs();
};

window.toggleLegendaryAction = function(npcIndex, pipIndex) {
    const npc = state.currentEncounter.npcs[npcIndex];
    
    if (pipIndex < npc.legendaryActionsRemaining) {
        npc.legendaryActionsRemaining = pipIndex;
    } else {
        npc.legendaryActionsRemaining = pipIndex + 1;
    }
    
    saveToStorage();
    renderNpcs();
};

window.refillLegendaryActions = function(npcIndex) {
    const npc = state.currentEncounter.npcs[npcIndex];
    npc.legendaryActionsRemaining = npc.legendaryActionsCount;
    saveToStorage();
    renderNpcs();
};

window.toggleRechargeAbility = function(npcIndex, abilityIndex) {
    const npc = state.currentEncounter.npcs[npcIndex];
    npc.rechargeState[abilityIndex].available = !npc.rechargeState[abilityIndex].available;
    saveToStorage();
    renderNpcs();
};

window.toggleLimitedAbility = function(npcIndex, abilityIndex, pipIndex) {
    const npc = state.currentEncounter.npcs[npcIndex];
    const ability = npc.limitedState[abilityIndex];
    
    if (pipIndex < ability.currentUses) {
        ability.currentUses = pipIndex;
    } else {
        ability.currentUses = pipIndex + 1;
    }
    
    saveToStorage();
    renderNpcs();
};

window.renameNpc = function(index) {
    const npc = state.currentEncounter.npcs[index];
    document.getElementById('rename-input').value = npc.displayName;
    state.editingNpcIndex = index;
    openModal('rename-modal');
};

window.startInlineRename = function(index, element) {
    const npc = state.currentEncounter.npcs[index];
    const currentName = npc.displayName;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'inline-rename-input';
    
    // Replace span with input
    element.replaceWith(input);
    input.focus();
    input.select();
    
    // Handle save on enter or blur
    const saveName = () => {
        const newName = input.value.trim() || currentName;
        state.currentEncounter.npcs[index].displayName = newName;
        saveToStorage();
        renderNpcs();
    };
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveName();
        } else if (e.key === 'Escape') {
            renderNpcs(); // Cancel and re-render
        }
    });
    
    input.addEventListener('blur', saveName);
};

function confirmRename() {
    const newName = document.getElementById('rename-input').value.trim();
    if (!newName) {
        showToast('Please enter a name', 'error');
        return;
    }

    state.currentEncounter.npcs[state.editingNpcIndex].displayName = newName;
    saveToStorage();
    closeAllModals();
    renderNpcs();
}

window.duplicateNpc = function(index) {
    const npc = state.currentEncounter.npcs[index];
    const copy = JSON.parse(JSON.stringify(npc));
    copy.id = Date.now().toString();
    
    // Count existing copies with same baseName to get next number
    const sameTypeCount = state.currentEncounter.npcs.filter(n => n.baseName === npc.baseName).length;
    copy.displayName = `${npc.baseName} #${sameTypeCount + 1}`;
    copy.currentHp = copy.maxHp;
    
    // Reset trackers
    if (copy.spellSlotsState) {
        for (const level in copy.spellSlotsState) {
            copy.spellSlotsState[level].current = copy.spellSlotsState[level].max;
        }
    }
    if (copy.rechargeState) {
        copy.rechargeState.forEach(a => a.available = true);
    }
    if (copy.limitedState) {
        copy.limitedState.forEach(a => a.currentUses = a.maxUses);
    }
    copy.legendaryActionsRemaining = copy.legendaryActionsCount;
    copy.legendaryResistanceRemaining = copy.legendaryResistanceCount;

    // Insert after the last NPC of the same type
    const lastSameTypeIndex = state.currentEncounter.npcs.map((n, i) => ({ n, i })).filter(x => x.n.baseName === npc.baseName).pop().i;
    state.currentEncounter.npcs.splice(lastSameTypeIndex + 1, 0, copy);
    
    saveToStorage();
    renderNpcs();
    showToast(`Added ${copy.displayName}`, 'success');
};

window.deleteNpc = function(index) {
    const npc = state.currentEncounter.npcs[index];
    if (!confirm(`Delete ${npc.displayName}?`)) return;

    state.currentEncounter.npcs.splice(index, 1);
    saveToStorage();
    renderNpcs();
    showToast('NPC deleted', 'success');
};

window.showFullStats = function(index) {
    const npc = state.currentEncounter.npcs[index];
    document.getElementById('stats-modal-title').textContent = npc.displayName;

    const content = document.getElementById('full-stats-content');
    content.innerHTML = `
        <div class="stat-block">
            <div class="stat-block-header">
                <h3>${escapeHtml(npc.displayName)}</h3>
                <div class="subtitle">${npc.size} ${npc.type}${npc.cr ? `, CR ${npc.cr}` : ''}</div>
            </div>
            
            <p><strong>Armor Class:</strong> ${npc.acText}</p>
            <p><strong>Hit Points:</strong> ${npc.hpFormula}</p>
            <p><strong>Speed:</strong> ${npc.speed || '30 ft.'}</p>
            
            <div class="stats-grid">
                <div class="stat"><div class="stat-name">STR</div><div class="stat-value">${npc.stats.str} (${formatMod(npc.stats.str)})</div></div>
                <div class="stat"><div class="stat-name">DEX</div><div class="stat-value">${npc.stats.dex} (${formatMod(npc.stats.dex)})</div></div>
                <div class="stat"><div class="stat-name">CON</div><div class="stat-value">${npc.stats.con} (${formatMod(npc.stats.con)})</div></div>
                <div class="stat"><div class="stat-name">INT</div><div class="stat-value">${npc.stats.int} (${formatMod(npc.stats.int)})</div></div>
                <div class="stat"><div class="stat-name">WIS</div><div class="stat-value">${npc.stats.wis} (${formatMod(npc.stats.wis)})</div></div>
                <div class="stat"><div class="stat-name">CHA</div><div class="stat-value">${npc.stats.cha} (${formatMod(npc.stats.cha)})</div></div>
            </div>
            
            ${npc.savingThrows ? `<p><strong>Saving Throws:</strong> ${escapeHtml(npc.savingThrows)}</p>` : ''}
            ${npc.skills ? `<p><strong>Skills:</strong> ${escapeHtml(npc.skills)}</p>` : ''}
            ${npc.resistances ? `<p><strong>Damage Resistances:</strong> ${escapeHtml(npc.resistances)}</p>` : ''}
            ${npc.immunities ? `<p><strong>Damage Immunities:</strong> ${escapeHtml(npc.immunities)}</p>` : ''}
            ${npc.conditionImmunities ? `<p><strong>Condition Immunities:</strong> ${escapeHtml(npc.conditionImmunities)}</p>` : ''}
            ${npc.senses ? `<p><strong>Senses:</strong> ${escapeHtml(npc.senses)}</p>` : ''}
            
            ${npc.traits ? `<h4>Traits</h4><p>${formatMultiline(npc.traits)}</p>` : ''}
            ${npc.actions ? `<h4>Actions</h4><p>${formatMultiline(npc.actions)}</p>` : ''}
            ${npc.bonusActions ? `<h4>Bonus Actions</h4><p>${formatMultiline(npc.bonusActions)}</p>` : ''}
            ${npc.reactions ? `<h4>Reactions</h4><p>${formatMultiline(npc.reactions)}</p>` : ''}
            ${npc.legendaryActions ? `<h4>Legendary Actions</h4><p>${formatMultiline(npc.legendaryActions)}</p>` : ''}
            ${npc.lairActions ? `<h4>Lair Actions</h4><p>${formatMultiline(npc.lairActions)}</p>` : ''}
            
            ${npc.isSpellcaster ? `
                <h4>Spellcasting</h4>
                <p><strong>Spell Save DC:</strong> ${npc.spellDc}, <strong>Spell Attack:</strong> +${npc.spellAttack}</p>
                ${npc.spells ? `<p>${formatMultiline(npc.spells)}</p>` : ''}
            ` : ''}
        </div>
    `;

    openModal('stats-modal');
};

// =====================================================
// CSV Import Functions
// =====================================================
function handleCSVFile(file) {
    const fileNameSpan = document.getElementById('selected-file-name');
    fileNameSpan.textContent = file.name;
    fileNameSpan.classList.add('has-file');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        document.getElementById('csv-input').value = content;
        showToast(`Loaded ${file.name}`, 'success');
        // Auto-parse after loading
        parseCSV();
    };
    reader.onerror = () => {
        showToast('Error reading file', 'error');
    };
    reader.readAsText(file);
}

function clearCSVImport() {
    document.getElementById('csv-input').value = '';
    document.getElementById('parsed-creatures').innerHTML = '';
    document.getElementById('csv-file-input').value = '';
    const fileNameSpan = document.getElementById('selected-file-name');
    fileNameSpan.textContent = 'No file selected';
    fileNameSpan.classList.remove('has-file');
    state.parsedCreatures = [];
}

function parseCSV() {
    const csvText = document.getElementById('csv-input').value.trim();
    if (!csvText) {
        showToast('Please paste CSV data first', 'error');
        return;
    }

    try {
        const creatures = parseCSVData(csvText);
        state.parsedCreatures = creatures;
        renderParsedCreatures();
        showToast(`Parsed ${creatures.length} creature(s)`, 'success');
    } catch (error) {
        console.error('CSV Parse Error:', error);
        showToast('Error parsing CSV: ' + error.message, 'error');
    }
}

function parseCSVData(csvText) {
    // Normalize line endings and fix common encoding issues
    let normalized = csvText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Fix common encoding issues from 5eTools
        .replace(/â€"/g, '–')  // en-dash
        .replace(/â€""/g, '—') // em-dash
        .replace(/Â /g, ' ')   // non-breaking space
        .replace(/â€™/g, "'")  // smart quote
        .replace(/â€œ/g, '"')  // smart quote
        .replace(/â€/g, '"');  // smart quote
    
    // Parse the entire CSV properly handling multi-line quoted fields
    const rows = parseFullCSV(normalized);
    
    if (rows.length < 2) {
        throw new Error('CSV must have a header and at least one data row');
    }

    // Parse header
    const headers = rows[0];
    
    // Map headers to indices (normalize header names)
    const headerMap = {};
    headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
        headerMap[normalizedHeader] = index;
    });

    console.log('Parsed headers:', headers);
    console.log('Header map:', headerMap);

    // Parse data rows
    const creatures = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        if (values.length < 3) continue; // Skip incomplete rows

        const creature = extractCreatureFromCSV(values, headerMap);
        if (creature && creature.name) {
            creatures.push(creature);
            console.log('Parsed creature:', creature.name);
        }
    }

    return creatures;
}

function parseFullCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote
                    currentField += '"';
                    i++;
                } else {
                    // End of quoted field
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                // Start of quoted field
                inQuotes = true;
            } else if (char === ',') {
                // End of field
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n') {
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.some(field => field !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }
    
    // Don't forget the last field/row
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field !== '')) {
        rows.push(currentRow);
    }
    
    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

function extractCreatureFromCSV(values, headerMap) {
    const get = (key) => {
        const index = headerMap[key];
        if (index === undefined) return '';
        const value = values[index] || '';
        // Clean up tab separators used for line breaks in 5eTools exports
        return value.replace(/\t\t/g, '\n\n').replace(/\t/g, '\n');
    };

    const name = get('name');
    if (!name) return null;

    // Parse HP - handle formats like "195 (17d12 + 85)" or just "195"
    const hpText = get('hp');
    const hpMatch = hpText.match(/^(\d+)/);
    const maxHp = hpMatch ? parseInt(hpMatch[1]) : 10;

    // Parse AC - handle formats like "19" or "18 (natural armor)"
    const acText = get('ac');
    const acMatch = acText.match(/^(\d+)/);
    const ac = acMatch ? parseInt(acMatch[1]) : 10;

    // Get text fields
    const traits = get('traits');
    const actions = get('actions');
    const legendaryActionsText = get('legendaryactions');
    const bonusActions = get('bonusactions');
    const reactions = get('reactions');

    // Check for Legendary Resistance in traits
    const legResMatch = traits.match(/Legendary Resistance\s*\((\d+)\/Day/i);
    const hasLegendaryResistance = !!legResMatch;
    const legendaryResistanceCount = legResMatch ? parseInt(legResMatch[1]) : 3;

    // Count legendary actions (default 3 if has legendary actions)
    const hasLegendary = !!legendaryActionsText && legendaryActionsText.trim().length > 0;
    let legendaryActionsCount = 3;
    const legActionsMatch = legendaryActionsText.match(/can take (\d+) legendary action/i);
    if (legActionsMatch) {
        legendaryActionsCount = parseInt(legActionsMatch[1]);
    }

    // Check for recharge abilities in actions (e.g., "Acid Breath (Recharge 5–6)" or "Recharge 5-6")
    const rechargeAbilities = [];
    const rechargeRegex = /([A-Za-z][^.]*?)\s*\(Recharge\s*(\d+)[–\-—]6\)/gi;
    let rechargeMatch;
    const allText = actions + ' ' + bonusActions;
    while ((rechargeMatch = rechargeRegex.exec(allText)) !== null) {
        const abilityName = rechargeMatch[1].trim();
        if (!rechargeAbilities.find(a => a.name === abilityName)) {
            rechargeAbilities.push({
                name: abilityName,
                rechargeOn: parseInt(rechargeMatch[2])
            });
        }
    }

    // Check for limited use abilities (X/Day patterns)
    const limitedAbilities = [];
    
    // Pattern 1: "1/day each: Spell1, Spell2" or "2/day: Ability"
    const limitedRegex1 = /(\d+)\/[Dd]ay(?:\s+each)?[:\s]+([^.]+?)(?:\.|$|\n)/g;
    let limitedMatch;
    const spellsText = actions + ' ' + traits;
    while ((limitedMatch = limitedRegex1.exec(spellsText)) !== null) {
        const uses = parseInt(limitedMatch[1]);
        const itemList = limitedMatch[2].split(/,|;/);
        itemList.forEach(item => {
            const itemName = item.trim().replace(/\([^)]*\)/g, '').trim();
            if (itemName && itemName.length > 1 && !limitedAbilities.find(a => a.name.includes(itemName))) {
                limitedAbilities.push({
                    name: `${itemName}`,
                    maxUses: uses
                });
            }
        });
    }

    // Pattern 2: "Ability (3/Day)" format in traits
    const limitedRegex2 = /([A-Za-z][^.]*?)\s*\((\d+)\/[Dd]ay\)/g;
    while ((limitedMatch = limitedRegex2.exec(traits)) !== null) {
        const abilityName = limitedMatch[1].trim();
        const uses = parseInt(limitedMatch[2]);
        if (!limitedAbilities.find(a => a.name === abilityName) && 
            !abilityName.toLowerCase().includes('legendary resistance')) {
            limitedAbilities.push({
                name: abilityName,
                maxUses: uses
            });
        }
    }

    // Check for spellcasting - look in both actions and traits
    const allSpellText = (actions + ' ' + traits).toLowerCase();
    const isSpellcaster = allSpellText.includes('spellcasting') || 
                          allSpellText.includes('spell save dc') ||
                          allSpellText.includes('spell attack') ||
                          allSpellText.includes('slots)');
    
    // Extract spell save DC
    const spellDcMatch = (actions + ' ' + traits).match(/spell save DC\s*(\d+)/i);
    const spellDc = spellDcMatch ? parseInt(spellDcMatch[1]) : 13;

    // Extract spell attack bonus
    const spellAtkMatch = (actions + ' ' + traits).match(/\+(\d+)\s*to hit with spell/i);
    const spellAttack = spellAtkMatch ? parseInt(spellAtkMatch[1]) : 5;

    // Extract spell slots if present (e.g., "1st level (4 slots): ..." or "1st-level (4 slots)")
    const spellSlots = {};
    // More flexible regex to handle various formats from 5eTools exports
    const slotRegex = /(\d+)(?:st|nd|rd|th)[-\s]*level\s*\((\d+)\s*slots?\)/gi;
    let slotMatch;
    const spellSourceText = actions + ' ' + traits;
    while ((slotMatch = slotRegex.exec(spellSourceText)) !== null) {
        const level = parseInt(slotMatch[1]);
        const slots = parseInt(slotMatch[2]);
        if (level >= 1 && level <= 9) {
            spellSlots[level] = slots;
        }
    }
    
    // Debug log for spell slots
    if (isSpellcaster) {
        console.log('Spellcaster detected:', name);
        console.log('Spell slots found:', spellSlots);
    }

    // Extract spells text - look for Spellcasting block in either actions or traits
    let spells = '';
    const spellsMatch = (traits + ' ' + actions).match(/spellcasting[^]*?(?=\n\n|$)/i);
    if (spellsMatch) {
        spells = spellsMatch[0];
    }

    return {
        name,
        maxHp,
        hpFormula: hpText,
        ac,
        acText,
        size: get('size'),
        type: get('type'),
        cr: get('cr').replace(/[^\d\/]+XP.*$/i, '').trim(), // Clean up CR like "14 (11 500 XP)"
        speed: get('speed'),
        stats: {
            str: parseInt(get('strength')) || 10,
            dex: parseInt(get('dexterity')) || 10,
            con: parseInt(get('constitution')) || 10,
            int: parseInt(get('intelligence')) || 10,
            wis: parseInt(get('wisdom')) || 10,
            cha: parseInt(get('charisma')) || 10
        },
        senses: get('senses'),
        savingThrows: get('savingthrows'),
        skills: get('skills'),
        resistances: get('damageresistances'),
        immunities: get('damageimmunities'),
        conditionImmunities: get('conditionimmunities'),
        traits,
        actions,
        bonusActions,
        reactions,
        legendaryActions: legendaryActionsText,
        lairActions: get('lairactions'),
        isSpellcaster,
        spellDc,
        spellAttack,
        spellSlots,
        spells,
        hasLegendary,
        legendaryActionsCount,
        hasLegendaryResistance,
        legendaryResistanceCount,
        rechargeAbilities,
        limitedAbilities
    };
}

function renderParsedCreatures() {
    const container = document.getElementById('parsed-creatures');
    
    if (state.parsedCreatures.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Build encounter options
    const encounterOptions = state.encounters.map(enc => 
        `<option value="${enc.id}">${escapeHtml(enc.name)} (${enc.npcs.length} NPCs)</option>`
    ).join('');

    container.innerHTML = `
        <h3 style="margin-bottom: 15px; color: var(--primary);">Parsed Creatures (${state.parsedCreatures.length})</h3>
        
        <!-- Import destination controls -->
        <div class="import-destination">
            <div class="destination-option">
                <button class="btn btn-primary" onclick="addAllToNewEncounter()">
                    <i class="fas fa-plus-circle"></i> Create New Encounter
                </button>
                <input type="text" id="new-encounter-name" placeholder="Encounter name..." class="new-encounter-input">
            </div>
            <div class="destination-divider">or add to existing:</div>
            <div class="destination-option">
                <select id="target-encounter-select" class="encounter-select">
                    <option value="">-- Select Encounter --</option>
                    ${encounterOptions}
                </select>
                <button class="btn btn-secondary" onclick="addAllToSelectedEncounter()">
                    <i class="fas fa-folder-plus"></i> Add to Selected
                </button>
            </div>
        </div>
        
        <!-- Creatures list -->
        <div class="parsed-creatures-grid">
            ${state.parsedCreatures.map((creature, index) => {
                // Build feature badges
                const features = [];
                if (creature.isSpellcaster) features.push('<span class="feature-badge spellcaster">🔮</span>');
                if (creature.hasLegendary) features.push('<span class="feature-badge legendary">👑</span>');
                if (creature.hasLegendaryResistance) features.push(`<span class="feature-badge resistance">💪${creature.legendaryResistanceCount}</span>`);
                if (creature.rechargeAbilities.length > 0) features.push(`<span class="feature-badge recharge">🔄${creature.rechargeAbilities.length}</span>`);
                if (creature.limitedAbilities.length > 0) features.push(`<span class="feature-badge limited">⏳${creature.limitedAbilities.length}</span>`);
                
                return `
                <div class="parsed-creature-row">
                    <div class="creature-info">
                        <span class="creature-name">${escapeHtml(creature.name)}</span>
                        <span class="creature-details">${creature.size} ${creature.type} • CR ${creature.cr} • HP ${creature.maxHp} • AC ${creature.ac}</span>
                        ${features.length > 0 ? `<span class="feature-badges-inline">${features.join('')}</span>` : ''}
                    </div>
                    <div class="creature-controls">
                        <label>Qty:</label>
                        <input type="number" class="copy-count-input" id="copy-count-${index}" value="1" min="1" max="20">
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

window.addAllToNewEncounter = function() {
    if (state.parsedCreatures.length === 0) return;

    // Get custom name or generate default
    const nameInput = document.getElementById('new-encounter-name');
    const customName = nameInput ? nameInput.value.trim() : '';
    const encounterName = customName || `Imported Encounter (${state.parsedCreatures.length} types)`;

    // Create new encounter
    const encounter = {
        id: Date.now().toString(),
        name: encounterName,
        description: 'Created from 5eTools import',
        npcs: [],
        createdAt: new Date().toISOString()
    };

    // Add all creatures with their copy counts
    state.parsedCreatures.forEach((creature, index) => {
        const copyCountInput = document.getElementById(`copy-count-${index}`);
        const copies = copyCountInput ? parseInt(copyCountInput.value) || 1 : 1;
        
        const template = {
            baseName: creature.name,
            ...creature,
            spellSlots: creature.spellSlots || {}
        };

        for (let i = 0; i < copies; i++) {
            const npc = createNpcInstance(template, i + 1, copies);
            encounter.npcs.push(npc);
        }
    });

    state.encounters.push(encounter);
    state.currentEncounter = encounter;
    saveToStorage();

    // Open the encounter
    openEncounter(encounter.id);
    showToast(`Created "${encounterName}" with ${encounter.npcs.length} NPCs`, 'success');
};

window.addAllToSelectedEncounter = function() {
    if (state.parsedCreatures.length === 0) return;
    
    const select = document.getElementById('target-encounter-select');
    const encounterId = select ? select.value : '';
    
    if (!encounterId) {
        showToast('Please select an encounter first', 'error');
        return;
    }
    
    const encounter = state.encounters.find(e => e.id === encounterId);
    if (!encounter) {
        showToast('Encounter not found', 'error');
        return;
    }

    let totalAdded = 0;
    
    // Add all creatures with their copy counts
    state.parsedCreatures.forEach((creature, index) => {
        const copyCountInput = document.getElementById(`copy-count-${index}`);
        const copies = copyCountInput ? parseInt(copyCountInput.value) || 1 : 1;
        
        const template = {
            baseName: creature.name,
            ...creature,
            spellSlots: creature.spellSlots || {}
        };

        for (let i = 0; i < copies; i++) {
            const npc = createNpcInstance(template, i + 1, copies);
            encounter.npcs.push(npc);
            totalAdded++;
        }
    });

    saveToStorage();
    showToast(`Added ${totalAdded} NPCs to "${encounter.name}"`, 'success');
    
    // Update select to show new NPC count
    renderParsedCreatures();
};

window.addParsedCreatureToEncounter = function(index) {
    const creature = state.parsedCreatures[index];
    const copyCountInput = document.getElementById(`copy-count-${index}`);
    const copies = copyCountInput ? parseInt(copyCountInput.value) || 1 : 1;
    
    // If no encounter is open, prompt to select or create one
    if (!state.currentEncounter) {
        if (state.encounters.length === 0) {
            // Create a new encounter
            const encounter = {
                id: Date.now().toString(),
                name: 'New Encounter',
                description: '',
                npcs: [],
                createdAt: new Date().toISOString()
            };
            state.encounters.push(encounter);
            state.currentEncounter = encounter;
        } else {
            showToast('Please select an encounter or create a new one', 'error');
            return;
        }
    }

    // Prepare NPC template
    const template = {
        baseName: creature.name,
        ...creature,
        spellSlots: creature.spellSlots || {}
    };

    // Create requested number of copies
    for (let i = 0; i < copies; i++) {
        const npc = createNpcInstance(template, i + 1, copies);
        state.currentEncounter.npcs.push(npc);
    }
    
    saveToStorage();
    showToast(`Added ${copies}x ${creature.name} to encounter`, 'success');
};

window.addAllToCurrentEncounter = function() {
    if (state.parsedCreatures.length === 0) return;
    
    if (!state.currentEncounter) {
        showToast('Please open an encounter first', 'error');
        return;
    }

    state.parsedCreatures.forEach((creature, index) => {
        const copyCountInput = document.getElementById(`copy-count-${index}`);
        const copies = copyCountInput ? parseInt(copyCountInput.value) || 1 : 1;
        
        const template = {
            baseName: creature.name,
            ...creature,
            spellSlots: creature.spellSlots || {}
        };

        for (let i = 0; i < copies; i++) {
            const npc = createNpcInstance(template, i + 1, copies);
            state.currentEncounter.npcs.push(npc);
        }
    });

    saveToStorage();
    renderNpcs();
    showToast(`Added ${state.parsedCreatures.length} creature types to encounter`, 'success');
};

// Keep old function for backwards compatibility
window.addAllParsedCreatures = window.addAllToNewEncounter;

window.addAllParsedCreatures = function() {
    if (state.parsedCreatures.length === 0) return;

    // Create new encounter
    const encounter = {
        id: Date.now().toString(),
        name: `Imported Encounter (${state.parsedCreatures.length} creatures)`,
        description: 'Created from 5eTools import',
        npcs: [],
        createdAt: new Date().toISOString()
    };

    // Add all creatures
    state.parsedCreatures.forEach(creature => {
        const template = {
            baseName: creature.name,
            ...creature,
            spellSlots: creature.spellSlots || {}
        };
        const npc = createNpcInstance(template, 1, 1);
        encounter.npcs.push(npc);
    });

    state.encounters.push(encounter);
    state.currentEncounter = encounter;
    saveToStorage();

    // Open the encounter
    openEncounter(encounter.id);
    showToast(`Created encounter with ${state.parsedCreatures.length} creatures`, 'success');
};

// =====================================================
// Dynamic Form Lists
// =====================================================
function addDynamicListItem(listId, type) {
    const list = document.getElementById(listId);
    const item = document.createElement('div');
    item.className = 'dynamic-list-item';

    if (type === 'recharge') {
        item.innerHTML = `
            <input type="text" name="ability-name" placeholder="Ability name (e.g., Acid Breath)">
            <input type="number" name="recharge-on" value="5" min="2" max="6" style="width: 60px;" title="Recharges on X-6">
            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
    } else if (type === 'limited') {
        item.innerHTML = `
            <input type="text" name="ability-name" placeholder="Ability name">
            <input type="number" name="max-uses" value="1" min="1" style="width: 60px;" title="Uses per day">
            <button type="button" class="remove-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
    }

    list.appendChild(item);
}

// =====================================================
// Utility Functions
// =====================================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString();
}

function formatMod(stat) {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
}

function formatMultiline(text) {
    if (!text) return '';
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function getOrdinal(n) {
    const num = parseInt(n);
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =====================================================
// Initiative Tracker Integration
// =====================================================
window.sendToTracker = async function(npcIndex) {
    const npc = state.currentEncounter?.npcs[npcIndex];
    if (!npc) {
        showToast('NPC not found', 'error');
        return;
    }

    // Prompt for initiative
    const initiativeStr = prompt(`Enter initiative for ${npc.displayName}:`, '10');
    if (initiativeStr === null) return; // Cancelled
    
    const initiative = parseInt(initiativeStr) || 10;

    // Get auth token from parent window's localStorage (if in iframe) or current localStorage
    let token = localStorage.getItem('token');
    
    // If in iframe, try to get token from parent
    if (!token && window.parent !== window) {
        try {
            token = window.parent.localStorage.getItem('token');
        } catch (e) {
            // Cross-origin access denied, that's okay
        }
    }

    if (!token) {
        showToast('Not logged in. Please log in to the admin dashboard first.', 'error');
        return;
    }

    try {
        // First, check if there's an active battle
        const battlesRes = await fetch('/api/battles', {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!battlesRes.ok) {
            showToast('Failed to fetch battles. Please check your login.', 'error');
            return;
        }

        const battlesData = await battlesRes.json();
        const activeBattle = battlesData.battles?.find(b => b.isActive);

        if (!activeBattle) {
            showToast('No active battle. Start a battle first in the admin dashboard.', 'error');
            return;
        }

        // Calculate max sort order
        const maxSortOrder = Math.max(...activeBattle.characters.map(c => c.sortOrder || 0), 0);

        // Create the new NPC character for the tracker
        const newNPC = {
            id: `npc-enc-${Date.now()}`,
            name: npc.displayName,
            isNPC: true,
            isRevealed: false,
            initiative: initiative,
            sortOrder: maxSortOrder + 1,
        };

        // Get the current character before sorting changes
        const sortedBefore = [...activeBattle.characters].sort((a, b) => {
            if (b.initiative !== a.initiative) return b.initiative - a.initiative;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
        const currentCharacterId = sortedBefore[activeBattle.currentTurnIndex]?.id;

        const updatedCharacters = [...activeBattle.characters, newNPC];

        // Find where the current character will be after adding new NPC
        const sortedAfter = [...updatedCharacters].sort((a, b) => {
            if (b.initiative !== a.initiative) return b.initiative - a.initiative;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
        const newTurnIndex = sortedAfter.findIndex(c => c.id === currentCharacterId);

        // Update the battle
        const updateRes = await fetch(`/api/battles/${activeBattle._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                characters: updatedCharacters,
                currentTurnIndex: newTurnIndex >= 0 ? newTurnIndex : activeBattle.currentTurnIndex
            }),
        });

        if (updateRes.ok) {
            showToast(`${npc.displayName} added to initiative tracker!`, 'success');
        } else {
            const errorData = await updateRes.json();
            showToast(`Failed to add NPC: ${errorData.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Failed to send to tracker:', error);
        showToast('Failed to send to tracker. Check console for details.', 'error');
    }
};

// =====================================================
// Keyboard Shortcuts
// =====================================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});
