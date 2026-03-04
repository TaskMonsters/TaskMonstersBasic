// Task Monsters Battle System - Integrated into Creature Display
const BattleSystem = {
    state: {
        active: false,
        turn: 'player',
        hero: { energy: 103, maxEnergy: 103, attack: 7, defense: 5 },
        enemy: { hp: 35, maxHp: 35, attack: 7, defense: 3, name: 'Lazy Bat' },
        inventory: { fireball: 3, shield: 2, heal: 1 }
    },

    init() {

        this.injectStyles();
        this.createBattleElements();

    },

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Battle Mode Overlay */
            .pet-rock-header.battle-mode::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                border-radius: 16px;
                z-index: 5;
            }

            /* Enemy Sprite Container */
            #enemyContainer {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 128px;
                height: 128px;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 15;
            }

            #enemyContainer.visible {
                display: flex;
            }

            /* Enemy Stats - EverQuest Style Floating Bars */
            .enemy-stats {
                position: absolute;
                top: -45px;
                left: 50%;
                transform: translateX(-50%);
                width: 120px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                z-index: 20;
            }

            .enemy-stat-bar {
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.4);
                border-radius: 4px;
                padding: 3px 6px;
            }

            .enemy-stat-label {
                display: flex;
                justify-content: space-between;
                color: #fff;
                font-weight: 700;
                font-size: 10px;
                margin-bottom: 2px;
            }

            .enemy-stat-bar-bg {
                height: 6px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 3px;
                overflow: hidden;
            }

            .enemy-stat-bar-fill {
                height: 100%;
                transition: width 0.3s ease;
            }

            .enemy-hp-fill {
                background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
            }

            .enemy-def-fill {
                background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
            }

            /* Enemy Sprite */
            #enemySprite {
                width: 32px;
                height: 32px;
                image-rendering: pixelated;
                object-fit: none;
                transform: scale(4);
                transform-origin: center center;
            }

            .enemy-idle {
                animation: enemy-idle 0.96s steps(8) infinite;
            }

            @keyframes enemy-idle {
                0% { object-position: 0 0; }
                12.5% { object-position: -32px 0; }
                25% { object-position: -64px 0; }
                37.5% { object-position: -96px 0; }
                50% { object-position: -128px 0; }
                62.5% { object-position: -160px 0; }
                75% { object-position: -192px 0; }
                87.5% { object-position: -224px 0; }
            }

            .enemy-attack {
                animation: enemy-attack 0.72s steps(9) forwards;
            }

            @keyframes enemy-attack {
                0% { object-position: 0 0; }
                11.11% { object-position: -32px 0; }
                22.22% { object-position: -64px 0; }
                33.33% { object-position: -96px 0; }
                44.44% { object-position: -128px 0; }
                55.55% { object-position: -160px 0; }
                66.66% { object-position: -192px 0; }
                77.77% { object-position: -224px 0; }
                88.88% { object-position: -256px 0; }
            }

            /* Battle Items Panel */
            #battleItemsPanel {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 16px;
                padding: 12px 16px;
                display: none;
                gap: 12px;
                z-index: 1000;
                flex-wrap: wrap;
                justify-content: center;
            }

            #battleItemsPanel.visible {
                display: flex;
            }

            .battle-item {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .battle-item:hover:not(.disabled) {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.5);
                transform: scale(1.1);
            }

            .battle-item:active:not(.disabled) {
                transform: scale(0.95);
            }

            .battle-item.disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }

            .item-emoji {
                font-size: 28px;
            }

            .item-count {
                font-size: 10px;
                font-weight: 700;
                color: #fff;
                margin-top: 2px;
            }

            /* Battle Message */
            #battleMessage {
                position: absolute;
                bottom: -60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                color: #fff;
                padding: 12px 20px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 50;
                white-space: nowrap;
            }

            #battleMessage.visible {
                opacity: 1;
            }

            /* Projectile Effects */
            .fireball-projectile {
                position: absolute;
                width: 32px;
                height: 32px;
                background: url('assets/fire-ball.png') no-repeat center;
                background-size: contain;
                transform: scale(2);
                z-index: 25;
                pointer-events: none;
            }

            .explosion-effect {
                position: absolute;
                width: 64px;
                height: 64px;
                background: url('assets/fireball-explosion3.png') no-repeat center;
                background-size: contain;
                z-index: 25;
                pointer-events: none;
                animation: explode 0.42s steps(6) forwards;
            }

            @keyframes explode {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }

            /* Screen Shake */
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-4px); }
                75% { transform: translateX(4px); }
            }

            .shake {
                animation: shake 0.5s ease-in-out;
            }

            /* Enemy Retreat */
            @keyframes retreat {
                0% { transform: translateY(0) scale(4); opacity: 1; }
                100% { transform: translateY(-150px) scale(4); opacity: 0; }
            }

            .retreating {
                animation: retreat 1.2s ease-in-out forwards;
            }

            /* Ensure creature container is positioned for battle */
            .creature-container {
                position: relative !important;
            }
        `;
        document.head.appendChild(style);
    },

    createBattleElements() {
        const creatureContainer = document.querySelector('.creature-container');
        if (!creatureContainer) {
            console.error('Creature container not found!');
            return;
        }

        // Enemy Container
        const enemyContainer = document.createElement('div');
        enemyContainer.id = 'enemyContainer';
        enemyContainer.innerHTML = `
            <div class="enemy-stats">
                <div class="enemy-stat-bar">
                    <div class="enemy-stat-label">
                        <span>HP</span>
                        <span id="enemyHPText">35/35</span>
                    </div>
                    <div class="enemy-stat-bar-bg">
                        <div class="enemy-stat-bar-fill enemy-hp-fill" id="enemyHPFill" style="width: 100%;"></div>
                    </div>
                </div>
                <div class="enemy-stat-bar">
                    <div class="enemy-stat-label">
                        <span>DEF</span>
                        <span id="enemyDEFText">3</span>
                    </div>
                    <div class="enemy-stat-bar-bg">
                        <div class="enemy-stat-bar-fill enemy-def-fill" id="enemyDEFFill" style="width: 100%;"></div>
                    </div>
                </div>
            </div>
            <img id="enemySprite" class="enemy-idle" src="assets/enemies/Lazy Bat/Lazy Bat-Idlefly-animated.gif" alt="Enemy" />
        `;
        creatureContainer.appendChild(enemyContainer);

        // Battle Message
        const battleMessage = document.createElement('div');
        battleMessage.id = 'battleMessage';
        creatureContainer.appendChild(battleMessage);

        // Battle Items Panel
        const battleItems = document.createElement('div');
        battleItems.id = 'battleItemsPanel';
        battleItems.innerHTML = `
            <div class="battle-item" data-action="attack">
                <div class="item-emoji">⚔️</div>
                <div class="item-count">Attack</div>
            </div>
            <div class="battle-item" data-action="fireball">
                <div class="item-emoji">🔥</div>
                <div class="item-count" id="fireballCount">3</div>
            </div>
            <div class="battle-item" data-action="shield">
                <div class="item-emoji">🛡️</div>
                <div class="item-count" id="shieldCount">2</div>
            </div>
            <div class="battle-item" data-action="heal">
                <div class="item-emoji">💚</div>
                <div class="item-count" id="healCount">1</div>
            </div>
            <div class="battle-item" data-action="run">
                <div class="item-emoji">🏃</div>
                <div class="item-count">Run</div>
            </div>
        `;
        document.body.appendChild(battleItems);

        // Attach click handlers
        battleItems.querySelectorAll('.battle-item').forEach(item => {
            item.addEventListener('click', () => {
                if (!item.classList.contains('disabled')) {
                    this.handleAction(item.dataset.action);
                }
            });
        });
    },

    startBattle() {

        this.state.active = true;
        this.state.turn = 'player';

        // Activate battle mode
        document.querySelector('.pet-rock-header').classList.add('battle-mode');
        document.getElementById('enemyContainer').classList.add('visible');
        document.getElementById('battleItemsPanel').classList.add('visible');

        this.showMessage(`🦇 ${this.state.enemy.name} flutters in to steal your focus!`);
    },

    handleAction(action) {
        if (!this.state.active || this.state.turn !== 'player') return;

        switch(action) {
            case 'attack':
                this.playerAttack(false);
                break;
            case 'fireball':
                if (this.state.inventory.fireball > 0) {
                    this.state.inventory.fireball--;
                    this.updateInventoryUI();
                    this.playerAttack(true);
                } else {
                    this.showMessage('❌ No Fireballs left!');
                }
                break;
            case 'shield':
                if (this.state.inventory.shield > 0) {
                    this.state.inventory.shield--;
                    this.state.hero.defense += 5;
                    this.updateInventoryUI();
                    this.updateStats();
                    this.showMessage('🛡️ Defense increased!');
                    setTimeout(() => this.enemyTurn(), 1500);
                }
                break;
            case 'heal':
                if (this.state.inventory.heal > 0) {
                    this.state.inventory.heal--;
                    this.state.hero.energy = Math.min(this.state.hero.maxEnergy, this.state.hero.energy + 30);
                    this.updateInventoryUI();
                    this.updateStats();
                    this.showMessage('💚 Healed 30 energy!');
                    setTimeout(() => this.enemyTurn(), 1500);
                }
                break;
            case 'run':
                this.endBattle('retreat');
                break;
        }
    },

    playerAttack(isFireball) {
        this.state.turn = 'animating';

        const heroSprite = document.getElementById('heroSprite');
        // v3.56: Use startHeroAnimation to respect equipped skins
        if (window.startHeroAnimation) {
            window.startHeroAnimation('attack');
        }

        if (isFireball) {
            setTimeout(() => this.animateFireball(), 300);
        }

        setTimeout(() => {
            const bonus = isFireball ? 2 : 1;
            const damage = Math.max(3, Math.floor((this.state.hero.attack - this.state.enemy.defense / 2) * bonus));
            this.state.enemy.hp = Math.max(0, this.state.enemy.hp - damage);
            
            this.updateEnemyStats();
            this.shakeScreen();
            this.showMessage(`💥 You dealt ${damage} damage!`);

            setTimeout(() => {
                // v3.56: Use startHeroAnimation to respect equipped skins
                if (window.startHeroAnimation) {
                    window.startHeroAnimation('idle');
                }
            }, 640);

            if (this.state.enemy.hp <= 0) {
                setTimeout(() => this.endBattle('victory'), 1000);
            } else {
                setTimeout(() => this.enemyTurn(), 1500);
            }
        }, isFireball ? 900 : 640);
    },

    enemyTurn() {
        this.state.turn = 'enemy';

        const enemySprite = document.getElementById('enemySprite');
        enemySprite.classList.remove('enemy-idle');
        enemySprite.classList.add('enemy-attack');
        // v3.56: Use enemy data for attack animation
        if (this.state.enemy && window.playEnemyAnimation) {
            window.playEnemyAnimation(this.state.enemy, 'attack', 500);
        }

        setTimeout(() => {
            // Use correct damage range if available
            const damage = this.state.enemy.attackDamageMin !== undefined && this.state.enemy.attackDamageMax !== undefined
                ? Math.floor(Math.random() * (this.state.enemy.attackDamageMax - this.state.enemy.attackDamageMin + 1)) + this.state.enemy.attackDamageMin
                : Math.max(3, Math.floor(this.state.enemy.attack - this.state.hero.defense / 2));
            this.state.hero.energy = Math.max(0, this.state.hero.energy - damage);
            
            this.updateStats();
            this.shakeScreen();
            this.showMessage(`💢 ${this.state.enemy.name} dealt ${damage} damage!`);

            setTimeout(() => {
                enemySprite.classList.remove('enemy-attack');
                enemySprite.classList.add('enemy-idle');
                // v3.56: Use enemy data for idle animation
                if (this.state.enemy && window.playEnemyAnimation) {
                    window.playEnemyAnimation(this.state.enemy, 'idle', 500);
                }
            }, 720);

            if (this.state.hero.energy <= 0) {
                setTimeout(() => this.endBattle('defeat'), 1000);
            } else {
                this.state.turn = 'player';
                setTimeout(() => this.showMessage('Your turn!'), 1500);
            }
        }, 720);
    },

    animateFireball() {
        const fireball = document.createElement('div');
        fireball.className = 'fireball-projectile';
        fireball.style.left = '30%';
        fireball.style.top = '50%';
        document.querySelector('.creature-container').appendChild(fireball);

        setTimeout(() => {
            fireball.style.transition = 'all 0.6s ease-out';
            fireball.style.left = '70%';
        }, 50);

        setTimeout(() => {
            const explosion = document.createElement('div');
            explosion.className = 'explosion-effect';
            explosion.style.left = '70%';
            explosion.style.top = '50%';
            explosion.style.transform = 'translate(-50%, -50%)';
            document.querySelector('.creature-container').appendChild(explosion);

            setTimeout(() => explosion.remove(), 420);
            fireball.remove();
        }, 650);
    },

    endBattle(result) {
        this.state.active = false;

        if (result === 'victory') {
            this.showMessage(`✨ ${this.state.enemy.name} retreats to nap elsewhere!`);
            document.getElementById('enemySprite').classList.add('retreating');
        } else if (result === 'retreat') {
            this.showMessage('🏃 You retreat to fight another day...');
        } else {
            this.showMessage('💫 You need to rest and recover...');
        }

        setTimeout(() => {
            document.querySelector('.pet-rock-header').classList.remove('battle-mode');
            document.getElementById('enemyContainer').classList.remove('visible');
            document.getElementById('battleItemsPanel').classList.remove('visible');
            
            // Reset
            this.state.hero.energy = this.state.hero.maxEnergy;
            this.state.enemy.hp = this.state.enemy.maxHp;
            this.updateStats();
            this.updateEnemyStats();

            const enemySprite = document.getElementById('enemySprite');
            enemySprite.classList.remove('retreating');
            enemySprite.classList.add('enemy-idle');
        }, 2000);
    },

    updateStats() {
        const energyPercent = (this.state.hero.energy / this.state.hero.maxEnergy) * 100;
        const energyFill = document.getElementById('energyFill');
        const energyText = document.getElementById('energyText');
        if (energyFill) energyFill.style.width = energyPercent + '%';
        if (energyText) energyText.textContent = `${this.state.hero.energy}/${this.state.hero.maxEnergy}`;
    },

    updateEnemyStats() {
        const hpPercent = (this.state.enemy.hp / this.state.enemy.maxHp) * 100;
        document.getElementById('enemyHPFill').style.width = hpPercent + '%';
        document.getElementById('enemyHPText').textContent = `${this.state.enemy.hp}/${this.state.enemy.maxHp}`;
        document.getElementById('enemyDEFText').textContent = this.state.enemy.defense;
    },

    updateInventoryUI() {
        document.getElementById('fireballCount').textContent = this.state.inventory.fireball;
        document.getElementById('shieldCount').textContent = this.state.inventory.shield;
        document.getElementById('healCount').textContent = this.state.inventory.heal;

        // Update disabled state
        const items = document.querySelectorAll('.battle-item');
        items.forEach(item => {
            const action = item.dataset.action;
            if (action === 'fireball' && this.state.inventory.fireball === 0) {
                item.classList.add('disabled');
            } else if (action === 'shield' && this.state.inventory.shield === 0) {
                item.classList.add('disabled');
            } else if (action === 'heal' && this.state.inventory.heal === 0) {
                item.classList.add('disabled');
            }
        });
    },

    showMessage(text) {
        const msg = document.getElementById('battleMessage');
        msg.textContent = text;
        msg.classList.add('visible');

        setTimeout(() => {
            msg.classList.remove('visible');
        }, 2000);
    },

    shakeScreen() {
        document.querySelector('.pet-rock-header').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.pet-rock-header').classList.remove('shake');
        }, 500);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BattleSystem.init());
} else {
    BattleSystem.init();
}

// Expose globally for testing
window.BattleSystem = BattleSystem;

