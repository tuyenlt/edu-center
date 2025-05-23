const express = require('express');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole')
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post("/users", userController.registerUser);
router.patch("/users", auth, userController.updateUser);
router.delete("/users/me", auth, userController.deleteCurrentUser);
router.delete("/users/logout", auth, userController.logout);
router.delete("/users/:id", auth, authorizeRole(['manager']), userController.deleteUser);
router.get("/users/list", auth, authorizeRole(['manager'], ['staff']), userController.getUsersList);
router.get("/users/me", auth, userController.getMe);
router.post("/users/login", userController.login);
router.post("/users/refresh-token", userController.refreshToken);
router.get("/users/profile/:id", auth, userController.getUserProfileByID);
router.get("/users/:id/schedules", auth, userController.getUserSchedules);
module.exports = router;
