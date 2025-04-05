const { deCoderToken } = require('../config/jwt');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token using our deCoderToken function
        const decoded = deCoderToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;   