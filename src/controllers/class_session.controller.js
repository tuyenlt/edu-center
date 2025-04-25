const ClassSessionModel = require('../models/class_session.model');

const classSessionController = {
    createClassSession: async (req, res) => {
        try {
            const newClassSession = new ClassSessionModel(req.body);
            await newClassSession.save();
            res.status(201).json(newClassSession);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getAllClassSessions: async (req, res) => {
        try {
            const classSessions = await ClassSessionModel.find();
            res.status(200).json(classSessions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getClassSessionById: async (req, res) => {
        try {
            const classSession = await ClassSessionModel.findById(req.params.id);
            if (!classSession) {
                return res.status(404).json({ message: "Class session not found" });
            }
            res.status(200).json(classSession);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    editClassSession: async (req, res) => {
        try {
            const classSessionId = req.params.id;
            const updateData = req.body;

            const updatedClassSession = await ClassSessionModel.findByIdAndUpdate(
                classSessionId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedClassSession) {
                return res.status(404).json({ message: 'Class session not found' });
            }

            return res.status(200).json({
                message: 'Class session updated successfully',
                data: updatedClassSession
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error });
        }
    },
    deleteClassSession: async (req, res) => {
        try {
            const classSessionId = req.params.id;

            const deletedClassSession = await ClassSessionModel.findByIdAndDelete(classSessionId);

            if (!deletedClassSession) {
                return res.status(404).json({ message: 'Class session not found' });
            }

            return res.status(200).json({
                message: 'Class session deleted successfully',
                data: deletedClassSession
            });
        } catch (error) {
            console.error(error);

        }
    }
}

module.exports = classSessionController;