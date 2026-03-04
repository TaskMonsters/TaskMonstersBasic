/**
 * Sprite Animation Manager
 * Handles smooth sprite animations for all skins across all modes
 */

class SpriteAnimationManager {
    constructor() {
        this.activeAnimations = new Map(); // Track active animation loops
        this.preloadedImages = new Map(); // Cache loaded images
    }

    /**
     * Preload a sprite image
     */
    preloadImage(src) {
        if (this.preloadedImages.has(src)) {
            return Promise.resolve(this.preloadedImages.get(src));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.preloadedImages.set(src, img);
                resolve(img);
            };
            img.onerror = () => {
                console.error('[SpriteAnimationManager] Failed to load:', src);
                reject(new Error(`Failed to load sprite: ${src}`));
            };
            img.src = src;
        });
    }

    /**
     * Stop an animation loop
     */
    stopAnimation(elementId) {
        if (this.activeAnimations.has(elementId)) {
            const { intervalId, rafId } = this.activeAnimations.get(elementId);
            if (intervalId) clearInterval(intervalId);
            if (rafId) cancelAnimationFrame(rafId);
            this.activeAnimations.delete(elementId);

        }
    }

    /**
     * Start sprite animation for an element
     * @param {string} elementId - ID of the img element
     * @param {object} appearance - Appearance config from getActiveMonsterAppearance
     * @param {string} animationType - 'idle', 'walk', 'attack', etc.
     * @param {number} duration - Animation duration in ms (default: 800)
     */
    async startAnimation(elementId, appearance, animationType = 'idle', duration = 800) {
        // Stop any existing animation for this element
        this.stopAnimation(elementId);

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`[SpriteAnimationManager] Element not found: ${elementId}`);
            return;
        }

        // Get animation config
        const spriteSrc = appearance.animations[animationType];
        const frameCount = appearance.frameCount[animationType] || 4;
        // Check for animation-specific sprite size override
        const spriteSizeOverrides = appearance.spriteSizeOverrides || {};
        const spriteSize = spriteSizeOverrides[animationType] || appearance.spriteSize || { width: 32, height: 32 };
        const spriteRow = appearance.spriteRow || 0;
        const animationRows = appearance.animationRows || {};

        if (!spriteSrc) {
            console.error(`[SpriteAnimationManager] No sprite for animation: ${animationType}`);
            return;
        }

        // Preload the sprite
        try {
            await this.preloadImage(spriteSrc);
        } catch (error) {
            console.error(`[SpriteAnimationManager] Failed to preload sprite:`, error);
            return;
        }

        // Set up the element
        element.src = spriteSrc;
        element.style.imageRendering = 'pixelated';
        element.style.objectFit = 'none';

        // Calculate Y offset for multi-row sprites
        const rowIndex = animationRows[animationType] !== undefined ? animationRows[animationType] : spriteRow;
        const yOffset = rowIndex * spriteSize.height;

        // For single-frame animations, just set static position
        if (frameCount <= 1) {
            element.style.objectPosition = `0 -${yOffset}px`;
            element.style.animation = 'none';

            return;
        }

        // Animate through frames
        let currentFrame = 0;
        const frameDuration = duration / frameCount;

        const animate = () => {
            const xOffset = currentFrame * spriteSize.width;
            element.style.objectPosition = `-${xOffset}px -${yOffset}px`;
            
            currentFrame = (currentFrame + 1) % frameCount;
        };

        // Start animation loop
        animate(); // Set initial frame
        const intervalId = setInterval(animate, frameDuration);
        
        this.activeAnimations.set(elementId, { intervalId, rafId: null });

    }

    /**
     * Update all monster visuals with current equipped skin
     */
    async updateAllMonsterVisuals(baseMonster, equippedSkinId) {
        const appearance = window.getActiveMonsterAppearance(baseMonster, equippedSkinId);
        
        // Update main app hero sprite
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            await this.startAnimation('mainHeroSprite', appearance, 'idle', 800);
            
            // Ensure proper sizing — use 128px native display (no scale transform = no blur on mobile)
            mainHeroSprite.style.width = '128px';
            mainHeroSprite.style.height = '128px';
            mainHeroSprite.style.transform = 'none';
            mainHeroSprite.style.transformOrigin = 'center center';
        }

        // Update focus timer sprite
        const focusTimerSprite = document.getElementById('focusTimerMonsterSprite');
        if (focusTimerSprite) {
            await this.startAnimation('focusTimerMonsterSprite', appearance, 'idle', 800);
            
            // Ensure proper sizing
            focusTimerSprite.style.width = '32px';
            focusTimerSprite.style.height = '32px';
            focusTimerSprite.style.transform = 'scale(3)';
            focusTimerSprite.style.transformOrigin = 'center center';
        }

    }

    /**
     * Clean up all animations (call on page unload)
     */
    cleanup() {
        for (const [elementId] of this.activeAnimations) {
            this.stopAnimation(elementId);
        }
        this.preloadedImages.clear();

    }
}

// Create global instance
window.spriteAnimationManager = new SpriteAnimationManager();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    window.spriteAnimationManager.cleanup();
});
