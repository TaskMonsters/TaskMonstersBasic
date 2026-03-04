// ===================================
// ACHIEVEMENT TRACKER
// Comprehensive achievement tracking system
// ===================================

class AchievementTracker {
    constructor() {
        this.achievements = [];
        this.init();
    }

    init() {
        // Wait for achievements to be loaded
        if (typeof window.achievements !== 'undefined') {
            this.achievements = window.achievements;
        }
    }

    // Check all achievements and update progress
    checkAchievements() {
        if (!window.gameState || !this.achievements.length) return;

        const unlockedNew = [];

        this.achievements.forEach(achievement => {
            // Skip if already unlocked
            if (this.isAchievementUnlocked(achievement.id)) return;

            let isUnlocked = false;

            switch (achievement.type) {
                case 'tasks':
                    isUnlocked = this.checkTasksAchievement(achievement);
                    break;
                case 'quick_daily':
                    isUnlocked = this.checkQuickDailyAchievement(achievement);
                    break;
                case 'quick_total':
                    isUnlocked = this.checkQuickTotalAchievement(achievement);
                    break;
                case 'quick_fast':
                    isUnlocked = this.checkQuickFastAchievement(achievement);
                    break;
                case 'session':
                    isUnlocked = this.checkSessionAchievement(achievement);
                    break;
                case 'early_morning':
                    isUnlocked = this.checkEarlyMorningAchievement(achievement);
                    break;
                case 'weekend':
                    isUnlocked = this.checkWeekendAchievement(achievement);
                    break;
                case 'streak':
                    isUnlocked = this.checkStreakAchievement(achievement);
                    break;
                case 'before_noon':
                    isUnlocked = this.checkBeforeNoonAchievement(achievement);
                    break;
                case 'xp':
                    isUnlocked = this.checkXPAchievement(achievement);
                    break;
                case 'balanced_day':
                    isUnlocked = this.checkBalancedDayAchievement(achievement);
                    break;
                case 'completion_rate':
                    isUnlocked = this.checkCompletionRateAchievement(achievement);
                    break;
                case 'daily_tasks':
                    isUnlocked = this.checkDailyTasksAchievement(achievement);
                    break;
                case 'on_time':
                    isUnlocked = this.checkOnTimeAchievement(achievement);
                    break;
                case 'all_tasks_streak':
                    isUnlocked = this.checkAllTasksStreakAchievement(achievement);
                    break;
                case 'balanced_week':
                    isUnlocked = this.checkBalancedWeekAchievement(achievement);
                    break;
                case 'challenges':
                    isUnlocked = this.checkChallengesAchievement(achievement);
                    break;
                case 'midnight':
                    isUnlocked = this.checkMidnightAchievement(achievement);
                    break;
                case 'high_priority_day':
                    isUnlocked = this.checkHighPriorityDayAchievement(achievement);
                    break;
                case 'battles':
                    isUnlocked = this.checkBattlesAchievement(achievement);
                    break;
                case 'battle_streak':
                    isUnlocked = this.checkBattleStreakAchievement(achievement);
                    break;
                case 'hp':
                    isUnlocked = this.checkHPAchievement(achievement);
                    break;
                case 'quests':
                    isUnlocked = this.checkQuestsAchievement(achievement);
                    break;
                case 'quiz_perfect':
                    isUnlocked = this.checkQuizPerfectAchievement(achievement);
                    break;
                case 'focus_timer':
                    isUnlocked = this.checkFocusTimerAchievement(achievement);
                    break;
                case 'category_variety':
                    isUnlocked = this.checkCategoryVarietyAchievement(achievement);
                    break;
                case 'high_priority_total':
                    isUnlocked = this.checkHighPriorityTotalAchievement(achievement);
                    break;
                case 'quest_accepted':
                    isUnlocked = this.checkQuestAcceptedAchievement(achievement);
                    break;
            }

            if (isUnlocked) {
                this.unlockAchievement(achievement.id);
                unlockedNew.push(achievement);
            }
        });

        // Show notifications for newly unlocked achievements
        if (unlockedNew.length > 0) {
            this.showAchievementNotifications(unlockedNew);
        }
    }

    // Achievement type checkers
    checkTasksAchievement(achievement) {
        const completed = window.gameState.completedTasks || 0;
        return completed >= achievement.requirement;
    }

    checkQuickDailyAchievement(achievement) {
        const today = new Date().toDateString();
        const completedToday = (window.gameState.completedQuickTasks || [])
            .filter(task => new Date(task.completedAt).toDateString() === today);
        return completedToday.length >= achievement.requirement;
    }

    checkQuickTotalAchievement(achievement) {
        const total = (window.gameState.completedQuickTasks || []).length;
        return total >= achievement.requirement;
    }

    checkQuickFastAchievement(achievement) {
        // Check if any quick task was completed within 60 seconds
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.quickTaskUnder60 === true;
    }

    checkSessionAchievement(achievement) {
        const sessionCount = window.gameState.sessionTaskCount || 0;
        return sessionCount >= achievement.requirement;
    }

    checkEarlyMorningAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.earlyMorningTask === true;
    }

    checkWeekendAchievement(achievement) {
        const weekendCount = window.gameState.weekendTasksCompleted || 0;
        return weekendCount >= achievement.requirement;
    }

    checkStreakAchievement(achievement) {
        const bestStreak = window.gameState.bestStreak || 0;
        return bestStreak >= achievement.requirement;
    }

    checkBeforeNoonAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.allTasksBeforeNoon === true;
    }

    checkXPAchievement(achievement) {
        const xp = window.gameState.jerryXP || 0;
        return xp >= achievement.requirement;
    }

    checkBalancedDayAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.balancedDay === true;
    }

    checkCompletionRateAchievement(achievement) {
        const total = window.gameState.totalTasksCreated || 0;
        const completed = window.gameState.completedTasks || 0;
        if (total === 0) return false;
        const rate = Math.round((completed / total) * 100);
        return rate >= achievement.requirement;
    }

    checkDailyTasksAchievement(achievement) {
        const today = new Date().toDateString();
        const tasksToday = (window.gameState.tasksCompletedToday || [])
            .filter(task => new Date(task.completedAt).toDateString() === today);
        return tasksToday.length >= achievement.requirement;
    }

    checkOnTimeAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.onTimeTask === true;
    }

    checkAllTasksStreakAchievement(achievement) {
        const streakDays = window.gameState.allTasksStreakDays || 0;
        return streakDays >= achievement.requirement;
    }

    checkBalancedWeekAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.balancedWeek === true;
    }

    checkChallengesAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        const challengesCompleted = window.gameState.achievementProgress.challengesCompleted || 0;
        return challengesCompleted >= achievement.requirement;
    }

    checkMidnightAchievement(achievement) {
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.midnightTask === true;
    }

    checkHighPriorityDayAchievement(achievement) {
        const today = new Date().toDateString();
        const highPriorityToday = (window.gameState.tasksCompletedToday || [])
            .filter(task => 
                new Date(task.completedAt).toDateString() === today && 
                task.priority === 'high'
            );
        return highPriorityToday.length >= achievement.requirement;
    }

    // Battle achievement checkers (kept for backward compatibility but battles = 0 always)
    checkBattlesAchievement(achievement) {
        return false; // Battle mode removed
    }

    checkBattleStreakAchievement(achievement) {
        return false; // Battle mode removed
    }

    // HP achievement checker
    checkHPAchievement(achievement) {
        const currentHP = window.gameState.health || 0;
        return currentHP >= achievement.requirement;
    }

    // Quest achievement checkers
    checkQuestsAchievement(achievement) {
        const questsPassed = window.gameState.questQuizzesPassed || 0;
        return questsPassed >= achievement.requirement;
    }

    checkQuizPerfectAchievement(achievement) {
        const quizStreak = window.gameState.quizPerfectStreak || 0;
        return quizStreak >= achievement.requirement;
    }

    // NEW ACHIEVEMENT CHECKERS
    checkFocusTimerAchievement(achievement) {
        // Check if user has completed at least one 25-minute focus session
        if (!window.gameState.achievementProgress) return false;
        return window.gameState.achievementProgress.focusTimer25Min === true;
    }

    checkCategoryVarietyAchievement(achievement) {
        // Check if user has completed tasks in all 10 categories
        if (!window.gameState.achievementProgress) return false;
        const categoriesCompleted = window.gameState.achievementProgress.categoriesCompleted || [];
        return categoriesCompleted.length >= achievement.requirement;
    }

    checkHighPriorityTotalAchievement(achievement) {
        // Check total high-priority tasks completed
        const highPriorityCount = window.gameState.highPriorityTasksCompleted || 0;
        return highPriorityCount >= achievement.requirement;
    }

    checkQuestAcceptedAchievement(achievement) {
        // Check total quests accepted from Merlin
        const questsAccepted = window.gameState.questTasksAccepted || 0;
        return questsAccepted >= achievement.requirement;
    }

    // Check if achievement is unlocked
    isAchievementUnlocked(achievementId) {
        if (!window.gameState.unlockedAchievements) return false;
        return window.gameState.unlockedAchievements[achievementId] === true;
    }

    // Unlock achievement
    unlockAchievement(achievementId) {
        if (!window.gameState.unlockedAchievements) {
            window.gameState.unlockedAchievements = {};
        }
        window.gameState.unlockedAchievements[achievementId] = true;
        
        if (typeof window.saveGameState === 'function') {
            window.saveGameState();
        }
    }

    // Show achievement notifications
    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                if (typeof window.showSuccessMessage === 'function') {
                    window.showSuccessMessage(
                        `🏆 Achievement Unlocked!`,
                        `${achievement.icon} ${achievement.name}`
                    );
                }
                
                // Fire confetti for achievement
                if (typeof window.fireConfetti === 'function') {
                    window.fireConfetti();
                }
            }, index * 1500); // Stagger notifications
        });
    }

    // Track quick task start time
    trackQuickTaskStart(taskId) {
        if (!window.gameState.quickTaskStartTimes) {
            window.gameState.quickTaskStartTimes = {};
        }
        window.gameState.quickTaskStartTimes[taskId] = Date.now();
    }

    // Track quick task completion time
    trackQuickTaskComplete(taskId) {
        if (!window.gameState.quickTaskStartTimes || !window.gameState.quickTaskStartTimes[taskId]) {
            return;
        }

        const startTime = window.gameState.quickTaskStartTimes[taskId];
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // seconds

        // Check if completed within 60 seconds
        if (duration <= 60) {
            if (!window.gameState.achievementProgress) {
                window.gameState.achievementProgress = {};
            }
            window.gameState.achievementProgress.quickTaskUnder60 = true;
        }

        // Clean up
        delete window.gameState.quickTaskStartTimes[taskId];
    }

    // Track session tasks
    trackSessionTask() {
        const now = Date.now();
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes

        // Check if session expired
        if (window.gameState.sessionStartTime && (now - window.gameState.sessionStartTime) > sessionTimeout) {
            // Reset session
            window.gameState.sessionTaskCount = 0;
            window.gameState.sessionStartTime = now;
        }

        // Start new session if needed
        if (!window.gameState.sessionStartTime) {
            window.gameState.sessionStartTime = now;
        }

        // Increment session count
        window.gameState.sessionTaskCount = (window.gameState.sessionTaskCount || 0) + 1;
    }

    // Track task completion for various achievements
    trackTaskCompletion(task, isQuickTask = false) {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const today = now.toDateString();

        // Initialize progress object
        if (!window.gameState.achievementProgress) {
            window.gameState.achievementProgress = {};
        }

        // Track early morning (before 10 AM)
        if (hour < 10) {
            window.gameState.achievementProgress.earlyMorningTask = true;
        }

        // Track midnight (12 AM - 3 AM)
        if (hour >= 0 && hour < 3) {
            window.gameState.achievementProgress.midnightTask = true;
        }

        // Track weekend tasks
        if (day === 0 || day === 6) {
            window.gameState.weekendTasksCompleted = (window.gameState.weekendTasksCompleted || 0) + 1;
        }

        // Track tasks completed today
        if (!window.gameState.tasksCompletedToday) {
            window.gameState.tasksCompletedToday = [];
        }
        window.gameState.tasksCompletedToday.push({
            ...task,
            completedAt: now.toISOString(),
            isQuickTask: isQuickTask
        });

        // Clean up old tasks (keep only today's)
        window.gameState.tasksCompletedToday = window.gameState.tasksCompletedToday.filter(
            t => new Date(t.completedAt).toDateString() === today
        );

        // Check balanced day (1 quick + 1 regular in same day)
        const quickToday = window.gameState.tasksCompletedToday.filter(t => t.isQuickTask).length;
        const regularToday = window.gameState.tasksCompletedToday.filter(t => !t.isQuickTask).length;
        if (quickToday >= 1 && regularToday >= 1) {
            window.gameState.achievementProgress.balancedDay = true;
        }

        // Check before noon achievement (all daily tasks before 12 PM)
        if (hour < 12) {
            const allBeforeNoon = window.gameState.tasksCompletedToday.every(
                t => new Date(t.completedAt).getHours() < 12
            );
            if (allBeforeNoon && window.gameState.tasksCompletedToday.length >= 3) {
                window.gameState.achievementProgress.allTasksBeforeNoon = true;
            }
        }

        // Track category variety
        if (task && task.category) {
            if (!window.gameState.achievementProgress.categoriesCompleted) {
                window.gameState.achievementProgress.categoriesCompleted = [];
            }
            const category = task.category.toLowerCase();
            if (!window.gameState.achievementProgress.categoriesCompleted.includes(category)) {
                window.gameState.achievementProgress.categoriesCompleted.push(category);
            }
        }

        // Track high-priority tasks
        if (task && task.priority && task.priority.toLowerCase() === 'high') {
            window.gameState.highPriorityTasksCompleted = (window.gameState.highPriorityTasksCompleted || 0) + 1;
        }

        // Track session
        this.trackSessionTask();

        // Check achievements after tracking
        this.checkAchievements();
    }

    // Track on-time task completion
    trackOnTimeTask(task) {
        if (!task.dueDate) return;

        const now = Date.now();
        const dueTime = new Date(task.dueDate).getTime();
        const timeDiff = Math.abs(now - dueTime);

        // Within 5 minutes of due time
        if (timeDiff <= 5 * 60 * 1000) {
            if (!window.gameState.achievementProgress) {
                window.gameState.achievementProgress = {};
            }
            window.gameState.achievementProgress.onTimeTask = true;
        }
    }

    // Track daily challenge completion
    trackChallengeComplete() {
        if (!window.gameState.achievementProgress) {
            window.gameState.achievementProgress = {};
        }
        window.gameState.achievementProgress.challengesCompleted = 
            (window.gameState.achievementProgress.challengesCompleted || 0) + 1;
    }
}

// Initialize achievement tracker globally
window.achievementTracker = new AchievementTracker();

// Initialize after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.achievements) {
            window.achievementTracker.achievements = window.achievements;
            window.achievementTracker.checkAchievements();
        }
    }, 1000);
});

