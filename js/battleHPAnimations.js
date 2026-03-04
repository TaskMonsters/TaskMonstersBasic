/**
 * BATTLE HP ANIMATIONS
 * Shows floating damage and heal numbers above sprites during battle
 */

// Show damage animation above a sprite (-HP in red)
function showBattleDamageAnimation(spriteId, damage) {
    const sprite = document.getElementById(spriteId);
    if (!sprite || !sprite.parentElement) return;
    
    // Create damage text element
    const damageText = document.createElement('div');
    damageText.textContent = `-${damage} HP`;
    damageText.style.position = 'absolute';
    damageText.style.left = '50%';
    damageText.style.top = '-20px';
    damageText.style.transform = 'translateX(-50%)';
    damageText.style.fontSize = '24px';
    damageText.style.fontWeight = 'bold';
    damageText.style.color = '#ef4444'; // Red color
    damageText.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)';
    damageText.style.pointerEvents = 'none';
    damageText.style.zIndex = '1000';
    damageText.style.animation = 'xpFloat 2s ease-out forwards';
    
    // Add to sprite's parent container
    sprite.parentElement.appendChild(damageText);
    
    // Remove after animation completes
    setTimeout(() => {
        if (damageText.parentElement) {
            damageText.parentElement.removeChild(damageText);
        }
    }, 2000);
}

// Show heal animation above a sprite (+HP in blue)
function showBattleHealAnimation(spriteId, healAmount) {
    const sprite = document.getElementById(spriteId);
    if (!sprite || !sprite.parentElement) return;
    
    // Create heal text element
    const healText = document.createElement('div');
    healText.textContent = `+${healAmount} HP`;
    healText.style.position = 'absolute';
    healText.style.left = '50%';
    healText.style.top = '-20px';
    healText.style.transform = 'translateX(-50%)';
    healText.style.fontSize = '24px';
    healText.style.fontWeight = 'bold';
    healText.style.color = '#3b82f6'; // Blue color
    healText.style.textShadow = '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)';
    healText.style.pointerEvents = 'none';
    healText.style.zIndex = '1000';
    healText.style.animation = 'xpFloat 2s ease-out forwards';
    
    // Add to sprite's parent container
    sprite.parentElement.appendChild(healText);
    
    // Remove after animation completes
    setTimeout(() => {
        if (healText.parentElement) {
            healText.parentElement.removeChild(healText);
        }
    }, 2000);
}

// Show damage boost animation above a sprite (+30 in purple)
function showBattleDamageBoostAnimation(spriteId, boostAmount) {
    const sprite = document.getElementById(spriteId);
    if (!sprite || !sprite.parentElement) return;
    
    // Create boost text element
    const boostText = document.createElement('div');
    boostText.textContent = `+${boostAmount}`;
    boostText.style.position = 'absolute';
    boostText.style.left = '50%';
    boostText.style.top = '-20px';
    boostText.style.transform = 'translateX(-50%)';
    boostText.style.fontSize = '28px';
    boostText.style.fontWeight = 'bold';
    boostText.style.color = '#a855f7'; // Purple color
    boostText.style.textShadow = '0 0 15px rgba(168, 85, 247, 0.9), 0 0 25px rgba(168, 85, 247, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8)';
    boostText.style.pointerEvents = 'none';
    boostText.style.zIndex = '1000';
    boostText.style.animation = 'xpFloat 2s ease-out forwards';
    
    // Add to sprite's parent container
    sprite.parentElement.appendChild(boostText);
    
    // Remove after animation completes
    setTimeout(() => {
        if (boostText.parentElement) {
            boostText.parentElement.removeChild(boostText);
        }
    }, 2000);
}

// Expose functions globally
window.showBattleDamageAnimation = showBattleDamageAnimation;
window.showBattleHealAnimation = showBattleHealAnimation;
window.showBattleDamageBoostAnimation = showBattleDamageBoostAnimation;
