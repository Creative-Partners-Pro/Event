let configData;
let imageData;
let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    fetch(`data/event2/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            configData = data;
            renderApp();
        });
}

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch(`data/event2/${currentLang}.json`).then(res => res.json()),
        fetch('data/event2/images.json').then(res => res.json())
    ])
    .then(([langData, images]) => {
        configData = langData;
        imageData = images.images;
        renderApp();
        startCountdown();
        setupInteractions();
    })
    .catch(error => console.error("Error loading initial data:", error));
});

function renderApp() {
    // UI strings
    document.title = configData.ui.pageTitle;
    document.getElementById('presents-text').innerText = configData.event.presents;
    document.getElementById('event-title').innerHTML = configData.event.title;
    document.getElementById('event-subtitle').innerText = configData.event.subtitle;

    // Countdown labels
    document.getElementById('days-label').innerText = configData.ui.days;
    document.getElementById('hours-label').innerText = configData.ui.hours;
    document.getElementById('minutes-label').innerText = configData.ui.minutes;
    document.getElementById('seconds-label').innerText = configData.ui.seconds;

    // Info Card
    document.getElementById('info-date').innerText = configData.event.date;
    document.getElementById('info-session').innerText = configData.event.sessionType;
    document.getElementById('info-schedule').innerHTML = configData.event.schedule.replace('OPEN:', `<span class="text-gray-500">${configData.ui.open}:</span>`).replace('LIVE:', `<span class="text-gray-500">${configData.ui.live}:</span>`);

    // Socials
    renderSocials();

    // Line-up
    document.getElementById('lineup-title').childNodes[0].textContent = configData.ui.lineupGuests + ' ';
    renderLineup();

    // Location
    document.getElementById('location-title').innerText = configData.ui.location;
    document.getElementById('open-map-btn').innerText = configData.ui.openMap;
    document.getElementById('location-name').innerText = configData.location.name;
    document.getElementById('location-address').innerText = configData.location.address;
    document.getElementById('location-zone').innerText = configData.location.zone;
    document.getElementById('map-img').src = imageData.map;
    document.getElementById('cover-bg').style.backgroundImage = `url('${imageData.cover}')`;

    // Bottom Bar
    document.getElementById('ticket-price').innerText = configData.event.price;
    document.getElementById('ticket-label').innerText = configData.ui.tickets;
}

function renderSocials() {
    const container = document.getElementById('social-icons');
    container.innerHTML = '';
    configData.socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url;
        a.className = "w-12 h-12 rounded-full border border-gray-600 bg-[#1a1a1a] flex items-center justify-center hover:bg-gray-700 hover:border-gray-400 transition-all group shadow-lg";

        let iconHtml = '';
        if (social.id === 'inst') {
            iconHtml = `<svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>`;
        } else if (social.id === 'fb') {
            iconHtml = `<svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>`;
        } else if (social.id === 'tg') {
            iconHtml = `<svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"></path></svg>`;
        }

        a.innerHTML = iconHtml;
        container.appendChild(a);
    });
}

function renderLineup() {
    const container = document.getElementById('lineup-container');
    container.innerHTML = '';
    configData.participants.forEach(person => {
        const div = document.createElement('div');
        div.className = "flex flex-col items-center group cursor-pointer bg-black/40 p-4 rounded-sm border border-white/5 hover:border-white/20 transition-all";
        div.onclick = () => window.location.href = person.instagram;

        const participantImageKey = person.name.toLowerCase().replace(/ /g, '_');
        const imageUrl = imageData.participants && imageData.participants[participantImageKey] ? imageData.participants[participantImageKey] : 'img/placeholder.png';

        let statusHtml = '';
        if (person.status) {
            statusHtml = `<div class="absolute -top-2 -right-2 bg-white text-black text-[9px] font-black px-2 py-1 uppercase border border-black shadow-sm transform rotate-12">${person.status}</div>`;
        }

        div.innerHTML = `
            <div class="relative w-24 h-24 mb-4">
                <div class="absolute inset-0 rounded-full border-2 border-gray-500 p-0.5 group-hover:border-white transition-colors">
                    <img src="${imageUrl}" class="w-full h-full object-cover rounded-full grayscale contrast-150 brightness-90 group-hover:contrast-125 transition-all" alt="${person.name}">
                </div>
                ${statusHtml}
            </div>
            <h4 class="text-base font-bold font-stencil text-gray-200 tracking-wider group-hover:text-white">${person.name}</h4>
            <span class="text-[10px] text-gray-500 font-mono uppercase mt-1">${person.role}</span>
        `;
        container.appendChild(div);
    });
}

function startCountdown() {
    const eventDate = new Date(configData.event.eventDateISO).getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
            // Event started logic if needed
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days-val').innerText = days < 10 ? '0'+days : days;
        document.getElementById('hours-val').innerText = hours < 10 ? '0'+hours : hours;
        document.getElementById('minutes-val').innerText = minutes < 10 ? '0'+minutes : minutes;
        document.getElementById('seconds-val').innerText = seconds < 10 ? '0'+seconds : seconds;
    };

    setInterval(updateTimer, 1000);
    updateTimer();
}

function setupInteractions() {
    // Language Switcher
    const langBtn = document.getElementById('lang-btn');
    langBtn.onclick = () => {
        const langs = ['en', 'ru', 'ka'];
        let nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
        setLanguage(langs[nextIndex]);
    };

    // Share Button
    document.getElementById('share-btn').onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: configData.event.title.replace('<br/>', ' '),
                    url: window.location.href,
                });
            } catch (err) {}
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
        }
    };

    // Bottom Bar Buttons
    document.getElementById('menu-btn').onclick = () => window.location.href = 'menu.html';
    document.getElementById('ticket-btn').onclick = () => window.open(configData.event.ticketLink, '_blank');
    document.getElementById('whatsapp-btn').onclick = () => window.open(configData.event.whatsappContact, '_blank');
    document.getElementById('open-map-btn').onclick = () => window.open(configData.location.mapLink, '_blank');
}
