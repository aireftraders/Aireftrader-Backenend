const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public Admin Route (no auth)
router.post('/login', adminController.login);

// Apply Admin Auth to all following routes
router.use(authMiddleware.admin);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/verify', adminController.verifyUser);

// Payment Management
router.get('/payments', adminController.getPayments);
router.put('/payments/:id/status', adminController.updatePaymentStatus);

// Add other admin routes here...

module.exports = router;