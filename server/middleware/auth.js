// server/middleware/auth.js

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'defaultsecret';

function auth(allowedRoles = []) {
  return (req, res, next) => {
    // FIX: Get token from the 'x-auth-token' header, not 'Authorization'
    const token = req.header('x-auth-token'); 
    
    if (!token) {
  req.user = null;
  return next();
}

    try {
      const user = jwt.verify(token, secret);
      
      // NEW DIAGNOSTIC LOG: This will show us what role the server is reading
      console.log(`Accessing route ${req.path}. User role from token: ${user.role}, User ID: ${user.id}`);
      
      // Check if roles are required and if the user's role is allowed
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        console.log('User role', user.role, 'not allowed for request to', req.path, ', sending 403.'); 
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = user;
      next();

    } catch (e) {
  req.user = null;
  next();
}
  };
}

module.exports = auth;