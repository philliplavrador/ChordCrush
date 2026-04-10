// UI Controller Module
export class UIController {
    constructor() {
        this.currentScreen = 'menuScreen';
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    updateGameDisplay(chord, chordIndex, totalChords, gameMode = 'timeTrials') {
        // Pick a random alias to display
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

    showFeedback(message, isCorrect) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    }

    updateTimer(totalTime) {
        const mins = Math.floor(totalTime / 60);
        const secs = (totalTime % 60).toFixed(2);
        document.getElementById('timer').textContent = `${mins}:${secs.padStart(5, '0')}`;
    }

    updateSelectionInfo(selectedSetsCount, totalChords) {
        const info = document.getElementById('selectionInfo');
        info.textContent = `Selected ${selectedSetsCount} sets (${totalChords} total chords)`;
    }

    setStartButtonEnabled(enabled) {
        const startButton = document.getElementById('startGame');
        startButton.disabled = !enabled;
    }

    showTestFeedback() {
        const status = document.getElementById('midiTestStatus');
        status.style.display = 'inline-block';
        status.className = 'midi-status connected';
        status.textContent = 'MIDI Working!';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    }

    updateMidiDevices(devices) {
        const select = document.getElementById('midiSelect');
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select MIDI Device</option>';
        
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.name;
            select.appendChild(option);
        });
        
        if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
            select.value = currentValue;
        }
    }

    showEndScreen(finalTime) {
        document.getElementById('finalTime').textContent = finalTime;
        this.showScreen('endScreen');
    }

    populateChordSets(chordSets, onChangeCallback) {
        const container = document.getElementById('chordSetsContainer');
        container.innerHTML = '';
        
        if (!chordSets || Object.keys(chordSets).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No chord sets available</p>';
            return;
        }
        
        for (const [key, set] of Object.entries(chordSets)) {
            const item = document.createElement('div');
            item.className = 'chord-set-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `set-${key}`;
            checkbox.value = key;
            checkbox.addEventListener('change', onChangeCallback);
            
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

    getSelectedChordSets() {
        const checkboxes = document.querySelectorAll('.chord-set-item input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    showError(message) {
        const errorDiv = document.getElementById('loadError');
        errorDiv.style.display = 'block';
        errorDiv.textContent = message;
    }

    hideError() {
        document.getElementById('loadError').style.display = 'none';
    }
}