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
						notifies: doc._id
					}
				}
			);
		} catch (error) {
			console.error('Error in notifySchema post save:', error);
		}
	}
});


async function cleanupNotify(notifyDoc) {
	if (!notifyDoc || !notifyDoc.users) return;
	await User.updateMany(
		{ _id: { $in: notifyDoc.users } },
		{ $pull: { notifies: notifyDoc._id } }
	);
}


notifySchema.pre('remove', async function (next) {
	try {
		await User.updateMany(
			{ _id: { $in: doc.users } },
			{ $pull: { notifies: this._id } }
		);
		next();
	} catch (error) {
		console.error('Error in notifySchema pre remove:', error);
		next(error);
	}
})


notifySchema.pre(['findOneAndDelete', 'findOneAndRemove'], async function (next) {
	try {
		const doc = await this.model.findOne(this.getQuery());
		if (doc) await cleanupNotify(doc);
		next();
	} catch (err) {
		next(err);
	}
});

notifySchema.pre('deleteOne', { document: false, query: true }, async function (next) {
	try {
		const doc = await this.model.findOne(this.getQuery());
		if (doc) await cleanupNotify(doc);
		next();
	} catch (err) {
		next(err);
	}
});

notifySchema.pre('deleteMany', { document: false, query: true }, async function (next) {
	try {
		const docs = await this.model.find(this.getQuery());
		await Promise.all(docs.map(cleanupNotify));
		next();
	} catch (err) {
		next(err);
	}
});


const NotifyModel = mongoose.model('notifies', notifySchema)

module.exports = NotifyModel