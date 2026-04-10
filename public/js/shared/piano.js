// Piano Display Module
import { Constants } from './constants.js';

export class PianoDisplay {
    constructor() {
        this.pianoCache = new Map(); // Cache DOM queries for better performance
    }

    create(containerId) {
        const piano = document.getElementById(containerId);
        piano.innerHTML = '';
        
        // Clear cache for this piano
        this.pianoCache.delete(containerId);
        
        const whiteKeyWidth = 100 / 14; // ~7.143% per white key
        const blackKeyWidth = 100 / 24; // ~4.167% per black key (from CSS)
        const whiteKeysOffset = 25; // White keys start at 25% from left due to centering
        
        // Calculate black key positions using constants
        const blackKeyPositions = {};
        Object.entries(Constants.BLACK_KEY_POSITIONS).forEach(([note, position]) => {
            blackKeyPositions[note] = (whiteKeysOffset + whiteKeyWidth * position - blackKeyWidth / 2) + '%';
        });
        
        Constants.WHITE_KEYS.forEach((note, index) => {
            const key = document.createElement('div');
            key.className = 'key white-key';
            key.dataset.note = note;
            
            const label = document.createElement('div');
            label.className = 'key-label';
            label.textContent = note;
            key.appendChild(label);
            
            piano.appendChild(key);
        });
        
        Object.entries(blackKeyPositions).forEach(([note, position]) => {
            const key = document.createElement('div');
            key.className = 'key black-key';
            key.dataset.note = note;
            key.style.left = position;
            
            const label = document.createElement('div');
            label.className = 'key-label';
            label.textContent = note;
            key.appendChild(label);
            
            piano.appendChild(key);
        });
    }

    update(pianoId, currentNotes, lockedInNotes = new Set()) {
        // Always query fresh keys to avoid cache issues with dynamic updates
        const keys = document.querySelectorAll(`#${pianoId} .key`);
        
        keys.forEach(key => {
            const note = key.dataset.note;
            
            // Remove all previous classes
            key.classList.remove('active', 'locked-in');
            
            // Get all enharmonic equivalents for this piano key
            const enharmonicEquivalents = Constants.getEnharmonicEquivalents(note);
            
            // Check if this note is currently being played (check all enharmonic equivalents)
            let isCurrentlyPressed = false;
            for (const equiv of enharmonicEquivalents) {
                if (currentNotes.has(equiv)) {
                    isCurrentlyPressed = true;
                    break;
                }
            }
            
            // Check if this note is locked-in (check all enharmonic equivalents)
            let isLockedIn = false;
            for (const equiv of enharmonicEquivalents) {
                if (lockedInNotes.has(equiv)) {
                    isLockedIn = true;
                    break;
                }
            }
            
            // Debug logging for help popup
            if (pianoId === 'helpPianoKeys' && (isLockedIn || lockedInNotes.size > 0)) {
                console.log(`Piano key ${note} (equivalents: ${Array.from(enharmonicEquivalents)}) - locked-in: ${isLockedIn}, lockedInNotes contains: ${Array.from(lockedInNotes)}`);
            }
            
            if (isLockedIn) {
                key.classList.add('locked-in');
            } else if (isCurrentlyPressed) {
                key.classList.add('active');
            }
        });
    }
}