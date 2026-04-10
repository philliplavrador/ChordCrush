// Import modules (Note: This will work only if served from a server due to ES6 module restrictions)
// For now, keeping the non-modular version as fallback

// Game State
const gameState = {
    selectedSets: [],
    currentChord: 0,
    startTime: null,
    endTime: null, // Store when the game actually ended
    finalTime: null, // Store the final calculated time
    penalties: 0,
    currentNotes: new Set(),
    isTestingMidi: false,
    isGameActive: false, // Track if the game is actively running (not in countdown)
    availableChords: [],
    lastChordCheckTime: 0, // For debouncing chord checks
    lastCorrectChord: null, // Track last correctly played chord to prevent duplicates
    processingCorrectChord: false, // Prevent multiple correct chord processing
    hadNotesPressed: false, // Track if any notes were pressed since last check
    lastPenaltyTime: 0, // Prevent multiple penalties for same incomplete attempt
    notesPressed: new Set(), // Track all notes that were pressed during this attempt
    maxNotesPressed: new Set(), // Track the maximum set of notes pressed simultaneously
    chordData: null // Store loaded chord data
};

// Session state
let sessionChords = [];

// Controllers
let midiController;
let gameEngine;
let uiController;
let pianoDisplay;
let leaderboardManager;
let dataManager;
let constants;

// DIAGNOSTIC FUNCTIONS
window.forceAttach = function() {
    if (midiController) {
        const select = document.getElementById('midiSelect');
        const deviceId = select.value;
        midiController.forceAttach(deviceId);
    }
};

window.debugGame = function() {
    console.log('=== Game Debug Info ===');
    console.log('Game State:', gameState);
    console.log('Game Engine loaded:', !!gameEngine);
    console.log('Session Chords:', sessionChords);
    console.log('Current target chord:', sessionChords[gameState.currentChord]);
    console.log('UI Controller loaded:', !!uiController);
    console.log('Current screen:', uiController?.currentScreen);
    console.log('MIDI Controller loaded:', !!midiController);
    console.log('MIDI connected:', midiController?.isConnected());
    return 'Debug info logged to console';
};

// Initialize all modules
async function initializeApp() {
    // Try to load modules dynamically, fall back to integrated version if modules fail
    try {
        const modules = await Promise.all([
            import('../shared/constants.js'),
            import('./midi.js'),
            import('./game.js'),
            import('./ui.js'),
            import('../shared/piano.js'),
            import('./leaderboard.js'),
            import('../shared/data.js')
        ]);
        
        // Initialize controllers with modules
        constants = modules[0].Constants;
        midiController = new modules[1].MidiController();
        gameEngine = new modules[2].GameEngine();
        uiController = new modules[3].UIController();
        pianoDisplay = new modules[4].PianoDisplay();
        leaderboardManager = new modules[5].LeaderboardManager();
        dataManager = new modules[6].DataManager();
        
        console.log('Modular version loaded successfully');
        return true;
    } catch (error) {
        console.warn('Failed to load modules, falling back to integrated version:', error);
        return false;
    }
}

// Fallback functions (original implementation) 
// MIDI Note Mapping (fallback)
const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const noteNamesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function midiToNoteName(midiNote) {
    const noteIndex = midiNote % 12;
    return noteNames[noteIndex];
}

async function loadChordData() {
    if (dataManager) {
        const chordData = await dataManager.loadChordData();
        uiController.populateChordSets(chordData.chordSets, updateSelectedSets);
    } else {
        // Fallback implementation - transform chords.json data
        const response = await fetch('/data/chords.json');
        if (!response.ok) {
            throw new Error('Could not load chords.json');
        }
        const originalData = await response.json();
        
        // Transform the data to expected format
        const chordSets = {};
        for (const [categoryKey, category] of Object.entries(originalData)) {
            for (const [subCategoryKey, subCategory] of Object.entries(category)) {
                const setKey = subCategoryKey.toLowerCase().replace(/\s+/g, '');
                const chords = [];
                
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
        
        gameState.chordData = { chordSets };
        populateChordSets();
    }
}


function populateChordSets() {
    const container = document.getElementById('chordSetsContainer');
    container.innerHTML = '';
    
    if (!gameState.chordData || !gameState.chordData.chordSets) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No chord sets available</p>';
        return;
    }
    
    for (const [key, set] of Object.entries(gameState.chordData.chordSets)) {
        const item = document.createElement('div');
        item.className = 'chord-set-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `set-${key}`;
        checkbox.value = key;
        checkbox.addEventListener('change', updateSelectedSets);
        
        const label = document.createElement('label');
        label.htmlFor = `set-${key}`;
        label.innerHTML = `
            <span>${set.name}</span>
            <span class="chord-count">${set.chords.length} chords</span>
        `;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        container.appendChild(item);
    }
}

function updateSelectedSets() {
    if (uiController && dataManager) {
        gameState.selectedSets = uiController.getSelectedChordSets();
        gameState.availableChords = dataManager.getAvailableChords(gameState.selectedSets);
        
        uiController.updateSelectionInfo(gameState.selectedSets.length, gameState.availableChords.length);
        uiController.setStartButtonEnabled(gameState.availableChords.length > 0);
    } else {
        // Fallback implementation
        gameState.selectedSets = [];
        gameState.availableChords = [];
        
        const checkboxes = document.querySelectorAll('.chord-set-item input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            const setKey = checkbox.value;
            gameState.selectedSets.push(setKey);
            
            const set = gameState.chordData.chordSets[setKey];
            gameState.availableChords.push(...set.chords);
        });
        
        const info = document.getElementById('selectionInfo');
        const totalChords = gameState.availableChords.length;
        info.textContent = `Selected ${gameState.selectedSets.length} sets (${totalChords} total chords)`;
        
        const startButton = document.getElementById('startGame');
        startButton.disabled = totalChords === 0;
    }
}

async function initMidi() {
    if (midiController) {
        const success = await midiController.init();
        if (success) {
            midiController.onMidiMessage = handleMidiMessage;
            midiController.onDeviceUpdate = (devices) => {
                uiController.updateMidiDevices(devices);
            };
            
            // Update devices initially
            const devices = midiController.getAvailableDevices();
            uiController.updateMidiDevices(devices);
            
            // Try to reconnect to last device
            const lastDevice = localStorage.getItem('lastMidiDevice');
            if (lastDevice) {
                const select = document.getElementById('midiSelect');
                select.value = lastDevice;
                midiController.selectInput(lastDevice);
            }
        } else {
            uiController.updateMidiDevices([]);
        }
    } else {
        // Fallback MIDI initialization
        console.log('Using fallback MIDI initialization');
        // ... original MIDI code would go here
    }
}

function handleMidiMessage(type, noteName, midiNote, velocity) {
    console.log('MIDI:', type, noteName, 'Current notes:', Array.from(gameState.currentNotes));
    
    if (type === 'noteOn') {
        gameState.currentNotes.add(noteName);
        updatePianoDisplay();
        
        if (gameState.isTestingMidi) {
            uiController.showTestFeedback();
        }
        // For game screen - only update display, no chord checking on note press
        else if (uiController.currentScreen === 'gameScreen') {
            // Don't process input if game isn't active (during countdown)
            if (!gameState.isGameActive) {
                console.log('Ignoring input during countdown');
                return;
            }
            
            gameState.hadNotesPressed = true; // Mark that notes were pressed
            gameState.notesPressed.add(noteName); // Track all notes pressed
            
            // Update max simultaneous notes if current set is larger
            if (gameState.currentNotes.size > gameState.maxNotesPressed.size) {
                gameState.maxNotesPressed = new Set(gameState.currentNotes);
            }
            
            // For training mode, update locked-in notes for visual feedback only
            if (gameState.gameMode === 'trainingMode') {
                updateLockedInNotesOnly();
            }
            // No chord checking on note press - wait for release
        }
    } else if (type === 'noteOff') {
        gameState.currentNotes.delete(noteName);
        updatePianoDisplay();
        
        // Only check chord when ALL notes are released
        if (uiController.currentScreen === 'gameScreen' && gameState.isGameActive) {
            // Small delay to handle simultaneous releases
            setTimeout(() => {
                if (gameState.currentNotes.size === 0 && gameState.hadNotesPressed) {
                    // All notes released - evaluate the chord that was played
                    checkChordOnRelease();
                }
            }, 100);
        }
    }
}

function createPiano(containerId) {
    if (pianoDisplay) {
        pianoDisplay.create(containerId);
    } else {
        // Fallback piano creation
        const piano = document.getElementById(containerId);
        piano.innerHTML = '';
        
        const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        // Black key positions as percentages of container width
        // White keys are centered in container (justify-content: center)
        // 7 white keys × (100/14)% each = 50% total width, centered = 25% offset from left
        const whiteKeyWidth = 100 / 14; // ~7.143% per white key
        const blackKeyWidth = 100 / 24; // ~4.167% per black key (from CSS)
        const whiteKeysOffset = 25; // White keys start at 25% from left due to centering
        
        // Position black keys so their center is at the boundary between white keys
        // Subtract half the black key width to center them on the boundary
        const blackKeyPositions = {
            'C#': (whiteKeysOffset + whiteKeyWidth * 1.0 - blackKeyWidth / 2) + '%',     // Between C and D keys
            'Eb': (whiteKeysOffset + whiteKeyWidth * 2.0 - blackKeyWidth / 2) + '%',     // Between D and E keys  
            'F#': (whiteKeysOffset + whiteKeyWidth * 4.0 - blackKeyWidth / 2) + '%',     // Between F and G keys
            'Ab': (whiteKeysOffset + whiteKeyWidth * 5.0 - blackKeyWidth / 2) + '%',     // Between G and A keys
            'Bb': (whiteKeysOffset + whiteKeyWidth * 6.0 - blackKeyWidth / 2) + '%'      // Between A and B keys
        };
        
        whiteKeys.forEach((note, index) => {
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
}

function updatePianoDisplay() {
    const pianoId = gameState.isTestingMidi ? 'testPianoKeys' : 'gamePianoKeys';
    const lockedInNotes = gameEngine && gameEngine.isTrainingMode() ? gameEngine.getLockedInNotes() : new Set();
    
    if (pianoDisplay) {
        pianoDisplay.update(pianoId, gameState.currentNotes, lockedInNotes);
    } else {
        // Fallback update
        const keys = document.querySelectorAll(`#${pianoId} .key`);
        
        keys.forEach(key => {
            const note = key.dataset.note;
            const altNote = noteNames.indexOf(note) !== -1 ? noteNamesFlat[noteNames.indexOf(note)] : 
                            noteNamesFlat.indexOf(note) !== -1 ? noteNames[noteNamesFlat.indexOf(note)] : null;
            
            // Remove all previous classes
            key.classList.remove('active', 'locked-in');
            
            // Check if this note is currently being played
            const isCurrentlyPressed = gameState.currentNotes.has(note) || (altNote && gameState.currentNotes.has(altNote));
            
            // Check if this note is locked-in (for training mode)
            const isLockedIn = lockedInNotes.has(note) || (altNote && lockedInNotes.has(altNote));
            
            if (isLockedIn) {
                key.classList.add('locked-in');
            } else if (isCurrentlyPressed) {
                key.classList.add('active');
            }
        });
    }
}

function generateSessionChords() {
    if (gameEngine) {
        gameEngine.generateSessionChords(gameState.availableChords);
        sessionChords = gameEngine.getSessionChords();
    } else {
        // Fallback generation
        const pool = [...gameState.availableChords];
        const cMajorIndex = pool.findIndex(chord => 
            chord.aliases.some(alias => alias === 'C Major' || alias === 'C')
        );
        
        sessionChords = [];
        
        if (cMajorIndex !== -1) {
            sessionChords.push(pool[cMajorIndex]);
            pool.splice(cMajorIndex, 1); // Remove C Major from pool to avoid duplicates
        }
        
        // Add all remaining chords in random order
        while (pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            sessionChords.push(pool[randomIndex]);
            pool.splice(randomIndex, 1); // Remove the selected chord to avoid duplicates
        }
    }
}

async function showCountdown() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('countdownOverlay');
        const numberElement = document.getElementById('countdownNumber');
        
        let count = 3;
        overlay.style.display = 'flex';
        
        const showNumber = () => {
            if (count > 0) {
                numberElement.textContent = count;
                numberElement.className = 'countdown-number';
                count--;
                setTimeout(showNumber, 1000);
            } else {
                // Show "GO!"
                numberElement.textContent = 'GO!';
                numberElement.className = 'countdown-number countdown-go';
                
                // Fade out after showing "GO!"
                setTimeout(() => {
                    overlay.classList.add('countdown-fade-out');
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        overlay.classList.remove('countdown-fade-out');
                        resolve();
                    }, 500);
                }, 800);
            }
        };
        
        showNumber();
    });
}

function getSelectedGameMode() {
    const modeRadios = document.querySelectorAll('input[name="gameMode"]');
    for (const radio of modeRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'timeTrials'; // default
}

// Fallback screen switching function
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

async function startGame() {
    if (midiController && !midiController.isConnected()) {
        alert('Please select a MIDI device first!');
        return;
    }
    
    if (gameState.availableChords.length === 0) {
        alert('Please select at least one chord set!');
        return;
    }
    
    // Set game mode
    const gameMode = getSelectedGameMode();
    if (gameEngine) {
        gameEngine.setGameMode(gameMode);
    }
    
    generateSessionChords();
    gameState.currentChord = 0;
    gameState.penalties = 0;
    gameState.currentNotes.clear();
    gameState.gameMode = gameMode;
    resetChordTracking(); // Reset all chord tracking
    
    // Show game screen (use uiController if available, otherwise use fallback)
    if (uiController) {
        uiController.showScreen('gameScreen');
    } else {
        showScreen('gameScreen');
    }

    // Update display based on game mode
    if (gameMode === 'trainingMode') {
        // Clear any previous locked-in notes when starting training mode
        if (gameEngine) {
            gameEngine.clearLockedInNotes();
        }
        const currentChord = gameEngine ? gameEngine.getCurrentChord() : sessionChords[0];
        const currentIndex = gameEngine ? gameEngine.getCurrentChordIndex() : 0;
        const totalChords = gameEngine ? gameEngine.getTotalChords() : sessionChords.length;
        updateGameDisplay(currentChord, currentIndex, totalChords, gameState.gameMode);
        // Update piano to show cleared state
        updatePianoDisplay();
    } else {
        updateGameDisplay(sessionChords[gameState.currentChord], gameState.currentChord, sessionChords.length, gameState.gameMode);
    }
    
    // Show countdown before starting the timer (only for time trials)
    if (gameMode === 'timeTrials') {
        gameState.isGameActive = false; // Disable input during countdown
        // Hide timer widget during countdown
        const timer = document.getElementById('timer');
        if (timer) {
            timer.style.display = 'none';
        }
        await showCountdown();
        // Show and start timer after countdown
        if (timer) {
            timer.style.display = 'block';
        }
        gameState.startTime = Date.now();
        gameState.isGameActive = true; // Enable input after countdown
        updateTimer();
    } else {
        // Training mode - no timer, no countdown, activate immediately
        gameState.isGameActive = true;
    }
}

// Function to update locked-in notes without doing full chord check (for training mode)
function updateLockedInNotesOnly() {
    if (gameState.gameMode !== 'trainingMode' || !gameEngine) return;
    
    const targetChord = gameEngine.getCurrentChord();
    if (!targetChord) return;
    
    // Just update the locked-in notes, don't check if chord is complete
    const result = gameEngine.checkChord(targetChord, gameState.currentNotes);
    updatePianoDisplay();
}

// Immediate chord checking
function checkChordImmediate() {
    checkChord();
}

// Check chord when all notes are released
function checkChordOnRelease() {
    console.log('checkChordOnRelease called');
    console.log('Max notes pressed:', Array.from(gameState.maxNotesPressed));
    console.log('All notes pressed:', Array.from(gameState.notesPressed));
    
    // Prevent multiple evaluations within a short time frame
    const now = Date.now();
    if (now - gameState.lastPenaltyTime < 500) {
        return;
    }
    
    // Use the maximum set of notes that were pressed simultaneously
    const notesToEvaluate = gameState.maxNotesPressed;
    
    // Get current target chord
    let targetChord;
    if (gameState.gameMode === 'trainingMode' && gameEngine) {
        targetChord = gameEngine.getCurrentChord();
        if (!targetChord) {
            endTrainingMode();
            return;
        }
    } else {
        targetChord = sessionChords[gameState.currentChord];
    }
    
    if (!targetChord) {
        console.log('No target chord found');
        return;
    }
    
    console.log('Target chord:', targetChord);
    
    // Check the chord using the notes that were pressed
    if (gameEngine) {
        // Temporarily set currentNotes to the max notes pressed for evaluation
        const originalCurrentNotes = new Set(gameState.currentNotes);
        gameState.currentNotes = new Set(notesToEvaluate);
        
        const result = gameEngine.checkChord(targetChord, gameState.currentNotes);
        
        // Restore original currentNotes (which should be empty at this point)
        gameState.currentNotes = originalCurrentNotes;
        
        console.log('Chord evaluation result:', result);
        
        if (gameState.gameMode === 'trainingMode') {
            handleTrainingModeResult(result.isCorrect);
        } else {
            // Time Trials mode
            if (result.isCorrect) {
                // Prevent processing the same correct chord multiple times
                const currentChordKey = gameState.currentChord + ':' + Array.from(notesToEvaluate).sort().join(',');
                if (gameState.lastCorrectChord === currentChordKey || gameState.processingCorrectChord) {
                    console.log('Same correct chord already processed, skipping');
                    return;
                }
                
                console.log('Chord is correct!');
                gameState.lastCorrectChord = currentChordKey;
                gameState.processingCorrectChord = true;
                
                uiController.showFeedback('Correct!', true);
                setTimeout(() => {
                    nextChord();
                    gameState.processingCorrectChord = false;
                    gameState.lastCorrectChord = null;
                }, 500);
            } else {
                // Any incorrect attempt gets penalty (wrong notes or incomplete)
                console.log('Chord is incorrect - applying penalty');
                gameState.penalties += 5;
                gameState.lastPenaltyTime = now;
                
                if (notesToEvaluate.size === 0) {
                    uiController.showFeedback('No notes played, +5s penalty', false);
                } else if (notesToEvaluate.size < targetChord.notes.length) {
                    uiController.showFeedback('Incomplete chord, +5s penalty', false);
                } else {
                    uiController.showFeedback('Incorrect chord, +5s penalty', false);
                }
            }
        }
    }
    
    // Reset tracking for next attempt
    resetChordTracking();
}

// Reset chord attempt tracking
function resetChordTracking() {
    gameState.hadNotesPressed = false;
    gameState.notesPressed.clear();
    gameState.maxNotesPressed.clear();
}

// Debounced chord checking to prevent multiple rapid checks (fallback)
function checkChordWithDebounce() {
    const now = Date.now();
    const debounceTime = 100; // 100ms debounce
    
    if (now - gameState.lastChordCheckTime < debounceTime) {
        return; // Too soon, ignore this check
    }
    
    gameState.lastChordCheckTime = now;
    
    // Small delay to allow for multiple rapid releases
    setTimeout(() => {
        checkChord();
    }, 50);
}

function checkChord() {
    console.log('checkChord called - gameMode:', gameState.gameMode, 'currentNotes:', Array.from(gameState.currentNotes));
    let targetChord;
    
    if (gameState.gameMode === 'trainingMode' && gameEngine) {
        targetChord = gameEngine.getCurrentChord();
        if (!targetChord) {
            // Training mode complete
            endTrainingMode();
            return;
        }
    } else {
        targetChord = sessionChords[gameState.currentChord];
        console.log('Time trials - target chord:', targetChord);
    }
    
    if (gameEngine) {
        const result = gameEngine.checkChord(targetChord, gameState.currentNotes);
        
        // Update piano display to reflect any locked-in notes (for training mode)
        if (gameState.gameMode === 'trainingMode') {
            updatePianoDisplay();
        }
        
        if (gameState.gameMode === 'trainingMode') {
            handleTrainingModeResult(result.isCorrect);
        } else {
            // Time Trials mode (original logic)
            console.log('Time trials mode - checking result:', result);
            if (result.isCorrect) {
                // Prevent processing the same correct chord multiple times
                const currentChordKey = gameState.currentChord + ':' + Array.from(gameState.currentNotes).sort().join(',');
                if (gameState.lastCorrectChord === currentChordKey || gameState.processingCorrectChord) {
                    console.log('Same correct chord already processed, skipping');
                    return;
                }
                
                console.log('Chord is correct!');
                gameState.lastCorrectChord = currentChordKey;
                gameState.processingCorrectChord = true;
                gameState.hadNotesPressed = false; // Reset flag on correct chord
                
                uiController.showFeedback('Correct!', true);
                setTimeout(() => {
                    nextChord();
                    gameState.processingCorrectChord = false;
                    gameState.lastCorrectChord = null;
                }, 500);
            } else if (result.shouldApplyPenalty) {
                console.log('Chord is incorrect with penalty');
                gameState.penalties += 5;
                uiController.showFeedback('Incorrect, +5s penalty', false);
            } else {
                console.log('Chord is incorrect but no penalty (not enough notes)');
            }
        }
    }
}

function handleTrainingModeResult(isCorrect) {
    if (!gameEngine) return;
    
    const result = gameEngine.handleTrainingModeResult(isCorrect);
    
    if (result.action === 'complete') {
        // Chord completed successfully
        uiController.showFeedback('Correct!', true);
        setTimeout(() => {
            if (result.nextChord) {
                updateTrainingModeDisplay();
            } else {
                endTrainingMode();
            }
        }, 500);
    } else if (result.action === 'retry') {
        // Chord completed after help - move to next
        uiController.showFeedback('Good! Try more without help', true);
        hideTrainingHelp();
        setTimeout(() => {
            updateTrainingModeDisplay();
        }, 1000);
    } else if (result.action === 'showHelp') {
        // Show help popup
        showTrainingHelp(result.chord);
    }
}

function updateTrainingModeDisplay() {
    if (!gameEngine || !uiController) return;
    
    // Clear any previous locked-in notes and current notes when displaying new chord
    gameEngine.clearLockedInNotes();
    gameState.currentNotes.clear();
    resetChordTracking(); // Reset all chord attempt tracking
    
    const currentChord = gameEngine.getCurrentChord();
    const currentIndex = gameEngine.getCurrentChordIndex();
    const totalChords = gameEngine.getTotalChords();
    
    if (currentChord) {
        updateGameDisplay(currentChord, currentIndex, totalChords, gameState.gameMode);
        // Update piano display to reflect cleared state
        updatePianoDisplay();
    }
}

function endTrainingMode() {
    if (uiController) {
        uiController.showFeedback('Training Complete!', true);
        setTimeout(() => {
            uiController.showScreen('menuScreen');
        }, 2000);
    } else {
        // Fallback
        const feedback = document.getElementById('feedback');
        feedback.textContent = 'Training Complete!';
        feedback.className = 'feedback correct';
        setTimeout(() => {
            showScreen('menuScreen');
        }, 2000);
    }
}

function showTrainingHelp(chord) {
    const popup = document.getElementById('trainingHelpPopup');
    const chordNameSpan = document.getElementById('helpChordName');
    const notesList = document.getElementById('helpNotesList');
    
    // Set chord name
    const displayName = chord.aliases[0];
    chordNameSpan.textContent = displayName;
    
    // Show notes as badges
    notesList.innerHTML = '';
    chord.notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'help-note';
        noteElement.textContent = note;
        notesList.appendChild(noteElement);
    });
    
    // Create piano for help popup
    if (pianoDisplay) {
        // Use the piano display module
        pianoDisplay.create('helpPianoKeys');
        
        // Create a set of the correct notes for highlighting as "locked-in" (target notes)
        const correctNotes = new Set(chord.notes);
        const emptyCurrentNotes = new Set(); // No currently pressed notes in help popup
        
        console.log('Training popup - chord notes:', chord.notes);
        console.log('Training popup - correctNotes set:', Array.from(correctNotes));
        
        // Update the piano to highlight the correct notes as locked-in
        pianoDisplay.update('helpPianoKeys', emptyCurrentNotes, correctNotes);
    } else {
        // Fallback to manual piano creation and highlighting
        const helpPiano = document.getElementById('helpPianoKeys');
        
        if (!helpPiano.hasChildNodes()) {
            createPiano('helpPianoKeys');
        }
        
        // Use fallback note arrays for compatibility
        const fallbackNoteNames = constants?.NOTE_NAMES || noteNames;
        const fallbackNoteNamesFlat = constants?.NOTE_NAMES_FLAT || noteNamesFlat;
        
        // Highlight correct notes on help piano
        const keys = document.querySelectorAll('#helpPianoKeys .key');
        keys.forEach(key => {
            const note = key.dataset.note;
            const altNote = fallbackNoteNames.indexOf(note) !== -1 ? 
                           fallbackNoteNamesFlat[fallbackNoteNames.indexOf(note)] : 
                           fallbackNoteNamesFlat.indexOf(note) !== -1 ? 
                           fallbackNoteNames[fallbackNoteNamesFlat.indexOf(note)] : null;
            
            if (chord.notes.includes(note) || (altNote && chord.notes.includes(altNote))) {
                key.classList.add('locked-in');
            } else {
                key.classList.remove('active', 'locked-in');
            }
        });
    }
    
    // Show popup
    popup.style.display = 'flex';
}

function hideTrainingHelp() {
    const popup = document.getElementById('trainingHelpPopup');
    if (popup) {
        popup.style.display = 'none';
    }
    
    if (gameEngine) {
        gameEngine.hideHelp();
    }
}

function nextChord() {
    gameState.currentChord++;
    gameState.currentNotes.clear();
    resetChordTracking(); // Reset all tracking for next chord
    updatePianoDisplay();
    
    if (gameState.currentChord >= sessionChords.length) {
        endGame();
    } else {
        updateGameDisplay(sessionChords[gameState.currentChord], gameState.currentChord, sessionChords.length, gameState.gameMode);
    }
}

function updateTimer() {
    if (uiController && uiController.currentScreen === 'gameScreen' && gameState.gameMode === 'timeTrials' && gameState.isGameActive) {
        const elapsed = (Date.now() - gameState.startTime) / 1000;
        const totalTime = elapsed + gameState.penalties;
        uiController.updateTimer(totalTime);
        requestAnimationFrame(updateTimer);
    }
}

// Fallback function to hide timer in training mode
function updateGameDisplay(chord, chordIndex, totalChords, gameMode = 'timeTrials') {
    if (uiController) {
        uiController.updateGameDisplay(chord, chordIndex, totalChords, gameMode);
        return;
    }
    
    // Fallback implementation
    const displayName = chord.aliases[Math.floor(Math.random() * chord.aliases.length)];
    document.getElementById('chordName').textContent = displayName;
    document.getElementById('progress').textContent = `Chord ${chordIndex + 1} of ${totalChords}`;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    
    // Hide/show timer based on game mode
    const timer = document.getElementById('timer');
    if (timer) {
        timer.style.display = gameMode === 'trainingMode' ? 'none' : 'block';
    }
    
    // Show/hide training tip based on game mode
    const trainingTip = document.getElementById('trainingTip');
    if (trainingTip) {
        trainingTip.style.display = gameMode === 'trainingMode' ? 'block' : 'none';
    }
}

function endGame() {
    gameState.isGameActive = false; // Disable input when game ends
    gameState.endTime = Date.now(); // Store when the game ended
    const elapsed = (gameState.endTime - gameState.startTime) / 1000;
    const totalTime = elapsed + gameState.penalties;
    gameState.finalTime = totalTime; // Store the final calculated time
    
    const formattedTime = gameEngine ? gameEngine.formatTime(totalTime) : formatTime(totalTime);
    if (uiController) {
        uiController.showEndScreen(formattedTime);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
}

async function saveScore() {
    const name = document.getElementById('playerName').value;
    
    if (leaderboardManager) {
        try {
            // Use the stored final time from when the game actually ended
            const totalTime = gameState.finalTime;
            const chordSetsData = dataManager ? dataManager.getChordData().chordSets : gameState.chordData.chordSets;
            
            const leaderboardKey = await leaderboardManager.saveScore(
                name, totalTime, gameState.selectedSets, chordSetsData
            );
            
            showLeaderboard(leaderboardKey);
        } catch (error) {
            alert(error.message);
        }
    } else {
        alert('Leaderboard manager not available');
    }
}

function showLeaderboard(key) {
    if (leaderboardManager && uiController) {
        const formatTimeCallback = gameEngine ? gameEngine.formatTime : formatTime;
        uiController.showScreen('leaderboardScreen');
        
        // Set format time callback and chord sets data for leaderboard manager
        leaderboardManager.setFormatTimeCallback(formatTimeCallback);
        const chordSetsData = dataManager ? dataManager.getChordData().chordSets : gameState.chordData.chordSets;
        leaderboardManager.setChordSetsData(chordSetsData);
        
        // Populate leaderboard selector with chord sets (same as main menu)
        leaderboardManager.populateLeaderboardSelector(chordSetsData);
        
        if (key) {
            // Show specific leaderboard (when coming from end game)
            leaderboardManager.show(key, gameState.selectedSets, formatTimeCallback);
            // Also check the boxes for the current game's selected sets
            gameState.selectedSets.forEach(setKey => {
                const checkbox = document.getElementById(`lb-${setKey}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            // Update the display to show the current game's leaderboard
            leaderboardManager.updateSelectedLeaderboards();
        } else {
            // Show leaderboard selector (when coming from main menu)
            document.getElementById('leaderboardFilter').textContent = 'Select chord sets to view leaderboard';
            document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="4" style="text-align: center;">Select chord sets above</td></tr>';
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the app (try modular, fall back to integrated)
    await initializeApp();
    
    // Load chord data
    await loadChordData();
    
    // Initialize leaderboard file system
    if (leaderboardManager) {
        await leaderboardManager.loadLeaderboards();
    }
    
    // Initialize pianos
    createPiano('testPianoKeys');
    createPiano('gamePianoKeys');
    
    // Initialize MIDI
    await initMidi();
    
    
    // MIDI controls
    document.getElementById('midiSelect').addEventListener('change', (e) => {
        if (midiController) {
            midiController.selectInput(e.target.value);
        }
    });
    
    document.getElementById('testMidi').addEventListener('click', () => {
        if (midiController && !midiController.isConnected()) {
            alert('Please select a MIDI device first!');
            return;
        }
        
        gameState.isTestingMidi = true;
        gameState.currentNotes.clear();
        
        const testPiano = document.getElementById('testPiano');
        testPiano.style.display = 'block';
        
        const status = document.getElementById('midiTestStatus');
        status.style.display = 'inline-block';
        status.className = 'midi-status testing';
        status.textContent = 'Play some notes...';
        
        setTimeout(() => {
            gameState.isTestingMidi = false;
            testPiano.style.display = 'none';
            status.style.display = 'none';
            gameState.currentNotes.clear();
            updatePianoDisplay();
        }, 5000);
    });
    
    // Game controls
    document.getElementById('startGame').addEventListener('click', startGame);
    document.getElementById('resetGame').addEventListener('click', startGame);
    document.getElementById('returnToMenu').addEventListener('click', () => {
        if (uiController) {
            uiController.showScreen('menuScreen');
        } else {
            showScreen('menuScreen');
        }
    });
    document.getElementById('saveScore').addEventListener('click', saveScore);
    document.getElementById('playAgain').addEventListener('click', () => {
        if (uiController) {
            uiController.showScreen('menuScreen');
        } else {
            showScreen('menuScreen');
        }
    });
    document.getElementById('viewLeaderboard').addEventListener('click', () => {
        // When viewed from menu, show all leaderboards selector
        showLeaderboard(null);
    });
    document.getElementById('backToMenu').addEventListener('click', () => {
        if (uiController) {
            uiController.showScreen('menuScreen');
        } else {
            showScreen('menuScreen');
        }
    });
    
    // Handle Enter key on name input
    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveScore();
        }
    });
    
    // Handle name input focus/blur for dropdown
    document.getElementById('playerName').addEventListener('focus', () => {
        if (leaderboardManager) {
            leaderboardManager.populateNameDropdown();
        }
    });
    
    document.getElementById('playerName').addEventListener('blur', (e) => {
        // Use setTimeout to allow click events on dropdown items to register first
        setTimeout(() => {
            if (leaderboardManager) {
                leaderboardManager.hideNameDropdown();
            }
        }, 200);
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const nameInput = document.getElementById('playerName');
        const dropdown = document.getElementById('nameDropdown');
        
        if (nameInput && dropdown && !nameInput.contains(e.target) && !dropdown.contains(e.target)) {
            if (leaderboardManager) {
                leaderboardManager.hideNameDropdown();
            }
        }
    });
});