/**
 * Buff Animation System
 * Displays visual effects over the hero sprite when using items/buffs
 */

// Play buff animation over hero sprite
async function playHeroBuffAnimation(type) {

    const heroSprite = document.getElementById('heroSprite');
    if (!heroSprite) {
        console.error('[BuffAnimation] Hero sprite not found!');
        return;
    }
    
    // Create overlay element for buff animation
    let buffOverlay = document.getElementById('heroBuffOverlay');
    if (!buffOverlay) {
        buffOverlay = document.createElement('img');
        buffOverlay.id = 'heroBuffOverlay';
        buffOverlay.style.position = 'absolute';
        buffOverlay.style.pointerEvents = 'none';
        buffOverlay.style.zIndex = '1000';
        buffOverlay.style.imageRendering = 'pixelated';
        
        // Insert overlay right after hero sprite
        heroSprite.parentElement.appendChild(buffOverlay);
    }
    
    // Determine which animation to use
    let animationPath = '';
    if (type === 'potion' || type === 'attack') {
        // Blue animation for potions and attack boosts
        animationPath = 'assets/effects/potion-boost-blue.gif';
    } else if (type === 'defend' || type === 'defense') {
        // Yellow animation for defend and defense boosts
        animationPath = 'assets/effects/defend-boost-yellow.gif';
    } else {
        console.warn('[BuffAnimation] Unknown buff type:', type);
        return;
    }
    
    // Position overlay over hero sprite
    const heroRect = heroSprite.getBoundingClientRect();
    const parentRect = heroSprite.parentElement.getBoundingClientRect();
    
    buffOverlay.style.left = (heroRect.left - parentRect.left) + 'px';
    buffOverlay.style.top = (heroRect.top - parentRect.top) + 'px';
    buffOverlay.style.width = heroRect.width + 'px';
    buffOverlay.style.height = heroRect.height + 'px';
    buffOverlay.style.objectFit = 'contain';
    
    // Set animation and make visible
    buffOverlay.src = animationPath + '?t=' + Date.now(); // Cache bust
    buffOverlay.style.opacity = '1';
    buffOverlay.style.display = 'block';


    // Wait for animation to complete (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fade out and hide
    buffOverlay.style.transition = 'opacity 0.3s';
    buffOverlay.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    buffOverlay.style.display = 'none';
    buffOverlay.src = '';

}

// Export to global scope
window.playHeroBuffAnimation = playHeroBuffAnimation;
