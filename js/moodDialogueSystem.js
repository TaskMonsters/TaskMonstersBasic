// Mood and Dialogue System for TaskMonsters

// Monster Dialogue Data (inline to avoid loading issues)
const DIALOGUE_DATA = {
  "monsters": {
    "nova": {
      "task_complete": [
        "YES! That was a knockout!",
        "Boom! We crushed it!",
        "That task didn't stand a chance!",
        "Let's goooo!",
        "Another win on the board!",
        "That was clean!",
        "Power move!",
        "We're on fire today!",
        "You're dominating!",
        "That was huge!"
      ],
      "streak": [
        "Look at that streak!",
        "We're unstoppable!",
        "You're on a roll!",
        "Keep the wins coming!",
        "This is champion energy!",
        "We're building something epic!",
        "Don't slow down!",
        "We're tearing through these!",
        "This is legendary pace!",
        "We're in the zone!"
      ],
      "level_up": [
        "LEVEL UP!!!",
        "Power unlocked!",
        "We just got way stronger!",
        "That was massive!",
        "New tier reached!",
        "You earned this!",
        "We're evolving!",
        "This changes everything!",
        "Big upgrade!",
        "We're elite now!"
      ],
      "mood_happy": [
        "I love this energy!",
        "That smile is power!",
        "Let's use this momentum!",
        "You're glowing!",
        "This vibe is electric!",
        "We're thriving!",
        "This is peak performance!",
        "You're unstoppable today!",
        "Let's make it count!",
        "This feels amazing!"
      ],
      "mood_low": [
        "Hey… it's okay to slow down.",
        "Even champions rest.",
        "We'll bounce back.",
        "You don't have to be strong right now.",
        "I've got you.",
        "Let's take it one step at a time.",
        "We're still in this.",
        "No pressure today.",
        "You're not failing.",
        "We'll come back stronger."
      ]
    },
    "luna": {
      "task_complete": [
        "You did beautifully.",
        "That was a gentle step forward.",
        "I'm proud of you.",
        "That mattered.",
        "You made progress.",
        "That was enough.",
        "You're doing well.",
        "I see your effort.",
        "That was meaningful.",
        "Thank you for trying."
      ],
      "streak": [
        "Look how consistent you've been.",
        "You're growing steadily.",
        "One step at a time.",
        "This is lovely progress.",
        "You're building something.",
        "You've been very kind to yourself.",
        "That's something to be proud of.",
        "You've stayed with it.",
        "This feels peaceful and strong.",
        "You're doing well."
      ],
      "level_up": [
        "You've grown.",
        "I can feel your progress.",
        "That's a beautiful milestone.",
        "You've become stronger.",
        "This is something special.",
        "You earned this.",
        "You've changed.",
        "I'm proud of you.",
        "This is a big moment.",
        "You've come far."
      ],
      "mood_happy": [
        "Your happiness feels warm.",
        "I love seeing you smile.",
        "Let's enjoy this.",
        "You deserve this feeling.",
        "This is a good moment.",
        "Your joy is gentle and bright.",
        "I'm happy with you.",
        "Let's stay here a little.",
        "This feels peaceful.",
        "You look lighter."
      ],
      "mood_low": [
        "I'm here with you.",
        "It's okay to feel heavy.",
        "You don't have to rush.",
        "We can go slowly.",
        "You're still enough.",
        "You're not broken.",
        "It's okay to rest.",
        "You're safe here.",
        "You don't have to push.",
        "I won't leave you."
      ]
    },
    "benny": {
      "task_complete": [
        "Hehe! We did it!",
        "Yay us!",
        "That was fun!",
        "Look what we did!",
        "We're awesome!",
        "I helped, right?",
        "Nice job!",
        "That felt good!",
        "Yippee!",
        "We're getting better!"
      ],
      "streak": [
        "Whoa, so many tasks!",
        "We're on a roll!",
        "I'm tired but happy!",
        "We keep going!",
        "Look at us go!",
        "This is exciting!",
        "We're busy!",
        "You're really doing it!",
        "That's a lot!",
        "Yay progress!"
      ],
      "level_up": [
        "Ooooh! I feel different!",
        "Did I just grow?",
        "We leveled up?! Yay!",
        "I'm stronger now!",
        "That was big!",
        "Wow wow wow!",
        "I feel fancy!",
        "We did a big thing!",
        "I like this!",
        "We got better!"
      ],
      "mood_happy": [
        "You look happy!",
        "Yay, happy vibes!",
        "I like this mood!",
        "This feels nice!",
        "Let's do stuff!",
        "I'm smiling too!",
        "We're having fun!",
        "That's a good face!",
        "I love this!",
        "So cozy!"
      ],
      "mood_low": [
        "Aww… I'm here.",
        "Want a hug?",
        "We can be slow.",
        "That's okay.",
        "I still like you.",
        "You don't have to do much.",
        "We can rest.",
        "I won't go away.",
        "You're still my friend.",
        "It's okay to be sad."
      ]
    }
  }
};

const MoodDialogueSystem = {
    // Mood emojis
    moods: {
        happy: '😊',
        anxious: '😰',
        neutral: '😐',
        angry: '😡'
    },
    
    // Current dialogue timeout
    dialogueTimeout: null,
    
    // Mood tracker scheduling
    moodTrackerInterval: null,
    initialDelayTimeout: null,
    
    // Initialize the system
    init() {

        // Initialize mood history if not exists
        if (!gameState.moodHistory) {
            gameState.moodHistory = [];
        }
        
        // Start mood tracker scheduling (only after onboarding)
        this.startMoodTrackerSchedule();
        
        // Check if dialogue should be shown (level 5+)
        if (gameState.jerryLevel >= 5 && !gameState.isEgg) {
            // Show tap hint for mood tracker first
            setTimeout(() => {
                this.showDialogue('tap_hint');
            }, 3000);
            
            // Then show greeting occasionally
            setTimeout(() => {
                if (Math.random() < 0.3) { // 30% chance
                    this.showDialogue('greeting');
                }
            }, 10000);
        }
    },
    
    // Start mood tracker scheduling
    startMoodTrackerSchedule() {
        // Check if onboarding is complete
        const onboardingComplete = localStorage.getItem('simpleOnboardingCompleted') === 'true';
        
        if (!onboardingComplete) {

            return;
        }
        
        // Check if we should show mood tracker today
        if (!this.shouldShowMoodTrackerToday()) {

            return;
        }
        
        // Clear any existing timers
        this.clearMoodTrackerTimers();
        
        // Wait 60 seconds after app load, then show mood tracker

        this.initialDelayTimeout = setTimeout(() => {
            this.showMoodTracker();
            
            // Schedule hourly checks until midnight
            this.scheduleHourlyMoodTracker();
        }, 60000); // 60 seconds
    },
    
    // Schedule hourly mood tracker
    scheduleHourlyMoodTracker() {
        // Clear existing interval
        if (this.moodTrackerInterval) {
            clearInterval(this.moodTrackerInterval);
        }
        
        // Check every hour if we should show mood tracker
        this.moodTrackerInterval = setInterval(() => {
            if (this.shouldShowMoodTrackerToday()) {
                this.showMoodTracker();
            } else {
                // Past midnight, stop the interval

                this.clearMoodTrackerTimers();
            }
        }, 3600000); // 1 hour = 3600000ms
    },
    
    // Check if mood tracker should be shown today
    shouldShowMoodTrackerToday() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Don't show after midnight (12 AM = 0 hours)
        if (currentHour === 0) {
            return false;
        }
        
        return true;
    },
    
    // Clear all mood tracker timers
    clearMoodTrackerTimers() {
        if (this.initialDelayTimeout) {
            clearTimeout(this.initialDelayTimeout);
            this.initialDelayTimeout = null;
        }
        if (this.moodTrackerInterval) {
            clearInterval(this.moodTrackerInterval);
            this.moodTrackerInterval = null;
        }
    },
    
    // Show mood tracker
    showMoodTracker() {
        try {
            // CRITICAL: Check if in battle mode
            const battleContainer = document.querySelector('.battle-container');
            const isBattleActive = battleContainer && battleContainer.style.display !== 'none';
            
            if (isBattleActive) {

                return;
            }
            
            // Check if modal already exists
            if (document.getElementById('moodTrackerContainer')) {

                return;
            }


        // Create mood tracker container
        const moodContainer = document.createElement('div');
        moodContainer.id = 'moodTrackerContainer';
        moodContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            background: linear-gradient(135deg, rgba(55, 48, 163, 0.98), rgba(67, 56, 202, 0.98));
            padding: 0;
            border-radius: 16px;
            backdrop-filter: blur(20px);
            border: 2px solid rgba(109, 40, 217, 0.8);
            box-shadow: 0 8px 32px rgba(67, 56, 202, 0.6), 0 0 60px rgba(109, 40, 217, 0.3);
            max-width: 90%;
            width: 227px;
            animation: slideDown 0.3s ease;
        `;
        
        // Add animation keyframes if not already present
        if (!document.getElementById('moodTrackerAnimations')) {
            const style = document.createElement('style');
            style.id = 'moodTrackerAnimations';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        moodContainer.innerHTML = `
            <div style="padding: 24px; position: relative;">
                <button 
                    id="closeMoodTracker"
                    style="
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        background: transparent;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 4px 8px;
                        line-height: 1;
                        z-index: 10;
                    "
                >×</button>
                <h3 style="color: white; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; text-align: center;">How are you feeling?</h3>
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
                    ${Object.entries(this.moods).map(([mood, emoji]) => `
                        <button 
                            class="mood-button" 
                            data-mood="${mood}"
                            style="
                                background: rgba(99, 102, 241, 0.2);
                                border: 2px solid rgba(139, 92, 246, 0.5);
                                border-radius: 12px;
                                padding: 12px;
                                font-size: 32px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                backdrop-filter: blur(10px);
                                width: 70px;
                                height: 70px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                gap: 4px;
                            "
                            onmouseover="this.style.background='rgba(139, 92, 246, 0.4)'; this.style.transform='scale(1.05)';"
                            onmouseout="this.style.background='rgba(99, 102, 241, 0.2)'; this.style.transform='scale(1)';"
                        >
                            <div>${emoji}</div>
                            <div style="font-size: 11px; color: white; text-transform: capitalize;">${mood}</div>
                        </button>
                    `).join('')}
                </div>
                <textarea 
                    id="moodNoteInput"
                    placeholder="Add a note (optional)..."
                    style="
                        width: 100%;
                        min-height: 60px;
                        padding: 12px;
                        background: rgba(99, 102, 241, 0.1);
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        border-radius: 8px;
                        color: #ffffff !important;
                        font-size: 14px;
                        font-family: inherit;
                        resize: vertical;
                        box-sizing: border-box;
                    "
                    onfocus="this.style.color='#ffffff';"
                    oninput="this.style.color='#ffffff';"
                ></textarea>
                <style>
                    #moodNoteInput::placeholder {
                        color: rgba(255, 255, 255, 0.5) !important;
                    }
                </style>
            </div>
        `;
        
        document.body.appendChild(moodContainer);
        
        // Add close button handler
        const closeBtn = moodContainer.querySelector('#closeMoodTracker');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                moodContainer.remove();
            });
        }
        
        // Add click handlers for mood buttons
        moodContainer.querySelectorAll('.mood-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const mood = e.target.closest('.mood-button').dataset.mood;
                const noteInput = document.getElementById('moodNoteInput');
                const note = noteInput ? noteInput.value.trim() : '';
                
                this.recordMood(mood, note);
                moodContainer.remove();
                
                // Trigger monster animation based on mood
                this.playMonsterMoodAnimation(mood);
                
                // DO NOT show dialogue after mood selection
            });
        });
        } catch (error) {
            console.error('[MoodDialogueSystem] Error showing mood tracker:', error);
        }
    },
    
    // Record mood - SYNCED with moodTracker.js localStorage system
    recordMood(mood, note = '') {

        const moodData = {
            mood: mood,
            emoji: this.moods[mood],
            name: mood.charAt(0).toUpperCase() + mood.slice(1),
            note: note,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        // Get existing moods from localStorage (same as moodTracker.js)
        const saved = localStorage.getItem('moodHistory');
        const moods = saved ? JSON.parse(saved) : [];
        
        // Add to beginning
        moods.unshift(moodData);
        
        // Keep only last 100 entries
        if (moods.length > 100) {
            moods.length = 100;
        }
        
        // Save to localStorage
        localStorage.setItem('moodHistory', JSON.stringify(moods));

        // Update display if on habits tab
        if (typeof updateMoodHistoryDisplay === 'function') {
            updateMoodHistoryDisplay();
        }
    },
    
    // Show dialogue
    showDialogue(context, moodType = null) {
        // Only show dialogue if level 5+
        if (gameState.jerryLevel < 5 || gameState.isEgg) {
            return;
        }
        
        // Get monster type
        const monsterType = this.getMonsterType();
        if (!monsterType) return;
        
        // Get dialogue text
        let dialogueText = this.getDialogueText(monsterType, context, moodType);
        if (!dialogueText) return;
        
        // Create dialogue container
        const dialogueContainer = document.createElement('div');
        dialogueContainer.id = 'monsterDialogueContainer';
        dialogueContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            background: rgba(0, 0, 0, 0.85);
            padding: 20px 24px;
            border-radius: 16px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            max-width: 90%;
            width: 500px;
            animation: fadeIn 0.3s ease;
        `;
        
        dialogueContainer.innerHTML = `
            <div style="color: white; font-size: 16px; line-height: 1.6; text-align: center; padding: 4px;">
                ${dialogueText}
            </div>
        `;
        
        document.body.appendChild(dialogueContainer);
        
        // Auto-dismiss after 5 seconds
        if (this.dialogueTimeout) {
            clearTimeout(this.dialogueTimeout);
        }
        
        this.dialogueTimeout = setTimeout(() => {
            if (dialogueContainer && dialogueContainer.parentNode) {
                dialogueContainer.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    dialogueContainer.remove();
                }, 300);
            }
        }, 5000);
        
        // Click to dismiss
        dialogueContainer.addEventListener('click', () => {
            clearTimeout(this.dialogueTimeout);
            dialogueContainer.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                dialogueContainer.remove();
            }, 300);
        });
    },
    
    // Get monster type from selected monster
    getMonsterType() {
        const selectedMonster = gameState.selectedMonster || localStorage.getItem('selectedMonster');
        
        if (!selectedMonster) return null;
        
        // Map sprite names to monster types
        if (selectedMonster.includes('Pink') || selectedMonster.includes('nova')) {
            return 'nova';
        } else if (selectedMonster.includes('Purple') || selectedMonster.includes('luna')) {
            return 'luna';
        } else if (selectedMonster.includes('Blue') || selectedMonster.includes('benny')) {
            return 'benny';
        }
        
        return null;
    },
    
    // Get dialogue text
    getDialogueText(monsterType, context, moodType = null) {
        if (!DIALOGUE_DATA || !DIALOGUE_DATA.monsters || !DIALOGUE_DATA.monsters[monsterType]) {
            console.error('[MoodDialogueSystem] Dialogue data not found for:', monsterType);
            return null;
        }
        
        const monsterDialogue = DIALOGUE_DATA.monsters[monsterType];
        let dialogueArray = [];
        
        // Select dialogue based on context
        switch (context) {
            case 'mood':
                if (moodType === 'happy') {
                    dialogueArray = monsterDialogue.mood_happy;
                } else if (moodType === 'anxious' || moodType === 'angry') {
                    dialogueArray = monsterDialogue.mood_low;
                } else {
                    // Neutral mood - use task complete
                    dialogueArray = monsterDialogue.task_complete;
                }
                break;
            case 'task_complete':
                dialogueArray = monsterDialogue.task_complete;
                break;
            case 'streak':
                dialogueArray = monsterDialogue.streak;
                break;
            case 'level_up':
                dialogueArray = monsterDialogue.level_up;
                break;
            case 'greeting':
                // Random greeting from task_complete
                dialogueArray = monsterDialogue.task_complete;
                break;
            default:
                dialogueArray = monsterDialogue.task_complete;
        }
        
        // Return random dialogue
        if (dialogueArray && dialogueArray.length > 0) {
            return dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
        }
        
        return null;
    },
    
    // Trigger dialogue on events
    onTaskComplete() {
        if (gameState.jerryLevel >= 5 && !gameState.isEgg) {
            // 30% chance to show dialogue on task complete
            if (Math.random() < 0.3) {
                this.showDialogue('task_complete');
            }
        }
    },
    
    onStreak() {
        if (gameState.jerryLevel >= 5 && !gameState.isEgg) {
            this.showDialogue('streak');
        }
    },
    
    onLevelUp() {
        if (gameState.jerryLevel >= 5 && !gameState.isEgg) {
            this.showDialogue('level_up');
        }
    },
    
    // Update mood history display in habits tab
    updateMoodHistoryDisplay() {
        const container = document.getElementById('moodHistoryContainer');
        if (!container) return;
        
        if (!gameState.moodHistory || gameState.moodHistory.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
                    <p style="margin: 0;">No mood data yet</p>
                    <p style="margin: 8px 0 0 0; font-size: 14px;">Track your mood to see insights here</p>
                </div>
            `;
            return;
        }
        
        // Calculate most common mood
        const moodCounts = {};
        gameState.moodHistory.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        
        const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
            moodCounts[a[0]] > moodCounts[b[0]] ? a : b
        )[0];
        
        const mostCommonEmoji = this.moods[mostCommonMood];
        const mostCommonCount = moodCounts[mostCommonMood];
        
        // Get last 14 days of mood history (reversed to show newest first)
        const recentMoods = gameState.moodHistory.slice(-14).reverse();
        
        // Mood colors
        const moodColors = {
            happy: '#4ade80',
            anxious: '#fbbf24',
            neutral: '#94a3b8',
            angry: '#f87171'
        };
        
        const moodLabels = {
            happy: 'Happy',
            anxious: 'Anxious',
            neutral: 'Neutral',
            angry: 'Angry'
        };
        
        container.innerHTML = `
            <div style="margin-bottom: 24px; text-align: center; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-size: 48px; margin-bottom: 8px;">${mostCommonEmoji}</div>
                <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 4px;">Most Common Mood</div>
                <div style="color: var(--text-secondary); font-size: 14px;">${mostCommonCount} ${mostCommonCount === 1 ? 'time' : 'times'}</div>
            </div>
            
            <div style="color: white; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Recent Mood History</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${recentMoods.map(entry => {
                    const date = new Date(entry.timestamp);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    
                    return `
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            padding: 12px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 8px;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        ">
                            <div style="font-size: 24px; flex-shrink: 0;">${entry.emoji}</div>
                            <div style="flex: 1;">
                                <div style="color: ${moodColors[entry.mood]}; font-weight: 600; font-size: 14px;">${moodLabels[entry.mood]}</div>
                                <div style="color: var(--text-secondary); font-size: 12px;">${dateStr} at ${timeStr}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // Play monster animation based on mood selection
    playMonsterMoodAnimation(mood) {
        const monsterSprite = document.getElementById('mainHeroSprite');
        if (!monsterSprite) return;

        if (mood === 'happy') {
            // Brief hover animation (fast)
            monsterSprite.style.transition = 'transform 0.3s ease-in-out';
            monsterSprite.style.transform = 'scale(4) translateY(-10px)';
            setTimeout(() => {
                monsterSprite.style.transform = 'scale(4) translateY(0)';
            }, 300);
            setTimeout(() => {
                monsterSprite.style.transition = '';
            }, 600);
        } else if (mood === 'anxious') {
            // Slower hover animation
            monsterSprite.style.transition = 'transform 0.6s ease-in-out';
            monsterSprite.style.transform = 'scale(4) translateY(-8px)';
            setTimeout(() => {
                monsterSprite.style.transform = 'scale(4) translateY(0)';
            }, 600);
            setTimeout(() => {
                monsterSprite.style.transition = '';
            }, 1200);
        } else if (mood === 'neutral' || mood === 'angry') {
            // Brief flicker animation
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                monsterSprite.style.opacity = monsterSprite.style.opacity === '0.3' ? '1' : '0.3';
                flickerCount++;
                if (flickerCount >= 6) {
                    clearInterval(flickerInterval);
                    monsterSprite.style.opacity = '1';
                }
            }, 100);
        }
    }
};

// Make it globally accessible
window.MoodDialogueSystem = MoodDialogueSystem;
