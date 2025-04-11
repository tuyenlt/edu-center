const express = require('express');
const auth = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const valkeyClient = require('../configs/valkey');

const router = express.Router();

router.post("/users", userController.registerUser);
router.post("/users/login", userController.login);
router.patch("/users", auth, userController.updateUser);
router.delete("/users/me", auth, userController.deleteUser);
router.get("/users/me", auth, userController.getUserProfile);
router.delete("/users/logout", auth, userController.logout);
router.post("/users/refresh-token", userController.refreshToken);

module.exports = router;
