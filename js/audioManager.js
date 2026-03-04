/**
 * AudioManager - Complete Audio System with Sound Effects and Music
 * Optimized for low-power devices (iPhone 8+)
 * Features: Full sound effects library and background music
 */

class AudioManager {
    constructor() {
        // Audio state
        this.enabled = localStorage.getItem("soundEnabled") !== "false"; // Default ON
        this.battleMusicAudio = null; // New property for battle music
        this.battleMusicVolume = 0.4; // Default volume for battle music

        // Track active sounds for cleanup
        this.activeSounds = new Set();

        // Volume settings
        this.sfxVolume = 1.0; // Full volume for sound effects

        // Sound effects library
        this.sounds = {
            // Regular attack (user melee)
            regular_attack: "assets/sounds/regular attack sound.mp3",

            // Special attacks
            spark_attack: "assets/sounds/Spark Attack sound.mp3",
            prickler_attack: "assets/sounds/Prickler.mp3",
            freeze_attack: "assets/sounds/Freeze attack sound.mp3",
            fireball: "assets/sounds/Fireball.mp3",

            // Items
            cloak_use: "assets/sounds/Invisibility Cloak sound.mp3",
            potion_use: "assets/sounds/potionUse.mp3", // New potion sound

            // Battle events
            enemy_regular_attack: "assets/sounds/monsterregularattacksound.mp3",
            enemy_fifth_attack: "assets/sounds/enemyevery5thattacksound.mp3",
            enemy_strong_attack: "assets/sounds/Stronger enemy attack sound.mp3",
            enemy_attack_low_level: "assets/sounds/enemyattacksound2.mp3",
            critical_hit: "assets/sounds/When users monster deals over 10 damage.mp3",
            third_attack: "assets/sounds/every 3rd attack by users monsters.mp3",
            battle_victory: "assets/sounds/when user wins any battle.mp3",

            // Defense sounds
            defend: "assets/sounds/Defend.mp3",
            defense_boost: "assets/sounds/Defenseboost.mp3",
            
            // Inventory boost sounds
            attack_boost: "assets/sounds/attack_boost.mp3",
            defense_boost_inventory: "assets/sounds/defense_boost_inventory.mp3",

            // UI sounds
            shop_purchase: "assets/sounds/shop_purchase.mp3",
            skin_theme_purchase: "assets/sounds/skin_theme_purchase.mp3",
            skin_theme_equip: "assets/sounds/skin_theme_equip.mp3",
            quest_accepted: "assets/sounds/quest-accepted.mp3",
            quiz_won: "assets/sounds/quiz-won.mp3",
            quest_complete: "assets/sounds/quest-complete.mp3",
            questComplete: "assets/sounds/quest-complete.mp3", // Alias for consistency
            taskComplete: "assets/sounds/taskComplete.mp3",
            shopPurchase: "assets/sounds/shopPurchase.mp3",
            useItemOutside: "assets/sounds/useItemOutside.mp3",
            focus_timer_complete: "assets/audio/FocusTimerSound.mp3",
        };

        // Focus Timer alarm (separate from one-shot sounds)
        this.focusAlarmAudio = null;

        // Battle outcome music (win/loss)
        this.battleWinMusic = null;
        this.battleLoseMusic = null;
        this.battleOutcomeMusicVolume = 0.7; // Volume for win/loss music

        // Music tracks (separate from sound effects)
        this.music = {
            quest_giver: "assets/sounds/Quest Giver Mode music.mp3",
            battle_win: "assets/audio/battle_win.mp3", // Battle victory music
            battle_lose: "assets/sounds/battle-loss.mp3", // Battle defeat music
        };
        
        // Battle music rotation system
        this.battleTracks = [
            "assets/sounds/battle/Battle Music Default.mp3",
            "assets/sounds/battle/Battle mode music 1.mp3",
            "assets/sounds/battle/Battle mode music 2.mp3",
            "assets/sounds/battle/Battle mode 3.mp3",
            "assets/sounds/battle/Battle mode music 4.mp3",
            "assets/sounds/battle/Battle mode music 5.mp3",
            "assets/sounds/battle/Battle-mode-music-6.mp3"
        ];
        this.currentBattleTrackIndex = 0;

        // Current music track
        this.currentMusic = null;

        // Cache for loaded audio elements
        this.audioCache = {};

        // Initialize on first user interaction (required for iOS)
        this.initialized = false;
    }

    /**
     * Get sound enabled status
     */
    get soundEnabled() {
        return this.enabled;
    }

    /**
     * Initialize AudioContext on first user interaction
     * Required for iOS audio playback
     */
    init() {
        if (this.initialized) return;

        try {
            this.initialized = true;

        } catch (error) {
            console.warn("[AudioManager] Initialization skipped:", error.message);
        }
    }

    /**
     * Play a sound effect (one-shot, non-looping)
     * @param {string} soundId - Sound identifier from this.sounds
     * @param {number} volume - Optional volume override (0-1)
     */
    playSound(soundId, volume = null) {
        if (!this.enabled || !this.sounds[soundId]) return;

        // Ensure initialized
        this.init();

        try {
            // Create or reuse audio element
            let audio = this.audioCache[soundId];
            if (!audio) {
                audio = new Audio(this.sounds[soundId]);
                audio.volume = volume !== null ? volume : this.sfxVolume;
                this.audioCache[soundId] = audio;
            }

            // Clone for concurrent playback
            const soundInstance = audio.cloneNode();
            soundInstance.volume = volume !== null ? volume : this.sfxVolume;

            // Track active sound
            this.activeSounds.add(soundInstance);

            // Remove from active set when finished
            soundInstance.addEventListener("ended", () => {
                this.activeSounds.delete(soundInstance);
            });

            // Play asynchronously
            soundInstance.play().catch((err) => {
                console.warn(`[AudioManager] Sound playback failed for ${soundId}:`, err.message);
                this.activeSounds.delete(soundInstance);
            });
        } catch (error) {
            console.warn(`[AudioManager] Error playing sound ${soundId}:`, error.message);
        }
    }

    /**
     * Get next battle track (rotation system)
     */
    getNextBattleTrack() {
        if (!this.battleTracks || this.battleTracks.length === 0) return null;
        const track = this.battleTracks[this.currentBattleTrackIndex];
        this.currentBattleTrackIndex = (this.currentBattleTrackIndex + 1) % this.battleTracks.length;
        return track;
    }
    
    /**
     * Stop all battle music tracks
     */
    stopAllBattleMusic() {
        if (this.battleMusicAudio) {
            try {
                this.battleMusicAudio.pause();
                this.battleMusicAudio.currentTime = 0;
                this.battleMusicAudio = null;
            } catch (error) {
                console.warn("[AudioManager] Error stopping battle music:", error.message);
            }
        }
    }

    /**
     * Play battle music with rotation
     * This method starts the next battle music track from the rotation pool
     */
    playBattleMusic() {
        if (!this.enabled) return;

        // Stop any currently playing battle music
        this.stopAllBattleMusic();
        
        // Stop any other music
        this.stopMusic();

        try {
            const trackPath = this.getNextBattleTrack();
            if (!trackPath) {
                console.warn("[AudioManager] No battle tracks available");
                return;
            }
            
            this.battleMusicAudio = new Audio(trackPath);
            this.battleMusicAudio.volume = this.battleMusicVolume;
            this.battleMusicAudio.loop = true;

            this.battleMusicAudio.play().catch((err) => {
                console.warn("[AudioManager] Battle music playback failed:", err.message);
                this.battleMusicAudio = null;
            });

        } catch (error) {
            console.warn("[AudioManager] Error playing battle music:", error.message);
        }
    }

    /**
     * Play quest giver music
     */
    playQuestMusic() {
        if (!this.enabled || !this.music.quest_giver) return;

        // Stop any currently playing music
        this.stopMusic();

        try {
            this.currentMusic = new Audio(this.music.quest_giver);
            this.currentMusic.volume = 0.4; // Lower volume for background music
            this.currentMusic.loop = true;
            
            // FIX: Add ended event handler to ensure continuous looping
            this.currentMusic.addEventListener('ended', () => {
                if (this.currentMusic && this.enabled) {

                    this.currentMusic.currentTime = 0;
                    this.currentMusic.play().catch(err => {
                        console.warn('[AudioManager] Quest music loop restart failed:', err.message);
                    });
                }
            });
            
            // FIX: Add error handler to prevent music from stopping on errors
            this.currentMusic.addEventListener('error', (e) => {
                console.warn('[AudioManager] Quest music error:', e);
            });

            this.currentMusic.play().catch((err) => {
                console.warn("[AudioManager] Quest music playback failed:", err.message);
                this.currentMusic = null;
            });

        } catch (error) {
            console.warn("[AudioManager] Error playing quest music:", error.message);
        }
    }

    /**
     * Stop current background music (Quest or Battle)
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
                this.currentMusic = null;

            } catch (error) {
                console.warn("[AudioManager] Error stopping quest music:", error.message);
            }
        }

        if (this.battleMusicAudio) {
            try {
                this.battleMusicAudio.pause();
                this.battleMusicAudio.currentTime = 0;
                this.battleMusicAudio = null;

            } catch (error) {
                console.warn("[AudioManager] Error stopping battle music:", error.message);
            }
        }

        // Stop battle outcome music (win/loss)
        this.stopBattleOutcomeMusic();
    }

    /**
     * Play Focus Timer alarm (looping)
     * This starts the repeating alarm when timer reaches 00:00
     */
    playFocusAlarm() {
        if (!this.enabled) return;

        // Stop any existing alarm first to prevent overlaps
        this.stopFocusAlarm();

        try {
            this.focusAlarmAudio = new Audio("assets/audio/focus-timer-alarm.mp3");
            this.focusAlarmAudio.volume = 0.7;
            this.focusAlarmAudio.loop = true; // Loop indefinitely

            this.focusAlarmAudio.play().catch((err) => {
                console.warn("[AudioManager] Focus alarm playback failed:", err.message);
                this.focusAlarmAudio = null;
            });

        } catch (error) {
            console.warn("[AudioManager] Error playing focus alarm:", error.message);
        }
    }

    /**
     * Stop Focus Timer alarm
     * Called when user stops/resets timer or starts new session
     */
    stopFocusAlarm() {
        if (this.focusAlarmAudio) {
            try {
                this.focusAlarmAudio.pause();
                this.focusAlarmAudio.currentTime = 0;
                this.focusAlarmAudio = null;

            } catch (error) {
                console.warn("[AudioManager] Error stopping focus alarm:", error.message);
            }
        }
    }

    /**
     * Play battle win music (one-time, non-looping)
     * Called when player wins a battle
     */
    playBattleWinMusic() {
        if (!this.enabled || !this.music.battle_win) return;

        // Stop any currently playing battle outcome music
        this.stopBattleOutcomeMusic();

        // Stop battle music if playing
        if (this.battleMusicAudio) {
            try {
                this.battleMusicAudio.pause();
                this.battleMusicAudio.currentTime = 0;
                this.battleMusicAudio = null;
            } catch (error) {
                console.warn("[AudioManager] Error stopping battle music:", error.message);
            }
        }

        try {
            this.battleWinMusic = new Audio(this.music.battle_win);
            this.battleWinMusic.volume = this.battleOutcomeMusicVolume;
            this.battleWinMusic.loop = false; // Play once only

            this.battleWinMusic.play().catch((err) => {
                console.warn("[AudioManager] Battle win music playback failed:", err.message);
                this.battleWinMusic = null;
            });

        } catch (error) {
            console.warn("[AudioManager] Error playing battle win music:", error.message);
        }
    }

    /**
     * Play battle lose music (one-time, non-looping)
     * Called when player loses a battle
     */
    playBattleLoseMusic() {
        if (!this.enabled || !this.music.battle_lose) return;

        // Stop any currently playing battle outcome music
        this.stopBattleOutcomeMusic();

        // Stop battle music if playing
        if (this.battleMusicAudio) {
            try {
                this.battleMusicAudio.pause();
                this.battleMusicAudio.currentTime = 0;
                this.battleMusicAudio = null;
            } catch (error) {
                console.warn("[AudioManager] Error stopping battle music:", error.message);
            }
        }

        try {
            this.battleLoseMusic = new Audio(this.music.battle_lose);
            this.battleLoseMusic.volume = this.battleOutcomeMusicVolume;
            this.battleLoseMusic.loop = false; // Play once only

            this.battleLoseMusic.play().catch((err) => {
                console.warn("[AudioManager] Battle lose music playback failed:", err.message);
                this.battleLoseMusic = null;
            });

        } catch (error) {
            console.warn("[AudioManager] Error playing battle lose music:", error.message);
        }
    }

    /**
     * Stop battle outcome music (win/loss)
     * Called when battle ends or user exits battle mode
     */
    stopBattleOutcomeMusic() {
        if (this.battleWinMusic) {
            try {
                this.battleWinMusic.pause();
                this.battleWinMusic.currentTime = 0;
                this.battleWinMusic = null;

            } catch (error) {
                console.warn("[AudioManager] Error stopping battle win music:", error.message);
            }
        }

        if (this.battleLoseMusic) {
            try {
                this.battleLoseMusic.pause();
                this.battleLoseMusic.currentTime = 0;
                this.battleLoseMusic = null;

            } catch (error) {
                console.warn("[AudioManager] Error stopping battle lose music:", error.message);
            }
        }
    }

    /**
     * Stop all sounds (effects and music)
     */
    stopAll() {
        // Stop all active sound effects
        this.activeSounds.forEach((sound) => {
            try {
                sound.pause();
                sound.currentTime = 0;
            } catch (error) {
                // Ignore errors on cleanup
            }
        });

        this.activeSounds.clear();

        // Stop music
        this.stopMusic();

        // Stop focus alarm
        this.stopFocusAlarm();
    }

    /**
     * Toggle audio on/off
     * @param {boolean} on - True to enable, false to disable
     */
    toggleAudio(on) {
        this.enabled = on;
        localStorage.setItem("soundEnabled", on);

        if (!on) {
            this.stopAll();
        }

        return this.enabled;
    }

    /**
     * Legacy compatibility methods
     */
    toggleSound() {
        return this.toggleAudio(!this.enabled);
    }

    toggleMute() {
        return this.toggleAudio(!this.enabled);
    }

    mute() {
        this.toggleAudio(false);
    }

    unmute() {
        this.toggleAudio(true);
    }

    setSoundEnabled(enabled) {
        this.toggleAudio(enabled);
    }

    /**
     * Legacy compatibility - loadAllSounds
     */
    async loadAllSounds() {

        return Object.keys(this.sounds).length + 2; // sounds + 2 music tracks
    }

    /**
     * Handle visibility change
     * This method pauses or resumes music when the tab visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.currentMusic) this.currentMusic.pause();
            if (this.battleMusicAudio) this.battleMusicAudio.pause();
        } else {
            if (this.currentMusic) this.currentMusic.play().catch(err => console.warn('[AudioManager] Quest music resume failed:', err.message));
            if (this.battleMusicAudio) this.battleMusicAudio.play().catch(err => console.warn('[AudioManager] Battle music resume failed:', err.message));
        }
    }
}

// Create global AudioManager instance
window.audioManager = new AudioManager();

// Handle tab visibility for battery saving
document.addEventListener("visibilitychange", () => {
    window.audioManager.handleVisibilityChange();
});

// Initialize on first user interaction
document.addEventListener("click", () => {
    window.audioManager.init();
}, { once: true });
