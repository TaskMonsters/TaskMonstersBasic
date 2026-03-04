// Boss Enemy Definitions - Gamified Boss System
// Bosses appear every 10 levels (10, 20, 30, 40, 50...)
// Each boss is significantly stronger than regular enemies and has unique abilities

// Level 10 Boss - Self Doubt Drone (Enhanced Boss Version)
const SELF_DOUBT_DRONE_BOSS = {
    name: 'Self Doubt Drone',
    baseHP: 200,
    baseAttack: 35,
    baseDefense: 25,
    minLevel: 10,
    isBoss: true,
    bossLevel: 10,
    tier: 'boss',
    specialAbility: 'defend_heal_stun',
    canDefend: true,
    canHeal: true,
    healAmount: 50,
    canStun: true,
    stunChance: 0.40,
    bossRewardMultiplier: 2.0,
    sprites: {
        idle: 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif',
        attack: 'assets/enemies/Self Doubt Drone/Self Doubt Drone Projectile.gif',
        hurt: 'assets/enemies/Self Doubt Drone/Self Doubt Drone.gif'
    }
};

// Level 20 Boss - Removed (Orc was removed from the game)

// Level 30 Boss - Treant (Enhanced Boss Version)
const TREANT_BOSS = {
    name: 'Treant',
    baseHP: 380,
    baseAttack: 50,
    baseDefense: 45,
    minLevel: 30,
    isBoss: true,
    bossLevel: 30,
    tier: 'boss',
    specialAbility: 'heal_stun_poison',
    canHeal: true,
    healAmount: 60, // Enhanced from 40
    canStun: true,
    stunChance: 0.40,
    canPoison: true,
    poisonDamage: 15, // Enhanced from 10
    poisonDuration: 5, // Enhanced from 4
    bossRewardMultiplier: 3.0,
    sprites: {
        idle: 'assets/enemies/Treant/Treant.gif',
        attack: 'assets/enemies/Treant/Treant Attack Explosion.gif',
        hurt: 'assets/enemies/Treant/Treant.gif'
    }
};

// Level 40 Boss - Medusa (Enhanced Boss Version)
const MEDUSA_BOSS = {
    name: 'Medusa',
    baseHP: 480,
    baseAttack: 70,
    baseDefense: 55,
    minLevel: 40,
    isBoss: true,
    bossLevel: 40,
    tier: 'boss',
    specialAbility: 'petrify_charm',
    canPetrify: true,
    petrifyDuration: 3, // Enhanced from 2
    canCharm: true,
    charmDefenseReduction: 0.60, // Enhanced from 0.50
    bossRewardMultiplier: 3.5,
    sprites: {
        idle: 'assets/enemies/Medusa/Medusa-animated.gif',
        attack: 'assets/enemies/Medusa/Medusa Attack Explosion.gif',
        hurt: 'assets/enemies/Medusa/Medusa-animated.gif'
    }
};

// Level 50 Boss - Distraction Dragon (Enhanced Boss Version)
const DISTRACTION_DRAGON_BOSS = {
    name: 'Distraction Dragon',
    baseHP: 600,
    baseAttack: 100,
    baseDefense: 65,
    minLevel: 50,
    isBoss: true,
    bossLevel: 50,
    tier: 'boss',
    specialAbility: 'teleport_berserk_pickpocket',
    canTeleport: true,
    teleportDamage: 30, // Enhanced from 20
    teleportDuration: 4, // Enhanced from 3
    canBerserk: true,
    berserkAttacks: 4,
    canPickpocket: true,
    pickpocketCount: 5, // Enhanced from 3
    bossRewardMultiplier: 4.0,
    sprites: {
        idle: 'assets/enemies/Distraction Dragon/Distraction Dragon.gif',
        attack: 'assets/enemies/Distraction Dragon/Distraction Dragon Attack.gif',
        hurt: 'assets/enemies/Distraction Dragon/Distraction Dragon.gif'
    }
};

// Boss type array - ordered by level
const BOSS_TYPES = [
    SELF_DOUBT_DRONE_BOSS,  // Level 10
    TREANT_BOSS,             // Level 30
    MEDUSA_BOSS,             // Level 40
    DISTRACTION_DRAGON_BOSS  // Level 50
];

// Check if current level is a boss level
function isBossLevel(playerLevel) {
    // Bosses appear every 10 levels starting at level 10
    return playerLevel >= 10 && playerLevel % 10 === 0;
}

// Create a boss enemy for battle
function createBossEnemy(playerLevel) {
    // Determine which boss based on level
    // Level 10 → Self Doubt Drone
    // Level 20 → No boss (Orc removed)
    // Level 30 → Treant
    // Level 40 → Medusa
    // Level 50+ → Distraction Dragon
    
    let selectedBoss;
    
    if (playerLevel >= 50) {
        selectedBoss = DISTRACTION_DRAGON_BOSS;
    } else if (playerLevel >= 40) {
        selectedBoss = MEDUSA_BOSS;
    } else if (playerLevel >= 30) {
        selectedBoss = TREANT_BOSS;
    } else if (playerLevel >= 20) {
        selectedBoss = TREANT_BOSS; // Use Treant for level 20 since Orc is removed
    } else {
        selectedBoss = SELF_DOUBT_DRONE_BOSS;
    }
    
    // Create boss instance using Enemy class
    const boss = new window.Enemy(
        selectedBoss.name,
        selectedBoss.baseHP,
        selectedBoss.baseAttack,
        selectedBoss.baseDefense,
        selectedBoss.sprites
    );
    
    // Copy boss-specific properties
    Object.keys(selectedBoss).forEach(key => {
        if (!['name', 'baseHP', 'baseAttack', 'baseDefense', 'sprites'].includes(key)) {
            boss[key] = selectedBoss[key];
        }
    });
    
    // Scale boss to player level with enhanced multiplier
    boss.scaleToLevel(playerLevel);
    
    // Bosses are 50% stronger than regular enemies
    boss.maxHP = Math.floor(boss.maxHP * 1.5);
    boss.hp = boss.maxHP;
    boss.attack = Math.floor(boss.attack * 1.3);
    boss.defense = Math.floor(boss.defense * 1.3);
    
    return boss;
}

// Get boss arena background based on boss level
function getBossArenaBackground(bossCount) {
    // Cycle through boss arenas
    const arenas = [
        'assets/battle-backgrounds/skull-gate-arena level 15 - 30.png',  // Dark and ominous
        'assets/battle-backgrounds/castle level 4 - 30.png',              // Epic castle
        'assets/battle-backgrounds/space level 10 - 30.png',              // Cosmic battle
        'assets/battle-backgrounds/synth-city Level 10 - 20 and up .png', // Futuristic city
        'assets/battle-backgrounds/night_town level 5 - 30.png'           // Dark town
    ];
    
    return arenas[(bossCount - 1) % arenas.length];
}

// Export to global scope
window.createBossEnemy = createBossEnemy;
window.isBossLevel = isBossLevel;
window.getBossArenaBackground = getBossArenaBackground;
window.BOSS_TYPES = BOSS_TYPES;
