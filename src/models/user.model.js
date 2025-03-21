const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        validate(value) {
            if (!validator.matches(value, /^[A-Za-z\s]+$/)) {
                throw new Error("Your name must contain letter only!")
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
    profile_img: {
        type: Buffer
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "teacher", "staff", "manager"],
    },
    chatrooms: [{
        chat_id: {
            type: mongoose.Types.ObjectId,
            ref: 'chatrooms'
        }
    }],
    bills: [{
        type: mongoose.Types.ObjectId,
        ref: "bills"
    }],
    notifies: [{
        notify_id: {
            type: mongoose.Types.ObjectId,
            ref: "notifies"
        },
        is_seen: {
            Boolean
        }
    }
    ]
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


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("Unable to login")``
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