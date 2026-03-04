/**
 * BATTLE AUDIO MANAGER
 * Handles battle music rotation and sound effects
 */

class BattleAudioManager {
    constructor() {
        this.currentMusic = null;
        this.mainMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        
        // Battle music tracks using the provided assets
        this.battleMusicTracks = [
            'Battle Music Default.mp3',
            'Battle mode music 1.mp3',
            'Battle mode music 2.mp3',
            'Battle mode 3.mp3',
            'Battle mode music 4.mp3',
            'Battle-mode-music-6.mp3',
            'battleMusic.mp3'
        ];
        
        this.currentTrackIndex = 0;
        
        // Sound effects mapping
        this.soundEffects = {
            player_attack: 'player_attack.mp3',
            enemy_attack: 'enemy_attack.mp3',
            defend: 'defend.mp3',
            item_use: 'item_use.mp3',
            ability_use: 'ability_use.mp3',
            focus_charge: 'focus_charge.mp3',
            bat_hazard: 'bat_hazard.mp3',
            battle_win: 'When user wins a battle.mp3',
            battle_lose: 'WHEN USER LOSES A BATTLE.mp3',
            battle_start: 'battle_start.mp3'
        };
        
        // Preload sound effects
        this.loadedSounds = {};
        
        // Load volume settings
        this.loadSettings();
    }
    
    /**
     * PLAY BATTLE MUSIC
     * Starts battle music based on arena
     */
    playBattleMusic(arena = null) {
        // Stop current music if playing
        this.stopCurrentMusic();
        
        // Select track (rotate through tracks)
        const trackIndex = this.currentTrackIndex % this.battleMusicTracks.length;
        const trackName = this.battleMusicTracks[trackIndex];
        
        // Increment for next battle
        this.currentTrackIndex++;
        
        // Create audio element - Use the correct path for battle music
        this.currentMusic = new Audio(`assets/battle/music/${trackName}`);
        this.currentMusic.volume = this.musicVolume;
        this.currentMusic.loop = true;
        
        // Play
        this.currentMusic.play().catch(err => {
            console.warn('Failed to play battle music:', err);
        });

    }
    
    /**
     * STOP BATTLE MUSIC
     */
    stopBattleMusic() {
        this.stopCurrentMusic();
        this.resumeMainMusic();
    }
    
    /**
     * STOP CURRENT MUSIC
     */
    stopCurrentMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }
    
    /**
     * PAUSE MAIN MUSIC
     * Called when battle starts
     */
    pauseMainMusic() {
        // Find main game music element (if exists)
        const mainMusicElement = document.getElementById('mainMusic');
        if (mainMusicElement) {
            this.mainMusic = mainMusicElement;
            this.mainMusic.pause();
        }
    }
    
    /**
     * RESUME MAIN MUSIC
     * Called when battle ends
     */
    resumeMainMusic() {
        if (this.mainMusic) {
            this.mainMusic.play().catch(err => {
                console.warn('Failed to resume main music:', err);
            });
        }
    }
    
    /**
     * PLAY SOUND EFFECT
     */
    playSound(soundId) {
        const soundFile = this.soundEffects[soundId];
        if (!soundFile) {
            console.warn('Sound not found:', soundId);
            return;
        }
        
        // Create or get cached sound
        let sound = this.loadedSounds[soundId];
        
        if (!sound) {
            // Check if it's one of the new win/lose sounds or a default sound
            const path = (soundId === 'battle_win' || soundId === 'battle_lose') 
                ? `assets/audio/battle/${soundFile}`
                : `assets/battle/sounds/${soundFile}`;
                
            sound = new Audio(path);
            sound.volume = this.sfxVolume;
            this.loadedSounds[soundId] = sound;
        }
        
        // Clone for overlapping sounds
        const soundClone = sound.cloneNode();
        soundClone.volume = this.sfxVolume;
        
        soundClone.play().catch(err => {
            console.warn(`Failed to play sound ${soundId}:`, err);
        });
    }
    
    /**
     * SET MUSIC VOLUME
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
        
        this.saveSettings();
    }
    
    /**
     * SET SFX VOLUME
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    /**
     * MUTE ALL
     */
    muteAll() {
        this.setMusicVolume(0);
        this.setSFXVolume(0);
    }
    
    /**
     * UNMUTE ALL
     */
    unmuteAll() {
        this.setMusicVolume(0.5);
        this.setSFXVolume(0.7);
    }
    
    /**
     * PERSISTENCE
     */
    saveSettings() {
        try {
            localStorage.setItem('battleAudioSettings', JSON.stringify({
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume
            }));
        } catch (e) {
            console.error('Failed to save audio settings:', e);
        }
    }
    
    loadSettings() {
        try {
            const data = localStorage.getItem('battleAudioSettings');
            if (data) {
                const settings = JSON.parse(data);
                this.musicVolume = settings.musicVolume || 0.5;
                this.sfxVolume = settings.sfxVolume || 0.7;
            }
        } catch (e) {
            console.error('Failed to load audio settings:', e);
        }
    }
    
    /**
     * PRELOAD SOUNDS
     * Call this on app initialization
     */
    preloadSounds() {
        for (const soundId in this.soundEffects) {
            const soundFile = this.soundEffects[soundId];
            const path = (soundId === 'battle_win' || soundId === 'battle_lose') 
                ? `assets/audio/battle/${soundFile}`
                : `assets/battle/sounds/${soundFile}`;
                
            const sound = new Audio(path);
            sound.volume = this.sfxVolume;
            sound.preload = 'auto';
            this.loadedSounds[soundId] = sound;
        }

    }
}

// Export
if (typeof window !== 'undefined') {
    window.BattleAudioManager = BattleAudioManager;
}
