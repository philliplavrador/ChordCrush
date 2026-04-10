// Leaderboard Module
import { ErrorHandler } from '../shared/error-handler.js';

export class LeaderboardManager {
    static MAX_ENTRIES = 10;
    static LEADERBOARDS_FILE = 'data/leaderboards.json';
    
    constructor() {
        this.maxEntries = LeaderboardManager.MAX_ENTRIES;
        this.leaderboardsData = this.createEmptyStructure();
        this.formatTime = null; // Will be set via setFormatTimeCallback
        this.chordSetsData = null; // Will be set via setChordSetsData
    }

    createEmptyStructure() {
        return {
            leaderboards: {},
            metadata: {
                created: new Date().toISOString().split('T')[0],
                version: '1.0',
                totalEntries: 0
            }
        };
    }

    async loadLeaderboards() {
        try {
            const response = await fetch('/data/leaderboards.json');
            if (response.ok) {
                this.leaderboardsData = await response.json();
                console.log('Loaded leaderboards from data/leaderboards.json:', this.leaderboardsData);
                console.log('Leaderboard keys found:', Object.keys(this.leaderboardsData.leaderboards));
                console.log('Total entries loaded:', this.leaderboardsData.metadata?.totalEntries || 0);
                return true;
            } else {
                console.log('Leaderboards file not found, using empty structure');
                return false;
            }
        } catch (error) {
            console.log('Could not load leaderboards, using empty structure:', error);
            return false;
        }
    }

    async saveLeaderboards() {
        const jsonData = JSON.stringify(this.leaderboardsData, null, 2);
        
        try {
            console.log('Attempting to save leaderboard data...');
            console.log('Data to save:', this.leaderboardsData);
            
            // Write directly to the leaderboards file using the server endpoint
            const response = await fetch('/api/save-leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonData
            });

            const responseText = await response.text();
            console.log('Server response:', response.status, responseText);

            if (response.ok) {
                console.log('Leaderboard saved successfully to data/leaderboards.json');
                return true;
            } else {
                console.error('Failed to save leaderboard:', response.status, responseText);
                return false;
            }
        } catch (error) {
            console.error('Network/fetch error saving leaderboard:', error);
            
            // Show an alert to help debug
            alert(`Failed to save leaderboard: ${error.message}. Make sure the server is running with "node server.js"`);
            return false;
        }
    }

    downloadLeaderboards() {
        const blob = new Blob([JSON.stringify(this.leaderboardsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.leaderboardsFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async saveScore(name, totalTime, selectedSets, chordSetsData) {
        if (name.length === 0 || name.length > 16) {
            throw new Error('Please enter a valid name');
        }

        // Create a unique key based on selected sets only (no mode)
        const setsKey = selectedSets.sort().join('-');
        const leaderboardKey = setsKey;
        
        // Get existing leaderboard or create new one
        if (!this.leaderboardsData.leaderboards[leaderboardKey]) {
            this.leaderboardsData.leaderboards[leaderboardKey] = [];
        }
        let leaderboard = [...this.leaderboardsData.leaderboards[leaderboardKey]];
        
        // Add new score
        const newScore = {
            id: Date.now(), // Unique identifier
            name: name.trim(),
            time: totalTime,
            date: new Date().toLocaleDateString(),
            timestamp: new Date().toISOString(),
            sets: selectedSets.map(key => chordSetsData[key].name).join(', '),
            selectedSets: [...selectedSets] // Store the actual keys for reference
        };
        
        leaderboard.push(newScore);
        console.log('After adding new score:', leaderboard);
        
        // Sort by time and keep top entries
        leaderboard.sort((a, b) => a.time - b.time);
        console.log('After sorting:', leaderboard);
        
        leaderboard.splice(this.maxEntries);
        console.log('After splice (maxEntries=' + this.maxEntries + '):', leaderboard);
        
        // Update file-based storage
        this.leaderboardsData.leaderboards[leaderboardKey] = leaderboard;
        console.log('Final leaderboardsData:', this.leaderboardsData);
        this.leaderboardsData.metadata.totalEntries = Object.values(this.leaderboardsData.leaderboards)
            .reduce((total, lb) => total + lb.length, 0);
        this.leaderboardsData.metadata.lastUpdated = new Date().toISOString();
        
        // Save to file
        await this.saveLeaderboards();
        
        return leaderboardKey;
    }

    show(key, selectedSets, formatTimeCallback) {
        const setsKey = key || selectedSets.sort().join('-');
        const leaderboard = this.leaderboardsData.leaderboards[setsKey] || [];
        
        console.log('Showing leaderboard for key:', setsKey);
        console.log('Available leaderboard keys:', Object.keys(this.leaderboardsData.leaderboards));
        console.log('Leaderboard data for this key:', leaderboard);
        
        // Display filter text and populate selector
        this.populateLeaderboardSelector();
        let filterText = '';
        if (leaderboard.length > 0 && leaderboard[0].sets) {
            filterText = leaderboard[0].sets;
        } else {
            filterText = 'No scores yet';
        }
        document.getElementById('leaderboardFilter').textContent = filterText;
        
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const row = tbody.insertRow();
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            
            row.innerHTML = `
                <td class="${rankClass}">#${index + 1}</td>
                <td>${entry.name}</td>
                <td>${formatTimeCallback(entry.time)}</td>
                <td>${entry.date}</td>
            `;
        });
        
        if (leaderboard.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No scores yet!</td></tr>';
        }
    }

    generateKey(selectedSets) {
        return selectedSets.sort().join('-');
    }

    getAllLeaderboards() {
        const leaderboards = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('leaderboard_')) {
                const setsKey = key.replace('leaderboard_', '');
                const data = JSON.parse(localStorage.getItem(key));
                if (data.length > 0) {
                    leaderboards.push({
                        key: setsKey,
                        name: data[0].sets || 'Unknown',
                        count: data.length
                    });
                }
            }
        }
        return leaderboards.sort((a, b) => a.name.localeCompare(b.name));
    }

    populateLeaderboardSelector(chordSetsData) {
        const container = document.getElementById('leaderboardsContainer');
        if (!container || !chordSetsData) return;
        
        container.innerHTML = '';
        
        for (const [key, set] of Object.entries(chordSetsData)) {
            const item = document.createElement('div');
            item.className = 'chord-set-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `lb-${key}`;
            checkbox.value = key;
            checkbox.addEventListener('change', () => this.updateSelectedLeaderboards());
            
            const label = document.createElement('label');
            label.htmlFor = `lb-${key}`;
            label.innerHTML = `
                <span>${set.name}</span>
                <span class="chord-count">${set.chords.length} chords</span>
            `;
            
            item.appendChild(checkbox);
            item.appendChild(label);
            container.appendChild(item);
        }
    }

    updateSelectedLeaderboards() {
        console.log('updateSelectedLeaderboards called');
        const checkboxes = document.querySelectorAll('#leaderboardsContainer input[type="checkbox"]:checked');
        const selectedSets = Array.from(checkboxes).map(cb => cb.value);
        console.log('Selected sets from checkboxes:', selectedSets);
        
        // Update selection info
        const info = document.getElementById('leaderboardSelectionInfo');
        if (info) {
            const totalChords = this.calculateTotalChords(selectedSets);
            info.textContent = `Selected ${selectedSets.length} sets (${totalChords} total chords)`;
        }
        
        if (selectedSets.length === 0) {
            document.getElementById('leaderboardFilter').textContent = 'Select chord sets to view leaderboard';
            document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="4" style="text-align: center;">Select chord sets above</td></tr>';
            return;
        }
        
        // Generate leaderboard key for this combination of sets
        const leaderboardKey = this.generateKey(selectedSets);
        
        // Show the specific leaderboard for this combination
        this.showSpecificLeaderboard(leaderboardKey, selectedSets);
    }

    calculateTotalChords(selectedSets) {
        if (!this.chordSetsData) return 0;
        
        let totalChords = 0;
        selectedSets.forEach(setKey => {
            const set = this.chordSetsData[setKey];
            if (set) {
                totalChords += set.chords.length;
            }
        });
        return totalChords;
    }

    showSpecificLeaderboard(leaderboardKey, selectedSets) {
        console.log('showSpecificLeaderboard called with key:', leaderboardKey);
        console.log('Available keys:', Object.keys(this.leaderboardsData.leaderboards));
        const leaderboard = this.leaderboardsData.leaderboards[leaderboardKey] || [];
        console.log('Found leaderboard data:', leaderboard);
        
        // Display filter text
        let filterText = '';
        if (leaderboard.length > 0 && leaderboard[0].sets) {
            filterText = leaderboard[0].sets;
        } else if (selectedSets.length > 0 && this.chordSetsData) {
            const setNames = selectedSets.map(key => this.chordSetsData[key]?.name || key).join(', ');
            filterText = setNames;
        } else {
            filterText = 'No scores yet';
        }
        document.getElementById('leaderboardFilter').textContent = filterText;
        
        // Reset table header to standard format
        const thead = document.querySelector('#leaderboardTable thead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Time</th>
                    <th>Date</th>
                </tr>
            `;
        }
        
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        if (leaderboard.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No scores yet for this combination!</td></tr>';
            return;
        }
        
        leaderboard.forEach((entry, index) => {
            const row = tbody.insertRow();
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            
            row.innerHTML = `
                <td class="${rankClass}">#${index + 1}</td>
                <td>${entry.name}</td>
                <td>${this.formatTime ? this.formatTime(entry.time) : entry.time}</td>
                <td>${entry.date}</td>
            `;
        });
    }

    setChordSetsData(chordSetsData) {
        this.chordSetsData = chordSetsData;
    }

    setFormatTimeCallback(formatTimeCallback) {
        this.formatTime = formatTimeCallback;
    }

    getTopPlayersByFrequency(limit = 5) {
        const playerCounts = {};
        
        // Count appearances across all leaderboards
        Object.values(this.leaderboardsData.leaderboards).forEach(leaderboard => {
            leaderboard.forEach(entry => {
                const name = entry.name;
                playerCounts[name] = (playerCounts[name] || 0) + 1;
            });
        });
        
        // Convert to array and sort by count (descending)
        const sortedPlayers = Object.entries(playerCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        
        return sortedPlayers;
    }

    populateNameDropdown() {
        const dropdown = document.getElementById('nameDropdown');
        if (!dropdown) return;
        
        const topPlayers = this.getTopPlayersByFrequency(5);
        
        if (topPlayers.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        dropdown.innerHTML = '';
        topPlayers.forEach(player => {
            const item = document.createElement('div');
            item.className = 'name-dropdown-item';
            item.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-count">${player.count} scores</span>
            `;
            
            item.addEventListener('click', () => {
                const input = document.getElementById('playerName');
                input.value = player.name;
                dropdown.style.display = 'none';
            });
            
            dropdown.appendChild(item);
        });
        
        dropdown.style.display = 'block';
    }

    hideNameDropdown() {
        const dropdown = document.getElementById('nameDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
}