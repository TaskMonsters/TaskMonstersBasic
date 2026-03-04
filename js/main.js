// main.js - App initialization and state logic
import { Hero } from './hero.js';
import { createRandomEnemy } from './enemy.js';
import { BattleManager } from './battleManager.js';
import { uiManager } from './uiManager.js';
import { preloadAllAssets } from './assetLoader.js';

// Global game state
let hero;
let currentBattle = null;

// FIXED v3.54: Hero sprite paths now use GIF animations
// These are legacy paths - actual sprite loading now uses GIF files
// from battleInit.js getActiveHeroAppearance() function
const heroSprites = {
  idle: 'assets/heroes/Nova_idle.gif',
  attack: 'assets/heroes/Nova_attack.gif',
  hurt: 'assets/heroes/Nova_Hurt.gif',
  celebrate: 'assets/heroes/Nova_jump.gif'
};

// Initialize the game
async function initGame() {

  // Show loading message
  const loadingEl = document.getElementById('loadingMessage');
  if (loadingEl) loadingEl.style.display = 'block';
  
  // Preload all assets
  await preloadAllAssets();
  
  // Hide loading message
  if (loadingEl) loadingEl.style.display = 'none';
  
  // Load hero from localStorage or create new
  const savedHero = localStorage.getItem('dailyquest_hero');
  if (savedHero) {
    const heroData = JSON.parse(savedHero);
    hero = new Hero(heroData.name, heroSprites);
    hero.hp = heroData.hp;
    hero.maxHp = heroData.maxHp;
    hero.atk = heroData.atk;
    hero.xp = heroData.xp;
    hero.level = heroData.level;
  } else {
    hero = new Hero('Hero', heroSprites);
  }
  
  // Set initial sprite
  hero.setState('idle');
  
  // Update stats display
  updateHeroStats();
  
  // Set up explore button
  const exploreBtn = document.getElementById('exploreButton');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', handleExplore);
  }
  
  // Set up battle buttons
  setupBattleButtons();

}

// Handle explore action
function handleExplore() {
  const exploreBtn = document.getElementById('exploreButton');
  if (exploreBtn) {
    exploreBtn.disabled = true;
    exploreBtn.innerText = 'Exploring...';
  }
  
  // 30% chance to encounter enemy
  setTimeout(() => {
    if (Math.random() < 0.3) {
      const enemy = createRandomEnemy();
      startBattle(enemy);
    } else {
      uiManager.showMessage('You explored but found nothing!');
      // Small XP reward for exploring
      hero.gainXP(2);
      updateHeroStats();
      saveHero();
    }
    
    if (exploreBtn) {
      exploreBtn.disabled = false;
      exploreBtn.innerText = 'Explore';
    }
  }, 1000);
}

// Start a battle
function startBattle(enemy) {
  currentBattle = new BattleManager(hero, enemy);
  currentBattle.start();
}

// Set up battle button event listeners
function setupBattleButtons() {
  const attackBtn = document.getElementById('battleAttackBtn');
  const defendBtn = document.getElementById('battleDefendBtn');
  const runBtn = document.getElementById('battleRunBtn');
  
  if (attackBtn) {
    attackBtn.addEventListener('click', () => {
      if (currentBattle) {
        currentBattle.playerAttack();
      }
    });
  }
  
  if (defendBtn) {
    defendBtn.addEventListener('click', () => {
      if (currentBattle) {
        currentBattle.playerDefend();
      }
    });
  }
  
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (currentBattle) {
        currentBattle.playerRun();
      }
    });
  }
}

// Update hero stats display
function updateHeroStats() {
  const healthText = document.getElementById('healthText');
  const taskPoints = document.getElementById('taskPoints');
  const rockLevelDisplay = document.getElementById('rockLevelDisplay');
  const experienceDisplay = document.getElementById('experienceDisplay');
  
  if (healthText) {
    healthText.innerText = `Health: ${hero.hp}/${hero.maxHp} - Level ${hero.level}`;
  }
  
  if (taskPoints) {
    taskPoints.innerText = `${hero.xp} XP`;
  }
  
  if (rockLevelDisplay) {
    rockLevelDisplay.innerText = hero.level;
  }
  
  if (experienceDisplay) {
    const xpNeeded = hero.level * 100;
    experienceDisplay.innerText = `${hero.xp}/${xpNeeded} XP`;
  }
  
  // Update health bar
  const healthFill = document.getElementById('healthFill');
  if (healthFill) {
    const healthPercent = (hero.hp / hero.maxHp) * 100;
    healthFill.style.width = `${healthPercent}%`;
  }
}

// Save hero to localStorage
function saveHero() {
  const heroData = {
    name: hero.name,
    hp: hero.hp,
    maxHp: hero.maxHp,
    atk: hero.atk,
    xp: hero.xp,
    level: hero.level
  };
  localStorage.setItem('dailyquest_hero', JSON.stringify(heroData));
}

// Auto-save hero periodically
setInterval(() => {
  if (hero) {
    saveHero();
  }
}, 5000);

// Make updateHeroStats available globally
window.updateHeroStats = updateHeroStats;

// Global function to add XP
window.addJerryXP = function(amount) {
  if (hero) {
    const levelUp = hero.gainXP(amount);
    updateHeroStats();
    saveHero();
    if (levelUp) {
      uiManager.showMessage(`🎉 Level Up! Hero is now Level ${hero.level}!`);
      hero.celebrate();
    }
  } else {
    console.error('Hero object not initialized. Cannot add XP.');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

