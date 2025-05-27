const express = require('express');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole')
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/users/test-auth', auth, (req, res) => {
    try {
        if (!req.cookies['refresh-token']) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        res.status(200).json({ message: "Authorized" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
})

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
router.patch("/users/:id", auth, userController.updateUserById);
router.get("/users/:id/bills", auth, userController.getUserBills);
router.get("/users/:id/notifies", auth, userController.getUserNotifies);


module.exports = router;
