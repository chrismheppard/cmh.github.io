// ScoreManager.js - A simple utility to manage high scores using localStorage.

const SCORE_PREFIX = 'cso-highscore-';

class ScoreManager {
    /**
     * Initializes the score manager for a specific game.
     * @param {string} game - The identifier for the game (e.g., 'solitaire-3d').
     */
    constructor(game) {
        if (!game) {
            throw new Error("ScoreManager requires a game identifier.");
        }
        this.gameKey = SCORE_PREFIX + game;
        this.highScore = this.getHighScore(); // Load the high score on init
    }

    /**
     * Retrieves the high score for the game from localStorage.
     * @returns {number} - The high score, or 0 if none is set.
     */
    getHighScore() {
        const score = localStorage.getItem(this.gameKey);
        return score ? parseInt(score, 10) : 0;
    }

    /**
     * Updates the score, saving it to localStorage if it's a new high score.
     * @param {number} newScore - The new score to check and potentially save.
     * @returns {boolean} - True if a new high score was set, false otherwise.
     */
    updateScore(newScore) {
        if (newScore > this.highScore) {
            this.highScore = newScore;
            localStorage.setItem(this.gameKey, newScore);
            console.log(`New high score for ${this.gameKey}: ${newScore}`);
            return true;
        }
        return false;
    }
}
