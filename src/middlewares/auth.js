const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Token missing" });
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                console.error(err);
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            req.user = payload;
            next();
        });
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = auth;




