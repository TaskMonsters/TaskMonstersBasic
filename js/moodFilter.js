/**
 * Mood-Based Quest Filtering
 * Filters quests based on user's selected mood without changing any UI
 */

// Initialize mood on startup
window.currentMood = localStorage.getItem('userMood') || 'neutral';

// Update mood-dependent content
function updateMoodDependentContent(mood) {
    if (!window.questGiver || !window.questGiver.questDatabase) {
        return; // Quest system not ready yet
    }
    
    const baseQuests = window.questGiver.questDatabase || [];
    let filtered = [...baseQuests];
    
    if (mood === 'sad') {
        filtered = baseQuests.filter(q =>
            ['Self-Care', 'Mindfulness', 'Grounding', 'Creative'].includes(q.category)
        );
    } else if (mood === 'neutral') {
        filtered = baseQuests.filter(q =>
            ['Self-Care', 'Productivity', 'Learning'].includes(q.category)
        );
    } else if (mood === 'happy') {
        filtered = baseQuests.filter(q =>
            ['Adventure', 'Fitness', 'Creative', 'Work'].includes(q.category)
        );
    }
    
    // Exclude social or dependent quests
    const excluded = ["call", "text", "message", "meet", "invite"];
    filtered = filtered.filter(q =>
        !excluded.some(w => q.text.toLowerCase().includes(w))
    );
    
    // Store filtered quests
    window.questGiver.filteredQuests = filtered.length > 0 ? filtered : baseQuests;
}

// Update getRandomQuest to use filtered quests
if (window.questGiver) {
    const originalGetRandomQuest = window.questGiver.getRandomQuest;
    window.questGiver.getRandomQuest = function() {
        const quests = this.filteredQuests || this.questDatabase;
        if (quests.length === 0) return originalGetRandomQuest.call(this);
        
        const randomIndex = Math.floor(Math.random() * quests.length);
        const quest = { ...quests[randomIndex] };
        quest.deadline = Date.now() + (quest.duration * 3600000);
        quest.type = 'quest';
        return quest;
    };
}

// Add mood button listeners
document.addEventListener('DOMContentLoaded', () => {
    // Apply current mood on load
    updateMoodDependentContent(window.currentMood);
    
    // Listen for mood button clicks
    document.querySelectorAll('.mood-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood; // "happy", "neutral", "sad"
            if (mood) {
                localStorage.setItem('userMood', mood);
                window.currentMood = mood;
                updateMoodDependentContent(mood);
            }
        });
    });
});

// Export for use in other modules
window.updateMoodDependentContent = updateMoodDependentContent;
