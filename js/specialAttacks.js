/**
 * Special Attack System
 * Implements unique special attacks for Luna, Benny, and Nova
 */

// Play special attack projectile animation
async function playSpecialAttackProjectile(monsterName, fromElement, toElement) {
    return new Promise((resolve) => {
        const projectileGifs = {
            'Luna': 'assets/heroes/LunaSpecialAttackProjectile.gif',
            'Benny': 'assets/heroes/BennySpecialAttackProjectile.gif',
            'Nova': 'assets/heroes/NovaSpecialAttackProjectile.gif'
        };
        
        const gifPath = projectileGifs[monsterName];
        if (!gifPath || !fromElement || !toElement) {
            resolve();
            return;
        }
        
        // Use rAF to ensure layout is fully painted before measuring positions
        requestAnimationFrame(() => {
            const fromRect = fromElement.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();
            
            // Fallback if elements have zero dimensions (not yet visible)
            const startX = fromRect.width > 0 ? fromRect.right : window.innerWidth * 0.25;
            const startY = fromRect.height > 0 ? (fromRect.top + fromRect.height / 2 - 24) : window.innerHeight * 0.4;
            const endX = toRect.width > 0 ? (toRect.left + toRect.width / 2 - 24) : window.innerWidth * 0.75;
            const endY = toRect.height > 0 ? (toRect.top + toRect.height / 2 - 24) : window.innerHeight * 0.4;
            
            // Cache-bust the GIF src so the browser always replays from frame 1
            const cacheBust = `?t=${Date.now()}`;
            
            // Create projectile element
            const projectile = document.createElement('img');
            projectile.src = gifPath + cacheBust;
            projectile.style.cssText = [
                'position: fixed',
                `left: ${startX}px`,
                `top: ${startY}px`,
                'width: 48px',
                'height: 48px',
                'z-index: 99999',
                'pointer-events: none',
                'image-rendering: pixelated',
                'image-rendering: -moz-crisp-edges',
                'image-rendering: crisp-edges',
                'transition: none',
                'will-change: left, top',
                'display: block'
            ].join('; ');
            
            document.body.appendChild(projectile);
            
            // Two-frame delay to ensure the element is rendered before transitioning
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    projectile.style.transition = 'left 0.5s ease-out, top 0.5s ease-out';
                    projectile.style.left = endX + 'px';
                    projectile.style.top = endY + 'px';
                });
            });
            
            // Remove after animation + brief flash
            setTimeout(() => {
                if (projectile.parentNode) {
                    projectile.remove();
                }
                resolve();
            }, 700);
        });
    });
}

// Player uses special attack
async function playerSpecialAttack() {
    if (!window.battleManager) return;
    
    const manager = window.battleManager;
    
    // === STUN / DAZE CHECK ===
    if (manager.heroStunnedTurns > 0) {
        if (typeof stopTurnTimer === 'function') stopTurnTimer();
        manager.heroStunnedTurns--;
        addBattleLog(`😵 You are stunned! Turn skipped! (${manager.heroStunnedTurns} turns remaining)`);
        updateBattleUI(manager.hero, manager.enemy);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await manager.enemyTurn();
        return;
    }
    
    // FIX: Use gameState.jerryLevel (the actual level source), not manager.hero.level
    const level = window.gameState?.jerryLevel || manager.hero?.level || 1;
    
    // Check if special attack is unlocked (Level 10+)
    if (level < 10) {
        addBattleLog('⚠️ Special Attack unlocks at Level 10!');
        return;
    }
    
    // FIX: Read gauge from gameState directly (element ID was 'specialGaugeText', not 'specialAttackValue')
    const specialGauge = window.gameState?.specialAttackGauge || 0;
    if (specialGauge < 100) {
        addBattleLog('⚠️ Special Attack gauge not full!');
        return;
    }
    
    // Stop turn timer
    if (typeof stopTurnTimer === 'function') {
        stopTurnTimer();
    }
    if (manager.stopTurnTimer) {
        manager.stopTurnTimer();
    }
    
    // Get DEFAULT monster (not equipped skin) for special attack
    const baseMonsterId = localStorage.getItem('selectedMonster') || 'nova';
    const monsterNameMap = {
        luna: 'Luna',
        benny: 'Benny',
        nova: 'Nova'
    };
    const monsterName = monsterNameMap[baseMonsterId.toLowerCase()] || 'Nova';

    // Play hero attack animation
    if (window.startHeroAnimation) {
        window.startHeroAnimation('attack1');
    }
    
    // Play projectile animation — fire from hero sprite to enemy sprite
    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    await playSpecialAttackProjectile(monsterName, heroSprite, enemySprite);
    
    // Execute special attack based on monster
    let damage = 0;
    let specialEffect = '';
    
    // Damage scales with level: base damage + (level * 2)
    const levelMultiplier = Math.floor(level / 10); // +1 every 10 levels
    
    switch(monsterName) {
        case 'Nova':
            // Nova Spirit: 30 damage + 20 damage for 2 turns
            damage = 30 + (levelMultiplier * 5);
            const burnDamage = 20 + (levelMultiplier * 3);
            manager.burnTurns = 2;
            manager.burnDamage = burnDamage;
            specialEffect = `🔥 Nova Spirit! ${damage} damage + ${burnDamage} burn damage for 2 turns!`;
            break;
            
        case 'Luna':
            // Luna's Eclipse: 20 damage + deflects next enemy attack
            damage = 20 + (levelMultiplier * 4);
            manager.deflectActive = true;
            specialEffect = `🌙 Luna's Eclipse! ${damage} damage + next attack deflected!`;
            break;
            
        case 'Benny':
            // Benny Bubble: Absorbs 40-50 HP + defense immune for 2 turns
            const absorbAmount = Math.floor(Math.random() * 11) + 40 + (levelMultiplier * 5); // 40-50 + level bonus
            damage = absorbAmount;
            const healAmount = Math.min(absorbAmount, manager.hero.maxHP - manager.hero.hp);
            manager.hero.hp = Math.min(manager.hero.hp + healAmount, manager.hero.maxHP);
            manager.defenseImmune = 2;
            specialEffect = `💚 Benny Bubble! Absorbed ${absorbAmount} HP + defense immune for 2 turns!`;
            break;
            
        default:
            // Default special attack
            damage = 25 + (levelMultiplier * 4);
            specialEffect = `⚡ Special Attack! ${damage} damage!`;
    }
    
    // Apply Battle Glove damage boost if active
    damage = manager.applyDamageBoost(damage);
    
    // Apply damage to enemy
    const isDead = manager.enemy.takeDamage(damage);
    
    // Play enemy hurt animation
    if (window.playEnemyAnimation) {
        await window.playEnemyAnimation(manager.enemy, 'hurt', 300);
    }
    
    // Reset special gauge
    if (window.resetSpecialGauge) {
        window.resetSpecialGauge();
    }
    
    // Add battle log
    addBattleLog(specialEffect);
    
    // Update UI
    if (typeof updateBattleUI === 'function') {
        updateBattleUI(manager.hero, manager.enemy);
    } else {
        manager.updateBattleUI();
    }
    
    // Return to idle
    if (window.startHeroAnimation) {
        window.startHeroAnimation('idle');
    }
    
    // Check if enemy died
    if (isDead) {
        await manager.handleVictory();
        return;
    }
    
    // Enemy turn
    await manager.enemyTurn();
}

// Export to global scope
window.playerSpecialAttack = playerSpecialAttack;
window.playSpecialAttackProjectile = playSpecialAttackProjectile;
