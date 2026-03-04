// ===================================
// INVENTORY MANAGER
// Consumable inventory and usage system
// ===================================

class InventoryManager {
    constructor() {
        this.init();
    }

    init() {
        // Ensure inventory exists
        if (!window.gameState.inventory) {
            window.gameState.inventory = {};
        }
    }

    // Get item quantity
    getQuantity(itemId) {
        if (!window.gameState.inventory) return 0;
        return window.gameState.inventory[itemId] || 0;
    }

    // Add item to inventory
    addItem(itemId, quantity = 1) {
        if (!window.gameState.inventory) {
            window.gameState.inventory = {};
        }

        if (!window.gameState.inventory[itemId]) {
            window.gameState.inventory[itemId] = 0;
        }

        window.gameState.inventory[itemId] += quantity;

        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return window.gameState.inventory[itemId];
    }

    // Remove item from inventory
    removeItem(itemId, quantity = 1) {
        if (!window.gameState.inventory || !window.gameState.inventory[itemId]) {
            return false;
        }

        if (window.gameState.inventory[itemId] < quantity) {
            return false;
        }

        window.gameState.inventory[itemId] -= quantity;

        // Remove from inventory if quantity reaches 0
        if (window.gameState.inventory[itemId] <= 0) {
            delete window.gameState.inventory[itemId];
        }

        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    // Use consumable item
    useItem(itemId) {
        const quantity = this.getQuantity(itemId);
        
        if (quantity <= 0) {
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage('You don\'t have this item!');
            }
            return false;
        }

        // Find item details
        let item = null;
        if (window.shopItems) {
            Object.keys(window.shopItems).forEach(category => {
                const found = window.shopItems[category].find(i => i.id === itemId);
                if (found) {
                    item = found;
                }
            });
        }

        if (!item) {
            console.error('Item not found:', itemId);
            return false;
        }

        // Apply item effect based on type
        let success = false;
        let message = '';

        switch (itemId) {
            case 'health_potion':
                success = this.useHealthPotion();
                message = success ? '💚 Health Potion used! +20 HP' : '⚠️ HP already full!';
                break;

            case 'energy_drink':
                success = this.useEnergyDrink();
                message = success ? '⚡ Energy Drink used! +20 Energy' : '⚠️ Energy already full!';
                break;

            case 'xp_boost':
                success = this.useXPBoost();
                message = success ? '⭐ XP Boost activated! Next task gives 2x XP' : '⚠️ XP Boost already active!';
                break;

            case 'luck_charm':
                success = this.useLuckCharm();
                message = success ? '🍀 Luck Charm activated! Battle rewards increased' : '⚠️ Luck Charm already active!';
                break;

            case 'time_freeze':
                success = this.useTimeFreeze();
                message = success ? '⏰ Time Freeze activated! Task timers paused for 1 hour' : '⚠️ Time Freeze already active!';
                break;

            case 'attack_boost':
                success = this.useAttackBoost();
                message = success ? '⚔️ Attack Boost activated! +20% attack damage for 1 hour' : '⚠️ Attack Boost already active!';
                break;

            case 'defense_boost':
                success = this.useDefenseBoost();
                message = success ? '🛡️ Defense Boost activated! +20% defense for 1 hour' : '⚠️ Defense Boost already active!';
                break;

            default:
                message = '❓ Unknown item effect';
                break;
        }

        if (success) {
            // Consume the item
            this.removeItem(itemId, 1);
            
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage(message);
            }

            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }

            if (typeof window.updateOwnedDisplay === 'function') {
                window.updateOwnedDisplay();
            }

            return true;
        } else {
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage(message);
            }
            return false;
        }
    }

    // Item effect implementations
    useHealthPotion() {
        if (!window.gameState) return false;

        const maxHP = 100;
        if (window.gameState.health >= maxHP) {
            return false;
        }

        // FIX: Always ADD health when using potion outside battle
        window.gameState.health = Math.min(maxHP, window.gameState.health + 20);
        
        // Play potion use sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.7);
        }
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    useEnergyDrink() {
        if (!window.gameState) return false;

        const maxEnergy = 100;
        const currentEnergy = window.gameState.energy || 100;
        
        if (currentEnergy >= maxEnergy) {
            return false;
        }

        window.gameState.energy = Math.min(maxEnergy, currentEnergy + 20);
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    useXPBoost() {
        if (!window.gameState) return false;

        // Check if boost already active
        if (window.gameState.xpBoostActive) {
            return false;
        }

        window.gameState.xpBoostActive = true;
        window.gameState.xpBoostExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    useLuckCharm() {
        if (!window.gameState) return false;

        // Check if luck charm already active
        if (window.gameState.luckCharmActive) {
            return false;
        }

        window.gameState.luckCharmActive = true;
        window.gameState.luckCharmExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    useTimeFreeze() {
        if (!window.gameState) return false;

        // Check if time freeze already active
        if (window.gameState.timeFreezeActive) {
            return false;
        }

        window.gameState.timeFreezeActive = true;
        window.gameState.timeFreezeExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    useAttackBoost() {
        if (!window.gameState) return false;

        // Check if attack boost already active
        if (window.gameState.attackBoostActive) {
            return false;
        }

        window.gameState.attackBoostActive = true;
        window.gameState.attackBoostExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        
        // Play attack boost sound
        if (window.audioManager) {
            window.audioManager.playSound('attack_boost', 0.8);
        }
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    useDefenseBoost() {
        if (!window.gameState) return false;

        // Check if defense boost already active
        if (window.gameState.defenseBoostActive) {
            return false;
        }

        window.gameState.defenseBoostActive = true;
        window.gameState.defenseBoostExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        
        // Play defense boost sound
        if (window.audioManager) {
            window.audioManager.playSound('defense_boost_inventory', 0.8);
        }
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }

        return true;
    }

    // Check and clear expired buffs
    checkExpiredBuffs() {
        if (!window.gameState) return;

        const now = Date.now();

        // Check XP Boost
        if (window.gameState.xpBoostActive && window.gameState.xpBoostExpiry < now) {
            window.gameState.xpBoostActive = false;
            delete window.gameState.xpBoostExpiry;
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage('⭐ XP Boost expired');
            }
        }

        // Check Luck Charm
        if (window.gameState.luckCharmActive && window.gameState.luckCharmExpiry < now) {
            window.gameState.luckCharmActive = false;
            delete window.gameState.luckCharmExpiry;
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage('🍀 Luck Charm expired');
            }
        }

        // Check Time Freeze
        if (window.gameState.timeFreezeActive && window.gameState.timeFreezeExpiry < now) {
            window.gameState.timeFreezeActive = false;
            delete window.gameState.timeFreezeExpiry;
            if (typeof window.showSuccessMessage === 'function') {
                window.showSuccessMessage('⏰ Time Freeze expired');
            }
        }

        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }
    }

    // Get all owned items with quantities
    getAllItems() {
        if (!window.gameState.inventory) return [];

        const items = [];
        
        Object.keys(window.gameState.inventory).forEach(itemId => {
            const quantity = window.gameState.inventory[itemId];
            if (quantity > 0) {
                // Find item details
                let item = null;
                if (window.shopItems) {
                    Object.keys(window.shopItems).forEach(category => {
                        const found = window.shopItems[category].find(i => i.id === itemId);
                        if (found) {
                            item = { ...found, quantity };
                        }
                    });
                }
                
                if (item) {
                    items.push(item);
                }
            }
        });

        return items;
    }

    // Get total item count
    getTotalItemCount() {
        if (!window.gameState.inventory) return 0;

        let total = 0;
        Object.values(window.gameState.inventory).forEach(quantity => {
            total += quantity;
        });

        return total;
    }
}

// Initialize inventory manager globally
window.inventoryManager = new InventoryManager();

// Check expired buffs periodically
setInterval(() => {
    if (window.inventoryManager) {
        window.inventoryManager.checkExpiredBuffs();
    }
}, 60000); // Check every minute

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    if (window.inventoryManager) {
        window.inventoryManager.checkExpiredBuffs();
    }
});

