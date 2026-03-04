/**
 * Guardian Narrative System
 * The mystical guide and narrator for Task World
 * Provides contextual messages for onboarding, battles, and map progression
 */

class GuardianNarrative {
    constructor() {
        this.regions = [
            { name: 'Peaceful Village', minLevel: 1, maxLevel: 5 },
            { name: 'Enchanted Forest', minLevel: 6, maxLevel: 14 },
            { name: 'Golden Desert', minLevel: 15, maxLevel: 26 },
            { name: 'Frozen Mountain Pass', minLevel: 27, maxLevel: 39 },
            { name: 'Dark Castle', minLevel: 40, maxLevel: 50 }
        ];

    }
    
    /**
     * Get current region based on level
     */
    getCurrentRegion(level) {
        for (const region of this.regions) {
            if (level >= region.minLevel && level <= region.maxLevel) {
                return region;
            }
        }
        return this.regions[0]; // Default to Peaceful Village
    }
    
    /**
     * Get previous region
     */
    getPreviousRegion(level) {
        const currentRegion = this.getCurrentRegion(level);
        const currentIndex = this.regions.findIndex(r => r.name === currentRegion.name);
        if (currentIndex > 0) {
            return this.regions[currentIndex - 1];
        }
        return null;
    }
    
    /**
     * Check if player just entered a new region
     */
    justEnteredNewRegion(currentLevel, previousLevel) {
        if (!previousLevel) return false;
        const currentRegion = this.getCurrentRegion(currentLevel);
        const prevRegion = this.getCurrentRegion(previousLevel);
        return currentRegion.name !== prevRegion.name;
    }
    
    /**
     * Get Guardian message for post-battle map page
     */
    getMapMessage(context) {
        const {
            level,
            previousLevel,
            petName,
            isFirstBattle,
            enemyName,
            justLeveledUp
        } = context;
        
        const currentRegion = this.getCurrentRegion(level);
        const petNameText = petName ? `, ${petName}` : '';
        
        // First battle ever (tutorial complete)
        if (isFirstBattle) {
            return `Incredible! Your focus is powerful! This map shows your journey ahead. As you complete more tasks and level up, your Task Pet will travel from the peaceful village all the way to the Castle of Accomplishment. Your adventure has just begun!`;
        }
        
        // Region transition
        if (this.justEnteredNewRegion(level, previousLevel)) {
            return this.getRegionTransitionMessage(currentRegion, petNameText);
        }
        
        // Milestone levels (10, 20, 30, 40, 50)
        if ([10, 20, 30, 40, 50].includes(level)) {
            return this.getMilestoneMessage(level, petNameText);
        }
        
        // Approaching level 50
        if (level === 48 || level === 49) {
            return this.getApproachingCastleMessage(level);
        }
        
        // Level up (within same region)
        if (justLeveledUp) {
            return this.getLevelUpMessage(level, currentRegion, petNameText);
        }
        
        // Standard victory (no level up)
        return this.getStandardVictoryMessage(petNameText);
    }
    
    /**
     * Get region transition message
     */
    getRegionTransitionMessage(region, petNameText) {
        const messages = {
            'Enchanted Forest': `You've entered the Enchanted Forest! New challenges await among the ancient trees.`,
            'Murky Swamp': `The Murky Swamp lies ahead. Stay focused—doubt and confusion lurk in the fog${petNameText}.`,
            'Golden Desert': `Welcome to the Golden Desert! This test of endurance will forge your resilience.`,
            'Frozen Mountain Pass': `The Frozen Mountain Pass awaits. Only the determined can climb these peaks!`,
            'Volcanic Wasteland': `You've reached the Volcanic Wasteland! The final challenges before the castle await${petNameText}.`,
            'Castle of Accomplishment': `Behold! The Castle of Accomplishment! You stand at the threshold of mastery, Task Master!`
        };
        
        return messages[region.name] || `You've entered ${region.name}! Your journey continues${petNameText}.`;
    }
    
    /**
     * Get milestone level message
     */
    getMilestoneMessage(level, petNameText) {
        const messages = {
            10: `Ten levels conquered! Your journey through Task World is gaining momentum${petNameText}.`,
            20: `Twenty levels of triumph! You're halfway to the castle, Task Master.`,
            30: `Thirty levels achieved! Your Task Pet has become a formidable champion.`,
            40: `Forty levels mastered! The Castle of Accomplishment is within reach${petNameText}!`,
            50: `You've done it! The Castle of Accomplishment is yours! You are a true master of focus and determination. Task World celebrates your triumph!`
        };
        
        return messages[level] || `Level ${level} reached! Your power grows${petNameText}!`;
    }
    
    /**
     * Get approaching castle message
     */
    getApproachingCastleMessage(level) {
        if (level === 48) {
            return `The castle gates are near! Just a few more victories, Task Master.`;
        } else if (level === 49) {
            return `One final push! The Castle of Accomplishment awaits your arrival!`;
        }
        return `The castle is close! Keep pushing forward!`;
    }
    
    /**
     * Get level up message
     */
    getLevelUpMessage(level, region, petNameText) {
        const messages = [
            `Level ${level} achieved! Your Task Pet's power grows!`,
            `You're becoming stronger, Task Master! Level ${level} reached.`,
            `The energy of your accomplishment radiates through Task World!`,
            `Level ${level}${petNameText}! ${region.name} bows to your determination.`
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    /**
     * Get standard victory message
     */
    getStandardVictoryMessage(petNameText) {
        const messages = [
            `Another victory for Task World! The Gloom grows weaker.`,
            `Your Task Pet grows stronger with each triumph!`,
            `Well done, Task Master! The path ahead is clearing.`,
            `The light of your focus pushes back the shadows${petNameText}!`,
            `Excellent work! Your determination fuels Task World.`,
            `The Gloom retreats before your power!`
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    /**
     * Show Guardian message on map page
     */
    showMapMessage(message, duration = 5000) {

        // DISABLED: User requested removal of this modal
        return;
        
        // Create Guardian message container
        const container = document.createElement('div');
        container.id = 'guardianMapMessage';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
            padding: 24px 32px;
            border-radius: 16px;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(102, 126, 234, 0.6);
            max-width: 90%;
            width: 600px;
            animation: guardianFadeIn 0.5s ease;
        `;
        
        container.innerHTML = `
            <div style="color: white; font-size: 18px; line-height: 1.8; text-align: center; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${message}
            </div>
            <div style="margin-top: 16px; text-align: center;">
                <button id="guardianContinueBtn" style="
                    padding: 10px 24px;
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                ">Continue</button>
            </div>
        `;
        
        // Add animation styles
        if (!document.getElementById('guardianAnimations')) {
            const style = document.createElement('style');
            style.id = 'guardianAnimations';
            style.textContent = `
                @keyframes guardianFadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes guardianFadeOut {
                    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(container);
        
        // Continue button handler
        const continueBtn = document.getElementById('guardianContinueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hideMapMessage();
            });
            
            // Hover effects
            continueBtn.addEventListener('mouseenter', () => {
                continueBtn.style.background = 'rgba(255, 255, 255, 0.3)';
                continueBtn.style.transform = 'scale(1.05)';
            });
            continueBtn.addEventListener('mouseleave', () => {
                continueBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                continueBtn.style.transform = 'scale(1)';
            });
        }
        
        // Modal stays open until user clicks Continue button
        // No auto-close timer
    }
    
    /**
     * Hide Guardian message
     */
    hideMapMessage() {
        const container = document.getElementById('guardianMapMessage');
        if (container) {
            container.style.animation = 'guardianFadeOut 0.3s ease';
            setTimeout(() => {
                container.remove();
                
                // Check if there's pending loot to show (from battle victory)
                if (window._pendingLootContext && window.lootSystem) {
                    const { lootItems, xpGained, enemyName } = window._pendingLootContext;
                    window.lootSystem.showLootModal(lootItems, xpGained, enemyName);
                    window._pendingLootContext = null; // Clear after showing
                } else {
                    // Return to main app after Guardian message
                    if (typeof returnToMainApp === 'function') {
                        returnToMainApp();
                    }
                }
            }, 300);
        }
    }
}

// Initialize global Guardian instance
window.guardianNarrative = new GuardianNarrative();

// Listen for battle victory events
document.addEventListener('battleVictory', (event) => {
    const { level, enemy, isFirstBattle, justLeveledUp, previousLevel } = event.detail;
    const petName = window.gameState?.petName || '';

    // Get contextual message
    const message = window.guardianNarrative.getMapMessage({
        level,
        previousLevel,
        petName,
        isFirstBattle,
        enemyName: enemy,
        justLeveledUp
    });
    
    // Show message on map page (triggered after loot modal closes)
    window.guardianNarrative.showMapMessage(message);
});
