// Habit Tracker UI Functions
// Updates the Habits tab with visual analytics

// Category name mappings with emojis
const categoryDisplayNames = {
    work: { name: 'Work', emoji: '💼' },
    goals: { name: 'Goals', emoji: '🎯' },
    home: { name: 'Home', emoji: '🏠' },
    wellness: { name: 'Wellness', emoji: '💚' },
    finance: { name: 'Finance', emoji: '💰' },
    learning: { name: 'Learning', emoji: '📚' },
    digital: { name: 'Digital', emoji: '📱' },
    creative: { name: 'Creative', emoji: '🎨' },
    social: { name: 'Social', emoji: '🤝🏽' },
    personal: { name: 'Personal', emoji: '⭐' },
    // New categories added
    projects: { name: 'Projects', emoji: '🛠️' },
    errands: { name: 'Errands', emoji: '🚗' },
    health: { name: 'Health', emoji: '💪' },
    'self-care': { name: 'Self-Care', emoji: '🧘' },
    fitness: { name: 'Fitness', emoji: '🏃' },
    mindfulness: { name: 'Mindfulness', emoji: '🧠' },
    sleep: { name: 'Sleep', emoji: '😴' },
    'self-help': { name: 'Self-Help', emoji: '🌱' }
};

const quickTaskCategoryNames = {
    'self-care': { name: 'Self-Care', emoji: '💆🏻' },
    'physical': { name: 'Physical', emoji: '💪' },
    'sleep': { name: 'Sleep', emoji: '😴' },
    'tidy': { name: 'Tidy', emoji: '🧹' },
    'mindfulness': { name: 'Mindfulness', emoji: '🧘' }
};

// Update the entire Habits tab display
function updateHabitsDisplay() {
    const stats = getHabitStats();
    
    // Update overview stats
    document.getElementById('habitTotalTasks').textContent = stats.totalTasks || 0;
    document.getElementById('habitTotalQuickTasks').textContent = stats.totalQuickTasks || 0;
    
    // Update most completed category
    const mostCompleted = getMostCompletedCategory();
    const mostCompletedDisplay = document.getElementById('habitMostCompleted');
    if (mostCompleted.count > 0) {
        const categoryInfo = categoryDisplayNames[mostCompleted.category];
        mostCompletedDisplay.textContent = categoryInfo ? `${categoryInfo.emoji} ${categoryInfo.name}` : mostCompleted.category;
    } else {
        mostCompletedDisplay.textContent = '—';
    }
    
    // Update category chart
    updateCategoryChart();
    
    // Update quick task chart
    updateQuickTaskChart();
    
    // Update difficulty distribution
    const diffDist = getDifficultyDistribution();
    document.getElementById('habitEasyPercent').textContent = `${diffDist.easy}%`;
    document.getElementById('habitMediumPercent').textContent = `${diffDist.medium}%`;
    document.getElementById('habitHardPercent').textContent = `${diffDist.hard}%`;
    
    // Update priority distribution
    const priorDist = getPriorityDistribution();
    document.getElementById('habitLowPercent').textContent = `${priorDist.low}%`;
    document.getElementById('habitMediumPriorityPercent').textContent = `${priorDist.medium}%`;
    document.getElementById('habitHighPercent').textContent = `${priorDist.high}%`;
    
    // Update mood history display
    if (typeof MoodDialogueSystem !== 'undefined' && MoodDialogueSystem.updateMoodHistoryDisplay) {
        MoodDialogueSystem.updateMoodHistoryDisplay();
    }
}

// Update category chart with horizontal bars
function updateCategoryChart() {
    const sortedCategories = getSortedCategories();
    const chartContainer = document.getElementById('habitCategoriesChart');
    
    if (sortedCategories.length === 0 || sortedCategories.every(c => c.count === 0)) {
        chartContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No task data yet. Complete some tasks to see your habits!</p>';
        return;
    }
    
    const maxCount = Math.max(...sortedCategories.map(c => c.count), 1);
    
    chartContainer.innerHTML = sortedCategories.map(({ category, count }) => {
        // Add null check to prevent undefined errors
        const categoryInfo = categoryDisplayNames[category] || { name: category, emoji: '📝' };
        const percentage = (count / maxCount) * 100;
        
        return `
            <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">${categoryInfo.emoji}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${categoryInfo.name}</span>
                    </div>
                    <span style="font-weight: 700; color: var(--accent-primary);">${count}</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Update quick task chart with horizontal bars
function updateQuickTaskChart() {
    const sortedQuickTasks = getSortedQuickTaskCategories();
    const chartContainer = document.getElementById('habitQuickTaskChart');
    
    if (sortedQuickTasks.length === 0 || sortedQuickTasks.every(c => c.count === 0)) {
        chartContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No quick task data yet. Complete some quick tasks to see your habits!</p>';
        return;
    }
    
    const maxCount = Math.max(...sortedQuickTasks.map(c => c.count), 1);
    
    chartContainer.innerHTML = sortedQuickTasks.map(({ category, count }) => {
        // Add null check to prevent undefined errors
        const categoryInfo = quickTaskCategoryNames[category] || { name: category, emoji: '⚡' };
        const percentage = (count / maxCount) * 100;
        
        return `
            <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">${categoryInfo.emoji}</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${categoryInfo.name}</span>
                    </div>
                    <span style="font-weight: 700; color: var(--accent-tertiary);">${count}</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--accent-tertiary), #a78bfa); border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Export functions to global scope
window.updateHabitsDisplay = updateHabitsDisplay;
window.updateCategoryChart = updateCategoryChart;
window.updateQuickTaskChart = updateQuickTaskChart;
