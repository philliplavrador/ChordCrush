// ChordCrush Server - static file serving + file-based leaderboard API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve data directory for chord data and leaderboards
app.use('/data', express.static(path.join(__dirname, 'data')));

// Leaderboard save endpoint (writes to data/leaderboards.json)
app.post('/api/save-leaderboard', async (req, res) => {
    try {
        const newLeaderboardData = req.body;
        const filePath = path.join(__dirname, 'data', 'leaderboards.json');

        await fs.mkdir(path.dirname(filePath), { recursive: true });

        let existingData = {
            leaderboards: {},
            metadata: {
                created: new Date().toISOString().split('T')[0],
                version: '1.0',
                totalEntries: 0
            }
        };

        try {
            const existingFile = await fs.readFile(filePath, 'utf8');
            existingData = JSON.parse(existingFile);
        } catch (readError) {
            console.log('No existing leaderboards file found, creating new one');
        }

        const mergedData = {
            leaderboards: { ...existingData.leaderboards, ...newLeaderboardData.leaderboards },
            metadata: {
                ...existingData.metadata,
                ...newLeaderboardData.metadata,
                lastUpdated: new Date().toISOString()
            }
        };

        await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf8');
        res.json({ success: true, message: 'Leaderboard data saved successfully' });
    } catch (error) {
        console.error('Error saving leaderboard data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`ChordCrush server running at http://localhost:${PORT}`);
});

module.exports = app;
