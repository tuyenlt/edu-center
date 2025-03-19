const express = require('express');
const auth = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post("/users", userController.registerUser);
router.patch("/users", auth, userController.updateUser);
router.post("/users/login", userController.login);
router.delete("/users/me", auth, userController.deleteUser);
router.get("/users/me", auth, userController.getUserProfile);
router.post("/users/refresh-token", userController.refreshToken);
router.delete("/users/logout", auth, userController.logout);

module.exports = router;
