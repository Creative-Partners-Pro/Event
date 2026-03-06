// js/menu.js
let configData;
let imageData;
let currentLang = localStorage.getItem('lang') || 'en';
let activeMenuType = 'bar'; // 'bar' or 'food'
let currentCategoryItems = [];
let activeItemIndex = 0;

const qrCodeUrls = {
    1: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drunk-owl-bar.com/tip/1',
    3: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drunk-owl-bar.com/tip/3',
    5: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://drunk-owl-bar.com/tip/5'
};

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initReviewsModal();
    setupLangButton();
    updateHeaderDate();
});

function updateHeaderDate() {
    const dateEl = document.getElementById('header-date');
    if (dateEl) {
        dateEl.textContent = new Date().getDate();
    }
}

function initMenu() {
    Promise.all([
        fetch(`data/${currentLang}.json`).then(res => res.json()),
        fetch('data/images.json').then(res => res.json())
    ])
    .then(([langData, images]) => {
        configData = langData;
        imageData = images.images;

        renderCategoriesNav(activeMenuType);

        // Find first available category for this type
        const firstCategory = configData.menu.items.find(item => item.type === activeMenuType)?.category;
        if (firstCategory) {
            handleCategoryClick(firstCategory);
        }

        setupTypeSwitcher();
        setupCloseButton();
        setupScrollButtons();
        updateUILabels();
    })
    .catch(error => console.error("Error loading initial data:", error));
}

function updateUILabels() {
    const moreInfoText = document.getElementById('more-info-text');
    const reviewsTitle = document.getElementById('reviews-title');
    const googleReviewText = document.getElementById('google-review-text');
    const tipLabel = document.getElementById('tip-label');

    const labels = {
        moreInfo: { en: 'More Info', ru: 'Подробнее', ka: 'მეტი ინფორმაცია' },
        reviews: { en: 'Reviews & Tips', ru: 'Отзывы и чаевые', ka: 'შეფასება და თიფსი' },
        google: { en: 'Leave a review on Google', ru: 'Оставить отзыв в Google', ka: 'დატოვეთ შეფასება Google-ზე' },
        tip: { en: 'Leave a tip', ru: 'Оставить чаевые', ka: 'დატოვეთ თიფსი' }
    };

    const l = (key) => labels[key][currentLang] || labels[key]['en'];

    if (moreInfoText) moreInfoText.textContent = l('moreInfo');
    if (reviewsTitle) reviewsTitle.textContent = l('reviews');
    if (googleReviewText) googleReviewText.textContent = l('google');
    if (tipLabel) tipLabel.textContent = l('tip');
}

function renderCategoriesNav(type) {
    const container = document.getElementById('categories-nav');
    if (!container) return;

    const relevantCategoryNames = new Set(
        configData.menu.items
            .filter(item => item.type === type)
            .map(item => item.category.toUpperCase())
    );

    const categories = configData.menu.categories.filter(cat =>
        relevantCategoryNames.has(cat.name.toUpperCase())
    );

    container.innerHTML = '';
    categories.forEach(category => {
        const translatedCategory = configData.ui.categoryTranslations[category.name]?.[currentLang] || category.name;
        const btn = document.createElement('button');
        btn.className = 'category-btn bg-white/10 text-gray-300 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap border border-white/5 transition-all duration-300';
        btn.dataset.category = category.name;
        btn.textContent = translatedCategory;
        btn.onclick = () => handleCategoryClick(category.name);
        container.appendChild(btn);
    });
}

function handleCategoryClick(categoryName) {
    updateActiveCategoryUI(categoryName);
    renderCategoryItems(categoryName);
}

function updateActiveCategoryUI(categoryName) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === categoryName) {
            btn.classList.remove('bg-white/10', 'text-gray-300', 'border-white/5');
            btn.classList.add('bg-gray-800', 'text-white', 'border-cyan-500/50', 'shadow-[0_0_10px_rgba(0,255,255,0.2)]');
        } else {
            btn.classList.add('bg-white/10', 'text-gray-300', 'border-white/5');
            btn.classList.remove('bg-gray-800', 'text-white', 'border-cyan-500/50', 'shadow-[0_0_10px_rgba(0,255,255,0.2)]');
        }
    });
}

function renderCategoryItems(category) {
    const sidebar = document.getElementById('category-items-sidebar');
    if (!sidebar) return;

    currentCategoryItems = configData.menu.items.filter(item => item.category.toUpperCase() === category.toUpperCase());

    sidebar.innerHTML = '';
    currentCategoryItems.forEach((item, index) => {
        const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';

        const itemCircle = document.createElement('div');
        itemCircle.className = `sidebar-item w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 shrink-0`;
        itemCircle.dataset.index = index;

        itemCircle.innerHTML = `<img src="${imageUrl}" class="w-10 h-10 rounded-full object-cover opacity-70" alt="${item.name}">`;

        itemCircle.onclick = () => selectFeaturedItem(index);
        sidebar.appendChild(itemCircle);
    });

    if (currentCategoryItems.length > 0) {
        selectFeaturedItem(0);
    }
}

function selectFeaturedItem(index) {
    activeItemIndex = index;
    const item = currentCategoryItems[index];

    // Update sidebar UI
    document.querySelectorAll('.sidebar-item').forEach((el, i) => {
        const img = el.querySelector('img');
        if (i === index) {
            el.classList.add('w-16', 'h-16', 'neon-glow', 'z-10', '-translate-x-2');
            el.classList.remove('w-12', 'h-12');
            if (img) img.classList.remove('opacity-70');
        } else {
            el.classList.remove('w-16', 'h-16', 'neon-glow', 'z-10', '-translate-x-2');
            el.classList.add('w-12', 'h-12');
            if (img) img.classList.add('opacity-70');
        }
    });

    displayFeaturedItem(item);
}

function displayFeaturedItem(item) {
    const imageUrl = imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png';

    document.getElementById('featured-image').src = imageUrl;
    document.getElementById('featured-name').textContent = item.name;

    const priceNum = parseFloat(item.price);
    const priceText = priceNum % 1 === 0 ? priceNum.toFixed(0) : priceNum.toFixed(2);
    document.getElementById('featured-price').textContent = priceText;

    // Tags
    const tagEl = document.getElementById('featured-tag');
    if (item.popular || (item.tags && item.tags.includes('popular'))) {
        tagEl.classList.remove('hidden');
    } else {
        tagEl.classList.add('hidden');
    }

    // Volume/ABV
    const abvContainer = document.getElementById('featured-abv-container');
    const volContainer = document.getElementById('featured-volume-container');

    // Hide by default
    abvContainer.classList.add('hidden');
    volContainer.classList.add('hidden');

    // Attempt to extract volume from description like "500ml" or "330ml"
    if (item.desc) {
        const volMatch = item.desc.match(/\d+\s*ml/i);
        if (volMatch) {
            document.getElementById('featured-volume').textContent = volMatch[0];
            volContainer.classList.remove('hidden');
        }
    }

    // Ingredients & Description labels
    const ingredientsLabel = document.getElementById('ingredients-label');
    const descriptionLabel = document.getElementById('description-label');

    const subLabels = {
        ingredients: { en: 'Ingredients:', ru: 'Состав:', ka: 'ინგრედიენტები:' },
        description: { en: 'Description:', ru: 'Описание:', ka: 'აღწერა:' }
    };

    if (ingredientsLabel) ingredientsLabel.textContent = subLabels.ingredients[currentLang] || subLabels.ingredients['en'];
    if (descriptionLabel) descriptionLabel.textContent = subLabels.description[currentLang] || subLabels.description['en'];

    const ingredientsContainer = document.getElementById('featured-ingredients-container');
    const descContainer = document.getElementById('featured-desc-container');

    if (item.desc) {
        document.getElementById('featured-ingredients').textContent = item.desc;
        ingredientsContainer.classList.remove('hidden');
        descContainer.classList.add('hidden');
    } else {
        ingredientsContainer.classList.add('hidden');
        descContainer.classList.add('hidden');
    }
}

function setupTypeSwitcher() {
    const barBtn = document.getElementById('bar-button');
    const foodBtn = document.getElementById('food-button');

    const updateSwitcherUI = () => {
        if (activeMenuType === 'bar') {
            barBtn.className = 'flex-1 text-white rounded-xl font-extrabold tracking-wider text-lg py-3 shadow-sm bg-[#06111C]';
            foodBtn.className = 'flex-1 text-[#06111C] rounded-xl font-extrabold tracking-wider text-lg py-3 opacity-70 hover:opacity-100 transition-opacity';
        } else {
            foodBtn.className = 'flex-1 text-white rounded-xl font-extrabold tracking-wider text-lg py-3 shadow-sm bg-[#06111C]';
            barBtn.className = 'flex-1 text-[#06111C] rounded-xl font-extrabold tracking-wider text-lg py-3 opacity-70 hover:opacity-100 transition-opacity';
        }
    };

    barBtn.onclick = () => {
        if (activeMenuType === 'bar') return;
        activeMenuType = 'bar';
        updateSwitcherUI();
        renderCategoriesNav('bar');
        const firstCat = configData.menu.items.find(item => item.type === 'bar')?.category;
        if (firstCat) handleCategoryClick(firstCat);
    };

    foodBtn.onclick = () => {
        if (activeMenuType === 'food') return;
        activeMenuType = 'food';
        updateSwitcherUI();
        renderCategoriesNav('food');
        const firstCat = configData.menu.items.find(item => item.type === 'food')?.category;
        if (firstCat) handleCategoryClick(firstCat);
    };

    updateSwitcherUI();
}

function setupLangButton() {
    const langBtn = document.getElementById('lang-btn');
    if (!langBtn) return;

    langBtn.textContent = currentLang.toUpperCase();
    langBtn.onclick = () => {
        const langs = ['en', 'ru', 'ka'];
        let idx = langs.indexOf(currentLang);
        currentLang = langs[(idx + 1) % langs.length];
        localStorage.setItem('lang', currentLang);
        location.reload();
    };
}

function setupCloseButton() {
    const btn = document.getElementById('close-menu-button');
    if (btn) btn.onclick = () => window.location.href = 'index.html';
}

function setupScrollButtons() {
    const sidebar = document.getElementById('category-items-sidebar');
    const up = document.getElementById('items-scroll-up');
    const down = document.getElementById('items-scroll-down');

    if (up) up.onclick = () => sidebar.scrollBy({ top: -100, behavior: 'smooth' });
    if (down) down.onclick = () => sidebar.scrollBy({ top: 100, behavior: 'smooth' });
}

function initReviewsModal() {
    const modal = document.getElementById('reviews-modal');
    const trigger = document.getElementById('reviews-modal-trigger');
    const closeBtn = document.getElementById('reviews-modal-close-button');
    const overlay = document.getElementById('reviews-modal-overlay');

    if (!modal || !trigger) return;

    trigger.onclick = () => modal.classList.remove('hidden');
    closeBtn.onclick = () => modal.classList.add('hidden');
    overlay.onclick = () => modal.classList.add('hidden');

    // Tips
    const qrImg = document.getElementById('tip-qr-code');
    document.querySelectorAll('.tip-button').forEach(btn => {
        btn.onclick = () => {
            const amount = btn.dataset.tip;
            qrImg.src = qrCodeUrls[amount];
            document.querySelectorAll('.tip-button').forEach(b => b.classList.remove('bg-accent', 'text-white'));
            btn.classList.add('bg-accent', 'text-white');
        };
    });
}
