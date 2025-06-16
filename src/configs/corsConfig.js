const cors = require('cors')

const allowedList = [
	"http://localhost:5173",
	"https://tmsherk.id.vn",
	"https://api.tmsherk.id.vn",
	"https://englishnest.click",
	"https://api.englishnest.click",
	"https://englishnest.click",
	"https://api.englishnest.click",
]

const apiCors = cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (origin.includes("http://localhost")) {
			return callback(null, true);
		}

		if (allowedList.includes(origin)) {
			return callback(null, true);
		}

		callback(new Error("Not allowed by CORS"));
	},
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	credentials: true,
})


const socketCors = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (origin.includes("http://localhost")) {
			return callback(null, true);
		}

		if (allowedList.includes(origin)) {
			return callback(null, true);
		}

		callback(new Error("Not allowed by CORS"));
	},
	methods: ['GET', 'POST']
}

module.exports = {
	apiCors,
	socketCors
}