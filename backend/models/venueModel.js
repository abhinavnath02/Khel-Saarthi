const mongoose = require('mongoose');

const venueSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true } // [longitude, latitude]
        },
        sportTypes: [{ type: String, required: true }], // e.g., ['Cricket', 'Football']
        pricePerHour: { type: Number, required: true },
        images: [{ type: String }], // URLs
        amenities: {
            parking: { type: Boolean, default: false },
            washroom: { type: Boolean, default: false },
            changingRoom: { type: Boolean, default: false },
            drinkingWater: { type: Boolean, default: false },
            lights: { type: Boolean, default: false },
            equipmentRental: { type: Boolean, default: false }
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        autoApprove: { type: Boolean, default: false },
        availability: [{
            dayOfWeek: { type: Number }, // 0=Sunday, 1=Monday...
            startTime: { type: String }, // "09:00"
            endTime: { type: String }    // "22:00"
        }]
    },
    { timestamps: true }
);

venueSchema.index({ location: '2dsphere' });

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;
