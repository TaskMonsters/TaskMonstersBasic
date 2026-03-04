/**
 * THREAT SYSTEM
 * Tracks player threat level and modifies enemy behavior
 */

class ThreatSystem {
    constructor() {
        this.threatScore = 50; // Start at neutral (0-100 scale)
        this.threatHistory = [];
        
        // Load from localStorage
        this.load();
    }
    
    /**
     * ADJUST THREAT
     * Called after battles and player actions
     */
    adjustThreat(delta) {
        this.threatScore = Math.max(0, Math.min(100, this.threatScore + delta));
        
        this.threatHistory.push({
            timestamp: Date.now(),
            delta,
            newScore: this.threatScore
        });
        
        // Keep only last 50 entries
        if (this.threatHistory.length > 50) {
            this.threatHistory.shift();
        }
        
        this.save();

    }
    
    /**
     * GET THREAT LEVEL
     * Returns categorical threat level
     */
    getThreatLevel() {
        if (this.threatScore < 30) {
            return 'low';
        } else if (this.threatScore < 70) {
            return 'medium';
        } else {
            return 'high';
        }
    }
    
    /**
     * GET THREAT MULTIPLIER
     * Used to scale enemy stats
     */
    getThreatMultiplier() {
        // Low threat: 0.9x (easier enemies)
        // Medium threat: 1.0x (normal)
        // High threat: 1.15x (harder enemies)
        
        if (this.threatScore < 30) {
            return 0.9;
        } else if (this.threatScore < 70) {
            return 1.0;
        } else {
            return 1.15;
        }
    }
    
    /**
     * SHOULD ENEMY BE AGGRESSIVE
     * Returns true if enemy should be more aggressive based on threat
     */
    shouldBeAggressive() {
        const level = this.getThreatLevel();
        
        if (level === 'low') {
            return Math.random() < 0.3; // 30% chance
        } else if (level === 'medium') {
            return Math.random() < 0.5; // 50% chance
        } else {
            return Math.random() < 0.7; // 70% chance
        }
    }
    
    /**
     * DECAY THREAT OVER TIME
     * Called periodically to reduce threat naturally
     */
    decayThreat() {
        // Reduce threat by 1 point per day of inactivity
        const lastBattle = this.threatHistory[this.threatHistory.length - 1];
        if (lastBattle) {
            const daysSinceLastBattle = (Date.now() - lastBattle.timestamp) / (1000 * 60 * 60 * 24);
            const decay = Math.floor(daysSinceLastBattle);
            
            if (decay > 0) {
                this.adjustThreat(-decay);
            }
        }
    }
    
    /**
     * PERSISTENCE
     */
    save() {
        try {
            localStorage.setItem('battleThreat', JSON.stringify({
                threatScore: this.threatScore,
                threatHistory: this.threatHistory
            }));
        } catch (e) {
            console.error('Failed to save threat data:', e);
        }
    }
    
    load() {
        try {
            const data = localStorage.getItem('battleThreat');
            if (data) {
                const parsed = JSON.parse(data);
                this.threatScore = parsed.threatScore || 50;
                this.threatHistory = parsed.threatHistory || [];
                
                // Apply decay
                this.decayThreat();
            }
        } catch (e) {
            console.error('Failed to load threat data:', e);
        }
    }
    
    reset() {
        this.threatScore = 50;
        this.threatHistory = [];
        this.save();
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ThreatSystem = ThreatSystem;
}
