// Simple file writer for leaderboards using Node.js fs
const fs = require('fs').promises;
const path = require('path');

class FileWriter {
    static async writeLeaderboards(data) {
        try {
            const filePath = path.join(__dirname, '..', '..', '..', 'data', 'leaderboards.json');
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log('Leaderboards written to:', filePath);
            return true;
        } catch (error) {
            console.error('Error writing leaderboards:', error);
            return false;
        }
    }
}

// For use in browser via dynamic import
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileWriter;
}

// For direct Node.js execution
if (require.main === module) {
    // Test write
    const testData = {
        leaderboards: {},
        metadata: {
            created: new Date().toISOString(),
            version: '1.0',
            totalEntries: 0
        }
    };
    
    FileWriter.writeLeaderboards(testData)
        .then(() => console.log('Test write successful'))
        .catch(err => console.error('Test write failed:', err));
}