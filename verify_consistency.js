const fs = require('fs');

const en = JSON.parse(fs.readFileSync('data/en.json', 'utf8'));
const ru = JSON.parse(fs.readFileSync('data/ru.json', 'utf8'));
const ka = JSON.parse(fs.readFileSync('data/ka.json', 'utf8'));

const itemsEn = en.menu.items;
const itemsRu = ru.menu.items;
const itemsKa = ka.menu.items;

console.log(`Items count: EN: ${itemsEn.length}, RU: ${itemsRu.length}, KA: ${itemsKa.length}`);

if (itemsEn.length !== itemsRu.length || itemsEn.length !== itemsKa.length) {
    console.error('ERROR: Items count mismatch!');
}

let errors = 0;
let warnings = 0;

for (let i = 0; i < itemsEn.length; i++) {
    const itemEn = itemsEn[i];
    const itemRu = itemsRu[i];
    const itemKa = itemsKa[i];

    if (!itemRu || !itemKa) {
        console.error(`ERROR: Missing item at index ${i}`);
        errors++;
        continue;
    }

    if (itemEn.type !== itemRu.type || itemEn.type !== itemKa.type) {
        console.error(`ERROR: Type mismatch at index ${i}: EN=${itemEn.type}, RU=${itemRu.type}, KA=${itemKa.type}`);
        errors++;
    }

    if (itemEn.category !== itemRu.category || itemEn.category !== itemKa.category) {
        console.error(`ERROR: Category mismatch at index ${i}: EN=${itemEn.category}, RU=${itemRu.category}, KA=${itemKa.category}`);
        errors++;
    }

    // Check required fields
    ['name', 'price', 'desc', 'type', 'ingredients'].forEach(field => {
        if (!itemEn[field]) { console.warn(`WARN: Missing ${field} in EN item at index ${i}`); warnings++; }
        if (!itemRu[field]) { console.warn(`WARN: Missing ${field} in RU item at index ${i}`); warnings++; }
        if (!itemKa[field]) { console.warn(`WARN: Missing ${field} in KA item at index ${i}`); warnings++; }
    });

    if (itemEn.type === 'food') {
        if (!itemEn.calories) { console.warn(`WARN: Missing calories in EN food item at index ${i} (${itemEn.name})`); warnings++; }
        if (!itemEn.portion_size) { console.warn(`WARN: Missing portion_size in EN food item at index ${i} (${itemEn.name})`); warnings++; }
    } else if (itemEn.type === 'bar') {
        if (!itemEn.strength) { console.warn(`WARN: Missing strength in EN bar item at index ${i} (${itemEn.name})`); warnings++; }
        if (!itemEn.volume) { console.warn(`WARN: Missing volume in EN bar item at index ${i} (${itemEn.name})`); warnings++; }
    }
}

console.log(`Consistency check completed. Errors: ${errors}, Warnings: ${warnings}`);
