const User = require("../models/user.model");
const { verifyAccessToken } = require("../services/jwt.service")

const socketAuth = async (socket, next) => {
    const accessToken = socket.handshake.auth.accessToken;
    if (!accessToken) {
        console.log("AccessToken required")
        return next(new Error("AccessToken required"));
    }
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
        console.log("Invalid accessToken")
        return next(new Error("Invalid accessToken"));
    }
    const user = await User.findById(payload._id);
    socket.user = {
        _id: user._id,
        name: user.name,
        avatar_url: user.avatar_url
    }
    next();
}

module.exports = socketAuth