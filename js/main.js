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
    renderLocation();
    setupInteractions();
    setupCategoryCurtain(); // Новый вызов для шторки
    
    // Установка цены билета
    document.getElementById('ticket-price').innerText = configData.event.price;

    // Apply translations for static UI elements
    document.title = configData.ui.pageTitle;
    document.querySelector('#artists-section h3').innerText = configData.ui.lineupGuests;
    document.querySelector('#ticket-fab > div > span').innerText = configData.ui.tickets;

    // Make the body visible
    document.body.removeAttribute('x-cloak');
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

        <div class="absolute bottom-20 left-6 right-6 flex flex-col items-start">
            <!-- Таймер -->
            <div class="flex justify-start gap-2 mb-2 countdown-container" id="countdown-timer">
                <div class="countdown-item"><span class="countdown-value" id="d-val">00</span><span class="countdown-label">${configData.ui.days}</span></div>
                <div class="countdown-item"><span class="countdown-value" id="h-val">00</span><span class="countdown-label">${configData.ui.hours}</span></div>
                <div class="countdown-item"><span class="countdown-value" id="m-val">00</span><span class="countdown-label">${configData.ui.minutes}</span></div>
                <div class="countdown-item"><span class="countdown-value" id="s-val">00</span><span class="countdown-label">${configData.ui.seconds}</span></div>
            </div>
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

// Google Analytics Event Tracker
function trackEvent(eventName, eventCategory, eventLabel) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, {
      'event_category': eventCategory,
      'event_label': eventLabel,
    });
  }
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
        trackEvent('click', 'Tickets', configData.event.ticketLink);
        window.open(configData.event.ticketLink, '_blank');
    };

    // Кнопка WhatsApp (контакт)
    const waFab = document.getElementById('whatsapp-fab');
    waFab.href = configData.event.whatsappContact;
    waFab.addEventListener('click', () => {
        trackEvent('click', 'Contact', 'WhatsApp');
    });

    // Логика для шторки категорий
    const menuBtn = document.getElementById('menu-btn');
    const categoryCurtain = document.getElementById('category-curtain');

    menuBtn.onclick = () => {
        trackEvent('click', 'Navigation', 'Open Category Curtain');
        document.body.classList.add('overflow-hidden');
        categoryCurtain.classList.remove('translate-y-full');
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
            trackEvent('click', 'Language', `Switch to ${lang.toUpperCase()}`);
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
        trackEvent('click', 'Share', 'Header Share Button');
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
    const headerTitle = headerContent ? headerContent.querySelector('h1') : null;
    const headerSubtitle = headerContent ? headerContent.querySelector('span') : null;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Parallax
        header.style.backgroundPositionY = `${scrollTop * 0.5}px`;

        // Fade out content and darken overlay
        const fastFadeUntil = 300;
        const fastFadeValue = Math.max(0, Math.min(1, scrollTop / fastFadeUntil));

        // Fade out subtitle (fast)
        if (headerSubtitle) {
            headerSubtitle.style.opacity = (1 - fastFadeValue * 2).toString();
        }

        // Darken the overlay (fast)
        const gradientOverlay = header.querySelector('.absolute.inset-0');
        if (gradientOverlay) {
            gradientOverlay.style.backgroundColor = `rgba(0, 0, 0, ${fastFadeValue * 0.9})`;
        }

        // Fade out title (slow)
        const slowFadeUntil = 600; // Fades out over 600px
        const slowFadeValue = Math.max(0, Math.min(1, scrollTop / slowFadeUntil));

        if (headerTitle) {
            // Slower fade, will be fully faded at 600px scroll
            headerTitle.style.opacity = (1 - slowFadeValue).toString();
        }
    });

    // Social Icons in main content
    const socialIconsContainer = document.getElementById('social-icons');
    if(socialIconsContainer) {
        socialIconsContainer.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const socialName = link.href.split('//')[1].split('/')[0] || 'Unknown'; // Extracts domain
                trackEvent('click', 'Social', socialName);
            }
        });
    }

    // Artist links
    const artistsContainer = document.getElementById('artists-container');
    if(artistsContainer){
        artistsContainer.addEventListener('click', (e) => {
            const artistLink = e.target.closest('.group');
            if (artistLink) {
                const artistName = artistLink.querySelector('h4').innerText;
                trackEvent('click', 'Artist', artistName);
            }
        });
    }

    // Location map link
    const locationContainer = document.getElementById('location-section');
    if(locationContainer) {
        locationContainer.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && (link.href.includes('maps') || link.href.includes('mapLink'))) {
               trackEvent('click', 'Location', 'Map Link');
            }
        });
    }
}

function setupCategoryCurtain() {
    const curtain = document.getElementById('category-curtain');
    if (!curtain) return;

    // --- INITIALIZATION ---
    fetch('menu.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const menuContent = doc.body.firstElementChild; // Get the main container

            if (menuContent) {
                curtain.innerHTML = ''; // Clear
                curtain.appendChild(menuContent);

                // Add close functionality
                // Since there's no close button in the new design,
                // we can re-purpose the top handle to close the modal.
                const closeHandle = curtain.querySelector('.w-10.h-1');
                if(closeHandle) {
                    closeHandle.onclick = () => {
                        document.body.classList.remove('overflow-hidden');
                        curtain.classList.add('translate-y-full');
                    };
                }

                // Now, we need to wire up the dynamic data to this new template
                // This will require new rendering functions.
                // For now, the static content from menu.html will be displayed.
            }
        })
        .catch(error => console.error("Error loading or setting up menu.html:", error));
}
