const jwt = require('jsonwebtoken')
const valkeyClient = require('../configs/valkey')

const generateAccessToken = async (payload) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: process.env.ACCESS_TOKEN_DURATION
        }
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}


const generateRefreshToken = async (payload) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const expiresIn = process.env.REFRESH_TOKEN_DURATION || "7d";

        const options = { expiresIn };

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                reject(err);
            }

            const durationInSeconds = parseInt(process.env.REFRESH_TOKEN_EXPIRATION) || 7 * 24 * 60 * 60;

            valkeyClient.setEx(payload._id.toString(), durationInSeconds, token);

            resolve(token);
        });
    });
};


const verifyRefreshToken = async (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
            if (err) {
                return reject(err);
            }

            try {
                const currentRefreshToken = await valkeyClient.get(payload._id);
                if (!currentRefreshToken || currentRefreshToken !== refreshToken) {
                    return reject("Refresh token expired or invalid");
                }

                resolve(payload);
            } catch (redisError) {
                reject("Redis error: " + redisError.message);
            }
        });
    });
};



module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
}