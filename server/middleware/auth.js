// server/middleware/auth.js

const jwt = require('jsonwebtoken');
// Load the JWT secret from environment variables or use a default
const secret = process.env.JWT_SECRET || 'defaultsecret';

/**
 * Middleware for authentication and role-based authorization.
 * It checks for a valid JWT and attaches the user to the request object.
 * It can also restrict access to specific user roles.
 * * @param {string[]} allowedRoles - An array of roles allowed to access the route.
 * @returns {function} The middleware function to be used in routes.
 */
function auth(allowedRoles = []) {
  // The actual middleware function that Express will use
  return (req, res, next) => {
    // Get the JWT from the 'x-auth-token' header
    const token = req.header('x-auth-token'); 
    
    // If no token is provided, this is likely a public route.
    // Attach a null user object and proceed to the next middleware/route handler.
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify the token using the secret. This decodes the JWT payload.
      const user = jwt.verify(token, secret);
      
      // Authorization check: If a list of allowed roles is provided...
      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        // ...check if the authenticated user's role is included in that list.
        if (!allowedRoles.includes(user.role)) {
          // If the role is not allowed, log the attempt and send a 403 Forbidden status.
          console.log('User role', user.role, 'not allowed for request to', req.path, ', sending 403.'); 
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      // If the token is valid and the user is authorized, attach the user object to the request.
      req.user = user;
      // Proceed to the next middleware or the route handler.
      next();

    } catch (e) {
      // If the token is invalid (e.g., expired or malformed), handle the error gracefully.
      // Attach a null user object and proceed, allowing access to public content on a route.
      req.user = null;
      next();
    }
  };
}

module.exports = auth;