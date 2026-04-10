// Data Manager Module
import { ErrorHandler } from './error-handler.js';

export class DataManager {
    constructor() {
        this.chordData = null;
    }

    // Transform the original chords.json format to our expected format
    transformChordData(originalData) {
        const chordSets = {};
        
        // Handle all top-level categories (Triads, etc.)
        for (const [categoryKey, category] of Object.entries(originalData)) {
            // Handle subcategories (Major Triads, Minor Triads, etc.)
            for (const [subCategoryKey, subCategory] of Object.entries(category)) {
                const setKey = subCategoryKey.toLowerCase().replace(/\s+/g, '');
                const chords = [];
                
                // Handle individual chords
                for (const [chordName, chordData] of Object.entries(subCategory)) {
                    chords.push({
                        aliases: [chordName, ...chordData.aliases],
                        notes: chordData.notes
                    });
                }
                
                chordSets[setKey] = {
                    name: subCategoryKey,
                    chords: chords
                };
            }
        }
        
        return { chordSets };
    }

    async loadChordData() {
        return ErrorHandler.handleAsyncOperation(
            async () => {
                console.log('Loading chord data from data/chords.json...');
                const response = await fetch('/data/chords.json');
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Could not load chords.json`);
                }
                const originalData = await response.json();
                this.chordData = this.transformChordData(originalData);
                console.log('Successfully loaded chord data from chords.json');
                return this.chordData;
            },
            { chordSets: {} }, // fallback empty structure
            'Failed to load chord data'
        );
    }

    getChordData() {
        return this.chordData;
    }

    getAvailableChords(selectedSets) {
        if (!this.chordData || !this.chordData.chordSets) {
            return [];
        }

        const availableChords = [];
        selectedSets.forEach(setKey => {
            const set = this.chordData.chordSets[setKey];
            if (set) {
                availableChords.push(...set.chords);
            }
        });

        return availableChords;
    }
}