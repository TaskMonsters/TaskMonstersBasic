/**
 * Enemy Animation System - GIF-based
 * Uses GIF animations instead of sprite sheets for simplicity and reliability
 * 
 * NOTE: Enemy class is defined in enemy.js
 * This file only handles animation playback
 */

// Play enemy animation using GIF files
function playEnemyAnimation(enemy, animationKey, duration = 500) {
    return new Promise((resolve) => {
        // Try both possible sprite element IDs
        let spriteElement = document.getElementById('enemySprite');
        if (!spriteElement) {
            spriteElement = document.getElementById('battleEnemySprite');
        }
        
        if (!spriteElement || !enemy) {
            console.warn('[EnemyAnimation] Sprite element or enemy not found');
            resolve();
            return;
        }
        
        // Check if enemy has config with assets (new BATTLE_ENEMIES system)
        let animationPath = null;
        if (enemy.config && enemy.config.assets) {
            // Use new BATTLE_ENEMIES config
            switch(animationKey) {
                case 'idle':
                    animationPath = enemy.config.assets.idle;
                    break;
                case 'attack1':
                case 'attack2':
                case 'attack':
                    animationPath = enemy.config.assets.attack;
                    break;
                case 'hurt':
                    animationPath = enemy.config.assets.hurt;
                    break;
                case 'death':
                case 'die':
                    animationPath = enemy.config.assets.die || enemy.config.assets.hurt;
                    break;
                default:
                    animationPath = enemy.config.assets.idle;
            }
        } else if (enemy.sprites) {
            // Use sprites object from enemy data (CORRECT METHOD)
            switch(animationKey) {
                case 'idle':
                    animationPath = enemy.sprites.idle;
                    break;
                case 'attack1':
                case 'attack2':
                case 'attack':
                    animationPath = enemy.sprites.attack || enemy.sprites.idle;
                    break;
                case 'hurt':
                    animationPath = enemy.sprites.hurt || enemy.sprites.idle;
                    break;
                case 'death':
                case 'die':
                    animationPath = enemy.sprites.death || enemy.sprites.hurt || enemy.sprites.idle;
                    break;
                default:
                    animationPath = enemy.sprites.idle;
            }
        } else {
            // Final fallback if no sprites defined
            console.error('[EnemyAnimation] Enemy has no sprites defined:', enemy);
            animationPath = 'assets/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif'; // Safe fallback
        }

        // CRITICAL FIX: Clear any background image to prevent overlay
        spriteElement.style.backgroundImage = 'none';
        spriteElement.style.background = 'none';
        
        // Set the animation using img src (not background image)
        spriteElement.src = animationPath;
        
        // Ensure sprite remains visible
        spriteElement.style.display = 'block';
        spriteElement.style.visibility = 'visible';
        spriteElement.style.opacity = '1';
        
        // Add hurt flash effect for hurt animation
        if (animationKey === 'hurt') {
            spriteElement.classList.add('enemy-hurt-flash');
            setTimeout(() => {
                spriteElement.classList.remove('enemy-hurt-flash');
            }, duration);
        }
        
        // Resolve after duration
        setTimeout(() => {
            // Return to idle after animation completes (except for death)
            if (animationKey !== 'death' && animationKey !== 'die') {
                let idleAnimation = null;
                if (enemy.config && enemy.config.assets) {
                    idleAnimation = enemy.config.assets.idle;
                } else if (enemy.sprites) {
                    idleAnimation = enemy.sprites.idle;
                } else {
                    // Final fallback
                    idleAnimation = 'assets/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif';
                }
                
                // CRITICAL FIX: Clear background before setting idle
                spriteElement.style.backgroundImage = 'none';
                spriteElement.style.background = 'none';
                spriteElement.src = idleAnimation;
                
                // Ensure sprite remains visible
                spriteElement.style.display = 'block';
                spriteElement.style.visibility = 'visible';
                spriteElement.style.opacity = '1';

            }
            resolve();
        }, duration);
    });
}

// Initialize enemy sprite with idle animation
function initEnemySprite(enemy) {

    const spriteElement = document.getElementById('enemySprite');
    if (!spriteElement) {
        console.error('[InitEnemy] Enemy sprite element not found!');
        return;
    }
    if (!enemy) {
        console.error('[InitEnemy] Enemy object is null/undefined!');
        return;
    }
    
    const enemyName = enemy.name;

    // FIXED: Use enemy.sprites object (already defined in enemy data)
    let idleGif = null;
    if (enemy.sprites && enemy.sprites.idle) {
        idleGif = enemy.sprites.idle;

    } else if (enemy.config && enemy.config.assets && enemy.config.assets.idle) {
        idleGif = enemy.config.assets.idle;

    } else {
        // Final fallback
        console.warn('[InitEnemy] No sprites defined for enemy, using fallback');
        idleGif = 'assets/enemies/Lazy Bat/Lazy Bat-IdleFly-animated.gif';
    }
    
    // CRITICAL FIX: Clear any background image to prevent overlay
    spriteElement.style.backgroundImage = 'none';
    spriteElement.style.background = 'none';
    
    // Set as img src (element is now <img> not <div>)

    spriteElement.src = idleGif;
    spriteElement.style.width = '32px';
    spriteElement.style.height = '32px';
    spriteElement.style.objectFit = 'contain';
    
    // Energy Vampire Bat is oversized - reduce by 1.5x (4 / 1.5 ≈ 2.67)
    const batScale = (enemyName === 'Energy Vampire Bat') ? 2.67 : 4;
    spriteElement.style.transform = `scale(${batScale})`;
    
    spriteElement.style.imageRendering = 'pixelated';
    spriteElement.style.opacity = '1';
    spriteElement.style.display = 'block';
    spriteElement.style.visibility = 'visible';



}

// Export to global scope
window.playEnemyAnimation = playEnemyAnimation;
window.initEnemySprite = initEnemySprite;
