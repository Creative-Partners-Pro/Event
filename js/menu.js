// js/menu.js
let configData;
let imageData;
let currentLang = localStorage.getItem('lang') || 'en';
let activeMenuType = 'bar'; // 'bar' or 'food'

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
});

function initMenu() {
    Promise.all([
        fetch(`data/${currentLang}.json`).then(res => res.json()),
        fetch('data/images.json').then(res => res.json())
    ])
    .then(([langData, images]) => {
        configData = langData;
        imageData = images.images;

        renderPopularItems();
        renderCategoryGrid(activeMenuType);

        const initialCategory = configData.menu.items.find(item => item.type === activeMenuType)?.category;
        if (initialCategory) {
            renderCategoryItems(initialCategory);
            updateActiveCategory(initialCategory);
        }

        setupTypeSwitcher();
        setupCloseButton();
    })
    .catch(error => console.error("Error loading initial data:", error));
}

function renderPopularItems() {
    const container = document.getElementById('popular-now-carousel');
    if (!container) return;

    const popularItems = configData.menu.items.filter(item => item.popular);
    let html = '';
    popularItems.forEach(item => {
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
        html += `
            <div class="flex-shrink-0 w-40 snap-center">
                <div class="group relative w-full h-16 rounded-2xl overflow-hidden active:scale-95 transition-transform duration-300">
                    <img src="${imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${item.name}">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div class="absolute bottom-3 left-3 right-3">
                        <h4 class="font-bold text-sm text-white truncate">${item.name}</h4>
                        <p class="text-xs text-white/70">${item.price}</p>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderCategoryItems(category) {
    const container = document.getElementById('selected-category-carousel');
    const title = document.getElementById('selected-category-title');
    if (!container || !title) return;

    const translatedCategory = configData.ui.categoryTranslations[category]?.[currentLang] || category;
    title.textContent = translatedCategory;

    const items = configData.menu.items.filter(item => item.category === category);
    let html = '';
    items.forEach(item => {
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
        html += `
            <div class="bg-white/5 rounded-2xl p-3 flex gap-4 items-center border border-white/5 w-60 flex-shrink-0">
                <img src="${imageUrl}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-medium text-sm text-white">${item.name}</h4>
                        <span class="font-bold text-sm text-accent-yellow">${item.price}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1 line-clamp-2">${item.desc || ''}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderCategoryGrid(type) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    const categories = [...new Set(configData.menu.items.filter(item => item.type === type).map(item => item.category))];
    let html = '';
    categories.forEach(category => {
        const translatedCategory = configData.ui.categoryTranslations[category]?.[currentLang] || category;
        html += `
            <div class="category-tile glass-tile-square rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300"
                 onclick="handleCategoryClick('${category}')"
                 data-category="${category}">
                <i class="ph ph-martini text-3xl text-accent-yellow mb-2"></i>
                <span class="text-xs font-semibold uppercase tracking-wider">${translatedCategory}</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

function handleCategoryClick(category) {
    renderCategoryItems(category);
    updateActiveCategory(category);
}

function updateActiveCategory(category) {
    document.querySelectorAll('.category-tile').forEach(tile => {
        if (tile.dataset.category === category) {
            tile.classList.add('border-accent-yellow', 'neon-flicker');
        } else {
            tile.classList.remove('border-accent-yellow', 'neon-flicker');
        }
    });
}

function setupTypeSwitcher() {
    const barButton = document.getElementById('bar-button');
    const foodButton = document.getElementById('food-button');

    barButton.onclick = () => {
        if (activeMenuType === 'bar') return;
        activeMenuType = 'bar';
        renderCategoryGrid('bar');
        const initialCategory = configData.menu.items.find(item => item.type === 'bar')?.category;
        if (initialCategory) {
            handleCategoryClick(initialCategory);
        }
        updateSwitcherUI();
    };

    foodButton.onclick = () => {
        if (activeMenuType === 'food') return;
        activeMenuType = 'food';
        renderCategoryGrid('food');
        const initialCategory = configData.menu.items.find(item => item.type === 'food')?.category;
        if (initialCategory) {
            handleCategoryClick(initialCategory);
        }
        updateSwitcherUI();
    };

    updateSwitcherUI();
}

function updateSwitcherUI() {
    const barButton = document.getElementById('bar-button');
    const foodButton = document.getElementById('food-button');
    if (activeMenuType === 'bar') {
        barButton.classList.add('neon-flicker', 'bg-accent-yellow/10', 'border', 'border-accent-yellow/30', 'text-accent-yellow');
        foodButton.classList.remove('neon-flicker', 'bg-accent-yellow/10', 'border', 'border-accent-yellow/30', 'text-accent-yellow');
    } else {
        foodButton.classList.add('neon-flicker', 'bg-accent-yellow/10', 'border', 'border-accent-yellow/30', 'text-accent-yellow');
        barButton.classList.remove('neon-flicker', 'bg-accent-yellow/10', 'border', 'border-accent-yellow/30', 'text-accent-yellow');
    }
}


function setupCloseButton() {
    const closeButton = document.getElementById('close-menu-button');
    if (closeButton) {
        closeButton.onclick = () => {
            window.location.href = 'index.html';
        };
    }
}