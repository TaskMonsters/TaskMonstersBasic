// Habit Tracker System
// Tracks task completion patterns by category, difficulty, priority, and quick task types

// Initialize habit tracking data structure
function initHabitTracker() {
    if (!gameState.habitStats) {
        gameState.habitStats = {
            categories: {
                work: 0,
                goals: 0,
                home: 0,
                wellness: 0,
                finance: 0,
                learning: 0,
                digital: 0,
                creative: 0,
                social: 0,
                personal: 0,
                health: 0,
                sleep: 0,
                'self-help': 0,
                fitness: 0,
                mindfulness: 0,
                projects: 0,
                errands: 0
            },
            difficulties: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            priorities: {
                low: 0,
                medium: 0,
                high: 0
            },
            quickTaskCategories: {
                'self-care': 0,
                'physical': 0,
                'sleep': 0,
                'tidy': 0,
                'mindfulness': 0
            },
            totalTasks: 0,
            totalQuickTasks: 0,
            lastUpdated: new Date().toISOString()
        };
        saveGameState();
    } else {
        // Migration: Add new categories for existing users
        const newCategories = ['health', 'sleep', 'self-help', 'fitness', 'mindfulness', 'projects', 'errands'];
        let needsSave = false;
        
        newCategories.forEach(cat => {
            if (gameState.habitStats.categories[cat] === undefined) {
                gameState.habitStats.categories[cat] = 0;
                needsSave = true;
            }
        });
        
        if (needsSave) {

            saveGameState();
        }
    }
}

// Track task completion
function trackTaskCompletion(task, isQuickTask = false) {
    initHabitTracker();
    
    if (isQuickTask) {
        // Track quick task
        gameState.habitStats.totalQuickTasks++;

        // Track by quick task category
        if (task.categoryId && gameState.habitStats.quickTaskCategories[task.categoryId] !== undefined) {
            gameState.habitStats.quickTaskCategories[task.categoryId]++;

        } else {
            console.warn('📊 [Habit Tracker] Quick task category not found or undefined:', task.categoryId);
        }
    } else {
        // Track regular task
        gameState.habitStats.totalTasks++;

        // Track by category
        if (task.category && gameState.habitStats.categories[task.category] !== undefined) {
            gameState.habitStats.categories[task.category]++;
        }
        
        // Track by difficulty
        if (task.difficulty && gameState.habitStats.difficulties[task.difficulty] !== undefined) {
            gameState.habitStats.difficulties[task.difficulty]++;
        }
        
        // Track by priority
        if (task.priority && gameState.habitStats.priorities[task.priority] !== undefined) {
            gameState.habitStats.priorities[task.priority]++;
        }
    }
    
    gameState.habitStats.lastUpdated = new Date().toISOString();
    saveGameState();
}

// Get habit statistics
function getHabitStats() {
    initHabitTracker();
    return gameState.habitStats;
}

// Get most completed category
function getMostCompletedCategory() {
    const stats = getHabitStats();
    let maxCategory = null;
    let maxCount = 0;
    
    for (const [category, count] of Object.entries(stats.categories)) {
        if (count > maxCount) {
            maxCount = count;
            maxCategory = category;
        }
    }
    
    return { category: maxCategory, count: maxCount };
}

// Get least completed category
function getLeastCompletedCategory() {
    const stats = getHabitStats();
    let minCategory = null;
    let minCount = Infinity;
    
    for (const [category, count] of Object.entries(stats.categories)) {
        if (count < minCount) {
            minCount = count;
            minCategory = category;
        }
    }
    
    return { category: minCategory, count: minCount };
}

// Get sorted categories by completion count
function getSortedCategories() {
    const stats = getHabitStats();
    return Object.entries(stats.categories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}

// Get sorted quick task categories by completion count
function getSortedQuickTaskCategories() {
    const stats = getHabitStats();
    return Object.entries(stats.quickTaskCategories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}

// Get difficulty distribution
function getDifficultyDistribution() {
    const stats = getHabitStats();
    const total = stats.difficulties.easy + stats.difficulties.medium + stats.difficulties.hard;
    
    if (total === 0) {
        return { easy: 0, medium: 0, hard: 0 };
    }
    
    return {
        easy: Math.round((stats.difficulties.easy / total) * 100),
        medium: Math.round((stats.difficulties.medium / total) * 100),
        hard: Math.round((stats.difficulties.hard / total) * 100)
    };
}

// Get priority distribution
function getPriorityDistribution() {
    const stats = getHabitStats();
    const total = stats.priorities.low + stats.priorities.medium + stats.priorities.high;
    
    if (total === 0) {
        return { low: 0, medium: 0, high: 0 };
    }
    
    return {
        low: Math.round((stats.priorities.low / total) * 100),
        medium: Math.round((stats.priorities.medium / total) * 100),
        high: Math.round((stats.priorities.high / total) * 100)
    };
}

// Reset habit stats AND mood tracker
function resetHabitStats() {
    if (confirm('Are you sure you want to reset all habit tracking data AND mood history? This cannot be undone.')) {
        // Reset habit stats
        gameState.habitStats = null;
        initHabitTracker();
        updateHabitsDisplay();
        
        // Reset mood history in localStorage
        localStorage.removeItem('moodHistory');

        // Reset mood history in gameState (if it exists)
        if (gameState.moodHistory) {
            gameState.moodHistory = [];
        }
        
        // Update mood display
        if (typeof window.updateMoodHistoryDisplay === 'function') {
            window.updateMoodHistoryDisplay();
        }
        
        showSuccessMessage('🔄 All data reset!', 'Habit stats and mood history cleared');
    }
}

// Export functions to global scope
window.initHabitTracker = initHabitTracker;
window.trackTaskCompletion = trackTaskCompletion;
window.getHabitStats = getHabitStats;
window.getMostCompletedCategory = getMostCompletedCategory;
window.getLeastCompletedCategory = getLeastCompletedCategory;
window.getSortedCategories = getSortedCategories;
window.getSortedQuickTaskCategories = getSortedQuickTaskCategories;
window.getDifficultyDistribution = getDifficultyDistribution;
window.getPriorityDistribution = getPriorityDistribution;
window.resetHabitStats = resetHabitStats;
