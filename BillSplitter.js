let numberOfItems = 0;
let itemNames = [];
let itemPrices = [];
let itemSplitters = {};
let taxesFees = 0;
let tip = 0;

// Function to show or hide scenes
function toggleVisibility(sceneId, show) {
    const scene = document.getElementById(sceneId);
    scene.style.display = show ? 'block' : 'none';
}

// Start Scene 2: Collecting Item Names
function startScene2() {
    numberOfItems = parseInt(document.getElementById('numberOfItems').value);
    generateItemNameInputs();
    toggleVisibility('scene1', false);
    toggleVisibility('scene2', true);
}

// Generate input fields for item names
function generateItemNameInputs() {
    const container = document.getElementById('itemNames');
    container.innerHTML = '';
    for (let i = 0; i < numberOfItems; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Item ${i + 1} Name`;
        input.id = `itemName${i}`;
        container.appendChild(input);
    }
}

// Start Scene 3: Collecting Prices and Additional Charges
function startScene3() {
    for (let i = 0; i < numberOfItems; i++) {
        itemNames.push(document.getElementById(`itemName${i}`).value);
    }
    generateItemPriceInputs();
    toggleVisibility('scene2', false);
    toggleVisibility('scene3', true);
}

// Generate input fields for item prices
function generateItemPriceInputs() {
    const container = document.getElementById('itemPrices');
    container.innerHTML = '';
    for (let i = 0; i < numberOfItems; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = `Price for ${itemNames[i]}`;
        input.id = `itemPrice${i}`;
        container.appendChild(input);
    }
}

// Start Scene 4: Assigning Splitters for Each Item
function startScene4() {
    for (let i = 0; i < numberOfItems; i++) {
        itemPrices.push(parseFloat(document.getElementById(`itemPrice${i}`).value));
    }
    taxesFees = parseFloat(document.getElementById('taxesFees').value);
    tip = parseFloat(document.getElementById('tip').value);
    generateItemSplitterInputs();
    toggleVisibility('scene3', false);
    toggleVisibility('scene4', true);
}

// Generate input fields for item splitters
function generateItemSplitterInputs() {
    const container = document.getElementById('itemSplitters');
    container.innerHTML = '';
    for (let i = 0; i < numberOfItems; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Who splits ${itemNames[i]} (comma-separated names)`;
        input.id = `itemSplitter${i}`;
        container.appendChild(input);
    }
}

// Calculate and display the results
// Calculate and display the results
function calculate() {
    let allSplitters = [];
    for (let i = 0; i < numberOfItems; i++) {
        const splitters = document.getElementById(`itemSplitter${i}`).value.split(',').map(s => s.trim());
        itemSplitters[itemNames[i]] = splitters;
        allSplitters = allSplitters.concat(splitters);
    }

    // Remove duplicates by converting to a Set and back to an array
    allSplitters = [...new Set(allSplitters)];

    const results = calculateBillSplit(allSplitters);
    displayResults(results);
    toggleVisibility('scene4', false);
    toggleVisibility('results', true);
}

// Calculate each person's total including their proportional share of tax and tip
function calculateBillSplit(allSplitters) {
    let individualCosts = {};

    // Initialize individual costs for unique splitters
    allSplitters.forEach(person => {
        individualCosts[person] = 0;
    });

    let subtotal = itemPrices.reduce((a, b) => a + b, 0);
    let total = subtotal + taxesFees + tip;

    // Calculate each person's share of the bill without tax and tip
    itemNames.forEach((name, index) => {
        const price = itemPrices[index];
        const splitters = itemSplitters[name];
        const splitCost = price / splitters.length;

        splitters.forEach(person => {
            individualCosts[person] += splitCost;
        });
    });

    // Calculate each person's total including their proportional share of tax and tip
    let personToTotalMap = {};
    allSplitters.forEach(person => {
        const billShare = individualCosts[person];
        const taxShare = (billShare / subtotal) * taxesFees;
        const tipShare = (billShare / subtotal) * tip;
        personToTotalMap[person] = billShare + taxShare + tipShare;
    });

    return { individualCosts: personToTotalMap, subtotal, total, taxesFees, tip };
}


// Function to display the results
function displayResults({ individualCosts, subtotal, total, taxesFees, tip }) {
    const summaryContainer = document.getElementById('summary');
    const individualContainer = document.getElementById('individualOwes');

    // Display each item with its price
    let itemsSummary = '';
    for (let i = 0; i < itemNames.length; i++) {
        itemsSummary += `<div>${itemNames[i]}: $${itemPrices[i].toFixed(2)}</div>`;
    }

    // Add a horizontal line before the subtotal and bold the subtotal
    itemsSummary += '<hr><div>Subtotal: $' + subtotal.toFixed(2) + '</div>';

    // Generate the summary in separate lines, with the total in bold
    summaryContainer.innerHTML = itemsSummary + `
        <div>Taxes & Fees: $${taxesFees.toFixed(2)}</div>
        <div>Tip: $${tip.toFixed(2)}</div>
        <div><strong>Total: $${total.toFixed(2)}</strong></div><hr>

    `;

    // List each person's contribution with the person's name in bold
    individualContainer.innerHTML = Object.entries(individualCosts).map(([person, cost]) => 
        `<div><strong>${person}</strong> owes: <strong>$${cost.toFixed(2)}</strong></div>`
    ).join('');
}



