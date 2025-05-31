const User = require('../models/user.model');
const resolveUserModel = require('../utils/resolveUserModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/jwt.service');
const valkeyClient = require('../configs/valkey');
const NotifyModel = require('../models/notify.model');
const webSocketService = require('../services/webSocket.service');

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
			console.error("Get user error:", error);
			res.status(500).send(error);
		}
	},
	updateUser: async (req, res) => {
		try {
			const updateFields = Object.keys(req.body);
			const BannedUpdateFields = ["role"];
			const isValidOperation = updateFields.every(field => !BannedUpdateFields.includes(field));

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
			console.error("Update error:", error);
			res.status(500).send(error);
		}
	},
	updateUserById: async (req, res) => {
		try {
			const updateFields = Object.keys(req.body);
			const BannedUpdateFields = ["role"];
			const isValidOperation = updateFields.every(field => !BannedUpdateFields.includes(field));

			if (!isValidOperation) {
				return res.status(400).send({ error: "Invalid update field" });
			}

			const user = await User.findById(req.params.id);
			if (!user) {
				return res.status(404).send({ error: "User not exists" });
			}

			updateFields.forEach(field => user[field] = req.body[field]);
			await user.save();
			res.send(user);
		} catch (error) {
			console.error("Update error:", error);
			res.status(500).send(error);
		}
	},

	deleteCurrentUser: async (req, res) => {
		try {
			await User.deleteOne({ _id: req.user._id });
			res.send("Delete success");
		} catch (error) {
			console.error("Delete error:", error);
			res.status(500).send(error);
		}
	},

	deleteUser: async (req, res) => {
		try {
			const userId = req.params.id;

			await User.deleteOne(userId);

			res.json({ "message": "User deleted successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Internal server error" });
		}

	},

	registerUser: async (req, res) => {
		try {
			const BaseModel = resolveUserModel(req.body.role);
			const user = new BaseModel(req.body);
			if (!req.query.nologin) {
				const payload = { _id: user._id, role: user.role };
				const accessToken = await generateAccessToken(payload);
				const refreshToken = await generateRefreshToken(payload);
				res.cookie('refreshToken', refreshToken, cookieOptions)
			}
			await user.save()
			res.json({ accessToken });
		} catch (error) {
			console.error("Register error:", error);
			res.status(400).send(error);
		}
	},

	getUsersList: async (req, res) => {
		try {
			const userRole = req.query.role;
			let option = {};
			if (userRole) {
				option = { role: userRole }
			}
			const usersList = await User.find(option);
			res.status(200).json(usersList.map((user) => ({
				...user,
				online: webSocketService.checkOnline(user._id),
			})));

		} catch (error) {
			console.error("Get users list error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	getUserBills: async (req, res) => {
		try {
			const user = await User.findById(req.params.id);
			if (!user) {
				return res.status(404).send({ error: "User not exists" });
			}
			const populated = await user.populate({
				path: "bills",
				populate: [
					{
						path: "user",
						select: "name email avatar_url"
					},
					{
						path: "course",
						select: "name level"
					},
					{
						path: "session",
						select: "class start_time end_time",
						populate: {
							path: "class_id",
							select: "class_name class_code"
						}
					}
				]
			})
			res.json(populated.bills);
		} catch (error) {
			console.error("Get user bills error:", error);
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
			console.error("Get user profile error:", error);
			res.status(500).send(error)
		}
	},
	getUserSchedules: async (req, res) => {
		try {
			const user = await User.findById(req.params.id).populate({
				path: "enrolled_classes",
				select: "class_sessions class_name",
				populate: [
					{
						path: "class_sessions",
						select: "_id start_time end_time title room ",
					},
				]
			});
			if (!user) {
				return res.status(404).json({ error: "user not found" });
			}
			const schedules = user.enrolled_classes.map((classItem) => {
				return classItem.class_sessions.map((session) => {
					return {
						classId: classItem._id,
						class_name: classItem.class_name,
						...session._doc,
					};
				});
			});
			res.json(schedules.flat());
		} catch (error) {
			console.error(error)
			res.status(500).json({ error: error })
		}
	},

	getUserNotifies: async (req, res) => {
		try {
			const user = await User.findById(req.params.id).populate({
				path: "notifies",
			})

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const notifies = user.notifies.map(notify => ({
				notify,
				is_seen: notify.seen.includes(user._id) ? true : false
			}))

			res.status(200).json(notifies);

		} catch (error) {
			console.error("Get user notifies error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},

	readNotify: async (req, res) => {
		try {
			const userId = req.user._id;
			const notifyId = req.params.id;
			if (!userId || !notifyId) {
				return res.status(400).json({ error: "User ID and notify ID are required" });
			}

			await NotifyModel.updateOne({
				_id: notifyId,
				seen: { $ne: userId }
			}, {
				$push: { seen: userId }
			})

			res.status(200).json({ message: "Notify marked as read" });
		} catch (error) {
			console.error("Read notify error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
};

module.exports = userController;
