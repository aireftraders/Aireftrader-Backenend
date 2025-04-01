const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Public login route
router.post('/login', adminController.login);

module.exports = router;