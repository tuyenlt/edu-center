const express = require('express');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole');
const billController = require('../controllers/bill.controller');

const router = express.Router();

router.use(auth);
router.get('/bills/list', authorizeRole(['manager', 'staff']), billController.getAllBills);
router.patch('/bills/pay', authorizeRole(['manager', 'staff']), billController.payBills);
router.get('/bills/:id', authorizeRole(['manager', 'staff']), billController.getBillById);

module.exports = router;
