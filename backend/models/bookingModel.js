const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        venue: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Venue',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: { type: Date, required: true },
        startTime: { type: String, required: true }, // "14:00"
        endTime: { type: String, required: true },   // "15:00"
        durationHours: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
        paymentId: { type: String },
    },
    { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
