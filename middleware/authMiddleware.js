const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Extract token from 'Authorization' header
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('JWT Verification Error:', err.message);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach the user object to the request
        next();
    });
};