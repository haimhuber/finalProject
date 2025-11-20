
const express = require('express');
const app = express();
require('dotenv').config();
const cookieparser = require('cookie-parser');
app.use(cookieparser());
const jwt = require('jsonwebtoken');
const path = require('path'); // Helps with file paths
app.use(express.static(path.join(__dirname, '../public')));
let globalToken = "";
let globalCookie = "";

function authenticateToken(req, res, next) {
    let token = req.header('Authorization')?.split(' ')[1] || req.cookies.token;
    globalToken = token;
    globalCookie = req.cookies.token;
    console.log(token);

    if (!token || !req.cookies.token) return res.redirect('api/login');

    //     --- Dont forget to add JWT_SECRET in .env ---
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.redirect('api/login');
        refreshToken(req, res, next);
        next();
    });
}
module.exports.authenticateToken = authenticateToken;


function refreshToken(req, res, next) {
    const token = globalToken;

    if (!token) {
        // No token? Redirect to login
        return res.redirect('/user/login');
    }

    // Verify the existing token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token is invalid or expired — show login page
            return res.sendFile(path.join(__dirname, '../public', 'login.html'));
        }

        // Token is valid — refresh it
        const newToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '2m' });

        res.cookie("token", newToken, {
            httpOnly: true,
            secure: false, // set true if you're using HTTPS
            maxAge: 2 * 60 * 1000 // 2 minutes
        });

        res.setHeader('Authorization', newToken);
        console.log("token refreshed");

        return;
    });
}

module.exports.refreshToken = refreshToken;

function eraseTokenFromCookie(req, res, next) {
    res.clearCookie('token');
    console.log("Cookie deleted");

    return res.redirect('/user/login');
};

module.exports.eraseTokenFromCookie = eraseTokenFromCookie;