/**
 * BATTLE ARENAS SYSTEM
 * Manages arena rotation and backgrounds
 */

class BattleArenasManager {
    constructor() {
        // Arena configuration using the provided assets
        this.arenas = {
            // Tier 1 (Level 1-10)
            city_sunset: {
                name: 'City Sunset',
                tier: 1,
                background: 'assets/battle/arenas/City Sunset Level 1-10 and up.png',
                minLevel: 1,
                maxLevel: 10,
                description: 'A bustling city street at sunset'
            },
            forest: {
                name: 'Forest Path',
                tier: 1,
                background: 'assets/battle/arenas/Forest Level 1-10 and up.png',
                minLevel: 1,
                maxLevel: 10,
                description: 'A peaceful forest trail'
            },
            misty: {
                name: 'Misty Forest',
                tier: 1,
                background: 'assets/battle/arenas/MistyForest Levle 1-10 and up.png',
                minLevel: 1,
                maxLevel: 10,
                description: 'Fog-covered forest'
            },
            
            // Tier 2 (Level 11-20)
            synth_city: {
                name: 'Synth City',
                tier: 2,
                background: 'assets/battle/arenas/synth-city Level 10 - 20 and up .png',
                minLevel: 11,
                maxLevel: 20,
                description: 'A neon-lit cyberpunk city'
            },
            night_town: {
                name: 'Night Town',
                tier: 2,
                background: 'assets/battle/arenas/Night Town Level 10 - 20 and up.png',
                minLevel: 11,
                maxLevel: 20,
                description: 'A town under moonlight'
            },
            dungeon: {
                name: 'Dark Dungeon',
                tier: 2,
                background: 'assets/battle/arenas/Dungeon Level 20+.png',
                minLevel: 11,
                maxLevel: 20,
                description: 'A damp, dark dungeon'
            },
            
            // Tier 3 (Level 21-30)
            skull_gate: {
                name: 'Skull Gate',
                tier: 3,
                background: 'assets/battle/arenas/skull-gate level 20 - 25 and up.png',
                minLevel: 21,
                maxLevel: 30,
                description: 'An ominous gateway'
            },
            dusk: {
                name: 'Dusk Valley',
                tier: 3,
                background: 'assets/battle/arenas/Dusk Arena Level 20 - 25 and up.png',
                minLevel: 21,
                maxLevel: 30,
                description: 'A valley at twilight'
            },
            mountain: {
                name: 'Mountain Peak',
                tier: 3,
                background: 'assets/battle/arenas/Mountain Dusk Level 20 - 25 and up.png',
                minLevel: 21,
                maxLevel: 30,
                description: 'A high mountain summit'
            },
            dark_castle: {
                name: 'Dark Gothic Castle',
                tier: 3,
                background: 'assets/battle/arenas/DarkGothicCastle Level 20 and up.png',
                minLevel: 21,
                maxLevel: 30,
                description: 'A dark gothic castle'
            },
            
            // Tier 4 (Level 31-40)
            castle: {
                name: 'Ancient Castle',
                tier: 4,
                background: 'assets/battle/arenas/Castle Arena Level 30 - 35 and up.png',
                minLevel: 31,
                maxLevel: 40,
                description: 'A crumbling castle'
            },
            underwater: {
                name: 'Underwater Ruins',
                tier: 4,
                background: 'assets/battle/arenas/UnderwaterFantasy Level 30 - 35 and up.png',
                minLevel: 31,
                maxLevel: 40,
                description: 'Submerged ancient ruins'
            },
            green: {
                name: 'Emerald Gardens',
                tier: 4,
                background: 'assets/battle/arenas/Green Arena Level 30 - 35 and up.png',
                minLevel: 31,
                maxLevel: 40,
                description: 'Lush green gardens'
            },
            hot_town: {
                name: 'Desert Town',
                tier: 4,
                background: 'assets/battle/arenas/Hot Town Level 30 - 35 and up.png',
                minLevel: 31,
                maxLevel: 40,
                description: 'A scorching desert settlement'
            },
            
            // Tier 5 (Level 41-50)
            forest_of_illusions: {
                name: 'Forest of Illusions',
                tier: 5,
                background: 'assets/battle/arenas/Forest of Illusions Level 40 and up.gif',
                minLevel: 41,
                maxLevel: 50,
                description: 'A mystical forest with bat hazards',
                hasHazards: true
            },
            fort_of_illusions: {
                name: 'Fort of Illusions',
                tier: 5,
                background: 'assets/battle/arenas/Fort of Illusions Level 50.gif',
                minLevel: 50,
                maxLevel: 50,
                description: 'The ultimate fortress with bat hazards',
                hasHazards: true
            },
            vampire_castle: {
                name: 'Vampire Castle',
                tier: 5,
                background: 'assets/battle/arenas/vampire-castle Level 50.png',
                minLevel: 41,
                maxLevel: 50,
                description: 'A dark vampire\'s lair'
            }
        };
    }
    
    /**
     * GET AVAILABLE ARENAS for player level
     */
    getAvailableArenas(playerLevel) {
        const available = [];
        
        for (const arenaId in this.arenas) {
            const arena = this.arenas[arenaId];
            if (playerLevel >= arena.minLevel && playerLevel <= arena.maxLevel) {
                available.push(arenaId);
            }
        }
        
        return available;
    }
    
    /**
     * SELECT RANDOM ARENA for player level
     */
    selectArena(playerLevel) {
        const available = this.getAvailableArenas(playerLevel);
        
        if (available.length === 0) {
            // Fallback to tier 1
            return 'city_sunset';
        }
        
        return available[Math.floor(Math.random() * available.length)];
    }
    
    /**
     * GET ARENA CONFIG
     */
    getArena(arenaId) {
        return this.arenas[arenaId] || this.arenas.city_sunset;
    }
    
    /**
     * SET ARENA BACKGROUND
     * Updates the battle arena background
     */
    setArenaBackground(arenaId) {
        const arena = this.getArena(arenaId);
        const battleScene = document.getElementById('battleScene');
        
        if (battleScene) {
            battleScene.style.backgroundImage = `url('${arena.background}')`;
            battleScene.style.backgroundSize = 'cover';
            battleScene.style.backgroundPosition = 'center bottom';
            battleScene.style.backgroundRepeat = 'no-repeat';
        }
        
        // Update arena name display
        const arenaNameElement = document.getElementById('arenaName');
        if (arenaNameElement) {
            arenaNameElement.textContent = arena.name;
        }

    }
    
    /**
     * CHECK IF ARENA HAS HAZARDS
     */
    hasHazards(arenaId) {
        const arena = this.getArena(arenaId);
        return arena.hasHazards || false;
    }
    
    /**
     * GET ARENA TIER
     */
    getArenaTier(arenaId) {
        const arena = this.getArena(arenaId);
        return arena.tier || 1;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.BattleArenasManager = BattleArenasManager;
}
