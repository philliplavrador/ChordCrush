// Game Logic Module
import { Constants } from './constants.js';

export class GameEngine {
    constructor() {
        this.sessionChords = [];
        this.trainingDeck = [];
        this.completedChords = [];
        this.gameMode = 'timeTrials'; // 'timeTrials' or 'trainingMode'
        this.showingHelp = false;
        this.lockedInNotes = new Set(); // Track locked-in correct notes for training mode
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }

    generateSessionChords(availableChords) {
        const pool = [...availableChords];
        
        if (this.gameMode === 'trainingMode') {
            // For training mode, initialize the training deck
            this.trainingDeck = [...pool];
            this.completedChords = [];
            this.sessionChords = [...pool]; // Keep for progress tracking
            return;
        }
        
        // Time Trials mode (original logic)
        // Find C Major if it exists in the pool
        const cMajorIndex = pool.findIndex(chord => 
            chord.aliases.some(alias => alias === 'C Major' || alias === 'C')
        );
        
        this.sessionChords = [];
        
        // Start with C Major if available
        if (cMajorIndex !== -1) {
            this.sessionChords.push(pool[cMajorIndex]);
            pool.splice(cMajorIndex, 1); // Remove C Major from pool to avoid duplicates
        }
        
        // Add all remaining chords in random order
        while (pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            this.sessionChords.push(pool[randomIndex]);
            pool.splice(randomIndex, 1); // Remove the selected chord to avoid duplicates
        }
    }

    getCurrentChord() {
        if (this.gameMode === 'trainingMode') {
            return this.trainingDeck.length > 0 ? this.trainingDeck[0] : null;
        }
        return this.sessionChords[0] || null;
    }

    getCurrentChordIndex() {
        if (this.gameMode === 'trainingMode') {
            return this.completedChords.length;
        }
        return 0; // Time trials uses external index
    }

    getTotalChords() {
        return this.sessionChords.length;
    }

    isTrainingMode() {
        return this.gameMode === 'trainingMode';
    }

    isSessionComplete() {
        if (this.gameMode === 'trainingMode') {
            return this.trainingDeck.length === 0;
        }
        return false; // Time trials handles completion externally
    }

    getSessionChords() {
        return this.sessionChords;
    }

    checkChord(targetChord, currentNotes) {
        // Check if all target notes are pressed (accounting for enharmonic equivalents)
        let isCorrect = currentNotes.size === targetChord.notes.length;
        if (isCorrect) {
            for (const targetNote of targetChord.notes) {
                const targetEquivalents = Constants.getEnharmonicEquivalents(targetNote);
                let foundMatch = false;
                
                // Check if any played note matches any equivalent of this target note
                for (const playedNote of currentNotes) {
                    if (targetEquivalents.has(playedNote)) {
                        foundMatch = true;
                        break;
                    }
                }
                
                if (!foundMatch) {
                    isCorrect = false;
                    break;
                }
            }
        }
        
        // For training mode, check partial correctness
        let partialCorrectNotes = new Set();
        if (this.gameMode === 'trainingMode') {
            partialCorrectNotes = this.getPartialCorrectNotes(targetChord, currentNotes);
            this.updateLockedInNotes(partialCorrectNotes);
        }

        // For time trials mode, any incomplete chord (when not training) should be penalized
        const shouldApplyPenalty = !isCorrect && (
            currentNotes.size === targetChord.notes.length || // Wrong notes with correct count
            (currentNotes.size > 0 && currentNotes.size < targetChord.notes.length && this.gameMode === 'timeTrials') // Incomplete chord in time trials
        );

        return {
            isCorrect,
            hasCorrectCount: currentNotes.size === targetChord.notes.length,
            shouldApplyPenalty,
            partialCorrectNotes,
            lockedInNotes: new Set(this.lockedInNotes)
        };
    }


    // Get notes that are correct but not necessarily the complete chord
    getPartialCorrectNotes(targetChord, currentNotes) {
        const partialCorrect = new Set();
        
        for (const playedNote of currentNotes) {
            for (const targetNote of targetChord.notes) {
                const targetEquivalents = Constants.getEnharmonicEquivalents(targetNote);
                if (targetEquivalents.has(playedNote)) {
                    partialCorrect.add(playedNote);
                    break;
                }
            }
        }
        
        return partialCorrect;
    }

    // Update locked-in notes (notes that are correct and should stay highlighted)
    updateLockedInNotes(partialCorrectNotes) {
        // Add any new correct notes to locked-in set
        for (const note of partialCorrectNotes) {
            this.lockedInNotes.add(note);
        }
    }

    // Clear locked-in notes (called when moving to next chord)
    clearLockedInNotes() {
        this.lockedInNotes.clear();
    }

    // Get currently locked-in notes
    getLockedInNotes() {
        return new Set(this.lockedInNotes);
    }

    // Training mode specific methods
    handleTrainingModeResult(isCorrect) {
        if (this.gameMode !== 'trainingMode') return false;
        
        const currentChord = this.trainingDeck[0];
        if (!currentChord) return false;
        
        if (isCorrect && !this.showingHelp) {
            // Chord played correctly without help - complete it
            this.completedChords.push(currentChord);
            this.trainingDeck.shift(); // Remove from deck
            this.clearLockedInNotes(); // Clear locked-in notes for next chord
            return { action: 'complete', nextChord: this.getCurrentChord() };
        } else if (isCorrect && this.showingHelp) {
            // Chord played correctly after showing help - move to back of deck
            this.trainingDeck.shift();
            this.trainingDeck.push(currentChord);
            this.showingHelp = false;
            this.clearLockedInNotes(); // Clear locked-in notes for next chord
            return { action: 'retry', nextChord: this.getCurrentChord() };
        } else if (!isCorrect) {
            // Chord played incorrectly - show help
            this.showingHelp = true;
            return { action: 'showHelp', chord: currentChord };
        }
        
        return false;
    }

    hideHelp() {
        this.showingHelp = false;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    }
}