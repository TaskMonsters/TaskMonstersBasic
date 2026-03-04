// Enemy.js - Enemy definitions matching battle system specifications

class Enemy {
    constructor(name, baseHP, baseAttack, baseDefense, sprites) {
        this.name = name;
        this.baseHP = baseHP;
        this.baseAttack = baseAttack;
        this.baseDefense = baseDefense;
        this.sprites = sprites;

        // Current battle stats (will be scaled)
        this.maxHP = baseHP;
        this.hp = baseHP;
        this.attack = baseAttack;
        this.defense = baseDefense;

        this.currentSprite = sprites.idle;
    }

    // Scale stats based on player level
    scaleToLevel(playerLevel) {
        // FIXED: Reasonable scaling for balanced gameplay
        // HP scales minimally with level (enemies should be beatable)
        this.maxHP = Math.floor(this.baseHP + (playerLevel * 2));
        this.hp = this.maxHP;
        
        // Attack uses base attack from config (already balanced)
        this.attack = this.baseAttack;
        
        // Defense scales slightly with level
        this.defense = this.baseDefense + Math.floor(playerLevel * 0.5);
    }

    // Take damage
    takeDamage(amount) {
        // Check if enemy is defending (reduces damage by 50%)
        if (this.isDefending) {
            amount = Math.floor(amount * 0.5);
            this.isDefending = false; // Reset defense after hit
        }
        
        this.hp = Math.max(0, this.hp - amount);
        
        // Show damage animation
        if (window.showBattleDamageAnimation) {
            window.showBattleDamageAnimation('enemySprite', amount);
        }
        
        return this.hp <= 0;
    }

    // Update sprite
    setSprite(spriteKey) {
        if (this.sprites[spriteKey]) {
            this.currentSprite = this.sprites[spriteKey];
        }
    }
}

// Level 5+ Enemies

const LAZY_BAT_DATA = {
    name: 'Lazy Bat',
    baseHP: 40,
    baseAttack: 10,
    baseDefense: 5,
    minLevel: 5,
    tier: 'early',
    attackDamageMin: 10,
    attackDamageMax: 20,
    specialAbility: 'none',
    sprites: {
        idle: 'assets/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif',
        attack: 'assets/enemies/Lazy Bat/Lazy Bat-Attack-animated.gif',
        hurt: 'assets/enemies/Lazy Bat/Lazy Bat-Hurt.gif'
    }
};

const ENERGY_VAMPIRE_BAT_DATA = {
    name: 'Energy Vampire Bat',
    baseHP: 45,
    baseAttack: 15,
    baseDefense: 6,
    minLevel: 5,
    tier: 'early',
    attackDamageMin: 15,
    attackDamageMax: 25,
    specialAbility: 'defend',
    canDefend: true,
    sprites: {
        idle: 'assets/enemies/Energy Vampire Bat/Energy Vampire Bat.gif',
        attack: 'assets/enemies/Energy Vampire Bat/Energy Vampire Bat.gif',
        hurt: 'assets/enemies/Energy Vampire Bat/Energy Vampire Bat.gif'
    }
};

const LAND_ALIEN_DATA = {
    name: 'Land Alien',
    baseHP: 50,
    baseAttack: 25,
    baseDefense: 7,
    minLevel: 5,
    tier: 'early',
    attackDamageMin: 25,
    attackDamageMax: 25,
    specialAbility: 'defend_evade',
    canDefend: true,
    canEvade: true,
    evasionChance: 0.20,
    sprites: {
        idle: 'assets/enemies/Land Alien/alien-idle-animated.gif',
        attack: 'assets/enemies/Land Alien/alien-walk-animated.gif',
        hurt: 'assets/enemies/Land Alien/alien-idle-animated.gif'
    }
};

// Level 7+ Enemies

const FLYING_PROCRASTINATOR_DATA = {
    name: 'Flying Procrastinator',
    baseHP: 55,
    baseAttack: 25,
    baseDefense: 8,
    minLevel: 7,
    tier: 'mid',
    attackDamageMin: 25,
    attackDamageMax: 30,
    specialAbility: 'defend_daze',
    canDefend: true,
    canDaze: true,
    dazeChance: 0.25,
    sprites: {
        idle: 'assets/enemies/Flying Procrastinator/Flying Procrastinator.gif',
        attack: 'assets/enemies/Flying Procrastinator/Flying Procrastinator.gif',
        hurt: 'assets/enemies/Flying Procrastinator/Flying Procrastinator.gif'
    }
};

// Level 8+ Enemies

const SENTRY_DRONE_DATA = {
    name: 'Sentry Drone',
    baseHP: 60,
    baseAttack: 15,
    baseDefense: 9,
    minLevel: 8,
    tier: 'mid',
    attackDamageMin: 15,
    attackDamageMax: 30,
    specialAbility: 'heal_stun',
    canHeal: true,
    healAmount: 20,
    canStun: true,
    stunChance: 0.30,
    sprites: {
        idle: 'assets/enemies/Sentry Drone/Sentry Drone.gif',
        attack: 'assets/enemies/Sentry Drone/Sentry Drone Projectile.gif',
        hurt: 'assets/enemies/Sentry Drone/Sentry Drone.gif'
    }
};

// Level 9+ Enemies

const SELF_DOUBT_DRONE_DATA = {
    name: 'Self Doubt Drone',
    baseHP: 65,
    baseAttack: 20,
    baseDefense: 10,
    minLevel: 9,
    tier: 'mid',
    attackDamageMin: 20,
    attackDamageMax: 35,
    specialAbility: 'defend_heal_stun',
    canDefend: true,
    canHeal: true,
    healAmount: 30,
    canStun: true,
    stunChance: 0.30,
    sprites: {
        idle: 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif',
        attack: 'assets/enemies/Self Doubt Drone/Self Doubt Drone Projectile.gif',
        hurt: 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif'
    }
};

// Level 12+ Enemies

const TWOFACE_DATA = {
    name: '2Face',
    baseHP: 75,
    baseAttack: 20,
    baseDefense: 12,
    minLevel: 12,
    tier: 'boss',
    attackDamageMin: 20,
    attackDamageMax: 25,
    specialAbility: 'morph_charm',
    canMorph: true,
    morphDuration: 2,
    canCharm: true,
    charmDefenseReduction: 0.5,
    sprites: {
        idle: 'assets/enemies/2Face/2Face Idle.gif',
        attack: 'assets/enemies/2Face/2Face_Attack.gif',
        hurt: 'assets/enemies/2Face/2Face_Hurt.gif'
    }
};

// Level 15+ Enemies

const NAUGHTY_NOVA_DATA = {
    name: 'Naughty Nova',
    baseHP: 110,
    baseAttack: 5,
    baseDefense: 18,
    minLevel: 15,
    tier: 'boss',
    attackDamageMin: 5,
    attackDamageMax: 40,
    variableDamage: true,
    specialAbility: 'evade_pickpocket',
    canEvade: true,
    evasionChance: 0.40,
    canPickpocket: true,
    pickpocketCount: 3,
    sprites: {
        idle: 'assets/enemies/Naughty Nova/Naughty Nova Attack.gif',
        attack: 'assets/enemies/Naughty Nova/Naughty Nova Attack.gif',
        hurt: 'assets/enemies/Naughty Nova/Naughty Nova Attack.gif'
    }
};

// Level 20+ Enemies

// Orc removed from the game

const SLOTHFUL_OGRE_DATA = {
    name: 'Slothful Ogre',
    baseHP: 140,
    baseAttack: 25,
    baseDefense: 25,
    minLevel: 20,
    tier: 'boss',
    attackDamageMin: 25,
    attackDamageMax: 40,
    specialAbility: 'super_defense_berserk',
    superDefense: true,
    defenseReduction: 0.35,
    canBerserk: true,
    berserkAttacks: 3,
    sprites: {
        idle: 'assets/enemies/Slothful Ogre/ogre-idle.gif',
        attack: 'assets/enemies/Slothful Ogre/ogre-attack.gif',
        hurt: 'assets/enemies/Slothful Ogre/ogre-idle-unarmed.gif'
    }
};

// Level 25+ Enemies

const OVERTHINKER_DATA = {
    name: 'Overthinker',
    baseHP: 150,
    baseAttack: 15,
    baseDefense: 22,
    minLevel: 25,
    tier: 'boss',
    attackDamageMin: 15,
    attackDamageMax: 25,
    variableDamage: true,
    specialAbility: 'overthink',
    canOverthink: true,
    sprites: {
        idle: 'assets/enemies/Overthinker/OverthinkerEnemy.gif',
        attack: 'assets/enemies/Overthinker/OverthinkerEnemy.gif',
        hurt: 'assets/enemies/Overthinker/OverthinkerEnemy.gif'
    }
};

// Level 30+ Enemies

const TREANT_DATA = {
    name: 'Treant',
    baseHP: 180,
    baseAttack: 10,
    baseDefense: 28,
    minLevel: 30,
    tier: 'boss',
    attackDamageMin: 10,
    attackDamageMax: 40,
    variableDamage: true,
    specialAbility: 'heal_stun_poison',
    canHeal: true,
    healAmount: 40,
    canStun: true,
    stunChance: 0.30,
    canPoison: true,
    poisonDamage: 10,
    poisonDuration: 4,
    sprites: {
        idle: 'assets/enemies/Treant/Treant.gif',
        attack: 'assets/enemies/Treant/Treant Attack Explosion.gif',
        hurt: 'assets/enemies/Treant/Treant.gif'
    }
};

// Level 35+ Enemies

const LITTLE_CTHULHU_DATA = {
    name: 'Little Cthulhu',
    baseHP: 200,
    baseAttack: 25,
    baseDefense: 30,
    minLevel: 35,
    tier: 'boss',
    attackDamageMin: 25,
    attackDamageMax: 45,
    variableDamage: true,
    specialAbility: 'absorb_stun_teleport',
    canAbsorb: true,
    absorbMin: 30,
    absorbMax: 45,
    canStun: true,
    stunDuration: 2,
    canTeleport: true,
    teleportDamage: 20,
    teleportDuration: 3,
    sprites: {
        idle: 'assets/enemies/Little Cthulhu/Little Cthulhu.gif',
        attack: 'assets/enemies/Little Cthulhu/Little Cthulhu Attack Explosion.gif',
        hurt: 'assets/enemies/Little Cthulhu/Little Cthulhu.gif'
    }
};

// Level 40+ Enemies

const MEDUSA_DATA = {
    name: 'Medusa',
    baseHP: 220,
    baseAttack: 30,
    baseDefense: 32,
    minLevel: 40,
    tier: 'boss',
    attackDamageMin: 30,
    attackDamageMax: 60,
    variableDamage: true,
    specialAbility: 'petrify_charm',
    canPetrify: true,
    petrifyDuration: 2,
    petrifyChance: 0.3,
    projectileType: 'medusa',
    canCharm: true,
    charmDefenseReduction: 0.5,
    sprites: {
        idle: 'assets/enemies/Medusa/Medusa-animated.gif',
        attack: 'assets/enemies/Medusa/Medusa Attack Explosion.gif',
        hurt: 'assets/enemies/Medusa/Medusa-animated.gif'
    }
};

const SLIME_ENEMY_DATA = {
    name: 'Slime',
    baseHP: 230,
    baseAttack: 30,
    baseDefense: 34,
    minLevel: 40,
    tier: 'boss',
    attackDamageMin: 30,
    attackDamageMax: 60,
    variableDamage: true,
    specialAbility: 'absorb_pickpocket',
    canAbsorb: true,
    absorbMin: 30,
    absorbMax: 45,
    canPickpocket: true,
    pickpocketCount: 2,
    sprites: {
        idle: 'assets/enemies/Slime Enemy/Slime Enemy.gif',
        attack: 'assets/enemies/Slime Enemy/Slime Enemy Attack.gif',
        hurt: 'assets/enemies/Slime Enemy/Slime Enemy.gif'
    }
};

// Level 45+ Enemies

const ICE_BULLY_DATA = {
    name: 'Ice Bully',
    baseHP: 250,
    baseAttack: 75,
    baseDefense: 38,
    minLevel: 45,
    tier: 'boss',
    attackDamageMin: 75,
    attackDamageMax: 80,
    specialAbility: 'super_defense_pickpocket',
    superDefense: true,
    defenseReduction: 0.45,
    canPickpocket: true,
    pickpocketCount: 4,
    sprites: {
        idle: 'assets/enemies/Ice Bully/idle.gif',
        attack: 'assets/enemies/Ice Bully/1_atk.gif',
        hurt: 'assets/enemies/Ice Bully/death.gif'
    }
};

// Level 50+ Enemies

const MUSHROOM_GUARD_DATA = {
    name: 'Mushroom Guard',
    baseHP: 280,
    baseAttack: 50,
    baseDefense: 42,
    minLevel: 50,
    tier: 'boss',
    attackDamageMin: 50,
    attackDamageMax: 85,
    variableDamage: true,
    specialAbility: 'teleport',
    canTeleport: true,
    teleportDamage: 20,
    teleportDuration: 3,
    projectileType: 'mushroom',
    sprites: {
        idle: 'assets/enemies/Mushroom Guard/Mushroom_Attack.gif',
        attack: 'assets/enemies/Mushroom Guard/Mushroom Guard Projectile Attack Explosion.gif',
        hurt: 'assets/enemies/Mushroom Guard/Mushroom_Attack.gif'
    }
};

const DISTRACTION_DRAGON_DATA = {
    name: 'Distraction Dragon',
    baseHP: 300,
    baseAttack: 60,
    baseDefense: 45,
    minLevel: 50,
    tier: 'boss',
    attackDamageMin: 60,
    attackDamageMax: 100,
    variableDamage: true,
    specialAbility: 'teleport_berserk_pickpocket',
    canTeleport: true,
    teleportDamage: 20,
    teleportDuration: 3,
    canBerserk: true,
    berserkAttacks: 3,
    canPickpocket: true,
    pickpocketCount: 3,
    sprites: {
        idle: 'assets/enemies/Distraction Dragon/Distraction Dragon.gif',
        attack: 'assets/enemies/Distraction Dragon/Distraction Dragon Attack.gif',
        hurt: 'assets/enemies/Distraction Dragon/Distraction Dragon.gif'
    }
};

// Enemy types array - ordered by minimum level
const ENEMY_TYPES = [
    LAZY_BAT_DATA,
    ENERGY_VAMPIRE_BAT_DATA,
    LAND_ALIEN_DATA,
    FLYING_PROCRASTINATOR_DATA,
    SENTRY_DRONE_DATA,
    SELF_DOUBT_DRONE_DATA,
    TWOFACE_DATA,
    NAUGHTY_NOVA_DATA,
    SLOTHFUL_OGRE_DATA,
    OVERTHINKER_DATA,
    TREANT_DATA,
    LITTLE_CTHULHU_DATA,
    MEDUSA_DATA,
    SLIME_ENEMY_DATA,
    ICE_BULLY_DATA,
    MUSHROOM_GUARD_DATA,
    DISTRACTION_DRAGON_DATA
];

// Enemy rotation system - 7-level tier rotation
let currentEnemyRotationIndex = 0;
let lastLevelTier = 0;

function getNextEnemyFromRotation(availableEnemies, playerLevel) {
    if (!availableEnemies || availableEnemies.length === 0) return null;
    
    // Calculate current level tier (changes every 7 levels)
    const currentLevelTier = Math.floor(playerLevel / 7);
    
    // Reset rotation index when entering a new tier
    if (currentLevelTier !== lastLevelTier) {
        currentEnemyRotationIndex = 0;
        lastLevelTier = currentLevelTier;
    }
    
    // Get next enemy from rotation
    const selectedEnemy = availableEnemies[currentEnemyRotationIndex % availableEnemies.length];
    
    // Increment rotation index for next battle
    currentEnemyRotationIndex++;
    
    return selectedEnemy;
}

// Create a scaled enemy for battle
function createRandomEnemy(playerLevel) {
    // Filter enemies available at current level
    // Allow all enemies from minLevel up to level 50 (lower level enemies can still appear)
    let availableEnemies = ENEMY_TYPES.filter(e => {
        const meetsMinLevel = playerLevel >= e.minLevel;
        const withinRange = playerLevel <= 50 || e.minLevel >= 40; // Keep all enemies available up to level 50
        return meetsMinLevel && withinRange;
    });
    
    if (availableEnemies.length === 0) {
        // Fallback to first enemy if none available
        availableEnemies = [ENEMY_TYPES[0]];
    }
    
    // Use rotation system for enemy selection (7-level tier rotation)
    const enemyData = getNextEnemyFromRotation(availableEnemies, playerLevel);
    
    // Create enemy instance
    const enemy = new Enemy(
        enemyData.name,
        enemyData.baseHP,
        enemyData.baseAttack,
        enemyData.baseDefense,
        enemyData.sprites
    );
    
    // Copy special abilities to enemy instance
    Object.keys(enemyData).forEach(key => {
        if (!['name', 'baseHP', 'baseAttack', 'baseDefense', 'sprites'].includes(key)) {
            enemy[key] = enemyData[key];
        }
    });
    
    // Scale enemy to player level
    enemy.scaleToLevel(playerLevel);
    
    return enemy;
}

// Play enemy wake-up animation sequence
function playWakeUpSequence(enemy, callback) {
    return new Promise((resolve) => {
        const spriteElement = document.getElementById('enemySprite');
        if (!spriteElement || !enemy) {
            console.warn('[WakeUp] Sprite element or enemy not found');
            if (callback) callback();
            resolve();
            return;
        }

        // FIX: Use img src instead of backgroundImage (element is <img> not <div>)
        // Play wake-up animation if available
        if (enemy.sprites && enemy.sprites.wakeup) {
            enemy.setSprite('wakeup');
            spriteElement.src = enemy.currentSprite;

            setTimeout(() => {
                enemy.setSprite('idle');
                spriteElement.src = enemy.currentSprite;

                if (callback) callback();
                resolve();
            }, 1000);
        } else {
            // No wake-up animation, just set idle
            if (enemy.sprites && enemy.sprites.idle) {
                enemy.setSprite('idle');
                spriteElement.src = enemy.currentSprite;

            } else {
                console.warn('[WakeUp] No idle sprite found for enemy:', enemy.name);
            }
            if (callback) callback();
            resolve();
        }
    });
}

// Export to global scope IMMEDIATELY and protect from being overwritten
(function() {
    'use strict';
    
    // Export with property descriptors to prevent accidental overwriting
    Object.defineProperty(window, 'Enemy', {
        value: Enemy,
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'createRandomEnemy', {
        value: createRandomEnemy,
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'playWakeUpSequence', {
        value: playWakeUpSequence,
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'ENEMY_TYPES', {
        value: ENEMY_TYPES,
        writable: false,
        configurable: false
    });

})();
