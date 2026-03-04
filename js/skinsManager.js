/**
 * Skins Manager
 * Handles skin purchasing, equipping, and rendering across the app
 * REFACTORED: 100% GIF-based animations only. No sprite sheets.
 *
 * LEVEL 5 GATE RULES (enforced here):
 *  - Levels 1–4: Monster is an egg. Egg GIF is ALWAYS shown. Skins cannot be equipped or purchased.
 *  - Level 5+:   Egg hatches. Monster GIF shown. Skins become available.
 */

const EGG_LEVEL_GATE = 5; // Hatch level — change this one constant to adjust the gate globally

class SkinsManager {
    constructor() {
        this.ownedSkins = [];
        this.equippedSkinId = null;
        this.currentBaseMonster = null;
    }

    // ─────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────

    /** Returns true when the monster should display as an egg */
    _isEgg() {
        return !!(window.gameState && window.gameState.isEgg);
    }

    /** Returns the egg GIF path for the currently selected monster */
    _getEggGifPath() {
        const monster = this.currentBaseMonster ||
                        localStorage.getItem('selectedMonster') ||
                        'nova';
        return `assets/eggs/${monster}_egg.gif`;
    }

    /** Apply egg styling to a sprite element */
    _applyEggToElement(element) {
        element.src = this._getEggGifPath() + '?t=' + Date.now();
        element.classList.add('egg-sprite');
        element.style.setProperty('animation',       'none',    'important');
        element.style.setProperty('object-fit',      'contain', 'important');
        element.style.setProperty('object-position', 'center',  'important');
        element.style.setProperty('width',           'auto',    'important');
        element.style.setProperty('height',          'auto',    'important');
        element.style.setProperty('max-width',       '100%',    'important');
        element.style.setProperty('max-height',      '100%',    'important');
        element.style.setProperty('transform',       'scale(2)','important');
        element.style.setProperty('transform-origin','bottom center','important');
        element.style.setProperty('opacity',         '1',       'important');
        element.style.setProperty('display',         'block',   'important');
        element.style.setProperty('visibility',      'visible', 'important');
        element.style.setProperty('image-rendering', 'pixelated','important');
    }

    // ─────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────

    /**
     * Initialize skins system from saved state
     */
    init() {
        if (window.gameState) {
            this.ownedSkins      = window.gameState.ownedSkins      || [];
            this.equippedSkinId  = window.gameState.equippedSkinId  || null;
        }
        this.currentBaseMonster = localStorage.getItem('selectedMonster') || 'nova';

        // CRITICAL: Ensure DOM is ready before updating visuals
        this.ensureSpriteReady(() => {
            this.updateAllMonsterVisuals();
        });
    }

    /**
     * Ensure sprite element exists and is ready (with retry mechanism)
     */
    ensureSpriteReady(callback, retries = 10) {
        const mainHeroSprite = document.getElementById('mainHeroSprite');
        if (mainHeroSprite) {
            callback();
        } else if (retries > 0) {
            setTimeout(() => this.ensureSpriteReady(callback, retries - 1), 100);
        } else {
            console.error('[SkinsManager] Failed to find mainHeroSprite after retries');
        }
    }

    /**
     * Update all monster visuals across the app.
     *
     * LEVEL 5 GATE: If the monster is still an egg (Levels 1–4),
     * ALWAYS show the egg GIF — no skin or default sprite can override it.
     */
    updateAllMonsterVisuals() {
        // Sync equipped skin from gameState
        this.equippedSkinId = window.gameState?.equippedSkinId || null;

        // ── EGG GUARD ──────────────────────────────────────────────────────
        // If the monster is in egg form, override ALL sprites with the egg GIF
        // and return early. No skin, no default sprite, nothing else runs.
        if (this._isEgg()) {
            const mainHeroSprite    = document.getElementById('mainHeroSprite');
            const focusTimerSprite  = document.getElementById('focusTimerMonsterSprite');
            const battleHeroSprite  = document.getElementById('heroSprite');

            if (mainHeroSprite)   this._applyEggToElement(mainHeroSprite);
            if (focusTimerSprite) this._applyEggToElement(focusTimerSprite);
            if (battleHeroSprite) this._applyEggToElement(battleHeroSprite);
            return; // ← early exit: nothing below runs while egg
        }
        // ── END EGG GUARD ──────────────────────────────────────────────────

        // Monster has hatched — apply normal skin / default monster GIF
        const appearance = window.getActiveMonsterAppearance(this.currentBaseMonster, this.equippedSkinId);
        const idleGif    = appearance.animations.idle;
        const isSkin     = appearance.isSkin || false;

        // Skins render slightly larger than the default monster
        const mainScale   = isSkin ? 5 : 4;
        const focusScale  = isSkin ? 4 : 3;
        const battleScale = 3.5;

        const mainHeroSprite   = document.getElementById('mainHeroSprite');
        const focusTimerSprite = document.getElementById('focusTimerMonsterSprite');
        const battleHeroSprite = document.getElementById('heroSprite');

        if (mainHeroSprite) {
            mainHeroSprite.classList.remove('egg-sprite');
            this.applyGifToElement(mainHeroSprite, idleGif, mainScale);
        }
        if (focusTimerSprite) {
            focusTimerSprite.classList.remove('egg-sprite');
            this.applyGifToElement(focusTimerSprite, idleGif, focusScale);
        }
        if (battleHeroSprite) {
            battleHeroSprite.classList.remove('egg-sprite');
            this.applyGifToElement(battleHeroSprite, idleGif, battleScale);
        }
    }

    /**
     * Helper to apply a GIF with consistent styling to an element
     */
    applyGifToElement(element, gifPath, scale) {
        element.src = gifPath + '?t=' + Date.now();
        element.style.setProperty('width',           '32px',                    'important');
        element.style.setProperty('height',          '32px',                    'important');
        element.style.setProperty('object-fit',      'contain',                 'important');
        element.style.setProperty('object-position', 'center',                  'important');
        element.style.setProperty('image-rendering', 'pixelated',               'important');
        element.style.setProperty('transform',       `scale(${scale})`,         'important');
        element.style.setProperty('transform-origin','bottom center',            'important');
        element.style.setProperty('opacity',         '1',                       'important');
        element.style.setProperty('display',         'block',                   'important');
        element.style.setProperty('visibility',      'visible',                 'important');
        element.style.setProperty('animation',       'none',                    'important');
        element.style.setProperty('transition',      'none',                    'important');
    }

    /**
     * Render the skins shop UI.
     *
     * LEVEL 5 GATE: If the user is below Level 5, show a full-width
     * locked banner instead of the skin cards.
     */
    renderSkinsShop() {
        const grid = document.getElementById('skinsShopGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const userLevel = window.gameState?.jerryLevel || 1;

        // ── LEVEL 5 GATE: Skins shop locked until egg hatches ──────────────
        if (userLevel < EGG_LEVEL_GATE) {
            const xpNeeded = window.gameState?.jerryXPToNext || 100;
            const xpCurrent = window.gameState?.jerryCurrentXP || 0;
            const levelsLeft = EGG_LEVEL_GATE - userLevel;
            grid.innerHTML = `
                <div class="skins-locked-banner" style="
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.5rem;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(30,20,60,0.95), rgba(20,10,40,0.95));
                    border: 2px solid rgba(139,92,246,0.4);
                    border-radius: 16px;
                    margin: 0.5rem;
                    gap: 0.75rem;
                ">
                    <div style="font-size: 3.5rem; line-height: 1;">🥚</div>
                    <h3 style="color: #c4b5fd; font-size: 1.2rem; margin: 0; font-weight: 700;">
                        Skins Unlock at Level ${EGG_LEVEL_GATE}
                    </h3>
                    <p style="color: #a78bfa; font-size: 0.9rem; margin: 0; max-width: 260px; line-height: 1.5;">
                        Your monster is still an egg! Complete tasks to level up.
                        ${levelsLeft === 1
                            ? 'You\'re <strong style="color:#fbbf24;">one level away</strong> from hatching!'
                            : `<strong style="color:#fbbf24;">${levelsLeft} more levels</strong> until your egg hatches!`
                        }
                    </p>
                    <div style="
                        width: 100%;
                        max-width: 240px;
                        background: rgba(255,255,255,0.08);
                        border-radius: 999px;
                        height: 8px;
                        overflow: hidden;
                        margin-top: 0.25rem;
                    ">
                        <div style="
                            width: ${Math.min(100, Math.round((xpCurrent / xpNeeded) * 100))}%;
                            height: 100%;
                            background: linear-gradient(90deg, #7c3aed, #a855f7);
                            border-radius: 999px;
                            transition: width 0.4s ease;
                        "></div>
                    </div>
                    <p style="color: #6b7280; font-size: 0.75rem; margin: 0;">
                        Level ${userLevel} → ${EGG_LEVEL_GATE} &nbsp;|&nbsp; ${xpCurrent} / ${xpNeeded} XP
                    </p>
                </div>
            `;
            return;
        }
        // ── END LEVEL 5 GATE ───────────────────────────────────────────────

        const allSkins = window.getAllSkins ? window.getAllSkins() : [];
        const userXP   = window.gameState?.jerryXP || 0;

        if (allSkins.length === 0) {
            grid.innerHTML = '<div class="no-skins">No skins available in the shop.</div>';
            return;
        }

        // Sort by level requirement
        allSkins.sort((a, b) => (a.levelRequired || 1) - (b.levelRequired || 1));

        allSkins.forEach(skin => {
            const isOwned    = this.ownedSkins.includes(skin.id);
            const isEquipped = this.equippedSkinId === skin.id;
            const isLocked   = !isOwned && (userLevel < (skin.levelRequired || 1));
            const canPurchase = userXP >= skin.price && !isLocked;

            const card = document.createElement('div');
            card.className = `skin-card ${isEquipped ? 'equipped' : ''} ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''}`;

            let thumbnailHTML = '';
            if (isLocked) {
                thumbnailHTML = `<div class="skin-thumbnail locked-thumbnail"><div class="locked-icon" style="font-size: 4rem; color: #10b981; text-shadow: 0 0 15px #10b981, 0 0 30px rgba(16,185,129,0.8); font-weight: bold; font-family: Arial, sans-serif;">?</div></div>`;
            } else {
                const skinImage = skin.thumbnail || skin.animations?.idle || `assets/skins/${skin.id}/thumbnail.png`;
                thumbnailHTML = `<div class="skin-thumbnail"><img src="${skinImage}" class="skin-img" onerror="this.style.display='none'"></div>`;
            }

            let buttonHTML = '';
            if (isEquipped) {
                buttonHTML = `<button class="skin-btn-new equipped" onclick="window.skinsManager.unequipSkin()">✓ Equipped</button>`;
            } else if (isOwned) {
                buttonHTML = `<button class="skin-btn-new equip" onclick="window.skinsManager.equipSkin('${skin.id}')">EQUIP</button>`;
            } else if (isLocked) {
                buttonHTML = `<div class="skin-locked-text">🔒 Level ${skin.levelRequired || 1}</div>`;
            } else if (canPurchase) {
                buttonHTML = `<div class="skin-price">${skin.price} XP Coins</div><button class="skin-btn-new buy" onclick="window.skinsManager.buySkin('${skin.id}', ${skin.price})">EQUIP</button>`;
            } else {
                buttonHTML = `<div class="skin-price">${skin.price} XP Coins</div><button class="skin-btn-new locked" disabled>EQUIP</button>`;
            }

            card.innerHTML = `
                ${thumbnailHTML}
                <div class="skin-name-new">${skin.name}</div>
                ${buttonHTML}
            `;
            grid.appendChild(card);
        });
    }

    /**
     * Buy a skin.
     * LEVEL 5 GATE: Blocked below Level 5.
     */
    buySkin(skinId, price) {
        const userLevel = window.gameState?.jerryLevel || 1;

        // Hard gate — should never be reachable via UI, but defend in code too
        if (userLevel < EGG_LEVEL_GATE) {
            if (window.showSuccessMessage) {
                window.showSuccessMessage('🥚 Locked', `Hatch your egg at Level ${EGG_LEVEL_GATE} to unlock skins!`);
            }
            return { success: false, reason: 'egg' };
        }

        if (window.gameState.jerryXP < price) return { success: false, reason: 'coins' };

        window.gameState.jerryXP -= price;
        this.ownedSkins.push(skinId);
        window.gameState.ownedSkins = this.ownedSkins;

        window.saveGameState();
        window.updateAllDisplays();
        this.renderSkinsShop();

        if (window.audioManager) window.audioManager.playSound('buy');
        return { success: true };
    }

    /**
     * Equip a skin.
     * LEVEL 5 GATE: Blocked below Level 5.
     */
    equipSkin(skinId) {
        const userLevel = window.gameState?.jerryLevel || 1;

        // Hard gate
        if (userLevel < EGG_LEVEL_GATE) {
            if (window.showSuccessMessage) {
                window.showSuccessMessage('🥚 Locked', `Hatch your egg at Level ${EGG_LEVEL_GATE} to equip skins!`);
            }
            return { success: false, reason: 'egg' };
        }

        if (!this.ownedSkins.includes(skinId)) return { success: false, reason: 'not_owned' };

        this.equippedSkinId = skinId;
        window.gameState.equippedSkinId = skinId;
        window.saveGameState();

        if (window.audioManager) window.audioManager.playSound('skin_theme_equip', 0.8);

        this.updateAllMonsterVisuals();
        this.renderSkinsShop();
        return { success: true };
    }

    /**
     * Unequip a skin.
     * LEVEL 5 GATE: Blocked below Level 5 (nothing to unequip anyway).
     */
    unequipSkin() {
        const userLevel = window.gameState?.jerryLevel || 1;
        if (userLevel < EGG_LEVEL_GATE) return { success: false, reason: 'egg' };

        this.equippedSkinId = null;
        window.gameState.equippedSkinId = null;
        window.saveGameState();

        if (window.audioManager) window.audioManager.playSound('skin_theme_equip', 0.8);

        this.updateAllMonsterVisuals();
        this.renderSkinsShop();
        return { success: true };
    }
}

// Global instance
window.skinsManager = new SkinsManager();
