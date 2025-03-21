const createError = require('http-errors');
const User = require('../models/user.model');
const resolveUserModel = require('../utils/resolveUserModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/jwt.service');
const valkeyClient = require('../configs/valkey');

const userController = {
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next(createError.BadRequest("Email and password are required"));
            }

            const user = await User.findByCredentials(email, password);
            if (!user) {
                return next(createError.Unauthorized("Invalid email or password"));
            }

            const payload = { _id: user._id, role: user.role };
            const accessToken = await generateAccessToken(payload);
            const refreshToken = await generateRefreshToken(payload);

            res.json({ accessToken, refreshToken });
        } catch (error) {
            next(createError.InternalServerError(error.message || "Something went wrong"));
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            if (!req.body.refreshToken) throw createError.BadRequest();

            const oldPayload = await verifyRefreshToken(req.body.refreshToken);
            const payload = { _id: oldPayload._id, role: oldPayload.role };

            const accessToken = await generateAccessToken(payload);
            const refreshToken = await generateRefreshToken(payload);

            res.json({ accessToken, refreshToken });
        } catch (error) {
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: "Refresh token is required" });
            }
            const payload = await verifyRefreshToken(refreshToken);
            if (!payload || !payload._id) {
                return res.status(403).json({ error: "Invalid refresh token" });
            }

            await valkeyClient.del(payload._id);

            res.json({ message: "Logout successful" });
        } catch (error) {
            next(error);
        }
    },
    updateUser: async (req, res) => {
        try {
            const updateFields = Object.keys(req.body);
            const allowedUpdateFields = ["name", "email", "password", "profilePic"];
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
            await user.save()
            res.json({ accessToken, refreshToken });
        } catch (error) {
            res.status(400).send(error);
        }
    },

    getUserProfile: async (req, res) => {
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
    }
};

module.exports = userController;
