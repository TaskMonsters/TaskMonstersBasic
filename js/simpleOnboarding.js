// ===================================
// SIMPLE MODAL-BASED ONBOARDING
// ===================================
// Clear, focused modals shown AFTER monster selection, BEFORE main app
// Emphasizes gamification and engagement features

class SimpleOnboarding {
    constructor() {
        this.currentPage = 0;
        this.pages = [
            {
                icon: '🎮',
                title: 'Welcome to Task Monsters!',
                content: 'Turn your to-do list into an adventure! Complete tasks to level up your monster and grow stronger!',
                highlight: 'Gamification makes boring tasks fun! 🧠✨'
            },
            {
                icon: '📝',
                title: 'Regular Tasks',
                content: 'Create detailed tasks with due dates, priorities, and categories. Great for important deadlines and complex projects.',
                highlight: 'Find the "+ Add" button under "Your Tasks" to create one!'
            },
            {
                icon: '⚡',
                title: 'Quick Tasks',
                content: 'Need something fast? Quick tasks are pre-made and ready to go! Perfect for small to-dos when you don\'t want to overthink it.',
                highlight: 'Less decision fatigue, more action! 🚀'
            },
            {
                icon: '🎯',
                title: 'Why This Works',
                content: '✅ Instant feedback (XP, loot)\n✅ Visual progress (levels, HP gauge)\n✅ Variety (different tasks, challenges)\n✅ Rewards (makes tasks feel worth it!)',
                useList: true,
                highlight: 'Your brain will LOVE the instant rewards! 🎉'
            },
            {
                icon: '🚀',
                title: 'Ready to Start!',
                content: 'Remember: Every task you complete makes you stronger. Small wins add up to big victories!',
                highlight: 'You got this! Let\'s turn tasks into triumphs! 💪'
            }
        ];
    }

    // Check if onboarding should be shown
    static shouldShow() {
        const hasChosenMonster = localStorage.getItem('hasChosenMonster') === 'true';
        const onboardingCompleted = localStorage.getItem('simpleOnboardingCompleted') === 'true';
        return hasChosenMonster && !onboardingCompleted;
    }

    // Start onboarding
    start() {

        this.currentPage = 0;
        this.showPage(0);
    }

    // Show a specific page
    showPage(pageIndex) {
        if (pageIndex >= this.pages.length) {
            this.complete();
            return;
        }

        const page = this.pages[pageIndex];
        this.currentPage = pageIndex;

        // Get or create overlay (reuse existing to prevent flicker)
        let overlay = document.getElementById('simpleOnboardingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'simpleOnboardingOverlay';
        } else {
            // Clear existing content
            overlay.innerHTML = '';
        }
        // Only set styles if overlay is newly created
        if (!overlay.style.position) {
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10003;
            `;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #667eea;
            border-radius: 20px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
            animation: scaleIn 0.3s ease-out;
            color: white;
            text-align: center;
        `;

        // Page indicator
        const pageIndicator = document.createElement('div');
        pageIndicator.textContent = `${pageIndex + 1} / ${this.pages.length}`;
        pageIndicator.style.cssText = `
            font-size: 13px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 2px;
        `;

        // Icon
        const icon = document.createElement('div');
        icon.textContent = page.icon;
        icon.style.cssText = `
            font-size: 64px;
            margin-bottom: 16px;
            animation: bounce 1s ease-in-out;
        `;

        // Title
        const title = document.createElement('h2');
        title.textContent = page.title;
        title.style.cssText = `
            font-size: 28px;
            margin: 0 0 16px 0;
            color: #667eea;
            font-weight: 700;
        `;

        // Content
        const content = document.createElement('div');
        if (page.useList) {
            // Create proper list with aligned checkmarks
            const items = page.content.split('\n');
            content.innerHTML = items.map(item => `
                <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 20px; line-height: 1.7; flex-shrink: 0;">✅</span>
                    <span style="font-size: 17px; line-height: 1.7; color: rgba(255, 255, 255, 0.9); text-align: left;">${item.replace('✅ ', '')}</span>
                </div>
            `).join('');
            content.style.cssText = `
                margin: 0 0 16px 0;
                display: flex;
                flex-direction: column;
                align-items: center;
            `;
        } else {
            content.textContent = page.content;
            content.style.cssText = `
                font-size: 17px;
                line-height: 1.7;
                margin: 0 0 16px 0;
                color: rgba(255, 255, 255, 0.9);
                white-space: pre-line;
            `;
        }

        // Highlight box
        const highlight = document.createElement('div');
        highlight.textContent = page.highlight;
        highlight.style.cssText = `
            background: rgba(102, 126, 234, 0.2);
            border: 2px solid rgba(102, 126, 234, 0.5);
            border-radius: 12px;
            padding: 14px;
            margin: 16px 0 24px 0;
            font-size: 15px;
            line-height: 1.6;
            color: #a8b5ff;
            font-weight: 600;
        `;

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        // Back button (if not first page)
        if (pageIndex > 0) {
            const backButton = document.createElement('button');
            backButton.textContent = '← Back';
            backButton.style.cssText = `
                padding: 14px 28px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            backButton.onmouseover = () => {
                backButton.style.background = 'rgba(255, 255, 255, 0.2)';
                backButton.style.transform = 'translateY(-2px)';
            };
            backButton.onmouseout = () => {
                backButton.style.background = 'rgba(255, 255, 255, 0.1)';
                backButton.style.transform = 'translateY(0)';
            };
            backButton.onclick = () => {
                // Show previous page (overlay will be reused)
                this.showPage(pageIndex - 1);
            };
            buttonsContainer.appendChild(backButton);
        }

        // Next/Start button
        const nextButton = document.createElement('button');
        nextButton.textContent = pageIndex === this.pages.length - 1 ? 'Start Your Journey! 🚀' : 'Next →';
        nextButton.style.cssText = `
            padding: 14px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.2s ease;
            flex: 1;
        `;
        nextButton.onmouseover = () => {
            nextButton.style.transform = 'translateY(-2px)';
            nextButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        };
        nextButton.onmouseout = () => {
            nextButton.style.transform = 'translateY(0)';
            nextButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        };
        nextButton.onclick = () => {
            // Show next page (overlay will be reused)
            this.showPage(pageIndex + 1);
        };
        buttonsContainer.appendChild(nextButton);

        // Skip button (on all pages)
        let skipButton;
        if (true) {  // Show on all pages
            skipButton = document.createElement('button');
            skipButton.textContent = 'Skip Tutorial';
            skipButton.style.cssText = `
                width: 100%;
                padding: 10px;
                background: transparent;
                color: rgba(255, 255, 255, 0.5);
                border: none;
                font-size: 13px;
                cursor: pointer;
                text-decoration: underline;
                margin-top: 12px;
            `;
            skipButton.onmouseover = () => {
                skipButton.style.color = 'rgba(255, 255, 255, 0.8)';
            };
            skipButton.onmouseout = () => {
                skipButton.style.color = 'rgba(255, 255, 255, 0.5)';
            };
            skipButton.onclick = () => {
                if (confirm('Skip the tutorial? You can always learn as you go!')) {
                    // Remove modal and complete onboarding
                    overlay.remove();
                    this.complete();
                }
            };
        }

        // Assemble modal
        modal.appendChild(pageIndicator);
        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(content);
        modal.appendChild(highlight);
        modal.appendChild(buttonsContainer);
        if (skipButton) {
            modal.appendChild(skipButton);
        }

        overlay.appendChild(modal);
        
        // Only append overlay if it's not already in the DOM
        if (!overlay.parentElement) {
            document.body.appendChild(overlay);
        }

        // Add animations if not already present
        if (!document.getElementById('simpleOnboardingAnimations')) {
            const style = document.createElement('style');
            style.id = 'simpleOnboardingAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
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

    // Complete onboarding
    complete() {
        localStorage.setItem('simpleOnboardingCompleted', 'true');

        // Remove overlay now that onboarding is complete
        const overlay = document.getElementById('simpleOnboardingOverlay');
        if (overlay) {
            overlay.remove();
        }

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('🎉 Welcome aboard! Time to conquer some tasks!', 'success');
        }

        // --- NEW: Show Name/Email Modal ---
        if (typeof window.nameEmailModal !== 'undefined') {
            window.nameEmailModal.show();
        }
        // -----------------------------------
        
        // Start mood tracker scheduling now that tutorial is complete
        if (typeof MoodDialogueSystem !== 'undefined' && MoodDialogueSystem.startMoodTrackerSchedule) {

            MoodDialogueSystem.startMoodTrackerSchedule();
        }
    }
}

// Initialize global simple onboarding
window.simpleOnboarding = new SimpleOnboarding();

// Auto-start after monster selection
// NOTE: This is now handled by appInitializer.js to prevent conflicts with quest giver onboarding
// The onboarding will show after:
// 1. Monster selection onboarding completes
// 2. Quest giver onboarding completes (if quest giver is due)
// 3. Main app is visible

window.addEventListener('load', () => {
    setTimeout(() => {
        if (SimpleOnboarding.shouldShow()) {
            // Wait for original onboarding to complete
            const checkInterval = setInterval(() => {
                const onboardingOverlay = document.getElementById('onboardingOverlay');
                const isHidden = !onboardingOverlay || onboardingOverlay.classList.contains('hidden');
                
                // Also check that quest giver onboarding is not active
                const questGiverOnboardingOverlay = document.getElementById('questGiverOnboardingOverlay');
                const questGiverOnboardingHidden = !questGiverOnboardingOverlay;
                
                // Also check that quest giver UI is not active
                const questGiverUI = document.getElementById('questGiverUI');
                const questGiverUIHidden = !questGiverUI || questGiverUI.classList.contains('hidden');
                
                if (isHidden && questGiverOnboardingHidden && questGiverUIHidden) {
                    clearInterval(checkInterval);
                    setTimeout(() => {
                        window.simpleOnboarding.start();
                    }, 500);
                }
            }, 500);

            // Timeout after 30 seconds (increased to account for quest giver flow)
            setTimeout(() => clearInterval(checkInterval), 30000);
        }
    }, 1000);
});
