/**
 * BATTLE AI SYSTEM
 * Deterministic enemy AI with 5 instinct types
 * Uses rule-based decision trees (NOT machine learning)
 */

class BattleAI {
    constructor(battleEngine) {
        this.battleEngine = battleEngine;
        this.currentBattle = null;
        
        // AI configuration
        this.config = {
            // Threshold values for decision-making
            lowHPThreshold: 0.3,      // 30% HP
            criticalHPThreshold: 0.15, // 15% HP
            highHPThreshold: 0.7,      // 70% HP
            
            // Gauge thresholds
            lowAttackGauge: 20,
            lowDefenseGauge: 15,
            
            // Ability cooldown tracking
            abilityCooldowns: {}
        };
    }
    
    initializeBattle(battle) {
        this.currentBattle = battle;
        
        // Initialize ability cooldowns
        const enemy = battle.enemy;
        enemy.abilityCooldowns = {};
        
        for (const ability of enemy.abilities) {
            enemy.abilityCooldowns[ability.name] = 0;
        }
    }
    
    /**
     * MAIN AI DECISION SYSTEM
     * Called on enemy turn
     */
    takeTurn(battle) {
        this.currentBattle = battle;
        const enemy = battle.enemy;
        
        // Select action based on instinct type
        let action = null;
        
        switch (enemy.instinct) {
            case 'predator':
                action = this.predatorInstinct(battle);
                break;
            case 'trickster':
                action = this.tricksterInstinct(battle);
                break;
            case 'guardian':
                action = this.guardianInstinct(battle);
                break;
            case 'berserker':
                action = this.berserkerInstinct(battle);
                break;
            case 'tactician':
                action = this.tacticianInstinct(battle);
                break;
            default:
                action = this.basicAttack();
        }
        
        // Execute action
        this.executeAction(action);
    }
    
    /**
     * PREDATOR INSTINCT
     * Aggressive, focuses on dealing damage
     * Prioritizes abilities when player is weak
     */
    predatorInstinct(battle) {
        const player = battle.player;
        const enemy = battle.enemy;
        
        const playerHPPercent = player.hp / player.maxHp;
        const enemyHPPercent = enemy.hp / enemy.maxHp;
        
        // Check threat level
        const threatLevel = this.battleEngine.threatSystem?.getThreatLevel() || 'medium';
        
        // Critical player HP - go for the kill
        if (playerHPPercent < this.config.criticalHPThreshold) {
            // Try to use strongest ability
            const strongestAbility = this.getStrongestAvailableAbility(enemy);
            if (strongestAbility) {
                return { type: 'ability', ability: strongestAbility };
            }
            
            // Otherwise, all-out attack
            return { type: 'attack', aggressive: true };
        }
        
        // Low player HP - use damage ability
        if (playerHPPercent < this.config.lowHPThreshold) {
            const damageAbility = this.getAvailableAbilityByType(enemy, 'damage');
            if (damageAbility) {
                return { type: 'ability', ability: damageAbility };
            }
        }
        
        // High threat player - be cautious
        if (threatLevel === 'high' && enemyHPPercent < 0.5) {
            // Use defensive ability if available
            const defensiveAbility = this.getAvailableAbilityByType(enemy, 'defense');
            if (defensiveAbility && Math.random() < 0.4) {
                return { type: 'ability', ability: defensiveAbility };
            }
        }
        
        // Check if player is defending - use ability to bypass
        if (player.isDefending) {
            const bypassAbility = this.getAvailableAbilityByType(enemy, 'damage');
            if (bypassAbility && Math.random() < 0.6) {
                return { type: 'ability', ability: bypassAbility };
            }
        }
        
        // Default: aggressive attack
        return { type: 'attack', aggressive: true };
    }
    
    /**
     * TRICKSTER INSTINCT
     * Uses debuffs and status effects
     * Unpredictable behavior
     */
    tricksterInstinct(battle) {
        const player = battle.player;
        const enemy = battle.enemy;
        
        const playerHPPercent = player.hp / player.maxHp;
        const enemyHPPercent = enemy.hp / enemy.maxHp;
        
        // Random chance to use special ability (30%)
        if (Math.random() < 0.3) {
            const specialAbility = this.getRandomAvailableAbility(enemy);
            if (specialAbility) {
                return { type: 'ability', ability: specialAbility };
            }
        }
        
        // Player has high HP - apply debuffs
        if (playerHPPercent > this.config.highHPThreshold) {
            const debuffAbility = this.getAvailableAbilityByType(enemy, 'debuff');
            if (debuffAbility) {
                return { type: 'ability', ability: debuffAbility };
            }
        }
        
        // Enemy low HP - use evasive/defensive ability
        if (enemyHPPercent < this.config.lowHPThreshold) {
            const defensiveAbility = this.getAvailableAbilityByType(enemy, 'defense');
            if (defensiveAbility && Math.random() < 0.7) {
                return { type: 'ability', ability: defensiveAbility };
            }
            
            // Or defend
            if (Math.random() < 0.4) {
                return { type: 'defend' };
            }
        }
        
        // Check player attack gauge - if high, defend
        if (player.attack > 70 && Math.random() < 0.5) {
            return { type: 'defend' };
        }
        
        // Mix of attacks and abilities
        if (Math.random() < 0.6) {
            return { type: 'attack' };
        } else {
            const ability = this.getRandomAvailableAbility(enemy);
            if (ability) {
                return { type: 'ability', ability };
            }
            return { type: 'attack' };
        }
    }
    
    /**
     * GUARDIAN INSTINCT
     * Defensive, focuses on survival
     * Uses healing and defense buffs
     */
    guardianInstinct(battle) {
        const player = battle.player;
        const enemy = battle.enemy;
        
        const playerHPPercent = player.hp / player.maxHp;
        const enemyHPPercent = enemy.hp / enemy.maxHp;
        
        // Critical HP - prioritize healing
        if (enemyHPPercent < this.config.criticalHPThreshold) {
            const healAbility = this.getAvailableAbilityByType(enemy, 'heal');
            if (healAbility) {
                return { type: 'ability', ability: healAbility };
            }
            
            // Defend if no heal available
            return { type: 'defend' };
        }
        
        // Low HP - heal or defend
        if (enemyHPPercent < this.config.lowHPThreshold) {
            const healAbility = this.getAvailableAbilityByType(enemy, 'heal');
            if (healAbility && Math.random() < 0.8) {
                return { type: 'ability', ability: healAbility };
            }
            
            // Use defensive ability
            const defensiveAbility = this.getAvailableAbilityByType(enemy, 'defense');
            if (defensiveAbility && Math.random() < 0.6) {
                return { type: 'ability', ability: defensiveAbility };
            }
            
            // Defend
            if (Math.random() < 0.7) {
                return { type: 'defend' };
            }
        }
        
        // Player high attack gauge - defend
        if (player.attack > 80) {
            // Use defensive ability or defend
            const defensiveAbility = this.getAvailableAbilityByType(enemy, 'defense');
            if (defensiveAbility && Math.random() < 0.5) {
                return { type: 'ability', ability: defensiveAbility };
            }
            
            return { type: 'defend' };
        }
        
        // Player low HP - finish them off
        if (playerHPPercent < this.config.lowHPThreshold) {
            const damageAbility = this.getAvailableAbilityByType(enemy, 'damage');
            if (damageAbility) {
                return { type: 'ability', ability: damageAbility };
            }
            
            return { type: 'attack' };
        }
        
        // Maintain defense - 50% defend, 50% attack
        if (Math.random() < 0.5) {
            return { type: 'defend' };
        } else {
            return { type: 'attack' };
        }
    }
    
    /**
     * BERSERKER INSTINCT
     * Reckless aggression
     * More aggressive at low HP
     */
    berserkerInstinct(battle) {
        const player = battle.player;
        const enemy = battle.enemy;
        
        const playerHPPercent = player.hp / player.maxHp;
        const enemyHPPercent = enemy.hp / enemy.maxHp;
        
        // Low HP - RAGE MODE
        if (enemyHPPercent < this.config.lowHPThreshold) {
            // Always use strongest ability if available
            const strongestAbility = this.getStrongestAvailableAbility(enemy);
            if (strongestAbility) {
                return { type: 'ability', ability: strongestAbility };
            }
            
            // Otherwise, ultra-aggressive attack
            return { type: 'attack', aggressive: true, reckless: true };
        }
        
        // Critical player HP - go for kill
        if (playerHPPercent < this.config.criticalHPThreshold) {
            const damageAbility = this.getAvailableAbilityByType(enemy, 'damage');
            if (damageAbility) {
                return { type: 'ability', ability: damageAbility };
            }
            
            return { type: 'attack', aggressive: true };
        }
        
        // Random chance to use ability (40%)
        if (Math.random() < 0.4) {
            const ability = this.getRandomAvailableAbility(enemy);
            if (ability) {
                return { type: 'ability', ability };
            }
        }
        
        // Mostly attacks
        return { type: 'attack', aggressive: true };
    }
    
    /**
     * TACTICIAN INSTINCT
     * Strategic, adapts to player behavior
     * Uses memory system to predict player actions
     */
    tacticianInstinct(battle) {
        const player = battle.player;
        const enemy = battle.enemy;
        
        const playerHPPercent = player.hp / player.maxHp;
        const enemyHPPercent = enemy.hp / enemy.maxHp;
        
        // Get player patterns from memory
        const memory = this.battleEngine.memorySystem?.getMemory(enemy.id);
        
        // Analyze player behavior
        let playerStrategy = 'balanced';
        if (memory) {
            const attackFreq = memory.playerPatterns.attackFrequency || 0.5;
            const itemUsageFreq = memory.playerPatterns.itemUsageFrequency || 0.2;
            
            if (attackFreq > 0.7) {
                playerStrategy = 'aggressive';
            } else if (itemUsageFreq > 0.3) {
                playerStrategy = 'item_heavy';
            } else if (attackFreq < 0.3) {
                playerStrategy = 'defensive';
            }
        }
        
        // Counter player strategy
        if (playerStrategy === 'aggressive') {
            // Player attacks a lot - use defense
            if (player.attack > 60 && Math.random() < 0.6) {
                const defensiveAbility = this.getAvailableAbilityByType(enemy, 'defense');
                if (defensiveAbility) {
                    return { type: 'ability', ability: defensiveAbility };
                }
                return { type: 'defend' };
            }
        } else if (playerStrategy === 'item_heavy') {
            // Player uses items - apply pressure
            const damageAbility = this.getAvailableAbilityByType(enemy, 'damage');
            if (damageAbility && Math.random() < 0.5) {
                return { type: 'ability', ability: damageAbility };
            }
            return { type: 'attack', aggressive: true };
        } else if (playerStrategy === 'defensive') {
            // Player is defensive - use debuffs
            const debuffAbility = this.getAvailableAbilityByType(enemy, 'debuff');
            if (debuffAbility && Math.random() < 0.5) {
                return { type: 'ability', ability: debuffAbility };
            }
        }
        
        // Strategic HP management
        if (enemyHPPercent < this.config.lowHPThreshold) {
            // Low HP - assess situation
            if (playerHPPercent < 0.4) {
                // Both low - go for kill
                const strongestAbility = this.getStrongestAvailableAbility(enemy);
                if (strongestAbility) {
                    return { type: 'ability', ability: strongestAbility };
                }
                return { type: 'attack', aggressive: true };
            } else {
                // Player healthy - play defensive
                const healAbility = this.getAvailableAbilityByType(enemy, 'heal');
                if (healAbility) {
                    return { type: 'ability', ability: healAbility };
                }
                
                const defensiveAbility = this.getAvailableAbilityByType(enemy, 'defense');
                if (defensiveAbility) {
                    return { type: 'ability', ability: defensiveAbility };
                }
                
                return { type: 'defend' };
            }
        }
        
        // Player low HP - finish them
        if (playerHPPercent < this.config.lowHPThreshold) {
            const damageAbility = this.getAvailableAbilityByType(enemy, 'damage');
            if (damageAbility) {
                return { type: 'ability', ability: damageAbility };
            }
            return { type: 'attack', aggressive: true };
        }
        
        // Balanced approach - mix abilities and attacks
        if (Math.random() < 0.4) {
            const ability = this.getBestAvailableAbility(enemy, battle);
            if (ability) {
                return { type: 'ability', ability };
            }
        }
        
        return { type: 'attack' };
    }
    
    /**
     * EXECUTE ACTION
     * Performs the selected action
     */
    executeAction(action) {
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        switch (action.type) {
            case 'attack':
                this.performAttack(action);
                break;
            case 'defend':
                this.performDefend();
                break;
            case 'ability':
                this.performAbility(action.ability);
                break;
            default:
                this.performAttack({});
        }
        
        // Regenerate gauges after action
        this.battleEngine.regenerateGauges();
    }
    
    performAttack(options = {}) {
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Calculate base damage using correct damage range
        let damage;
        if (enemy.config && enemy.config.attackDamageMin !== undefined && enemy.config.attackDamageMax !== undefined) {
            const min = enemy.config.attackDamageMin;
            const max = enemy.config.attackDamageMax;
            damage = Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            // Fallback to old formula
            damage = Math.floor(5 + (enemy.attack * 0.25));
        }
        
        // Apply modifiers
        if (options.aggressive) {
            damage = Math.floor(damage * 1.3);
        }
        
        if (options.reckless) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Apply player defense if defending
        if (player.isDefending && player.defense > 0) {
            const absorbed = Math.min(damage, player.defense);
            player.defense -= absorbed;
            damage -= absorbed;
            this.battleEngine.addLog(`You blocked ${absorbed} damage!`);
        }
        
        // Apply remaining damage to HP
        if (damage > 0) {
            player.hp = Math.max(0, player.hp - damage);
            this.battleEngine.addLog(`${enemy.name} dealt ${damage} damage!`);
            
            // Visual effect
            if (this.battleEngine.effectsManager) {
                this.battleEngine.effectsManager.showDamageNumber(damage, 'player');
                this.battleEngine.effectsManager.playAttackAnimation('enemy');
            }
        }
        
        // Play sound
        if (this.battleEngine.audioManager) {
            this.battleEngine.audioManager.playSound('enemy_attack');
        }
        
        // Update UI
        this.battleEngine.updateBattleUI();
        
        // Check if player defeated
        if (player.hp <= 0) {
            this.battleEngine.endBattle('defeat');
        }
    }
    
    performDefend() {
        const battle = this.currentBattle;
        const enemy = battle.enemy;
        
        // Set defending flag
        enemy.isDefending = true;
        
        // Boost defense
        const defenseBoost = 20;
        enemy.defense = Math.min(enemy.maxDefense, enemy.defense + defenseBoost);
        
        this.battleEngine.addLog(`${enemy.name} braces for impact!`);
        
        // Play sound
        if (this.battleEngine.audioManager) {
            this.battleEngine.audioManager.playSound('defend');
        }
        
        // Update UI
        this.battleEngine.updateBattleUI();
    }
    
    performAbility(ability) {
        const battle = this.currentBattle;
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Check if ability is on cooldown
        if (enemy.abilityCooldowns[ability.name] > 0) {
            console.warn('Ability on cooldown:', ability.name);
            this.performAttack({});
            return;
        }
        
        // Execute ability effect
        this.battleEngine.addLog(`${enemy.name} used ${ability.name}!`);
        
        switch (ability.effect.type) {
            case 'damage':
                const damage = ability.effect.value;
                player.hp = Math.max(0, player.hp - damage);
                this.battleEngine.addLog(`⚡ ${ability.name}: ${damage} damage dealt!`);
                
                if (this.battleEngine.effectsManager) {
                    this.battleEngine.effectsManager.showDamageNumber(damage, 'player', true);
                    this.battleEngine.effectsManager.playAbilityAnimation(ability.name);
                    this.battleEngine.effectsManager.playAttackAnimation('enemy');
                }
                break;
                
            case 'heal':
                const healAmount = ability.effect.value;
                const actualHeal = Math.min(healAmount, enemy.maxHp - enemy.hp);
                enemy.hp += actualHeal;
                this.battleEngine.addLog(`${enemy.name} healed ${actualHeal} HP!`);
                
                if (this.battleEngine.effectsManager) {
                    this.battleEngine.effectsManager.showHealEffect('enemy');
                }
                break;
                
            case 'buff_attack':
                enemy.attack = Math.min(enemy.maxAttack, enemy.attack + ability.effect.value);
                this.battleEngine.addLog(`${enemy.name}'s attack increased!`);
                break;
                
            case 'buff_defense':
                enemy.defense = Math.min(enemy.maxDefense, enemy.defense + ability.effect.value);
                this.battleEngine.addLog(`${enemy.name}'s defense increased!`);
                break;
                
            case 'debuff_attack':
                player.attack = Math.max(0, player.attack - ability.effect.value);
                this.battleEngine.addLog(`Your attack decreased!`);
                break;
                
            case 'debuff_defense':
                player.defense = Math.max(0, player.defense - ability.effect.value);
                this.battleEngine.addLog(`Your defense decreased!`);
                break;
                
            case 'multi_hit':
                const hits = ability.effect.hits || 3;
                const hitDamage = ability.effect.value;
                let totalDamage = 0;
                
                for (let i = 0; i < hits; i++) {
                    player.hp = Math.max(0, player.hp - hitDamage);
                    totalDamage += hitDamage;
                }
                
                this.battleEngine.addLog(`${hits} hits for ${totalDamage} total damage!`);
                break;
        }
        
        // Set cooldown
        enemy.abilityCooldowns[ability.name] = ability.cooldown;
        
        // Play sound
        if (this.battleEngine.audioManager) {
            this.battleEngine.audioManager.playSound('ability_use');
        }
        
        // Update UI
        this.battleEngine.updateBattleUI();
        
        // Check if player defeated
        if (player.hp <= 0) {
            this.battleEngine.endBattle('defeat');
        }
    }
    
    /**
     * ABILITY SELECTION HELPERS
     */
    
    getAvailableAbilityByType(enemy, type) {
        const available = enemy.abilities.filter(ability => 
            ability.effect.type === type && 
            enemy.abilityCooldowns[ability.name] === 0
        );
        
        if (available.length === 0) return null;
        
        // Return highest value ability of this type
        return available.reduce((best, current) => 
            (current.effect.value || 0) > (best.effect.value || 0) ? current : best
        );
    }
    
    getStrongestAvailableAbility(enemy) {
        const available = enemy.abilities.filter(ability => 
            enemy.abilityCooldowns[ability.name] === 0
        );
        
        if (available.length === 0) return null;
        
        // Return ability with highest damage value
        return available.reduce((best, current) => {
            const currentValue = current.effect.type === 'damage' ? (current.effect.value || 0) : 0;
            const bestValue = best.effect.type === 'damage' ? (best.effect.value || 0) : 0;
            return currentValue > bestValue ? current : best;
        });
    }
    
    getRandomAvailableAbility(enemy) {
        const available = enemy.abilities.filter(ability => 
            enemy.abilityCooldowns[ability.name] === 0
        );
        
        if (available.length === 0) return null;
        
        return available[Math.floor(Math.random() * available.length)];
    }
    
    getBestAvailableAbility(enemy, battle) {
        const player = battle.player;
        const playerHPPercent = player.hp / player.maxHp;
        const enemyHPPercent = enemy.hp / enemy.maxHp;
        
        // Prioritize based on situation
        if (playerHPPercent < 0.3) {
            // Player low HP - use damage
            return this.getAvailableAbilityByType(enemy, 'damage');
        } else if (enemyHPPercent < 0.3) {
            // Enemy low HP - use heal or defense
            const heal = this.getAvailableAbilityByType(enemy, 'heal');
            if (heal) return heal;
            
            return this.getAvailableAbilityByType(enemy, 'defense');
        } else {
            // Balanced - use any available
            return this.getRandomAvailableAbility(enemy);
        }
    }
}

// Export for use in battleEngine
if (typeof window !== 'undefined') {
    window.BattleAI = BattleAI;
}
