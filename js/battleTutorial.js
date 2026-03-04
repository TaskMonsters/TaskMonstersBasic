// ===================================
// BATTLE MODE TUTORIAL
// ===================================
// Modal-based tutorial explaining battle rules
// Triggers only on first battle

class BattleTutorial {
    constructor() {
        this.tutorialPages = [
            {
                title: '⚔️ Battle Mode!',
                content: 'You\'ve triggered a random battle! Let\'s learn how to fight.',
                icon: '⚔️'
            },
            {
                title: '🎯 Your Goal',
                content: 'Reduce the enemy\'s HP to 0 before they defeat you!',
                icon: '🎯'
            },
            {
                title: '⚡ Attack Gauge',
                content: 'Build up your Attack Gauge to 100 to use special attacks like Fireball or Freeze!',
                icon: '⚡'
            },
            {
                title: '🛡️ Defense Gauge',
                content: 'Build up your Defense Gauge to 100 to use defensive abilities like Defend or Heal!',
                icon: '🛡️'
            },
            {
                title: '💊 Items',
                content: 'Use potions to restore HP, or special items like Invisibility Cloak to dodge attacks!',
                icon: '💊'
            },
            {
                title: '🎁 Rewards',
                content: 'Win battles to earn XP and loot drops (potions, special items)!',
                icon: '🎁'
            },
            {
                title: '💡 Strategy Tip',
                content: 'Regular attacks build gauges. Save special attacks for when you really need them!',
                icon: '💡'
            },
            {
                title: '🚀 Ready to Fight!',
                content: 'Good luck! Remember: completing tasks makes you stronger!',
                icon: '🚀'
            }
        ];
        
        this.currentPage = 0;
    }

    // Check if battle tutorial should be shown
    static shouldShowTutorial() {
        const tutorialCompleted = localStorage.getItem('battleTutorialCompleted') === 'true';
        return !tutorialCompleted;
    }

    // Show the battle tutorial
    show() {

        this.currentPage = 0;
        this.showPage(0);
    }

    // Show a specific page
    showPage(pageIndex) {
        if (pageIndex >= this.tutorialPages.length) {
            this.complete();
            return;
        }

        const page = this.tutorialPages[pageIndex];
        this.currentPage = pageIndex;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'battleTutorialOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10002;
            animation: fadeIn 0.3s ease-out;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #667eea;
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 85%;
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
            animation: scaleIn 0.3s ease-out;
            color: white;
            text-align: center;
        `;

        // Page indicator
        const pageIndicator = document.createElement('div');
        pageIndicator.textContent = `${pageIndex + 1} / ${this.tutorialPages.length}`;
        pageIndicator.style.cssText = `
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 12px;
        `;

        // Icon
        const icon = document.createElement('div');
        icon.textContent = page.icon;
        icon.style.cssText = `
            font-size: 48px;
            margin-bottom: 12px;
        `;

        // Title
        const title = document.createElement('h2');
        title.textContent = page.title;
        title.style.cssText = `
            font-size: 24px;
            margin: 0 0 12px 0;
            color: #667eea;
        `;

        // Content
        const content = document.createElement('p');
        content.textContent = page.content;
        content.style.cssText = `
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
            color: rgba(255, 255, 255, 0.9);
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
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            backButton.onmouseover = () => {
                backButton.style.background = 'rgba(255, 255, 255, 0.2)';
            };
            backButton.onmouseout = () => {
                backButton.style.background = 'rgba(255, 255, 255, 0.1)';
            };
            backButton.onclick = () => {
                overlay.remove();
                this.showPage(pageIndex - 1);
            };
            buttonsContainer.appendChild(backButton);
        }

        // Next/Start button
        const nextButton = document.createElement('button');
        nextButton.textContent = pageIndex === this.tutorialPages.length - 1 ? 'Start Battle! 🚀' : 'Next →';
        nextButton.style.cssText = `
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.2s ease;
            flex: 1;
        `;
        nextButton.onmouseover = () => {
            nextButton.style.transform = 'translateY(-2px)';
            nextButton.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
        };
        nextButton.onmouseout = () => {
            nextButton.style.transform = 'translateY(0)';
            nextButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
        };
        nextButton.onclick = () => {
            overlay.remove();
            this.showPage(pageIndex + 1);
        };
        buttonsContainer.appendChild(nextButton);

        // Skip button (only on first page)
        if (pageIndex === 0) {
            const skipButton = document.createElement('button');
            skipButton.textContent = 'Skip Tutorial';
            skipButton.style.cssText = `
                width: 100%;
                padding: 8px;
                background: transparent;
                color: rgba(255, 255, 255, 0.5);
                border: none;
                font-size: 12px;
                cursor: pointer;
                text-decoration: underline;
                margin-top: 8px;
            `;
            skipButton.onmouseover = () => {
                skipButton.style.color = 'rgba(255, 255, 255, 0.8)';
            };
            skipButton.onmouseout = () => {
                skipButton.style.color = 'rgba(255, 255, 255, 0.5)';
            };
            skipButton.onclick = () => {
                if (confirm('Skip the battle tutorial? You can always learn as you fight!')) {
                    overlay.remove();
                    this.complete();
                }
            };
            modal.appendChild(pageIndicator);
            modal.appendChild(icon);
            modal.appendChild(title);
            modal.appendChild(content);
            modal.appendChild(buttonsContainer);
            modal.appendChild(skipButton);
        } else {
            modal.appendChild(pageIndicator);
            modal.appendChild(icon);
            modal.appendChild(title);
            modal.appendChild(content);
            modal.appendChild(buttonsContainer);
        }

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add animations if not already present
        if (!document.getElementById('battleTutorialAnimations')) {
            const style = document.createElement('style');
            style.id = 'battleTutorialAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Complete tutorial
    complete() {
        // Mark battle tutorial as completed
        localStorage.setItem('battleTutorialCompleted', 'true');

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('⚔️ Battle tutorial complete! Good luck!', 'success');
        }
    }
}

// Initialize global battle tutorial
window.battleTutorial = new BattleTutorial();
