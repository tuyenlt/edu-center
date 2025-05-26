const BillModel = require('../models/bill.model');

const billController = {
    createBill: async (req, res) => {
        try {
            const billData = req.body;
            const bill = new BillModel(billData);
            await bill.save();
            res.status(201).json({ message: "Bill created successfully", data: bill });
        } catch (error) {
            res.status(500).json({ message: "Error creating bill", error: error.message });
        }
    },

    getUserBills: async (req, res) => {
        try {
            const userId = req.params.id;
            const bills = await BillModel.find({ user: userId }).populate({
                path: 'user',
                select: 'name email role phone_number'
            });
            res.status(200).json(bills);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user bills", error: error.message });
        }
    },

    updateBill: async (req, res) => {
        try {
            const billId = req.params.id;
            const updateData = req.body;

            const updatedBill = await BillModel.findById(billId);
            if (!updatedBill) {
                return res.status(404).json({ message: 'Bill not found' });
            }
            Object.keys(updateData).forEach(key => {
                updatedBill[key] = updateData[key];
            });

            if (!updatedBill) {
                return res.status(404).json({ message: 'Bill not found' });
            }
            await updatedBill.save();
            res.status(200).json(updatedBill);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    getAllBills: async (req, res) => {
        try {
            const bills = await BillModel.find().populate([
                {
                    path: "user",
                    select: 'name email role phone_number'
                }
            ]);
            res.status(200).json(bills);
        } catch (error) {
            res.status(500).json({ message: "Error fetching bills", error: error.message });
        }
    },

    getBillById: async (req, res) => {
        try {
            const billId = req.params.id;
            const populateOptions = [
                {
                    path: "user",
                    select: 'name email role phone_number'
                },
                {
                    path: "session",
                    select: '_id start_time end_time title room',
                },
                {
                    path: "course",
                    select: '_id name',
                }
            ]
            const bill = await BillModel.findById(billId).populate(populateOptions);

            if (!bill) {
                return res.status(404).json({ message: "Bill not found" });
            }
            res.status(200).json(bill);
        } catch (error) {
            res.status(500).json({ message: "Error fetching bill", error: error.message });
        }
    }
}

module.exports = billController;