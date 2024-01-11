/* 
FEEDBACK

- Just have an add button for each item so user doesnt have to count
- Section that displays what each person ordered
*/

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

// Function to navigate back to the previous scene
function goBack(fromScene, toScene) {
    toggleVisibility(fromScene, false);
    toggleVisibility(toScene, true);
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
    itemNames = []; // Reset item names in case we are coming back to this scene
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
    itemPrices = []; // Reset item prices in case we are coming back to this scene
    for (let i = 0; i < numberOfItems; i++) {
        itemPrices.push(parseFloat(document.getElementById(`itemPrice${i}`).value));
    }
    taxesFees = parseFloat(document.getElementById('taxesFees').value) || 0;
    tip = parseFloat(document.getElementById('tip').value) || 0;
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
function calculate() {
    let allSplitters = [];
    itemSplitters = {}; // Reset item splitters in case we are coming back to this scene
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
    // Use the logical OR operator to default to 0 if the value is NaN
    taxesFees = taxesFees || 0;
    tip = tip || 0;
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
// Function to display the results
function displayResults({ individualCosts, subtotal, total, taxesFees, tip }) {
    const summaryContainer = document.getElementById('summary');
    const individualContainer = document.getElementById('individualOwes');
    summaryContainer.innerHTML = ''; // Clear previous summary

    // Main receipt - Display each item with its price
    let mainReceiptContent = '';
    for (let i = 0; i < itemNames.length; i++) {
        mainReceiptContent += `<div>${itemNames[i]}: $${itemPrices[i].toFixed(2)}</div>`;
    }

    // Add a horizontal line before the subtotal and bold the subtotal
    mainReceiptContent += `
        <hr>
        <div><strong>Subtotal: $${subtotal.toFixed(2)}</strong></div>
        <div>Taxes & Fees: $${taxesFees.toFixed(2)}</div>
        <div>Tip: $${tip.toFixed(2)}</div>
        <div><strong>Total: $${total.toFixed(2)}</strong></div>
    `;

    summaryContainer.innerHTML = mainReceiptContent; // Display main receipt

    // Container for individual receipts
    individualContainer.innerHTML = '<div class="individual-receipts-container">';

    // Individual summaries per person
    Object.keys(individualCosts).forEach(person => {
        let personalItems = '';
        let personalSubtotal = 0;

        // Calculate each person's items and subtotal
        itemNames.forEach((itemName, index) => {
            if (itemSplitters[itemName].includes(person)) {
                const pricePerPerson = itemPrices[index] / itemSplitters[itemName].length;
                personalItems += `<div>${itemName}: $${pricePerPerson.toFixed(2)}</div>`;
                personalSubtotal += pricePerPerson;
            }
        });

        // Calculate each person's share of taxes and tips
        const taxShare = (personalSubtotal / subtotal) * taxesFees;
        const tipShare = (personalSubtotal / subtotal) * tip;
        const personalTotal = personalSubtotal + taxShare + tipShare;

        // Add the individual receipt to the container
        individualContainer.querySelector('.individual-receipts-container').innerHTML += `
            <div class="receipt">
                <h2>${person}'s Receipt</h2>
                ${personalItems}
                <div>Subtotal: $${personalSubtotal.toFixed(2)}</div>
                <div>Taxes & Fees: $${taxShare.toFixed(2)}</div>
                <div>Tip: $${tipShare.toFixed(2)}</div>
                <div><strong>Total: $${personalTotal.toFixed(2)}</strong></div>
            </div>
        `;
    });

    individualContainer.innerHTML += '</div>'; // Close the container for individual receipts
}
