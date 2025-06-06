const cors = require('cors')

const allowedList = [
	"http://localhost:5173",
	"http://tmsherk.id.vn",
	"http://api.tmsherk.id.vn",
	"http://englishnest.click",
	"http://api.englishnest.click",
	"https://englishnest.click",
	"https://api.englishnest.click",
]

const apiCors = cors({
	// origin: "http://localhost:5173",
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (origin.includes("http://localhost")) {
			return callback(null, true);
		}

		if (allowedList.includes(origin)) {
			return callback(null, true);
		}

		const allowedRegex = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/;

		if (allowedRegex.test(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	credentials: true,
})


const socketCors = {
	// origin: 'http://localhost:5173',
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (origin.includes("http://localhost")) {
			return callback(null, true);
		}
		const allowedRegex = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/;

		if (allowedList.includes(origin)) {
			return callback(null, true);
		}

		if (allowedRegex.test(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	methods: ['GET', 'POST']
}

module.exports = {
	apiCors,
	socketCors
}