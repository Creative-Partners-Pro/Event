// js/menu.js
let configData;
let imageData;
// Определяем язык так же, как в main.js, чтобы обеспечить консистентность
let currentLang = localStorage.getItem('lang') || 'en';


function renderPopularItems() {
    const popularContainer = document.getElementById('popular-now-carousel');
    if (!popularContainer) return;

    // Фильтруем популярные товары
    const popularItems = configData.menu.items.filter(item => item.popular);
    let popularHtml = '';

    popularItems.forEach(item => {
        popularHtml += `
            <div class="keen-slider__slide flex-shrink-0 w-40 snap-center">
                <div class="group relative w-full h-52 rounded-2xl overflow-hidden active:scale-95 transition-transform duration-300">
                    <img src="${imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${item.name}">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div class="absolute bottom-3 left-3 right-3">
                        <h4 class="font-bold text-sm text-white truncate">${item.name}</h4>
                        <p class="text-xs text-white/70">${item.price}</p>
                    </div>
                    ${item.popular ? '<div class="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"></div>' : ''}
                </div>
            </div>
        `;
    });

    popularContainer.innerHTML = popularHtml;
}

function renderCategoryTabs(activeType = 'bar') {
    const categoriesContainer = document.getElementById('categories-carousel');
    if (!categoriesContainer) return;

    // Получаем уникальные категории для выбранного типа (bar/food)
    const categories = [...new Set(configData.menu.items
        .filter(item => item.type === activeType)
        .map(item => item.category))];

    categoriesContainer.innerHTML = ''; // Очищаем

    categories.forEach((category, index) => {
        // Находим перевод для категории
        const translatedCategory = configData.ui.categoryTranslations[category]?.[currentLang] || category;
        const button = document.createElement('button');
        button.className = `category-tab flex-shrink-0 snap-start px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${index === 0 ? 'bg-accent-yellow text-black' : 'bg-white/5 text-white/60 hover:text-white'}`;
        button.textContent = translatedCategory;
        button.onclick = () => {
            renderMenuItems(category);
            // Обновляем стили активной кнопки
            document.querySelectorAll('.category-tab').forEach(btn => btn.classList.remove('bg-accent-yellow', 'text-black'));
            button.classList.add('bg-accent-yellow', 'text-black');
        };
        categoriesContainer.appendChild(button);
    });
}

function renderMenuItems(category) {
    const itemsGrid = document.getElementById('items-grid');
    if (!itemsGrid) return;

    const items = configData.menu.items.filter(item => item.category === category);
    let itemsHtml = '';

    items.forEach(item => {
        itemsHtml += `
            <div class="bg-white/5 rounded-2xl p-3 flex gap-4 items-center border border-white/5">
                <img src="${imageData.menu[item.name.toLowerCase().replace(/ /g, '_')] || 'img/placeholder.png'}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
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

    itemsGrid.innerHTML = itemsHtml;
}

function setupCloseButton() {
    const closeButton = document.getElementById('close-menu-button');
    if (closeButton) {
        closeButton.onclick = () => {
            window.location.href = 'index.html';
        };
    }
}

function setupTypeSwitcher() {
    const barButton = document.getElementById('bar-button');
    const foodButton = document.getElementById('food-button');

    if (barButton && foodButton) {
        barButton.onclick = () => {
            renderCategoryTabs('bar');
            // По умолчанию отображаем первую категорию бара
            renderMenuItems(configData.menu.items.find(item => item.type === 'bar').category);

            // Обновляем стили кнопок
            barButton.className = "flex-1 py-2 rounded-full bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow text-[10px] font-bold uppercase tracking-widest shadow-neon-yellow transition-all animate-flicker-slow";
            foodButton.className = "flex-1 py-2 rounded-full text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-white/60 transition-colors";
        };

        foodButton.onclick = () => {
            renderCategoryTabs('food');
            // По умолчанию отображаем первую категорию еды
            renderMenuItems(configData.menu.items.find(item => item.type === 'food').category);

            // Обновляем стили кнопок
            foodButton.className = "flex-1 py-2 rounded-full bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow text-[10px] font-bold uppercase tracking-widest shadow-neon-yellow transition-all animate-flicker-slow";
            barButton.className = "flex-1 py-2 rounded-full text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-white/60 transition-colors";
        };
    }
}

// Вызываем настройку переключателя после загрузки данных
document.addEventListener('DOMContentLoaded', () => {
    // Единая точка входа для инициализации меню
    function initMenu() {
        Promise.all([
            fetch(`data/${currentLang}.json`).then(res => res.json()),
            fetch('data/images.json').then(res => res.json())
        ])
        .then(([langData, images]) => {
            configData = langData;
            imageData = images.images;

            renderPopularItems();
            renderCategoryTabs('bar'); // По умолчанию 'bar'

            // Проверяем, есть ли элементы типа 'bar' перед тем, как рендерить
            const initialBarCategory = configData.menu.items.find(item => item.type === 'bar');
            if (initialBarCategory) {
                renderMenuItems(initialBarCategory.category);
            }

            setupTypeSwitcher(); // Настраиваем кнопки BAR/FOOD
            setupCloseButton(); // Настраиваем кнопку закрытия
        })
        .catch(error => console.error("Ошибка при загрузке данных для меню:", error));
    }

    initMenu();
});
