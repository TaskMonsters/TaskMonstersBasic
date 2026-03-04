/**
 * BATTLE SPECIAL SYSTEMS
 * Focus Charge attacks and Illusion Realm bat hazards
 */

class BattleSpecialSystems {
    constructor(battleEngine) {
        this.battleEngine = battleEngine;
        
        // Focus Charge configuration
        this.focusChargeConfig = {
            maxCharge: 100,
            chargePerFocusSession: 25, // 25% per focus session completed
            damage: 45,
            animationDuration: 2000 // 2 seconds
        };
        
        // Illusion Realm configuration
        this.illusionRealmConfig = {
            batHazardChance: 0.05, // 5% chance per turn
            batDamage: 10,
            illusionArenas: ['forest_of_illusions', 'fort_of_illusions']
        };
    }
    
    /**
     * FOCUS CHARGE SYSTEM
     */
    
    /**
     * Add Focus Charge from focus timer
     * Called when player completes a focus session
     */
    addFocusCharge(amount = null) {
        if (!gameState) return;
        
        const chargeAmount = amount || this.focusChargeConfig.chargePerFocusSession;
        
        gameState.focusCharge = Math.min(
            this.focusChargeConfig.maxCharge,
            (gameState.focusCharge || 0) + chargeAmount
        );
        
        // Show notification
        this.showFocusChargeNotification(chargeAmount);

    }
    
    /**
     * Check if Focus Charge is ready
     */
    isFocusChargeReady() {
        if (!gameState) return false;
        return (gameState.focusCharge || 0) >= this.focusChargeConfig.maxCharge;
    }
    
    /**
     * Use Focus Charge in battle
     * Called from battleEngine.playerUseFocusCharge()
     */
    useFocusCharge(battle) {
        if (!this.isFocusChargeReady()) {
            return false;
        }
        
        const enemy = battle.enemy;
        const damage = this.focusChargeConfig.damage;
        
        // Deal guaranteed damage (bypasses defense)
        enemy.hp = Math.max(0, enemy.hp - damage);
        
        // Reset Focus Charge
        if (gameState) {
            gameState.focusCharge = 0;
        }
        
        battle.player.focusCharge = 0;
        
        // Log
        this.battleEngine.addLog(`⚡ FOCUS CHARGE! ${damage} damage dealt!`);
        
        // Visual effect
        if (this.battleEngine.effectsManager) {
            this.battleEngine.effectsManager.showFocusChargeAttack();
            this.battleEngine.effectsManager.showDamageNumber(damage, 'enemy', true);
        }
        
        // Play sound
        if (this.battleEngine.audioManager) {
            this.battleEngine.audioManager.playSound('focus_charge');
        }
        
        // Track for enemy memory
        if (this.battleEngine.memorySystem) {
            this.battleEngine.memorySystem.trackAction(enemy.id, 'focus_charge');
        }
        
        return true;
    }
    
    /**
     * Show Focus Charge notification
     */
    showFocusChargeNotification(amount) {
        const notification = document.createElement('div');
        notification.className = 'focus-charge-notification';
        notification.innerHTML = `
            <div class="focus-charge-content">
                <span class="focus-charge-icon">⚡</span>
                <span class="focus-charge-text">Focus Charge +${amount}%</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * ILLUSION REALM BAT HAZARDS
     */
    
    /**
     * Check for bat hazard
     * Called at start of each turn in Illusion Realm arenas
     */
    checkBatHazard(battle) {
        // Only in Illusion Realm arenas
        if (!this.illusionRealmConfig.illusionArenas.includes(battle.arena)) {
            return false;
        }
        
        // 5% chance
        if (Math.random() > this.illusionRealmConfig.batHazardChance) {
            return false;
        }
        
        // Trigger bat hazard
        this.triggerBatHazard(battle);
        return true;
    }
    
    /**
     * Trigger bat hazard
     */
    triggerBatHazard(battle) {
        const player = battle.player;
        const damage = this.illusionRealmConfig.batDamage;
        
        // Deal damage to player
        player.hp = Math.max(0, player.hp - damage);
        
        // Log
        this.battleEngine.addLog(`🦇 A bat swoops down! ${damage} damage!`);
        
        // Visual effect
        if (this.battleEngine.effectsManager) {
            this.battleEngine.effectsManager.showBatHazard();
            this.battleEngine.effectsManager.showDamageNumber(damage, 'player');
        }
        
        // Play sound
        if (this.battleEngine.audioManager) {
            this.battleEngine.audioManager.playSound('bat_hazard');
        }
        
        // Update UI
        this.battleEngine.updateBattleUI();
        
        // Check if player defeated
        if (player.hp <= 0) {
            this.battleEngine.endBattle('defeat');
        }
    }
    
    /**
     * INTEGRATION WITH FOCUS TIMER
     */
    
    /**
     * Hook into focus timer completion
     * This should be called from the focus timer system
     */
    onFocusSessionComplete(duration) {
        // Award Focus Charge based on duration
        // Standard session (25 min) = 25% charge
        // Longer sessions = proportionally more
        
        const standardDuration = 25 * 60; // 25 minutes in seconds
        const chargeAmount = Math.min(
            100,
            Math.floor((duration / standardDuration) * this.focusChargeConfig.chargePerFocusSession)
        );
        
        this.addFocusCharge(chargeAmount);
    }
    
    /**
     * Initialize Focus Charge in gameState
     */
    initializeFocusCharge() {
        if (gameState && gameState.focusCharge === undefined) {
            gameState.focusCharge = 0;
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.BattleSpecialSystems = BattleSpecialSystems;
}
