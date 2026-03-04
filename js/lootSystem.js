// ===================================
// LOOT SYSTEM
// Handles enemy loot drops and rewards
// ===================================

class LootSystem {
    constructor() {
        // Loot drop rates (percentage chance)
        this.dropRates = {
            potion: 30,           // 30% chance
            hyper_potion: 15,     // 15% chance
            attack_boost: 20,     // 20% chance
            defense_boost: 20,    // 20% chance
            nothing: 15           // 15% chance of no loot
        };
        
        // Loot item definitions
        this.lootItems = {
            potion: {
                id: 'health_potion',
                name: 'Potion',
                icon: '🧪',
                description: 'Restores 30 HP'
            },
            hyper_potion: {
                id: 'hyper_potion',
                name: 'Hyper Potion',
                icon: '💊',
                description: 'Restores 50 HP'
            },
            attack_boost: {
                id: 'attack_refill',
                name: 'Attack Boost',
                icon: '⚔️',
                description: 'Refills Attack Gauge'
            },
            defense_boost: {
                id: 'defense_refill',
                name: 'Defense Boost',
                icon: '🛡️',
                description: 'Refills Defense Gauge'
            }
        };
    }
    
    /**
     * Generate loot drops from defeated enemy
     * Returns array of loot items
     */
    generateLoot(enemy) {
        const lootDrops = [];
        
        // Determine number of drops (1-2 items, or nothing)
        const numDrops = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 2 : 0);
        
        if (numDrops === 0) {
            return lootDrops; // No loot
        }
        
        // Generate each loot drop
        for (let i = 0; i < numDrops; i++) {
            const lootType = this.rollLoot();
            
            if (lootType !== 'nothing') {
                const item = this.lootItems[lootType];
                if (item) {
                    // Check if item already in drops, increase quantity
                    const existing = lootDrops.find(drop => drop.id === item.id);
                    if (existing) {
                        existing.quantity++;
                    } else {
                        lootDrops.push({
                            ...item,
                            quantity: 1
                        });
                    }
                }
            }
        }

        return lootDrops;
    }
    
    /**
     * Roll for loot type based on drop rates
     */
    rollLoot() {
        const roll = Math.random() * 100;
        let cumulative = 0;
        
        for (const [type, rate] of Object.entries(this.dropRates)) {
            cumulative += rate;
            if (roll < cumulative) {
                return type;
            }
        }
        
        return 'nothing';
    }
    
    /**
     * Add loot to player inventory
     */
    addLootToInventory(lootDrops) {
        if (!window.inventoryManager) {
            console.error('[Loot] Inventory manager not found');
            return;
        }
        
        lootDrops.forEach(item => {
            window.inventoryManager.addItem(item.id, item.quantity);

        });
    }
    
    /**
     * Show loot modal with rewards
     */
    showLootModal(lootDrops, xpGained, enemyName) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'lootModalOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 24px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(139, 92, 246, 0.3);
            text-align: center;
            animation: slideUp 0.4s ease;
            position: relative;
        `;
        
        // Close button (X in upper right)
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            font-size: 24px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1.1)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            closeBtn.style.transform = 'scale(1)';
        };
        closeBtn.onclick = () => this.closeLootModal();
        
        // Victory title
        const title = document.createElement('div');
        title.innerHTML = '🎉 Victory!';
        title.style.cssText = `
            font-size: 36px;
            font-weight: 800;
            color: #fbbf24;
            margin-bottom: 16px;
            text-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
        `;
        
        // Enemy defeated message
        const message = document.createElement('div');
        message.innerHTML = `You defeated the ${enemyName}!`;
        message.style.cssText = `
            font-size: 18px;
            color: #e2e8f0;
            margin-bottom: 24px;
            font-weight: 500;
        `;
        
        // XP earned
        const xpDisplay = document.createElement('div');
        xpDisplay.innerHTML = `✨ +${xpGained} XP earned!`;
        xpDisplay.style.cssText = `
            font-size: 20px;
            color: #8b5cf6;
            font-weight: 700;
            margin-bottom: 24px;
            padding: 12px 24px;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(139, 92, 246, 0.3);
        `;
        
        // Loot section
        if (lootDrops.length > 0) {
            const lootTitle = document.createElement('div');
            lootTitle.innerHTML = '🎁 Loot Dropped:';
            lootTitle.style.cssText = `
                font-size: 18px;
                color: #fbbf24;
                font-weight: 700;
                margin-bottom: 16px;
            `;
            
            const lootContainer = document.createElement('div');
            lootContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
                margin-bottom: 24px;
            `;
            
            lootDrops.forEach(item => {
                const lootItem = document.createElement('div');
                lootItem.style.cssText = `
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    transition: all 0.2s ease;
                `;
                lootItem.onmouseover = () => {
                    lootItem.style.background = 'rgba(255, 255, 255, 0.1)';
                    lootItem.style.transform = 'translateY(-2px)';
                };
                lootItem.onmouseout = () => {
                    lootItem.style.background = 'rgba(255, 255, 255, 0.05)';
                    lootItem.style.transform = 'translateY(0)';
                };
                
                lootItem.innerHTML = `
                    <div style="font-size: 32px; margin-bottom: 8px;">${item.icon}</div>
                    <div style="font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px;">${item.name}</div>
                    <div style="font-size: 12px; color: #94a3b8;">${item.description}</div>
                    <div style="font-size: 16px; font-weight: 700; color: #8b5cf6; margin-top: 8px;">x${item.quantity}</div>
                `;
                
                lootContainer.appendChild(lootItem);
            });
            
            modal.appendChild(lootTitle);
            modal.appendChild(lootContainer);
        } else {
            const noLoot = document.createElement('div');
            noLoot.innerHTML = 'No loot dropped this time.';
            noLoot.style.cssText = `
                font-size: 14px;
                color: #94a3b8;
                margin-bottom: 24px;
                font-style: italic;
            `;
            modal.appendChild(noLoot);
        }
        
        // Encouragement message
        const encouragement = document.createElement('div');
        encouragement.innerHTML = 'Great job, keep it up! 💪';
        encouragement.style.cssText = `
            font-size: 16px;
            color: #10b981;
            font-weight: 600;
            margin-bottom: 24px;
        `;
        
        // OK button
        const okButton = document.createElement('button');
        okButton.innerHTML = 'OK';
        okButton.style.cssText = `
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 14px 48px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        `;
        okButton.onmouseover = () => {
            okButton.style.transform = 'translateY(-2px)';
            okButton.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
        };
        okButton.onmouseout = () => {
            okButton.style.transform = 'translateY(0)';
            okButton.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
        };
        okButton.onclick = () => this.closeLootModal();
        
        // Assemble modal
        modal.appendChild(closeBtn);
        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(xpDisplay);
        modal.appendChild(encouragement);
        modal.appendChild(okButton);
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Close loot modal
     */
    closeLootModal() {
        const overlay = document.getElementById('lootModalOverlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                overlay.remove();
                
                // Show world map after loot modal closes
                if (window._pendingWorldMapContext && window.taskWorldMap) {
                    setTimeout(() => {
                        window.taskWorldMap.show(window._pendingWorldMapContext);
                        window._pendingWorldMapContext = null;
                    }, 500);
                }
            }, 200);
        }
    }
}

// Initialize loot system
window.lootSystem = new LootSystem();
