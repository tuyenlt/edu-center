const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.replace("Bearer ", "");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.error(err);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        req.user = payload;
        next();
    });
};

module.exports = auth;
