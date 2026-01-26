// js/menu.js
let configData;
let imageData;
let currentLang = localStorage.getItem('lang') || 'en';
let activeMenuType = 'bar'; // 'bar' or 'food'
let currentItemIndex = -1;
let currentCategoryItems = [];

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    setupModal();
});

function setupModal() {
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeButton = document.getElementById('modal-close-button');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !overlay || !closeButton || !modalContent) return;

    overlay.onclick = closeModal;
    closeButton.onclick = closeModal;

    let startY, startX;
    let modalRect;

    modalContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        modalRect = modalContent.getBoundingClientRect();
        modalContent.style.transition = 'none';
    });

    modalContent.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = currentY - startY;
        const diffX = currentX - startX;

        // Prevent default to avoid scrolling page
        e.preventDefault();

        // Apply transformations based on swipe direction
        modalContent.style.transform = `translate(${diffX}px, ${diffY}px)`;
    });

    modalContent.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const diffY = endY - startY;
        const diffX = endX - startX;

        const swipeThreshold = 100;

        if (Math.abs(diffY) > Math.abs(diffX)) { // Vertical swipe
            if (Math.abs(diffY) > swipeThreshold) {
                closeModal();
            } else {
                modalContent.style.transition = 'transform 0.3s ease-in-out';
                modalContent.style.transform = 'translate(0, 0)';
            }
        } else { // Horizontal swipe
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) { // Swipe right (previous)
                    currentItemIndex = (currentItemIndex - 1 + currentCategoryItems.length) % currentCategoryItems.length;
                } else { // Swipe left (next)
                    currentItemIndex = (currentItemIndex + 1) % currentCategoryItems.length;
                }
                displayModalData(currentCategoryItems[currentItemIndex]);
            }
            modalContent.style.transition = 'transform 0.3s ease-in-out';
            modalContent.style.transform = 'translate(0, 0)';
        }

        // Reset transition style after animation
        setTimeout(() => {
            modalContent.style.transition = '';
        }, 300);
    });
}

function displayModalData(item) {
    document.getElementById('modal-image').src = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
    document.getElementById('modal-name').innerHTML = item.name.replace(/(<br>|<\/br>)/g, ' ');
    document.getElementById('modal-price').textContent = item.price;
    document.getElementById('modal-desc').textContent = item.desc || '';

    // Handle tags if they exist in data
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = '';
    if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
            tagsContainer.innerHTML += `<span class="font-body text-[11px] font-normal uppercase tracking-[0.15em] text-accent-yellow border border-accent-yellow/30 px-3 py-1 rounded-full">${tag}</span>`;
        });
    }
}

function openModal(item) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    // Set current context for navigation
    currentCategoryItems = configData.menu.items.filter(i => i.category === item.category);
    currentItemIndex = currentCategoryItems.findIndex(i => i.name === item.name);

    displayModalData(item);

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0', 'scale-95'), 10);
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    modal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        // Reset styles for the next time it opens
        modalContent.style.transform = '';
        modalContent.style.transition = '';
    }, 300);
}

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
    container.innerHTML = ''; // Clear existing content
    popularItems.forEach(item => {
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
        const itemElement = document.createElement('div');
        itemElement.className = 'flex-shrink-0 w-40 snap-center';
        itemElement.innerHTML = `
            <div class="group relative w-full h-16 rounded-2xl overflow-hidden active:scale-95 transition-transform duration-300 cursor-pointer">
                <img src="${imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${item.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3">
                    <h4 class="font-bold text-sm text-white truncate">${item.name}</h4>
                    <p class="text-xs text-white/70">${item.price}</p>
                </div>
            </div>
        `;
        itemElement.onclick = () => openModal(item);
        container.appendChild(itemElement);
    });
}

function renderCategoryItems(category) {
    const container = document.getElementById('selected-category-grid');
    const title = document.getElementById('selected-category-title');
    if (!container || !title) return;

    const translatedCategory = configData.ui.categoryTranslations[category]?.[currentLang] || category;
    title.textContent = translatedCategory;

    const items = configData.menu.items.filter(item => item.category === category);

    // Sort items: those with images first
    items.sort((a, b) => {
        const aImageUrl = imageData.menu[a.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
        const bImageUrl = imageData.menu[b.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
        const aHasImage = !aImageUrl.includes('placeholder');
        const bHasImage = !bImageUrl.includes('placeholder');
        return bHasImage - aHasImage;
    });

    container.innerHTML = ''; // Clear existing content
    items.forEach(item => {
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item bg-white/5 rounded-2xl p-3 flex gap-4 items-center border border-white/5 w-60 cursor-pointer';
        itemElement.innerHTML = `
            <img src="${imageUrl}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h4 class="font-medium text-sm text-white">${item.name}</h4>
                    <span class="font-bold text-sm text-accent-yellow">${item.price}</span>
                </div>
                <p class="text-xs text-gray-400 mt-1 line-clamp-2">${item.desc || ''}</p>
            </div>
        `;
        itemElement.onclick = () => openModal(item);
        container.appendChild(itemElement);
    });
}

function renderCategoryGrid(type) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    const categories = [...new Set(configData.menu.items.filter(item => item.type === type).map(item => item.category))];
    let html = '';
    categories.forEach(category => {
        const translatedCategory = configData.ui.categoryTranslations[category]?.[currentLang] || category;
        html += `
            <div class="category-tile rounded-lg flex items-center justify-center p-2 text-center cursor-pointer transition-all duration-300 w-24 h-10 bg-white/5" data-category="${category}">
                 <span class="text-xs font-semibold uppercase tracking-wider">${translatedCategory}</span>
            </div>
        `;
    });
    container.innerHTML = html;

    // Attach event listeners after rendering
    document.querySelectorAll('.category-tile').forEach(tile => {
        const category = tile.getAttribute('data-category');
        tile.onclick = () => handleCategoryClick(category);
    });
}

function handleCategoryClick(category) {
    renderCategoryItems(category);
    updateActiveCategory(category);
}

function updateActiveCategory(category) {
    document.querySelectorAll('.category-tile').forEach(tile => {
        const tileCategoryName = tile.getAttribute('data-category');
        if (tileCategoryName === category) {
            tile.classList.add('neon-flicker', 'border-accent-yellow/30');
        } else {
            tile.classList.remove('neon-flicker', 'border-accent-yellow/30');
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
