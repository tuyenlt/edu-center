const jwt = require('jsonwebtoken');
const valkeyClient = require('../configs/valkey');
const createError = require('http-errors');

const logError = (message, error) => {
    console.error(`[JWT Service] ${message}:`, error.message || error);
};


const generateAccessToken = async (payload) => {
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET || 'defaultAccessTokenSecret';
        const expiresIn = process.env.ACCESS_TOKEN_DURATION || '15m';

        if (!payload || !payload._id) {
            throw createError.BadRequest('Payload must include a valid _id');
        }

        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        logError('Failed to generate access token', error);
        throw error;
    }
};


const generateRefreshToken = async (payload) => {
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshTokenSecret';
        const expiresIn = process.env.REFRESH_TOKEN_DURATION || '7d';
        const durationInSeconds = parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10) || 7 * 24 * 60 * 60;

        if (!payload || !payload._id) {
            throw createError.BadRequest('Payload must include a valid _id');
        }

        const token = jwt.sign(payload, secret, { expiresIn });

        await valkeyClient.setEx(payload._id.toString(), durationInSeconds, token);

        return token;
    } catch (error) {
        logError('Failed to generate refresh token', error);
        throw error;
    }
};


const verifyRefreshToken = async (refreshToken) => {
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshTokenSecret';

        const payload = jwt.verify(refreshToken, secret);

        const storedToken = await valkeyClient.get(payload._id);

        if (!storedToken || storedToken !== refreshToken) {
            throw createError.Unauthorized('Refresh token expired or invalid');
        }

        return payload;
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            logError('Invalid or expired refresh token', error);
            throw createError.Unauthorized('Invalid or expired refresh token');
        }

        logError('Failed to verify refresh token', error);
        throw error;
    }
};




module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
}