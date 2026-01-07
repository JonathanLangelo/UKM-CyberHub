const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only accept GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Read users data
        const usersPath = path.join(process.cwd(), 'data', 'users.json');
        const usersData = fs.readFileSync(usersPath, 'utf8');
        const users = JSON.parse(usersData);

        // Get user ID from query parameter
        const userId = req.query.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // VULNERABILITY: No authorization check!
        // The API does NOT verify if the requesting user has permission to view this profile
        // It simply returns data for ANY valid user ID
        const user = users.find(u => u.id === parseInt(userId));

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user profile (including flag if present)
        // Remove password from response for basic security
        const { password, ...userProfile } = user;

        return res.status(200).json({
            success: true,
            profile: userProfile
        });

    } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
