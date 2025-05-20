const User = require('../models/user.model');
const resolveUserModel = require('../utils/resolveUserModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/jwt.service');
const valkeyClient = require('../configs/valkey');

const cookieOptions = {
    httpOnly: true, // Prevent JavaScript access
    secure: false,   // Use HTTPS (Set to false for local development)
    // sameSite: "strict", // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const userController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }

            const user = await User.findByCredentials(email, password);
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const payload = { _id: user._id, role: user.role };
            const accessToken = await generateAccessToken(payload);
            const refreshToken = await generateRefreshToken(payload);
            console.log(req.headers);
            res.cookie("refreshToken", refreshToken, cookieOptions)
            // console.log("cookie", res.cookie("refreshToken"));
            res.json({ accessToken });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    refreshToken: async (req, res) => {
        try {
            if (!req.cookies || !req.cookies.refreshToken) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const oldPayload = await verifyRefreshToken(req.cookies.refreshToken);
            const payload = { _id: oldPayload._id, role: oldPayload.role };

            const accessToken = await generateAccessToken(payload);
            const refreshToken = await generateRefreshToken(payload);


            res.cookie("refreshToken", refreshToken, cookieOptions)

            res.json({ accessToken });
        } catch (error) {
            console.error("Refresh token error:", error);
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Refresh token expired" });
            }
            if (error.name === "JsonWebTokenError") {
                return res.status(403).json({ error: "Invalid refresh token" });
            }
            res.status(500).json({ error: "Internal server error" });
        }
    },

    logout: async (req, res) => {
        try {
            if (!req.cookies || !req.cookies.refreshToken) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const payload = await verifyRefreshToken(req.cookies.refreshToken);
            if (!payload || !payload._id) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }

            await valkeyClient.del(payload._id);
            console.log("Deleted refresh token from Valkey");

            res.cookie('refreshToken', '', cookieOptions)

            res.json({ message: "Logout successful" });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).send({ error: "User not exists" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).send(error);
        }
    },
    updateUser: async (req, res) => {
        try {
            const updateFields = Object.keys(req.body);
            const allowedUpdateFields = ["name", "email", "password", "avatar_url"];
            const isValidOperation = updateFields.every(field => allowedUpdateFields.includes(field));

            if (!isValidOperation) {
                return res.status(400).send({ error: "Invalid update field" });
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).send({ error: "User not exists" });
            }

            updateFields.forEach(field => user[field] = req.body[field]);
            await user.save();
            res.send(user);
        } catch (error) {
            res.status(500).send(error);
        }
    },

    deleteUser: async (req, res) => {
        try {
            await User.deleteOne({ _id: req.user._id });
            res.send("Delete success");
        } catch (error) {
            res.status(500).send(error);
        }
    },

    registerUser: async (req, res) => {
        try {
            const BaseModel = resolveUserModel(req.body.role);
            const user = new BaseModel(req.body);

            const payload = { _id: user._id, role: user.role };
            const accessToken = await generateAccessToken(payload);
            const refreshToken = await generateRefreshToken(payload);
            res.cookie('refreshToken', refreshToken, cookieOptions)
            await user.save()
            res.json({ accessToken });
        } catch (error) {
            res.status(400).send(error);
        }
    },
    getUserBills: async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).send({ error: "User not exists" });
            }
            const bills = await user.populate('bills')
            res.json(bills)

        } catch (error) {
            res.status(500).send(error)
        }
    },
    getUserProfileByID: async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).send({ error: "User ID is required" });
            }
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).send({ error: "User not exists" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).send(error)
        }
    },
};

module.exports = userController;
