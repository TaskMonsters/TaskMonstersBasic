// Theme Manager - Handles background theme purchasing and application

const availableThemes = {
    castle: {
        id: 'castle',
        name: 'Dark Castle',
        emoji: '🏰',
        description: 'Mysterious old castle interior',
        price: 400,
        preview: 'assets/backgrounds/themes/castle.png'
    },
    dark_gothic_castle: {
        id: 'dark_gothic_castle',
        name: 'Dark Gothic Castle',
        emoji: '🏰',
        description: 'Ominous castle on a cliff at twilight',
        price: 1000,
        preview: 'assets/backgrounds/themes/DarkGothicCastle.png'
    },
    forest: {
        id: 'forest',
        name: 'Misty Forest',
        emoji: '🌲',
        description: 'Enchanted forest with mist',
        price: 450,
        preview: 'assets/backgrounds/themes/forest.png'
    },
    underwater: {
        id: 'underwater',
        name: 'Underwater Fantasy',
        emoji: '🌊',
        description: 'Deep ocean wonderland',
        price: 600,
        preview: 'assets/backgrounds/themes/underwater.png'
    },
    graveyard: {
        id: 'graveyard',
        name: 'Ship Graveyard',
        emoji: '⚓',
        description: 'Abandoned ships in the mist',
        price: 550,
        preview: 'assets/backgrounds/themes/graveyard.png'
    },
    synth_city: {
        id: 'synth_city',
        name: 'Synth City',
        emoji: '🌆',
        description: 'Retro synthwave cityscape',
        price: 650,
        preview: 'assets/backgrounds/themes/synth-city.png'
    },
    space: {
        id: 'space',
        name: 'Space',
        emoji: '🌌',
        description: 'Cosmic space vista',
        price: 700,
        preview: 'assets/backgrounds/themes/space.png'
    },
    vamp_castle_bg: {
        id: 'vamp_castle_bg',
        name: 'Vampire Castle Night',
        emoji: '🦇',
        description: 'Gothic castle under moonlight',
        price: 700,
        preview: 'assets/backgrounds/themes/vamp-castle-bg.png'
    },
    neon_city_sunset: {
        id: 'neon_city_sunset',
        name: 'Neon City Sunset',
        emoji: '🌇',
        description: 'Cyberpunk cityscape at dusk',
        price: 800,
        preview: 'assets/backgrounds/themes/neon-city-sunset.png'
    },
    skull_gates: {
        id: 'skull_gates',
        name: 'Skull Gates',
        emoji: '💀',
        description: 'Haunted dungeon entrance with skull gateway',
        price: 1100,
        preview: 'assets/backgrounds/themes/SkullGates.png'
    },
    bright_town: {
        id: 'bright_town',
        name: 'Bright Town',
        emoji: '🏘️',
        description: 'Charming village with colorful houses',
        price: 1400,
        levelRequired: 30,
        preview: 'assets/themes/bright-town.png'
    },
    fort_of_illusions: {
        id: 'fort_of_illusions',
        name: 'Fort of Illusions',
        emoji: '🏯',
        description: 'Mystical fortress under starry skies',
        price: 1800,
        levelRequired: 30,
        preview: 'assets/themes/FortofIllusionsTheme.gif'
    },
    stone_ruins: {
        id: 'stone_ruins',
        name: 'Stone Ruins',
        emoji: '🏛️',
        description: 'Ancient ruins with cherry blossoms',
        price: 2200,
        levelRequired: 30,
        preview: 'assets/themes/StoneRuins.png'
    },
    forest_of_illusions: {
        id: 'forest_of_illusions',
        name: 'Forest of Illusions',
        emoji: '🌳',
        description: 'Enchanted forest with magical creatures',
        price: 2500,
        levelRequired: 30,
        preview: 'assets/themes/ForestofIllusionsTheme.gif'
    }
};

// Update themes display
function updateThemesDisplay() {
    const grid = document.getElementById('themesGrid');
    if (!grid) return;
    
    // Update XP Coins display
    const xpCoinsDisplay = document.getElementById('xpCoinsThemes');
    if (xpCoinsDisplay) {
        xpCoinsDisplay.textContent = window.gameState.jerryXP || 0;
    }
    
    grid.innerHTML = '';
    
    // Sort themes by price (lowest to highest)
    const sortedThemes = Object.values(availableThemes).sort((a, b) => a.price - b.price);
    
    // Render each theme
    sortedThemes.forEach(theme => {
        // Check level requirement
        const playerLevel = window.gameState?.level || 1;
        const levelRequired = theme.levelRequired || 0;
        const meetsLevelReq = playerLevel >= levelRequired;
        
        const isOwned = window.gameState && window.gameState.ownedThemes && window.gameState.ownedThemes.includes(theme.id);
        const isActive = window.gameState && window.gameState.activeTheme === theme.preview;
        const canAfford = window.gameState && (window.gameState.jerryXP || 0) >= theme.price;
        
        const card = document.createElement('div');
        card.className = 'shop-item-card';
        
        let buttonHtml;
        if (!meetsLevelReq) {
            // Theme is locked due to level requirement
            buttonHtml = `
                <div class="shop-item-price">${theme.price} XP</div>
                <button class="buy-now-btn" style="background: #555; cursor: not-allowed;" disabled>
                    🔒 Requires Level ${levelRequired}
                </button>
            `;
        } else if (isActive) {
            buttonHtml = `
                <button class="buy-now-btn" style="background: #666;" onclick="unapplyThemeFromShop()">
                    ✓ Active - Unapply
                </button>
            `;
        } else if (isOwned) {
            buttonHtml = `
                <button class="buy-now-btn" onclick="applyThemeFromShop('${theme.id}')">
                    Apply Theme
                </button>
            `;
        } else {
            const buttonStyle = canAfford ? '' : 'background: #555; cursor: not-allowed;';
            const buttonText = canAfford ? `Buy Now` : `Not Enough XP`;
            buttonHtml = `
                <div class="shop-item-price">${theme.price} XP</div>
                <button class="buy-now-btn" style="${buttonStyle}" onclick="buyTheme('${theme.id}')">
                    ${buttonText}
                </button>
            `;
        }
        
        const statusBadge = isOwned ? `<div style="font-size: 12px; color: #4CAF50; margin-top: 4px;">✓ Owned</div>` : '';
        
        card.innerHTML = `
            <div class="shop-item-emoji">${theme.emoji}</div>
            <div class="shop-item-name">${theme.name}</div>
            <div class="shop-item-description">${theme.description}</div>
            ${statusBadge}
            ${buttonHtml}
        `;
        grid.appendChild(card);
    });
}

// Buy a theme
function buyTheme(themeId) {
    const theme = availableThemes[themeId];
    if (!theme) return;
    
    // Check if already owned
    if (window.gameState.ownedThemes && window.gameState.ownedThemes.includes(themeId)) {
        alert(`✅ You already own ${theme.name}!`);
        return;
    }
    
    // Check if player has enough XP
    const currentXP = window.gameState.jerryXP || 0;
    if (currentXP < theme.price) {
        alert(`⚠️ Not enough XP! You need ${theme.price} XP but only have ${currentXP} XP.`);
        return;
    }
    
    // Deduct XP
    window.gameState.jerryXP -= theme.price;
    
    // Add to owned themes
    if (!window.gameState.ownedThemes) {
        window.gameState.ownedThemes = [];
    }
    window.gameState.ownedThemes.push(themeId);
    
    // Save and update displays
    if (typeof window.saveGameState === 'function') {
        window.saveGameState();
    }
    if (typeof window.updateUI === 'function') {
        window.updateUI();
    }
    updateThemesDisplay();
    
    // Play purchase sound
    if (window.audioManager) {
        window.audioManager.playSound('skin_theme_purchase', 0.8);
    }
    
    // Show success message
    alert(`🎉 ${theme.name} purchased!\n\n✨ -${theme.price} XP\n\nYou can now apply this theme to your monster's background!`);
    
    // Trigger confetti
    if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti();
    }
}

// Apply a theme
function applyThemeFromShop(themeId) {
    const theme = availableThemes[themeId];
    if (!theme) return;
    
    // Check if owned
    if (!window.gameState.ownedThemes || !window.gameState.ownedThemes.includes(themeId)) {
        alert(`❌ You don't own ${theme.name} yet! Purchase it first.`);
        return;
    }
    
    // Apply theme
    if (typeof window.applyTheme === 'function') {
        window.applyTheme(theme.preview);
        
        // Play apply sound
        if (window.audioManager) {
            window.audioManager.playSound('skin_theme_equip', 0.8);
        }
        
        alert(`✅ ${theme.name} applied!\n\nYour monster's background has been updated.`);
        updateThemesDisplay();
    }
}

// Unapply current theme (revert to default day/night cycle)
function unapplyThemeFromShop() {
    if (typeof window.unapplyTheme === 'function') {
        window.unapplyTheme();
        
        // Play unapply sound
        if (window.audioManager) {
            window.audioManager.playSound('skin_theme_equip', 0.8);
        }
        
        alert(`🔄 Theme removed!\n\nYour monster's background will now use the default day/night cycle.`);
        updateThemesDisplay();
    }
}

// Export to global scope
window.availableThemes = availableThemes;
window.updateThemesDisplay = updateThemesDisplay;
window.buyTheme = buyTheme;
window.applyThemeFromShop = applyThemeFromShop;
window.unapplyThemeFromShop = unapplyThemeFromShop;

