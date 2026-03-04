// Battle UI Manager for Task Monsters

// Show battle arena with fade-in animation
function showBattle(hero, enemy) {
    const arena = document.getElementById('battleArena');
    arena.classList.remove('hidden');
    
    // Initialize UI elements
    updateBattleUI(hero, enemy);
    updateBattleButtonsVisibility();
    updateActionButtons(hero);  // Update item counts on battle start
}

// Update battle button visibility based on inventory
function updateBattleButtonsVisibility() {
    // Ensure battleInventory exists
    if (!gameState.battleInventory) {
        gameState.battleInventory = {
            fireball: 0,
            spark: 0,
            health_potion: 2,
            attack_refill: 2,
            defense_refill: 2,
            invisibility_cloak: 0,
            prickler: 0,
            freeze: 0,
            blue_flame: 0,
            procrastination_ghost: 0
        };
    }
    
    // Ensure unlockedBattleItems exists
    if (!gameState.unlockedBattleItems) {
        gameState.unlockedBattleItems = ['health_potion', 'attack_refill', 'defense_refill'];
    }
    
    const inventory = gameState.battleInventory || {};
    const unlockedItems = gameState.unlockedBattleItems || [];
    
    // Fireball button - only show if ever unlocked
    const fireballBtn = document.getElementById('btnFireball');
    const fireballCount = document.getElementById('fireballCount');
    const fireballQty = inventory.fireball || 0;
    if (fireballBtn && fireballCount) {
        if (unlockedItems.includes('fireball')) {
            fireballBtn.style.display = '';
            fireballCount.textContent = `(${fireballQty})`;
        } else {
            fireballBtn.style.display = 'none';
        }
    }
    
    // Potion button - only show if ever unlocked
    const potionBtn = document.getElementById('btnPotion');
    const potionCount = document.getElementById('potionCount');
    const potionQty = inventory.health_potion || 0;
    if (potionBtn && potionCount) {
        if (unlockedItems.includes('health_potion')) {
            potionBtn.style.display = '';
            potionCount.textContent = `(${potionQty})`;
        } else {
            potionBtn.style.display = 'none';
        }
    }
    
    // Attack+ button - only show if ever unlocked
    const attackRefillBtn = document.getElementById('btnAttackRefill');
    const attackRefillCount = document.getElementById('attackRefillCount');
    const attackRefillQty = inventory.attack_refill || 0;
    if (attackRefillBtn && attackRefillCount) {
        if (unlockedItems.includes('attack_refill')) {
            attackRefillBtn.style.display = '';
            attackRefillCount.textContent = `(${attackRefillQty})`;
        } else {
            attackRefillBtn.style.display = 'none';
        }
    }
    
    // Defense+ button - only show if ever unlocked
    const defenseRefillBtn = document.getElementById('btnDefenseRefill');
    const defenseRefillCount = document.getElementById('defenseRefillCount');
    const defenseRefillQty = inventory.defense_refill || 0;
    if (defenseRefillBtn && defenseRefillCount) {
        if (unlockedItems.includes('defense_refill')) {
            defenseRefillBtn.style.display = '';
            defenseRefillCount.textContent = `(${defenseRefillQty})`;
        } else {
            defenseRefillBtn.style.display = 'none';
        }
    }
    
    // Invisibility Cloak button - only show if ever unlocked
    const invisibilityCloakBtn = document.getElementById('btnInvisibilityCloak');
    const invisibilityCloakCount = document.getElementById('invisibilityCloakCount');
    const invisibilityCloakQty = inventory.invisibility_cloak || 0;
    if (invisibilityCloakBtn && invisibilityCloakCount) {
        if (unlockedItems.includes('invisibility_cloak')) {
            invisibilityCloakBtn.style.display = '';
            invisibilityCloakCount.textContent = `(${invisibilityCloakQty})`;
        } else {
            invisibilityCloakBtn.style.display = 'none';
        }
    }
    
    // Prickler button - only show if ever unlocked
    const pricklerBtn = document.getElementById('btnPrickler');
    const pricklerCount = document.getElementById('pricklerCount');
    const pricklerQty = inventory.prickler || 0;
    if (pricklerBtn && pricklerCount) {
        if (unlockedItems.includes('prickler')) {
            pricklerBtn.style.display = '';
            pricklerCount.textContent = `(${pricklerQty})`;
        } else {
            pricklerBtn.style.display = 'none';
        }
    }
    
    // Spark button - only show if ever unlocked
    const sparkBtn = document.getElementById('btnSpark');
    const sparkCount = document.getElementById('sparkCount');
    const sparkQty = inventory.spark || 0;
    if (sparkBtn && sparkCount) {
        if (unlockedItems.includes('spark')) {
            sparkBtn.style.display = '';
            sparkCount.textContent = `(${sparkQty})`;
        } else {
            sparkBtn.style.display = 'none';
        }
    }
    
    // Freeze button - only show if ever unlocked
    const freezeBtn = document.getElementById('btnFreeze');
    const freezeCount = document.getElementById('freezeCount');
    const freezeQty = inventory.freeze || 0;
    if (freezeBtn && freezeCount) {
        if (unlockedItems.includes('freeze')) {
            freezeBtn.style.display = '';
            freezeCount.textContent = `(${freezeQty})`;
        } else {
            freezeBtn.style.display = 'none';
        }
    }
    
    // Blue Flame button - only show if ever unlocked
    const blueFlameBtn = document.getElementById('btnBlueFlame');
    const blueFlameCount = document.getElementById('blueFlameCount');
    const blueFlameQty = inventory.blue_flame || 0;
    if (blueFlameBtn && blueFlameCount) {
        if (unlockedItems.includes('blue_flame')) {
            blueFlameBtn.style.display = '';
            blueFlameCount.textContent = `(${blueFlameQty})`;
        } else {
            blueFlameBtn.style.display = 'none';
        }
    }
    
    // Procrastination Ghost button - only show if ever unlocked
    const ghostBtn = document.getElementById('btnProcrastinationGhost');
    const ghostCount = document.getElementById('procrastinationGhostCount');
    const ghostQty = inventory.procrastination_ghost || 0;
    if (ghostBtn && ghostCount) {
        if (unlockedItems.includes('procrastination_ghost')) {
            ghostBtn.style.display = '';
            ghostCount.textContent = `(${ghostQty})`;
        } else {
            ghostBtn.style.display = 'none';
        }
    }
    
    // Throwing Stars button - only show if ever unlocked
    const throwingStarsBtn = document.getElementById('btnThrowingStar');
    const throwingStarsCount = document.getElementById('throwingStarsCount');
    const throwingStarsQty = inventory.throwing_stars || 0;
    if (throwingStarsBtn && throwingStarsCount) {
        if (unlockedItems.includes('throwing_stars')) {
            throwingStarsBtn.style.display = '';
            throwingStarsCount.textContent = `(${throwingStarsQty})`;
        } else {
            throwingStarsBtn.style.display = 'none';
        }
    }
    
    // Battle Glove button - only show if ever unlocked
    const battleGloveBtn = document.getElementById('btnBattleGlove');
    const battleGloveCount = document.getElementById('battleGloveCount');
    const battleGloveQty = inventory.battle_glove || 0;
    if (battleGloveBtn && battleGloveCount) {
        if (unlockedItems.includes('battle_glove')) {
            battleGloveBtn.style.display = '';
            battleGloveCount.textContent = `(${battleGloveQty})`;
        } else {
            battleGloveBtn.style.display = 'none';
        }
    }
    
    // Jade Dagger button - only show if ever unlocked
    const jadeDaggerBtn = document.getElementById('btnJadeDagger');
    const jadeDaggerCount = document.getElementById('jadeDaggerCount');
    const jadeDaggerQty = inventory.jade_dagger || 0;
    if (jadeDaggerBtn && jadeDaggerCount) {
        if (unlockedItems.includes('jade_dagger')) {
            jadeDaggerBtn.style.display = '';
            jadeDaggerCount.textContent = `(${jadeDaggerQty})`;
        } else {
            jadeDaggerBtn.style.display = 'none';
        }
    }
    
    // Wizard's Wand button - only show if ever unlocked
    const wizardsWandBtn = document.getElementById('btnWizardsWand');
    const wizardsWandCount = document.getElementById('wizardsWandCount');
    const wizardsWandQty = inventory.wizards_wand || 0;
    if (wizardsWandBtn && wizardsWandCount) {
        if (unlockedItems.includes('wizards_wand')) {
            wizardsWandBtn.style.display = '';
            wizardsWandCount.textContent = `(${wizardsWandQty})`;
        } else {
            wizardsWandBtn.style.display = 'none';
        }
    }
    
    // Mirror Attack button - only show if ever unlocked
    const mirrorAttackBtn = document.getElementById('btnMirrorAttack');
    const mirrorAttackCount = document.getElementById('mirrorAttackCount');
    const mirrorAttackQty = inventory.mirror_attack || 0;
    if (mirrorAttackBtn && mirrorAttackCount) {
        if (unlockedItems.includes('mirror_attack')) {
            mirrorAttackBtn.style.display = '';
            mirrorAttackCount.textContent = `(${mirrorAttackQty})`;
        } else {
            mirrorAttackBtn.style.display = 'none';
        }
    }
    
    // Poison Leaf button - only show if ever unlocked
    const poisonLeafBtn = document.getElementById('btnPoisonLeaf');
    const poisonLeafCount = document.getElementById('poisonLeafCount');
    const poisonLeafQty = inventory.poison_leaf || 0;
    if (poisonLeafBtn && poisonLeafCount) {
        if (unlockedItems.includes('poison_leaf')) {
            poisonLeafBtn.style.display = '';
            poisonLeafCount.textContent = `(${poisonLeafQty})`;
        } else {
            poisonLeafBtn.style.display = 'none';
        }
    }
    
    // Asteroid Attack button - only show if ever unlocked
    const asteroidBtn = document.getElementById('btnAsteroid');
    const asteroidCount = document.getElementById('asteroidCount');
    const asteroidQty = inventory.asteroid_attack || 0;
    if (asteroidBtn && asteroidCount) {
        if (unlockedItems.includes('asteroid_attack')) {
            asteroidBtn.style.display = '';
            asteroidCount.textContent = `(${asteroidQty})`;
        } else {
            asteroidBtn.style.display = 'none';
        }
    }
}

// Update battle UI elements (HP, gauges, sprites)
function updateBattleUI(hero, enemy) {
    // Update hero HP
    const heroHPBar = document.getElementById('heroHPBar');
    const heroHPText = document.getElementById('heroHPText');
    if (heroHPBar && heroHPText && hero) {
        // NaN guard: sanitize hp and maxHP before display
        const heroHp = isNaN(hero.hp) ? 0 : Math.max(0, Math.floor(hero.hp));
        const heroMaxHP = isNaN(hero.maxHP) || !hero.maxHP ? 100 : Math.floor(hero.maxHP);
        // Also fix the hero object itself if NaN crept in
        if (isNaN(hero.hp)) hero.hp = heroHp;
        const heroHPPercent = Math.min(100, (heroHp / heroMaxHP) * 100);
        heroHPBar.style.width = heroHPPercent + '%';
        heroHPText.textContent = `${heroHp}/${heroMaxHP}`;
    }

    // Update enemy HP
    const enemyHPBar = document.getElementById('enemyHPBar');
    const enemyHPText = document.getElementById('enemyHPText');
    if (enemyHPBar && enemyHPText && enemy) {
        // NaN guard: sanitize hp and maxHP before display
        const enemyHp = isNaN(enemy.hp) ? 0 : Math.max(0, Math.floor(enemy.hp));
        const enemyMaxHP = isNaN(enemy.maxHP) || !enemy.maxHP ? 100 : Math.floor(enemy.maxHP);
        if (isNaN(enemy.hp)) enemy.hp = enemyHp;
        const enemyHPPercent = Math.min(100, (enemyHp / enemyMaxHP) * 100);
        enemyHPBar.style.width = enemyHPPercent + '%';
        enemyHPText.textContent = `${enemyHp}/${enemyMaxHP}`;
    }

    // Update gauges
    const attackGaugeBar = document.getElementById('attackGaugeBar');
    const attackGaugeText = document.getElementById('attackGaugeText');
    if (attackGaugeBar && attackGaugeText && window.battleManager) {
        attackGaugeBar.style.width = battleManager.attackGauge + '%';
        attackGaugeText.textContent = `${battleManager.attackGauge}/100`;
    }

    const defenseGaugeBar = document.getElementById('defenseGaugeBar');
    const defenseGaugeText = document.getElementById('defenseGaugeText');
    if (defenseGaugeBar && defenseGaugeText && window.battleManager) {
        defenseGaugeBar.style.width = battleManager.defenseGauge + '%';
        defenseGaugeText.textContent = `${battleManager.defenseGauge}/100`;
    }
    
    // Update special attack gauge
    const specialGaugeBar = document.getElementById('specialGaugeBar');
    const specialGaugeText = document.getElementById('specialGaugeText');
    const specialGaugeContainer = document.getElementById('specialAttackGaugeContainer');
    const specialGauge = window.gameState.specialAttackGauge || 0;
    const userLevel = window.gameState.jerryLevel || 1;
    
    // Show/hide special attack gauge based on level
    if (specialGaugeContainer) {
        if (userLevel >= 10) {
            specialGaugeContainer.style.display = 'block';
        } else {
            specialGaugeContainer.style.display = 'none';
        }
    }
    
    if (specialGaugeBar) {
        specialGaugeBar.style.width = specialGauge + '%';
    }
    if (specialGaugeText) {
        specialGaugeText.textContent = `${specialGauge}/100`;
    }
}

// Update action button availability
function updateActionButtons(hero) {
    const btnAttack = document.getElementById('btnAttack');
    const btnDefend = document.getElementById('btnDefend');
    const btnSpecialAttack = document.getElementById('btnSpecialAttack');
    const btnFireball = document.getElementById('btnFireball');
    const btnPotion = document.getElementById('btnPotion');

    // Attack requires 10 attack gauge
    btnAttack.disabled = battleManager.attackGauge < 10;

    // Defend requires 20 defense gauge
    btnDefend.disabled = battleManager.defenseGauge < 20;
    
    // Special Attack requires full special gauge (100) AND Level 10+
    if (btnSpecialAttack) {
        const specialGauge = window.gameState.specialAttackGauge || 0;
        const userLevel = window.gameState.jerryLevel || 1;
        
        // Disable if level < 10 or gauge not full
        btnSpecialAttack.disabled = userLevel < 10 || specialGauge < 100;
        
        // Update button text based on level
        if (userLevel < 10) {
            btnSpecialAttack.textContent = `⚡ Special Attack (Lv10)`;
            btnSpecialAttack.style.background = '';
            btnSpecialAttack.style.boxShadow = '';
        } else {
            btnSpecialAttack.textContent = `⚡ Special Attack (${specialGauge}/100)`;
            
            // Highlight button when gauge is full
            if (specialGauge >= 100) {
                btnSpecialAttack.style.background = 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%)';
                btnSpecialAttack.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
            } else {
                btnSpecialAttack.style.background = '';
                btnSpecialAttack.style.boxShadow = '';
            }
        }
    }

    // Fireball requires 20 attack gauge AND inventory
    const fireballCount = gameState.battleInventory?.fireball || 0;
    const fireballCountSpan = btnFireball.querySelector('.item-count');
    if (fireballCountSpan) {
        fireballCountSpan.textContent = `(${fireballCount})`;
    }
    btnFireball.disabled = battleManager.attackGauge < 20 || fireballCount === 0;
    
    // Spark requires 25 attack gauge AND inventory (unlocked at level 7)
    const btnSpark = document.getElementById('btnSpark');
    if (btnSpark) {
        if (hero.level >= 7) {
            btnSpark.style.display = '';
            const sparkCount = gameState.battleInventory?.spark || 0;
            const sparkCountSpan = btnSpark.querySelector('.item-count');
            if (sparkCountSpan) {
                sparkCountSpan.textContent = `(${sparkCount})`;
            }
            btnSpark.disabled = battleManager.attackGauge < 25 || sparkCount === 0;
        } else {
            btnSpark.style.display = 'none';
        }
    }

    // Asteroid requires 15 attack gauge AND inventory (unlocked at level 1)
    const btnAsteroid = document.getElementById('btnAsteroid');
    if (btnAsteroid) {
        if (gameState.unlockedBattleItems?.includes('asteroid_attack')) {
            btnAsteroid.style.display = '';
            const asteroidCount = gameState.battleInventory?.asteroid_attack || 0;
            const asteroidCountSpan = btnAsteroid.querySelector('.item-count');
            if (asteroidCountSpan) {
                asteroidCountSpan.textContent = `(${asteroidCount})`;
            }
            btnAsteroid.disabled = battleManager.attackGauge < 15 || asteroidCount === 0;
        } else {
            btnAsteroid.style.display = 'none';
        }
    }

    // Prickler requires 20 attack ga    // Prickler (unlocked when purchased)
    const btnPrickler = document.getElementById('btnPrickler');
    if (btnPrickler) {
        const pricklerCount = gameState.battleInventory?.prickler || 0;
        // Show if owned
        if (pricklerCount > 0 || gameState.unlockedBattleItems?.includes('prickler')) {
            btnPrickler.style.display = '';
            const pricklerCountSpan = btnPrickler.querySelector('.item-count');
            if (pricklerCountSpan) {
                pricklerCountSpan.textContent = `(${pricklerCount})`;
            }
            btnPrickler.disabled = battleManager.attackGauge < 20 || pricklerCount === 0;
        } else {
            btnPrickler.style.display = 'none';
        }
    }    // Freeze requires 35 attack gauge AND inventory (unlocked at level 8)
    const btnFreeze = document.getElementById('btnFreeze');
    if (btnFreeze) {
        if (hero.level >= 8) {
            btnFreeze.style.display = '';
            const freezeCount = gameState.battleInventory?.freeze || 0;
            const freezeCountSpan = btnFreeze.querySelector('.item-count');
            if (freezeCountSpan) {
                freezeCountSpan.textContent = `(${freezeCount})`;
            }
            btnFreeze.disabled = battleManager.attackGauge < 35 || freezeCount === 0;
        } else {
            btnFreeze.style.display = 'none';
        }
    }

    // Potion requires inventory
    const potionCount = gameState.battleInventory?.health_potion || 0;
    const potionCountSpan = btnPotion.querySelector('.item-count');
    if (potionCountSpan) {
        potionCountSpan.textContent = `(${potionCount})`;
    }
    btnPotion.disabled = potionCount === 0;
    
    // Hyper Potion requires inventory
    const btnHyperPotion = document.getElementById('btnHyperPotion');
    if (btnHyperPotion) {
        const hyperPotionCount = gameState.battleInventory?.hyper_potion || 0;
        const hyperPotionCountSpan = btnHyperPotion.querySelector('.item-count');
        if (hyperPotionCountSpan) {
            hyperPotionCountSpan.textContent = `(${hyperPotionCount})`;
        }
        btnHyperPotion.disabled = hyperPotionCount === 0;
    }
    
    // Attack+ refill
    const btnAttackRefill = document.getElementById('btnAttackRefill');
    if (btnAttackRefill) {
        const attackRefillCount = gameState.battleInventory?.attack_refill || 0;
        const attackRefillCountSpan = btnAttackRefill.querySelector('.item-count');
        if (attackRefillCountSpan) {
            attackRefillCountSpan.textContent = `(${attackRefillCount})`;
        }
        btnAttackRefill.disabled = attackRefillCount === 0;
    }
    
    // Defense+ refill
    const btnDefenseRefill = document.getElementById('btnDefenseRefill');
    if (btnDefenseRefill) {
        const defenseRefillCount = gameState.battleInventory?.defense_refill || 0;
        const defenseRefillCountSpan = btnDefenseRefill.querySelector('.item-count');
        if (defenseRefillCountSpan) {
            defenseRefillCountSpan.textContent = `(${defenseRefillCount})`;
        }
        btnDefenseRefill.disabled = defenseRefillCount === 0;
    }
    
    // Invisibility Cloak
    const btnInvisibilityCloak = document.getElementById('btnInvisibilityCloak');
    if (btnInvisibilityCloak) {
        const invisibilityCloakCount = gameState.battleInventory?.invisibility_cloak || 0;
        const invisibilityCloakCountSpan = btnInvisibilityCloak.querySelector('.item-count');
        if (invisibilityCloakCountSpan) {
            invisibilityCloakCountSpan.textContent = `(${invisibilityCloakCount})`;
        }
        btnInvisibilityCloak.disabled = invisibilityCloakCount === 0;
    }
    
    // Mirror Attack (unlocked at level 40)
    const btnMirrorAttack = document.getElementById('btnMirrorAttack');
    if (btnMirrorAttack) {
        const mirrorAttackCount = gameState.battleInventory?.mirror_attack || 0;
        // Show if owned OR level requirement met
        if (mirrorAttackCount > 0 || hero.level >= 40) {
            btnMirrorAttack.style.display = '';
            const mirrorAttackCountSpan = btnMirrorAttack.querySelector('.item-count');
            if (mirrorAttackCountSpan) {
                mirrorAttackCountSpan.textContent = `(${mirrorAttackCount})`;
            }
            btnMirrorAttack.disabled = mirrorAttackCount === 0;
        } else {
            btnMirrorAttack.style.display = 'none';
        }
    }
    
    // Blue Flame (unlocked at level 12)
    const btnBlueFlame = document.getElementById('btnBlueFlame');
    if (btnBlueFlame) {
        if (hero.level >= 12) {
            btnBlueFlame.style.display = '';
            const blueFlameCount = gameState.battleInventory?.blue_flame || 0;
            const blueFlameCountSpan = btnBlueFlame.querySelector('.item-count');
            if (blueFlameCountSpan) {
                blueFlameCountSpan.textContent = `(${blueFlameCount})`;
            }
            btnBlueFlame.disabled = battleManager.attackGauge < 20 || blueFlameCount === 0;
        } else {
            btnBlueFlame.style.display = 'none';
        }
    }
    
    // Procrastination Ghost (unlocked at level 15)
    const btnProcrastinationGhost = document.getElementById('btnProcrastinationGhost');
    if (btnProcrastinationGhost) {
        if (hero.level >= 15) {
            btnProcrastinationGhost.style.display = '';
            const procrastinationGhostCount = gameState.battleInventory?.procrastination_ghost || 0;
            const procrastinationGhostCountSpan = btnProcrastinationGhost.querySelector('.item-count');
            if (procrastinationGhostCountSpan) {
                procrastinationGhostCountSpan.textContent = `(${procrastinationGhostCount})`;
            }
            btnProcrastinationGhost.disabled = battleManager.attackGauge < 25 || procrastinationGhostCount === 0;
        } else {
            btnProcrastinationGhost.style.display = 'none';
        }
    }
    
    // Throwing Star button
    const btnThrowingStar = document.getElementById('btnThrowingStar');
    if (btnThrowingStar) {
        const throwingStarCount = gameState.battleInventory?.throwing_stars || 0;
        // Show if owned OR level requirement met
        if (throwingStarCount > 0 || hero.level >= 20) {
            btnThrowingStar.style.display = '';
            const throwingStarCountSpan = btnThrowingStar.querySelector('.item-count');
            if (throwingStarCountSpan) {
                throwingStarCountSpan.textContent = `(${throwingStarCount})`;
            }
            btnThrowingStar.disabled = throwingStarCount === 0;
        } else {
            btnThrowingStar.style.display = 'none';
        }
    }
    
    // Battle Glove button
    const btnBattleGlove = document.getElementById('btnBattleGlove');
    if (btnBattleGlove) {
        const battleGloveCount = gameState.battleInventory?.battle_glove || 0;
        // Show if owned OR level requirement met
        if (battleGloveCount > 0 || hero.level >= 30) {
            btnBattleGlove.style.display = '';
            const battleGloveCountSpan = btnBattleGlove.querySelector('.item-count');
            if (battleGloveCountSpan) {
                battleGloveCountSpan.textContent = `(${battleGloveCount})`;
            }
            btnBattleGlove.disabled = battleGloveCount === 0;
        } else {
            btnBattleGlove.style.display = 'none';
        }
    }
    
    // Jade Dagger button
    const btnJadeDagger = document.getElementById('btnJadeDagger');
    if (btnJadeDagger) {
        const jadeDaggerCount = gameState.battleInventory?.jade_dagger || 0;
        // Show if owned OR level requirement met
        if (jadeDaggerCount > 0 || hero.level >= 35) {
            btnJadeDagger.style.display = '';
            const jadeDaggerCountSpan = btnJadeDagger.querySelector('.item-count');
            if (jadeDaggerCountSpan) {
                jadeDaggerCountSpan.textContent = `(${jadeDaggerCount})`;
            }
            btnJadeDagger.disabled = jadeDaggerCount === 0;
        } else {
            btnJadeDagger.style.display = 'none';
        }
    }
    
    // Wizard's Wand button
    const btnWizardsWand = document.getElementById('btnWizardsWand');
    if (btnWizardsWand) {
        const wizardsWandCount = gameState.battleInventory?.wizards_wand || 0;
        // Show if owned OR level requirement met
        if (wizardsWandCount > 0 || hero.level >= 40) {
            btnWizardsWand.style.display = '';
            const wizardsWandCountSpan = btnWizardsWand.querySelector('.item-count');
            if (wizardsWandCountSpan) {
                wizardsWandCountSpan.textContent = `(${wizardsWandCount})`;
            }
            btnWizardsWand.disabled = wizardsWandCount === 0;
        } else {
            btnWizardsWand.style.display = 'none';
        }
    }
}

// Add message to battle log
function addBattleLog(message) {
    const log = document.getElementById('battleLog');
    if (!log) {
        console.error('[BattleUI] battleLog element not found');
        return;
    }
    log.innerHTML += `<div>${message}</div>`;
    log.scrollTop = log.scrollHeight;
}

// Fireball Projectile Animation
async function playFireballAnimation(startElement, targetElement) {

    const projectile = document.createElement('div');
    projectile.className = 'fireball-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    // FIX: Use correct fireball sprite
    projectile.style.backgroundImage = 'url("assets/projectiles/FireballAttack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(255, 100, 0, 0.2)'; // Fallback orange tint
    projectile.style.borderRadius = '50%';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    const startX = startRect.left + startRect.width / 2 - 25;
    const startY = startRect.top + startRect.height / 2 - 25;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';
    
    // Rotate fireball for effect
    let rotation = 0;
    const frameInterval = setInterval(() => {
        rotation += 15;
        projectile.style.transform = `rotate(${rotation}deg)`;
    }, 100);

    // Animate projectile movement
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Stop frame animation
                clearInterval(frameInterval);

                // Remove projectile
                projectile.remove();

                // Play explosion
                playExplosionAnimation(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Waveform Projectile Animation (Ghost enemy attack)
async function playWaveformAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'waveform-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.left = startRect.left + startRect.width / 2 - 16 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 16 + 'px';

    // Animate projectile movement
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 16;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 16;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile
                projectile.remove();
                resolve();
            }
        }

        requestAnimationFrame(animate);
    });
}

// Spark Projectile Animation (Player level 7+ attack)
async function playSparkAnimation(startElement, targetElement) {

    const projectile = document.createElement('div');
    projectile.className = 'spark-projectile';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    projectile.style.position = 'fixed';
    projectile.style.backgroundImage = 'url("assets/projectiles/SparkAttack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(255, 200, 0, 0.2)'; // Fallback yellow tint
    projectile.style.borderRadius = '50%';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    const startX = startRect.left + startRect.width / 2 - 20;
    const startY = startRect.top + startRect.height / 2 - 20;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';

    // Animate projectile movement
    const duration = 600;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 20;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 20;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show explosion
                projectile.remove();
                playSparkExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Spark Explosion Animation - 9 frames
async function playSparkExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '90px';
    explosion.style.height = '90px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 45 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 45 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/explosions/Spark Explosion/_0000_Layer-1.png',
        'assets/explosions/Spark Explosion/_0001_Layer-2.png',
        'assets/explosions/Spark Explosion/_0002_Layer-3.png',
        'assets/explosions/Spark Explosion/_0003_Layer-4.png',
        'assets/explosions/Spark Explosion/_0004_Layer-5.png',
        'assets/explosions/Spark Explosion/_0005_Layer-6.png',
        'assets/explosions/Spark Explosion/_0006_Layer-7.png',
        'assets/explosions/Spark Explosion/_0007_Layer-8.png',
        'assets/explosions/Spark Explosion/_0008_Layer-9.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    explosion.remove();
}

// Asteroid Projectile Animation
async function playAsteroidAnimation(startElement, targetElement) {

    const projectile = document.createElement('div');
    projectile.className = 'asteroid-projectile';
    projectile.style.width = '45px';
    projectile.style.height = '45px';
    projectile.style.position = 'fixed';
    // FIX: Use correct asteroid sprite
    projectile.style.backgroundImage = 'url("assets/projectiles/AsteroidAttack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(139, 69, 19, 0.3)'; // Fallback brown tint
    projectile.style.borderRadius = '50%';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();


    // Position projectile at start
    const startX = startRect.left + startRect.width / 2 - 22.5;
    const startY = startRect.top + startRect.height / 2 - 22.5;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';

    // Animate projectile movement with arc
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in)
            const eased = progress * progress;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const arc = Math.sin(progress * Math.PI) * 80; // Arc height
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate asteroid
            projectile.style.transform = `rotate(${progress * 720}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show explosion
                projectile.remove();
                playAsteroidExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Asteroid Explosion Animation - 4 frames
async function playAsteroidExplosion(targetRect) {

    const explosion = document.createElement('div');
    explosion.style.width = '80px';
    explosion.style.height = '80px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 40 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 40 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/explosions/Asteroid Explosion/explosion1.png',
        'assets/explosions/Asteroid Explosion/explosion2.png',
        'assets/explosions/Asteroid Explosion/explosion3.png',
        'assets/explosions/Asteroid Explosion/explosion4.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    explosion.remove();
}

// Prickler Projectile Animation
async function playPricklerAnimation(startElement, targetElement) {

    const projectile = document.createElement('div');
    projectile.className = 'prickler-projectile';
    projectile.style.width = '45px';
    projectile.style.height = '45px';
    projectile.style.position = 'fixed';
    // FIX: Use correct prickler sprite
    projectile.style.backgroundImage = 'url("assets/projectiles/PricklerAttack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(0, 100, 200, 0.2)'; // Fallback blue tint
    projectile.style.borderRadius = '50%';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    const startX = startRect.left + startRect.width / 2 - 22.5;
    const startY = startRect.top + startRect.height / 2 - 22.5;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';

    // Animate projectile movement with arc
    const duration = 800;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in-out)
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // Calculate position with arc
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 22.5;
            const arc = Math.sin(progress * Math.PI) * 100; // Arc height
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 22.5 - arc;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate prickler
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show explosion
                projectile.remove();
                playPricklerExplosion(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Prickler Nuclear Explosion Animation - 9 frames
async function playPricklerExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '120px';
    explosion.style.height = '120px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 60 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 60 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    // Nuclear explosion frames
    const explosionFrames = [
        'assets/explosions/Prickler Explosion/sprites/explosion-animation1.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation2.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation3.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation4.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation5.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation6.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation7.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation8.png',
        'assets/explosions/Prickler Explosion/sprites/explosion-animation9.png'
    ];

    // Play each frame
    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    explosion.remove();
}

// Freeze Projectile Animation
async function playFreezeAnimation(startElement, targetElement) {

    const projectile = document.createElement('div');
    projectile.className = 'freeze-projectile';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.position = 'fixed';
    // FIX: Use correct freeze sprite
    projectile.style.backgroundImage = 'url("assets/projectiles/FreezeAttack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(100, 200, 255, 0.2)'; // Fallback ice blue tint
    projectile.style.borderRadius = '50%';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    const startX = startRect.left + startRect.width / 2 - 25;
    const startY = startRect.top + startRect.height / 2 - 25;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';

    // Animate projectile movement
    const duration = 700;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            // Calculate position
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 25;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 25;

            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            // Rotate freeze projectile
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove projectile and show freeze impact
                projectile.remove();
                playFreezeImpact(targetRect).then(resolve);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Freeze Impact Animation - 8 frames
async function playFreezeImpact(targetRect) {
    const impact = document.createElement('div');
    impact.style.width = '100px';
    impact.style.height = '100px';
    impact.style.position = 'fixed';
    impact.style.left = targetRect.left + targetRect.width / 2 - 50 + 'px';
    impact.style.top = targetRect.top + targetRect.height / 2 - 50 + 'px';
    impact.style.backgroundSize = 'contain';
    impact.style.backgroundRepeat = 'no-repeat';
    impact.style.zIndex = '1001';
    document.body.appendChild(impact);

    // Freeze impact frames
    const impactFrames = [
        'assets/explosions/Freeze Explosion/_0000_Layer-1.png',
        'assets/explosions/Freeze Explosion/_0001_Layer-2.png',
        'assets/explosions/Freeze Explosion/_0002_Layer-3.png',
        'assets/explosions/Freeze Explosion/_0003_Layer-4.png',
        'assets/explosions/Freeze Explosion/_0004_Layer-5.png',
        'assets/explosions/Freeze Explosion/_0005_Layer-6.png',
        'assets/explosions/Freeze Explosion/_0006_Layer-7.png',
        'assets/explosions/Freeze Explosion/_0007_Layer-8.png'
    ];

    // Play each frame
    for (let i = 0; i < impactFrames.length; i++) {
        impact.style.backgroundImage = `url('${impactFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    impact.remove();
}

// Fireball Explosion Animation - Uses 6-frame sequence
async function playExplosionAnimation(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 50 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 50 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    // Fireball explosion frames
    const explosionFrames = [
        'assets/explosions/Fireball Explosion/Explosion 1.png',
        'assets/explosions/Fireball Explosion/Explosion 2.png',
        'assets/explosions/Fireball Explosion/Explosion 3.png',
        'assets/explosions/Fireball Explosion/Explosion 4.png',
        'assets/explosions/Fireball Explosion/Explosion 5.png',
        'assets/explosions/Fireball Explosion/Explosion 6.png'
    ];

    // Play each frame
    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 60));
    }

    explosion.remove();
}

// Update battle shop display
function updateBattleShopDisplay() {
    const shopContainer = document.getElementById('battleShopContainer');
    if (!shopContainer) return;

    const items = [
        { name: 'Fireball', cost: 20, emoji: '🔥', key: 'fireball' },
        { name: 'Health Potion', cost: 15, emoji: '💚', key: 'health_potion' },
        { name: 'Invisibility Cloak', cost: 40, emoji: '🥷🏼', key: 'invisibility_cloak', levelRequired: 3 }
    ];

    shopContainer.innerHTML = items.map(item => `
        <div class="shop-item" data-item="${item.key}" data-cost="${item.cost}">
            <div class="shop-item-icon">${item.emoji}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-cost">${item.cost} XP</div>
            </div>
            <button class="shop-buy-btn" onclick="buyBattleItem('${item.key}', ${item.cost})">Buy</button>
        </div>
    `).join('');
}

// Update battle inventory display with intuitive grid layout
function updateBattleInventoryDisplay() {
    const inventoryContainer = document.getElementById('battleInventoryContainer');
    if (!inventoryContainer) return;

    const inventory = gameState.battleInventory || { fireball: 0, health_potion: 0, invisibility_cloak: 0 };

    inventoryContainer.innerHTML = `
        <div class="inventory-grid">
            <div class="inventory-slot">
                <div class="inventory-slot-icon">🔥</div>
                <div class="inventory-slot-name">Fireball</div>
                <div class="inventory-slot-count">${inventory.fireball}</div>
            </div>
            <div class="inventory-slot">
                <div class="inventory-slot-icon">💚</div>
                <div class="inventory-slot-name">Health Potion</div>
                <div class="inventory-slot-count">${inventory.health_potion}</div>
            </div>
            <div class="inventory-slot">
                <div class="inventory-slot-icon">🥷🏼</div>
                <div class="inventory-slot-name">Invisibility Cloak</div>
                <div class="inventory-slot-count">${inventory.invisibility_cloak}</div>
            </div>
        </div>
    `;
}

// Buy battle item
function buyBattleItem(itemKey, cost) {
    if (itemKey === 'invisibility_cloak' && gameState.level < 3) {
        alert('You need Level 3 to buy the Invisibility Cloak!');
        return;
    }
    if (gameState.xpCoins < cost) {
        alert('Not enough XP Coins!');
        return;
    }

    gameState.xpCoins -= cost;
    gameState.xp = Math.max(0, (gameState.xp || 0) - cost);
    gameState.battleInventory[itemKey]++;
    
    if (!gameState.unlockedBattleItems.includes(itemKey)) {
        gameState.unlockedBattleItems.push(itemKey);
    }
    
    saveGameState();
    updateBattleShopDisplay();
    updateBattleInventoryDisplay();
    
    // Update XP display if function exists
    if (typeof updateTasksDisplay === 'function') {
        updateTasksDisplay();
    }
}



// Export to global scope
window.showBattle = showBattle;
window.updateBattleUI = updateBattleUI;
// window.hideBattle = hideBattle; // Function not defined, commented out to prevent error
window.addBattleLog = addBattleLog;
// Export projectile animation functions
window.playFireballAnimation = playFireballAnimation;
window.playWaveformAnimation = playWaveformAnimation;
window.playSparkAnimation = playSparkAnimation;
window.playPricklerAnimation = playPricklerAnimation;
window.playFreezeAnimation = playFreezeAnimation;
window.playAsteroidAnimation = playAsteroidAnimation;
window.playBlueFlameAnimation = playBlueFlameAnimation;
window.playProcrastinationGhostAnimation = playProcrastinationGhostAnimation;
window.updateBattleShopDisplay = updateBattleShopDisplay;
window.updateBattleInventoryDisplay = updateBattleInventoryDisplay;
window.buyBattleItem = buyBattleItem;


// Splash Projectile Animation (Octopus drench attack)
async function playSplashAnimation(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'splash-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 32 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 32 + 'px';
    projectile.style.width = '64px';
    projectile.style.height = '64px';
    projectile.style.backgroundImage = 'url("assets/splash-attack.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 600;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 32 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 32 + 'px';
            projectile.style.opacity = 1 - progress * 0.3;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 200);
            }
        }
        animate();
    });
}

// Alien Projectile Animation
async function playAlienProjectile(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'alien-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 24 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 24 + 'px';
    projectile.style.width = '48px';
    projectile.style.height = '48px';
    projectile.style.backgroundImage = 'url("assets/alien-projectile.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 500;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 24 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 24 + 'px';
            projectile.style.transform = `rotate(${progress * 360}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 200);
            }
        }
        animate();
    });
}

// Export functions
window.playSplashAnimation = playSplashAnimation;
window.playAlienProjectile = playAlienProjectile;

// Lazy Bat Rock Projectile Animation
async function playBatRockProjectile(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'bat-rock-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 16 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 16 + 'px';
    projectile.style.width = '32px';
    projectile.style.height = '32px';
    projectile.style.backgroundImage = 'url("assets/bat-rock-projectile.png")';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 500;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 16 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 16 + 'px';
            projectile.style.transform = `rotate(${progress * 720}deg)`; // Two full rotations

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 100);
            }
        }
        animate();
    });
}

// Export function
window.playBatRockProjectile = playBatRockProjectile;

// Fire Skull Explosion Animation
async function playFireExplosion(startElement, targetElement) {
    const explosion = document.createElement('div');
    explosion.className = 'fire-explosion';
    document.body.appendChild(explosion);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position explosion at target
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 32 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 32 + 'px';
    explosion.style.width = '64px';
    explosion.style.height = '64px';
    explosion.style.backgroundImage = 'url("assets/enemies/fire-skull/fire-skull-explosion.png")';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.imageRendering = 'pixelated';
    explosion.style.zIndex = '10000';
    explosion.style.animation = 'explosionFlash 0.5s ease-out';

    return new Promise((resolve) => {
        setTimeout(() => {
            explosion.style.opacity = '0';
            setTimeout(() => {
                explosion.remove();
                resolve();
            }, 200);
        }, 500);
    });
}

// Export function
window.playFireExplosion = playFireExplosion;

// Blue Flame Animation
async function playBlueFlameAnimation(startElement, targetElement) {

    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const projectile = document.createElement('div');
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.right + 'px';
    projectile.style.top = (startRect.top + startRect.height / 2 - 20) + 'px';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    // FIX: Use correct blue flame sprite
    projectile.style.backgroundImage = 'url(assets/projectiles/BlueFlame.png)';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(20, 30, 80, 0.4)'; // Fallback dark navy tint
    projectile.style.borderRadius = '50%';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';

    document.body.appendChild(projectile);

    // Animate to target manually
    const duration = 600;
    const startTime = Date.now();
    const startX = startRect.left + startRect.width / 2 - 20;
    const startY = startRect.top + startRect.height / 2 - 20;
    
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';

    await new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 20;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 20;
            
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                resolve();
            }
        }
        requestAnimationFrame(animate);
    });
    
    // Play blue flame explosion on impact
    await playBlueFlameExplosion(targetRect);
}

// Blue Flame Explosion Animation - spritesheet
async function playBlueFlameExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '26px';
    explosion.style.height = '32px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 13 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 16 + 'px';
    explosion.style.backgroundImage = 'url("assets/explosions/Blue Flame Explosion/spritesheet.png")';
    explosion.style.backgroundSize = '78px 32px';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.imageRendering = 'pixelated';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    // Spritesheet has 3 frames (78px / 26px = 3 frames)
    for (let i = 0; i < 3; i++) {
        explosion.style.backgroundPosition = `-${i * 26}px 0`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    explosion.remove();
}

// Procrastination Ghost Animation
async function playProcrastinationGhostAnimation(startElement, targetElement) {

    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const projectile = document.createElement('div');
    projectile.style.position = 'fixed';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    // Use Assertive Attack projectile GIF
    projectile.style.backgroundImage = 'url(assets/battle/AssertiveAttackProjectile.gif)';
    projectile.style.backgroundSize = 'contain';
    projectile.style.backgroundRepeat = 'no-repeat';
    projectile.style.backgroundColor = 'rgba(150, 0, 200, 0.2)'; // Fallback purple tint
    projectile.style.borderRadius = '50%';
    projectile.style.imageRendering = 'pixelated';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    projectile.style.opacity = '0.9';

    document.body.appendChild(projectile);

    // Animate to target with floating motion
    const duration = 700;
    const startTime = Date.now();
    const startX = startRect.left + startRect.width / 2 - 20;
    const startY = startRect.top + startRect.height / 2 - 20;
    
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';

    await new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startRect.left + (targetRect.left - startRect.left) * eased + targetRect.width / 2 - 20;
            const currentY = startRect.top + (targetRect.top - startRect.top) * eased + targetRect.height / 2 - 20;
            
            projectile.style.left = currentX + 'px';
            projectile.style.top = currentY + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.remove();
                resolve();
            }
        }
        requestAnimationFrame(animate);
    });
    
    // Play poison leaf explosion (ghost uses similar effect)
    await playPoisonLeafExplosion(targetRect);
}

// Poison Leaf Explosion Animation - 5 frames
async function playPoisonLeafExplosion(targetRect) {
    const explosion = document.createElement('div');
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.position = 'fixed';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 50 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 50 + 'px';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.zIndex = '1001';
    document.body.appendChild(explosion);

    const explosionFrames = [
        'assets/explosions/Poison Leaf Explosion/enemy-death-1.png',
        'assets/explosions/Poison Leaf Explosion/enemy-death-2.png',
        'assets/explosions/Poison Leaf Explosion/enemy-death-3.png',
        'assets/explosions/Poison Leaf Explosion/enemy-death-4.png',
        'assets/explosions/Poison Leaf Explosion/enemy-death-5.png'
    ];

    for (let i = 0; i < explosionFrames.length; i++) {
        explosion.style.backgroundImage = `url('${explosionFrames[i]}')`;
        await new Promise(resolve => setTimeout(resolve, 70));
    }

    explosion.remove();
}


// Increase special attack gauge
window.increaseSpecialGauge = function(amount) {
    if (!window.gameState.specialAttackGauge) {
        window.gameState.specialAttackGauge = 0;
    }
    
    window.gameState.specialAttackGauge = Math.min(100, window.gameState.specialAttackGauge + amount);
    
    // Update the gauge UI
    const specialGaugeBar = document.getElementById('specialGaugeBar');
    const specialGaugeText = document.getElementById('specialGaugeText');
    if (specialGaugeBar) specialGaugeBar.style.width = window.gameState.specialAttackGauge + '%';
    if (specialGaugeText) specialGaugeText.textContent = `${window.gameState.specialAttackGauge}/100`;
    
    // FIX: Refresh action buttons so the special attack button enables/highlights when gauge hits 100
    if (window.battleManager && typeof updateActionButtons === 'function') {
        updateActionButtons(window.battleManager.hero);
    }

};

// Reset special attack gauge to 0 after use
window.resetSpecialGauge = function() {
    window.gameState.specialAttackGauge = 0;
    
    const specialGaugeBar = document.getElementById('specialGaugeBar');
    const specialGaugeText = document.getElementById('specialGaugeText');
    if (specialGaugeBar) specialGaugeBar.style.width = '0%';
    if (specialGaugeText) specialGaugeText.textContent = '0/100';
    
    // Refresh action buttons so the special attack button disables again
    if (window.battleManager && typeof updateActionButtons === 'function') {
        updateActionButtons(window.battleManager.hero);
    }

};

// Initialize the special attack gauge UI at the start of a battle
window.initSpecialAttackGauge = function() {
    const userLevel = window.gameState?.jerryLevel || 1;
    const currentGauge = window.gameState?.specialAttackGauge || 0;
    
    const specialGaugeContainer = document.getElementById('specialAttackGaugeContainer');
    const specialGaugeBar = document.getElementById('specialGaugeBar');
    const specialGaugeText = document.getElementById('specialGaugeText');
    const specialAttackBtn = document.getElementById('btnSpecialAttack');
    
    // Show/hide based on level
    if (userLevel >= 10) {
        if (specialGaugeContainer) specialGaugeContainer.style.display = 'block';
        if (specialAttackBtn) specialAttackBtn.style.display = 'block';
    } else {
        if (specialGaugeContainer) specialGaugeContainer.style.display = 'none';
        if (specialAttackBtn) specialAttackBtn.style.display = 'none';
    }
    
    // Sync gauge bar to current value
    if (specialGaugeBar) specialGaugeBar.style.width = currentGauge + '%';
    if (specialGaugeText) specialGaugeText.textContent = `${currentGauge}/100`;

};

// Medusa projectile animation (gaze beam)
async function playMedusaProjectile(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'medusa-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 30 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 30 + 'px';
    projectile.style.width = '60px';
    projectile.style.height = '60px';
    projectile.style.fontSize = '60px';
    projectile.textContent = '👁️';
    projectile.style.zIndex = '10000';
    projectile.style.filter = 'hue-rotate(270deg) brightness(1.5)';

    // Animate projectile movement
    const duration = 600;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 30 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 30 + 'px';
            projectile.style.transform = `scale(${1 + progress * 0.5})`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 200);
            }
        }
        animate();
    });
}

// Mushroom projectile animation (spinning mushroom)
async function playMushroomProjectile(startElement, targetElement) {
    const projectile = document.createElement('div');
    projectile.className = 'mushroom-projectile';
    document.body.appendChild(projectile);

    // Get positions
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Position projectile at start
    projectile.style.position = 'fixed';
    projectile.style.left = startRect.left + startRect.width / 2 - 25 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 25 + 'px';
    projectile.style.width = '50px';
    projectile.style.height = '50px';
    projectile.style.fontSize = '50px';
    projectile.textContent = '🍄';
    projectile.style.zIndex = '10000';

    // Animate projectile movement
    const duration = 500;
    const startTime = Date.now();

    return new Promise((resolve) => {
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentX = startRect.left + (targetRect.left - startRect.left) * progress;
            const currentY = startRect.top + (targetRect.top - startRect.top) * progress;

            projectile.style.left = currentX + startRect.width / 2 - 25 + 'px';
            projectile.style.top = currentY + startRect.height / 2 - 25 + 'px';
            projectile.style.transform = `rotate(${progress * 720}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                projectile.style.opacity = '0';
                setTimeout(() => {
                    projectile.remove();
                    resolve();
                }, 200);
            }
        }
        animate();
    });
}

// Export functions
window.playMedusaProjectile = playMedusaProjectile;
window.playMushroomProjectile = playMushroomProjectile;

// Defend animation (yellow shield glow)
async function showDefendAnimation(targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) return;

    const animation = document.createElement('img');
    animation.src = 'assets/defend_animation.gif';
    animation.style.position = 'absolute';
    animation.style.width = '120px';
    animation.style.height = '120px';
    animation.style.left = '50%';
    animation.style.top = '50%';
    animation.style.transform = 'translate(-50%, -50%)';
    animation.style.pointerEvents = 'none';
    animation.style.zIndex = '1000';
    
    targetElement.style.position = 'relative';
    targetElement.appendChild(animation);

    return new Promise((resolve) => {
        setTimeout(() => {
            animation.remove();
            resolve();
        }, 1000);
    });
}

// Potion/Attack boost animation (cyan glow)
async function showPotionBoostAnimation(targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) return;

    const animation = document.createElement('img');
    animation.src = 'assets/potion_boost_animation.gif';
    animation.style.position = 'absolute';
    animation.style.width = '120px';
    animation.style.height = '120px';
    animation.style.left = '50%';
    animation.style.top = '50%';
    animation.style.transform = 'translate(-50%, -50%)';
    animation.style.pointerEvents = 'none';
    animation.style.zIndex = '1000';
    
    targetElement.style.position = 'relative';
    targetElement.appendChild(animation);

    return new Promise((resolve) => {
        setTimeout(() => {
            animation.remove();
            resolve();
        }, 1000);
    });
}

// Export functions
window.showDefendAnimation = showDefendAnimation;
window.showPotionBoostAnimation = showPotionBoostAnimation;

// Mirror Attack Animation - Shows swirling mirror effect on hero
async function showMirrorAttackAnimation(targetElementId) {

    const heroSprite = document.getElementById('heroSprite');
    const enemySprite = document.getElementById('enemySprite');
    const battleContainer = document.querySelector('.battle-container');
    
    if (!heroSprite || !enemySprite || !battleContainer) {
        console.error('Mirror Attack: Required elements not found');
        return;
    }

    // Get positions
    const heroRect = heroSprite.getBoundingClientRect();
    const enemyRect = enemySprite.getBoundingClientRect();
    const containerRect = battleContainer.getBoundingClientRect();

    // Calculate relative positions
    const startX = heroRect.left + heroRect.width / 2 - containerRect.left;
    const startY = heroRect.top + heroRect.height / 2 - containerRect.top;
    const endX = enemyRect.left + enemyRect.width / 2 - containerRect.left;
    const endY = enemyRect.top + enemyRect.height / 2 - containerRect.top;

    // Create projectile
    const projectile = document.createElement('img');
    projectile.src = 'assets/effects/mirror-projectile.gif';
    projectile.className = 'mirror-projectile';
    projectile.style.position = 'absolute';
    projectile.style.width = '60px';
    projectile.style.height = '60px';
    projectile.style.left = `${startX}px`;
    projectile.style.top = `${startY}px`;
    projectile.style.transform = 'translate(-50%, -50%)';
    projectile.style.zIndex = '999';
    projectile.style.pointerEvents = 'none';
    projectile.style.transition = 'all 0.6s ease-out';

    battleContainer.appendChild(projectile);

    // Animate projectile to enemy
    setTimeout(() => {
        projectile.style.left = `${endX}px`;
        projectile.style.top = `${endY}px`;
    }, 50);

    return new Promise((resolve) => {
        setTimeout(() => {
            projectile.remove();

            resolve();
        }, 700);
    });
}

// Poison Leaf Animation - Projectile with explosion
async function playPoisonLeafAnimation(startElement, targetElement) {

    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // Create projectile
    const projectile = document.createElement('img');
    projectile.src = 'assets/battle/PoisonLeafProjectile.png';
    projectile.style.position = 'fixed';
    projectile.style.width = '40px';
    projectile.style.height = '40px';
    projectile.style.left = startRect.left + startRect.width / 2 - 20 + 'px';
    projectile.style.top = startRect.top + startRect.height / 2 - 20 + 'px';
    projectile.style.zIndex = '10000';
    projectile.style.pointerEvents = 'none';
    projectile.style.imageRendering = 'pixelated';
    
    document.body.appendChild(projectile);

    // Calculate trajectory
    const deltaX = (targetRect.left + targetRect.width / 2) - (startRect.left + startRect.width / 2);
    const deltaY = (targetRect.top + targetRect.height / 2) - (startRect.top + startRect.height / 2);

    // Animate projectile
    projectile.style.transition = 'all 0.6s ease-out';
    projectile.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(360deg)`;

    await new Promise(resolve => setTimeout(resolve, 600));

    // Remove projectile
    projectile.remove();

    // Create explosion
    const explosion = document.createElement('img');
    explosion.src = 'assets/battle/PoisonLeafExplosion.gif';
    explosion.style.position = 'fixed';
    explosion.style.width = '80px';
    explosion.style.height = '80px';
    explosion.style.left = targetRect.left + targetRect.width / 2 - 40 + 'px';
    explosion.style.top = targetRect.top + targetRect.height / 2 - 40 + 'px';
    explosion.style.zIndex = '10000';
    explosion.style.pointerEvents = 'none';
    
    document.body.appendChild(explosion);

    // Play poison sound
    if (window.audioManager) {
        const audio = new Audio('assets/battle/PoisonLeafSound.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Poison sound failed:', e));
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    explosion.remove();

}

// Export new functions
window.showMirrorAttackAnimation = showMirrorAttackAnimation;
window.playPoisonLeafAnimation = playPoisonLeafAnimation;

// Battle Glove Animation - Shows glove effect on hero
async function showBattleGloveAnimation(targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) return;

    const animation = document.createElement('img');
    animation.src = 'assets/battle/BattleGloveEffect.gif';
    animation.style.position = 'absolute';
    animation.style.width = '120px';
    animation.style.height = '120px';
    animation.style.left = '50%';
    animation.style.top = '50%';
    animation.style.transform = 'translate(-50%, -50%)';
    animation.style.zIndex = '1000';
    animation.style.pointerEvents = 'none';

    targetElement.style.position = 'relative';
    targetElement.appendChild(animation);

    return new Promise((resolve) => {
        setTimeout(() => {
            animation.remove();
            resolve();
        }, 1000);
    });
}

// Export Battle Glove animation
window.showBattleGloveAnimation = showBattleGloveAnimation;
