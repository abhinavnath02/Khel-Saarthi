const express = require('express');
const router = express.Router();
const { getMyBookings } = require('../controllers/venueController');
const { protect } = require('../middleware/authMiddleware');

router.route('/my').get(protect, getMyBookings);

module.exports = router;
