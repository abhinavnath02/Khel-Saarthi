const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        },
        category: {
            type: String,
            required: true,
            enum: ['Cricket', 'Football', 'Badminton', 'Running', 'Other'],
        },
        skillLevel: {
            type: String,
            required: true,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        },
        entryFee: {
            type: Number,
            required: true,
            default: 0,
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        bannerImage: {
            type: String,
            default: '', // Cloudinary image URL
        },
        bannerImagePublicId: {
            type: String,
            default: '', // Cloudinary public_id for deletion/replacement
        },
        registeredParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

eventSchema.index({ location: '2dsphere' });
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;