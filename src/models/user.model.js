const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		validate(value) {
			if (!validator.matches(value, /^[\p{L}\s]+$/u)) {
				throw new Error("Your name must contain letters and spaces only!");
			}
		}
	},
	email: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Email is not valid!")
			}
		}
	},
	gender: {
		type: String,
	},
	phone_number: {
		type: String,
		validate(value) {
			if (value.length != 10) {
				throw new Error("Wrong phone number format")
			}
		}
	}
	,
	password: {
		type: String,
		required: true,
		minlength: 8,
		trim: true
	},
	avatar_url: {
		type: String
	},
	role: {
		type: String,
		required: true,
		enum: ["student", "teacher", "staff", "manager"],
	},
	chatrooms: [{
		type: mongoose.Types.ObjectId,
		ref: 'chatrooms'
	}],
	bills: [{
		type: mongoose.Types.ObjectId,
		ref: "bills"
	}],
	notifies: [{
		type: mongoose.Types.ObjectId,
		ref: "notifies"
	}],
	isOnline: {
		type: Boolean,
		default: false
	}
},
	{
		discriminatorKey: "role",
		timestamps: true
	}
)


userSchema.methods.toJSON = function () {
	const user = this
	const userObject = user.toObject()

	delete userObject.password
	delete userObject.tokens

	return userObject
}


userSchema.statics.findByCredentials = async function (email, password) {
	const user = await User.findOne({ email })

	if (!user) {
		throw new Error("Unable to login")
	}

	const isMatch = await bcrypt.compare(password, user.password)

	if (!isMatch) {
		throw new Error("Unable to login")
	}

	return user
}



userSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})

const User = mongoose.model("users", userSchema)

module.exports = User