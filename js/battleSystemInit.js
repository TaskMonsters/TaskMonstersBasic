/**
 * BATTLE SYSTEM INITIALIZATION
 * Connects all battle modules and integrates with task completion
 */

(function() {
    'use strict';

    // Wait for DOM and all modules to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBattleSystem);
    } else {
        initBattleSystem();
    }
    
    function initBattleSystem() {
        // Check if all required classes are loaded
        if (typeof BattleEngine === 'undefined' ||
            typeof BattleAI === 'undefined' ||
            typeof ThreatSystem === 'undefined' ||
            typeof EnemyMemorySystem === 'undefined' ||
            typeof BattleSpecialSystems === 'undefined' ||
            typeof BattleAudioManager === 'undefined' ||
            typeof BattleEffectsManager === 'undefined' ||
            typeof BattleArenasManager === 'undefined') {
            console.error('❌ Battle system modules not loaded');
            return;
        }
        
        // Initialize subsystems

        // Create global instances
        window.battleThreatSystem = new ThreatSystem();
        window.battleMemorySystem = new EnemyMemorySystem();
        window.battleAudioManager = new BattleAudioManager();
        window.battleEffectsManager = new BattleEffectsManager();
        window.battleArenasManager = new BattleArenasManager();
        
        // Initialize battle engine (already created globally)
        if (window.battleEngine) {
            // Connect subsystems to battle engine
            window.battleEngine.threatSystem = window.battleThreatSystem;
            window.battleEngine.memorySystem = window.battleMemorySystem;
            window.battleEngine.audioManager = window.battleAudioManager;
            window.battleEngine.effectsManager = window.battleEffectsManager;
            window.battleEngine.arenaManager = window.battleArenasManager;
            
            // Initialize AI with battle engine
            window.battleEngine.enemyAI = new BattleAI(window.battleEngine);
            
            // Initialize special systems
            window.battleSpecialSystems = new BattleSpecialSystems(window.battleEngine);

        } else {
            console.error('❌ Battle Engine not found');
            return;
        }
        
        // Preload audio
        window.battleAudioManager.preloadSounds();
        
        // Initialize Focus Charge in gameState
        if (typeof gameState !== 'undefined') {
            window.battleSpecialSystems.initializeFocusCharge();
        }
        
        // Hook into focus timer
        hookFocusTimer();



    }
    
    
    /**
     * HOOK FOCUS TIMER
     * Award Focus Charge when focus sessions complete
     */
    function hookFocusTimer() {
        // Look for focus timer completion
        // This depends on your focus timer implementation
        
        // Option 1: Hook into existing focus timer function
        if (typeof window.onFocusSessionComplete !== 'undefined') {
            const originalOnFocusSessionComplete = window.onFocusSessionComplete;
            
            window.onFocusSessionComplete = function(duration) {
                // Call original
                if (originalOnFocusSessionComplete) {
                    originalOnFocusSessionComplete.call(this, duration);
                }
                
                // Award Focus Charge
                window.battleSpecialSystems.onFocusSessionComplete(duration);
            };

        }
        
        // Option 2: Listen for custom events
        document.addEventListener('focusSessionComplete', function(event) {
            const duration = event.detail?.duration || 1500; // Default 25 min
            window.battleSpecialSystems.onFocusSessionComplete(duration);
        });

    }
    
    /**
     * EXPOSE DEBUG FUNCTIONS
     */
    window.battleDebug = {
        // Start test battle
        startTestBattle: function(difficulty = 'standard') {

            window.battleEngine.startBattle(difficulty, { test: true });
        },
        
        // Get threat info
        getThreatInfo: function() {
            return {
                score: window.battleThreatSystem.threatScore,
                level: window.battleThreatSystem.getThreatLevel(),
                multiplier: window.battleThreatSystem.getThreatMultiplier()
            };
        },
        
        // Get enemy memory
        getEnemyMemory: function(enemyId) {
            return window.battleMemorySystem.getMemory(enemyId);
        },
        
        // Get all memories
        getAllMemories: function() {
            return window.battleMemorySystem.getAllMemories();
        },
        
        // Add Focus Charge
        addFocusCharge: function(amount = 25) {
            window.battleSpecialSystems.addFocusCharge(amount);
        },
        
        // Reset threat
        resetThreat: function() {
            window.battleThreatSystem.reset();

        },
        
        // Reset all memories
        resetMemories: function() {
            window.battleMemorySystem.reset();

        },
        
        // List all enemies
        listEnemies: function() {
            const playerLevel = gameState?.level || 5;
            const available = getAvailableEnemies(playerLevel, 'standard');

            return available;
        },
        
        // Fight specific enemy
        fightEnemy: function(enemyId) {
            if (!BATTLE_ENEMIES[enemyId]) {
                console.error('Enemy not found:', enemyId);
                return;
            }
            
            // Temporarily override enemy selection
            const originalStart = window.battleEngine.startBattle;
            window.battleEngine.startBattle = function(difficulty, taskData) {
                const playerLevel = gameState?.level || 5;
                const enemyConfig = BATTLE_ENEMIES[enemyId];
                const scaledStats = scaleEnemyStats(enemyConfig, playerLevel);
                
                // Initialize battle with specific enemy
                this.currentBattle = {
                    id: Date.now(),
                    difficulty,
                    startTime: Date.now(),
                    turnCount: 0,
                    player: {
                        name: gameState?.selectedMonster || 'Nova',
                        level: playerLevel,
                        hp: gameState?.hp || 100,
                        maxHp: gameState?.maxHp || 100,
                        attack: gameState?.attack || 50,
                        maxAttack: gameState?.maxAttack || 100,
                        defense: gameState?.defense || 50,
                        maxDefense: gameState?.maxDefense || 100,
                        focusCharge: gameState?.focusCharge || 0,
                        maxFocusCharge: 100,
                        isDefending: false,
                        effects: []
                    },
                    enemy: {
                        id: enemyId,
                        name: enemyConfig.name,
                        tier: enemyConfig.tier,
                        instinct: enemyConfig.instinct,
                        hp: scaledStats.hp,
                        maxHp: scaledStats.hp,
                        attack: scaledStats.attack,
                        maxAttack: scaledStats.attack,
                        defense: scaledStats.defense,
                        maxDefense: scaledStats.defense,
                        isDefending: false,
                        effects: [],
                        abilities: enemyConfig.abilities,
                        abilityCooldowns: {},
                        config: enemyConfig
                    },
                    log: [],
                    arena: this.selectArena(playerLevel),
                    loot: null,
                    taskData
                };
                
                if (this.enemyAI) {
                    this.enemyAI.initializeBattle(this.currentBattle);
                }
                
                this.isActive = true;
                
                // Set arena background
                if (this.arenaManager) {
                    this.arenaManager.setArenaBackground(this.currentBattle.arena);
                }

                this.renderBattleUI();
                
                if (this.audioManager) {
                    this.audioManager.playBattleMusic(this.currentBattle.arena);
                }
                
                this.addLog(`A wild ${enemyConfig.name} appeared!`);
                
                // Restore original function
                window.battleEngine.startBattle = originalStart;
            };
            
            window.battleEngine.startBattle('standard', { debug: true });
        }
    };










})();

// Define the missing global function to be called from index.html
window.maybeTriggerBattle = function(taskType, taskData = {}) {
    if (!window.battleEngine || typeof window.battleEngine.checkBattleTrigger !== 'function') {
        console.warn('⚠️ Battle trigger system not loaded or ready yet.');
        return false; // Indicate that battle did not trigger
    }
    // Delegate the trigger check to the battle engine
    return window.battleEngine.checkBattleTrigger(taskType, taskData);
};
