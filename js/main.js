let configData;
let imageData;
let currentLang = localStorage.getItem('lang') || 'en'; // Default to English

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Fetch the new language file
    fetch(`data/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            configData = data;
            renderApp(); // Re-render the app with the new language
        });
}

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch(`data/${currentLang}.json`).then(res => res.json()),
        fetch('data/images.json').then(res => res.json())
    ])
    .then(([langData, images]) => {
        configData = langData;
        imageData = images.images;
        renderApp();
        startCountdown();
    })
    .catch(error => console.error("Error loading initial data:", error));
});

function renderApp() {
    renderHeader();
    renderMainInfo();
    renderSocialIcons();
    renderArtists();
    renderMenu();
    renderLocation();
    setupInteractions();
    
    // Установка цены билета
    document.getElementById('ticket-price').innerText = configData.event.price;

    // Apply translations for static UI elements
    document.title = configData.ui.pageTitle;
    document.querySelector('#artists-section h3').innerText = configData.ui.lineupGuests;
    document.querySelector('#ticket-fab > div > span').innerText = configData.ui.tickets;
    document.querySelector('#menu-modal h3').innerText = configData.ui.menu;
}

function renderHeader() {
    const header = document.getElementById('header-section');
    header.style.backgroundImage = `url('${imageData.coverImage}')`;
    header.classList.add('cover-image');
    header.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90"></div>
        
        <div class="absolute top-6 right-6 flex items-center gap-2 z-20">
            <!-- Language Switcher -->
            <div id="lang-switcher" class="relative">
                <button id="lang-btn" class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                    <i class="ph ph-translate text-white text-lg"></i>
                </button>
                <div id="lang-dropdown" class="absolute top-12 right-0 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 p-1 hidden">
                    <a href="#" class="lang-option block px-3 py-1 text-sm text-white rounded-md hover:bg-white/20" data-lang="en">EN</a>
                    <a href="#" class="lang-option block px-3 py-1 text-sm text-white rounded-md hover:bg-white/20" data-lang="ru">RU</a>
                    <a href="#" class="lang-option block px-3 py-1 text-sm text-white rounded-md hover:bg-white/20" data-lang="ka">KA</a>
                </div>
            </div>
            <!-- Share Button -->
            <button id="header-share-btn" class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                <i class="ph-bold ph-share-network text-white text-lg"></i>
            </button>
        </div>

        <div class="absolute bottom-20 left-6 right-6">
            <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold tracking-wider uppercase mb-2 border border-white/10">${configData.ui.comingSoon}</span>
            <h1 class="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">${configData.event.title}</h1>
        </div>
    `;
}

function renderMainInfo() {
    const container = document.getElementById('main-info');
    container.innerHTML = `
        <div class="flex items-center justify-center space-x-2 text-indigo-300 mb-2 font-medium">
            <i class="ph-fill ph-calendar-blank text-lg"></i>
            <span>${configData.event.date}</span>
        </div>
        <h2 class="text-xl font-medium text-white mb-3">${configData.event.subtitle}</h2>
        <p class="text-gray-300 text-sm leading-relaxed opacity-90 mb-5">${configData.event.description}</p>
        
        <!-- Таймер -->
        <div class="flex justify-center gap-2 mt-4" id="countdown-timer">
            <div class="countdown-item"><span class="countdown-value" id="d-val">00</span><span class="countdown-label">${configData.ui.days}</span></div>
            <div class="countdown-item"><span class="countdown-value" id="h-val">00</span><span class="countdown-label">${configData.ui.hours}</span></div>
            <div class="countdown-item"><span class="countdown-value" id="m-val">00</span><span class="countdown-label">${configData.ui.minutes}</span></div>
            <div class="countdown-item"><span class="countdown-value" id="s-val">00</span><span class="countdown-label">${configData.ui.seconds}</span></div>
        </div>
    `;
}

function renderSocialIcons() {
    const container = document.getElementById('social-icons');
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    configData.socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url;
        a.className = "w-12 h-12 glass-card rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/10";
        a.innerHTML = `<i class="ph ${social.icon} text-2xl ${social.color}"></i>`;
        fragment.appendChild(a);
    });
    container.appendChild(fragment);
}

function renderArtists() {
    const container = document.getElementById('artists-container');
    container.innerHTML = ''; // Clear existing content
    const fragment = document.createDocumentFragment();
    configData.participants.forEach((person, index) => {
        const div = document.createElement('div');
        div.className = "flex-shrink-0 w-32 snap-center text-center group cursor-pointer";
        div.onclick = () => window.location.href = person.instagram;
        div.innerHTML = `
            <div class="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-pink-500 mb-3 group-active:scale-95 transition-transform">
                <img src="${imageData.participants[index]}" class="w-full h-full object-cover rounded-full border-2 border-black" alt="${person.name}">
            </div>
            <h4 class="font-semibold text-sm truncate flex items-center justify-center gap-1">
                ${person.name} <i class="ph-fill ph-instagram-logo text-xs text-gray-500"></i>
            </h4>
            <p class="text-xs text-gray-400 truncate">${person.role}</p>
        `;
        fragment.appendChild(div);
    });
    container.appendChild(fragment);
}

let activeCategory;

function renderMenu() {
    if (!activeCategory) {
        activeCategory = configData.menu.categories[0];
    }
    // Tabs
    const tabsContainer = document.getElementById('menu-tabs');
    tabsContainer.innerHTML = '';
    configData.menu.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `menu-tab px-5 py-2 rounded-full text-sm transition-all duration-300 whitespace-nowrap ${cat === activeCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => {
            activeCategory = cat;
            renderMenu(); // Re-render content
        };
        tabsContainer.appendChild(btn);
    });

    // Items
    const itemsContainer = document.getElementById('menu-container');
    itemsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const filteredItems = configData.menu.items.filter(item => item.category === activeCategory);
    
    filteredItems.forEach((item) => {
        const originalIndex = configData.menu.items.findIndex(originalItem => originalItem.name === item.name && originalItem.desc === item.desc);
        const div = document.createElement('div');
        div.className = "bg-white/5 rounded-2xl p-3 flex gap-4 items-center border border-white/5";
        div.innerHTML = `
            <img src="${imageData.menu[originalIndex]}" class="w-16 h-16 rounded-xl object-cover bg-gray-800" alt="${item.name}">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h4 class="font-medium text-sm text-white">${item.name}</h4>
                    <span class="font-bold text-sm text-indigo-300">${item.price}</span>
                </div>
                <p class="text-xs text-gray-400 mt-1 line-clamp-2">${item.desc}</p>
            </div>
        `;
        fragment.appendChild(div);
    });
    itemsContainer.appendChild(fragment);
}

function renderLocation() {
    const section = document.getElementById('location-section');
    section.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold opacity-90">${configData.ui.location}</h3>
            <a href="${configData.location.mapLink}" target="_blank" class="text-xs bg-white text-black px-3 py-1 rounded-full font-semibold">Google Maps</a>
        </div>
        <div class="rounded-2xl overflow-hidden h-32 mb-4 relative group">
            <img src="${imageData.location}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Map">
            <a href="${configData.location.mapLink}" target="_blank" class="absolute inset-0 bg-black/20 flex items-center justify-center">
                 <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <i class="ph-fill ph-navigation-arrow text-white"></i>
                 </div>
            </a>
        </div>
        <div class="flex items-start gap-3">
            <i class="ph-fill ph-map-pin text-pink-500 text-xl mt-1"></i>
            <div>
                <h4 class="font-medium text-white">${configData.location.name}</h4>
                <p class="text-sm text-gray-400 mt-1">${configData.location.address}</p>
            </div>
        </div>
    `;
}

function startCountdown() {
    const eventDate = new Date(configData.event.eventDateISO).getTime();
    
    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
            document.getElementById('countdown-timer').innerHTML = `<div class="text-xl font-bold text-indigo-400">${configData.ui.eventStarted}</div>`;
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('d-val').innerText = days < 10 ? '0'+days : days;
        document.getElementById('h-val').innerText = hours < 10 ? '0'+hours : hours;
        document.getElementById('m-val').innerText = minutes < 10 ? '0'+minutes : minutes;
        document.getElementById('s-val').innerText = seconds < 10 ? '0'+seconds : seconds;
    };

    setInterval(updateTimer, 1000);
    updateTimer();
}

function setupInteractions() {
    // Кнопка Билеты
    const fab = document.getElementById('ticket-fab');
    fab.onclick = (e) => {
        e.preventDefault();
        window.open(configData.event.ticketLink, '_blank');
    };

    // Кнопка WhatsApp (контакт)
    const waFab = document.getElementById('whatsapp-fab');
    waFab.href = configData.event.whatsappContact;

    // Логика Модального окна МЕНЮ
    const menuModal = document.getElementById('menu-modal');
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu');

    menuBtn.onclick = () => {
        menuModal.classList.add('open');
        document.body.style.overflow = 'hidden'; // блокируем скролл фона
    };

    const closeModal = () => {
        menuModal.classList.remove('open');
        document.body.style.overflow = '';
    };

    closeMenuBtn.onclick = closeModal;
    
    // Закрытие по клику на фон
    menuModal.onclick = (e) => {
        if (e.target === menuModal) closeModal();
    };

    // Language Switcher Logic
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');

    langBtn.onclick = () => {
        langDropdown.classList.toggle('hidden');
    };

    document.querySelectorAll('.lang-option').forEach(option => {
        option.onclick = (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
            langDropdown.classList.add('hidden');
        };
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!document.getElementById('lang-switcher').contains(e.target)) {
            langDropdown.classList.add('hidden');
        }
    });

    // Кнопка Share (в хедере)
    document.getElementById('header-share-btn').onclick = async (e) => {
        e.preventDefault();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: configData.event.title,
                    text: configData.event.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована!');
        }
    };

    // Parallax and Fade Effect on Scroll
    const header = document.getElementById('header-section');
    const headerContent = header.querySelector('.absolute.bottom-20');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const headerHeight = header.offsetHeight;

        // Parallax: Move background slower than scroll
        header.style.backgroundPositionY = `${scrollTop * 0.5}px`;

        // Fade out content and darken overlay as user scrolls
        // Start fading from the very top, be fully faded by the time we scroll 300px
        const fadeUntil = 300;
        const fadeValue = Math.max(0, Math.min(1, scrollTop / fadeUntil));

        // Fade out text content
        if (headerContent) {
            headerContent.style.opacity = (1 - fadeValue * 2).toString();
        }

        // Darken the overlay
        const gradientOverlay = header.querySelector('.absolute.inset-0');
        if (gradientOverlay) {
            gradientOverlay.style.backgroundColor = `rgba(0, 0, 0, ${fadeValue * 0.9})`;
        }
    });
}
