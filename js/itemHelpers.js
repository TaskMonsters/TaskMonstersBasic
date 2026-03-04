// ===================================
// ITEM HELPER FUNCTIONS
// Functions for using and equipping items
// ===================================

// Use a consumable item from owned inventory
function useOwnedItem(itemId) {
    if (!window.inventoryManager) {
        console.error('Inventory manager not loaded');
        return;
    }

    const success = window.inventoryManager.useItem(itemId);
    
    if (success && typeof window.updateOwnedDisplay === 'function') {
        window.updateOwnedDisplay();
    }
}

// Toggle equip/unequip for cosmetic items
function toggleEquipItem(itemId) {
    if (!window.gameState) return;

    // Check if item is a hat
    const isHat = window.shopItems && window.shopItems.hats && 
                  window.shopItems.hats.some(h => h.id === itemId);
    
    // Check if item is a paint
    const isPaint = window.shopItems && window.shopItems.paints && 
                    window.shopItems.paints.some(p => p.id === itemId);
    
    // Check if item is glasses or mustache
    const isGlasses = itemId === 'glasses';
    const isMustache = itemId === 'mustache';

    if (isHat) {
        const currentlyEquipped = window.gameState.currentOutfit.hat === itemId;
        window.gameState.currentOutfit.hat = currentlyEquipped ? '' : itemId;
        
        if (typeof window.showSuccessMessage === 'function') {
            const verb = currentlyEquipped ? 'Unequipped' : 'Equipped';
            const itemName = itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            window.showSuccessMessage(`${verb} ${itemName}!`);
        }
    } else if (isPaint) {
        const currentlyEquipped = window.gameState.currentOutfit.paint === itemId;
        window.gameState.currentOutfit.paint = currentlyEquipped ? '' : itemId;
        
        if (typeof window.showSuccessMessage === 'function') {
            const verb = currentlyEquipped ? 'Unequipped' : 'Equipped';
            const itemName = itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            window.showSuccessMessage(`${verb} ${itemName}!`);
        }
    } else if (isGlasses) {
        const currentlyEquipped = window.gameState.currentOutfit.glasses === itemId;
        window.gameState.currentOutfit.glasses = currentlyEquipped ? '' : itemId;
        
        if (typeof window.showSuccessMessage === 'function') {
            const verb = currentlyEquipped ? 'Unequipped' : 'Equipped';
            window.showSuccessMessage(`${verb} Glasses!`);
        }
    } else if (isMustache) {
        const currentlyEquipped = window.gameState.currentOutfit.mustache === itemId;
        window.gameState.currentOutfit.mustache = currentlyEquipped ? '' : itemId;
        
        if (typeof window.showSuccessMessage === 'function') {
            const verb = currentlyEquipped ? 'Unequipped' : 'Equipped';
            window.showSuccessMessage(`${verb} Mustache!`);
        }
    }

    // Save and update UI
    if (typeof window.saveGameState === 'function') {
        window.saveGameState();
    }

    if (typeof window.updateUI === 'function') {
        window.updateUI();
    }

    if (typeof window.updateOwnedDisplay === 'function') {
        window.updateOwnedDisplay();
    }

    // Scroll to pet rock to show equipped item
    if (typeof window.scrollToPetRock === 'function') {
        window.scrollToPetRock();
    }
}

// Expose functions globally
window.useOwnedItem = useOwnedItem;
window.toggleEquipItem = toggleEquipItem;

