const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Venue = require('./models/venueModel');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedVenues = async () => {
    try {
        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Create a user first.');
            process.exit(1);
        }

        const venues = [
            {
                name: 'City Sports Complex',
                description: 'Premier sports facility with multiple courts.',
                address: '123 Main St',
                city: 'Mumbai',
                state: 'Maharashtra',
                location: { type: 'Point', coordinates: [72.8777, 19.0760] },
                sportTypes: ['Cricket', 'Football'],
                pricePerHour: 1500,
                amenities: { parking: true, washroom: true, lights: true },
                manager: user._id,
                images: ['https://images.unsplash.com/photo-1522778119026-d647f0565c6a']
            },
            {
                name: 'Smash Badminton Arena',
                description: 'Professional wooden courts with synthetic mats.',
                address: '45 Park Road',
                city: 'Delhi',
                state: 'Delhi',
                location: { type: 'Point', coordinates: [77.1025, 28.7041] },
                sportTypes: ['Badminton'],
                pricePerHour: 500,
                amenities: { changingRoom: true, drinkingWater: true, equipmentRental: true },
                manager: user._id,
                images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea']
            },
            {
                name: 'Greenfield Turf',
                description: '5-a-side football turf with floodlights.',
                address: 'Sector 14',
                city: 'Bangalore',
                state: 'Karnataka',
                location: { type: 'Point', coordinates: [77.5946, 12.9716] },
                sportTypes: ['Football'],
                pricePerHour: 1200,
                amenities: { parking: true, lights: true },
                manager: user._id,
                images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6']
            }
        ];

        await Venue.deleteMany(); // Clear existing venues
        await Venue.insertMany(venues);

        console.log('Venues Seeded!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedVenues();
