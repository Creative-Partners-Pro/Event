const fs = require('fs');

const menuHtml = fs.readFileSync('menu.html', 'utf8');
const menuJs = fs.readFileSync('js/menu.js', 'utf8');

const ids = [
    'modal-name', 'modal-price', 'modal-desc', 'modal-ingredients', 'modal-image',
    'modal-tags', 'modal-attributes', 'val-portion', 'val-secondary', 'val-taste',
    'label-portion', 'label-secondary', 'label-taste', 'label-ingredients',
    'label-description', 'label-recommendations', 'recommendations-section',
    'label-welcome', 'label-location-name', 'label-popular-now', 'label-reviews-title',
    'label-public-review', 'label-anonymous-review', 'label-leave-tip',
    'copy-details-button', 'send-feedback-button', 'bar-button', 'food-button',
    'review-text', 'copy-success-message'
];

console.log('Checking IDs in menu.html...');
ids.forEach(id => {
    if (!menuHtml.includes(`id="${id}"`) && !menuHtml.includes(`id='${id}'`)) {
        console.error(`ERROR: ID "${id}" NOT found in menu.html`);
    }
});

console.log('Checking ID usage in js/menu.js...');
ids.forEach(id => {
    if (!menuJs.includes(`getElementById('${id}')`) && !menuJs.includes(`getElementById("${id}")`) && !menuJs.includes(`querySelector('#${id}')`)) {
        // Some might be used differently, but most should be getElementById
        console.warn(`WARN: ID "${id}" might NOT be used in js/menu.js`);
    }
});
