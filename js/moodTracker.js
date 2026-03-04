/**
 * Mood Tracker System - Tooltip Style
 * Displays a speech bubble tooltip for users to track their mood with emoji buttons
 * Appears every hour and can be triggered by tapping the monster
 * Saves mood history to localStorage and displays on Habits page with filters
 */

class MoodTracker {
    constructor() {
        this.moods = [
            { emoji: '😊', name: 'Happy', value: 'happy' },
            { emoji: '😢', name: 'Sad', value: 'sad' },
            { emoji: '🫤', name: 'Meh', value: 'meh' },
            { emoji: '😡', name: 'Angry', value: 'angry' }
        ];
        
        this.autoPopupInterval = 60 * 60 * 1000; // 1 hour
        this.lastPopupTime = null;
        this.intervalId = null;
        
        this.init();
    }
    
    init() {

        // Create tooltip HTML
        this.createTooltip();
        
        // Add monster click listener
        this.addMonsterClickListener();
        
        // Start auto-popup timer
        this.startAutoPopup();
        
        // Load last popup time from localStorage
        const saved = localStorage.getItem('moodTrackerLastPopup');
        if (saved) {
            this.lastPopupTime = parseInt(saved);
        }

    }
    
    createTooltip() {
        // Check if tooltip already exists
        if (document.getElementById('moodTrackerTooltip')) {

            return;
        }
        
        const tooltipHTML = `
            <div id="moodTrackerTooltip" style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                margin-bottom: 5px;
                background-color: #2a2a3e;
                border: 2px solid #8b5cf6;
                border-radius: 17px;
                padding: 13px 16px;
                max-width: 240px;
                min-width: 187px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.4);
                opacity: 0;
                display: none;
                transition: opacity 0.3s ease, transform 0.3s ease;
                transform-origin: bottom center;
                z-index: 10000;
                word-wrap: break-word;
                overflow-wrap: break-word;
            ">

                
                <!-- Close Button -->
                <button id="moodTrackerCloseBtn" style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: transparent;
                    border: none;
                    color: #ffffff;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                    transition: color 0.2s;
                " onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#ccc'">×</button>
                
                <!-- Title -->
                <h3 style="
                    color: #ffffff;
                    text-align: center;
                    margin: 0 0 10px 0;
                    font-size: 12px;
                    font-weight: 600;
                ">How are you feeling?</h3>
                
                <!-- Emoji Buttons -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 7px;
                    margin-bottom: 10px;
                ">
                    ${this.moods.map(mood => `
                        <button class="mood-btn-tooltip" data-mood="${mood.value}" style="
                            background: rgba(255, 255, 255, 0.1);
                            border: 2px solid rgba(139, 92, 246, 0.3);
                            border-radius: 8px;
                            padding: 8px 5px;
                            font-size: 21px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 4px;
                        " onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.borderColor='#8b5cf6'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(139, 92, 246, 0.3)'; this.style.transform='scale(1)'">
                            <span>${mood.emoji}</span>
                            <span style="font-size: 7px; color: #ccc;">${mood.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Optional Note -->
                <textarea id="moodNoteTooltip" placeholder="Add a note (optional)..." style="
                    width: 100%;
                    min-height: 40px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(139, 92, 246, 0.3);
                    border-radius: 8px;
                    padding: 7px;
                    color: #ffffff;
                    font-size: 9px;
                    resize: vertical;
                    font-family: inherit;
                    box-sizing: border-box;
                "></textarea>
            </div>
        `;
        
        // Find monster container and append tooltip
        const monsterContainer = document.querySelector('.monster-container');
        if (monsterContainer) {
            monsterContainer.insertAdjacentHTML('beforeend', tooltipHTML);
            
            // Add event listeners
            document.getElementById('moodTrackerCloseBtn').addEventListener('click', () => this.hideTooltip());
            
            // Add mood button listeners
            document.querySelectorAll('.mood-btn-tooltip').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mood = e.currentTarget.dataset.mood;
                    this.saveMood(mood);
                });
            });

        } else {
            console.warn('[MoodTracker] Monster container not found, retrying in 1s');
            setTimeout(() => this.createTooltip(), 1000);
        }
    }
    
    showTooltip() {

        const tooltip = document.getElementById('moodTrackerTooltip');
        if (tooltip) {
            tooltip.style.display = 'block';
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) scale(1)';
            }, 10);
            
            // Clear previous note
            const noteField = document.getElementById('moodNoteTooltip');
            if (noteField) {
                noteField.value = '';
            }
            
            // Update last popup time
            this.lastPopupTime = Date.now();
            localStorage.setItem('moodTrackerLastPopup', this.lastPopupTime.toString());
        }
    }
    
    hideTooltip() {

        const tooltip = document.getElementById('moodTrackerTooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateX(-50%) scale(0.95)';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 300);
        }
    }
    
    saveMood(moodValue) {

        const note = document.getElementById('moodNoteTooltip')?.value || '';
        const moodData = this.moods.find(m => m.value === moodValue);
        
        const entry = {
            mood: moodValue,
            emoji: moodData.emoji,
            name: moodData.name,
            note: note,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        // Get existing moods
        const moods = this.getMoodHistory();
        moods.unshift(entry); // Add to beginning
        
        // Keep only last 100 entries
        if (moods.length > 100) {
            moods.length = 100;
        }
        
        // Save to localStorage
        localStorage.setItem('moodHistory', JSON.stringify(moods));
        
        // Hide tooltip
        this.hideTooltip();
        
        // Trigger mood history update on Habits page
        if (typeof window.updateMoodHistoryDisplay === 'function') {
            window.updateMoodHistoryDisplay();
        }
        
        // Play monster animation based on mood
        this.playMoodAnimation(moodValue);
        
        // Show confirmation message
        this.showConfirmation(moodData.emoji, moodData.name);

    }
    
    showConfirmation(emoji, name) {
        // Show a brief confirmation message
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(167, 139, 250, 0.95) 100%);
            color: #fff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 15px;
            z-index: 10001;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            animation: slideDown 0.3s ease-out;
            font-weight: 500;
        `;
        confirmation.textContent = `${emoji} Mood tracked: ${name}`;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => confirmation.remove(), 300);
        }, 2000);
    }
    
    getMoodHistory() {
        const saved = localStorage.getItem('moodHistory');
        return saved ? JSON.parse(saved) : [];
    }
    
    addMonsterClickListener() {
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            mainHeroSprite.style.cursor = 'pointer';
            mainHeroSprite.addEventListener('click', () => {

                this.showTooltip();
            });

        } else {
            console.warn('[MoodTracker] mainHeroSprite not found, retrying in 1s');
            setTimeout(() => this.addMonsterClickListener(), 1000);
        }
    }
    
    startAutoPopup() {

        // Clear existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Set up interval
        this.intervalId = setInterval(() => {

            this.showTooltip();
        }, this.autoPopupInterval);
    }
    
    stopAutoPopup() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;

        }
    }
    
    playMoodAnimation(moodValue) {

        const sprite = document.getElementById('mainHeroSprite');
        if (!sprite) {
            console.warn('[MoodTracker] Main hero sprite not found');
            return;
        }
        
        // Get current monster and skin info
        const selectedMonster = localStorage.getItem('selectedMonster') || 'Pink_Monster';
        const equippedSkinId = window.gameState?.equippedSkinId || null;
        const isEgg = window.gameState?.isEgg || false;
        
        // Store original state
        const originalSrc = sprite.src;
        const originalAnimation = sprite.style.animation;
        const originalTransform = sprite.style.transform;
        
        // HAPPY MOOD: Jump animation
        if (moodValue === 'happy') {



            if (equippedSkinId || isEgg) {
                // SKIN EQUIPPED OR EGG FORM: Keep current visual, just add jump transform
                const visualType = equippedSkinId ? 'skin' : 'egg';

                // Add jump transform effect WITHOUT changing sprite src
                sprite.style.setProperty('transition', 'transform 0.3s ease', 'important');
                sprite.style.setProperty('transform', 'scale(4) translateY(-20px)', 'important');
                
                setTimeout(() => {
                    sprite.style.setProperty('transform', 'scale(4) translateY(0)', 'important');
                }, 300);
                
                // Restore transform after animation
                setTimeout(() => {
                    sprite.style.setProperty('transform', originalTransform || 'scale(4)', 'important');
                    sprite.style.setProperty('transition', '', 'important');

                }, 600);
            } else {
                // NO SKIN AND NOT EGG: Use default monster jump GIF

                // Normalize monster name: capitalize first letter for file path
                const monsterName = selectedMonster.charAt(0).toUpperCase() + selectedMonster.slice(1).toLowerCase();
                const jumpGif = `assets/${monsterName}_jump.gif`;
                
                // Preload the jump GIF to prevent broken image display
                const jumpImage = new Image();
                jumpImage.onload = () => {
                    sprite.src = jumpGif;
                    sprite.style.animation = 'none';
                    
                    // Wait a frame for the image to render
                    requestAnimationFrame(() => {
                        // Add jump transform effect
                        sprite.style.transition = 'transform 0.3s ease';
                        sprite.style.transform = 'scale(4) translateY(-20px)';
                        
                        setTimeout(() => {
                            sprite.style.transform = 'scale(4) translateY(0)';
                        }, 300);
                        
                        setTimeout(() => {
                            sprite.src = originalSrc;
                            sprite.style.animation = originalAnimation;
                            sprite.style.transition = '';

                        }, 2000);
                    });
                };
                jumpImage.onerror = () => {
                    console.error('[MoodTracker] Failed to load jump GIF:', jumpGif);
                    // Fallback: just do transform without changing sprite
                    sprite.style.transition = 'transform 0.3s ease';
                    sprite.style.transform = 'scale(4) translateY(-20px)';
                    setTimeout(() => {
                        sprite.style.transform = 'scale(4) translateY(0)';
                    }, 300);
                    setTimeout(() => {
                        sprite.style.transition = '';
                    }, 600);
                };
                jumpImage.src = jumpGif;
            }
        } 
        // OTHER MOODS: Flicker/fade effect
        else {

            // Create flicker effect using opacity
            let flickerCount = 0;
            const maxFlickers = 6; // 3 full cycles (on/off) over 2 seconds
            const flickerInterval = 333; // ~333ms per flicker
            
            const flickerEffect = setInterval(() => {
                if (flickerCount >= maxFlickers) {
                    clearInterval(flickerEffect);
                    // CRITICAL: Always restore to full opacity
                    sprite.style.setProperty('opacity', '1', 'important');

                    return;
                }
                
                // Toggle opacity between 0.3 and 1
                sprite.style.opacity = (flickerCount % 2 === 0) ? '0.3' : '1';
                flickerCount++;
            }, flickerInterval);
            
            // Safety timeout: Force opacity back to 1 after 3 seconds
            setTimeout(() => {
                if (sprite) {
                    sprite.style.setProperty('opacity', '1', 'important');

                }
            }, 3000);
        }
    }
}

// Global function to update mood history display
window.updateMoodHistoryDisplay = function() {
    const container = document.getElementById('moodHistoryContainer');
    if (!container) return;
    
    const dateFilter = document.getElementById('moodDateFilter')?.value || 'all';
    const moodFilter = document.getElementById('moodTypeFilter')?.value || 'all';
    
    // Get moods directly from localStorage (more reliable)
    const saved = localStorage.getItem('moodHistory');
    let moods = saved ? JSON.parse(saved) : [];

    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        moods = moods.filter(entry => {
            if (!entry.timestamp) return false;
            
            if (dateFilter === 'today') {
                return entry.timestamp >= todayTimestamp;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return entry.timestamp >= weekAgo.getTime();
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                return entry.timestamp >= monthAgo.getTime();
            }
            return true;
        });

    }
    
    // Apply mood type filter
    if (moodFilter !== 'all') {
        moods = moods.filter(entry => {
            return entry.mood && entry.mood.toLowerCase() === moodFilter.toLowerCase();
        });

    }
    
    // Render mood history
    if (moods.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <p>No mood entries found</p>
                <p style="font-size: 13px; margin-top: 8px;">Start tracking your mood to see your history here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = moods.map(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        return `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="font-size: 32px;">${entry.emoji}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${entry.name}</div>
                        <div style="font-size: 12px; color: #999;">${dateStr} at ${timeStr}</div>
                    </div>
                </div>
                ${entry.note ? `
                    <div style="
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 8px;
                        padding: 12px;
                        margin-top: 12px;
                        color: #ccc;
                        font-size: 13px;
                        line-height: 1.5;
                    ">${entry.note}</div>
                ` : ''}
            </div>
        `;
    }).join('');
};

// Initialize mood tracker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.moodTracker = new MoodTracker();
    });
} else {
    window.moodTracker = new MoodTracker();
}

// Initialize mood history display when Habits tab is shown
window.initMoodHistoryFilters = function() {

    // Add event listeners to filters
    const dateFilter = document.getElementById('moodDateFilter');
    const moodFilter = document.getElementById('moodTypeFilter');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {

            window.updateMoodHistoryDisplay();
        });
    }
    
    if (moodFilter) {
        moodFilter.addEventListener('change', () => {

            window.updateMoodHistoryDisplay();
        });
    }
    
    // Initial display
    window.updateMoodHistoryDisplay();

};

// Auto-initialize when switching to Habits tab
const originalShowPage = window.showPage;
if (typeof originalShowPage === 'function') {
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        
        // If switching to habits page, initialize mood display
        if (pageId === 'habits') {
            setTimeout(() => {
                window.initMoodHistoryFilters();
            }, 100);
        }
    };
}

// Also initialize if already on habits page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const habitsPage = document.getElementById('habits');
            if (habitsPage && habitsPage.style.display !== 'none') {
                window.initMoodHistoryFilters();
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        const habitsPage = document.getElementById('habits');
        if (habitsPage && habitsPage.style.display !== 'none') {
            window.initMoodHistoryFilters();
        }
    }, 500);
}
