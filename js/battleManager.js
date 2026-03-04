// Battle Manager - State Machine and Combat Logic

const BattleState = {
    INITIALIZING: 'initializing',
    PLAYER_TURN: 'player_turn',
    ENEMY_TURN: 'enemy_turn',
    ANIMATING: 'animating',
    VICTORY: 'victory',
    DEFEAT: 'defeat',
    FLED: 'fled'
};

class BattleManager {
    constructor() {
        this.initialized = false;  // Track initialization state
        this.inBattle = false;  // Track if battle is currently active (for quest giver prevention)
        this.state = BattleState.INITIALIZING;
        this.hero = null;
        this.enemy = null;
        this.attackGauge = 0;
        this.defenseGauge = 0;
        this.battleLog = [];
        this.hasEvade = false;
        this.hasReflect = false;
        this.enemyAttackCount = 0;  // Track enemy attack count for every 5th attack sound
        this.reflectTurns = 0;  // Luna's reflect effect turns remaining
        this.reflectActive = false;  // Luna's reflect effect active flag
        this.enemyFrozenTurns = 0;  // Freeze effect turns remaining
        this.heroStunnedTurns = 0;   // Enemy stun/daze effect turns remaining
        this.burnTurns = 0;           // Nova special: burn DoT turns remaining
        this.burnDamage = 0;          // Nova special: burn damage per turn
        this.deflectActive = false;   // Luna special: deflect next enemy attack
        this.defenseImmune = 0;       // Benny special: defense immunity turns remaining
        this.overthinkBackfire = false; // Overthinker: next hero attack backfires
        this.focusAttackUsed = false;  // Track if focus timer special attack has been used this battle
        
        // Turn timer system
        this.turnTimerDuration = 3000; // Default 3 seconds
        this.turnTimerInterval = null;
        this.turnTimerStartTime = null;
        this.turnTimerReduced = false; // Flag for Time Sting effect
    }

    // Initialize battle with hero and enemy
    async startBattle(heroData, enemyData) {
        // CRITICAL: Prevent battle from starting if quest giver is active
        if (window.questGiver && window.questGiver.activeQuest) {

            return;
        }
        
        const questGiverUI = document.getElementById('questGiverUI');
        if (questGiverUI && !questGiverUI.classList.contains('hidden')) {

            return;
        }
        
        // Set battle active flag
        this.inBattle = true;

        // Check if battle tutorial should be shown (first battle only)
        if (window.battleTutorial && BattleTutorial.shouldShowTutorial()) {

            window.battleTutorial.show();
            // Wait for tutorial to complete before starting battle (with 30s timeout)
            await new Promise(resolve => {
                let elapsed = 0;
                const checkTutorial = setInterval(() => {
                    elapsed += 500;
                    if (localStorage.getItem('battleTutorialCompleted') === 'true') {
                        clearInterval(checkTutorial);

                        resolve();
                    } else if (elapsed >= 30000) {
                        // Timeout after 30 seconds
                        clearInterval(checkTutorial);
                        console.warn('[Battle] Tutorial timeout, proceeding with battle');
                        localStorage.setItem('battleTutorialCompleted', 'true');
                        resolve();
                    }
                }, 500);
            });
        }
        
        this.state = BattleState.INITIALIZING;
        this.hero = heroData;
        this.enemy = enemyData;
        this.attackGauge = 100;  // Start with full attack gauge
        this.defenseGauge = 100; // Start with full defense gauge
        this.battleLog = [];
        this.attackCount = 0;    // Track attack count for walk+attack animation
        this.enemyAttackCount = 0;  // Reset enemy attack count for every 5th attack sound
        
        // Verify gameState inventory is loaded
        if (!window.gameState.battleInventory) {
            console.warn('Battle inventory not found, initializing...');
            window.gameState.battleInventory = {
                fireball: 0,
                spark: 0,
                health_potion: 2,
                attack_refill: 2,
                defense_refill: 2,
                invisibility_cloak: 0,
                prickler: 0,
                freeze: 0,
                blue_flame: 0,
                procrastination_ghost: 0
            };
        }
        
        if (!window.gameState.unlockedBattleItems) {
            console.warn('Unlocked battle items not found, initializing...');
            window.gameState.unlockedBattleItems = ['health_potion', 'attack_refill', 'defense_refill'];
        }
        
        // Initialize special attack gauge if not exists
        if (window.initSpecialAttackGauge) {
            window.initSpecialAttackGauge();
        }
        
        // Hide special attack gauge and button if below Level 10
        // Use gameState.jerryLevel — the level is stored inside gameState, not as a standalone localStorage key
        const userLevel = window.gameState?.jerryLevel || parseInt(localStorage.getItem('level')) || 1;
        const specialGaugeContainer = document.getElementById('specialAttackGaugeContainer');
        const specialAttackBtn = document.getElementById('btnSpecialAttack');
        
        if (userLevel < 10) {
            if (specialGaugeContainer) specialGaugeContainer.style.display = 'none';
            if (specialAttackBtn) specialAttackBtn.style.display = 'none';
        } else {
            if (specialGaugeContainer) specialGaugeContainer.style.display = 'block';
            if (specialAttackBtn) specialAttackBtn.style.display = 'block';
        }
        
        // Boss status effects
        this.poisonTurns = 0;
        this.poisonDamage = 0;
        this.poisonGaugeDrain = 0;
        this.mushroomTurns = 0;
        this.mushroomMissChance = 0;
        this.mushroomSkipChance = 0;
        this.mushroomGaugeDrain = 0;
        this.heroStunnedTurns = 0;   // Reset hero stun/daze on new battle
        this.burnTurns = 0;           // Nova special: reset burn DoT
        this.burnDamage = 0;
        this.deflectActive = false;   // Luna special: reset deflect
        this.defenseImmune = 0;       // Benny special: reset defense immunity
        this.overthinkBackfire = false; // Overthinker: reset backfire flag
        this._morphTurnsLeft = 0;      // Morph defense boost turns remaining
        this._morphRestoreCallback = null;
        this._charmTurnsLeft = 0;      // Charm defense reduction turns remaining
        this._charmOriginalDefense = undefined;
        this._superDefenseTurnsLeft = 0; // Super defense boost turns remaining
        this._superDefenseOriginal = undefined;

        // Set battle background based on level with rotation
        const battleContainer = document.querySelector('.battle-container');
        battleContainer.classList.remove('bg-forest', 'bg-night-town', 'bg-city', 'bg-temple', 'bg-ocean', 'bg-skull-gate', 'bg-space', 'bg-castle', 'bg-city-neon', 'bg-synth-city');
        
        // Determine available arenas based on level - TRUE ALTERNATION SYSTEM
        let availableArenas = [];
        
        // LEVELS 1-10: Synth City only
        if (this.hero.level >= 1 && this.hero.level < 11) {
            availableArenas = ['bg-synth-city'];
        }
        // LEVELS 11-19: Multiple arenas rotate
        else if (this.hero.level >= 11 && this.hero.level < 20) {
            availableArenas = [
                'bg-city',        // city_sunset
                'bg-forest',      // forest_path
                'bg-ocean',       // ocean
                'bg-castle',      // castle
                'bg-temple',      // temple
                'bg-space',       // space
                'bg-night-town',  // night town
                'bg-synth-city',  // synth city
                'bg-skull-gate'   // skull gate
            ];
        }
        // LEVELS 20+: All shop themes available
        else if (this.hero.level >= 20) {
            availableArenas = [
                'bg-forest',      // forest_path
                'bg-night-town',  // night town
                'bg-city',        // city_sunset
                'bg-temple',      // temple
                'bg-ocean',       // ocean
                'bg-skull-gate',  // skull gate
                'bg-space',       // space
                'bg-castle',      // castle
                'bg-city-neon',   // neon city
                'bg-synth-city'   // synth city
            ];
        }
        
        // True alternation system - cycle through arenas in order
        if (!window.battleArenaRotationIndex) window.battleArenaRotationIndex = 0;
        if (!window.lastArenaPoolSize) window.lastArenaPoolSize = 0;
        
        // Reset rotation if arena pool changed (level up unlocked new arenas)
        if (availableArenas.length !== window.lastArenaPoolSize) {
            window.battleArenaRotationIndex = 0;
            window.lastArenaPoolSize = availableArenas.length;
        }
        
        // Get current arena from rotation
        const selectedArena = availableArenas[window.battleArenaRotationIndex];
        
        // Move to next arena in rotation
        window.battleArenaRotationIndex = (window.battleArenaRotationIndex + 1) % availableArenas.length;
        
        // Apply selected arena
        battleContainer.classList.add(selectedArena);
        
        // Play alternating battle music
        if (window.audioManager) {
            window.audioManager.playBattleMusic();
        }

        // Show battle arena

        showBattle(this.hero, this.enemy);

        // IMMEDIATE FIX: Set enemy sprite directly before anything else
        const enemySpriteElement = document.getElementById('enemySprite');
        if (enemySpriteElement && this.enemy && this.enemy.sprites) {
            const idleSprite = this.enemy.sprites.idle || this.enemy.currentSprite;
            if (idleSprite) {
                enemySpriteElement.src = idleSprite;
                enemySpriteElement.style.display = 'block';
                enemySpriteElement.style.visibility = 'visible';
                enemySpriteElement.style.opacity = '1';

            } else {
                console.error('[Battle] Enemy has no idle sprite!', this.enemy);
            }
        } else {
            console.error('[Battle] Cannot set enemy sprite - element or enemy data missing');
            console.error('[Battle] enemySpriteElement:', enemySpriteElement);
            console.error('[Battle] this.enemy:', this.enemy);
            console.error('[Battle] this.enemy.sprites:', this.enemy?.sprites);
        }

        // Render hero sprite

        if (typeof renderHeroSprite === 'function') {
            renderHeroSprite();
        } else {
            console.error('[Battle] renderHeroSprite function not found!');
        }

        // Initialize enemy sprite with correct size class



        if (typeof initEnemySprite === 'function') {
            try {
                initEnemySprite(this.enemy);

            } catch (error) {
                console.error('[Battle] initEnemySprite error:', error);
            }
        } else {
            console.error('[Battle] initEnemySprite function not found!');
            console.error('[Battle] Available window functions:', Object.keys(window).filter(k => k.includes('Enemy') || k.includes('enemy')));
        }

        // Play wake up sequence
        addBattleLog(`💤 A ${this.enemy.name} appears!`);

        try {
            await playWakeUpSequence(this.enemy);

        } catch (error) {
            console.error('[Battle] playWakeUpSequence error:', error);
            // Emergency fallback: set enemy sprite directly
            const enemySprite = document.getElementById('enemySprite');
            if (enemySprite && this.enemy) {
                const enemyName = this.enemy.name;
                const idlePath = `assets/enemies/${enemyName}/${enemyName}-IdleFly-animated.gif`;
                enemySprite.src = idlePath;

            }
        }
        
        // CRITICAL FIX: Verify enemy sprite is visible after wake-up
        const enemySprite = document.getElementById('enemySprite');
        if (enemySprite && (!enemySprite.src || enemySprite.src === '')) {
            console.warn('[Battle] Enemy sprite src is empty! Applying emergency fix...');
            if (this.enemy && this.enemy.name) {
                const enemyName = this.enemy.name;
                const idlePath = `assets/enemies/${enemyName}/${enemyName}-IdleFly-animated.gif`;
                enemySprite.src = idlePath;
                enemySprite.style.display = 'block';
                enemySprite.style.visibility = 'visible';
                enemySprite.style.opacity = '1';

            }
        }
        
        addBattleLog('⚔️ Battle Start!');

        // Enemy attacks first (stable behavior)
        try {
            await this.enemyTurn();

        } catch (error) {
            console.error('[Battle] Error during enemyTurn:', error);
            // Emergency fallback: force PLAYER_TURN state
            this.state = BattleState.PLAYER_TURN;
            addBattleLog('⚔️ Your turn!');
            if (typeof updateActionButtons === 'function') {
                updateActionButtons(this.hero);
            }

        }
    }

    // Helper: Apply damage to hero with animation
    applyHeroDamage(damage) {
        this.hero.hp = Math.max(0, this.hero.hp - damage);
        if (window.showBattleDamageAnimation) {
            window.showBattleDamageAnimation('heroSprite', damage);
        }
        
        // Add flicker animation when hero takes damage
        const heroSprite = document.getElementById('heroSprite');
        if (heroSprite && damage > 0) {
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                heroSprite.style.opacity = heroSprite.style.opacity === '0.3' ? '1' : '0.3';
                flickerCount++;
                if (flickerCount >= 12) { // 6 flickers (12 opacity changes) over 2 seconds
                    clearInterval(flickerInterval);
                    heroSprite.style.opacity = '1'; // Ensure sprite is visible at end
                }
            }, 167); // 167ms * 12 = ~2 seconds
        }
    }
    
    // Helper: Apply damage to enemy with animation
    applyEnemyDamage(damage) {
        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        if (window.showBattleDamageAnimation) {
            window.showBattleDamageAnimation('enemySprite', damage);
        }
    }
    
    // Helper: Apply Battle Glove damage boost if active and decrement turns
    applyDamageBoost(baseDamage) {
        let damage = baseDamage;
        
        if (gameState.battleBuffs?.damageBoost?.turnsRemaining > 0) {
            damage += gameState.battleBuffs.damageBoost.value;

            // Decrement turns remaining
            gameState.battleBuffs.damageBoost.turnsRemaining--;
            if (gameState.battleBuffs.damageBoost.turnsRemaining <= 0) {
                delete gameState.battleBuffs.damageBoost;
                addBattleLog('🥊 Battle Glove effect expired!');
            }
        }
        
        return damage;
    }
    
    // Helper: Heal hero with animation
    healHero(amount) {
        const oldHp = this.hero.hp;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + amount);
        const actualHeal = this.hero.hp - oldHp;
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('heroSprite', actualHeal);
        }
    }
    
    // Helper: Heal enemy with animation
    healEnemy(amount) {
        const oldHp = this.enemy.hp;
        this.enemy.hp = Math.min(this.enemy.maxHP, this.enemy.hp + amount);
        const actualHeal = this.enemy.hp - oldHp;
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('enemySprite', actualHeal);
        }
    }

    // Player attacks
    async playerAttack() {

        if (this.state !== BattleState.PLAYER_TURN) {
            console.warn('[Battle] playerAttack blocked - not player turn');
            return;
        }
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        // If hero is stunned by an enemy ability, skip this turn
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        
        // Process poison effect
        if (this.poisonTurns > 0) {
            this.hero.hp = Math.max(0, this.hero.hp - this.poisonDamage);
            this.attackGauge = Math.max(0, this.attackGauge - this.poisonGaugeDrain);
            this.defenseGauge = Math.max(0, this.defenseGauge - this.poisonGaugeDrain);
            addBattleLog(`☠️ Poison drained ${this.poisonDamage} HP and ${this.poisonGaugeDrain} from each gauge!`);
            this.poisonTurns--;
            updateBattleUI(this.hero, this.enemy);
            
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
                return;
            }
        }
        
        // Process mushroom effect
        if (this.mushroomTurns > 0) {
            this.attackGauge = Math.max(0, this.attackGauge - this.mushroomGaugeDrain);
            this.defenseGauge = Math.max(0, this.defenseGauge - this.mushroomGaugeDrain);
            addBattleLog(`🍄 Mushroom effect drained ${this.mushroomGaugeDrain} from each gauge!`);
            
            // Check for skip turn
            if (Math.random() < this.mushroomSkipChance) {
                addBattleLog(`😵 Mushroom effect made you skip your turn!`);
                this.mushroomTurns--;
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                await this.enemyTurn();
                return;
            }
        }
        
        // === TICK DOWN TEMPORARY ENEMY BUFFS / HERO DEBUFFS ===
        // Morph: restore enemy defense after morphDuration turns
        if (this._morphTurnsLeft > 0 && this._morphRestoreCallback) {
            this._morphRestoreCallback();
            this._morphTurnsLeft--;
            if (this._morphTurnsLeft <= 0) {
                this._morphRestoreCallback = null;
            }
        }
        // Charm: restore hero defense after 2 turns
        if (this._charmTurnsLeft > 0) {
            this._charmTurnsLeft--;
            if (this._charmTurnsLeft <= 0 && this._charmOriginalDefense !== undefined) {
                this.hero.defense = this._charmOriginalDefense;
                this._charmOriginalDefense = undefined;
                addBattleLog('✨ Charm effect faded. Your defense is restored!');
            }
        }
        // Super Defense: restore enemy defense after 2 turns
        if (this._superDefenseTurnsLeft > 0) {
            this._superDefenseTurnsLeft--;
            if (this._superDefenseTurnsLeft <= 0 && this._superDefenseOriginal !== undefined) {
                this.enemy.defense = this._superDefenseOriginal;
                this._superDefenseOriginal = undefined;
                addBattleLog(`🛡️ ${this.enemy.name}'s Super Defense faded.`);
            }
        }
        
        if (this.attackGauge < 10) {
            addBattleLog('❌ Not enough attack gauge!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 10;
        this.attackCount++;
        updateBattleUI(this.hero, this.enemy);

        // Play hero attack animation (regular attack only)
        startHeroAnimation('attack1');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms
        
        // Reset to idle immediately after attack animation completes
        startHeroAnimation('idle');

        // Check for mushroom miss effect
        if (this.mushroomTurns > 0 && Math.random() < this.mushroomMissChance) {
            addBattleLog(`😵 Mushroom effect made you miss!`);
            this.mushroomTurns--;
            updateBattleUI(this.hero, this.enemy);
            
            // Reset hero sprite to idle
            startHeroAnimation('idle');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
            return;
        }
        
        // Check if enemy evades (Ghost ability, Sunny Dragon, or Fly)
        if ((this.enemy.canEvade || this.enemy.evasionAbility) && Math.random() < this.enemy.evasionChance) {
            const evasionEmoji = this.enemy.name === 'Fly Drone' ? '🪰' : '👻';
            addBattleLog(`${evasionEmoji} ${this.enemy.name} evaded your attack!`);
            updateBattleUI(this.hero, this.enemy);
            
            // Reset hero sprite to idle
            startHeroAnimation('idle');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
            return;
        }
        
        // Calculate damage using base attack (level-based) with randomization
        // Damage range: baseDamage to baseDamage + 10 (e.g., Level 10: 15-25 damage)
        const baseDamage = this.hero.attack;
        const maxDamage = baseDamage + 10;
        const randomDamage = Math.floor(Math.random() * (maxDamage - baseDamage + 1)) + baseDamage;
        
        // Enemy defense reduces damage slightly
        const defenseReduction = Math.floor(this.enemy.defense * 0.1); // Only 10% of enemy defense
        let damage = Math.max(randomDamage - defenseReduction, Math.floor(randomDamage * 0.8)); // At least 80% of damage
        
        // Apply Battle Glove damage boost if active
        damage = this.applyDamageBoost(damage);
        
        // Focus Timer Special Attack: Random chance to trigger overpowered attack
        const focusMinutes = window.gameState?.totalFocusMinutes || 0;
        const maxFocusAttack = Math.min(Math.floor(focusMinutes / 10), 35); // Max 35 damage at 350 minutes
        const hasFocusAttack = maxFocusAttack >= 25 && !this.focusAttackUsed;
        
        if (hasFocusAttack) {
            // 20% chance to trigger focus attack on regular attack
            const triggerChance = Math.random();
            if (triggerChance <= 0.2) {
                this.focusAttackUsed = true;
                damage = maxFocusAttack; // Override with focus attack damage
                addBattleLog(`🔥 FOCUS POWER UNLEASHED! Massive ${damage} damage!`);
            }
        }
        
        // === OVERTHINK BACKFIRE: Attack hits the hero instead of the enemy ===
        if (this.overthinkBackfire) {
            this.overthinkBackfire = false;
            addBattleLog(`🧠 Overthink backfire! Your attack dealt ${damage} damage to yourself!`);
            this.applyHeroDamage(damage);
            startHeroAnimation('hurt');
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            startHeroAnimation('idle');
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                await this.enemyTurn();
            }
            return;
        }
        
        const isDead = this.enemy.takeDamage(damage);
        
        // Increase special attack gauge by 15 per attack
        if (window.increaseSpecialGauge) {
            window.increaseSpecialGauge(15);
            // Update action buttons to enable special attack button if gauge is full
            updateActionButtons(this.hero);
        }

        // Play attack sounds
        if (window.audioManager) {
            // Play new monster regular attack sound for non-special attacks
            window.audioManager.playSound('enemy_regular_attack', 0.8);
            
            // Play every 3rd attack sound
            if (this.attackCount % 3 === 0 && this.attackCount > 0) {
                window.audioManager.playSound('third_attack', 0.8);
            }
            
            // Play critical hit sound for damage >= 10
            if (damage >= 10) {
                window.audioManager.playSound('critical_hit', 0.8);
            }
        }
        
        // Fire Pig Projectile Attack on 3rd attack
        if (this.attackCount % 3 === 0 && this.attackCount > 0) {
            const equippedSkin = window.gameState?.equippedSkinId;
            if (equippedSkin === 'fire_pig') {
                await this.playFirePigProjectile();
            }
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`💥 You dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);
        startHeroAnimation('idle');

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player uses spark (unlocked at level 7)
    async playerSpark() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for spark!');
            return;
        }

        const sparkCount = gameState.battleInventory?.spark || 0;
        if (sparkCount <= 0) {
            addBattleLog('❌ No sparks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;  // Spark costs 25 attack gauge
        gameState.battleInventory.spark = Math.max(0, gameState.battleInventory.spark - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for spark
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play spark animation
        const heroSprite = document.getElementById('heroSprite');
        const enemySprite = document.getElementById('enemySprite');
        await playSparkAnimation(heroSprite, enemySprite);
        
        // Play spark attack sound
        if (window.audioManager) {
            window.audioManager.playSound('spark_attack', 0.8);
        }

        // Calculate damage (35-45 range, melee strike - INCREASED)
        let damage = Math.floor(Math.random() * 11) + 35; // Random between 35-45
        damage = this.applyDamageBoost(damage); // Apply Battle Glove boost
        const isDead = this.enemy.takeDamage(damage);
        
        // Play critical hit sound for damage >= 10 (Spark always deals 18-20)
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`⚡ Spark dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Save game state
        saveGameState();

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player defends - activates defense mode
    async playerDefend() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        
        if (this.defendBlocked > 0) {
            addBattleLog(`❌ Defend is blocked for ${this.defendBlocked} more turn(s)!`);
            return;
        }

        this.state = BattleState.ANIMATING;
        this.defendActive = true; // Flag to use defense gauge on next hit
        
          // Increase special attack gauge by 10 per defend
        if (window.increaseSpecialGauge) {
            window.increaseSpecialGauge(10);
            // Update action buttons to enable special attack button if gauge is full
            updateActionButtons(this.hero);
        }
        
        // Play defend sound
        if (window.audioManager) {
            window.audioManager.playSound('defend', 0.7);
        }
        
        // Play yellow buff animation over hero (defend)
        if (window.playHeroBuffAnimation) {
            await window.playHeroBuffAnimation('defend');
        }
        
        // Show defend animation
        if (window.showDefendAnimation) {
            await window.showDefendAnimation('heroSprite');
        }
        
        addBattleLog('🛡️ Defense stance activated!');
        updateBattleUI(this.hero, this.enemy);

        await new Promise(resolve => setTimeout(resolve, 800));
        await this.enemyTurn();
    }

    // Player uses fireball
    async playerFireball() {
        // === STUN / DAZE CHECK ===
        if (this.state === BattleState.PLAYER_TURN && this.heroStunnedTurns > 0) {
            if (typeof stopTurnTimer === 'function') stopTurnTimer();
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.fireballBlocked) {
            addBattleLog('❌ Fireball is blocked by Drench!');
            return;
        }
        
        if (this.attackGauge < 30) {
            addBattleLog('❌ Need 30 attack gauge for fireball!');
            return;
        }

        const fireballCount = gameState.battleInventory?.fireball || 0;
        if (fireballCount <= 0) {
            addBattleLog('❌ No fireballs left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 30;  // Fireball costs 30 attack gauge
        gameState.battleInventory.fireball = Math.max(0, gameState.battleInventory.fireball - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for fireball
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play fireball sound
        if (window.audioManager) {
            window.audioManager.playSound('fireball', 0.7);
        }

        // Play fireball animation
        await playFireballAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (30-40 range - INCREASED)
        let damage = Math.floor(Math.random() * 11) + 30; // Random between 30-40
        damage = this.applyDamageBoost(damage); // Apply Battle Glove boost
        const isDead = this.enemy.takeDamage(damage);

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🔥 Fireball dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player uses prickler
    // Player uses asteroid attack
    async playerAsteroid() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        
        if (this.attackGauge < 15) {
            addBattleLog('❌ Need 15 attack gauge for asteroid!');
            return;
        }

        const asteroidCount = gameState.battleInventory?.asteroid_attack || 0;
        if (asteroidCount <= 0) {
            addBattleLog('❌ No asteroids left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 15;  // Asteroid costs 15 attack gauge
        gameState.battleInventory.asteroid_attack = Math.max(0, gameState.battleInventory.asteroid_attack - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play asteroid animation
        await playAsteroidAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );

        // Calculate damage (40-50 base damage - INCREASED)
        let damage = Math.floor(Math.random() * 11) + 40; // 40-50 damage;
        damage = this.applyDamageBoost(damage); // Apply Battle Glove boost
        const isDead = this.enemy.takeDamage(damage);
        
        // Play critical hit sound for damage >= 10
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🪨 Asteroid Attack dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    async playerPrickler() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        
        if (this.attackGauge < 20) {
            addBattleLog('❌ Need 20 attack gauge for prickler!');
            return;
        }

        const pricklerCount = gameState.battleInventory?.prickler || 0;
        if (pricklerCount <= 0) {
            addBattleLog('❌ No pricklers left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 20;  // Prickler costs 20 attack gauge
        gameState.battleInventory.prickler = Math.max(0, gameState.battleInventory.prickler - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for prickler
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play prickler animation
        await playPricklerAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play prickler attack sound
        if (window.audioManager) {
            window.audioManager.playSound('prickler_attack', 0.8);
        }

        // Calculate damage (20-30 range with nuclear explosion - INCREASED)
        let damage = Math.floor(Math.random() * 11) + 20; // Random between 20-30
        damage = this.applyDamageBoost(damage); // Apply Battle Glove boost
        const isDead = this.enemy.takeDamage(damage);
        
        // Play critical hit sound for damage >= 10 (Prickler always deals 10-15)
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`💣 Prickler dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.enemyTurn();
        }
    }

    // Player uses freeze (deals damage and skips enemy turn)
    async playerFreeze() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }
        
        if (this.attackGauge < 35) {
            addBattleLog('❌ Need 35 attack gauge for freeze!');
            return;
        }

        const freezeCount = gameState.battleInventory?.freeze || 0;
        if (freezeCount <= 0) {
            addBattleLog('❌ No freeze attacks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 35;  // Freeze costs 35 attack gauge
        gameState.battleInventory.freeze = Math.max(0, gameState.battleInventory.freeze - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation for freeze
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600)); // 4 frames * 150ms

        // Play freeze animation
        await playFreezeAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play freeze attack sound
        if (window.audioManager) {
            window.audioManager.playSound('freeze_attack', 0.8);
        }

        // Calculate damage (30-35 damage, skips 2 turns - INCREASED)
        let damage = Math.floor(Math.random() * 6) + 30; // 30-35 damage
        damage = this.applyDamageBoost(damage); // Apply Battle Glove boost
        const isDead = this.enemy.takeDamage(damage);
        
        // Play critical hit sound for damage >= 10
        if (window.audioManager && damage >= 10) {
            window.audioManager.playSound('critical_hit', 0.8);
        }

        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`❄️ Freeze dealt ${damage} damage and froze the enemy!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            // Set enemy frozen for 2 turns
            this.enemyFrozenTurns = 2;
            addBattleLog('❄️ Enemy is frozen for 2 turns!');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.state = BattleState.PLAYER_TURN;
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
        }
    }

    // Player uses potion
    async playerPotion() {



        if (this.state !== BattleState.PLAYER_TURN) {

            return;
        }
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        // Note: potions are blocked while stunned (stun prevents all actions)
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const potionCount = gameState.battleInventory?.health_potion || 0;

        if (potionCount <= 0) {
            addBattleLog('❌ No potions left!');

            return;
        }

         this.state = BattleState.ANIMATING;
        gameState.battleInventory.health_potion = Math.max(0, gameState.battleInventory.health_potion - 1);
        
          // Play potion sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.8);
        }
        
        // Play blue buff animation over hero
        if (window.playHeroBuffAnimation) {
            await window.playHeroBuffAnimation('potion');
        }
        
        // Show potion/boost animation
        if (window.showPotionBoostAnimation) {
            await window.showPotionBoostAnimation('heroSprite');
        }
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        const healAmount = 20;
        const oldHp = this.hero.hp;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        const actualHeal = this.hero.hp - oldHp;
        
        // Show heal animation
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('heroSprite', actualHeal);
        }
        
        addBattleLog(`💚 Healed ${actualHeal} HP!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);;

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800)); // 8 frames * 100ms
        
        // Reset to idle
        startHeroAnimation('idle');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.enemyTurn();
    }

    // Player uses hyper potion
    async playerHyperPotion() {


        if (this.state !== BattleState.PLAYER_TURN) {

            return;
        }
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const hyperPotionCount = gameState.battleInventory?.hyper_potion || 0;

        if (hyperPotionCount <= 0) {
            addBattleLog('❌ No hyper potions left!');

            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.hyper_potion = Math.max(0, gameState.battleInventory.hyper_potion - 1);
        
        // Play potion use sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.7);
        }
        
        // Play blue buff animation over hero
        if (window.playHeroBuffAnimation) {
            await window.playHeroBuffAnimation('potion');
        }
        
        // Show potion/boost animation
        if (window.showPotionBoostAnimation) {
            await window.showPotionBoostAnimation('heroSprite');
        }
        
        // Play hero jump animation
        startHeroAnimation('jump');
        
        const healAmount = 50;
        const oldHp = this.hero.hp;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        const actualHeal = this.hero.hp - oldHp;
        
        // Show heal animation
        if (actualHeal > 0 && window.showBattleHealAnimation) {
            window.showBattleHealAnimation('heroSprite', actualHeal);
        }
        
        addBattleLog(`💚 Hyper Potion healed ${actualHeal} HP!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Reset to idle
        startHeroAnimation('idle');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.enemyTurn();
    }

    // Player flees
    async playerFlee() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

        this.state = BattleState.FLED;
        addBattleLog('🏃 You fled from battle!');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        await this.endBattle('fled');
    }

    // Player uses attack refill
    async playerAttackRefill() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const refillCount = gameState.battleInventory?.attack_refill || 0;
        if (refillCount <= 0) {
            addBattleLog('❌ No attack refills left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.attack_refill = Math.max(0, gameState.battleInventory.attack_refill - 1);
        
        // Play potion/power boost sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.8);
        }
        
        // Play blue buff animation over hero (attack boost)
        if (window.playHeroBuffAnimation) {
            await window.playHeroBuffAnimation('attack');
        }
        
        const refillAmount = 50;
        this.attackGauge = Math.min(100, this.attackGauge + refillAmount);
        
        addBattleLog(`⚡ Restored ${refillAmount} attack gauge!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses defense refill
    async playerDefenseRefill() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const refillCount = gameState.battleInventory?.defense_refill || 0;
        if (refillCount <= 0) {
            addBattleLog('❌ No defense refills left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.defense_refill = Math.max(0, gameState.battleInventory.defense_refill - 1);
        
        // Play defense boost sound
        if (window.audioManager) {
            window.audioManager.playSound('defense_boost', 0.7);
        }
        
        // Play yellow buff animation over hero (defense boost)
        if (window.playHeroBuffAnimation) {
            await window.playHeroBuffAnimation('defense');
        }
        
        const refillAmount = 50;
        this.defenseGauge = Math.min(100, this.defenseGauge + refillAmount);
        
        addBattleLog(`🛡️ Restored ${refillAmount} defense gauge!`);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses invisibility cloak
    async playerInvisibilityCloak() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

        const cloakCount = gameState.battleInventory?.invisibility_cloak || 0;
        if (cloakCount <= 0) {
            addBattleLog('❌ No Invisibility Cloaks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.invisibility_cloak = Math.max(0, gameState.battleInventory.invisibility_cloak - 1);
        this.hasEvade = true;
        
        // Play invisibility cloak sound
        if (window.audioManager) {
            window.audioManager.playSound('cloak_use', 0.8);
        }
        
        addBattleLog('🤟🏻 Invisibility Cloak activated! You will evade the next attack.');
        
        // Flicker monster sprite on/off during cloak effect
        const heroSprite = document.getElementById('heroSprite');
        if (heroSprite) {
            for (let i = 0; i < 6; i++) {
                heroSprite.style.opacity = '0';
                await new Promise(resolve => setTimeout(resolve, 100));
                heroSprite.style.opacity = '1';
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // Play hero roll animation
        if (window.playHeroRollAnimation) {
            await window.playHeroRollAnimation();
        }
        
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 500));
        await this.enemyTurn();
    }

    // Player uses Mirror Attack
    async playerMirrorAttack() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }

        const mirrorCount = gameState.battleInventory?.mirror_attack || 0;
        if (mirrorCount <= 0) {
            addBattleLog('❌ No Mirror Attacks left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.mirror_attack = Math.max(0, gameState.battleInventory.mirror_attack - 1);
        this.hasReflect = true;
        
        // Play mirror sound (using cloak sound as placeholder)
        if (window.audioManager) {
            window.audioManager.playSound('cloak_use', 0.8);
        }
        
        // Show mirror attack animation
        if (window.showMirrorAttackAnimation) {
            await window.showMirrorAttackAnimation('heroSprite');
        }
        
        addBattleLog('🪞 Mirror Attack activated! Enemy\'s next attack will be reflected!');
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Save game state
        saveGameState();

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.enemyTurn();
    }

    // Player uses Blue Flame
    async playerBlueFlame() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 20) {
            addBattleLog('❌ Need 20 attack gauge for Blue Flame!');
            return;
        }

        const blueFlameCount = gameState.battleInventory?.blue_flame || 0;
        if (blueFlameCount <= 0) {
            addBattleLog('❌ No Blue Flames left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 20;
        gameState.battleInventory.blue_flame = Math.max(0, gameState.battleInventory.blue_flame - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play blue flame animation
        await playBlueFlameAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play blue flame sound
        if (window.audioManager) {
            window.audioManager.playSound('fireball', 0.7); // Use fireball sound for blue flame
        }

        // Calculate damage (30-40 base damage - INCREASED)
        const damage = Math.floor(Math.random() * 11) + 30; // 30-40 damage
        const isDead = this.enemy.takeDamage(damage);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🔵🔥 Blue Flame dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.enemyTurn();
        }
    }

    // Player uses Procrastination Ghost
    async playerProcrastinationGhost() {
        if (this.state !== BattleState.PLAYER_TURN) return;
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        if (this.attackGauge < 25) {
            addBattleLog('❌ Need 25 attack gauge for Procrastination Ghost!');
            return;
        }

        const ghostCount = gameState.battleInventory?.procrastination_ghost || 0;
        if (ghostCount <= 0) {
            addBattleLog('❌ No Procrastination Ghosts left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        this.attackGauge -= 25;
        gameState.battleInventory.procrastination_ghost = Math.max(0, gameState.battleInventory.procrastination_ghost - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play procrastination ghost animation
        await playProcrastinationGhostAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play ghost sound
        if (window.audioManager) {
            window.audioManager.playSound('spark_attack', 0.6); // Use spark sound for ghost
        }

        // Calculate variable damage (40-50 range, skips 1 turn - INCREASED)
        const damage = Math.floor(Math.random() * 11) + 40; // Random between 40-50
        const isDead = this.enemy.takeDamage(damage);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`👻 Procrastination Ghost dealt ${damage} damage and made enemy skip next turn!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            // Enemy skips turn, go back to player
            addBattleLog('👻 Enemy is procrastinating and skips their turn!');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.state = BattleState.PLAYER_TURN;
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
        }
    }

    // Enemy turn
    async enemyTurn() {

        this.state = BattleState.ENEMY_TURN;

        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if enemy is frozen
        if (this.enemyFrozenTurns > 0) {
            this.enemyFrozenTurns--;
            addBattleLog(`❄️ Enemy is frozen! (${this.enemyFrozenTurns} turns remaining)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Skip enemy turn and return to player turn
            this.state = BattleState.PLAYER_TURN;
            
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            
            // Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // FIX: Apply Nova's poison damage at start of enemy turn
        if (this.novaPoisonTurns > 0) {
            const poisonDamage = this.novaPoisonDamage || 2;
            const isDead = this.enemy.takeDamage(poisonDamage);
            addBattleLog(`☠️ Poison dealt ${poisonDamage} damage! (${this.novaPoisonTurns} turns left)`);
            
            this.novaPoisonTurns--;
            if (this.novaPoisonTurns <= 0) {
                addBattleLog('✨ Poison effect ended!');
            }
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // === NOVA SPECIAL: Burn DoT — applied at start of each enemy turn ===
        if (this.burnTurns > 0) {
            const burnDmg = this.burnDamage || 20;
            const burnDead = this.enemy.takeDamage(burnDmg);
            addBattleLog(`🔥 Burn dealt ${burnDmg} damage! (${this.burnTurns} turns left)`);
            this.burnTurns--;
            if (this.burnTurns <= 0) {
                addBattleLog('✨ Burn effect ended!');
            }
            updateBattleUI(this.hero, this.enemy);
            if (burnDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 700));
        }
        
        // === BENNY SPECIAL: Defense Immunity — tick down each enemy turn ===
        if (this.defenseImmune > 0) {
            this.defenseImmune--;
            if (this.defenseImmune <= 0) {
                addBattleLog('🛡️ Defense immunity expired!');
            }
        }
        
        // === ADAPTIVE HEALING AI ===
        if (window.enemyAI && this.enemy.hp < this.enemy.maxHP) {
            const playerLevel = gameState.level || 1;
            const healResult = window.enemyAI.attemptEnemyHeal(this.enemy, playerLevel);
            
            if (healResult.healed) {
                // Show heal animation above enemy
                if (window.showBattleHealAnimation) {
                    window.showBattleHealAnimation('enemySprite', healResult.amount);
                }
                
                addBattleLog(`💚 ${this.enemy.name} regenerates ${healResult.amount} HP!`);
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
                return;
            }
        }
        
        // === SMART DEFENSE AI ===
        if (window.enemyAI) {
            const willDefend = window.enemyAI.attemptEnemyDefense(this.enemy);
            
            if (willDefend) {
                addBattleLog(`🛡️ ${this.enemy.name} braces for impact!`);
                updateBattleUI(this.hero, this.enemy);
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
                return;
            }
        }

        // Check if enemy can petrify (Medusa)
        const canPetrify = this.enemy.canPetrify && Math.random() < (this.enemy.petrifyChance || 0.3);
        
        if (canPetrify) {
            // Petrify attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show Medusa projectile if available
            if (this.enemy.projectileType === 'medusa') {
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playMedusaProjectile(enemySprite, heroSprite);
            }
            
            addBattleLog(`💎 ${this.enemy.name}'s gaze petrifies you! Turn skipped!`);
            
            // Show stone effect on hero
            const heroSprite = document.getElementById('heroSprite');
            const stoneEffect = document.createElement('div');
            stoneEffect.style.position = 'absolute';
            stoneEffect.style.fontSize = '3rem';
            stoneEffect.style.animation = 'pulse 1s ease-in-out';
            stoneEffect.textContent = '🗿';
            heroSprite.parentElement.appendChild(stoneEffect);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            stoneEffect.remove();
            
            // Enemy gets another turn (player is petrified)
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.enemyTurn();
            return;
        }

        // Check if enemy can cast sleep (Lazy Eye)
        const canCastSleep = this.enemy.canSleep && Math.random() < 0.3; // 30% chance
        
        if (canCastSleep) {
            // Sleep attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            addBattleLog(`😴 ${this.enemy.name} cast Sleep! You skip your next turn!`);
            
            // Show Z emojis on hero
            const heroSprite = document.getElementById('heroSprite');
            const sleepEmojis = document.createElement('div');
            sleepEmojis.style.position = 'absolute';
            sleepEmojis.style.fontSize = '2rem';
            sleepEmojis.style.animation = 'float 2s ease-in-out';
            sleepEmojis.textContent = '💤 💤 💤';
            heroSprite.parentElement.appendChild(sleepEmojis);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            sleepEmojis.remove();
            
            // Enemy gets another turn
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.enemyTurn();
            return;
        }
        
        // =====================================================================
        // === ENEMY SPECIAL ABILITIES (can* flags from enemy/boss-enemies.js) ===
        // =====================================================================
        
        // Helper to return to player turn
        const returnToPlayerTurn = async () => {
            await new Promise(resolve => setTimeout(resolve, 1200));
            this.state = BattleState.PLAYER_TURN;
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
        };
        
        // --- STUN (canStun) ---
        // Enemy stuns hero, causing them to skip their next turn
        if (this.enemy.canStun && Math.random() < (this.enemy.stunChance || 0.30)) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const stunDuration = this.enemy.stunDuration || 1;
            this.heroStunnedTurns = stunDuration;
            addBattleLog(`⚡ ${this.enemy.name} stunned you! You will skip ${stunDuration} turn(s)!`);
            const heroSprite = document.getElementById('heroSprite');
            if (heroSprite) {
                heroSprite.style.filter = 'brightness(2) saturate(0)';
                setTimeout(() => { heroSprite.style.filter = ''; }, 1500);
            }
            updateBattleUI(this.hero, this.enemy);
            await returnToPlayerTurn();
            return;
        }
        
        // --- DAZE (canDaze) ---
        // Enemy dazes hero, causing them to skip their next turn (1 turn)
        if (this.enemy.canDaze && Math.random() < (this.enemy.dazeChance || 0.25)) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            this.heroStunnedTurns = 1;
            addBattleLog(`💫 ${this.enemy.name} dazed you! You will skip your next turn!`);
            const heroSprite = document.getElementById('heroSprite');
            if (heroSprite) {
                heroSprite.style.filter = 'brightness(2) hue-rotate(180deg)';
                setTimeout(() => { heroSprite.style.filter = ''; }, 1500);
            }
            updateBattleUI(this.hero, this.enemy);
            await returnToPlayerTurn();
            return;
        }
        
        // --- POISON (canPoison) ---
        // Enemy poisons hero, dealing damage over multiple turns
        if (this.enemy.canPoison && !this.poisonTurns && Math.random() < 0.35) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const poisonDmg = this.enemy.poisonDamage || 8;
            const poisonDur = this.enemy.poisonDuration || 3;
            const baseDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.enemy.attack * 0.5));
            this.applyHeroDamage(baseDamage);
            this.poisonTurns = poisonDur;
            this.poisonDamage = poisonDmg;
            this.poisonGaugeDrain = 8;
            addBattleLog(`☠️ ${this.enemy.name} attacked for ${baseDamage} damage and poisoned you!`);
            addBattleLog(`🧪 Poison will drain ${poisonDmg} HP per turn for ${poisonDur} turns!`);
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 1500));
            startHeroAnimation('idle');
            updateBattleUI(this.hero, this.enemy);
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                await returnToPlayerTurn();
            }
            return;
        }
        
        // --- ABSORB (canAbsorb) ---
        // Enemy absorbs HP from hero (life drain)
        if (this.enemy.canAbsorb && Math.random() < 0.30) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const absorbMin = this.enemy.absorbMin || 20;
            const absorbMax = this.enemy.absorbMax || 35;
            const absorbAmt = Math.floor(Math.random() * (absorbMax - absorbMin + 1)) + absorbMin;
            this.applyHeroDamage(absorbAmt);
            this.healEnemy(absorbAmt);
            addBattleLog(`🖤 ${this.enemy.name} drained ${absorbAmt} HP from you!`);
            if (window.showBattleHealAnimation) window.showBattleHealAnimation('enemySprite', absorbAmt);
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 1500));
            startHeroAnimation('idle');
            updateBattleUI(this.hero, this.enemy);
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                await returnToPlayerTurn();
            }
            return;
        }
        
        // --- BERSERK (canBerserk) ---
        // Enemy goes berserk and attacks multiple times in one turn
        if (this.enemy.canBerserk && Math.random() < 0.25) {
            const berserkHits = this.enemy.berserkAttacks || 3;
            addBattleLog(`💢 ${this.enemy.name} goes BERSERK! ${berserkHits} rapid attacks!`);
            let totalDamage = 0;
            for (let i = 0; i < berserkHits; i++) {
                await playEnemyAnimation(this.enemy, 'attack1', 300);
                const hitDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                    ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                    : Math.max(3, Math.floor(this.enemy.attack * 0.6));
                const reducedHit = Math.floor(hitDamage * 0.5); // Each berserk hit is 50% damage
                this.applyHeroDamage(reducedHit);
                totalDamage += reducedHit;
                startHeroAnimation('hurt');
                await new Promise(resolve => setTimeout(resolve, 400));
                startHeroAnimation('idle');
                if (this.hero.hp <= 0) break;
            }
            addBattleLog(`💥 Berserk dealt ${totalDamage} total damage!`);
            updateBattleUI(this.hero, this.enemy);
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                await returnToPlayerTurn();
            }
            return;
        }
        
        // --- PICKPOCKET (canPickpocket) ---
        // Enemy steals battle items from inventory and deals damage
        if (this.enemy.canPickpocket && Math.random() < 0.30) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const pickpocketCount = this.enemy.pickpocketCount || 2;
            const baseDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.enemy.attack * 0.7));
            this.applyHeroDamage(baseDamage);
            // Steal actual battle items from inventory
            const battleItemKeys = [
                'health_potion', 'hyper_potion', 'attack_refill', 'defense_refill',
                'spark', 'fireball', 'freeze', 'asteroid_attack', 'prickler',
                'invisibility_cloak', 'mirror_attack', 'blue_flame', 'procrastination_ghost',
                'throwing_stars', 'battle_glove', 'jade_dagger', 'wizards_wand'
            ];
            const stolenItems = [];
            let itemsToSteal = pickpocketCount;
            // Shuffle and steal from items that have quantity > 0
            const availableItems = battleItemKeys.filter(k => (gameState.battleInventory?.[k] || 0) > 0);
            for (let i = availableItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableItems[i], availableItems[j]] = [availableItems[j], availableItems[i]];
            }
            for (let i = 0; i < Math.min(itemsToSteal, availableItems.length); i++) {
                const key = availableItems[i];
                gameState.battleInventory[key] = Math.max(0, (gameState.battleInventory[key] || 0) - 1);
                stolenItems.push(key.replace(/_/g, ' '));
            }
            const stolenMsg = stolenItems.length > 0 ? `Stole: ${stolenItems.join(', ')}!` : 'Nothing to steal!';
            addBattleLog(`👜 ${this.enemy.name} pickpocketed you! ${baseDamage} damage. ${stolenMsg}`);
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 1500));
            startHeroAnimation('idle');
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                await returnToPlayerTurn();
            }
            return;
        }
        
        // --- MORPH (canMorph) ---
        // Enemy morphs, temporarily boosting its defense
        if (this.enemy.canMorph && Math.random() < 0.25) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const morphDur = this.enemy.morphDuration || 2;
            const originalDefense = this.enemy.defense;
            this.enemy.defense = Math.floor(this.enemy.defense * 2);
            addBattleLog(`🌀 ${this.enemy.name} morphed! Defense doubled for ${morphDur} turns!`);
            // Schedule defense restoration
            let turnsLeft = morphDur;
            const morphRestore = () => {
                turnsLeft--;
                if (turnsLeft <= 0) {
                    this.enemy.defense = originalDefense;
                    addBattleLog(`🌀 ${this.enemy.name}'s morph faded. Defense returned to normal.`);
                }
            };
            // Store restore callback for use in next player actions
            this._morphRestoreCallback = morphRestore;
            this._morphTurnsLeft = morphDur;
            updateBattleUI(this.hero, this.enemy);
            await returnToPlayerTurn();
            return;
        }
        
        // --- CHARM (canCharm) ---
        // Enemy charms hero, reducing their defense
        if (this.enemy.canCharm && Math.random() < 0.25) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const defReduction = this.enemy.charmDefenseReduction || 0.5;
            const charmedDefense = Math.floor(this.hero.defense * (1 - defReduction));
            const originalDefense = this.hero.defense;
            this.hero.defense = charmedDefense;
            addBattleLog(`💕 ${this.enemy.name} charmed you! Your defense reduced by ${Math.floor(defReduction * 100)}% for 2 turns!`);
            // Restore defense after 2 turns
            this._charmTurnsLeft = 2;
            this._charmOriginalDefense = originalDefense;
            const heroSprite = document.getElementById('heroSprite');
            if (heroSprite) {
                heroSprite.style.filter = 'hue-rotate(300deg) brightness(1.3)';
                setTimeout(() => { heroSprite.style.filter = ''; }, 2000);
            }
            updateBattleUI(this.hero, this.enemy);
            await returnToPlayerTurn();
            return;
        }
        
        // --- OVERTHINK (canOverthink) ---
        // Enemy overthinks — sets backfire flag so hero's next attack backfires
        if (this.enemy.canOverthink && Math.random() < 0.35) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            // Set backfire flag: hero's next attack will deal damage to themselves
            this.overthinkBackfire = true;
            // Also drain both gauges as a secondary effect
            const gaugeDrain = Math.floor(Math.random() * 15) + 10;
            this.attackGauge = Math.max(0, this.attackGauge - gaugeDrain);
            this.defenseGauge = Math.max(0, this.defenseGauge - gaugeDrain);
            addBattleLog(`🧠 ${this.enemy.name} used Overthink! Your next attack will backfire!`);
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            await new Promise(resolve => setTimeout(resolve, 1200));
            await returnToPlayerTurn();
            return;
        }
        
        // --- TELEPORT (canTeleport) ---
        // Enemy teleports and delivers a surprise strike from behind
        if (this.enemy.canTeleport && Math.random() < 0.30) {
            const enemySpriteEl = document.getElementById('enemySprite');
            if (enemySpriteEl) {
                enemySpriteEl.style.opacity = '0';
                enemySpriteEl.style.transition = 'opacity 0.3s';
            }
            await new Promise(resolve => setTimeout(resolve, 400));
            if (enemySpriteEl) {
                enemySpriteEl.style.opacity = '1';
            }
            await playEnemyAnimation(this.enemy, 'attack1', 400);
            const teleportDmg = this.enemy.teleportDamage || 20;
            const teleportDur = this.enemy.teleportDuration || 3;
            this.applyHeroDamage(teleportDmg);
            // Apply defense drain for teleportDuration turns
            this.defenseGauge = Math.max(0, this.defenseGauge - 20);
            addBattleLog(`⚡ ${this.enemy.name} teleported and struck from behind for ${teleportDmg} damage!`);
            addBattleLog(`🛡️ Your defense gauge drained!`);
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 1500));
            startHeroAnimation('idle');
            updateBattleUI(this.hero, this.enemy);
            updateActionButtons(this.hero);
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                await returnToPlayerTurn();
            }
            return;
        }
        
        // --- SUPER DEFENSE (superDefense) ---
        // Enemy activates super defense, reducing incoming damage significantly
        if (this.enemy.superDefense && Math.random() < 0.20) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            const defRedPct = this.enemy.defenseReduction || 0.35;
            // Temporarily boost defense
            const originalDef = this.enemy.defense;
            this.enemy.defense = Math.floor(this.enemy.defense * (1 + defRedPct * 2));
            addBattleLog(`🛡️ ${this.enemy.name} activates Super Defense! Damage reduced by ${Math.floor(defRedPct * 100)}%!`);
            // Restore after 2 turns
            this._superDefenseTurnsLeft = 2;
            this._superDefenseOriginal = originalDef;
            updateBattleUI(this.hero, this.enemy);
            await returnToPlayerTurn();
            return;
        }
        
        // =====================================================================
        // === END ENEMY SPECIAL ABILITIES ===
        // =====================================================================
        
        // Check for Octopus drench attack (50% chance)
        const useDrench = this.enemy.drenchAttack && Math.random() < 0.5;
        
        // Check for Octopus hug attack (30% chance)
        const useHug = this.enemy.hugAttack && !useDrench && Math.random() < 0.3;
        
        if (useDrench) {
            // Drench attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show splash projectile
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playSplashAnimation(enemySprite, heroSprite);
            
            // Apply drench effect: 10 damage + block fireball for 1 turn
            this.hero.hp = Math.max(0, this.hero.hp - 10);
            this.fireballBlocked = true;
            addBattleLog(`💦 ${this.enemy.name}'s Drench attack dealt 10 damage and blocked fireball!`);
            
            // Play hero hurt animation
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 2000));
            startHeroAnimation('idle');
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.state = BattleState.PLAYER_TURN;
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        } else if (useHug) {
            // Hug attack
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Apply hug effect: block defend for 2 turns
            this.defendBlocked = 2;
            addBattleLog(`🐙 ${this.enemy.name}'s Hug blocked defend for 2 turns!`);
            
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // Boss special attacks
        if (this.enemy.isBoss) {
            // Treant poison attack
            if (this.enemy.poisonAttack) {
                await playEnemyAnimation(this.enemy, 'attack1', 600);
                
                // Use correct damage range
                const damage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                    ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                    : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
                this.hero.hp = Math.max(0, this.hero.hp - damage);
                
                // Apply poison effect for 2 turns
                this.poisonTurns = this.enemy.poisonDuration;
                this.poisonDamage = 5; // HP drain per turn
                this.poisonGaugeDrain = 10; // Gauge drain per turn
                
                addBattleLog(`🌳 ${this.enemy.name} dealt ${damage} damage and poisoned you!`);
                addBattleLog(`☠️ Poison will drain HP and gauges for ${this.poisonTurns} turns!`);
                
                startHeroAnimation('hurt');
                await new Promise(resolve => setTimeout(resolve, 2000));
                startHeroAnimation('idle');
                
                updateBattleUI(this.hero, this.enemy);
                
                if (this.hero.hp <= 0) {
                    this.state = BattleState.DEFEAT;
                    await this.endBattle('defeat');
                } else {
                    this.state = BattleState.PLAYER_TURN;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    addBattleLog('⚔️ Your turn!');
                    
                    // FIX: Start turn timer
                    if (typeof startTurnTimer === 'function') {
                        const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                        startTurnTimer(timerDuration);
                        this.turnTimerReduced = false;
                    }
                }
                return;
            }
            
            // Sunny Dragon attack gauge drain
            if (this.enemy.drainAttackGauge) {
                await playEnemyAnimation(this.enemy, 'attack1', 600);
                
                // Show dragon bolt projectile
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playDragonBoltProjectile(enemySprite, heroSprite);
                
                // Variable damage 18-40
                const damage = Math.floor(Math.random() * 23) + 18;
                this.hero.hp = Math.max(0, this.hero.hp - damage);
                
                // Drain attack gauge to 5%
                this.attackGauge = 5;
                
                addBattleLog(`🐉 ${this.enemy.name} dealt ${damage} damage!`);
                addBattleLog(`⚡ Your attack gauge was drained to 5%!`);
                
                startHeroAnimation('hurt');
                await new Promise(resolve => setTimeout(resolve, 2000));
                startHeroAnimation('idle');
                
                updateBattleUI(this.hero, this.enemy);
                
                if (this.hero.hp <= 0) {
                    this.state = BattleState.DEFEAT;
                    await this.endBattle('defeat');
                } else {
                    this.state = BattleState.PLAYER_TURN;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    addBattleLog('⚔️ Your turn!');
                    
                    // FIX: Start turn timer
                    if (typeof startTurnTimer === 'function') {
                        const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                        startTurnTimer(timerDuration);
                        this.turnTimerReduced = false;
                    }
                }
                return;
            }
            
            // Mushroom special attack
            if (this.enemy.mushroomAttack) {
                await playEnemyAnimation(this.enemy, 'attack2', 600);
                
                // Show mushroom emoji projectiles
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playMushroomProjectile(enemySprite, heroSprite);
                
                // Use correct damage range
                const damage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                    ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                    : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
                this.hero.hp = Math.max(0, this.hero.hp - damage);
                
                // Apply mushroom effect for 2 turns
                this.mushroomTurns = this.enemy.mushroomEffectDuration;
                this.mushroomMissChance = this.enemy.mushroomMissChance;
                this.mushroomSkipChance = this.enemy.mushroomSkipChance;
                this.mushroomGaugeDrain = 8; // Gauge drain per turn
                
                addBattleLog(`🍄 ${this.enemy.name} threw mushrooms dealing ${damage} damage!`);
                addBattleLog(`😵 Mushroom effect: attacks may miss or skip turns for ${this.mushroomTurns} turns!`);
                
                startHeroAnimation('hurt');
                await new Promise(resolve => setTimeout(resolve, 2000));
                startHeroAnimation('idle');
                
                updateBattleUI(this.hero, this.enemy);
                
                if (this.hero.hp <= 0) {
                    this.state = BattleState.DEFEAT;
                    await this.endBattle('defeat');
                } else {
                    this.state = BattleState.PLAYER_TURN;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    addBattleLog('⚔️ Your turn!');
                    
                    // FIX: Start turn timer
                    if (typeof startTurnTimer === 'function') {
                        const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                        startTurnTimer(timerDuration);
                        this.turnTimerReduced = false;
                    }
                }
                return;
            }
        }
        
        // FIX: Alien's Time Sting attack
        if (this.enemy.timeStingAttack && Math.random() < (this.enemy.timeStingChance || 0.25)) {
            await playEnemyAnimation(this.enemy, 'attack1', 600);
            
            // Show alien projectile
            if (this.enemy.projectileType === 'alien') {
                const enemySprite = document.getElementById('enemySprite');
                const heroSprite = document.getElementById('heroSprite');
                await playAlienProjectile(enemySprite, heroSprite);
            }
            
            // Deal light damage (5-8)
            const damage = Math.floor(Math.random() * 4) + 5;
            this.hero.hp = Math.max(0, this.hero.hp - damage);
            
            // Set flag to reduce timer on next turn
            this.turnTimerReduced = true;
            
            addBattleLog(`⏱️ ${this.enemy.name} used Time Sting! Dealt ${damage} damage!`);
            addBattleLog('⚠️ Your next turn will have only 1 second!');
            
            // Play time sting sound effect
            if (window.audioManager) {
                window.audioManager.playSound('error', 0.6);
            }
            
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 2000));
            startHeroAnimation('idle');
            
            updateBattleUI(this.hero, this.enemy);
            
            if (this.hero.hp <= 0) {
                this.state = BattleState.DEFEAT;
                await this.endBattle('defeat');
            } else {
                this.state = BattleState.PLAYER_TURN;
                await new Promise(resolve => setTimeout(resolve, 500));
                addBattleLog('⚔️ Your turn!');
                
                // FIX: Start turn timer (will be 1 second due to Time Sting)
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    // Don't reset flag here - it should persist for this turn
                }
            }
            return;
        }
        
        // Normal attack
        await playEnemyAnimation(this.enemy, 'attack1', 600);
        
        // Lazy Bat no longer shoots projectiles (removed per user request)
        
        // If ghost enemy, shoot waveform projectile
        if (this.enemy.projectileType === 'waveform') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playWaveformAnimation(enemySprite, heroSprite);
        }
        
        // If alien enemy, shoot alien projectile
        if (this.enemy.projectileType === 'alien') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playAlienProjectile(enemySprite, heroSprite);
        }
        
        // If Fire Skull, show explosion animation
        if (this.enemy.projectileType === 'fire-explosion') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            await playFireExplosion(enemySprite, heroSprite);
        }
        
        // If Fly enemy, shoot fly spit projectile
        if (this.enemy.projectileType === 'fly-spit') {
            const enemySprite = document.getElementById('enemySprite');
            const heroSprite = document.getElementById('heroSprite');
            if (window.createProjectile) {
                await window.createProjectile('fly-spit', enemySprite, heroSprite);
            }
        }

        // Check if Invisibility Cloak is active
        if (this.hasEvade) {
            addBattleLog('🥷🏼 Your monster used the Invisibility Cloak and evaded the attack!');
            this.hasEvade = false;
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.state = BattleState.PLAYER_TURN;
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                this.turnTimerReduced = false;
            }
            return;
        }
        
        // Check if Mirror Attack is active
        if (this.hasReflect) {
            addBattleLog('🪞 Mirror Attack reflected the attack back!');
            this.hasReflect = false;
            
            // Calculate damage that would have been dealt to hero (using correct damage range)
            const reflectedDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            
            // Apply damage to enemy instead
            const isDead = this.enemy.takeDamage(reflectedDamage);
            addBattleLog(`🔄 ${this.enemy.name} took ${reflectedDamage} reflected damage!`);
            
            // Play enemy hurt animation
            await playEnemyAnimation(this.enemy, 'hurt', 300);
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
            }
            return;
        }
        
        // Check if Luna's Chaos Curse (Reflect) is active
        if (this.reflectActive && this.reflectTurns > 0) {
            addBattleLog(`🌙 Chaos Curse active! Enemy damages itself! (${this.reflectTurns} turns left)`);
            
            // Calculate damage that would have been dealt to hero (using correct damage range)
            const reflectedDamage = this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.enemy.attackDamageMax - this.enemy.attackDamageMin + 1)) + this.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.enemy.attack - this.hero.defense / 2));
            
            // Apply damage to enemy instead
            const isDead = this.enemy.takeDamage(reflectedDamage);
            addBattleLog(`🔮 ${this.enemy.name} took ${reflectedDamage} damage from its own attack!`);
            
            // Play enemy hurt animation
            await playEnemyAnimation(this.enemy, 'hurt', 300);
            
            // Decrement reflect turns
            this.reflectTurns--;
            if (this.reflectTurns <= 0) {
                this.reflectActive = false;
                addBattleLog('✨ Chaos Curse effect ended!');
            }
            
            updateBattleUI(this.hero, this.enemy);
            
            if (isDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                this.state = BattleState.PLAYER_TURN;
                
                // FIX: Start turn timer
                if (typeof startTurnTimer === 'function') {
                    const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                    startTurnTimer(timerDuration);
                    this.turnTimerReduced = false;
                }
            }
            return;
        }
        
        // Increment enemy attack counter
        this.enemyAttackCount++;
        
        // Play enemy attack sound for all enemies
        if (window.audioManager) {
            // Check if this is a low-level enemy (Lazy Bat or Slime)
            const isLowLevelEnemy = this.enemy.name === 'Lazy Bat' || this.enemy.name === 'Slime';
            
            // Play every 5th attack sound
            if (this.enemyAttackCount % 5 === 0) {
                window.audioManager.playSound('enemy_fifth_attack', 0.8);
            } else if (isLowLevelEnemy) {
                // Play low-level enemy attack sound for Lazy Bat and Slime
                window.audioManager.playSound('enemy_attack_low_level', 0.7);
            } else {
                // Play regular monster attack sound for other enemies
                window.audioManager.playSound('enemy_regular_attack', 0.8);
            }
        }

        // Calculate damage using enemy's damage range (FIXED)
        let damage;
        
        // Use attackDamageMin and attackDamageMax if available (correct approach)
        if (this.enemy.attackDamageMin !== undefined && this.enemy.attackDamageMax !== undefined) {
            const min = this.enemy.attackDamageMin;
            const max = this.enemy.attackDamageMax;
            damage = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        // Fly specific damage values (9 or 17) - legacy support
        else if (this.enemy.damageValues && this.enemy.damageValues.length === 2) {
            damage = Math.random() < 0.5 ? this.enemy.damageValues[0] : this.enemy.damageValues[1];
        }
        // Alien variable damage (5 or 15) - legacy support
        else if (this.enemy.variableDamage) {
            damage = Math.random() < 0.5 ? 5 : 15;
        }
        // Fallback to old formula (should rarely be used now)
        else {
            const enemyAttack = this.enemy.attack || 10;
            const heroDefense = this.hero.defense || 0;
            damage = Math.max(3, Math.floor(enemyAttack - heroDefense / 2));
        }
        
        // Safety check: ensure damage is a valid number
        if (isNaN(damage) || damage === undefined || damage === null) {
            console.error('[Battle] Invalid damage calculated, using default:', damage);
            damage = 5; // Safe default
        }
        
        // Apply damage cap if enemy has one
        if (this.enemy.maxDamage) {
            damage = Math.min(damage, this.enemy.maxDamage);
        }
        
        // === LUNA SPECIAL: Deflect — reflect attack back at enemy ===
        if (this.deflectActive) {
            this.deflectActive = false;
            const deflectDmg = Math.floor(damage * 0.75); // reflect 75% back
            const deflectDead = this.enemy.takeDamage(deflectDmg);
            addBattleLog(`🌙 Luna's Eclipse deflected the attack! ${deflectDmg} reflected to enemy!`);
            updateBattleUI(this.hero, this.enemy);
            if (deflectDead) {
                this.state = BattleState.VICTORY;
                await this.endBattle('victory');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 800));
            // Skip normal damage application — fall through to end of turn
        }
        // === BENNY SPECIAL: Defense Immunity — block all damage while active ===
        else if (this.defenseImmune > 0) {
            addBattleLog(`🛡️ Defense Immunity! ${this.enemy.name}'s attack was blocked!`);
            // No damage applied
        }
        // Check if defend was active - use defense gauge instead of HP
        else if (this.defendActive && this.defenseGauge > 0) {
            const gaugeUsed = Math.min(damage, this.defenseGauge);
            this.defenseGauge -= gaugeUsed;
            const remainingDamage = damage - gaugeUsed;
            if (remainingDamage > 0) {
                this.applyHeroDamage(remainingDamage);
                addBattleLog(`🛡️ Blocked ${gaugeUsed} damage! Took ${remainingDamage} damage!`);
            } else {
                addBattleLog(`🛡️ Blocked all ${damage} damage!`);
            }
            this.defendActive = false;
        } else {
            this.applyHeroDamage(damage);
        }

        // Play hero hurt animation if took damage
        if (damage > 0 || this.hero.hp < 30) {
            startHeroAnimation('hurt');
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds as requested
            startHeroAnimation('idle'); // CRITICAL: Return to idle GIF after hurt
        } else {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        addBattleLog(`💢 ${this.enemy.name} dealt ${damage} damage!`);
        
        // Slime drain effects
        if (this.enemy.drainEnergy) {
            const energyDrain = 15;
            this.attackGauge = Math.max(0, this.attackGauge - energyDrain);
            addBattleLog(`💧 ${this.enemy.name} drained ${energyDrain} energy!`);
        }
        
        if (this.enemy.drainDefense) {
            const defenseDrain = 12;
            this.defenseGauge = Math.max(0, this.defenseGauge - defenseDrain);
            addBattleLog(`💧 ${this.enemy.name} weakened your defense by ${defenseDrain}!`);
        }
        
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        if (this.hero.hp <= 0) {
            this.state = BattleState.DEFEAT;
            await this.endBattle('defeat');
        } else {
            // Decrement block counters
            if (this.fireballBlocked) {
                this.fireballBlocked = false;
            }
            if (this.defendBlocked > 0) {
                this.defendBlocked--;
            }
            
            this.state = BattleState.PLAYER_TURN;

            await new Promise(resolve => setTimeout(resolve, 500));
            addBattleLog('⚔️ Your turn!');
            
            // Update action buttons to enable them
            if (typeof updateActionButtons === 'function') {
                updateActionButtons(this.hero);

            }
            
            // FIX: Start turn timer
            if (typeof startTurnTimer === 'function') {
                const timerDuration = this.turnTimerReduced ? 1000 : 3000;
                startTurnTimer(timerDuration);
                // Reset the reduced flag after applying it
                this.turnTimerReduced = false;
            }
        }
    }

    // End battle
    async endBattle(result) {
        let xpGained = 0;
        let xpLost = 0;
        
        if (result === 'victory') {
            addBattleLog(`🎉 VICTORY! You defeated the ${this.enemy.name}!`);
            
            // Play victory sound effect
            if (window.audioManager) {
                window.audioManager.playSound('battle_victory', 0.8);
            }
            
            // Play battle win music
            if (window.audioManager) {
                window.audioManager.playBattleWinMusic();
            }
            
            // Calculate XP reward based on enemy level
            const enemyLevel = this.enemy.level || this.enemy.baseLevel || 1;
            xpGained = Math.floor(15 + (enemyLevel * 5));

            // Award XP
            if (window.gameState && typeof window.addJerryXP === 'function') {
                window.addJerryXP(xpGained);
            }
            
            // Track battle win
            if (window.gameState) {
                window.gameState.battlesWon = (window.gameState.battlesWon || 0) + 1;
                
                // Track battle streak
                window.gameState.battleStreak = (window.gameState.battleStreak || 0) + 1;
                
                // Check achievements
                if (window.achievementTracker) {
                    window.achievementTracker.checkAchievements();
                }
                
                if (typeof saveGameState === 'function') {
                    saveGameState();
                }
            }
            
            // Play enemy die animation
            await playEnemyAnimation(this.enemy, 'die', 1000);
            
            // Play dust animation and hide enemy
            await this.playDustAnimation();
            
            // CRITICAL FIX v3.55: Restore hero sprite to idle after victory
            // This ensures the hero sprite remains visible and doesn't break
            startHeroAnimation('idle');

            // Generate and add loot drops
            await new Promise(resolve => setTimeout(resolve, 500));
            let lootDrops = [];
            if (window.lootSystem) {
                lootDrops = window.lootSystem.generateLoot(this.enemy);

                // Add loot to inventory (BACKEND FUNCTION)
                window.lootSystem.addLootToInventory(lootDrops);
                
                // Update battle UI to reflect new inventory counts
                updateActionButtons(this.hero);
                
                // Ensure xpGained is valid
                if (isNaN(xpGained) || xpGained === null || xpGained === undefined) {
                    console.error('[Battle] XP calculation failed, using default');
                    xpGained = 20; // Default XP
                }

                // Show loot modal
                window.lootSystem.showLootModal(lootDrops, xpGained, this.enemy.name);
                
                // Dispatch Guardian event after loot modal (Guardian appears on map page)
                // The loot modal should handle showing the map page after it closes
                setTimeout(() => {
                    const guardianEvent = new CustomEvent('battleVictory', {
                        detail: {
                            level: window.gameState.jerryLevel || 1,
                            enemy: this.enemy.name,
                            isFirstBattle: (window.gameState.battlesWon === 1),
                            justLeveledUp: window.gameState.justLeveledUp || false,
                            previousLevel: window.gameState.previousLevel || null
                        }
                    });
                    document.dispatchEvent(guardianEvent);

                }, 100);
            } else {
                // Fallback to alert if loot system not loaded
                alert(`🎉 Victory!\n\nYou defeated the ${this.enemy.name}!\n\n✨ +${xpGained} XP earned!\n\nGreat job, keep it up! 💪`);
            }
            
        } else if (result === 'defeat') {
            addBattleLog('💫 DEFEAT! You were defeated...');
            
            // Play battle lose music
            if (window.audioManager) {
                window.audioManager.playBattleLoseMusic();
            }
            
            // Calculate XP loss (smaller penalty)
            const enemyLevel = this.enemy.level || this.enemy.baseLevel || 1;
            xpLost = Math.floor(5 + (enemyLevel * 2));

            // Deduct XP (but don't go below 0)
            if (window.gameState) {
                window.gameState.jerryXP = Math.max(0, (window.gameState.jerryXP || 0) - xpLost);
            }
            
            // Track battle loss
            if (window.gameState) {
                window.gameState.battlesLost = (window.gameState.battlesLost || 0) + 1;
                
                // Reset battle streak on loss
                window.gameState.battleStreak = 0;
                
                if (typeof saveGameState === 'function') {
                    saveGameState();
                }
            }
            
            // Play hero death animation
            startHeroAnimation('death');
            await new Promise(resolve => setTimeout(resolve, 1200)); // 8 frames * 150ms
            
            // Show custom defeat modal (matching victory modal style)
            this.showDefeatModal(this.enemy.name, xpLost);
            
        } else if (result === 'fled') {
            addBattleLog('🏃 You fled from battle!');
        }

        // Handle stat preservation based on battle result
        if (result === 'victory' || result === 'fled') {
            // Victory or fled: preserve current HP/attack/defense, refill gauges
            if (window.gameState) {
                window.gameState.health = this.hero.hp;
                window.gameState.attack = this.hero.attack;
                window.gameState.defense = this.hero.defense;
            }
            this.hero.attackGauge = 100;
            this.hero.defenseGauge = 100;
            updateBattleUI(this.hero, this.enemy);
            saveGameState();
        } else if (result === 'defeat') {
            // Defeat: restore HP/attack/defense to full
            if (window.gameState) {
                window.gameState.health = 100;
                const level = window.gameState.jerryLevel || 1;
                // Restore attack based on level
                let baseDamage;
                if (level >= 15) {
                    baseDamage = 13;
                } else if (level >= 10) {
                    baseDamage = 10;
                } else {
                    baseDamage = 6;
                }
                window.gameState.attack = baseDamage;
                window.gameState.defense = 5 + level;
            }
            this.hero.attackGauge = 100;
            this.hero.defenseGauge = 100;
            saveGameState();
        }



        // FIX: Only stop battle loop music, NOT win/lose music
        // Win/lose music will play until user returns to home page
        if (window.audioManager) {
            window.audioManager.stopAllBattleMusic();
            // DO NOT stop win/lose music here - it should continue playing
        }

        // Reset battle active flag
        this.inBattle = false;

        // Fade out after 2 seconds
        setTimeout(() => {
            document.getElementById('battleLog').innerHTML = '';
            const arena = document.getElementById('battleArena');
            arena.classList.add('hidden');
            
            // FIXED: Stop all battle music when arena is hidden
            // This ensures music stops even if user navigates away without clicking Continue
            if (window.audioManager) {
                window.audioManager.stopAllBattleMusic();
                window.audioManager.stopBattleOutcomeMusic();
            }
        }, 2000);
    }
    
    // Play dust animation when enemy is defeated
    async playDustAnimation() {
        const enemySprite = document.getElementById('enemySprite');
        if (!enemySprite) return;
        
        // Get enemy position
        const enemyRect = enemySprite.getBoundingClientRect();
        const container = enemySprite.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Temporarily hide enemy sprite for dust animation
        enemySprite.style.opacity = '0';
        
        // Create dust sprite element
        const dustSprite = document.createElement('div');
        dustSprite.style.position = 'absolute';
        dustSprite.style.left = enemySprite.style.left || '0px';
        dustSprite.style.bottom = '0px';
        dustSprite.style.width = '32px';
        dustSprite.style.height = '32px';
        dustSprite.style.backgroundImage = 'url(assets/dust-spritesheet.png)';
        dustSprite.style.backgroundSize = '192px 32px'; // 6 frames * 32px width
        dustSprite.style.backgroundRepeat = 'no-repeat';
        dustSprite.style.imageRendering = 'pixelated';
        container.appendChild(dustSprite);
        
        // Animate through 6 frames (192px / 32px = 6 frames)
        let frame = 0;
        const frameCount = 6;
        const frameDuration = 100; // 100ms per frame
        
        const animateFrame = () => {
            if (frame < frameCount) {
                dustSprite.style.backgroundPosition = `-${frame * 32}px 0px`;
                frame++;
                setTimeout(animateFrame, frameDuration);
            } else {
                // Remove dust sprite after animation completes
                dustSprite.remove();
            }
        };
        
        animateFrame();
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, frameCount * frameDuration));
        
        // CRITICAL: Reset enemy sprite opacity for next battle
        // This ensures the enemy sprite will be visible when the next battle starts
        enemySprite.style.opacity = '1';
    }
    
    // Show defeat modal (matching victory modal style with sadder tone)
    showDefeatModal(enemyName, xpLost) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'defeatModalOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #666;
            border-radius: 16px;
            padding: 20px;
            max-width: 340px;
            width: 85%;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
            animation: scaleIn 0.3s ease-out;
            color: white;
            text-align: center;
        `;

        // Defeat title
        const title = document.createElement('h2');
        title.textContent = '💫 Defeat... 💫';
        title.style.cssText = `
            font-size: 28px;
            margin: 0 0 8px 0;
            color: #888;
            text-shadow: 0 0 10px rgba(136, 136, 136, 0.5);
        `;

        // Enemy text
        const enemyText = document.createElement('p');
        enemyText.textContent = `The ${enemyName} was too strong this time.`;
        enemyText.style.cssText = `
            font-size: 16px;
            margin: 0 0 12px 0;
            color: #c0c0c0;
        `;

        // XP lost
        const xpText = document.createElement('div');
        xpText.textContent = `📉 -${xpLost} XP lost`;
        xpText.style.cssText = `
            font-size: 20px;
            margin: 0 0 16px 0;
            color: #ff6b6b;
            font-weight: bold;
        `;

        // Encouragement message
        const encouragement = document.createElement('p');
        encouragement.textContent = "Don't give up! Train harder and try again! 🔥";
        encouragement.style.cssText = `
            font-size: 15px;
            margin: 0 0 16px 0;
            color: #e0e0e0;
            line-height: 1.4;
        `;

        // OK button
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 40px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.2s ease;
        `;

        okButton.onmouseover = () => {
            okButton.style.transform = 'translateY(-2px)';
            okButton.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
        };

        okButton.onmouseout = () => {
            okButton.style.transform = 'translateY(0)';
            okButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        };

        okButton.onclick = () => {
            // Stop defeat music
            if (window.audioManager) {
                window.audioManager.stopBattleOutcomeMusic();
            }
            overlay.remove();
        };

        modal.appendChild(title);
        modal.appendChild(enemyText);
        modal.appendChild(xpText);
        modal.appendChild(encouragement);
        modal.appendChild(okButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add animations if not already present
        if (!document.getElementById('defeatModalAnimations')) {
            const style = document.createElement('style');
            style.id = 'defeatModalAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Play Fire Pig Projectile Attack Animation
     * Triggered on every 3rd attack when Fire Pig skin is equipped
     */
    async playFirePigProjectile() {
        const battleContainer = document.querySelector('.battle-container');
        if (!battleContainer) return;
        
        // Create projectile element
        const projectile = document.createElement('img');
        projectile.src = 'assets/projectiles/FirePigProjectileAttack.png';
        projectile.style.cssText = `
            position: absolute;
            width: 48px;
            height: 48px;
            left: 20%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            image-rendering: pixelated;
            pointer-events: none;
        `;
        
        battleContainer.appendChild(projectile);
        
        // Animate projectile from hero to enemy
        const startX = 20;
        const endX = 75;
        const duration = 600; // 600ms animation
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out cubic for smooth deceleration
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentX = startX + (endX - startX) * easeProgress;
                
                projectile.style.left = `${currentX}%`;
                
                // Add slight rotation for effect
                projectile.style.transform = `translate(-50%, -50%) rotate(${progress * 360}deg)`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Create impact effect
                    projectile.style.opacity = '0';
                    projectile.style.transform = `translate(-50%, -50%) scale(2)`;
                    projectile.style.transition = 'all 0.2s ease';
                    
                    setTimeout(() => {
                        projectile.remove();
                        resolve();
                    }, 200);
                }
            };
            
            animate();
        });
    }
    
    // Throwing Star attack
    async playerThrowingStar() {


        if (this.state !== BattleState.PLAYER_TURN) {

            return;
        }
        
        // FIX: Stop turn timer when player takes action
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const throwingStarCount = gameState.battleInventory?.throwing_stars || 0;
        if (throwingStarCount <= 0) {
            addBattleLog('❌ No Throwing Stars left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.throwing_stars = Math.max(0, gameState.battleInventory.throwing_stars - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play throwing star projectile animation
        await playThrowingStarAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play projectile sound
        if (window.audioManager) {
            window.audioManager.playSound('spark_attack', 0.7);
        }

        // Calculate damage (15-25 range)
        const damage = Math.floor(Math.random() * 11) + 15;
        const isDead = this.enemy.takeDamage(damage);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`⭐ Throwing Star dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        // Save game state
        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await this.enemyTurn();
        }
    }
    
    // Battle Glove - adds +30 damage for 5 turns
    async playerBattleGlove() {

        if (this.state !== BattleState.PLAYER_TURN) {
            return;
        }
        
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const battleGloveCount = gameState.battleInventory?.battle_glove || 0;
        if (battleGloveCount <= 0) {
            addBattleLog('❌ No Battle Gloves left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.battle_glove = Math.max(0, gameState.battleInventory.battle_glove - 1);
        
        // Apply damage boost buff
        if (!gameState.battleBuffs) gameState.battleBuffs = {};
        gameState.battleBuffs.damageBoost = {
            value: 30,
            turnsRemaining: 5
        };
        
        // Show purple +30 animation over hero sprite
        if (window.showBattleDamageBoostAnimation) {
            window.showBattleDamageBoostAnimation('heroSprite', 30);
        }
        
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        addBattleLog('🥊 Battle Glove equipped! +30 damage for 5 turns!');
        
        // Play power-up sound
        if (window.audioManager) {
            window.audioManager.playSound('potion_use', 0.8);
        }
        
        // Show Battle Glove animation
        if (window.showBattleGloveAnimation) {
            await window.showBattleGloveAnimation('heroSprite');
        }

        saveGameState();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.state = BattleState.PLAYER_TURN;
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);
        
        if (typeof startTurnTimer === 'function') {
            const timerDuration = this.turnTimerReduced ? 1000 : 3000;
            startTurnTimer(timerDuration);
            this.turnTimerReduced = false;
        }
    }
    
    // Jade Dagger - 100 damage rotating projectile
    async playerJadeDagger() {

        if (this.state !== BattleState.PLAYER_TURN) {
            return;
        }
        
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const jadeDaggerCount = gameState.battleInventory?.jade_dagger || 0;
        if (jadeDaggerCount <= 0) {
            addBattleLog('❌ No Jade Daggers left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.jade_dagger = Math.max(0, gameState.battleInventory.jade_dagger - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero throw animation
        startHeroAnimation('throw');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play jade dagger projectile animation (rotating)
        await playJadeDaggerAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play attack sound
        if (window.audioManager) {
            window.audioManager.playSound('prickler_attack', 0.8);
        }

        const damage = 100;
        const isDead = this.enemy.takeDamage(damage);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🗡️ Jade Dagger dealt ${damage} damage!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await this.enemyTurn();
        }
    }
    
    // Wizard's Wand - 120 damage + 100 HP heal
    async playerWizardsWand() {

        if (this.state !== BattleState.PLAYER_TURN) {
            return;
        }
        
        if (typeof stopTurnTimer === 'function') {
            stopTurnTimer();
        }
        
        // === STUN / DAZE CHECK ===
        if (this.heroStunnedTurns > 0) {
            this.heroStunnedTurns--;
            addBattleLog(`😵 You are stunned! Turn skipped! (${this.heroStunnedTurns} turns remaining)`);
            updateBattleUI(this.hero, this.enemy);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.enemyTurn();
            return;
        }

        const wizardsWandCount = gameState.battleInventory?.wizards_wand || 0;
        if (wizardsWandCount <= 0) {
            addBattleLog('❌ No Wizard\'s Wands left!');
            return;
        }

        this.state = BattleState.ANIMATING;
        gameState.battleInventory.wizards_wand = Math.max(0, gameState.battleInventory.wizards_wand - 1);
        updateBattleUI(this.hero, this.enemy);
        updateActionButtons(this.hero);

        // Play hero attack animation
        startHeroAnimation('attack1');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Play wand magic effect
        await playWizardsWandAnimation(
            document.getElementById('heroSprite'),
            document.getElementById('enemySprite')
        );
        
        // Play magic sound
        if (window.audioManager) {
            window.audioManager.playSound('spark_attack', 0.9);
        }

        // Deal damage
        const damage = 120;
        const isDead = this.enemy.takeDamage(damage);
        
        // Heal player
        const healAmount = 100;
        this.hero.hp = Math.min(this.hero.maxHP, this.hero.hp + healAmount);
        
        // Play enemy hurt animation
        await playEnemyAnimation(this.enemy, 'hurt', 300);
        
        addBattleLog(`🪄 Wizard's Wand dealt ${damage} damage and healed ${healAmount} HP!`);
        updateBattleUI(this.hero, this.enemy);

        // Reset hero sprite to idle
        startHeroAnimation('idle');

        saveGameState();

        if (isDead) {
            this.state = BattleState.VICTORY;
            await this.endBattle('victory');
        } else {
            await this.enemyTurn();
        }
    }
}

// Global battle manager instance
let battleManager = null;

// Initialize battle manager immediately
function initBattleManager() {
    if (window.battleManager && window.battleManager.initialized) {

        return;
    }

    battleManager = new BattleManager();
    window.battleManager = battleManager;
    
    // Set initialized flag explicitly
    window.battleManager.initialized = true;

}

// Try multiple initialization strategies

// Strategy 1: Initialize immediately
initBattleManager();

// Strategy 2: Also listen for DOMContentLoaded in case we're early
if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initBattleManager);
}

// Strategy 3: Also listen for window load as a fallback
window.addEventListener('load', function() {
    if (!window.battleManager || !window.battleManager.initialized) {

        initBattleManager();
    }
});



// Throwing Star Animation
async function playThrowingStarAnimation(startElement, targetElement) {
    return new Promise(resolve => {
        const projectile = document.createElement('img');
        projectile.src = 'assets/projectiles/ThrowingStarProjectile.gif';
        projectile.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            z-index: 10000;
            pointer-events: none;
            image-rendering: pixelated;
        `;
        document.body.appendChild(projectile);

        const startRect = startElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const startX = startRect.left + startRect.width / 2 - 20;
        const startY = startRect.top + startRect.height / 2 - 20;
        const targetX = targetRect.left + targetRect.width / 2 - 20;
        const targetY = targetRect.top + targetRect.height / 2 - 20;
        
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        
        setTimeout(() => {
            projectile.style.transition = 'all 0.6s ease-out';
            projectile.style.left = targetX + 'px';
            projectile.style.top = targetY + 'px';
            projectile.style.transform = 'rotate(720deg)'; // Spin during flight
        }, 50);
        
        setTimeout(() => {
            projectile.remove();
            resolve();
        }, 700);
    });
}

// Jade Dagger Animation
async function playJadeDaggerAnimation(startElement, targetElement) {
    return new Promise(resolve => {
        const projectile = document.createElement('div');
        projectile.textContent = '🗡️';
        projectile.style.cssText = `
            position: fixed;
            font-size: 40px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(projectile);

        const startRect = startElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const startX = startRect.left + startRect.width / 2 - 20;
        const startY = startRect.top + startRect.height / 2 - 20;
        const targetX = targetRect.left + targetRect.width / 2 - 20;
        const targetY = targetRect.top + targetRect.height / 2 - 20;
        
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        
        setTimeout(() => {
            projectile.style.transition = 'all 0.5s linear';
            projectile.style.left = targetX + 'px';
            projectile.style.top = targetY + 'px';
            projectile.style.transform = 'rotate(1080deg)'; // Fast spin
        }, 50);
        
        setTimeout(() => {
            projectile.remove();
            resolve();
        }, 600);
    });
}

// Wizard's Wand Animation
async function playWizardsWandAnimation(startElement, targetElement) {
    return new Promise(resolve => {
        // Create magic sparkles
        const sparkles = [];
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.cssText = `
                position: fixed;
                font-size: 30px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
            `;
            document.body.appendChild(sparkle);
            sparkles.push(sparkle);
        }

        const startRect = startElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;
        
        // Animate sparkles from hero to enemy
        sparkles.forEach((sparkle, i) => {
            sparkle.style.left = startX + 'px';
            sparkle.style.top = startY + 'px';
            
            setTimeout(() => {
                sparkle.style.transition = 'all 0.8s ease-out';
                sparkle.style.left = (targetX + (Math.random() - 0.5) * 100) + 'px';
                sparkle.style.top = (targetY + (Math.random() - 0.5) * 100) + 'px';
                sparkle.style.opacity = '1';
                sparkle.style.transform = 'scale(2)';
            }, i * 100);
            
            setTimeout(() => {
                sparkle.style.opacity = '0';
            }, 600 + i * 100);
        });
        
        setTimeout(() => {
            sparkles.forEach(s => s.remove());
            resolve();
        }, 1000);
    });
}
