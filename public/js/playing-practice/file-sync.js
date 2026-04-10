// File Sync Utility for Leaderboards
// This creates a simple solution for syncing localStorage with the file system

export class FileSyncManager {
    constructor() {
        this.leaderboardsFile = 'data/leaderboards.json';
    }

    // Method to sync localStorage data to file (requires manual copy for now)
    exportToFile() {
        const data = localStorage.getItem('leaderboardsData');
        if (!data) {
            console.log('No leaderboard data to export');
            return;
        }

        // Create downloadable JSON file
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leaderboards.json';
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Leaderboard data downloaded. Please place in data directory.');
        alert('Leaderboard data downloaded! Please move the downloaded file to the data folder to persist your scores.');
    }

    // Method to manually trigger export
    showExportMessage() {
        console.log('To save leaderboards permanently:');
        console.log('1. Your scores are saved in browser localStorage');
        console.log('2. Call exportToFile() to download the data');
        console.log('3. Replace data/leaderboards.json with the downloaded file');
    }
}