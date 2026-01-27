// js/menu.js
let configData;
let imageData;
let currentLang = localStorage.getItem('lang') || 'en';
let activeMenuType = 'bar'; // 'bar' or 'food'
let currentItemIndex = -1;
let currentCategoryItems = [];
let currentRating = 0;

// --- Constants ---
const bankAccountDetails = "GE75CD0360000050090787";
const qrCodeUrls = {
    1: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drunk-owl-bar.com/tip/1',
    3: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drunk-owl-bar.com/tip/3',
    5: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drunk-owl-bar.com/tip/5'
};


document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    setupModal();
    initReviewsModal();
});


function initReviewsModal() {
    const modal = document.getElementById('reviews-modal');
    const trigger = document.getElementById('reviews-modal-trigger');
    const closeButton = document.getElementById('reviews-modal-close-button');
    const overlay = document.getElementById('reviews-modal-overlay');

    if (!modal || !trigger || !closeButton || !overlay) {
        console.warn('Reviews modal elements not found.');
        return;
    }

    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    trigger.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    setupRating();
    setupTipButtons();
    setupCopyButton();
    setupSendFeedbackButton(closeModal);
}

function createOwlIcon(value) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "32");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("viewBox", "0 0 256 256");
    svg.classList.add('rating-owl', 'cursor-pointer');
    svg.dataset.value = value;

    const path = document.createElementNS(svgNS, "path");
    const svgPathData = "M176,68a12,12,0,1,1-12-12A12,12,0,0,1,176,68Zm64,12a8,8,0,0,1-3.56,6.66L216,100.28V120A104.11,104.11,0,0,1,112,224H24a16,16,0,0,1-12.49-26l.1-.12L96,96.63V76.89C96,43.47,122.79,16.16,155.71,16H156a60,60,0,0,1,57.21,41.86l23.23,15.48A8,8,0,0,1,240,80Zm-22.42,0L201.9,69.54a8,8,0,0,1-3.31-4.64A44,44,0,0,0,156,32h-.22C131.64,32.12,112,52.25,112,76.89V99.52a8,8,0,0,1-1.85,5.13L24,208h26.9l70.94-85.12a8,8,0,1,1,12.29,10.24L71.75,208H112a88.1,88.1,0,0,0,88-88V96a8,8,0,0,1,3.56-6.66Z";
    path.setAttribute("d", svgPathData);
    svg.appendChild(path);

    return svg;
}

function setupRating() {
    const ratingContainer = document.getElementById('rating-container');
    const ratingInput = document.getElementById('rating-input');
    if (!ratingContainer || !ratingInput) return;

    for (let i = 1; i <= 5; i++) {
        const owlIcon = createOwlIcon(i);
        ratingContainer.appendChild(owlIcon);
    }

    const owls = ratingContainer.querySelectorAll('.rating-owl');

    owls.forEach(owl => {
        owl.addEventListener('mouseover', () => {
            const value = parseInt(owl.dataset.value);
            owls.forEach(o => o.classList.toggle('hovered', parseInt(o.dataset.value) <= value));
        });

        owl.addEventListener('mouseout', () => {
            owls.forEach(o => o.classList.remove('hovered'));
        });

        owl.addEventListener('click', () => {
            currentRating = parseInt(owl.dataset.value);
            ratingInput.value = currentRating; // Update the hidden input
            owls.forEach(o => o.classList.toggle('selected', parseInt(o.dataset.value) <= currentRating));
        });
    });
}

function setupTipButtons() {
    const tipButtons = document.querySelectorAll('.tip-button');
    const qrCodeImage = document.getElementById('tip-qr-code');

    if (!qrCodeImage) return;

    tipButtons.forEach(button => {
        button.addEventListener('click', () => {
            tipButtons.forEach(btn => btn.classList.remove('active-tip'));
            button.classList.add('active-tip');
            const tipAmount = button.dataset.tip;
            qrCodeImage.src = qrCodeUrls[tipAmount] || 'img/qr-code-placeholder.svg';
        });
    });
}


function setupCopyButton() {
    const copyButton = document.getElementById('copy-details-button');
    const successMessage = document.getElementById('copy-success-message');

    if (!copyButton || !successMessage) return;

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(bankAccountDetails).then(() => {
            successMessage.classList.remove('hidden');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
}


function setupSendFeedbackButton(closeModalCallback) {
    const form = document.getElementById('feedback-form');
    const reviewTextArea = document.getElementById('review-text');
    const ratingContainer = document.getElementById('rating-container');
    const ratingInput = document.getElementById('rating-input');
    const errorElement = document.getElementById('feedback-error');

    if (!form || !reviewTextArea || !ratingContainer || !ratingInput || !errorElement) return;

    form.addEventListener('submit', (event) => {
        // Basic validation
        if (currentRating === 0 && reviewTextArea.value.trim() === '') {
            event.preventDefault(); // Stop form submission
            errorElement.textContent = 'Please leave a rating or a review before sending.';
            return;
        }

        errorElement.textContent = ''; // Clear error message

        // The form will now submit to the Google Apps Script URL

        // Optional: Reset form visually after a short delay to allow submission
        setTimeout(() => {
            reviewTextArea.value = '';
            currentRating = 0;
            ratingInput.value = '0';
            ratingContainer.querySelectorAll('.rating-owl').forEach(o => o.classList.remove('selected'));
            closeModalCallback();
        }, 500);
    });
}


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

function formatPrice(price) {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
        return price; // Return original if not a number
    }
    return `${numericPrice.toFixed(1)} GEL`;
}

function displayModalData(item) {
    document.getElementById('modal-image').src = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.webp';
    document.getElementById('modal-name').textContent = item.name.replace(/(<br>|<\/br>)/g, ' ');
    document.getElementById('modal-price').textContent = formatPrice(item.price);
    document.getElementById('modal-desc').textContent = item.desc || '';

    // Handle tags if they exist in data
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = ''; // Clear existing tags
    if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'font-body text-[11px] font-normal uppercase tracking-[0.15em] text-accent-yellow border border-accent-yellow/30 px-3 py-1 rounded-full';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
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
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.webp';
        const itemElement = document.createElement('div');
        itemElement.className = 'flex-shrink-0 w-40 snap-center';
        itemElement.innerHTML = `
            <div class="group relative w-full h-16 rounded-2xl overflow-hidden active:scale-95 transition-transform duration-300 cursor-pointer">
                <img src="${imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${item.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3">
                    <h4 class="font-bold text-sm text-white truncate">${item.name}</h4>
                    <p class="text-xs text-white/70">${formatPrice(item.price)}</p>
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

    const items = configData.menu.items.filter(item => item.category.toUpperCase() === category.toUpperCase());

    // Sort items: those with images first
    items.sort((a, b) => {
        const aImageUrl = imageData.menu[a.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.webp';
        const bImageUrl = imageData.menu[b.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.webp';
        const aHasImage = !aImageUrl.includes('placeholder');
        const bHasImage = !bImageUrl.includes('placeholder');
        return bHasImage - aHasImage;
    });

    container.innerHTML = ''; // Clear existing content
    items.forEach(item => {
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.webp';
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item bg-white/5 rounded-2xl p-3 flex gap-4 items-center border border-white/5 w-60 cursor-pointer';
        const tagsHtml = item.tags && item.tags.map(tag => {
            let bgColor = 'bg-gray-500/20';
            let textColor = 'text-gray-300';
            if (tag.toLowerCase() === 'hot') {
                bgColor = 'bg-red-500/20';
                textColor = 'text-red-400';
            } else if (tag.toLowerCase() === 'popular') {
                bgColor = 'bg-yellow-500/20';
                textColor = 'text-yellow-400';
            } else if (tag.toLowerCase() === 'sale') {
                bgColor = 'bg-green-500/20';
                textColor = 'text-green-400';
            }
            return `<span class="text-[10px] uppercase font-semibold tracking-wider px-2 py-1 rounded-md ${bgColor} ${textColor}">${tag}</span>`;
        }).join('');

        const tagsContainer = tagsHtml ? `<div class="flex gap-2 items-center">${tagsHtml}</div>` : '';

        itemElement.innerHTML = `
            <img src="${imageUrl}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
            <div class="flex-1">
                <h4 class="font-medium text-sm text-white">${item.name}</h4>
                <div class="flex justify-between items-center mt-2">
                    <div class="price-container border border-white/10 rounded-full px-3 py-1">
                         <span class="font-bold text-sm text-accent-yellow">${formatPrice(item.price)}</span>
                    </div>
                    ${tagsContainer}
                </div>
            </div>
        `;
        itemElement.onclick = () => openModal(item);
        container.appendChild(itemElement);
    });
}

function renderCategoryGrid(type) {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    // Get the names of categories that have items of the specified type, standardized to uppercase
    const relevantCategoryNames = new Set(
        configData.menu.items
            .filter(item => item.type === type)
            .map(item => item.category.toUpperCase())
    );

    // Filter the main category list, comparing in a case-insensitive way
    const categories = configData.menu.categories.filter(cat =>
        relevantCategoryNames.has(cat.name.toUpperCase())
    );

    let html = '';
    categories.forEach(category => {
        const translatedCategory = configData.ui.categoryTranslations[category.name]?.[currentLang] || category.name;
        html += `
            <div class="category-tile flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300 bg-white/5" data-category="${category.name}">
                 <i class="${category.icon} text-4xl text-accent-yellow"></i>
                 <span class="mt-2 text-xs font-semibold uppercase tracking-wider">${translatedCategory}</span>
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
