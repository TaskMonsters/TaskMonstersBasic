/**
 * Merlin Modal - Quest Giver Triggered Only
 * Shows modal ONLY when quest giver mode triggers, NOT on app load
 */

// Function to show the Merlin modal (called by quest giver)
window.showMerlinModal = function() {
    const modal = document.getElementById('merlinModal');
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

// Function to hide the Merlin modal
window.hideMerlinModal = function() {
    const modal = document.getElementById('merlinModal');
    
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

// Set up button event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const questBtn = document.getElementById('merlinQuestBtn');
    const quizBtn = document.getElementById('merlinQuizBtn');
    
    const proceed = () => {
        window.hideMerlinModal();
        
        // Optional: Delay habit tracker transition if needed
        const habitTracker = document.getElementById('habitTracker');
        if (habitTracker) {
            habitTracker.style.transition = 'opacity 0.5s ease';
            habitTracker.style.opacity = '1';
            
            setTimeout(() => {
                habitTracker.style.opacity = '';
            }, 120000); // 120 seconds (2 minutes)
        }
    };
    
    if (questBtn) {
        questBtn.addEventListener('click', proceed);
    }
    
    if (quizBtn) {
        quizBtn.addEventListener('click', proceed);
    }
});
