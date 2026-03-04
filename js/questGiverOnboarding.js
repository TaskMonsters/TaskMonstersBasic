// ===================================
// QUEST GIVER ONBOARDING
// ===================================
// Shows onboarding for quest giver mode on first trigger

class QuestGiverOnboarding {
    constructor() {
        this.currentPage = 0;
        this.pages = [
            {
                icon: '🦅',
                title: 'Meet Your Quest Giver!',
                content: 'A mysterious crow has appeared! This magical bird will offer you special quests and challenges.',
                highlight: 'Quest Giver appears every 5 minutes when you\'re ready for a new adventure! 🎯'
            },
            {
                icon: '📜',
                title: 'Quests & Quizzes',
                content: 'The crow offers two types of encounters:\n\n🎯 Quests - Complete specific tasks for bonus rewards\n🧠 Quizzes - Test your knowledge for instant XP',
                highlight: 'Both give you extra XP and help you level up faster!'
            },
            {
                icon: '⏰',
                title: 'Time-Limited Challenges',
                content: 'Some quests have time limits! Complete them before they expire to earn your rewards.',
                highlight: 'Don\'t worry - you can always decline if you\'re not ready! 😊'
            },
            {
                icon: '✨',
                title: 'Ready for Your First Quest?',
                content: 'The crow is waiting with your first challenge. Accept it to earn bonus XP and rewards!',
                highlight: 'Let\'s see what adventure awaits! 🚀'
            }
        ];
    }

    // Check if quest giver onboarding should be shown
    static shouldShow() {
        const questGiverOnboardingCompleted = localStorage.getItem('questGiverOnboardingCompleted') === 'true';
        return !questGiverOnboardingCompleted;
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
        let overlay = document.getElementById('questGiverOnboardingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'questGiverOnboardingOverlay';
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
                z-index: 10004;
            `;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #f59e0b;
            border-radius: 20px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 0 40px rgba(245, 158, 11, 0.5);
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
            color: #f59e0b;
            font-weight: 700;
        `;

        // Content
        const content = document.createElement('div');
        content.textContent = page.content;
        content.style.cssText = `
            font-size: 17px;
            line-height: 1.7;
            margin: 0 0 16px 0;
            color: rgba(255, 255, 255, 0.9);
            white-space: pre-line;
        `;

        // Highlight box
        const highlight = document.createElement('div');
        highlight.textContent = page.highlight;
        highlight.style.cssText = `
            background: rgba(245, 158, 11, 0.2);
            border: 2px solid rgba(245, 158, 11, 0.5);
            border-radius: 12px;
            padding: 14px;
            margin: 16px 0 24px 0;
            font-size: 15px;
            line-height: 1.6;
            color: #fbbf24;
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
        nextButton.textContent = pageIndex === this.pages.length - 1 ? 'Meet the Crow! 🦅' : 'Next →';
        nextButton.style.cssText = `
            padding: 14px 28px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
            transition: all 0.2s ease;
            flex: 1;
        `;
        nextButton.onmouseover = () => {
            nextButton.style.transform = 'translateY(-2px)';
            nextButton.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
        };
        nextButton.onmouseout = () => {
            nextButton.style.transform = 'translateY(0)';
            nextButton.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
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
                if (confirm('Skip the quest giver tutorial? You can always learn as you go!')) {
                    // Complete onboarding (will remove overlay)
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
        if (!document.getElementById('questGiverOnboardingAnimations')) {
            const style = document.createElement('style');
            style.id = 'questGiverOnboardingAnimations';
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
        localStorage.setItem('questGiverOnboardingCompleted', 'true');

        // Remove overlay now that onboarding is complete
        const overlay = document.getElementById('questGiverOnboardingOverlay');
        if (overlay) {
            overlay.remove();
        }

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('🦅 Quest Giver unlocked! Watch for the crow!', 'success');
        }
    }
}

// Initialize global quest giver onboarding
window.questGiverOnboarding = new QuestGiverOnboarding();
