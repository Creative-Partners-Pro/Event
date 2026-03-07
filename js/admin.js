/**
 * js/admin.js
 */

let appData = {
    en: null,
    ru: null,
    ka: null,
    images: null
};

let currentTab = 'business';
let editingCategoryIndex = -1;
let editingItemIndex = -1;

const LANGUAGES = ['en', 'ru', 'ka'];

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    initUI();
});

async function loadAllData() {
    try {
        // We use relative paths. When served by our Node server, these will work.
        // We add a timestamp to avoid caching
        const ts = new Date().getTime();
        const [en, ru, ka, images] = await Promise.all([
            fetch(`data/en.json?v=${ts}`).then(res => res.json()),
            fetch(`data/ru.json?v=${ts}`).then(res => res.json()),
            fetch(`data/ka.json?v=${ts}`).then(res => res.json()),
            fetch(`data/images.json?v=${ts}`).then(res => res.json())
        ]);
        appData.en = en;
        appData.ru = ru;
        appData.ka = ka;
        appData.images = images;
        console.log('All data loaded', appData);
    } catch (err) {
        console.error('Error loading data:', err);
        alert('Failed to load menu data. Make sure JSON files exist in data/ directory.');
    }
}

function initUI() {
    // Nav setup
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.tab);
        });
    });

    // Initial tab
    switchTab('business');

    // Button event listeners
    document.getElementById('save-all-btn').addEventListener('click', saveAllData);
    document.getElementById('add-tag-btn').addEventListener('click', addNewTag);
    document.getElementById('add-category-btn').addEventListener('click', () => openCategoryModal());
    document.getElementById('add-item-btn').addEventListener('click', () => openItemModal());
    document.getElementById('save-category-btn').addEventListener('click', saveCategory);
    document.getElementById('save-item-btn').addEventListener('click', saveItem);

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('category-modal').classList.add('hidden');
            document.getElementById('item-modal').classList.add('hidden');
        });
    });

    document.getElementById('item-category-filter').addEventListener('change', renderItemsTable);

    // Initial render
    renderBusinessInfo();
    renderGlobalSettings();
    renderCategories();
    renderItemsTable();
    populateCategorySelects();
}

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.tab === tabId) {
            item.classList.add('bg-primary/10', 'text-primary');
            item.classList.remove('text-white/70');
        } else {
            item.classList.remove('bg-primary/10', 'text-primary');
            item.classList.add('text-white/70');
        }
    });
}

// --- RENDERING ---

function renderBusinessInfo() {
    const loc = appData.en.location;
    document.getElementById('biz-name').value = loc.name || '';
    document.getElementById('biz-type').value = appData.en.biz_type || 'Bar';
    document.getElementById('biz-desc').value = appData.en.biz_description || '';
    document.getElementById('biz-address').value = loc.address || '';
    document.getElementById('biz-map-link').value = loc.mapLink || '';
    document.getElementById('biz-photo').value = appData.en.biz_photo || '';
}

function renderGlobalSettings() {
    // Greetings
    document.getElementById('greet-title-en').value = appData.en.greetings_text || '';
    document.getElementById('greet-sub-en').value = appData.en.greetings_subtext || '';
    document.getElementById('greet-title-ru').value = appData.ru.greetings_text || '';
    document.getElementById('greet-sub-ru').value = appData.ru.greetings_subtext || '';

    // Banner
    document.getElementById('banner-toggle').checked = !!appData.en.show_banner;
    document.getElementById('banner-image').value = appData.en.banner_image || '';

    // QR
    document.getElementById('qr-id').value = appData.en.qr_id || '';

    // Tags
    renderTags();
}

function renderTags() {
    const tagsList = document.getElementById('tags-list');
    tagsList.innerHTML = '';
    const tags = appData.en.available_tags || ['popular', 'hot', 'new'];

    tags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm';
        tagEl.innerHTML = `
            <span>${tag}</span>
            <button onclick="removeTag('${tag}')" class="text-white/30 hover:text-primary transition-colors">
                <i class="ph ph-x-circle"></i>
            </button>
        `;
        tagsList.appendChild(tagEl);
    });
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    appData.en.menu.categories.forEach((cat, index) => {
        const card = document.createElement('div');
        card.className = 'bg-card-bg border border-white/10 rounded-2xl p-6 space-y-4';

        const isEmoji = !cat.icon.startsWith('ph-');
        const iconHtml = isEmoji ? `<span class="text-3xl">${cat.icon}</span>` : `<i class="${cat.icon} text-3xl text-accent-yellow"></i>`;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    ${iconHtml}
                </div>
                <div class="flex gap-2">
                    <button onclick="openCategoryModal(${index})" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
                        <i class="ph ph-pencil-simple text-xl"></i>
                    </button>
                    <button onclick="deleteCategory(${index})" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-primary">
                        <i class="ph ph-trash text-xl"></i>
                    </button>
                </div>
            </div>
            <div>
                <h3 class="text-lg font-bold">${cat.name}</h3>
                <p class="text-xs text-white/30 uppercase tracking-widest mt-1">Order: ${cat.order_position || 0}</p>
            </div>
            <div class="pt-4 border-t border-white/5 grid grid-cols-1 gap-1 text-sm text-white/50">
                <div class="flex justify-between"><span>RU:</span> <span>${appData.ru.ui.categoryTranslations[cat.name]?.ru || '-'}</span></div>
                <div class="flex justify-between"><span>KA:</span> <span>${appData.ka.ui.categoryTranslations[cat.name]?.ka || '-'}</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderItemsTable() {
    const tbody = document.getElementById('items-table-body');
    const filter = document.getElementById('item-category-filter').value;
    tbody.innerHTML = '';

    let items = appData.en.menu.items;
    if (filter !== 'all') {
        items = items.filter(i => i.category === filter);
    }

    items.forEach((item, index) => {
        const realIndex = appData.en.menu.items.indexOf(item);
        const row = document.createElement('tr');
        row.className = 'hover:bg-white/[0.02] transition-colors';

        const statusHtml = item.hidden
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-white/30 border border-white/5">Hidden</span>`
            : `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/10">Active</span>`;

        const popularHtml = item.popular ? `<i class="ph-fill ph-star text-accent-yellow ml-2" title="Popular"></i>` : '';

        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        <img src="${getItemImage(item)}" class="w-full h-full object-cover" onerror="this.src='img/placeholder.png'">
                    </div>
                    <div>
                        <div class="font-medium">${item.name} ${popularHtml}</div>
                        <div class="text-xs text-white/30 truncate max-w-[200px]">${item.desc || 'No description'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="text-xs font-bold uppercase tracking-wider text-white/50">${item.category}</span>
            </td>
            <td class="px-6 py-4 font-mono text-sm">${item.price} GEL</td>
            <td class="px-6 py-4">${statusHtml}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="openItemModal(${realIndex})" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button onclick="deleteItem(${realIndex})" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-primary">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getItemImage(item) {
    if (item.image && appData.images.images.menu[item.image]) {
        return appData.images.images.menu[item.image];
    }
    const cleanedName = item.name.replace(/🍺/g, '').trim();
    const nameKey = cleanedName.toLowerCase().replace(/ /g, '_');
    return appData.images.images.menu[nameKey] || 'img/placeholder.png';
}

function populateCategorySelects() {
    const filterSelect = document.getElementById('item-category-filter');
    const modalSelect = document.getElementById('item-category-select');

    // Save current selection
    const currentFilter = filterSelect.value;

    filterSelect.innerHTML = '<option value="all">All Categories</option>';
    modalSelect.innerHTML = '';

    appData.en.menu.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = cat.name;
        filterSelect.appendChild(opt.cloneNode(true));
        modalSelect.appendChild(opt);
    });

    filterSelect.value = currentFilter;
}

// --- LOGIC ---

function addNewTag() {
    const input = document.getElementById('new-tag-input');
    const tag = input.value.trim().toLowerCase();
    if (!tag) return;

    if (!appData.en.available_tags) appData.en.available_tags = [];
    if (!appData.en.available_tags.includes(tag)) {
        appData.en.available_tags.push(tag);
        renderTags();
        input.value = '';
    }
}

function removeTag(tag) {
    appData.en.available_tags = appData.en.available_tags.filter(t => t !== tag);
    renderTags();
}

function openCategoryModal(index = -1) {
    editingCategoryIndex = index;
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');

    if (index === -1) {
        title.textContent = 'Add Category';
        document.getElementById('cat-name-en').value = '';
        document.getElementById('cat-name-ru').value = '';
        document.getElementById('cat-name-ka').value = '';
        document.getElementById('cat-icon').value = '';
        document.getElementById('cat-order').value = appData.en.menu.categories.length;
        document.getElementById('cat-image').value = '';
    } else {
        const cat = appData.en.menu.categories[index];
        title.textContent = 'Edit Category';
        document.getElementById('cat-name-en').value = cat.name;
        document.getElementById('cat-name-ru').value = appData.ru.ui.categoryTranslations[cat.name]?.ru || '';
        document.getElementById('cat-name-ka').value = appData.ka.ui.categoryTranslations[cat.name]?.ka || '';
        document.getElementById('cat-icon').value = cat.icon;
        document.getElementById('cat-order').value = cat.order_position || 0;
        document.getElementById('cat-image').value = appData.images.images.menu[cat.name.toLowerCase().replace(/ /g, '_')] || '';
    }

    modal.classList.remove('hidden');
}

function saveCategory() {
    const nameEn = document.getElementById('cat-name-en').value.trim();
    const nameRu = document.getElementById('cat-name-ru').value.trim();
    const nameKa = document.getElementById('cat-name-ka').value.trim();
    const icon = document.getElementById('cat-icon').value.trim();
    const order = parseInt(document.getElementById('cat-order').value);
    const imageUrl = document.getElementById('cat-image').value.trim();

    if (!nameEn) return alert('Name is required');

    const newCat = { name: nameEn, icon, order_position: order };

    if (editingCategoryIndex === -1) {
        appData.en.menu.categories.push(newCat);
    } else {
        const oldName = appData.en.menu.categories[editingCategoryIndex].name;
        appData.en.menu.categories[editingCategoryIndex] = newCat;

        // Update items if name changed
        if (oldName !== nameEn) {
            appData.en.menu.items.forEach(item => {
                if (item.category === oldName) item.category = nameEn;
            });
        }
    }

    // Update translations
    [appData.en, appData.ru, appData.ka].forEach(data => {
        if (!data.ui.categoryTranslations) data.ui.categoryTranslations = {};
        data.ui.categoryTranslations[nameEn] = {
            en: nameEn,
            ru: nameRu || nameEn,
            ka: nameKa || nameEn
        };
    });

    // Update images
    if (imageUrl) {
        appData.images.images.menu[nameEn.toLowerCase().replace(/ /g, '_')] = imageUrl;
    }

    renderCategories();
    populateCategorySelects();
    document.getElementById('category-modal').classList.add('hidden');
}

function deleteCategory(index) {
    if (!confirm('Are you sure? Items in this category will remain but will be uncategorized.')) return;
    appData.en.menu.categories.splice(index, 1);
    renderCategories();
    populateCategorySelects();
}

function openItemModal(index = -1) {
    editingItemIndex = index;
    const modal = document.getElementById('item-modal');
    const title = document.getElementById('item-modal-title');

    // Setup tags selection
    const tagsContainer = document.getElementById('item-tags-select');
    tagsContainer.innerHTML = '';
    const availableTags = appData.en.available_tags || ['popular', 'hot', 'new'];
    availableTags.forEach(tag => {
        const tagEl = document.createElement('label');
        tagEl.className = 'flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full cursor-pointer hover:bg-white/10 transition-colors text-xs';
        tagEl.innerHTML = `
            <input type="checkbox" data-tag="${tag}" class="hidden peer">
            <span class="peer-checked:text-primary">${tag}</span>
        `;
        tagsContainer.appendChild(tagEl);
    });

    if (index === -1) {
        title.textContent = 'Add Menu Item';
        document.getElementById('item-name-en').value = '';
        document.getElementById('item-name-ru').value = '';
        document.getElementById('item-name-ka').value = '';
        document.getElementById('item-price').value = '';
        document.getElementById('item-type-select').value = 'bar';
        document.getElementById('item-order').value = 0;
        document.getElementById('item-hidden-toggle').checked = false;
        document.getElementById('item-popular-toggle').checked = false;
        document.getElementById('item-desc-en').value = '';
        document.getElementById('item-desc-ru').value = '';
        document.getElementById('item-desc-ka').value = '';
        document.getElementById('item-strength').value = '';
        document.getElementById('item-volume').value = '';
        document.getElementById('item-taste').value = '';
        document.getElementById('item-photo').value = '';
    } else {
        const itemEn = appData.en.menu.items[index];
        const itemRu = appData.ru.menu.items[index] || {};
        const itemKa = appData.ka.menu.items[index] || {};

        title.textContent = 'Edit Menu Item';
        document.getElementById('item-name-en').value = itemEn.name;
        document.getElementById('item-name-ru').value = itemRu.name || '';
        document.getElementById('item-name-ka').value = itemKa.name || '';
        document.getElementById('item-category-select').value = itemEn.category;
        document.getElementById('item-price').value = itemEn.price;
        document.getElementById('item-type-select').value = itemEn.type || 'bar';
        document.getElementById('item-order').value = itemEn.order_position || 0;
        document.getElementById('item-hidden-toggle').checked = !!itemEn.hidden;
        document.getElementById('item-popular-toggle').checked = !!itemEn.popular;
        document.getElementById('item-desc-en').value = itemEn.desc || '';
        document.getElementById('item-desc-ru').value = itemRu.desc || '';
        document.getElementById('item-desc-ka').value = itemKa.desc || '';
        document.getElementById('item-strength').value = itemEn.strength || '';
        document.getElementById('item-volume').value = itemEn.volume || '';
        document.getElementById('item-taste').value = itemEn.taste || '';
        document.getElementById('item-photo').value = appData.images.images.menu[itemEn.image || itemEn.name.toLowerCase().replace(/ /g, '_')] || '';

        // Check tags
        if (itemEn.tags) {
            itemEn.tags.forEach(tag => {
                const cb = tagsContainer.querySelector(`input[data-tag="${tag}"]`);
                if (cb) cb.checked = true;
            });
        }
    }

    modal.classList.remove('hidden');
}

function saveItem() {
    const nameEn = document.getElementById('item-name-en').value.trim();
    if (!nameEn) return alert('Name is required');

    const tags = Array.from(document.querySelectorAll('#item-tags-select input:checked')).map(cb => cb.dataset.tag);

    const itemDataEn = {
        category: document.getElementById('item-category-select').value,
        name: nameEn,
        price: document.getElementById('item-price').value,
        desc: document.getElementById('item-desc-en').value,
        type: document.getElementById('item-type-select').value,
        tags: tags,
        popular: document.getElementById('item-popular-toggle').checked,
        hidden: document.getElementById('item-hidden-toggle').checked,
        order_position: parseInt(document.getElementById('item-order').value),
        strength: document.getElementById('item-strength').value,
        volume: document.getElementById('item-volume').value,
        taste: document.getElementById('item-taste').value
    };

    const itemDataRu = { ...itemDataEn, name: document.getElementById('item-name-ru').value || nameEn, desc: document.getElementById('item-desc-ru').value };
    const itemDataKa = { ...itemDataEn, name: document.getElementById('item-name-ka').value || nameEn, desc: document.getElementById('item-desc-ka').value };

    const photoUrl = document.getElementById('item-photo').value.trim();
    if (photoUrl) {
        const imageKey = nameEn.toLowerCase().replace(/ /g, '_');
        appData.images.images.menu[imageKey] = photoUrl;
        itemDataEn.image = imageKey;
        itemDataRu.image = imageKey;
        itemDataKa.image = imageKey;
    }

    if (editingItemIndex === -1) {
        appData.en.menu.items.push(itemDataEn);
        appData.ru.menu.items.push(itemDataRu);
        appData.ka.menu.items.push(itemDataKa);
    } else {
        appData.en.menu.items[editingItemIndex] = itemDataEn;
        // Update other langs based on name match or index? Usually better by index if they are kept in sync
        appData.ru.menu.items[editingItemIndex] = itemDataRu;
        appData.ka.menu.items[editingItemIndex] = itemDataKa;
    }

    renderItemsTable();
    document.getElementById('item-modal').classList.add('hidden');
}

function deleteItem(index) {
    if (!confirm('Are you sure?')) return;
    appData.en.menu.items.splice(index, 1);
    appData.ru.menu.items.splice(index, 1);
    appData.ka.menu.items.splice(index, 1);
    renderItemsTable();
}

function saveAllData() {
    // Collect business info back to appData
    appData.en.location.name = document.getElementById('biz-name').value;
    appData.en.biz_type = document.getElementById('biz-type').value;
    appData.en.biz_description = document.getElementById('biz-desc').value;
    appData.en.location.address = document.getElementById('biz-address').value;
    appData.en.location.mapLink = document.getElementById('biz-map-link').value;
    appData.en.biz_photo = document.getElementById('biz-photo').value;

    // Collect global settings
    appData.en.greetings_text = document.getElementById('greet-title-en').value;
    appData.en.greetings_subtext = document.getElementById('greet-sub-en').value;
    appData.ru.greetings_text = document.getElementById('greet-title-ru').value;
    appData.ru.greetings_subtext = document.getElementById('greet-sub-ru').value;

    appData.en.show_banner = document.getElementById('banner-toggle').checked;
    appData.en.banner_image = document.getElementById('banner-image').value;
    appData.en.qr_id = document.getElementById('qr-id').value;

    console.log('Final Data to Save:', appData);

    const saveBtn = document.getElementById('save-all-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(appData)
        });

        if (response.ok) {
            alert('Changes saved successfully! The menu is updated.');
        } else {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('Failed to save directly. Falling back to download mode.');

        // Fallback to downloading files if server is not available or fails
        downloadJSON(appData.en, 'en.json');
        downloadJSON(appData.ru, 'ru.json');
        downloadJSON(appData.ka, 'ka.json');
        downloadJSON(appData.images, 'images.json');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

function downloadJSON(obj, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
