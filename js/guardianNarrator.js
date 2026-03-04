/**
 * Guardian of Task World - Narrative System
 * The mystical guide and narrator for the Task World adventure
 */

class GuardianNarrator {
    constructor() {
        this.initialized = false;
        this.currentMessage = null;
        this.messageQueue = [];
        
        // Region definitions (Levels 1-50) - Updated to match actual map geography
        this.regions = {
            'peaceful_village': { name: 'Starting Village', minLevel: 1, maxLevel: 5 },
            'enchanted_forest': { name: 'Green Forest', minLevel: 6, maxLevel: 14 },
            'golden_desert': { name: 'Desert Region', minLevel: 15, maxLevel: 26 },
            'frozen_mountain': { name: 'Mountain Approach', minLevel: 27, maxLevel: 39 },
            'castle': { name: 'Dark Castle', minLevel: 40, maxLevel: 50 }
        };
        
        // Message templates
        this.messages = {
            // Onboarding
            welcome: "Welcome, new Task Master! You've just stepped into Task World, a secret realm that thrives on focus and accomplishment. I'll be your guide on this grand adventure!",
            
            coreConcept: "This world is powered by your energy! Every task you complete in the real world sends a wave of power here, pushing back the shadows and helping our world flourish.",
            
            introducePet: "Look! A new Task Pet has been born from your potential. This loyal companion is a reflection of your inner drive. It will grow stronger with every goal you achieve. What will you name your new friend?",
            
            explainGloom: "But Task World is in trouble. A shadowy force called The Gloom is spreading, creating mischievous monsters from everyday challenges. Your Task Pet is our champion against them!",
            
            firstBattle: "Your first challenge awaits! Let's complete a task to give your Task Pet the energy it needs to win. Every victory helps reclaim our world from The Gloom. Are you ready?",
            
            mapIntro: "Incredible! Your focus is powerful! This map shows your journey ahead. As you complete more tasks and level up, your Task Pet will travel from the peaceful village all the way to the Castle of Accomplishment. Your adventure has just begun!",
            
            // Standard victories
            standardVictory: [
                "Another victory for Task World! The Gloom grows weaker.",
                "Your Task Pet grows stronger with each triumph!",
                "Well done, Task Master! The path ahead is clearing.",
                "The light of your focus pushes back the shadows!",
                "Excellent work! The Gloom retreats before you.",
                "Your determination shines bright in Task World!",
                "Another challenge conquered! Your power grows.",
                "The monsters of The Gloom fear your focus!"
            ],
            
            // Level up messages
            levelUp: [
                "Level {level} achieved! Your Task Pet's power grows!",
                "You're becoming stronger, Task Master! Level {level} reached.",
                "The energy of your accomplishment radiates through Task World!",
                "Level {level}! {PetName} grows more powerful with every victory!",
                "Your focus has reached new heights! Level {level} attained."
            ],
            
            // Region transitions
            regionTransitions: {
                'enchanted_forest': "You've entered the Green Forest! New challenges await among the ancient trees.",
                'golden_desert': "Welcome to the Desert Region! Ancient pyramids and golden sands test your endurance.",
                'frozen_mountain': "The Mountain Approach awaits. Only the determined can climb these peaks!",
                'castle': "Behold! The Dark Castle! You stand at the threshold of mastery, Task Master!"
            },
            
            // Milestone levels
            milestones: {
                10: "Ten levels conquered! Your journey through Task World is gaining momentum.",
                20: "Twenty levels of triumph! You're halfway to the castle, Task Master.",
                30: "Thirty levels achieved! Your Task Pet has become a formidable champion.",
                40: "Forty levels mastered! The Castle of Accomplishment is within reach!",
                48: "The castle gates are near! Just a few more victories, Task Master.",
                49: "One final push! The Castle of Accomplishment awaits your arrival!",
                50: "You've done it! The Dark Castle is conquered! You are a true master of focus and determination. Task World celebrates your triumph!"
            },
            
            // First enemy defeats
            firstEnemyDefeat: {
                'Flying Procrastinator': "You've defeated your first Flying Procrastinator! Delays have no power over you.",
                'Energy Vampire Bat': "You've defeated your first Energy Vampire Bat! Your motivation is unshakeable.",
                'Slothful Ogre': "You've defeated your first Slothful Ogre! Lethargy cannot hold you back.",
                'Overthinker': "You've defeated your first Overthinker! Clear action triumphs over endless analysis.",
                'Self Doubt Drone': "You've defeated your first Self Doubt Drone! Your confidence grows stronger.",
                'Distraction Dragon': "You've defeated your first Distraction Dragon! Your focus is unbreakable.",
                'Ice Bully': "You've defeated your first Ice Bully! Fear and intimidation melt before your courage."
            },
            
            // Re-engagement
            reengagement: [
                "Your Task Pet misses you! Ready for another adventure?",
                "Task World awaits your return, Task Master. The Gloom never rests!",
                "A new challenge is ready whenever you are. Your Task Pet stands ready!"
            ]
        };
    }
    
    init() {
        if (this.initialized) return;

        this.initialized = true;
        
        // Create Guardian UI container if it doesn't exist
        this.createGuardianUI();
        
        // Listen for battle victory events
        this.setupEventListeners();

    }
    
    createGuardianUI() {
        // Check if Guardian UI already exists
        if (document.getElementById('guardian-message-container')) return;
        
        const container = document.createElement('div');
        container.id = 'guardian-message-container';
        container.className = 'guardian-message-container hidden';
        container.innerHTML = `
            <div class="guardian-message-backdrop"></div>
            <div class="guardian-message-content">
                <div class="guardian-scroll">
                    <div class="guardian-text"></div>
                </div>
                <button class="guardian-continue-btn">Continue</button>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Add click handler for continue button
        const continueBtn = container.querySelector('.guardian-continue-btn');
        continueBtn.addEventListener('click', () => this.hideMessage());
        
        // Add CSS styles
        this.addGuardianStyles();
    }
    
    addGuardianStyles() {
        if (document.getElementById('guardian-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'guardian-styles';
        style.textContent = `
            .guardian-message-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            
            .guardian-message-container.visible {
                opacity: 1;
                pointer-events: all;
            }
            
            .guardian-message-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .guardian-message-content {
                position: relative;
                max-width: 600px;
                width: 90%;
                padding: 30px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 3px solid #f39c12;
                border-radius: 20px;
                box-shadow: 0 0 30px rgba(243, 156, 18, 0.5);
                animation: guardianAppear 0.5s ease-out;
            }
            
            @keyframes guardianAppear {
                from {
                    transform: scale(0.8) translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }
            
            .guardian-scroll {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(243, 156, 18, 0.3);
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 20px;
                position: relative;
            }
            
            .guardian-scroll::before {
                content: '✨';
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 30px;
                animation: sparkle 2s infinite;
            }
            
            @keyframes sparkle {
                0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
                50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
            }
            
            .guardian-text {
                color: #f39c12;
                font-size: 18px;
                line-height: 1.6;
                text-align: center;
                font-family: 'Georgia', serif;
                text-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
            }
            
            .guardian-continue-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(243, 156, 18, 0.4);
            }
            
            .guardian-continue-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(243, 156, 18, 0.6);
            }
            
            .guardian-continue-btn:active {
                transform: translateY(0);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Listen for battle victory events
        document.addEventListener('battleVictory', (e) => {

            this.handleBattleVictory(e.detail);
        });
        
        // Listen for level up events
        document.addEventListener('levelUp', (e) => {

            // Level up message will be handled in battle victory
        });
        
        // Listen for region change events
        document.addEventListener('regionChange', (e) => {

            // Region change will be handled in battle victory
        });
    }
    
    getCurrentRegion(level) {
        for (const [key, region] of Object.entries(this.regions)) {
            if (level >= region.minLevel && level <= region.maxLevel) {
                return { key, ...region };
            }
        }
        return null;
    }
    
    getPreviousRegion(level) {
        const prevLevel = level - 1;
        return this.getCurrentRegion(prevLevel);
    }
    
    handleBattleVictory(details) {
        const { level, enemy, isFirstBattle, justLeveledUp, previousLevel } = details;
        
        // Get game state for context
        const gameState = window.gameState || {};
        const petName = gameState.monsterName || 'Task Pet';
        
        // Determine message type based on context
        let message = '';
        
        // Check for first battle (onboarding)
        if (isFirstBattle) {
            message = this.messages.mapIntro;
        }
        // Check for milestone levels
        else if (this.messages.milestones[level]) {
            message = this.messages.milestones[level];
        }
        // Check for region transition
        else if (justLeveledUp && previousLevel) {
            const currentRegion = this.getCurrentRegion(level);
            const previousRegion = this.getPreviousRegion(level);
            
            if (currentRegion && previousRegion && currentRegion.key !== previousRegion.key) {
                message = this.messages.regionTransitions[currentRegion.key];
            }
        }
        
        // If no special message, check for level up
        if (!message && justLeveledUp) {
            message = this.getRandomMessage(this.messages.levelUp);
        }
        
        // If still no message, use standard victory
        if (!message) {
            message = this.getRandomMessage(this.messages.standardVictory);
        }
        
        // Replace placeholders
        message = message.replace('{level}', level);
        message = message.replace('{PetName}', petName);
        
        // Show the message
        this.showMessage(message);
    }
    
    getRandomMessage(messageArray) {
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    }
    
    showMessage(message, duration = null) {
        const container = document.getElementById('guardian-message-container');
        if (!container) {
            console.error('[Guardian] Message container not found');
            return;
        }
        
        const textElement = container.querySelector('.guardian-text');
        textElement.textContent = message;
        
        container.classList.remove('hidden');
        container.classList.add('visible');
        
        this.currentMessage = message;
        
        // Auto-hide after duration if specified
        if (duration) {
            setTimeout(() => this.hideMessage(), duration);
        }

    }
    
    hideMessage() {
        const container = document.getElementById('guardian-message-container');
        if (!container) return;
        
        container.classList.remove('visible');
        setTimeout(() => {
            container.classList.add('hidden');
        }, 300);
        
        this.currentMessage = null;

    }
    
    // Onboarding methods
    showWelcome() {
        this.showMessage(this.messages.welcome);
    }
    
    showCoreConcept() {
        this.showMessage(this.messages.coreConcept);
    }
    
    showIntroducePet() {
        this.showMessage(this.messages.introducePet);
    }
    
    showExplainGloom() {
        this.showMessage(this.messages.explainGloom);
    }
    
    showFirstBattle() {
        this.showMessage(this.messages.firstBattle);
    }
    
    showMapIntro() {
        this.showMessage(this.messages.mapIntro);
    }
    
    // Re-engagement
    showReengagement() {
        const message = this.getRandomMessage(this.messages.reengagement);
        this.showMessage(message);
    }
}

// Initialize Guardian Narrator
window.guardianNarrator = new GuardianNarrator();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.guardianNarrator.init();
    });
} else {
    window.guardianNarrator.init();
}
