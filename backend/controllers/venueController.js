const asyncHandler = require('express-async-handler');
const Venue = require('../models/venueModel');
const Booking = require('../models/bookingModel');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const fs = require('fs');

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private (Manager/Admin)
const createVenue = asyncHandler(async (req, res) => {
    let { name, description, address, city, state, location, sportTypes, pricePerHour, amenities, availability } = req.body;

    // Parse JSON strings if coming from FormData
    if (typeof location === 'string') location = JSON.parse(location);
    if (typeof sportTypes === 'string') sportTypes = JSON.parse(sportTypes);
    if (typeof amenities === 'string') amenities = JSON.parse(amenities);
    if (typeof availability === 'string') availability = JSON.parse(availability);

    let images = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            try {
                const { url } = await uploadToCloudinary(file.path, 'venue_images');
                images.push(url);
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Image upload failed', error);
            }
        }
    }

    const venue = await Venue.create({
        name,
        description,
        address,
        city,
        state,
        location,
        sportTypes,
        pricePerHour,
        amenities,
        availability,
        images,
        manager: req.user._id
    });

    res.status(201).json(venue);
});

// @desc    Get all venues with filters
// @route   GET /api/venues
// @access  Public
const getVenues = asyncHandler(async (req, res) => {
    const { city, sport, minPrice, maxPrice, lat, lng, radius } = req.query;

    let filter = {};

    if (city) filter.city = { $regex: city, $options: 'i' };
    if (sport) filter.sportTypes = { $in: [sport] };

    if (minPrice || maxPrice) {
        filter.pricePerHour = {};
        if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
        if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    // Geospatial query if lat/lng provided
    if (lat && lng) {
        const distanceInMeters = (radius || 10) * 1000; // Default 10km
        filter.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: distanceInMeters
            }
        };
    }

    const venues = await Venue.find(filter).populate('manager', 'name email');
    res.json(venues);
});

// @desc    Get venue by ID
// @route   GET /api/venues/:id
// @access  Public
const getVenueById = asyncHandler(async (req, res) => {
    const venue = await Venue.findById(req.params.id).populate('manager', 'name email');
    if (venue) {
        res.json(venue);
    } else {
        res.status(404);
        throw new Error('Venue not found');
    }
});

// @desc    Create a booking
// @route   POST /api/venues/:id/book
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { date, startTime, endTime, durationHours, totalAmount } = req.body;
    const venueId = req.params.id;

    // Check for overlap
    const existingBooking = await Booking.findOne({
        venue: venueId,
        date: new Date(date),
        status: { $ne: 'cancelled' },
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
        ]
    });

    if (existingBooking) {
        res.status(400);
        throw new Error('Slot already booked');
    }

    const booking = await Booking.create({
        venue: venueId,
        user: req.user._id,
        date,
        startTime,
        endTime,
        durationHours,
        totalAmount,
        status: 'confirmed' // Auto-confirm for now, add payment logic later
    });

    res.status(201).json(booking);
});

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('venue')
        .sort({ date: -1 });
    res.json(bookings);
});

module.exports = {
    createVenue,
    getVenues,
    getVenueById,
    createBooking,
    getMyBookings
};
