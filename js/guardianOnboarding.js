/**
 * Guardian Onboarding System
 * 3-step narrative onboarding introducing Task World lore
 * Triggers after original onboarding for first-time users only
 */

class GuardianOnboarding {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: 'Welcome to Task World',
                message: `Welcome, new Task Master! You've just stepped into Task World, a secret realm that thrives on focus and accomplishment. This world is powered by your energy—every task you complete in the real world sends a wave of power here, pushing back the shadows and helping our world flourish.`,
                animation: 'welcome',
                showMap: true
            },
            {
                title: 'The Journey Ahead',
                message: `This map shows your journey ahead. As you complete more tasks and level up, your Task Pet will travel from the peaceful village all the way to the Castle of Accomplishment. Each region brings new challenges and rewards!`,
                animation: 'journey',
                showMap: true,
                showMonsterOnMap: true
            },
            {
                title: 'The Gloom',
                message: `But Task World is in trouble. A shadowy force called The Gloom is spreading, creating mischievous monsters from everyday challenges. Your Task Pet is our champion against them! Every victory helps reclaim our world from The Gloom. Are you ready?`,
                animation: 'gloom',
                showMap: true,
                isLastStep: true
            }
        ];

    }
    
    /**
     * Check if onboarding should be shown
     */
    static shouldShow() {
        // Only show for first-time users who haven't seen Guardian onboarding
        const guardianOnboardingCompleted = localStorage.getItem('guardianOnboardingCompleted') === 'true';
        const hasChosenMonster = localStorage.getItem('hasChosenMonster') === 'true';
        
        return hasChosenMonster && !guardianOnboardingCompleted;
    }
    
    /**
     * Start Guardian onboarding
     */
    start() {

        this.currentStep = 0;
        this.showStep(0);
    }
    
    /**
     * Show a specific step
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.complete();
            return;
        }
        
        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;
        
        // Create overlay
        let overlay = document.getElementById('guardianOnboardingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'guardianOnboardingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10005;
                animation: fadeIn 0.5s ease;
                overflow-y: auto;
                padding: 20px 0;
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.innerHTML = '';
        }
        
        // Create content container
        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 700px;
            width: 90%;
            text-align: center;
            animation: scaleIn 0.5s ease;
            margin: auto;
        `;
        
        // Show map
        if (step.showMap) {
            const mapContainer = document.createElement('div');
            mapContainer.style.cssText = `
                position: relative;
                width: 100%;
                max-width: 800px;
                margin: 0 auto 24px;
            `;
            
            const mapImg = document.createElement('img');
            mapImg.src = 'assets/task_world_map.png';
            mapImg.alt = 'Task World Map';
            mapImg.style.cssText = `
                width: 100%;
                height: auto;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                border: 3px solid rgba(255, 255, 255, 0.3);
            `;
            mapContainer.appendChild(mapImg);
            
            // Add monster sprite on map for journey step
            if (step.showMonsterOnMap) {
                const monsterSprite = document.createElement('img');
                monsterSprite.src = 'assets/Pink_Monster.png';
                monsterSprite.alt = 'Your Task Pet';
                monsterSprite.style.cssText = `
                    position: absolute;
                    bottom: 15%;
                    left: 12%;
                    width: 48px;
                    height: 48px;
                    image-rendering: pixelated;
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
                    animation: bounce 2s ease-in-out infinite;
                `;
                mapContainer.appendChild(monsterSprite);
            }
            
            container.appendChild(mapContainer);
        }
        
        // Message box
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
            padding: 20px;
            border-radius: 12px;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(102, 126, 234, 0.6);
            margin-bottom: 20px;
        `;
        
        messageBox.innerHTML = `
            <h2 style="color: white; font-size: 22px; margin: 0 0 12px 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${step.title}
            </h2>
            <p style="color: white; font-size: 15px; line-height: 1.6; margin: 0; font-weight: 400; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                ${step.message}
            </p>
        `;
        
        container.appendChild(messageBox);
        
        // Navigation buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 16px;
            justify-content: center;
            align-items: center;
        `;
        
        // Back button (not on first step)
        if (stepIndex > 0) {
            const backBtn = document.createElement('button');
            backBtn.textContent = '← Back';
            backBtn.style.cssText = `
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.2s;
            `;
            backBtn.addEventListener('click', () => this.showStep(stepIndex - 1));
            backBtn.addEventListener('mouseenter', () => {
                backBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                backBtn.style.transform = 'scale(1.05)';
            });
            backBtn.addEventListener('mouseleave', () => {
                backBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                backBtn.style.transform = 'scale(1)';
            });
            buttonContainer.appendChild(backBtn);
        }
        
        // Next/Start button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = step.isLastStep ? 'Begin Your Journey! 🚀' : 'Continue →';
        nextBtn.style.cssText = `
            padding: 12px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 700;
            transition: all 0.2s;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
        `;
        nextBtn.addEventListener('click', () => this.showStep(stepIndex + 1));
        nextBtn.addEventListener('mouseenter', () => {
            nextBtn.style.transform = 'scale(1.05) translateY(-2px)';
            nextBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });
        nextBtn.addEventListener('mouseleave', () => {
            nextBtn.style.transform = 'scale(1) translateY(0)';
            nextBtn.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
        });
        buttonContainer.appendChild(nextBtn);
        
        container.appendChild(buttonContainer);
        
        // Progress indicator
        const progressIndicator = document.createElement('div');
        progressIndicator.style.cssText = `
            margin-top: 24px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        `;
        progressIndicator.textContent = `Step ${stepIndex + 1} of ${this.steps.length}`;
        container.appendChild(progressIndicator);
        
        // Skip button
        const skipBtn = document.createElement('button');
        skipBtn.textContent = 'Skip Tutorial';
        skipBtn.style.cssText = `
            margin-top: 16px;
            padding: 8px 16px;
            background: transparent;
            color: rgba(255, 255, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        `;
        skipBtn.addEventListener('click', () => {
            if (confirm('Skip the Guardian tutorial? You can always learn as you go!')) {
                overlay.remove();
                this.complete();
            }
        });
        skipBtn.addEventListener('mouseenter', () => {
            skipBtn.style.color = 'rgba(255, 255, 255, 0.8)';
            skipBtn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });
        skipBtn.addEventListener('mouseleave', () => {
            skipBtn.style.color = 'rgba(255, 255, 255, 0.5)';
            skipBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        container.appendChild(skipBtn);
        
        overlay.appendChild(container);
        
        // Add animations if not already present
        if (!document.getElementById('guardianOnboardingAnimations')) {
            const style = document.createElement('style');
            style.id = 'guardianOnboardingAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Complete Guardian onboarding
     */
    complete() {
        localStorage.setItem('guardianOnboardingCompleted', 'true');

        // Remove overlay
        const overlay = document.getElementById('guardianOnboardingOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('🗺️ Welcome to Task World! Your adventure begins!', 'success');
        }
        
        // Continue with normal onboarding flow
        // The simpleOnboarding will handle the rest
        if (window.simpleOnboarding && window.simpleOnboarding.shouldShow && window.simpleOnboarding.shouldShow()) {
            setTimeout(() => {
                window.simpleOnboarding.start();
            }, 500);
        }
    }
}

// Initialize global Guardian onboarding
window.guardianOnboarding = new GuardianOnboarding();

// Auto-start after original onboarding completes
window.addEventListener('load', () => {
    setTimeout(() => {
        if (GuardianOnboarding.shouldShow()) {
            // Wait for original onboarding to complete
            const checkInterval = setInterval(() => {
                const onboardingOverlay = document.getElementById('onboardingOverlay');
                const isHidden = !onboardingOverlay || onboardingOverlay.classList.contains('hidden');
                
                if (isHidden) {
                    clearInterval(checkInterval);
                    setTimeout(() => {
                        window.guardianOnboarding.start();
                    }, 500);
                }
            }, 500);
            
            // Timeout after 30 seconds
            setTimeout(() => clearInterval(checkInterval), 30000);
        }
    }, 1000);
});
