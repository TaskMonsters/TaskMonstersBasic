// uiManager.js - UI transitions and message display
export const uiManager = {
  showBattle(hero, enemy) {
    const modal = document.getElementById('battleModal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    // Set sprites
    const heroSprite = document.getElementById('heroBattleSprite');
    const enemySprite = document.getElementById('enemySprite');
    
    if (heroSprite) {
      // v3.56: Use getActiveHeroAppearance to respect equipped skins
      const appearance = window.getActiveHeroAppearance ? window.getActiveHeroAppearance() : null;
      if (appearance && appearance.animations && appearance.animations.idle) {
        heroSprite.src = appearance.animations.idle;
      } else {
        heroSprite.src = hero.sprites.idle;
      }
      heroSprite.style.backgroundImage = 'none';
      heroSprite.style.background = 'none';
      heroSprite.classList.add('hero');
    }
    if (enemySprite) {
      enemySprite.src = enemy.sprites.idle;
      enemySprite.classList.add('enemy');
    }
  },

  updateBattleUI(hero, enemy) {
    const heroHP = document.getElementById('heroHP');
    const enemyHP = document.getElementById('enemyHP');
    const heroHPBar = document.getElementById('heroHPBar');
    const enemyHPBar = document.getElementById('enemyHPBar');
    
    if (heroHP) heroHP.innerText = `${hero.hp}/${hero.maxHp}`;
    if (enemyHP) enemyHP.innerText = `${enemy.hp}/${enemy.maxHp}`;
    
    if (heroHPBar) {
      const heroPercent = (hero.hp / hero.maxHp) * 100;
      heroHPBar.style.width = `${heroPercent}%`;
    }
    
    if (enemyHPBar) {
      const enemyPercent = (enemy.hp / enemy.maxHp) * 100;
      enemyHPBar.style.width = `${enemyPercent}%`;
    }
  },

  endBattle(result, xpGained = 0) {
    const modal = document.getElementById('battleModal');
    if (!modal) return;
    
    setTimeout(() => {
      modal.classList.add('hidden');
      
      if (result === 'victory') {
        this.showMessage(`🎉 Victory! Gained ${xpGained} XP!`);
      } else if (result === 'defeat') {
        this.showMessage('💀 Defeated! Your hero has been restored.');
      } else if (result === 'escape') {
        this.showMessage('🏃 You escaped safely!');
      }
    }, 1000);
  },

  showMessage(text, duration = 3000) {
    const message = document.getElementById('gameMessage');
    if (!message) return;
    
    message.textContent = text;
    message.classList.remove('hidden');
    
    setTimeout(() => {
      message.classList.add('hidden');
    }, duration);
  }
};

