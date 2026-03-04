/**
 * Skins Configuration
 * Defines all available skins with their properties, animations, and unlock requirements
 */

const SKINS_CONFIG = {
    black_cat: {
        id: 'black_cat',
        name: 'Shadow Cat',
        price: 400,
        levelRequired: 1,  // Starter skin - available from the beginning
        tier: 'standard',
        emoji: '🐈‍⬛',
        thumbnail: 'assets/skins/BlackCatSlimePaid/thumbnail.png',
        animations: {
            idle: 'assets/skins/BlackCatSlimePaid/animated/idle.gif',
            walk: 'assets/skins/BlackCatSlimePaid/animated/idle.gif',
            attack: 'assets/skins/BlackCatSlimePaid/animated/idle.gif',
            hurt: 'assets/skins/BlackCatSlimePaid/animated/idle.gif',
            death: 'assets/skins/BlackCatSlimePaid/animated/idle.gif',
            jump: 'assets/skins/BlackCatSlimePaid/animated/idle.gif',
            sleep: 'assets/skins/BlackCatSlimePaid/animated/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    imp: {
        id: 'imp',
        name: 'Fire Imp',
        price: 200,
        levelRequired: 2,
        tier: 'standard',
        emoji: '👹',
        thumbnail: 'assets/skins/imp/thumbnail.png',
        animations: {
            idle: 'assets/skins/imp/idle_animated.gif',
            walk: 'assets/skins/imp/idle_animated.gif',
            attack: 'assets/skins/imp/idle_animated.gif',
            hurt: 'assets/skins/imp/idle_animated.gif',
            death: 'assets/skins/imp/idle_animated.gif',
            jump: 'assets/skins/imp/idle_animated.gif',
            sleep: 'assets/skins/imp/idle_animated.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true,  // Flag to indicate this is a seamless animated sprite
        hasFireball: true  // Special flag for fireball attack
    },

    pig: {
        id: 'pig',
        name: 'Fire Pig',
        price: 300,
        levelRequired: 2,
        tier: 'standard',
        emoji: '🐷',
        thumbnail: 'assets/skins/pig/thumbnail.png',
        animations: {
            idle: 'assets/skins/pig/idle_animated.gif',
            walk: 'assets/skins/pig/idle_animated.gif',
            attack: 'assets/skins/pig/idle_animated.gif',
            hurt: 'assets/skins/pig/idle_animated.gif',
            death: 'assets/skins/pig/idle_animated.gif',
            jump: 'assets/skins/pig/idle_animated.gif',
            sleep: 'assets/skins/pig/idle_animated.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Flag to indicate this is a seamless animated sprite
    },

    human_knight: {
        id: 'human_knight',
        name: 'Human Knight',
        price: 1000,
        levelRequired: 11,
        tier: 'standard',
        emoji: '⚔️',
        thumbnail: 'assets/skins/human_knight/thumbnail.png',
        animations: {
            idle: 'assets/skins/human_knight/idle.gif',
            walk: 'assets/skins/human_knight/idle.gif',
            attack: 'assets/skins/human_knight/attack.gif',
            hurt: 'assets/skins/human_knight/hurt.gif',
            death: 'assets/skins/human_knight/death.gif',
            jump: 'assets/skins/human_knight/idle.gif',
            sleep: 'assets/skins/human_knight/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    human_ranger: {
        id: 'human_ranger',
        name: 'Human Ranger',
        price: 1000,
        levelRequired: 11,
        tier: 'standard',
        emoji: '🏹',
        thumbnail: 'assets/skins/human_ranger/thumbnail.png',
        animations: {
            idle: 'assets/skins/human_ranger/idle.gif',
            walk: 'assets/skins/human_ranger/idle.gif',
            attack: 'assets/skins/human_ranger/attack.gif',
            hurt: 'assets/skins/human_ranger/hurt.gif',
            death: 'assets/skins/human_ranger/death.gif',
            jump: 'assets/skins/human_ranger/idle.gif',
            sleep: 'assets/skins/human_ranger/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    skeleton: {
        id: 'skeleton',
        name: 'Skeleton',
        price: 1100,
        levelRequired: 11,
        tier: 'standard',
        emoji: '💀',
        thumbnail: 'assets/skins/skeleton/thumbnail.png',
        animations: {
            idle: 'assets/skins/skeleton/idle.gif',
            walk: 'assets/skins/skeleton/idle.gif',
            attack: 'assets/skins/skeleton/attack.gif',
            hurt: 'assets/skins/skeleton/hurt.gif',
            death: 'assets/skins/skeleton/death.gif',
            jump: 'assets/skins/skeleton/idle.gif',
            sleep: 'assets/skins/skeleton/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    rockstar: {
        id: 'rockstar',
        name: 'Rockstar',
        price: 1300,
        levelRequired: 13,
        tier: 'standard',
        emoji: '🎸',
        thumbnail: 'assets/skins/Rockstar/Rockstar_.gif',
        battleScale: 0.015, // 2068x2068 GIF - slightly increased for visibility
        animations: {
            idle: 'assets/skins/Rockstar/Rockstar_.gif',
            walk: 'assets/skins/Rockstar/Rockstar_.gif',
            attack: 'assets/skins/Rockstar/Rockstar_.gif',
            hurt: 'assets/skins/Rockstar/Rockstar_.gif',
            death: 'assets/skins/Rockstar/Rockstar_.gif',
            jump: 'assets/skins/Rockstar/Rockstar_.gif',
            sleep: 'assets/skins/Rockstar/Rockstar_.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 80,
            walk: 80,
            attack: 80,
            hurt: 80,
            death: 80,
            jump: 80,
            sleep: 80
        },
        seamlessImage: true
    },

    brown_cat: {
        id: 'brown_cat',
        name: 'Brown Cat',
        price: 500,
        levelRequired: 15,
        tier: 'standard',
        emoji: '🐱',
        thumbnail: 'assets/skins/BrownCat/thumbnail.png',
        animations: {
            idle: 'assets/skins/BrownCat/animated/idle.gif',
            walk: 'assets/skins/BrownCat/animated/idle.gif',
            attack: 'assets/skins/BrownCat/animated/idle.gif',
            hurt: 'assets/skins/BrownCat/animated/idle.gif',
            death: 'assets/skins/BrownCat/animated/idle.gif',
            jump: 'assets/skins/BrownCat/animated/idle.gif',
            sleep: 'assets/skins/BrownCat/animated/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    baby_blue_cat: {
        id: 'baby_blue_cat',
        name: 'Sky Cat',
        price: 500,
        levelRequired: 15,
        tier: 'standard',
        thumbnail: 'assets/skins/BabyBlueCatSlimePaid/thumbnail.png',
        animations: {
            idle: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif',
            walk: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif',
            attack: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif',
            hurt: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif',
            death: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif',
            jump: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif',
            sleep: 'assets/skins/BabyBlueCatSlimePaid/animated/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    white_cat: {
        id: 'white_cat',
        name: 'Snow Cat',
        price: 400,
        levelRequired: 15,
        tier: 'standard',
        emoji: '🐈',
        thumbnail: 'assets/skins/WhiteCatSlimePaid/thumbnail.png',
        animations: {
            idle: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif',
            walk: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif',
            attack: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif',
            hurt: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif',
            death: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif',
            jump: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif',
            sleep: 'assets/skins/WhiteCatSlimePaid/animated/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    flying_eye: {
        id: 'flying_eye',
        name: 'Flying Eye',
        price: 1700,
        levelRequired: 17,
        tier: 'standard',
        emoji: '👁️',
        thumbnail: 'assets/skins/flying-eye/thumbnail.png',
        battleScale: 0.6, // 48x48 GIF - reduced by 2x for visibility
        animations: {
            idle: 'assets/skins/flying-eye/FlyingEye.gif',
            walk: 'assets/skins/flying-eye/FlyingEye.gif',
            attack: 'assets/skins/flying-eye/FlyingEye.gif',
            hurt: 'assets/skins/flying-eye/FlyingEye.gif',
            death: 'assets/skins/flying-eye/FlyingEye.gif',
            jump: 'assets/skins/flying-eye/FlyingEye.gif',
            sleep: 'assets/skins/flying-eye/FlyingEye.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 80,
            walk: 80,
            attack: 80,
            hurt: 80,
            death: 80,
            jump: 80,
            sleep: 80
        },
        seamlessImage: true
    },

    rainbow_cat: {
        id: 'rainbow_cat',
        name: 'Rainbow Cat',
        price: 800,
        levelRequired: 20,
        tier: 'standard',
        thumbnail: 'assets/skins/RainbowCatSlimePaid/thumbnail.png',
        animations: {
            idle: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif',
            walk: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif',
            attack: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif',
            hurt: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif',
            death: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif',
            jump: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif',
            sleep: 'assets/skins/RainbowCatSlimePaid/animated/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    demonic_cat: {
        id: 'demonic_cat',
        name: 'Shadow Demon Cat',
        price: 800,
        levelRequired: 20,
        tier: 'standard',
        thumbnail: 'assets/skins/DemonicCatSlimePaid/thumbnail.png',
        animations: {
            idle: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif',
            walk: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif',
            attack: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif',
            hurt: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif',
            death: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif',
            jump: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif',
            sleep: 'assets/skins/DemonicCatSlimePaid/animated/idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true
    },

    warrior_queen: {
        id: 'warrior_queen',
        name: 'Warrior Queen',
        price: 2000,
        levelRequired: 20,
        tier: 'premium',
        emoji: '👑',
        thumbnail: 'assets/skins/Warrior Queen/WarriorQueen_Idle.gif',
        battleScale: 1.25, // 20x44 GIF - reduced by 2x for visibility
        animations: {
            idle: 'assets/skins/Warrior Queen/WarriorQueen_Idle.gif',
            walk: 'assets/skins/Warrior Queen/WarriorQueen_Idle.gif',
            attack: 'assets/skins/Warrior Queen/WarriorQueen_DashAttack.gif',
            hurt: 'assets/skins/Warrior Queen/WarriorQueen_Hurt.gif',
            death: 'assets/skins/Warrior Queen/WarriorQueen_Death.gif',
            jump: 'assets/skins/Warrior Queen/WarriorQueen_Idle.gif',
            sleep: 'assets/skins/Warrior Queen/WarriorQueen_Idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 80,
            walk: 80,
            attack: 232,
            hurt: 84,
            death: 168,
            jump: 80,
            sleep: 80
        },
        seamlessImage: true
    },

    eye_monster: {
        id: 'eye_monster',
        name: 'Eye Monster',
        price: 2500,
        levelRequired: 25,
        tier: 'premium',
        emoji: '👁️',
        thumbnail: 'assets/skins/eye-monster/thumbnail.png',
        battleScale: 0.9, // 32x32 GIF - reduced by 2x for visibility
        animations: {
            idle: 'assets/skins/eye-monster/Idle.gif',
            walk: 'assets/skins/eye-monster/Walk.gif',
            attack: 'assets/skins/eye-monster/Attack.gif',
            hurt: 'assets/skins/eye-monster/Hurt.gif',
            death: 'assets/skins/eye-monster/Die.gif',
            jump: 'assets/skins/eye-monster/Idle.gif',
            sleep: 'assets/skins/eye-monster/Idle.gif',
            special: 'assets/skins/eye-monster/Special.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1,
            special: 1
        },
        spriteSheetWidth: {
            idle: 80,
            walk: 80,
            attack: 80,
            hurt: 80,
            death: 80,
            jump: 80,
            sleep: 80
        },
        seamlessImage: true
    },

    task_phantom: {
        id: 'task_phantom',
        name: 'Task Phantom',
        price: 1100,
        levelRequired: 30,
        tier: 'premium',
        emoji: '👻',
        thumbnail: 'assets/skins/task-phantom/idle.png',
        animations: {
            idle: 'assets/skins/task-phantom-idle.gif',
            walk: 'assets/skins/task-phantom-idle.gif',
            attack: 'assets/skins/task-phantom-idle.gif',
            hurt: 'assets/skins/task-phantom-idle.gif',
            death: 'assets/skins/task-phantom-idle.gif',
            jump: 'assets/skins/task-phantom-idle.gif',
            sleep: 'assets/skins/task-phantom-idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        seamlessImage: true  // Flag to indicate this is a single seamless GIF animation
    },

    task_toad: {
        id: 'task_toad',
        name: 'Task Toad',
        price: 900,
        levelRequired: 30,
        tier: 'premium',
        emoji: '🐸',
        thumbnail: 'assets/skins/task-toad/idle.png',
        animations: {
            idle: 'assets/skins/task-toad-idle.gif',
            walk: 'assets/skins/task-toad-idle.gif',
            attack: 'assets/skins/task-toad-idle.gif',
            hurt: 'assets/skins/task-toad-idle.gif',
            death: 'assets/skins/task-toad-idle.gif',
            jump: 'assets/skins/task-toad-idle.gif',
            sleep: 'assets/skins/task-toad-idle.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSheetWidth: {
            idle: 32,
            walk: 32,
            attack: 32,
            hurt: 32,
            death: 32,
            jump: 32,
            sleep: 32
        },
        scale: 2.5,  // Reduce from default 4x to 2.5x to fit in frame
        seamlessImage: true,  // Flag to indicate this is a single seamless image
        offsetY: -20  // Move up 20px from gauge containers
    },

    merlin: {
        id: 'merlin',
        name: 'Merlin',
        price: 4500,
        levelRequired: 50,
        tier: 'legendary',
        emoji: '🧙‍♂️',
        thumbnail: 'assets/skins/Merlin Skin/Merlin Skin Thumbnail Image.png',
        battleScale: 0.6, // 48x48 GIF - reduced by 2x for visibility
        animations: {
            idle: 'assets/skins/Merlin Skin/Merlin Skin.gif',
            walk: 'assets/skins/Merlin Skin/Merlin Skin.gif',
            attack: 'assets/skins/Merlin Skin/Merlin Attack Explosion.gif',
            hurt: 'assets/skins/Merlin Skin/Merlin Skin.gif',
            death: 'assets/skins/Merlin Skin/Merlin Skin.gif',
            jump: 'assets/skins/Merlin Skin/Merlin Skin.gif',
            sleep: 'assets/skins/Merlin Skin/Merlin Skin.gif',
            special: 'assets/skins/Merlin Skin/Merlin Second Attack.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1,
            special: 1
        },
        spriteSheetWidth: {
            idle: 80,
            walk: 80,
            attack: 80,
            hurt: 80,
            death: 80,
            jump: 80,
            sleep: 80
        },
        seamlessImage: true
    },

    mage: {
        id: 'mage',
        name: 'Mage',
        price: 1500,
        levelRequired: 15,
        tier: 'standard',
        emoji: '🧙',
        thumbnail: 'assets/skins/Mage/Mage_Idle_1.gif',
        battleScale: 1.0, // 29x28 GIF - reduced by 2x for visibility
        animations: {
            idle: 'assets/skins/Mage/Mage_Idle_1.gif',
            walk: 'assets/skins/Mage/Mage_Walk.gif',
            attack: 'assets/skins/Mage/Mage_Attack.gif',
            hurt: 'assets/skins/Mage/Mage_Hurt.gif',
            death: 'assets/skins/Mage/Mage_Death.gif',
            jump: 'assets/skins/Mage/Mage_Idle_1.gif',
            sleep: 'assets/skins/Mage/Mage_Idle_1.gif'
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            hurt: 1,
            death: 1,
            jump: 1,
            sleep: 1
        },
        spriteSize: { width: 29, height: 28 },
        spriteSheetWidth: {
            idle: 29,
            walk: 29,
            attack: 29,
            hurt: 29,
            death: 29,
            jump: 29,
            sleep: 29
        },
        seamlessImage: true
    }

};

/**
 * Helper function to get active monster appearance
 * Returns skin animations if equipped, otherwise default monster animations
 */
function getActiveMonsterAppearance(baseMonsterId, equippedSkinId) {
    if (equippedSkinId && SKINS_CONFIG[equippedSkinId]) {
        const skin = SKINS_CONFIG[equippedSkinId];
        // Any skin can be used with any monster
        return {
            animations: skin.animations,
            frameCount: skin.frameCount,
            spriteSheetWidth: skin.spriteSheetWidth || {}, // Actual sprite sheet widths
            spriteSize: skin.spriteSize || { width: 32, height: 32 }, // Default to 32x32 for cat skins
            spriteRow: skin.spriteRow || 0, // Which row to use for multi-directional sprites (Orc)
            animationRows: skin.animationRows || {}, // Which row for each animation (Blob)
            isSkin: true,
            skinId: equippedSkinId
        };
    }
    
    // Return default monster appearance
    const defaultMonsterMap = {
        luna: 'Owlet_Monster',
        benny: 'Dude_Monster',
        nova: 'Pink_Monster'
    };
    
    const prefix = defaultMonsterMap[baseMonsterId] || 'Pink_Monster';
    
    return {
        animations: {
            idle: `assets/${prefix}_idle.gif`,
            walk: `assets/${prefix}_idle.gif`,
            attack: `assets/${prefix}_attack.gif`,
            jump: `assets/${prefix}_jump.gif`,
            hurt: `assets/${prefix}_Hurt.gif`,
            die: `assets/${prefix}_die.gif`
        },
        frameCount: {
            idle: 1,
            walk: 1,
            attack: 1,
            jump: 1,
            hurt: 1,
            die: 1
        },
        isSkin: false,
        skinId: null
    };
}

/**
 * Get all skins (no longer filtered by monster)
 */
function getAllSkins() {
    return Object.values(SKINS_CONFIG);
}

/**
 * Check if a skin is unlocked for the current user
 */
function isSkinUnlocked(skinId, userLevel, ownedSkins) {
    const skin = SKINS_CONFIG[skinId];
    if (!skin) return false;
    
    // Check if user owns the skin
    if (!ownedSkins || !ownedSkins.includes(skinId)) {
        return false;
    }
    
    // Check level requirement
    if (skin.levelRequired && userLevel < skin.levelRequired) {
        return false;
    }
    
    return true;
}

/**
 * Check if a skin can be purchased (level requirement met, but not owned yet)
 */
function canPurchaseSkin(skinId, userLevel, userXP, ownedSkins) {
    const skin = SKINS_CONFIG[skinId];
    if (!skin) return { canPurchase: false, reason: 'Skin not found' };
    
    // Check if already owned
    if (ownedSkins && ownedSkins.includes(skinId)) {
        return { canPurchase: false, reason: 'Already owned' };
    }
    
    // Check level requirement
    if (skin.levelRequired && userLevel < skin.levelRequired) {
        return { 
            canPurchase: false, 
            reason: `Requires Level ${skin.levelRequired}`,
            levelRequired: skin.levelRequired
        };
    }
    
    // Check XP coins
    if (userXP < skin.price) {
        return { 
            canPurchase: false, 
            reason: `Need ${skin.price - userXP} more XP coins`,
            xpNeeded: skin.price - userXP
        };
    }
    
    return { canPurchase: true, reason: 'Available' };
}

// Export for global access
window.SKINS_CONFIG = SKINS_CONFIG;
window.getActiveMonsterAppearance = getActiveMonsterAppearance;
window.getAllSkins = getAllSkins;
window.isSkinUnlocked = isSkinUnlocked;
window.canPurchaseSkin = canPurchaseSkin;