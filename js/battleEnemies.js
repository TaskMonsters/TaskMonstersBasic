/**
 * BATTLE ENEMIES CONFIGURATION
 * Defines all enemy types, stats, abilities, and tier progression
 */

const BATTLE_ENEMIES = {
    // TIER 1: Levels 5-15 (Easy enemies for new players)
    lazy_bat: {
        id: 'lazy_bat',
        name: 'Lazy Bat',
        tier: 1,
        minLevel: 5,
        maxLevel: 15,
        instinct: 'opportunist',
        
        // Base stats (scale with player level)
        hp: { min: 30, max: 50 },
        attack: { min: 10, max: 20 },
        defense: { min: 3, max: 8 },
        
        // Abilities - Level 5+: Attack Damage 10-20, No special ability
        abilities: [
            { name: 'Wing Slash', damage: [10, 20], cooldown: 0 }
        ],
        
        // Loot table
        loot: {
            xpCoins: { min: 15, max: 30 },
            items: [
                { id: 'health_potion', chance: 0.3 },
                { id: 'attack_boost', chance: 0.15 }
            ]
        },
        
        // Asset paths
        assets: {
            idle: 'assets/battle/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif',
            attack: 'assets/battle/enemies/Lazy Bat/Lazy Bat-Attack-animated.gif',
            hurt: 'assets/battle/enemies/Lazy Bat/Lazy Bat-Hurt.gif',
            attackSound: 'assets/battle/enemies/Lazy Bat/Lazy Bat-Attack Sound.mp3'
        }
    },

    slime_enemy: {
        id: 'slime_enemy',
        name: 'Procrastination Slime',
        tier: 1,
        minLevel: 5,
        maxLevel: 15,
        instinct: 'leecher', // Drains resources slowly
        
        hp: { min: 40, max: 60 },
        attack: { min: 4, max: 8 },
        defense: { min: 5, max: 10 },
        
        abilities: [
            { name: 'Sticky Glob', damage: [4, 8], cooldown: 0 },
            { name: 'Energy Drain', damage: [6, 10], effect: 'drain_attack', cooldown: 3 }
        ],
        
        loot: {
            xpCoins: { min: 20, max: 35 },
            items: [
                { id: 'defense_boost', chance: 0.25 },
                { id: 'energy_potion', chance: 0.2 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Slime Enemy/Slime-Idle.gif',
            attack: 'assets/battle/enemies/Slime Enemy/Slime-Attack.gif',
            hurt: 'assets/battle/enemies/Slime Enemy/Slime-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    // TIER 2: Levels 10-25
    flying_procrastinator: {
        id: 'flying_procrastinator',
        name: 'Flying Procrastinator',
        tier: 1,
        minLevel: 7,
        maxLevel: 22,
        instinct: 'trickster',
        
        hp: { min: 45, max: 75 },
        attack: { min: 25, max: 30 },
        defense: { min: 5, max: 12 },
        
        // Level 7+: Attack Damage 25-30, Uses Defend to block some attacks, Can Use a Daze attack that skips users turn for one turn
        abilities: [
            { name: 'Delay Dart', damage: [25, 30], cooldown: 0 },
            { name: 'Defend', damage: 0, effect: 'defend', cooldown: 3 },
            { name: 'Daze', damage: 0, effect: 'stun', cooldown: 4 }
        ],
        
        loot: {
            xpCoins: { min: 30, max: 50 },
            items: [
                { id: 'focus_boost', chance: 0.3 },
                { id: 'mirror_shield', chance: 0.2 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Flying Procrastinator/Flying Procrastinator-Idle.gif',
            attack: 'assets/battle/enemies/Flying Procrastinator/Flying Procrastinator-Attack.gif',
            hurt: 'assets/battle/enemies/Flying Procrastinator/Flying Procrastinator-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    self_doubt_drone: {
        id: 'self_doubt_drone',
        name: 'Self-Doubt Drone',
        tier: 2,
        minLevel: 9,
        maxLevel: 26,
        instinct: 'bully',
        
        hp: { min: 55, max: 90 },
        attack: { min: 20, max: 35 },
        defense: { min: 8, max: 15 },
        
        // Level 9+: Attack Damage 20-35, Uses Defend to block some attacks, Can restore 30 HP if its HP is low, Can stun users monster which skips users turn for one turn
        abilities: [
            { name: 'Doubt Beam', damage: [20, 35], cooldown: 0 },
            { name: 'Defend', damage: 0, effect: 'defend', cooldown: 3 },
            { name: 'Self Repair', damage: 0, effect: 'heal_self_30', cooldown: 4 },
            { name: 'Crushing Words', damage: 0, effect: 'stun', cooldown: 5 }
        ],
        
        loot: {
            xpCoins: { min: 35, max: 55 },
            items: [
                { id: 'confidence_charm', chance: 0.25 },
                { id: 'mental_shield', chance: 0.2 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Self Doubt Drone/Self Doubt Drone-Idle.gif',
            attack: 'assets/battle/enemies/Self Doubt Drone/Self Doubt Drone-Attack.gif',
            hurt: 'assets/battle/enemies/Self Doubt Drone/Self Doubt Drone-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    // TIER 3: Levels 20-35
    overthinker: {
        id: 'overthinker',
        name: 'The Overthinker',
        tier: 3,
        minLevel: 20,
        maxLevel: 35,
        instinct: 'predator', // Aggressive, high damage
        
        hp: { min: 80, max: 120 },
        attack: { min: 15, max: 25 },
        defense: { min: 10, max: 18 },
        
        abilities: [
            { name: 'Analysis Paralysis', damage: [15, 25], cooldown: 0 },
            { name: 'Spiral Thoughts', damage: [20, 30], effect: 'confusion', cooldown: 4 },
            { name: 'Mental Overload', damage: [25, 35], effect: 'stun', cooldown: 6 }
        ],
        
        loot: {
            xpCoins: { min: 50, max: 80 },
            items: [
                { id: 'clarity_potion', chance: 0.35 },
                { id: 'focus_crystal', chance: 0.25 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Overthinker/Overthinker-Idle.gif',
            attack: 'assets/battle/enemies/Overthinker/Overthinker-Attack.gif',
            hurt: 'assets/battle/enemies/Overthinker/Overthinker-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    ice_bully: {
        id: 'ice_bully',
        name: 'Ice Bully',
        tier: 3,
        minLevel: 20,
        maxLevel: 35,
        instinct: 'bully',
        
        hp: { min: 90, max: 130 },
        attack: { min: 18, max: 28 },
        defense: { min: 12, max: 20 },
        
        abilities: [
            { name: 'Frost Punch', damage: [18, 28], cooldown: 0 },
            { name: 'Freeze', damage: [15, 25], effect: 'freeze', cooldown: 4 },
            { name: 'Avalanche', damage: [30, 40], cooldown: 5 }
        ],
        
        loot: {
            xpCoins: { min: 55, max: 85 },
            items: [
                { id: 'fire_resistance', chance: 0.3 },
                { id: 'ice_shard', chance: 0.25 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Ice Bully/Ice Bully-Idle.gif',
            attack: 'assets/battle/enemies/Ice Bully/Ice Bully-Attack.gif',
            hurt: 'assets/battle/enemies/Ice Bully/Ice Bully-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    mushroom_guard: {
        id: 'mushroom_guard',
        name: 'Mushroom Guard',
        tier: 3,
        minLevel: 20,
        maxLevel: 35,
        instinct: 'opportunist',
        
        hp: { min: 100, max: 140 },
        attack: { min: 12, max: 22 },
        defense: { min: 15, max: 25 },
        
        abilities: [
            { name: 'Spore Cloud', damage: [12, 22], effect: 'poison', cooldown: 0 },
            { name: 'Root Trap', damage: [10, 18], effect: 'immobilize', cooldown: 3 },
            { name: 'Fungal Burst', damage: [25, 35], cooldown: 5 }
        ],
        
        loot: {
            xpCoins: { min: 60, max: 90 },
            items: [
                { id: 'antidote', chance: 0.4 },
                { id: 'mushroom_cap', chance: 0.2 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Mushroom Guard/Mushroom Guard-Idle.gif',
            attack: 'assets/battle/enemies/Mushroom Guard/Mushroom Guard-Attack.gif',
            hurt: 'assets/battle/enemies/Mushroom Guard/Mushroom Guard-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    // TIER 4: Levels 30-45 (Elite enemies with memory)
    distraction_dragon: {
        id: 'distraction_dragon',
        name: 'Distraction Dragon',
        tier: 4,
        minLevel: 30,
        maxLevel: 45,
        instinct: 'predator',
        hasMemory: true, // Elite enemy with persistent memory
        
        hp: { min: 120, max: 180 },
        attack: { min: 25, max: 40 },
        defense: { min: 18, max: 30 },
        
        abilities: [
            { name: 'Notification Breath', damage: [25, 40], cooldown: 0 },
            { name: 'Social Media Vortex', damage: [30, 45], effect: 'confusion', cooldown: 4 },
            { name: 'Infinite Scroll', damage: [35, 50], effect: 'drain_all', cooldown: 6 },
            { name: 'Viral Distraction', damage: [40, 55], effect: 'stun', cooldown: 8 }
        ],
        
        loot: {
            xpCoins: { min: 80, max: 120 },
            items: [
                { id: 'focus_shield', chance: 0.4 },
                { id: 'dragon_scale', chance: 0.3 },
                { id: 'legendary_item', chance: 0.1 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Distraction Dragon/Distraction Dragon-Idle.gif',
            attack: 'assets/battle/enemies/Distraction Dragon/Distraction Dragon-Attack.gif',
            hurt: 'assets/battle/enemies/Distraction Dragon/Distraction Dragon-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    medusa: {
        id: 'medusa',
        name: 'Medusa of Perfectionism',
        tier: 4,
        minLevel: 30,
        maxLevel: 45,
        instinct: 'trickster',
        hasMemory: true,
        
        hp: { min: 110, max: 170 },
        attack: { min: 28, max: 42 },
        defense: { min: 20, max: 32 },
        
        abilities: [
            { name: 'Petrifying Gaze', damage: [28, 42], effect: 'stun', cooldown: 0 },
            { name: 'Perfectionist Curse', damage: [25, 38], effect: 'reduce_attack', cooldown: 3 },
            { name: 'Stone Prison', damage: [35, 48], effect: 'immobilize', cooldown: 5 },
            { name: 'Serpent Strike', damage: [40, 52], cooldown: 4 }
        ],
        
        loot: {
            xpCoins: { min: 85, max: 125 },
            items: [
                { id: 'mirror_shield', chance: 0.45 },
                { id: 'medusa_eye', chance: 0.25 },
                { id: 'legendary_item', chance: 0.12 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Medusa/Medusa-Idle.gif',
            attack: 'assets/battle/enemies/Medusa/Medusa-Attack.gif',
            hurt: 'assets/battle/enemies/Medusa/Medusa-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    // Orc removed from the game

    // TIER 5: Levels 40-50+ (Boss-tier enemies)
    energy_vampire_bat: {
        id: 'energy_vampire_bat',
        name: 'Energy Vampire Bat',
        tier: 1,
        minLevel: 5,
        maxLevel: 20,
        instinct: 'leecher',
        
        hp: { min: 35, max: 60 },
        attack: { min: 15, max: 25 },
        defense: { min: 5, max: 10 },
        
        // Level 5+: Attack Damage 15-25, Uses Defend to block some attacks
        abilities: [
            { name: 'Bite', damage: [15, 25], cooldown: 0 },
            { name: 'Defend', damage: 0, effect: 'defend', cooldown: 3 }
        ],
        
        loot: {
            xpCoins: { min: 100, max: 150 },
            items: [
                { id: 'vampire_fang', chance: 0.5 },
                { id: 'blood_crystal', chance: 0.35 },
                { id: 'legendary_item', chance: 0.25 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Energy Vampire Bat/Energy Vampire Bat-Idle.gif',
            attack: 'assets/battle/enemies/Energy Vampire Bat/Energy Vampire Bat-Attack.gif',
            hurt: 'assets/battle/enemies/Energy Vampire Bat/Energy Vampire Bat-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    little_cthulhu: {
        id: 'little_cthulhu',
        name: 'Little Cthulhu',
        tier: 5,
        minLevel: 40,
        maxLevel: 50,
        instinct: 'predator',
        hasMemory: true,
        isBoss: true,
        
        hp: { min: 180, max: 250 },
        attack: { min: 40, max: 55 },
        defense: { min: 28, max: 42 },
        
        abilities: [
            { name: 'Eldritch Blast', damage: [40, 55], cooldown: 0 },
            { name: 'Madness Touch', damage: [45, 60], effect: 'confusion', cooldown: 3 },
            { name: 'Tentacle Whip', damage: [50, 65], effect: 'multi_hit', cooldown: 4 },
            { name: 'Cosmic Horror', damage: [60, 80], effect: 'terror', cooldown: 7 }
        ],
        
        loot: {
            xpCoins: { min: 120, max: 180 },
            items: [
                { id: 'eldritch_essence', chance: 0.5 },
                { id: 'cosmic_shard', chance: 0.4 },
                { id: 'legendary_item', chance: 0.3 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Little Cthulhu/Little Cthulhu-Idle.gif',
            attack: 'assets/battle/enemies/Little Cthulhu/Little Cthulhu-Attack.gif',
            hurt: 'assets/battle/enemies/Little Cthulhu/Little Cthulhu-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    slothful_ogre: {
        id: 'slothful_ogre',
        name: 'Slothful Ogre',
        tier: 5,
        minLevel: 40,
        maxLevel: 50,
        instinct: 'bully',
        hasMemory: true,
        isBoss: true,
        
        hp: { min: 200, max: 280 },
        attack: { min: 38, max: 52 },
        defense: { min: 30, max: 45 },
        
        abilities: [
            { name: 'Lazy Slam', damage: [38, 52], cooldown: 0 },
            { name: 'Apathy Wave', damage: [42, 56], effect: 'reduce_all', cooldown: 3 },
            { name: 'Crushing Lethargy', damage: [48, 62], effect: 'stun', cooldown: 5 },
            { name: 'Sloth Curse', damage: [55, 75], effect: 'permanent_debuff', cooldown: 8 }
        ],
        
        loot: {
            xpCoins: { min: 110, max: 170 },
            items: [
                { id: 'motivation_crystal', chance: 0.5 },
                { id: 'ogre_club', chance: 0.35 },
                { id: 'legendary_item', chance: 0.28 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Slothful Ogre/Slothful Ogre-Idle.gif',
            attack: 'assets/battle/enemies/Slothful Ogre/Slothful Ogre-Attack.gif',
            hurt: 'assets/battle/enemies/Slothful Ogre/Slothful Ogre-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    // Additional enemies
    two_face: {
        id: 'two_face',
        name: '2Face',
        tier: 2,
        minLevel: 12,
        maxLevel: 30,
        instinct: 'trickster',
        
        hp: { min: 60, max: 100 },
        attack: { min: 20, max: 25 },
        defense: { min: 10, max: 18 },
        
        // Level 12+: Attack Damage 20-25, Can morph into any other enemy and use their attack damage and special attack for 2 turns, Has a charm attack that can lower the users defense by half
        abilities: [
            { name: 'Dual Strike', damage: [20, 25], cooldown: 0 },
            { name: 'Morph', damage: 0, effect: 'morph_enemy', cooldown: 5 },
            { name: 'Charm Attack', damage: 0, effect: 'reduce_defense_half', cooldown: 4 }
        ],
        
        loot: {
            xpCoins: { min: 65, max: 100 },
            items: [
                { id: 'dual_essence', chance: 0.35 },
                { id: 'balance_charm', chance: 0.25 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/2Face/2Face-Idle.gif',
            attack: 'assets/battle/enemies/2Face/2Face-Attack.gif',
            hurt: 'assets/battle/enemies/2Face/2Face-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    land_alien: {
        id: 'land_alien',
        name: 'Land Alien',
        tier: 1,
        minLevel: 5,
        maxLevel: 20,
        instinct: 'opportunist',
        
        hp: { min: 40, max: 70 },
        attack: { min: 25, max: 25 },
        defense: { min: 5, max: 12 },
        
        // Level 5+: Attack Damage 25, Uses Defend to block some attacks, Can evade some enemy attacks
        abilities: [
            { name: 'Laser Beam', damage: [25, 25], cooldown: 0 },
            { name: 'Defend', damage: 0, effect: 'defend', cooldown: 3 },
            { name: 'Evade', damage: 0, effect: 'evade', cooldown: 4 }
        ],
        
        loot: {
            xpCoins: { min: 40, max: 65 },
            items: [
                { id: 'alien_tech', chance: 0.3 },
                { id: 'space_crystal', chance: 0.2 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Land Alien/Land Alien-Idle.gif',
            attack: 'assets/battle/enemies/Land Alien/Land Alien-Attack.gif',
            hurt: 'assets/battle/enemies/Land Alien/Land Alien-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    naughty_nova: {
        id: 'naughty_nova',
        name: 'Naughty Nova',
        tier: 4,
        minLevel: 35,
        maxLevel: 48,
        instinct: 'predator',
        hasMemory: true,
        
        hp: { min: 130, max: 190 },
        attack: { min: 32, max: 47 },
        defense: { min: 24, max: 38 },
        
        abilities: [
            { name: 'Nova Blast', damage: [32, 47], cooldown: 0 },
            { name: 'Stellar Flare', damage: [38, 52], effect: 'burn', cooldown: 3 },
            { name: 'Supernova', damage: [45, 60], effect: 'aoe', cooldown: 6 },
            { name: 'Cosmic Fury', damage: [50, 68], effect: 'berserk', cooldown: 7 }
        ],
        
        loot: {
            xpCoins: { min: 95, max: 140 },
            items: [
                { id: 'star_fragment', chance: 0.45 },
                { id: 'nova_core', chance: 0.3 },
                { id: 'legendary_item', chance: 0.2 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Naughty Nova/Naughty Nova-Idle.gif',
            attack: 'assets/battle/enemies/Naughty Nova/Naughty Nova-Attack.gif',
            hurt: 'assets/battle/enemies/Naughty Nova/Naughty Nova-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    sentry_drone: {
        id: 'sentry_drone',
        name: 'Sentry Drone',
        tier: 1,
        minLevel: 8,
        maxLevel: 25,
        instinct: 'opportunist',
        
        hp: { min: 50, max: 85 },
        attack: { min: 15, max: 30 },
        defense: { min: 8, max: 15 },
        
        // Level 8+: Attack Damage 15-30, Can restore 20 HP if its HP is low, Can stun users monster which skips users turn for one turn
        abilities: [
            { name: 'Pulse Cannon', damage: [15, 30], cooldown: 0 },
            { name: 'Repair', damage: 0, effect: 'heal_self_20', cooldown: 4 },
            { name: 'Stun Beam', damage: 0, effect: 'stun', cooldown: 5 }
        ],
        
        loot: {
            xpCoins: { min: 35, max: 60 },
            items: [
                { id: 'circuit_board', chance: 0.3 },
                { id: 'energy_cell', chance: 0.25 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Sentry Drone/Sentry Drone-Idle.gif',
            attack: 'assets/battle/enemies/Sentry Drone/Sentry Drone-Attack.gif',
            hurt: 'assets/battle/enemies/Sentry Drone/Sentry Drone-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    },

    treant: {
        id: 'treant',
        name: 'Ancient Treant',
        tier: 5,
        minLevel: 42,
        maxLevel: 50,
        instinct: 'leecher',
        hasMemory: true,
        isBoss: true,
        
        hp: { min: 220, max: 300 },
        attack: { min: 35, max: 48 },
        defense: { min: 32, max: 48 },
        
        abilities: [
            { name: 'Root Strike', damage: [35, 48], cooldown: 0 },
            { name: 'Entangle', damage: [30, 45], effect: 'immobilize', cooldown: 3 },
            { name: 'Nature\'s Wrath', damage: [42, 58], effect: 'multi_hit', cooldown: 5 },
            { name: 'Regeneration', damage: 0, effect: 'heal_self_major', cooldown: 6 },
            { name: 'Forest Fury', damage: [55, 75], effect: 'aoe', cooldown: 8 }
        ],
        
        loot: {
            xpCoins: { min: 130, max: 200 },
            items: [
                { id: 'ancient_wood', chance: 0.5 },
                { id: 'life_essence', chance: 0.4 },
                { id: 'legendary_item', chance: 0.35 }
            ]
        },
        
        assets: {
            idle: 'assets/battle/enemies/Treant/Treant-Idle.gif',
            attack: 'assets/battle/enemies/Treant/Treant-Attack.gif',
            hurt: 'assets/battle/enemies/Treant/Treant-Hurt.gif',
            attackSound: 'assets/battle/sounds/Regular Attack Sound by Users Monster.mp3'
        }
    }
};

/**
 * Get enemies available for a given player level
 * @param {number} playerLevel - Current player level
 * @param {string} difficulty - 'easy' or 'standard'
 * @returns {Array} Array of enemy IDs
 */
function getAvailableEnemies(playerLevel, difficulty = 'standard') {
    const enemies = [];
    
    for (const [id, enemy] of Object.entries(BATTLE_ENEMIES)) {
        // Check if enemy is within level range
        if (playerLevel >= enemy.minLevel && playerLevel <= enemy.maxLevel + 5) {
            // For high-level players (40-50), adjust tier selection
            if (playerLevel >= 40) {
                if (difficulty === 'easy' && (enemy.tier === 4 || enemy.tier === 5)) {
                    enemies.push(id);
                } else if (difficulty === 'standard' && enemy.tier === 5) {
                    enemies.push(id);
                }
            } else if (playerLevel >= 30) {
                if (difficulty === 'easy' && (enemy.tier === 3 || enemy.tier === 4)) {
                    enemies.push(id);
                } else if (difficulty === 'standard' && (enemy.tier === 3 || enemy.tier === 4)) {
                    enemies.push(id);
                }
            } else if (playerLevel >= 20) {
                if (difficulty === 'easy' && (enemy.tier === 2 || enemy.tier === 3)) {
                    enemies.push(id);
                } else if (difficulty === 'standard' && enemy.tier === 3) {
                    enemies.push(id);
                }
            } else if (playerLevel >= 10) {
                if (difficulty === 'easy' && (enemy.tier === 1 || enemy.tier === 2)) {
                    enemies.push(id);
                } else if (difficulty === 'standard' && enemy.tier === 2) {
                    enemies.push(id);
                }
            } else {
                // Levels 5-9: Only tier 1
                if (enemy.tier === 1) {
                    enemies.push(id);
                }
            }
        }
    }
    
    // ALTERNATION SYSTEM: Cycle through enemies instead of random selection
    // Initialize rotation index if not exists
    if (!window.battleEnemyRotationIndex) {
        window.battleEnemyRotationIndex = {};
    }
    
    // Create a unique key for this level bracket and difficulty
    const bracketKey = `L${playerLevel}_${difficulty}`;
    
    // Initialize rotation index for this bracket if not exists
    if (typeof window.battleEnemyRotationIndex[bracketKey] === 'undefined') {
        window.battleEnemyRotationIndex[bracketKey] = 0;
    }
    
    // If we have enemies, return them in alternating order
    if (enemies.length > 0) {
        // Get current rotation index
        const currentIndex = window.battleEnemyRotationIndex[bracketKey];
        
        // Get the enemy at current rotation position
        const selectedEnemy = enemies[currentIndex % enemies.length];
        
        // Advance rotation for next battle
        window.battleEnemyRotationIndex[bracketKey] = (currentIndex + 1) % enemies.length;

        // Return array with single selected enemy for compatibility
        return [selectedEnemy];
    }
    
    return enemies;
}

/**
 * Scale enemy stats based on player level
 * @param {Object} enemy - Enemy configuration
 * @param {number} playerLevel - Current player level
 * @returns {Object} Scaled enemy stats
 */
function scaleEnemyStats(enemy, playerLevel) {
    // FIXED: Use minimal scaling to keep battles balanced
    // Attack uses the minimum value (abilities define damage ranges)
    // HP and defense scale slightly with level
    
    const levelDiff = Math.max(0, playerLevel - enemy.minLevel);
    
    return {
        hp: Math.floor(enemy.hp.min + (levelDiff * 2)),
        attack: enemy.attack.min, // Use minimum attack (abilities handle damage)
        defense: Math.floor(enemy.defense.min + (levelDiff * 0.5))
    };
}

// Export for use in battle engine
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BATTLE_ENEMIES, getAvailableEnemies, scaleEnemyStats };
}
