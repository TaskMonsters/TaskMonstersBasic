// Guardian of Task World - Mystical Narrator System
// The Guardian appears on the map page after battle victories to celebrate progress

class GuardianOfTaskWorld {
    constructor() {
        this.initialized = false;
    }

    // Initialize the Guardian system
    init() {
        if (this.initialized) return;
        this.initialized = true;

    }

    // Get contextual message based on battle result and player progress
    getMessage(context) {
        const {
            result,          // 'victory' or 'defeat'
            level,           // Current player level (1-50)
            previousLevel,   // Level before battle
            region,          // Current region name
            petName,         // Player's pet name
            enemyName,       // Enemy just defeated
            firstBattle,     // Is this the first battle?
            regionChanged,   // Did player enter new region?
            battleStreak     // Current battle win streak
        } = context;

        // DEFEAT: No message (Guardian only appears after victories)
        if (result === 'defeat') {
            return null;
        }

        // VICTORY: Determine message type
        if (firstBattle) {
            return this.getFirstBattleMessage(petName);
        }

        if (regionChanged) {
            return this.getRegionTransitionMessage(region, petName);
        }

        if (this.isMilestoneLevel(level)) {
            return this.getMilestoneMessage(level, petName);
        }

        if (level > previousLevel) {
            return this.getLevelUpMessage(level, region, petName);
        }

        return this.getStandardVictoryMessage(petName);
    }

    // First battle completion message
    getFirstBattleMessage(petName) {
        return `Incredible! Your focus is powerful! This map shows your journey ahead. As you complete more tasks and level up, ${petName} will travel from the peaceful village all the way to the Castle of Accomplishment. Your adventure has just begun!`;
    }

    // Standard victory messages (random selection)
    getStandardVictoryMessage(petName) {
        const messages = [
            `Another victory for Task World! The Gloom grows weaker.`,
            `${petName} grows stronger with each triumph!`,
            `Well done, Task Master! The path ahead is clearing.`,
            `The light of your focus pushes back the shadows!`,
            `Your determination strengthens Task World every day!`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Level up messages
    getLevelUpMessage(level, region, petName) {
        const messages = [
            `Level ${level} achieved! ${petName}'s power grows!`,
            `You're becoming stronger, Task Master! Level ${level} reached.`,
            `The energy of your accomplishment radiates through Task World!`,
            `Level ${level}, ${petName}! Your journey through ${region} continues!`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Region transition messages
    getRegionTransitionMessage(region, petName) {
        const regionMessages = {
            'Enchanted Forest': `You've entered the Enchanted Forest! New challenges await among the ancient trees.`,
            'Murky Swamp': `The Murky Swamp lies ahead. Stay focused—doubt and confusion lurk in the fog, but ${petName} is ready.`,
            'Golden Desert': `Welcome to the Golden Desert! This test of endurance will forge your resilience.`,
            'Frozen Mountain Pass': `The Frozen Mountain Pass awaits. Only the determined can climb these peaks!`,
            'Volcanic Wasteland': `You've reached the Volcanic Wasteland! The final challenges before the castle await.`,
            'Castle of Accomplishment': `Behold! The Castle of Accomplishment! You stand at the threshold of mastery, Task Master!`
        };
        return regionMessages[region] || `You've entered ${region}! ${petName} is ready for new challenges.`;
    }

    // Milestone level messages
    getMilestoneMessage(level, petName) {
        const milestones = {
            10: `Ten levels conquered! Your journey through Task World is gaining momentum.`,
            20: `Twenty levels of triumph! You're halfway to the castle, Task Master.`,
            30: `Thirty levels achieved! ${petName} has become a formidable champion.`,
            40: `Forty levels mastered! The Castle of Accomplishment is within reach!`,
            48: `The castle gates are near! Just a few more victories, Task Master.`,
            49: `One final push! The Castle of Accomplishment awaits your arrival!`,
            50: `You've done it! The Castle of Accomplishment is yours! You are a true master of focus and determination. Task World celebrates your triumph!`
        };
        return milestones[level] || this.getLevelUpMessage(level, '', petName);
    }

    // Check if level is a milestone
    isMilestoneLevel(level) {
        return [10, 20, 30, 40, 48, 49, 50].includes(level);
    }

    // Get region name based on level
    getRegionForLevel(level) {
        if (level >= 1 && level <= 7) return 'Peaceful Village';
        if (level >= 8 && level <= 14) return 'Enchanted Forest';
        if (level >= 15 && level <= 21) return 'Murky Swamp';
        if (level >= 22 && level <= 30) return 'Golden Desert';
        if (level >= 31 && level <= 38) return 'Frozen Mountain Pass';
        if (level >= 39 && level <= 45) return 'Volcanic Wasteland';
        if (level >= 46 && level <= 50) return 'Castle of Accomplishment';
        return 'Unknown Region';
    }

    // Show Guardian message on map page
    showMessage(message, duration = 4000) {
        if (!message) return;

        // Create Guardian message overlay
        const overlay = document.createElement('div');
        overlay.className = 'guardian-message-overlay';
        overlay.innerHTML = `
            <div class="guardian-message-container">
                <div class="guardian-icon">🏰</div>
                <div class="guardian-text">${message}</div>
                <button class="guardian-continue-btn" onclick="this.parentElement.parentElement.remove()">Continue</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Auto-remove after duration (unless user clicks Continue)
        setTimeout(() => {
            if (overlay && overlay.parentElement) {
                overlay.remove();
            }
        }, duration);

    }

    // Show Guardian message after battle victory
    showPostBattleMessage(battleResult) {
        const gameState = window.gameState || {};
        const currentLevel = gameState.jerryLevel || 1;
        const previousLevel = battleResult.previousLevel || currentLevel;
        const petName = gameState.rockName || 'your Task Pet';
        
        const currentRegion = this.getRegionForLevel(currentLevel);
        const previousRegion = this.getRegionForLevel(previousLevel);
        const regionChanged = currentRegion !== previousRegion;

        const context = {
            result: battleResult.result,
            level: currentLevel,
            previousLevel: previousLevel,
            region: currentRegion,
            petName: petName,
            enemyName: battleResult.enemyName || 'enemy',
            firstBattle: gameState.battlesWon === 1,
            regionChanged: regionChanged,
            battleStreak: gameState.battleStreak || 0
        };

        const message = this.getMessage(context);
        if (message) {
            // Show message after a short delay to let loot modal close
            setTimeout(() => {
                this.showMessage(message);
            }, 500);
        }
    }
}

// Initialize Guardian system
window.guardianOfTaskWorld = new GuardianOfTaskWorld();
window.guardianOfTaskWorld.init();

// Listen for battle victory events
document.addEventListener('battleVictory', (event) => {
    const detail = event.detail;
    const gameState = window.gameState || {};
    
    const previousLevel = detail.previousLevel || detail.level;
    const currentLevel = detail.level;
    const petName = gameState.rockName || 'your Task Pet';
    
    const currentRegion = window.guardianOfTaskWorld.getRegionForLevel(currentLevel);
    const previousRegion = window.guardianOfTaskWorld.getRegionForLevel(previousLevel);
    const regionChanged = currentRegion !== previousRegion;
    
    const context = {
        result: 'victory',
        level: currentLevel,
        previousLevel: previousLevel,
        region: currentRegion,
        petName: petName,
        enemyName: detail.enemy || 'enemy',
        firstBattle: detail.isFirstBattle || false,
        regionChanged: regionChanged,
        battleStreak: gameState.battleStreak || 0
    };
    
    const message = window.guardianOfTaskWorld.getMessage(context);
    if (message) {
        // Show Guardian message after loot modal closes (3 second delay)
        setTimeout(() => {
            window.guardianOfTaskWorld.showMessage(message);
        }, 3000);
    }
});
