// Instant State Hydration - Prevents Reset Flash
// This script runs BEFORE any UI rendering to eliminate flicker

(function() {
    'use strict';
    
    // Hide body immediately until hydration completes
    document.documentElement.style.visibility = 'hidden';
    
    try {
        const saved = localStorage.getItem('taskRockGameState');
        
        if (saved) {
            const state = JSON.parse(saved);
            
            // Pre-apply dark mode (critical for preventing flash)
            if (state.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
            
            // Store hydrated state globally for instant access
            window.__HYDRATED_STATE__ = state;

        } else {

        }
    } catch (e) {
        console.warn('⚠️ Pre-hydration failed:', e);
    }
    
    // UI will be revealed after loadGameState() completes in DOMContentLoaded
})();
