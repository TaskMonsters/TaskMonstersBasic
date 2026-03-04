/**
 * BATTLE EFFECTS MANAGER
 * Handles visual effects, animations, and damage numbers
 */

class BattleEffectsManager {
    constructor() {
        this.activeEffects = [];
        
        // Effect configuration
        this.config = {
            damageNumberDuration: 1500,
            attackAnimationDuration: 600,
            abilityAnimationDuration: 1200,
            focusChargeAnimationDuration: 2000,
            batHazardDuration: 1000
        };
    }
    
    /**
     * SHOW DAMAGE NUMBER
     * Displays floating damage number above target
     */
    showDamageNumber(damage, target, isCritical = false) {
        const targetElement = document.getElementById(target === 'player' ? 'playerSprite' : 'enemySprite');
        if (!targetElement) return;
        
        // Create damage number element
        const damageNumber = document.createElement('div');
        damageNumber.className = `damage-number ${isCritical ? 'critical' : ''}`;
        damageNumber.textContent = `-${Math.round(damage)} HP`;
        
        // Position above target
        const rect = targetElement.getBoundingClientRect();
        damageNumber.style.position = 'absolute';
        damageNumber.style.left = `${rect.left + rect.width / 2}px`;
        damageNumber.style.top = `${rect.top}px`;
        damageNumber.style.zIndex = '1000';
        
        document.body.appendChild(damageNumber);
        
        // Animate
        setTimeout(() => {
            damageNumber.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            damageNumber.classList.remove('show');
            setTimeout(() => {
                damageNumber.remove();
            }, 300);
        }, this.config.damageNumberDuration);
    }
    
    /**
     * SHOW HEAL EFFECT
     * Displays healing animation
     */
    showHealEffect(target) {
        const targetElement = document.getElementById(target === 'player' ? 'playerSprite' : 'enemySprite');
        if (!targetElement) return;
        
        // Create heal effect
        const healEffect = document.createElement('div');
        healEffect.className = 'heal-effect';
        healEffect.innerHTML = '+';
        
        // Position above target
        const rect = targetElement.getBoundingClientRect();
        healEffect.style.position = 'absolute';
        healEffect.style.left = `${rect.left + rect.width / 2}px`;
        healEffect.style.top = `${rect.top}px`;
        healEffect.style.zIndex = '1000';
        
        document.body.appendChild(healEffect);
        
        // Animate
        setTimeout(() => {
            healEffect.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            healEffect.remove();
        }, 1500);
    }
    
    /**
     * PLAY ATTACK ANIMATION
     * Animates sprite during attack
     */
    playAttackAnimation(attacker) {
        const spriteElement = document.getElementById(attacker === 'player' ? 'playerSprite' : 'enemySprite');
        if (!spriteElement) return;
        
        // Add attack class
        spriteElement.classList.add('attacking');
        
        // Remove after duration
        setTimeout(() => {
            spriteElement.classList.remove('attacking');
        }, this.config.attackAnimationDuration);
    }
    
    /**
     * PLAY ABILITY ANIMATION
     * Shows ability-specific visual effect
     */
    playAbilityAnimation(abilityName) {
        const battleArena = document.getElementById('battleArena');
        if (!battleArena) return;
        
        // Create ability effect overlay
        const abilityEffect = document.createElement('div');
        abilityEffect.className = `ability-effect ability-${this.sanitizeAbilityName(abilityName)}`;
        
        battleArena.appendChild(abilityEffect);
        
        // Animate
        setTimeout(() => {
            abilityEffect.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            abilityEffect.remove();
        }, this.config.abilityAnimationDuration);
    }
    
    /**
     * SHOW FOCUS CHARGE ATTACK
     * Special animation for Focus Charge
     */
    showFocusChargeAttack() {
        const battleArena = document.getElementById('battleArena');
        if (!battleArena) return;
        
        // Create Focus Charge effect
        const focusEffect = document.createElement('div');
        focusEffect.className = 'focus-charge-effect';
        focusEffect.innerHTML = `
            <div class="focus-charge-beam"></div>
            <div class="focus-charge-impact"></div>
        `;
        
        battleArena.appendChild(focusEffect);
        
        // Animate
        setTimeout(() => {
            focusEffect.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            focusEffect.remove();
        }, this.config.focusChargeAnimationDuration);
        
        // Screen shake
        this.screenShake();
    }
    
    /**
     * SHOW BAT HAZARD
     * Illusion Realm bat swooping animation
     */
    showBatHazard() {
        const battleArena = document.getElementById('battleArena');
        if (!battleArena) return;
        
        // Create bat sprite
        const bat = document.createElement('div');
        bat.className = 'bat-hazard';
        bat.innerHTML = '🦇';
        
        battleArena.appendChild(bat);
        
        // Animate swooping
        setTimeout(() => {
            bat.classList.add('swooping');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            bat.remove();
        }, this.config.batHazardDuration);
    }
    
    /**
     * SHOW ENEMY DEATH
     * Victory animation
     */
    showEnemyDeath() {
        const enemySprite = document.getElementById('enemySprite');
        if (!enemySprite) return;
        
        // Add death animation class
        enemySprite.classList.add('defeated');
        
        // Create explosion effect
        const explosion = document.createElement('div');
        explosion.className = 'enemy-explosion';
        
        const rect = enemySprite.getBoundingClientRect();
        explosion.style.position = 'absolute';
        explosion.style.left = `${rect.left + rect.width / 2}px`;
        explosion.style.top = `${rect.top + rect.height / 2}px`;
        explosion.style.zIndex = '999';
        
        document.body.appendChild(explosion);
        
        // Animate
        setTimeout(() => {
            explosion.classList.add('explode');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            explosion.remove();
        }, 1000);
    }
    
    /**
     * SCREEN SHAKE
     * Shake effect for powerful attacks
     */
    screenShake(intensity = 'medium') {
        const battleArena = document.getElementById('battleArena');
        if (!battleArena) return;
        
        const shakeClass = `shake-${intensity}`;
        battleArena.classList.add(shakeClass);
        
        setTimeout(() => {
            battleArena.classList.remove(shakeClass);
        }, 500);
    }
    
    /**
     * SHOW PROJECTILE
     * Displays projectile animation from attacker to target
     */
    showProjectile(projectileType, fromTarget, toTarget) {
        const fromElement = document.getElementById(fromTarget === 'player' ? 'playerSprite' : 'enemySprite');
        const toElement = document.getElementById(toTarget === 'player' ? 'playerSprite' : 'enemySprite');
        
        if (!fromElement || !toElement) return;
        
        // Get positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Create projectile
        const projectile = document.createElement('div');
        projectile.className = `projectile projectile-${projectileType}`;
        projectile.style.position = 'absolute';
        projectile.style.left = `${fromRect.left + fromRect.width / 2}px`;
        projectile.style.top = `${fromRect.top + fromRect.height / 2}px`;
        projectile.style.zIndex = '998';
        
        document.body.appendChild(projectile);
        
        // Animate to target
        setTimeout(() => {
            projectile.style.left = `${toRect.left + toRect.width / 2}px`;
            projectile.style.top = `${toRect.top + toRect.height / 2}px`;
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            projectile.remove();
        }, 600);
    }
    
    /**
     * SHOW STATUS EFFECT
     * Display status effect icon above target
     */
    showStatusEffect(target, effectType, duration = 3000) {
        const targetElement = document.getElementById(target === 'player' ? 'playerSprite' : 'enemySprite');
        if (!targetElement) return;
        
        // Create status icon
        const statusIcon = document.createElement('div');
        statusIcon.className = `status-effect status-${effectType}`;
        
        const rect = targetElement.getBoundingClientRect();
        statusIcon.style.position = 'absolute';
        statusIcon.style.left = `${rect.left + rect.width - 30}px`;
        statusIcon.style.top = `${rect.top}px`;
        statusIcon.style.zIndex = '997';
        
        document.body.appendChild(statusIcon);
        
        // Remove after duration
        setTimeout(() => {
            statusIcon.remove();
        }, duration);
    }
    
    /**
     * FLASH SCREEN
     * Flash effect for critical moments
     */
    flashScreen(color = 'white') {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        flash.style.backgroundColor = color;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            flash.remove();
        }, 300);
    }
    
    /**
     * UTILITY METHODS
     */
    
    sanitizeAbilityName(name) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    /**
     * CLEAR ALL EFFECTS
     */
    clearAllEffects() {
        // Remove all active effect elements
        const effects = document.querySelectorAll('.damage-number, .heal-effect, .ability-effect, .focus-charge-effect, .bat-hazard, .projectile, .status-effect, .screen-flash');
        effects.forEach(effect => effect.remove());
        
        // Clear active effects array
        this.activeEffects = [];
    }
}

// Export
if (typeof window !== 'undefined') {
    window.BattleEffectsManager = BattleEffectsManager;
}
