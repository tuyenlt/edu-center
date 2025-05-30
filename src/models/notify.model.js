const mongoose = require('mongoose');
const User = require('./user.model');

const notifySchema = new mongoose.Schema({
	users: [{
		type: mongoose.Types.ObjectId,
		ref: 'users'
	}],
	title: {
		type: String,
		required: true
	},
	content: {
		type: String
	},
	type: {
		type: String,
	},
	link: {
		type: String
	},
	seen: [{
		type: mongoose.Types.ObjectId,
		ref: 'users'
	}],
	identifier: {
		type: String,
		default: null
	},

}, {
	collection: 'notifies',
	timestamps: true
})

notifySchema.post('save', async function (doc) {
	const isNew = doc.createdAt === doc.updatedAt;
	if (isNew) {
		try {
			console.log('Notify saved:', doc);
			await User.updateMany(
				{ _id: { $in: doc.users } },
				{
					$push: {
						notifies: {
							notify: doc._id,
							is_seen: false
						}
					}
				}
			);
		} catch (error) {
			console.error('Error in notifySchema post save:', error);
		}
	}
});

notifySchema.pre('remove', async function (next) {
	try {
		await User.updateMany(
			{ _id: { $in: doc.users } },
			{ $pull: { notifies: { notify: this._id } } }
		);
		next();
	} catch (error) {
		console.error('Error in notifySchema pre remove:', error);
		next(error);
	}
})


const NotifyModel = mongoose.model('notifies', notifySchema)

module.exports = NotifyModel