// Constants Module - Centralized configuration and mappings
export class Constants {
    static NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    static NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    static ENHARMONIC_MAP = {
        'C': ['C'],
        'C#': ['C#', 'C♯', 'Db', 'D♭'],
        'C♯': ['C#', 'C♯', 'Db', 'D♭'],
        'Db': ['Db', 'D♭', 'C#', 'C♯'],
        'D♭': ['Db', 'D♭', 'C#', 'C♯'],
        'D': ['D'],
        'D#': ['D#', 'D♯', 'Eb', 'E♭'],
        'D♯': ['D#', 'D♯', 'Eb', 'E♭'],
        'Eb': ['Eb', 'E♭', 'D#', 'D♯'],
        'E♭': ['Eb', 'E♭', 'D#', 'D♯'],
        'E': ['E'],
        'F': ['F'],
        'F#': ['F#', 'F♯', 'Gb', 'G♭'],
        'F♯': ['F#', 'F♯', 'Gb', 'G♭'],
        'Gb': ['Gb', 'G♭', 'F#', 'F♯'],
        'G♭': ['Gb', 'G♭', 'F#', 'F♯'],
        'G': ['G'],
        'G#': ['G#', 'G♯', 'Ab', 'A♭'],
        'G♯': ['G#', 'G♯', 'Ab', 'A♭'],
        'Ab': ['Ab', 'A♭', 'G#', 'G♯'],
        'A♭': ['Ab', 'A♭', 'G#', 'G♯'],
        'A': ['A'],
        'A#': ['A#', 'A♯', 'Bb', 'B♭'],
        'A♯': ['A#', 'A♯', 'Bb', 'B♭'],
        'Bb': ['Bb', 'B♭', 'A#', 'A♯'],
        'B♭': ['Bb', 'B♭', 'A#', 'A♯'],
        'B': ['B']
    };

    static WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    static BLACK_KEY_POSITIONS = {
        'C#': 1.0,  // Between C and D keys
        'D#': 2.0,  // Between D and E keys
        'F#': 4.0,  // Between F and G keys
        'G#': 5.0,  // Between G and A keys
        'A#': 6.0   // Between A and B keys
    };

    static getEnharmonicEquivalents(note) {
        const equivalents = Constants.ENHARMONIC_MAP[note];
        return equivalents ? new Set(equivalents) : new Set([note]);
    }
}