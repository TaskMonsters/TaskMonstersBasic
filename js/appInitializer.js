/**
 * App Initializer
 * Manages the correct initialization flow for Task Monsters app
 */

class AppInitializer {
    constructor() {
        this.isFirstTime = false;
        this.questGiverDue = false;
        this.initialized = false;
    }
    
    /**
     * Main initialization method
     * Coordinates the entire app startup sequence
     */
    async initialize() {
        if (this.initialized) {
            console.warn('[AppInit] Already initialized');
            return;
        }

        try {
            // 1. Load game state first
            if (window.loadGameState) {
                window.loadGameState();
            }
            
            // 2. Check if this is first time user
            this.isFirstTime = !localStorage.getItem('hasChosenMonster') || 
                               localStorage.getItem('hasChosenMonster') !== 'true';

            // 4. Wait for loading screen to complete (3 seconds)
            await this.waitForLoadingScreen();
            
            // 5. Show appropriate flow based on state
            if (this.isFirstTime) {
                await this.showOnboardingFlow();
            } else {
                // Returning users go straight to main app
                // Quest giver will appear naturally when triggered
                this.showMainApp();
            }
            
            this.initialized = true;

        } catch (error) {
            console.error('[AppInit] Error during initialization:', error);
            // Fallback: just show the main app
            this.showMainApp();
        }
    }
    
    /**
     * Wait for loading screen to finish
     */
    waitForLoadingScreen() {
        return new Promise(resolve => {

            setTimeout(() => {

                resolve();
            }, 3100); // 3000ms loading screen + 100ms buffer
        });
    }
    
    /**
     * Show onboarding flow for first-time users
     */
    async showOnboardingFlow() {

        // CRITICAL: Make main app visible so onboarding overlay can be seen
        document.documentElement.style.visibility = 'visible';
        document.body.style.visibility = 'visible';
        
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Show onboarding overlay
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex'; // Force display

        } else {
            console.error('[AppInit] Onboarding overlay not found');
            this.showMainApp();
            return;
        }
        
        // Wait for user to complete onboarding
        await this.waitForOnboardingComplete();

        // After onboarding, go straight to main app
        // Quest giver will appear naturally when triggered by task completion
        this.showMainApp();
    }
    
    /**
     * Wait for onboarding to be completed
     */
    waitForOnboardingComplete() {
        return new Promise(resolve => {

            // Poll for onboarding completion
            const checkInterval = setInterval(() => {
                const hasChosen = localStorage.getItem('hasChosenMonster');
                if (hasChosen === 'true') {
                    clearInterval(checkInterval);

                    resolve();
                }
            }, 100);
            
            // Timeout after 5 minutes (user might have left)
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('[AppInit] Onboarding timeout - showing main app anyway');
                resolve();
            }, 300000);
        });
    }
    
    /**
     * Show quest giver flow
     */
    async showQuestGiverFlow() {

        // CRITICAL: Make main app visible
        document.documentElement.style.visibility = 'visible';
        
        // Check if quest giver onboarding should be shown first
        if (window.questGiverOnboarding && window.QuestGiverOnboarding && window.QuestGiverOnboarding.shouldShow()) {

            window.questGiverOnboarding.start();
            
            // Wait for quest giver onboarding to complete
            await this.waitForQuestGiverOnboardingComplete();

        }
        
        // Show quest giver modal (the prompt asking if user wants a quest)
        if (window.questGiver) {
            window.questGiver.show();

        } else {
            console.error('[AppInit] Quest giver not available');
            this.showMainApp();
        }
        
        // Note: Quest giver will handle:
        // - Showing the quest UI when user clicks "Yes"
        // - Revealing main app when dismissed or "No" is clicked
    }
    
    /**
     * Wait for quest giver onboarding to be completed
     */
    waitForQuestGiverOnboardingComplete() {
        return new Promise(resolve => {

            // Poll for quest giver onboarding completion
            const checkInterval = setInterval(() => {
                const completed = localStorage.getItem('questGiverOnboardingCompleted');
                if (completed === 'true') {
                    clearInterval(checkInterval);

                    resolve();
                }
            }, 100);
            
            // Timeout after 2 minutes
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('[AppInit] Quest giver onboarding timeout - proceeding anyway');
                resolve();
            }, 120000);
        });
    }
    
    /**
     * Show main app (final step)
     */
    showMainApp() {

        // Reveal the main app UI
        document.documentElement.style.visibility = 'visible';
        
        // Initialize skins manager to ensure monster is visible
        if (window.skinsManager) {
            window.skinsManager.init();
            // Force a second update after a short delay to ensure DOM is fully settled
            setTimeout(() => window.skinsManager.updateAllMonsterVisuals(), 500);
        }
        
        // Generate daily challenge if not already done
        if (window.generateDailyChallenge) {
            window.generateDailyChallenge();
        }

    }
    
    /**
     * Reset initialization state (for testing/debugging)
     */
    reset() {
        this.initialized = false;
        this.isFirstTime = false;
        this.questGiverDue = false;

    }
}

// Create global instance
window.appInitializer = new AppInitializer();

// Export for debugging
window.resetAppInitializer = () => {
    window.appInitializer.reset();

};
