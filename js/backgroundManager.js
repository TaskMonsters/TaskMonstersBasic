// backgroundManager.js - Manages time-based background switching and custom themes

(function() {
  'use strict';
  
  const backgrounds = {
    day: 'assets/backgrounds/default-bg.png',
    night: 'assets/backgrounds/mountain-dusk.png'
  };
  
  function isNightTime() {
    const hour = new Date().getHours();
    // Consider night time as 6 PM (18:00) to 6 AM (6:00)
    return hour >= 18 || hour < 6;
  }
  
  function getActiveTheme() {
    // Check if user has an active custom theme
    if (window.gameState && window.gameState.activeTheme) {
      return window.gameState.activeTheme;
    }
    return null;
  }
  
  function updateBackground() {
    const activeTheme = getActiveTheme();
    let backgroundUrl;
    
    // Always check if it's night time for overlay logic
    const isNight = isNightTime();
    
    if (activeTheme) {
      // Use custom theme if active
      backgroundUrl = activeTheme;
    } else {
      // Use default day/night cycle
      backgroundUrl = isNight ? backgrounds.night : backgrounds.day;
    }
    
    // Update pet-rock-header background
    const petRockHeader = document.querySelector('.pet-rock-header');
    if (petRockHeader) {
      // Use setProperty with !important to override inline styles
      petRockHeader.style.setProperty('background-image', `url('${backgroundUrl}')`, 'important');
      petRockHeader.style.setProperty('background-size', 'cover', 'important');
      petRockHeader.style.setProperty('background-position', 'center', 'important');
      
      // Add or remove dimming overlay for night mode (only for default backgrounds, not custom themes)
      let overlay = petRockHeader.querySelector('.night-overlay');
      if (isNight && !activeTheme) {
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'night-overlay';
          overlay.style.cssText = 'position: absolute; inset: 0; background: rgba(0, 0, 0, 0.3); border-radius: 16px; pointer-events: none; z-index: 1;';
          petRockHeader.insertBefore(overlay, petRockHeader.firstChild);
        }
      } else {
        if (overlay) {
          overlay.remove();
        }
      }
      
      const mode = activeTheme ? 'custom theme' : (isNight ? 'night' : 'day');

    } else {
      console.warn('[BackgroundManager] Pet rock header not found, retrying...');
      // Retry after a short delay if element not found yet
      setTimeout(updateBackground, 100);
    }
  }
  
  function init() {

    // Wait for DOM to be fully loaded, then set initial background
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(updateBackground, 500);
      });
    } else {
      // Use a longer delay to ensure inline styles are applied first
      setTimeout(updateBackground, 500);
    }
    
    // Update background every minute to catch time changes
    setInterval(updateBackground, 60000);
  }
  
  // Initialize immediately
  init();
  
  // Expose functions globally for theme system
  window.applyTheme = function(themeUrl) {
    if (window.gameState) {
      window.gameState.activeTheme = themeUrl;
      if (typeof window.saveGameState === 'function') {
        window.saveGameState();
      }
      updateBackground();
      
      // FIX: Restart monster animation after theme change
      setTimeout(() => {
        if (window.skinsManager && typeof window.skinsManager.updateAllMonsterVisuals === 'function') {
          window.skinsManager.updateAllMonsterVisuals();

        }
      }, 100);
    }
  };
  
  window.unapplyTheme = function() {
    if (window.gameState) {
      window.gameState.activeTheme = null;
      if (typeof window.saveGameState === 'function') {
        window.saveGameState();
      }
      updateBackground();
      
      // FIX: Restart monster animation after theme change
      setTimeout(() => {
        if (window.skinsManager && typeof window.skinsManager.updateAllMonsterVisuals === 'function') {
          window.skinsManager.updateAllMonsterVisuals();

        }
      }, 100);
    }
  };
  
  window.refreshBackground = updateBackground;
})();

