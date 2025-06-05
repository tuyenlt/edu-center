const mongoose = require('mongoose')

const ChapterSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	lessons: [
		{
			title: {
				type: String,
				required: true
			},
			description: {
				type: String,
				required: true
			},
			type: {
				type: String,
				required: true,
				enum: ['listening', 'reading', 'writing', 'speaking', 'grammar', 'vocabulary', 'exams']
			},
		}
	]
})

const CourseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	goal: {
		type: String,
		required: true,
	},
	course_level: {
		type: String,
		required: true,
	},
	img_url: {
		type: String,
	},
	course_programs: [
		{
			type: ChapterSchema,
			required: true
		}
	],
	requested_students: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	}],
	tags: [{
		type: String,
	}],
	price: {
		type: Number,
		required: true
	},
}, {
	timestamps: true,
	collection: 'courses'
})

const CourseModel = mongoose.model('courses', CourseSchema)

module.exports = CourseModel


