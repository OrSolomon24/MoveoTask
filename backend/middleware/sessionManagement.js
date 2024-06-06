// middleware/sessionManagement.js

const session = require('express-session');

// Configure session middleware
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET, // Use a secret key for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Change to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // Session duration (24 hours in milliseconds)
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    },
});

module.exports = sessionMiddleware;
