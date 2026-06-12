const jwt = require('jsonwebtoken');

/**
 * Middleware handling generic authenticated session checking
 * via JWT bearer token sent in the Authorization header.
 */
exports.verifyToken = (req, res, next) => {
    let token = req.headers['authorization'] || req.headers['x-access-token'];

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided. Please log in.' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized! Token has expired or is invalid.' });
        }
        req.user = decoded; // Object structure matches users table
        next();
    });
};

/**
 * Role-Based Access Control Middleware Generator
 * Protect routes by verifying allowed roles
 */
exports.requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: 'User payload missing. Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Forbidden: Endpoint requires one of [${allowedRoles.join(', ')}] roles.` 
            });
        }
        next();
    };
};
