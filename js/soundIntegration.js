/**
 * Sound Integration - Minimal wrapper to add sounds to existing battle functions
 * Optimized for low processing power
 */

(function() {
    'use strict';
    
    // Wait for battleManager to be available
    const initSoundIntegration = () => {
        if (!window.battleManager || !window.audioManager) {
            return;
        }
        
        // Wrap existing attack functions to add sounds
        const originalPlayerFireball = window.battleManager.playerFireball;
        if (originalPlayerFireball) {
            window.battleManager.playerFireball = async function() {
                // Play sound before attack
                if (window.audioManager && this.state === 0 && this.attackGauge >= 30 && (gameState.battleInventory?.fireball || 0) > 0) {
                    window.audioManager.playSound('spark_attack');
                }
                return originalPlayerFireball.call(this);
            };
        }
        
        const originalPlayerSpark = window.battleManager.playerSpark;
        if (originalPlayerSpark) {
            window.battleManager.playerSpark = async function() {
                // Play sound before attack
                if (window.audioManager && this.state === 0 && this.attackGauge >= 25 && (gameState.battleInventory?.spark || 0) > 0) {
                    window.audioManager.playSound('spark_attack');
                }
                return originalPlayerSpark.call(this);
            };
        }
        
        const originalPlayerPrickler = window.battleManager.playerPrickler;
        if (originalPlayerPrickler) {
            window.battleManager.playerPrickler = async function() {
                // Play sound before attack
                if (window.audioManager && this.state === 0 && this.attackGauge >= 20 && (gameState.battleInventory?.prickler || 0) > 0) {
                    window.audioManager.playSound('prickler_attack');
                }
                return originalPlayerPrickler.call(this);
            };
        }
        
        const originalPlayerFreeze = window.battleManager.playerFreeze;
        if (originalPlayerFreeze) {
            window.battleManager.playerFreeze = async function() {
                // Play sound before attack
                if (window.audioManager && this.state === 0 && this.attackGauge >= 35 && (gameState.battleInventory?.freeze || 0) > 0) {
                    window.audioManager.playSound('freeze_attack');
                }
                return originalPlayerFreeze.call(this);
            };
        }
        
        const originalPlayerBlueFlame = window.battleManager.playerBlueFlame;
        if (originalPlayerBlueFlame) {
            window.battleManager.playerBlueFlame = async function() {
                // Play sound before attack
                if (window.audioManager && this.state === 0 && this.attackGauge >= 20 && (gameState.battleInventory?.blue_flame || 0) > 0) {
                    window.audioManager.playSound('spark_attack');
                }
                return originalPlayerBlueFlame.call(this);
            };
        }
        
        const originalPlayerPotion = window.battleManager.playerPotion;
        if (originalPlayerPotion) {
            window.battleManager.playerPotion = async function() {
                // Play sound before use
                if (window.audioManager && this.state === 0 && (gameState.battleInventory?.health_potion || 0) > 0) {
                    window.audioManager.playSound('potion_use');
                }
                return originalPlayerPotion.call(this);
            };
        }
        
        const originalPlayerAttackRefill = window.battleManager.playerAttackRefill;
        if (originalPlayerAttackRefill) {
            window.battleManager.playerAttackRefill = async function() {
                // Play sound before use
                if (window.audioManager && this.state === 0 && (gameState.battleInventory?.attack_refill || 0) > 0) {
                    window.audioManager.playSound('potion_use');
                }
                return originalPlayerAttackRefill.call(this);
            };
        }
        
        const originalPlayerDefenseRefill = window.battleManager.playerDefenseRefill;
        if (originalPlayerDefenseRefill) {
            window.battleManager.playerDefenseRefill = async function() {
                // Play sound before use
                if (window.audioManager && this.state === 0 && (gameState.battleInventory?.defense_refill || 0) > 0) {
                    window.audioManager.playSound('potion_use');
                }
                return originalPlayerDefenseRefill.call(this);
            };
        }
        
        const originalPlayerInvisibilityCloak = window.battleManager.playerInvisibilityCloak;
        if (originalPlayerInvisibilityCloak) {
            window.battleManager.playerInvisibilityCloak = async function() {
                // Play sound before use
                if (window.audioManager && this.state === 0 && (gameState.battleInventory?.invisibility_cloak || 0) > 0) {
                    window.audioManager.playSound('cloak_use');
                }
                return originalPlayerInvisibilityCloak.call(this);
            };
        }
        
        const originalPlayerAttack = window.battleManager.playerAttack;
        if (originalPlayerAttack) {
            window.battleManager.playerAttack = async function() {
                const result = await originalPlayerAttack.call(this);
                
                // Play sounds after damage calculation (in next tick to avoid blocking)
                setTimeout(() => {
                    if (!window.audioManager) return;
                    
                    // Check if it was a 3rd attack
                    const heroLevel = gameState.level || 1;
                    if (this.attackCount % 3 === 0 && heroLevel >= 6) {
                        window.audioManager.playSound('third_attack');
                    }
                }, 100);
                
                return result;
            };
        }
        
        // Wrap special attacks to check for critical hits (damage > 10)
        const wrapCriticalHitCheck = (originalFunc, baseDamage) => {
            return async function() {
                const result = await originalFunc.call(this);
                
                // Check if damage was over 10 for critical hit sound
                setTimeout(() => {
                    if (window.audioManager && baseDamage > 10) {
                        window.audioManager.playSound('critical_hit');
                    }
                }, 150);
                
                return result;
            };
        };
        
        // Apply critical hit check to high-damage attacks
        if (window.battleManager.playerFireball) {
            const originalFireball = window.battleManager.playerFireball;
            window.battleManager.playerFireball = wrapCriticalHitCheck(originalFireball, 12);
        }
    };
    
    // Try to initialize immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initSoundIntegration, 500);
        });
    } else {
        setTimeout(initSoundIntegration, 500);
    }
})();
