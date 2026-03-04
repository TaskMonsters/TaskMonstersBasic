/**
 * ENEMY MEMORY SYSTEM
 * Tracks player patterns and adapts enemy behavior
 * Used by elite enemies (tier 4-5)
 */

class EnemyMemorySystem {
    constructor() {
        this.memories = {}; // enemyId -> memory data
        
        // Load from localStorage
        this.load();
    }
    
    /**
     * LOAD MEMORY for specific enemy
     */
    loadMemory(enemyId) {
        if (!this.memories[enemyId]) {
            this.memories[enemyId] = this.createEmptyMemory();
        }
        
        return this.memories[enemyId];
    }
    
    /**
     * CREATE EMPTY MEMORY structure
     */
    createEmptyMemory() {
        return {
            encounterCount: 0,
            victories: 0,
            defeats: 0,
            flees: 0,
            
            // Player behavior patterns
            playerPatterns: {
                attackFrequency: 0.5,      // How often player attacks (0-1)
                defendFrequency: 0.2,      // How often player defends (0-1)
                itemUsageFrequency: 0.2,   // How often player uses items (0-1)
                focusChargeFrequency: 0.1, // How often player uses Focus Charge (0-1)
                
                // Specific behaviors
                usesItemsWhenLowHP: false,
                defendsWhenLowHP: false,
                aggressiveWhenWinning: false,
                
                // Item preferences
                favoriteItems: {},
                
                // Combat stats
                averageTurnsToWin: 0,
                averageDamagePerTurn: 0
            },
            
            // Last battle data
            lastBattle: null,
            
            // Timestamps
            firstEncounter: Date.now(),
            lastEncounter: Date.now()
        };
    }
    
    /**
     * TRACK PLAYER ACTION
     * Called during battle to record player behavior
     */
    trackAction(enemyId, actionType, context = {}) {
        const memory = this.loadMemory(enemyId);
        
        // Update action frequencies using exponential moving average
        const alpha = 0.2; // Learning rate
        
        switch (actionType) {
            case 'attack':
                memory.playerPatterns.attackFrequency = 
                    (1 - alpha) * memory.playerPatterns.attackFrequency + alpha * 1;
                
                // Adjust other frequencies down
                memory.playerPatterns.defendFrequency *= (1 - alpha);
                memory.playerPatterns.itemUsageFrequency *= (1 - alpha);
                memory.playerPatterns.focusChargeFrequency *= (1 - alpha);
                break;
                
            case 'defend':
                memory.playerPatterns.defendFrequency = 
                    (1 - alpha) * memory.playerPatterns.defendFrequency + alpha * 1;
                
                memory.playerPatterns.attackFrequency *= (1 - alpha);
                memory.playerPatterns.itemUsageFrequency *= (1 - alpha);
                memory.playerPatterns.focusChargeFrequency *= (1 - alpha);
                
                // Check if defending when low HP
                if (context.playerHPPercent && context.playerHPPercent < 0.3) {
                    memory.playerPatterns.defendsWhenLowHP = true;
                }
                break;
                
            case 'item':
                memory.playerPatterns.itemUsageFrequency = 
                    (1 - alpha) * memory.playerPatterns.itemUsageFrequency + alpha * 1;
                
                memory.playerPatterns.attackFrequency *= (1 - alpha);
                memory.playerPatterns.defendFrequency *= (1 - alpha);
                memory.playerPatterns.focusChargeFrequency *= (1 - alpha);
                
                // Track favorite items
                if (context.itemId) {
                    memory.playerPatterns.favoriteItems[context.itemId] = 
                        (memory.playerPatterns.favoriteItems[context.itemId] || 0) + 1;
                }
                
                // Check if using items when low HP
                if (context.playerHPPercent && context.playerHPPercent < 0.3) {
                    memory.playerPatterns.usesItemsWhenLowHP = true;
                }
                break;
                
            case 'focus_charge':
                memory.playerPatterns.focusChargeFrequency = 
                    (1 - alpha) * memory.playerPatterns.focusChargeFrequency + alpha * 1;
                
                memory.playerPatterns.attackFrequency *= (1 - alpha);
                memory.playerPatterns.defendFrequency *= (1 - alpha);
                memory.playerPatterns.itemUsageFrequency *= (1 - alpha);
                break;
        }
        
        // Normalize frequencies to sum to 1
        const total = 
            memory.playerPatterns.attackFrequency +
            memory.playerPatterns.defendFrequency +
            memory.playerPatterns.itemUsageFrequency +
            memory.playerPatterns.focusChargeFrequency;
        
        if (total > 0) {
            memory.playerPatterns.attackFrequency /= total;
            memory.playerPatterns.defendFrequency /= total;
            memory.playerPatterns.itemUsageFrequency /= total;
            memory.playerPatterns.focusChargeFrequency /= total;
        }
        
        this.save();
    }
    
    /**
     * TRACK ITEM USE
     */
    trackItemUse(itemId) {
        // This is called from battleEngine for current enemy
        if (battleEngine && battleEngine.currentBattle) {
            const enemyId = battleEngine.currentBattle.enemy.id;
            const playerHPPercent = battleEngine.currentBattle.player.hp / battleEngine.currentBattle.player.maxHp;
            
            this.trackAction(enemyId, 'item', { 
                itemId, 
                playerHPPercent 
            });
        }
    }
    
    /**
     * TRACK FLEE
     */
    trackFlee() {
        if (battleEngine && battleEngine.currentBattle) {
            const enemyId = battleEngine.currentBattle.enemy.id;
            const memory = this.loadMemory(enemyId);
            
            memory.flees++;
            memory.lastEncounter = Date.now();
            
            this.save();
        }
    }
    
    /**
     * SAVE BATTLE RESULTS
     * Called at end of battle
     */
    saveMemory(battle) {
        const enemyId = battle.enemy.id;
        const memory = this.loadMemory(enemyId);
        
        // Update encounter stats
        memory.encounterCount++;
        memory.lastEncounter = Date.now();
        
        if (battle.result === 'victory') {
            memory.defeats++; // Enemy was defeated
        } else if (battle.result === 'defeat') {
            memory.victories++; // Enemy won
        } else if (battle.result === 'fled') {
            memory.flees++;
        }
        
        // Calculate combat stats
        const turnsToEnd = battle.turnCount;
        memory.playerPatterns.averageTurnsToWin = 
            (memory.playerPatterns.averageTurnsToWin * (memory.encounterCount - 1) + turnsToEnd) / memory.encounterCount;
        
        // Store last battle data
        memory.lastBattle = {
            result: battle.result,
            turnCount: battle.turnCount,
            timestamp: battle.endTime,
            playerLevel: battle.player.level
        };
        
        this.save();

    }
    
    /**
     * GET MEMORY for AI decision-making
     */
    getMemory(enemyId) {
        return this.memories[enemyId] || this.createEmptyMemory();
    }
    
    /**
     * PREDICT PLAYER ACTION
     * Returns most likely player action based on patterns
     */
    predictPlayerAction(enemyId, context = {}) {
        const memory = this.getMemory(enemyId);
        const patterns = memory.playerPatterns;
        
        // Adjust predictions based on context
        let predictions = {
            attack: patterns.attackFrequency,
            defend: patterns.defendFrequency,
            item: patterns.itemUsageFrequency,
            focus_charge: patterns.focusChargeFrequency
        };
        
        // If player is low HP, adjust predictions
        if (context.playerHPPercent && context.playerHPPercent < 0.3) {
            if (patterns.usesItemsWhenLowHP) {
                predictions.item *= 2;
            }
            if (patterns.defendsWhenLowHP) {
                predictions.defend *= 1.5;
            }
        }
        
        // Normalize
        const total = Object.values(predictions).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
            for (const key in predictions) {
                predictions[key] /= total;
            }
        }
        
        // Return most likely action
        return Object.keys(predictions).reduce((a, b) => 
            predictions[a] > predictions[b] ? a : b
        );
    }
    
    /**
     * GET COUNTER STRATEGY
     * Returns recommended enemy action to counter player patterns
     */
    getCounterStrategy(enemyId, context = {}) {
        const memory = this.getMemory(enemyId);
        const patterns = memory.playerPatterns;
        
        // If player attacks frequently, recommend defense
        if (patterns.attackFrequency > 0.6) {
            return 'defend_more';
        }
        
        // If player uses items frequently, recommend pressure
        if (patterns.itemUsageFrequency > 0.3) {
            return 'aggressive';
        }
        
        // If player is defensive, recommend debuffs
        if (patterns.defendFrequency > 0.4) {
            return 'use_debuffs';
        }
        
        // If player uses Focus Charge often, save defensive abilities
        if (patterns.focusChargeFrequency > 0.2) {
            return 'save_defense';
        }
        
        return 'balanced';
    }
    
    /**
     * PERSISTENCE
     */
    save() {
        try {
            localStorage.setItem('enemyMemories', JSON.stringify(this.memories));
        } catch (e) {
            console.error('Failed to save enemy memories:', e);
        }
    }
    
    load() {
        try {
            const data = localStorage.getItem('enemyMemories');
            if (data) {
                this.memories = JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load enemy memories:', e);
            this.memories = {};
        }
    }
    
    reset() {
        this.memories = {};
        this.save();
    }
    
    /**
     * DEBUG: Get all memories
     */
    getAllMemories() {
        return this.memories;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.EnemyMemorySystem = EnemyMemorySystem;
}
