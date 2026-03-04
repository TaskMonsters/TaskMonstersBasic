// Battle System Initialization

// Level-based arena pools (as per battle system specifications)
const ARENA_POOLS = {
    level_1_9: [
        'assets/battle-backgrounds/City Sunset Level 1-10 and up.png',
        'assets/battle-backgrounds/Forest Level 1-10 and up.png',
        'assets/battle-backgrounds/MistyForest Levle 1-10 and up.png'
    ],
    level_10_19: [
        'assets/battle-backgrounds/synth-city Level 10 - 20 and up .png',
        'assets/battle-backgrounds/Forest Level 1-10 and up.png',
        'assets/battle-backgrounds/Night Town Level 10 - 20 and up.png',
        'assets/battle-backgrounds/Dungeon Level 20+.png',
        'assets/battle-backgrounds/DarkGothicCastle Level 20 and up.png'
    ],
    level_20_29: [
        'assets/battle-backgrounds/skull-gate level 20 - 25 and up.png',
        'assets/battle-backgrounds/Dusk Arena Level 20 - 25 and up.png',
        'assets/battle-backgrounds/Mountain Dusk Level 20 - 25 and up.png'
    ],
    level_30_39: [
        'assets/battle-backgrounds/Hot Town Level 30 - 35 and up.png',
        'assets/battle-backgrounds/Castle Arena Level 30 - 35 and up.png',
        'assets/battle-backgrounds/UnderwaterFantasy Level 30 - 35 and up.png',
        'assets/battle-backgrounds/Green Arena Level 30 - 35 and up.png'
    ],
    level_40_49: [
        'assets/battle-backgrounds/Forest of Illusions Level 40 and up.gif'
    ],
    level_50_plus: [
        'assets/battle-backgrounds/Fort of Illusions Level 50.gif',
        'assets/battle-backgrounds/vampire-castle Level 50.png'
    ]
};

let arenaIndices = {
    level_1_9: 0,
    level_10_19: 0,
    level_20_29: 0,
    level_30_39: 0,
    level_40_49: 0,
    level_50_plus: 0
};

// Global arena rotation index
let globalArenaIndex = 0;

function getNextArenaBackground() {
    const playerLevel = window.gameState?.jerryLevel || 1;
    
    // Build cumulative arena pool based on player level
    // Once unlocked, arenas stay available and alternate
    let availableArenas = [];
    
    // Level 1-9: Add Level 1-9 arenas
    if (playerLevel >= 1) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_1_9);
    }
    
    // Level 10-19: Add Level 10-19 arenas (cumulative)
    if (playerLevel >= 10) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_10_19);
    }
    
    // Level 20-29: Add Level 20-29 arenas (cumulative)
    if (playerLevel >= 20) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_20_29);
    }
    
    // Level 30-39: Add Level 30-39 arenas (cumulative)
    if (playerLevel >= 30) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_30_39);
    }
    
    // Level 40-49: Add Level 40-49 arenas (cumulative)
    if (playerLevel >= 40) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_40_49);
    }
    
    // Level 50+: Add Level 50+ arenas (cumulative)
    if (playerLevel >= 50) {
        availableArenas = availableArenas.concat(ARENA_POOLS.level_50_plus);
    }
    
    // Fallback if no arenas available
    if (availableArenas.length === 0) {
        console.warn(`[Arena] No arenas available for level ${playerLevel}, using fallback`);
        return 'assets/battle-backgrounds/synth-city Level 10 - 20 and up .png';
    }
    
    // Get current arena and rotate to next
    const arena = availableArenas[globalArenaIndex % availableArenas.length];
    globalArenaIndex++;

    return arena;
}

// Hero Sprite Animation System
let heroAnimationInterval = null;
let heroCurrentFrame = 0;
let heroTotalFrames = 4;
let heroFrameWidth = 32;

/**
 * Get active hero appearance with robust fallback
 * Returns skin animations if equipped, otherwise default monster animations
 */
function getActiveHeroAppearance() {
    const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
    const equippedSkinId = window.gameState ? window.gameState.equippedSkinId : null;
    
    // CRITICAL FIX v3.52: Defensive logging to detect skin state loss

    // Try to use skin if equipped
    if (equippedSkinId && window.SKINS_CONFIG && window.SKINS_CONFIG[equippedSkinId]) {
        const skin = window.SKINS_CONFIG[equippedSkinId];

        return {
            animations: skin.animations,
            frameCount: skin.frameCount,
            battleScale: skin.battleScale, // CRITICAL: Include battleScale from skin config
            isSkin: true,
            skinId: equippedSkinId
        };
    }
    
    // CRITICAL: Log why we're falling back to default monster
    if (equippedSkinId) {
        console.warn('[Battle] ⚠️ Skin equipped but not found in config:', equippedSkinId);
    }
    
    // Fallback to default monster - USE GIF ANIMATIONS
    const defaultMonsterMap = {
        luna: 'Luna',
        benny: 'Benny',
        nova: 'Nova'
    };
    
    const monsterName = defaultMonsterMap[baseMonsterId] || 'Nova';
    
    return {
        animations: {
            idle: `assets/heroes/${monsterName}_idle.gif`,
            walk: `assets/heroes/${monsterName}_idle.gif`,
            attack: `assets/heroes/${monsterName}_attack.gif`,
            attack1: `assets/heroes/${monsterName}_attack.gif`, // Use attack animation for attack1
            throw: `assets/heroes/${monsterName}_attack.gif`, // Use attack animation for throw
            jump: `assets/heroes/${monsterName}_jump.gif`,
            hurt: `assets/heroes/${monsterName}_Hurt.gif`,
            death: `assets/heroes/${monsterName}_Hurt.gif`
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            attack1: 1, // Use attack animation for attack1
            throw: 1, // Use attack animation for throw
            jump: 1,
            hurt: 1,
            death: 1
        },
        isSkin: false,
        skinId: null
    };
}

/**
 * Render hero sprite with guaranteed visibility
 * Called at battle start to ensure hero is always visible
 */
function renderHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found in DOM');
        return;
    }
    
    const appearance = getActiveHeroAppearance();
    
    if (!appearance || !appearance.animations || !appearance.animations.idle) {
        console.error('[Battle] Unable to get valid hero appearance', { appearance });
        // Last resort fallback - use img src
        heroSprite.src = 'assets/heroes/Nova_idle.gif';
    } else {
        // Set as img src (element is now <img> not <div>)
        heroSprite.src = appearance.animations.idle;

    }
    
    // CRITICAL FIX: Clear any background image to prevent spritesheet overlay
    heroSprite.style.backgroundImage = 'none';
    heroSprite.style.background = 'none';
    
    // Style for img element - GIF only
    heroSprite.style.width = 'auto';
    heroSprite.style.height = 'auto';
    heroSprite.style.maxWidth = '100%';
    heroSprite.style.maxHeight = '100%';
    heroSprite.style.objectFit = 'contain';
    heroSprite.style.transform = 'none'; // Scale is applied to wrapper, not sprite
    heroSprite.style.transformOrigin = 'center';
    heroSprite.style.imageRendering = 'pixelated';
    heroSprite.style.imageRendering = '-moz-crisp-edges';
    heroSprite.style.imageRendering = 'crisp-edges';
    heroSprite.style.opacity = '1';
    heroSprite.style.display = 'block';
    heroSprite.style.visibility = 'visible';
    
    // Apply scale to wrapper element using skin battleScale or default
    const spriteWrapper = heroSprite.parentElement;
    if (spriteWrapper && spriteWrapper.classList.contains('sprite-wrapper')) {
        const scale = (appearance && appearance.battleScale) ? appearance.battleScale : 1.9;
        spriteWrapper.style.transform = `scale(${scale})`;
        spriteWrapper.style.transformOrigin = 'center';

    }
    
    // Remove any classes that could hide the sprite
    heroSprite.classList.remove('hidden', 'opacity-0', 'fade-out', 'defeated');

}

// Export to global scope
window.getActiveHeroAppearance = getActiveHeroAppearance;
window.renderHeroSprite = renderHeroSprite;

function startHeroAnimation(animationType = 'idle') {
    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[Battle] Hero sprite element not found');
        return;
    }
    
    // Stop any existing animation
    if (heroAnimationInterval) {
        clearInterval(heroAnimationInterval);
    }
    
    // CRITICAL FIX v3.52: Defensive skin state validation
    // Log current skin state to detect when it gets cleared
    const currentSkinId = window.gameState?.equippedSkinId;

    // Get current monster appearance using the robust helper
    const appearance = getActiveHeroAppearance();
    const spritePrefix = localStorage.getItem('heroSpritePrefix') || 'Pink_Monster';
    
    // CRITICAL: Validate appearance object
    if (!appearance) {
        console.error('[Battle] ❌ CRITICAL: getActiveHeroAppearance() returned null/undefined!');
        console.error('[Battle] gameState:', window.gameState);
        console.error('[Battle] equippedSkinId:', currentSkinId);
        // Force fallback to Nova
        heroSprite.src = 'assets/heroes/Nova_idle.gif';
        return;
    }
    
    // Set animation parameters based on type
    let animations;
    
    if (appearance && appearance.isSkin) {
        // CRITICAL FIX: Treat skins as GIF animations (frameCount = 1), not spritesheets
        // Clear any background image that might have been set
        heroSprite.style.backgroundImage = 'none';
        heroSprite.style.background = 'none';
        
        // Map animation types to available skin animations
        const animationMap = {
            'idle': 'idle',
            'attack': 'attack',
            'attack1': 'attack',
            'throw': 'attack',
            'walk': 'walk',
            'walk-attack': 'attack',
            'jump': 'jump',
            'hurt': 'hurt',
            'death': 'death',
            'dash': 'walk',
            'special': 'special'
        };
        
        const mappedType = animationMap[animationType] || 'idle';
        const gifPath = appearance.animations[mappedType] || appearance.animations.idle;
        
        // Set the GIF directly as src
        heroSprite.src = gifPath;
        
        // CRITICAL: Ensure we're using img src, not background image
        heroSprite.style.backgroundImage = 'none';
        heroSprite.style.background = 'none';

        // Ensure sprite is visible and properly sized
        heroSprite.style.display = 'block';
        heroSprite.style.visibility = 'visible';
        heroSprite.style.opacity = '1';
        
        // Set wrapper scale for skins (use per-skin battleScale or default to 1.9)
        const spriteWrapper = heroSprite.parentElement;
        if (spriteWrapper && spriteWrapper.classList.contains('sprite-wrapper')) {
            const scale = appearance.battleScale || 1.9; // Increased by 1x for better visibility
            spriteWrapper.style.transform = `scale(${scale})`;

        }
        
        return; // Exit early for GIF animations - DO NOT run spritesheet code below
    } else {
        // Use default monster GIF animations
        const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
        const monsterNameMap = {
            luna: 'Luna',
            benny: 'Benny',
            nova: 'Nova'
        };
        const monsterName = monsterNameMap[baseMonsterId] || 'Nova';
        
        // CRITICAL FIX: Clear any background image that might have been set
        heroSprite.style.backgroundImage = 'none';
        heroSprite.style.background = 'none';
        
        // For GIF animations, we just set the src directly
        const gifPath = appearance.animations[animationType] || appearance.animations.idle;
        heroSprite.src = gifPath;
        
        // CRITICAL: Ensure we're using img src, not background image
        heroSprite.style.backgroundImage = 'none';
        heroSprite.style.background = 'none';

        // Ensure sprite is visible and properly sized
        heroSprite.style.display = 'block';
        heroSprite.style.visibility = 'visible';
        heroSprite.style.opacity = '1';
        
        // Set wrapper scale for default monsters
        const spriteWrapper = heroSprite.parentElement;
        if (spriteWrapper && spriteWrapper.classList.contains('sprite-wrapper')) {
            spriteWrapper.style.transform = 'scale(1.9)'; // Increased by 1x for better visibility
        }
        
        return; // Exit early for GIF animations - DO NOT run spritesheet code below
    }
    
    // ⚠️ WARNING: CODE BELOW SHOULD NEVER EXECUTE ⚠️
    // Both skins and default monsters now use GIF animations (return early above)
    // This spritesheet code is kept only as a safety fallback
    console.error('[Battle] ❌ ERROR: Reached spritesheet code! This should never happen.');
    console.error('[Battle] appearance:', appearance);
    console.error('[Battle] animationType:', animationType);
    
    // Force GIF animation as absolute fallback
    heroSprite.style.backgroundImage = 'none';
    heroSprite.style.background = 'none';
    
    if (appearance && appearance.animations && appearance.animations.idle) {
        heroSprite.src = appearance.animations.idle;

    } else {
        heroSprite.src = 'assets/heroes/Nova_idle.gif';

    }
    return;
    
    // ❌ ALL SPRITESHEET CODE DELETED IN v3.53 ❌
    // This application now uses GIF animations ONLY
    // Spritesheets were causing persistent rendering bugs
    // If you see this message in console, something is very wrong
}

function stopHeroAnimation() {
    // No-op for GIF animations (they loop automatically)
    // This function is kept for compatibility with existing code

}

// Export to global scope for use in battleManager
window.startHeroAnimation = startHeroAnimation;
window.stopHeroAnimation = stopHeroAnimation;

// Start idle animation when battle starts
function initializeHeroSprite() {
    const heroSprite = document.getElementById('heroSprite');
    if (heroSprite) {
        // First ensure hero sprite is rendered and visible
        renderHeroSprite();
        // Then start the animation
        startHeroAnimation('idle');
    } else {
        console.error('[Battle] Cannot initialize hero sprite - element not found');
    }
}

// Battle system initialization is handled in battleManager.js

// Test function to start a battle (for development)
function startTestBattle() {
    // Check if Battle Mode is enabled
    if (window.battleModeEnabled === false) {

        return;
    }
    
    // Safeguard: Check if Battle Manager is initialized
    if (!window.battleManager || !window.battleManager.initialized) {
        console.warn('⚠️ Battle Manager not initialized – skipping battle trigger');
        return;
    }

    // Create hero data from gameState
    const level = gameState.jerryLevel || 1;
    
    // Level-based attack damage scaling (grows with level)
    // Hero damage scaling according to gameplay mechanics:
    // Level 5: 5-15 damage
    // Level 10: 15-25 damage
    // Level 20: 30-45 damage
    // Level 30: 45-65 damage
    // Level 40: 60-85 damage
    // Level 50: 75-100 damage
    let baseDamage;
    if (level >= 40) {
        baseDamage = 60 + Math.floor((level - 40) * 1.5); // Level 40: 60, Level 50: 75
    } else if (level >= 30) {
        baseDamage = 45 + Math.floor((level - 30) * 1.5); // Level 30: 45, Level 40: 60
    } else if (level >= 20) {
        baseDamage = 30 + Math.floor((level - 20) * 1.5); // Level 20: 30, Level 30: 45
    } else if (level >= 10) {
        baseDamage = 15 + Math.floor((level - 10) * 1.5); // Level 10: 15, Level 20: 30
    } else if (level >= 5) {
        baseDamage = 5 + Math.floor((level - 5) * 2);  // Level 5: 5, Level 10: 15
    } else {
        baseDamage = 3 + Math.floor(level * 0.4);  // Level 1-4: 3-4 damage
    }
    
    // HP scaling: Level 1: 100 HP, Level 50: 400 HP
    // Linear growth: +6 HP per level
    const maxHP = 100 + Math.floor((level - 1) * 6);
    
    const heroData = {
        hp: gameState.health || maxHP,
        maxHP: maxHP,
        attack: gameState.attack || baseDamage,  // Use saved attack if available
        defense: gameState.defense || (5 + level),  // Use saved defense if available
        level: level,
        attackGauge: gameState.battleInventory?.attackGauge || 100,
        defenseGauge: gameState.battleInventory?.defenseGauge || 100
    };

    // Check if this is a boss level
    const playerLevel = gameState.jerryLevel || 1;
    let enemyData;
    
    if (isBossLevel(playerLevel)) {
        // Create boss enemy
        enemyData = createBossEnemy(playerLevel);
        
        // Track boss count for arena alternation
        if (!gameState.bossCount) {
            gameState.bossCount = 0;
        }
        gameState.bossCount++;
        
        // Set boss arena background on battle-container (not battleArena)
        const arenaBackground = getBossArenaBackground(gameState.bossCount);
        const battleContainer = document.querySelector('.battle-container');
        if (battleContainer) {
            battleContainer.style.backgroundImage = `url('${arenaBackground}')`;
            battleContainer.style.backgroundSize = 'cover';
            battleContainer.style.backgroundPosition = 'center';
        }
        
        saveGameState();
    } else {
        // Create regular enemy
        // Wait for enemy.js to load if not ready yet
        if (typeof window.createRandomEnemy !== 'function') {
            console.warn('⏳ createRandomEnemy not ready yet, waiting for enemy.js to load...');
            // Retry after a short delay
            setTimeout(() => {
                if (typeof window.createRandomEnemy === 'function') {

                    startTestBattle();
                } else {
                    console.error('❌ createRandomEnemy still not defined after wait. Make sure enemy.js is loaded.');
                    console.error('Available window functions:', Object.keys(window).filter(k => k.includes('enemy')));
                }
            }, 500);
            return;
        }
        enemyData = window.createRandomEnemy(playerLevel);
        
        // Set rotating arena background on battle-container (not battleArena)
        const arenaBackground = getNextArenaBackground();
        const battleContainer = document.querySelector('.battle-container');
        if (battleContainer && arenaBackground) {
            battleContainer.style.backgroundImage = `url('${arenaBackground}')`;
            battleContainer.style.backgroundSize = 'cover';
            battleContainer.style.backgroundPosition = 'center';
        }
    }

    // Start battle
    battleManager.startBattle(heroData, enemyData);
    
    // Initialize hero sprite animation
    setTimeout(() => {
        initializeHeroSprite();
    }, 100);
}

// Expose globally for testing
window.startTestBattle = startTestBattle;

// Add event listener to battle button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBattleButton);
} else {
    attachBattleButton();
}

function attachBattleButton() {
    // Wait a bit for the button to be rendered
    setTimeout(() => {
        const btn = document.getElementById('startBattleBtn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                startTestBattle();
            });

        } else {
            console.warn('Start Battle button not found (this is normal if not in battle mode)');
        }
    }, 1000);
}




// ===================================
// DYNAMIC BATTLE SCALING FOR MOBILE
// ===================================

function adjustBattleScale() {
    const battle = document.querySelector(".battle-container");
    if (!battle) return;
    
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    
    // Keep within safe area for very small screens
    if (vw < 375) {
        const scale = vw / 420;
        battle.style.transform = `scale(${scale})`;
        battle.style.transformOrigin = "top center";
    } else {
        battle.style.transform = "scale(1)";
    }
}

// Initialize scaling on load and resize
window.addEventListener("resize", adjustBattleScale);
window.addEventListener("load", adjustBattleScale);

// Also call when battle starts
const originalStartBattle = window.battleManager?.startBattle;
if (originalStartBattle && window.battleManager) {
    window.battleManager.startBattle = function(...args) {
        const result = originalStartBattle.apply(this, args);
        setTimeout(adjustBattleScale, 100);
        return result;
    };
}



// ===================================
// PROBABILITY-BASED BATTLE TRIGGER
// ===================================

/**
 * Unified battle trigger function with probability control
 * Only Quick Tasks and Regular Tasks can trigger battles
 * @param {string} sourceType - Either 'quickTask' or 'regularTask'
 */
function maybeTriggerBattle(sourceType) {
    // Check if Battle Mode is enabled
    if (window.battleModeEnabled === false) {

        return false;
    }
    
    // Safeguard: Check if Battle Manager is initialized
    if (!window.battleManager || !window.battleManager.initialized) {
        console.warn('⚠️ Battle Manager not initialized – skipping battle trigger');
        return false;
    }
    
    let chance = 0;
    
    if (sourceType === 'quickTask') {
        chance = 0.20; // 20% probability for quick tasks
    } else if (sourceType === 'regularTask') {
        chance = 0.25; // 25% probability for regular tasks (reduced from 50%)
    } else {
        // Any other source should never trigger battle

        return false;
    }
    
    // Roll the dice
    const roll = Math.random();

    if (roll < chance) {

        startTestBattle();
        return true; // Battle was triggered
    } else {

        return false; // No battle triggered
    }
}

// Expose globally for use in index.html
window.maybeTriggerBattle = maybeTriggerBattle;


// =====================================================================
// === window.enemyAI - Enemy AI decision-making object ===
// Called by battleManager.js enemyTurn() for heal and defend decisions.
// The can* flag special abilities are handled directly in enemyTurn().
// =====================================================================
window.enemyAI = {
    /**
     * Attempt to heal the enemy if HP is low enough and canHeal is set.
     * Returns { healed: bool, amount: number }
     * Called at the start of every enemy turn.
     */
    attemptEnemyHeal(enemy, playerLevel) {
        if (!enemy || !enemy.canHeal) return { healed: false, amount: 0 };
        
        const hpPercent = enemy.hp / enemy.maxHP;
        
        // Heal thresholds:
        //   - Below 30% HP: always heal (100% chance)
        //   - Below 50% HP: 60% chance to heal
        //   - Below 70% HP: 25% chance to heal
        let healChance = 0;
        if (hpPercent < 0.30) {
            healChance = 1.0;
        } else if (hpPercent < 0.50) {
            healChance = 0.60;
        } else if (hpPercent < 0.70) {
            healChance = 0.25;
        }
        
        if (healChance === 0 || Math.random() > healChance) {
            return { healed: false, amount: 0 };
        }
        
        // Calculate heal amount from enemy data, scaled slightly by player level
        const baseHeal = enemy.healAmount || 20;
        const levelBonus = Math.floor(playerLevel * 0.5);
        const healAmount = baseHeal + levelBonus;
        
        // Apply heal (capped at maxHP)
        const oldHp = enemy.hp;
        enemy.hp = Math.min(enemy.maxHP, enemy.hp + healAmount);
        const actualHeal = enemy.hp - oldHp;
        
        return { healed: actualHeal > 0, amount: actualHeal };
    },
    
    /**
     * Attempt to make the enemy defend (set isDefending flag).
     * Returns true if the enemy decides to defend.
     * Called each enemy turn. Enemies with canDefend will defend
     * when their HP is above 50% (tactical defense, not desperation).
     */
    attemptEnemyDefense(enemy) {
        if (!enemy || !enemy.canDefend) return false;
        
        // Don't defend if already defending
        if (enemy.isDefending) return false;
        
        const hpPercent = enemy.hp / enemy.maxHP;
        
        // Defense logic:
        //   - Above 70% HP: 20% chance to defend (proactive)
        //   - 50-70% HP: 15% chance to defend
        //   - Below 50% HP: 8% chance to defend (prefer attacking/healing when low)
        let defendChance = 0;
        if (hpPercent > 0.70) {
            defendChance = 0.20;
        } else if (hpPercent > 0.50) {
            defendChance = 0.15;
        } else {
            defendChance = 0.08;
        }
        
        if (Math.random() < defendChance) {
            enemy.isDefending = true;
            return true;
        }
        
        return false;
    }
};
