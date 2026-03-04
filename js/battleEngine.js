/**
 * BATTLE ENGINE - Core turn-based combat system
 * Handles battle triggers, combat mechanics, gauges, and win/loss economy
 */

class BattleEngine {
    constructor() {
        this.isActive = false;
        this.currentBattle = null;
        this.battleHistory = [];
        
        // Battle configuration
        this.config = {
            unlockLevel: 5,
            battleChance: {
                easy: 0.20,      // 20% chance
                standard: 0.30,  // 30% chance
                none: 0.50       // 50% no battle
            },
            itemPowerBoost: 0.20, // 20% boost to all battle items
            focusChargeDamage: 45 // Focus Charge attack damage
        };
        
        // Initialize subsystems
        this.initializeSubsystems();
    }
    
    initializeSubsystems() {
        // Will be populated by other modules
        this.enemyAI = null;
        this.threatSystem = null;
        this.memorySystem = null;
        this.arenaManager = null;
        this.audioManager = null;
        this.effectsManager = null;
    }
    
    /**
     * BATTLE TRIGGER SYSTEM
     * Called when user completes any task
     */
    checkBattleTrigger(taskType, taskData) {
        // Check if battle mode is unlocked
        if (!this.isBattleModeUnlocked()) {
            return false;
        }
        
        // Roll for battle
        const roll = Math.random();
        let battleType = null;
        
        if (roll < this.config.battleChance.easy) {
            battleType = 'easy';
        } else if (roll < this.config.battleChance.easy + this.config.battleChance.standard) {
            battleType = 'standard';
        } else {
            // No battle
            return false;
        }
        
        // Trigger battle
        this.startBattle(battleType, taskData);
        return true;
    }
    
    isBattleModeUnlocked() {
        // CRITICAL: Battle mode disabled if monster is in egg state
        if (gameState?.isEgg === true) {

            return false;
        }
        
        const playerLevel = gameState?.jerryLevel || 1;
        const isUnlocked = playerLevel >= this.config.unlockLevel;
        
        if (!isUnlocked) {

        }
        
        return isUnlocked;
    }
    
    /**
     * START BATTLE
     * Initialize battle state and UI
     */
    startBattle(difficulty, taskData = {}) {
        if (this.isActive) {
            console.warn('Battle already in progress');
            return;
        }
        
        const playerLevel = gameState?.jerryLevel || 5;
        
        // Select enemy
        const availableEnemies = getAvailableEnemies(playerLevel, difficulty);
        if (availableEnemies.length === 0) {
            console.error('No enemies available for level', playerLevel);
            return;
        }
        
        // getAvailableEnemies now returns a single enemy in alternating order
        const enemyId = availableEnemies[0];
        const enemyConfig = BATTLE_ENEMIES[enemyId];
        const scaledStats = scaleEnemyStats(enemyConfig, playerLevel);
        
        // Initialize battle state
        this.currentBattle = {
            id: Date.now(),
            difficulty,
            startTime: Date.now(),
            turnCount: 0,
            
            // Player state
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
            
            // Enemy state
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
            
            // Battle log
            log: [],
            
            // Arena
            arena: this.selectArena(playerLevel),
            
            // Loot
            loot: null,
            
            // Task context
            taskData
        };
        
        // Initialize enemy AI for this battle
        if (this.enemyAI) {
            this.enemyAI.initializeBattle(this.currentBattle);
        }
        
        // Load enemy memory if elite
        if (enemyConfig.hasMemory && this.memorySystem) {
            this.memorySystem.loadMemory(enemyId);
        }
        
        // Set battle flag
        this.isActive = true;
        
        // Set arena background
        if (this.arenaManager) {
            this.arenaManager.setArenaBackground(this.currentBattle.arena);
        }

        // Render battle UI
        this.renderBattleUI();
        
        // Play battle music
        if (this.audioManager) {
            this.audioManager.playBattleMusic(this.currentBattle.arena);
        }
        
        // Add to log
        this.addLog(`A wild ${enemyConfig.name} appeared!`);

    }
    
    /**
     * SELECT ARENA based on player level
     */
    selectArena(playerLevel) {
        if (this.arenaManager) {
            return this.arenaManager.selectArena(playerLevel);
        }
        
        // Fallback
        return 'city_sunset';
    }
    
    /**
     * PLAYER ACTIONS
     */
    
    playerAttack() {
        if (!this.canPlayerAct()) return;
        
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Check if player has enough attack gauge
        if (player.attack < 10) {
            this.addLog('Not enough attack gauge!');
            return;
        }
        
        // Calculate damage
        let damage = Math.floor(10 + (player.attack * 0.3));
        
        // Apply enemy defense if defending
        if (enemy.isDefending && enemy.defense > 0) {
            const absorbed = Math.min(damage, enemy.defense);
            enemy.defense -= absorbed;
            damage -= absorbed;
            this.addLog(`${enemy.name} blocked ${absorbed} damage!`);
        }
        
        // Apply remaining damage to HP
        if (damage > 0) {
            enemy.hp = Math.max(0, enemy.hp - damage);
            this.addLog(`You dealt ${damage} damage!`);
            
            // Visual effect
            if (this.effectsManager) {
                this.effectsManager.showDamageNumber(damage, 'enemy');
                this.effectsManager.playAttackAnimation('player');
                
                // Show Fire Pig projectile if equipped
                const equippedSkin = window.gameState?.equippedSkinId || null;
                if (equippedSkin && equippedSkin.toLowerCase().includes('pig')) {
                    this.effectsManager.showProjectile('fire-pig', 'player', 'enemy');
                }
            }
        }
        
        // Consume attack gauge
        player.attack = Math.max(0, player.attack - 10);
        
        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('player_attack');
        }
        
        // Update UI
        this.updateBattleUI();
        
        // Check if enemy defeated
        if (enemy.hp <= 0) {
            this.endBattle('victory');
            return;
        }
        
        // Enemy turn
        this.enemyTurn();
    }
    
    playerDefend() {
        if (!this.canPlayerAct()) return;
        
        const battle = this.currentBattle;
        const player = battle.player;
        
        // Check if player has enough defense gauge
        if (player.defense < 5) {
            this.addLog('Not enough defense gauge!');
            return;
        }
        
        // Set defending flag
        player.isDefending = true;
        
        // Boost defense temporarily
        const defenseBoost = 15;
        player.defense = Math.min(player.maxDefense, player.defense + defenseBoost);
        
        this.addLog('You brace for impact!');
        
        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('defend');
        }
        
        // Update UI
        this.updateBattleUI();
        
        // Enemy turn
        this.enemyTurn();
    }
    
    playerUseFocusCharge() {
        if (!this.canPlayerAct()) return;
        
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Check if Focus Charge is available
        if (player.focusCharge < player.maxFocusCharge) {
            this.addLog('Focus Charge not ready!');
            return;
        }
        
        // Deal guaranteed damage (bypasses defense)
        const damage = this.config.focusChargeDamage;
        enemy.hp = Math.max(0, enemy.hp - damage);
        
        this.addLog(`Focus Charge! ${damage} damage dealt!`);
        
        // Visual effect
        if (this.effectsManager) {
            this.effectsManager.showFocusChargeAttack();
            this.effectsManager.showDamageNumber(damage, 'enemy');
        }
        
        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('focus_charge');
        }
        
        // Consume Focus Charge
        player.focusCharge = 0;
        
        // Update UI
        this.updateBattleUI();
        
        // Check if enemy defeated
        if (enemy.hp <= 0) {
            this.endBattle('victory');
            return;
        }
        
        // Enemy turn
        this.enemyTurn();
    }
    
    playerUseSpecialAttack() {
        // Alias for playerUseFocusCharge for UI compatibility
        return this.playerUseFocusCharge();
    }
    
    playerUseItem(itemId) {
        if (!this.canPlayerAct()) return;
        
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Check if player has item
        const inventory = gameState?.inventory || {};
        if (!inventory[itemId] || inventory[itemId] <= 0) {
            this.addLog('You don\'t have that item!');
            return;
        }
        
        // Get item config (with power boost)
        const item = this.getItemConfig(itemId);
        if (!item) {
            this.addLog('Invalid item!');
            return;
        }
        
        // Apply item effect
        this.applyItemEffect(item, player, enemy);
        
        // Consume item
        inventory[itemId]--;
        
        // Track item usage for enemy memory
        if (this.memorySystem) {
            this.memorySystem.trackItemUse(itemId);
        }
        
        // Update UI
        this.updateBattleUI();
        
        // Check if enemy defeated
        if (enemy.hp <= 0) {
            this.endBattle('victory');
            return;
        }
        
        // Enemy turn
        this.enemyTurn();
    }
    
    playerFlee() {
        if (!this.canPlayerAct()) return;
        
        // Calculate flee success chance (decreases with enemy tier)
        const enemy = this.currentBattle.enemy;
        const fleeChance = Math.max(0.3, 0.9 - (enemy.tier * 0.1));
        
        if (Math.random() < fleeChance) {
            this.addLog('You fled successfully!');
            
            // Increase threat for fleeing
            if (this.threatSystem) {
                this.threatSystem.adjustThreat(10);
            }
            
            // Track flee for enemy memory
            if (this.memorySystem) {
                this.memorySystem.trackFlee();
            }
            
            this.endBattle('fled');
        } else {
            this.addLog('Failed to flee!');
            
            // Enemy gets free attack
            this.enemyTurn();
        }
    }
    
    /**
     * ENEMY TURN
     * Delegates to AI system
     */
    enemyTurn() {
        if (!this.isActive) return;
        
        const battle = this.currentBattle;
        battle.turnCount++;
        
        // Reset defending flag
        battle.player.isDefending = false;
        battle.enemy.isDefending = false;
        
        // Enemy AI decides action with special attack abilities enabled
        if (this.enemyAI) {
            setTimeout(() => {
                // CRITICAL FIX: Ensure AI system uses special abilities
                this.enemyAI.takeTurn(battle);
            }, 800); // Delay for better UX
        } else {
            // Fallback: simple attack
            this.enemyBasicAttack();
        }
    }
    
    /**
     * ENEMY BASIC ATTACK (fallback)
     */
    enemyBasicAttack() {
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // 30% chance to use special attack if enemy HP is below 50%
        const enemyHPPercent = (enemy.hp / enemy.maxHp) * 100;
        const useSpecialAttack = enemyHPPercent < 50 && Math.random() < 0.3;
        
        if (useSpecialAttack) {
            this.enemySpecialAttack();
            return;
        }
        
        // Calculate damage
        let damage = Math.floor(5 + (enemy.attack * 0.25));
        
        // Apply player defense if defending
        if (player.isDefending && player.defense > 0) {
            const absorbed = Math.min(damage, player.defense);
            player.defense -= absorbed;
            damage -= absorbed;
            this.addLog(`You blocked ${absorbed} damage!`);
        }
        
        // Apply remaining damage to HP
        if (damage > 0) {
            player.hp = Math.max(0, player.hp - damage);
            this.addLog(`${enemy.name} dealt ${damage} damage!`);
            
            // Visual effect
            if (this.effectsManager) {
                this.effectsManager.showDamageNumber(damage, 'player');
                this.effectsManager.playAttackAnimation('enemy');
                
                // Show enemy projectile based on enemy type
                const enemyName = enemy.name.toLowerCase();
                if (enemyName.includes('phantom') || enemyName.includes('ghost')) {
                    this.effectsManager.showProjectile('phantom', 'enemy', 'player');
                } else if (enemyName.includes('medusa')) {
                    this.effectsManager.showProjectile('medusa', 'enemy', 'player');
                } else if (enemyName.includes('mushroom')) {
                    this.effectsManager.showProjectile('mushroom', 'enemy', 'player');
                } else if (enemyName.includes('drone') || enemyName.includes('sentry')) {
                    this.effectsManager.showProjectile('drone', 'enemy', 'player');
                } else if (enemyName.includes('procrastinator')) {
                    this.effectsManager.showProjectile('procrastinator', 'enemy', 'player');
                } else if (enemyName.includes('alien')) {
                    this.effectsManager.showProjectile('alien', 'enemy', 'player');
                } else if (enemyName.includes('vampire') || enemyName.includes('bat')) {
                    this.effectsManager.showProjectile('vampire-bat', 'enemy', 'player');
                }
            }
        }
        
        // Update UI
        this.updateBattleUI();
        
        // Check if player defeated
        if (player.hp <= 0) {
            this.endBattle('defeat');
            return;
        }
        
        // Regenerate gauges
        this.regenerateGauges();
    }
    
    /**
     * ENEMY SPECIAL ATTACK
     */
    enemySpecialAttack() {
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Special attack does 1.5x damage
        let damage = Math.floor((5 + (enemy.attack * 0.25)) * 1.5);
        
        this.addLog(`⚡ ${enemy.name} used a SPECIAL ATTACK!`);
        
        // Apply player defense if defending
        if (player.isDefending && player.defense > 0) {
            const absorbed = Math.min(damage, player.defense);
            player.defense -= absorbed;
            damage -= absorbed;
            this.addLog(`You blocked ${absorbed} damage!`);
        }
        
        // Apply remaining damage to HP
        if (damage > 0) {
            player.hp = Math.max(0, player.hp - damage);
            this.addLog(`${enemy.name} dealt ${damage} damage with special attack!`);
            
            // Visual effect with enhanced animation
            if (this.effectsManager) {
                this.effectsManager.showDamageNumber(damage, 'player');
                this.effectsManager.playAttackAnimation('enemy');
                
                // Show enhanced projectile for special attack
                const enemyName = enemy.name.toLowerCase();
                if (enemyName.includes('phantom') || enemyName.includes('ghost')) {
                    this.effectsManager.showProjectile('phantom', 'enemy', 'player');
                } else if (enemyName.includes('medusa')) {
                    this.effectsManager.showProjectile('medusa', 'enemy', 'player');
                } else if (enemyName.includes('mushroom')) {
                    this.effectsManager.showProjectile('mushroom', 'enemy', 'player');
                } else if (enemyName.includes('drone') || enemyName.includes('sentry')) {
                    this.effectsManager.showProjectile('drone', 'enemy', 'player');
                } else if (enemyName.includes('procrastinator')) {
                    this.effectsManager.showProjectile('procrastinator', 'enemy', 'player');
                } else if (enemyName.includes('alien')) {
                    this.effectsManager.showProjectile('alien', 'enemy', 'player');
                } else if (enemyName.includes('vampire') || enemyName.includes('bat')) {
                    this.effectsManager.showProjectile('vampire-bat', 'enemy', 'player');
                }
            }
        }
        
        // Update UI
        this.updateBattleUI();
        
        // Check if player defeated
        if (player.hp <= 0) {
            this.endBattle('defeat');
            return;
        }
        
        // Regenerate gauges
        this.regenerateGauges();
    }
    
    /**
     * REGENERATE GAUGES
     * Called at end of each turn
     */
    regenerateGauges() {
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Player gauge regeneration
        player.attack = Math.min(player.maxAttack, player.attack + 8);
        player.defense = Math.min(player.maxDefense, player.defense + 5);
        
        // Enemy gauge regeneration
        enemy.attack = Math.min(enemy.maxAttack, enemy.attack + 6);
        enemy.defense = Math.min(enemy.maxDefense, enemy.defense + 4);
        
        // Update cooldowns
        for (const abilityName in enemy.abilityCooldowns) {
            if (enemy.abilityCooldowns[abilityName] > 0) {
                enemy.abilityCooldowns[abilityName]--;
            }
        }
        
        this.updateBattleUI();
    }
    
    /**
     * END BATTLE
     */
    endBattle(result) {
        if (!this.isActive) return;
        
        const battle = this.currentBattle;
        battle.endTime = Date.now();
        battle.result = result;
        
        // Calculate rewards/penalties
        if (result === 'victory') {
            this.handleVictory();
        } else if (result === 'defeat') {
            this.handleDefeat();
        } else if (result === 'fled') {
            this.handleFlee();
        }
        
        // Save battle to history
        this.battleHistory.push({
            id: battle.id,
            enemyId: battle.enemy.id,
            result,
            duration: battle.endTime - battle.startTime,
            turnCount: battle.turnCount
        });
        
        // Update enemy memory if elite
        if (battle.enemy.config.hasMemory && this.memorySystem) {
            this.memorySystem.saveMemory(battle);
        }
        
        // Stop battle music
        if (this.audioManager) {
            this.audioManager.stopBattleMusic();
        }
        
        // Show results modal
        this.showBattleResults(result);
        
        // Clean up
        setTimeout(() => {
            this.closeBattle();
        }, 3000);
    }
    
    handleVictory() {
        const battle = this.currentBattle;
        const enemy = battle.enemy;
        
        // Get loot config with defaults
        const lootConfig = enemy.config?.loot || {
            xpCoins: { min: 10, max: 30 },
            items: []
        };
        
        // Calculate XP reward
        const xpReward = Math.floor(
            lootConfig.xpCoins.min +
            Math.random() * (lootConfig.xpCoins.max - lootConfig.xpCoins.min)
        );
        
        // Award XP
        if (gameState) {
            gameState.xpCoins = (gameState.xpCoins || 0) + xpReward;
        }
        
        battle.loot = { xpCoins: xpReward, items: [] };
        
        // Roll for item drops
        for (const itemDrop of lootConfig.items) {
            if (Math.random() < itemDrop.chance) {
                battle.loot.items.push(itemDrop.id);
                
                // Add to inventory
                if (gameState && gameState.inventory) {
                    gameState.inventory[itemDrop.id] = (gameState.inventory[itemDrop.id] || 0) + 1;
                }
            }
        }
        
        this.addLog(`Victory! Gained ${xpReward} XP coins!`);
        
        // Play victory music
        if (this.audioManager) {
            this.audioManager.playSound('battle_win');
        }
        
        // Decrease threat for winning
        if (this.threatSystem) {
            this.threatSystem.adjustThreat(-5);
        }
        
        // Visual effect
        if (this.effectsManager) {
            this.effectsManager.showEnemyDeath();
        }
    }
    
    handleDefeat() {
        const battle = this.currentBattle;
        
        // Calculate XP loss (10-20% of current XP)
        const xpLoss = Math.floor((gameState?.xpCoins || 0) * (0.1 + Math.random() * 0.1));
        
        if (gameState) {
            gameState.xpCoins = Math.max(0, (gameState.xpCoins || 0) - xpLoss);
        }
        
        battle.loot = { xpCoins: -xpLoss, items: [] };
        
        // 30% chance to lose a random item
        if (Math.random() < 0.3 && gameState && gameState.inventory) {
            const items = Object.keys(gameState.inventory).filter(id => gameState.inventory[id] > 0);
            if (items.length > 0) {
                const lostItem = items[Math.floor(Math.random() * items.length)];
                gameState.inventory[lostItem]--;
                battle.loot.items.push(`-${lostItem}`);
                this.addLog(`Lost 1x ${lostItem}!`);
            }
        }
        
        this.addLog(`Defeat! Lost ${xpLoss} XP coins!`);
        
        // Play defeat music
        if (this.audioManager) {
            this.audioManager.playSound('battle_lose');
        }
        
        // Increase threat for losing
        if (this.threatSystem) {
            this.threatSystem.adjustThreat(15);
        }
    }
    
    handleFlee() {
        // No rewards or penalties for fleeing (threat already adjusted)
        this.addLog('You escaped safely.');
    }
    
    /**
     * UTILITY METHODS
     */
    
    canPlayerAct() {
        return this.isActive && this.currentBattle && this.currentBattle.player.hp > 0;
    }
    
    addLog(message) {
        if (this.currentBattle) {
            this.currentBattle.log.push({
                timestamp: Date.now(),
                message
            });
            
            // Update log UI
            this.updateBattleLog();
        }

    }
    
    getItemConfig(itemId) {
        // This will be populated from inventory system
        // For now, return basic config with power boost applied
        const baseItems = {
            health_potion: { type: 'heal', value: 30 },
            attack_boost: { type: 'buff_attack', value: 20 },
            defense_boost: { type: 'buff_defense', value: 20 },
            // ... more items
        };
        
        const item = baseItems[itemId];
        if (item) {
            // Apply power boost
            return {
                ...item,
                value: Math.floor(item.value * (1 + this.config.itemPowerBoost))
            };
        }
        
        return null;
    }
    
    applyItemEffect(item, player, enemy) {
        switch (item.type) {
            case 'heal':
                player.hp = Math.min(player.maxHp, player.hp + item.value);
                this.addLog(`Healed ${item.value} HP!`);
                break;
            case 'buff_attack':
                player.attack = Math.min(player.maxAttack, player.attack + item.value);
                this.addLog(`Attack increased by ${item.value}!`);
                break;
            case 'buff_defense':
                player.defense = Math.min(player.maxDefense, player.defense + item.value);
                this.addLog(`Defense increased by ${item.value}!`);
                break;
            case 'damage':
                enemy.hp = Math.max(0, enemy.hp - item.value);
                this.addLog(`Dealt ${item.value} damage!`);
                if (this.effectsManager) {
                    this.effectsManager.showDamageNumber(item.value, 'enemy');
                }
                break;
            // ... more item types
        }
        
        // Play item sound
        if (this.audioManager) {
            this.audioManager.playSound('item_use');
        }
    }
    
    closeBattle() {
        this.isActive = false;
        this.currentBattle = null;
        
        // Hide battle UI
        const battleArena = document.getElementById('battleArena');
        if (battleArena) {
            battleArena.classList.add('hidden');
        }
        
        // Resume main game music
        if (this.audioManager) {
            this.audioManager.resumeMainMusic();
        }
    }
    
    /**
     * UI METHODS (to be implemented)
     */
    
    renderBattleUI() {
        // Show battle arena (parent container)
        const battleArena = document.getElementById('battleArena');
        if (battleArena) {
            battleArena.classList.remove('hidden');
        }
        
        // Show battle container (fullscreen overlay)
        const battleContainer = document.getElementById('battleContainer');
        if (battleContainer) {
            battleContainer.style.display = 'flex';
        }
        
        // Update player sprite using the correct element ID
        const playerSprite = document.getElementById('battleHeroSprite');
        if (playerSprite) {
            const appearance = window.getActiveMonsterAppearance(this.currentBattle.player.monsterType || gameState.selectedMonster, this.currentBattle.player.skinId || gameState.equippedSkinId);
            // Use the SkinsManager logic to apply the GIF correctly
            if (window.skinsManager) {
                window.skinsManager.applyGifToElement(playerSprite, appearance.animations.idle, 6);
            } else {
                playerSprite.src = appearance.animations.idle;
            }
        }
        
        // Update enemy sprite using the correct element ID
        // Try both possible sprite element IDs (battleEnemySprite and enemySprite)
        let enemySprite = document.getElementById('battleEnemySprite');
        if (!enemySprite) {
            enemySprite = document.getElementById('enemySprite');
        }
        
        if (enemySprite) {
            const enemyConfig = this.currentBattle.enemy.config;
            const idleAnimation = enemyConfig.assets?.idle || enemyConfig.sprite || 'assets/battle/enemies/placeholder.gif';

            // Set the sprite source
            enemySprite.src = idleAnimation;
            
            // Apply styling to enemy for consistency
            enemySprite.style.setProperty('width', '32px', 'important');
            enemySprite.style.setProperty('height', '32px', 'important');
            enemySprite.style.setProperty('object-fit', 'contain', 'important');
            enemySprite.style.setProperty('transform', 'scale(6)', 'important');
            enemySprite.style.setProperty('image-rendering', 'pixelated', 'important');
            enemySprite.style.setProperty('opacity', '1', 'important');
            enemySprite.style.setProperty('display', 'block', 'important');
            enemySprite.style.setProperty('visibility', 'visible', 'important');
            
            // Store enemy config on sprite element for animation system
            enemySprite.dataset.enemyName = enemyConfig.name;
            enemySprite.dataset.enemyId = enemyConfig.id;
        } else {
            console.error('[BattleEngine] Enemy sprite element not found!');
        }
        
        // Render initial state
        this.updateBattleUI();
    }
    
    updateBattleUI() {
        if (!this.currentBattle) return;
        
        const battle = this.currentBattle;
        
        // Update player HP
        this.updateElement('playerHPText', `${Math.ceil(battle.player.hp)}/${battle.player.maxHp}`);
        this.updateGauge('heroHPBar', battle.player.hp, battle.player.maxHp);
        
        // Update enemy HP
        this.updateElement('enemyHPText', `${Math.ceil(battle.enemy.hp)}/${battle.enemy.maxHp}`);
        this.updateGauge('enemyHPBar', battle.enemy.hp, battle.enemy.maxHp);
        
        // Update Attack Gauge
        this.updateElement('attackGaugeValue', `${Math.ceil(battle.player.attack)}/${battle.player.maxAttack}`);
        this.updateGauge('attackGaugeBar', battle.player.attack, battle.player.maxAttack);
        
        // Update Defense Gauge
        this.updateElement('defenseGaugeValue', `${Math.ceil(battle.player.defense)}/${battle.player.maxDefense}`);
        this.updateGauge('defenseGaugeBar', battle.player.defense, battle.player.maxDefense);
        
        // Update Special Attack Gauge (Focus Charge)
        this.updateElement('specialAttackValue', `${Math.ceil(battle.player.focusCharge)}/${battle.player.maxFocusCharge}`);
        this.updateGauge('specialAttackBar', battle.player.focusCharge, battle.player.maxFocusCharge);
        
        // Get the Special Attack UI elements
        const specialGaugeContainer = document.getElementById('specialAttackGaugeContainer');
        const specialAttackBtn = document.getElementById('btnSpecialAttack');
        
        if (specialGaugeContainer && specialAttackBtn) {
            const playerLevel = gameState?.jerryLevel || 1;
            
            // The requirement is Level 10 to unlock the Special Attack
            if (playerLevel >= 10) {
                // Show the gauge and button if the player is level 10 or higher
                specialGaugeContainer.style.display = 'block';
                specialAttackBtn.style.display = 'block';
                
                // Check if the special attack is ready (gauge is full)
                const isReady = battle.player.focusCharge >= battle.player.maxFocusCharge;
                specialAttackBtn.disabled = !isReady;
                if (isReady) {
                    specialAttackBtn.classList.add('special-ready');
                } else {
                    specialAttackBtn.classList.remove('special-ready');
                }
                
            } else {
                // Hide the gauge and button if the player is below level 10
                specialGaugeContainer.style.display = 'none';
                specialAttackBtn.style.display = 'none';
            }
        }
        
        // Update Potion button count
        const potionCount = document.getElementById('potionCount');
        if (potionCount) {
            const count = gameState?.battleInventory?.health_potion || 0;
            potionCount.textContent = `(${count})`;
        }
        
        // Update battle log
        this.updateBattleLog();
    }
    
    updateBattleLog() {
        const logElement = document.getElementById('battleLog');
        if (!logElement || !this.currentBattle) return;
        
        const recentLogs = this.currentBattle.log.slice(-5); // Show last 5 messages
        logElement.innerHTML = recentLogs.map(log => `<p>${log.message}</p>`).join('');
        
        // Auto-scroll to bottom
        logElement.scrollTop = logElement.scrollHeight;
    }
    
    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
    
    updateGauge(id, current, max) {
        const gauge = document.getElementById(id);
        if (gauge) {
            const percentage = Math.max(0, Math.min(100, (current / max) * 100));
            gauge.style.width = `${percentage}%`;
        }
    }
    
    updateSprite(id, spriteId) {
        const sprite = document.getElementById(id);
        if (!sprite) return;
        
        // Set sprite image based on ID
        // This will use the GIF animations from assets
        if (id === 'playerSprite') {
            sprite.src = `assets/heroes/${spriteId}_idle.gif`;
        } else {
            const enemy = BATTLE_ENEMIES[spriteId];
            if (enemy) {
                sprite.src = enemy.assets.idle;
            }
        }
    }
    
    showBattleResults(result) {
        const battle = this.currentBattle;
        
        if (result === 'victory') {
            // Store loot and world map context
            const enemyName = battle.enemy?.name || 'Enemy';
            const xpGained = battle.loot?.xpCoins || 0;
            const lootItems = battle.loot?.items || [];
            
            if (window.gameState) {
                window._pendingLootContext = {
                    lootItems: lootItems,
                    xpGained: xpGained,
                    enemyName: enemyName
                };
                
                window._pendingWorldMapContext = {
                    level: window.gameState.level || 1,
                    previousLevel: (window.gameState.level || 1) - 1,
                    petName: window.gameState.petName || 'Your Monster',
                    isFirstBattle: (window.gameState.level || 1) <= 5,
                    enemyName: enemyName,
                    justLeveledUp: true
                };
            }
            
            // Show victory modal first (Guardian message)
            if (window.guardianNarrative) {
                const victoryMessage = '🏰 Another victory for Task World! The Gloom grows weaker.';
                window.guardianNarrative.showMapMessage(victoryMessage);
            }
        } else if (result === 'defeat') {
            // Show defeat message
            this.addLog('You were defeated...');
        } else if (result === 'fled') {
            // Show flee message
            this.addLog('You fled from battle!');
        }
    }
}

// Initialize global battle engine
const battleEngine = new BattleEngine();

// Expose to window for debugging
if (typeof window !== 'undefined') {
    window.battleEngine = battleEngine;
}
