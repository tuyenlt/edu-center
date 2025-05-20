const express = require('express');
const auth = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const User = require('../models/user.model');
const { sendVerificationEmail } = require('../services/email.service');

const router = express.Router();

router.post("/users", userController.registerUser);
router.post("/users/login", userController.login);
router.patch("/users", auth, userController.updateUser);
router.delete("/users/me", auth, userController.deleteUser);
router.get("/users/me", auth, userController.getMe);
router.delete("/users/logout", auth, userController.logout);
router.post("/users/refresh-token", userController.refreshToken);
router.get("/users/:id", auth, userController.getUserProfileByID);
router.get("/mail-test", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const result = await sendVerificationEmail(user);
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})

module.exports = router;
